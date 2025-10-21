const billExpenditureModel = require('../models/billExpenditureModel');
const XLSX = require('xlsx');
const moment = require('moment');

const billExpenditureController = {
  async importTransactions(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileBuffer = req.file.buffer;
      const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'dd/mm/yyyy' });

      const transactions = data.slice(1).filter(row => row.length >= 9).map((row, index) => {
        // Parse dates using moment
        const valueDate = row[2] ? moment(row[2], ['DD/MM/YYYY', 'MM/DD/YYYY']).format('YYYY-MM-DD') : null;
        const postedDateRaw = row[3] ? String(row[3]).trim() : null;
        let postedDate = null;
        if (postedDateRaw) {
          // Handle date with time (e.g., "06/10/2025 09:49:30 AM")
          const parsedPostedDate = moment(postedDateRaw, ['DD/MM/YYYY hh:mm:ss A', 'MM/DD/YYYY hh:mm:ss A']);
          if (parsedPostedDate.isValid()) {
            postedDate = parsedPostedDate.format('YYYY-MM-DD HH:mm:ss');
          } else {
            console.warn(`Invalid posted date for row ${index + 2}: ${postedDateRaw}`);
          }
        }

        return {
          transactionId: row[1] || `TXN${Date.now() + index}`,
          valueDate: valueDate && moment(valueDate).isValid() ? valueDate : null,
          postedDate: postedDate,
          chequeNo: row[4] || '-',
          description: row[5] || '',
          crDr: row[6] || '',
          amount: parseFloat(row[7]) || 0,
          balance: parseFloat(row[8]) || 0,
          bankDetails: {}
        };
      });

      // Filter out transactions with invalid dates
      const validTransactions = transactions.filter(t => {
        if (!t.valueDate && !t.postedDate) {
          console.warn(`Skipping transaction ${t.transactionId} due to invalid dates`);
          return false;
        }
        return true;
      });

      if (validTransactions.length === 0) {
        return res.status(400).json({ error: 'No valid transactions found in the Excel file' });
      }

      await billExpenditureModel.importTransactions(validTransactions);
      res.status(200).json({ message: 'Excel file imported successfully', imported: validTransactions.length });
    } catch (error) {
      console.error('Error importing transactions:', error);
      res.status(500).json({ error: 'Failed to import transactions', details: error.message });
    }
  },

  async getAllTransactions(req, res) {
    try {
      const transactions = await billExpenditureModel.getAllTransactions();
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  },

  async updateBankDetails(req, res) {
    try {
      const { transactionId } = req.params;
      const bankDetails = req.body;
      const updatedTransaction = await billExpenditureModel.updateBankDetails(transactionId, bankDetails);
      res.status(200).json({ message: 'Bank details updated successfully', transaction: updatedTransaction });
    } catch (error) {
      console.error('Error updating bank details:', error);
      res.status(500).json({ error: 'Failed to update bank details' });
    }
  }
};

module.exports = billExpenditureController;