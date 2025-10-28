// backend/controllers/billExpenditureController.js
const billModel = require('../models/billExpenditureModel');
const bankModel = require('../models/bankModel');


/* ---------- Helper: auto-detect category from description ---------- */
const detectCategory = (desc) => {
  const lower = desc.toLowerCase();
  if (lower.includes('reimburseme') || lower.includes('reimbursement')) return 'Reimbursement';
  if (lower.includes('food') || lower.includes('lunch') || lower.includes('dinner')) return 'Food';
  if (lower.includes('travel') || lower.includes('taxi') || lower.includes('uber') || lower.includes('flight') || lower.includes('trip')) return 'Travel';
  if (lower.includes('office supplies') || lower.includes('stationery')) return 'Office Supplies';
  if (lower.includes('salary') || lower.includes('payroll')) return 'Salary';
  if (lower.includes('rent')) return 'Rent';
  if (lower.includes('utilities') || lower.includes('electricity') || lower.includes('water') || lower.includes('internet')) return 'Utilities';
  if (lower.includes('entertainment') || lower.includes('movie') || lower.includes('concert')) return 'Entertainment';
  if (lower.includes('maintenance') || lower.includes('repair')) return 'Maintenance';
  if (lower.includes('sponsor') || lower.includes('sponsorship') || lower.includes('event') || lower.includes('conference') || lower.includes('seminar')) return 'Sponsorship';
  // add more rules here …
  return null;
};

/* ---------- Get filtered transactions ---------- */
const getTransactions = async (req, res) => {
  const { bank, period, category } = req.query;
  try {
    const bankRec = bank ? await bankModel.getBankByName(bank) : null;
    const bankId = bankRec ? bankRec.id : null;

    const rows = await billModel.getAllTransactions({
      bankId,
      period,
      category,
    });

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

/* ---------- Upload Excel & import ---------- */
// const uploadStatement = async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

//   const { bankName, month, year } = req.body;
//   if (!bankName || !month || !year) {
//     return res.status(400).json({ error: 'bankName, month, year required' });
//   }

//   const period = `${year}-${month.padStart(2, '0')}`;

//   try {
//     const bank = await bankModel.getBankByName(bankName);
//     if (!bank) return res.status(404).json({ error: 'Bank not found' });

//     const XLSX = require('xlsx');
//     const workbook = XLSX.readFile(req.file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

//     // Expected header row (skip first 5 rows of the sample file)
//     const dataRows = json.slice(5);

//     const records = dataRows.map((row, idx) => {
//       const amountStr = row['Transaction Amount(INR)'] || row['Transaction Amount'] || '0';
//       const balStr = row['Available Balance(INR)'] || row['Available Balance'] || '0';

//       return {
//         transaction_id: `TXN${String(Date.now() + idx).slice(-6)}`,
//         value_date: row['Value Date'],
//         posted_date: row['Txn Posted Date']?.split(' ')[0] || row['Value Date'],
//         cheque_no: row['ChequeNo.'] || row['Cheque No.'] || 'N/A',
//         description: row['Description'] || '',
//         cr_dr: row['Cr/Dr'] === 'CR' ? 'CR' : 'DR',
//         amount: parseFloat(amountStr.replace(/,/g, '')) || 0,
//         balance: parseFloat(balStr.replace(/,/g, '')) || 0,
//         category: detectCategory(row['Description'] || ''),
//         bank_id: bank.id,
//         period,
//       };
//     });

//     await billModel.bulkInsert(records);
//     res.json({ message: 'Statement imported successfully', count: records.length });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Import failed' });
//   }
// };

// backend/controllers/billExpenditureController.js

const uploadStatement = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { bankName, month, year } = req.body;
  if (!bankName || !month || !year) {
    return res.status(400).json({ error: 'bankName, month, year required' });
  }

  const period = `${year}-${month.padStart(2, '0')}`;

  try {
    const bank = await bankModel.getBankByName(bankName);
    if (!bank) return res.status(404).json({ error: 'Bank not found' });

    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Use header: 1 to get raw rows (preserves all rows)
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', range: 5 });

    // Find header row (look for "No." or "Transaction ID")
    let headerRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] && (row[0].toString().includes('No.') || row[1]?.includes('Transaction ID'))) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return res.status(400).json({ error: 'Could not find header row in Excel' });
    }

    const header = rows[headerRowIndex];
    const dataRows = rows.slice(headerRowIndex + 1).filter(r => r[0]); // skip empty

    // Map column names
    const col = {};
    header.forEach((h, i) => {
      const key = h ? h.toString().trim() : '';
      if (key.includes('No.')) col.no = i;
      if (key.includes('Transaction ID')) col.txnId = i;
      if (key.includes('Value Date')) col.valueDate = i;
      if (key.includes('Txn Posted Date')) col.postedDate = i;
      if (key.includes('ChequeNo.') || key.includes('Cheque No.')) col.cheque = i;
      if (key.includes('Description')) col.desc = i;
      if (key.includes('Cr/Dr')) col.crdr = i;
      if (key.includes('Transaction Amount')) col.amount = i;
      if (key.includes('Available Balance')) col.balance = i;
    });

    // Validate required columns
    if (!col.valueDate || !col.crdr || !col.amount || !col.balance) {
      return res.status(400).json({ error: 'Missing required columns in Excel' });
    }

    const records = dataRows.map((row, idx) => {
      const rawDate = row[col.valueDate];
      const rawPosted = row[col.postedDate];
      const rawAmount = row[col.amount] || '0';
      const rawBalance = row[col.balance] || '0';

      // Parse date: accept DD/MM/YYYY or Excel serial
      let valueDate = parseExcelDate(rawDate);
      let postedDate = rawPosted ? parseExcelDate(rawPosted.split(' ')[0]) : valueDate;

      if (!valueDate) {
        console.warn(`Invalid date in row ${idx + headerRowIndex + 2}:`, rawDate);
        valueDate = new Date(); // fallback
      }
      if (!postedDate) postedDate = valueDate;

      return {
        transaction_id: `TXN${String(Date.now() + idx).slice(-6)}`,
        value_date: valueDate,
        posted_date: postedDate,
        cheque_no: row[col.cheque] || 'N/A',
        description: row[col.desc] || '',
        cr_dr: row[col.crdr] === 'CR' ? 'CR' : 'DR',
        amount: parseFloat(rawAmount.toString().replace(/,/g, '')) || 0,
        balance: parseFloat(rawBalance.toString().replace(/,/g, '')) || 0,
        category: detectCategory(row[col.desc] || ''),
        bank_id: bank.id,
        period,
      };
    }).filter(r => r.amount > 0); // optional: skip zero rows

    await billModel.bulkInsert(records);
    res.json({ message: 'Statement imported successfully', count: records.length });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: 'Import failed: ' + err.message });
  }
};

// Helper: Parse Excel date (string or serial)
function parseExcelDate(val) {
  if (!val) return null;
  const str = val.toString().trim();

  // Try DD/MM/YYYY
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    return new Date(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`);
  }

  // Try Excel serial date
  const serial = parseFloat(str);
  if (!isNaN(serial) && serial > 40000 && serial < 50000) {
    const utc_days = serial - 25569;
    return new Date(Math.round(utc_days * 86400000));
  }

  return null;
}

module.exports = { getTransactions, uploadStatement };