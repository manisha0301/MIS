import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

function BillExpenditure() {
  const [activeTab, setActiveTab] = useState('transactionhistory');
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      transactionId: 'S29594041',
      valueDate: '2025-10-06',
      postedDate: '2025-10-06T09:49:30',
      chequeNo: '-',
      description: 'INF/INFT/041835647161/FFS Reimburseme/ROJALIN',
      crDr: 'DR',
      amount: 31577,
      balance: -6336595.7,
      bankDetails: {}
    },
    {
      id: 2,
      transactionId: 'S32515691',
      valueDate: '2025-10-06',
      postedDate: '2025-10-06T14:12:27',
      chequeNo: '-',
      description: 'MMT/IMPS/527914230076/Sponsorship for/VSSUT/CNRB0018062',
      crDr: 'DR',
      amount: 100000,
      balance: -6436595.7,
      bankDetails: {}
    },
  ]);
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    accountNo: '',
    ifscCode: '',
    relationshipManager: '',
    rmName: '',
    rmEmail: '',
    rmMobile: '',
    branchName: ''
  });
  const user = { role: 'Admin' };
  const fileInputRef = useRef(null);

  const formatDateToIST = (utcDate) => {
    if (!utcDate) return '';
    const date = new Date(utcDate);
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTimeToIST = (utcDate) => {
    if (!utcDate) return '';
    const date = new Date(utcDate);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xls') || file.name.endsWith('.xlsx'))) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

          const newTransactions = data.slice(1).map((row, index) => ({
            id: transactions.length + index + 1,
            transactionId: row[1] || '',
            valueDate: row[2] || '',
            postedDate: row[3] || '',
            chequeNo: row[4] || '-',
            description: row[5] || '',
            crDr: row[6] || '',
            amount: parseFloat(row[7]) || 0,
            balance: parseFloat(row[8]) || 0,
            bankDetails: {}
          }));

          setTransactions((prev) => [...prev, ...newTransactions]);
          setNotification({ message: 'Excel file imported successfully!', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
        } catch (err) {
          setNotification({ message: 'Error reading Excel file', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
        }
      };
      reader.onerror = () => {
        setNotification({ message: 'Error reading Excel file', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      };
      reader.readAsBinaryString(file);
      e.target.value = null;
    } else {
      setNotification({ message: 'Please upload a valid Excel file (.xls or .xlsx)', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const handleBankDetailsClick = (transactionId, existingBankDetails) => {
    setSelectedTransactionId(transactionId);
    setBankDetails(existingBankDetails || {
      accountNo: '',
      ifscCode: '',
      relationshipManager: '',
      rmName: '',
      rmEmail: '',
      rmMobile: '',
      branchName: ''
    });
    setIsBankModalOpen(true);
  };

  const handleBankDetailsInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({ ...bankDetails, [name]: value });
  };

  const handleBankDetailsSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ['accountNo', 'ifscCode', 'relationshipManager', 'rmName', 'rmEmail', 'rmMobile', 'branchName'];
    if (requiredFields.some(field => !bankDetails[field])) {
      setNotification({ message: 'Please fill all required fields.', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      return;
    }

    setTransactions(prev => prev.map(transaction =>
      transaction.id === selectedTransactionId
        ? { ...transaction, bankDetails }
        : transaction
    ));
    setIsBankModalOpen(false);
    setBankDetails({
      accountNo: '',
      ifscCode: '',
      relationshipManager: '',
      rmName: '',
      rmEmail: '',
      rmMobile: '',
      branchName: ''
    });
    setNotification({ message: 'Bank details saved successfully!', visible: true });
    setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
  };

  return (
    <div className="dashboard">
      {notification.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: notification.message.includes('Error') || notification.message.includes('Please') ? '#ffcccc' : '#d4edda',
          color: notification.message.includes('Error') || notification.message.includes('Please') ? '#721c24' : '#155724',
          padding: '12px 20px',
          borderRadius: '6px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease-in',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification({ ...notification, visible: false })}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '0 5px'
            }}
          >
            &times;
          </button>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
      {isBankModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            width: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
              Bank Details
            </h2>
            <form onSubmit={handleBankDetailsSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Account Number:
                </label>
                <input
                  type="text"
                  name="accountNo"
                  value={bankDetails.accountNo}
                  onChange={handleBankDetailsInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  IFSC Code:
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={bankDetails.ifscCode}
                  onChange={handleBankDetailsInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Relationship Manager:
                </label>
                <input
                  type="text"
                  name="relationshipManager"
                  value={bankDetails.relationshipManager}
                  onChange={handleBankDetailsInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Name:
                </label>
                <input
                  type="text"
                  name="rmName"
                  value={bankDetails.rmName}
                  onChange={handleBankDetailsInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Email:
                </label>
                <input
                  type="email"
                  name="rmEmail"
                  value={bankDetails.rmEmail}
                  onChange={handleBankDetailsInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Mobile:
                </label>
                <input
                  type="tel"
                  name="rmMobile"
                  value={bankDetails.rmMobile}
                  onChange={handleBankDetailsInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Branch Name:
                </label>
                <input
                  type="text"
                  name="branchName"
                  value={bankDetails.branchName}
                  onChange={handleBankDetailsInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#94d2bd',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    flex: 1,
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#0a9396')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#94d2bd')}
                >
                  Save Bank Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsBankModalOpen(false);
                    setBankDetails({
                      accountNo: '',
                      ifscCode: '',
                      relationshipManager: '',
                      rmName: '',
                      rmEmail: '',
                      rmMobile: '',
                      branchName: ''
                    });
                  }}
                  style={{
                    backgroundColor: '#aecfeeff',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    flex: 1,
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#005f73')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#aecfeeff')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="header" style={{ padding: '20px' }}>
        <h1 style={{ fontSize: '24px' }}>Transaction History</h1>
        {user && user.role === 'Admin' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="action-button"
              onClick={() => fileInputRef.current.click()}
            >
              Import from Excel
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
            />
          </div>
        )}
      </div>
      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'transactionhistory' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactionhistory')}
          style={{
            padding: '10px',
            border: 'none',
            backgroundColor: activeTab === 'transactionhistory' ? '#0a9396' : '#e0e0e0',
            color: activeTab === 'transactionhistory' ? 'white' : '#1e293b',
            cursor: 'pointer',
            borderRadius: '6px',
            fontWeight: '500'
          }}
        >
          Transaction History
        </button>
      </div>
      <div>
        <h2>KRISTELLAR AEROSPACE PRIVATE LIMITED</h2>
        {transactions.length > 0 ? (
          <table className="invoice-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Transaction ID</th>
                <th>Value Date</th>
                <th>Txn Posted Date</th>
                <th>Cheque No.</th>
                <th>Description</th>
                <th>Cr/Dr</th>
                <th>Transaction Amount (₹)</th>
                <th>Available Balance (₹)</th>
                <th>Bank Info.</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction.id}>
                  <td>{index + 1}</td>
                  <td>{transaction.transactionId}</td>
                  <td>{formatDateToIST(transaction.valueDate)}</td>
                  <td>{formatDateTimeToIST(transaction.postedDate)}</td>
                  <td>{transaction.chequeNo}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.crDr}</td>
                  <td>₹{transaction.amount.toLocaleString('en-IN')}</td>
                  <td>₹{transaction.balance.toLocaleString('en-IN')}</td>
                  <td>
                    <button
                      className="action-button"
                      onClick={() => handleBankDetailsClick(transaction.id, transaction.bankDetails)}
                    >
                      Bank Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transactions available.</p>
        )}
      </div>
    </div>
  );
}

export default BillExpenditure;