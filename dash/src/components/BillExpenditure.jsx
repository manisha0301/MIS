import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

function BillExpenditure() {
  const [activeTab, setActiveTab] = useState('transactionhistory');
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [transactions, setTransactions] = useState([
  {
    id: 1,
    transaction_id: 'TXN001',
    value_date: '2025-10-01',
    posted_date: '2025-10-01',
    cheque_no: '123456',
    description: 'Payment for services',
    cr_dr: 'Dr',
    amount: 50000,
    balance: 150000,
    category: 'Reimbursement', // NEW
    bank_details: {
      bankName: 'HDFC Bank',
      accountNo: '1234567890',
      ifscCode: 'HDFC0001234',
      relationshipManager: 'John Doe',
      accountName: 'Kristellar Aerospace',
      accountEmail: 'contact@kristellar.com',
      accountMobile: '9876543210',
      branchName: 'Main Branch'
    },
    period: '2025-10'
  },
  {
    id: 2,
    transaction_id: 'TXN002',
    value_date: '2025-10-02',
    posted_date: '2025-10-02',
    cheque_no: '123457',
    description: 'Team lunch',
    cr_dr: 'Dr',
    amount: 75000,
    balance: 75000,
    category: 'Food', // NEW
    bank_details: {
      bankName: 'SBI Bank',
      accountNo: '0987654321',
      ifscCode: 'SBIN0005678',
      relationshipManager: 'Jane Smith',
      accountName: 'Kristellar Aerospace',
      accountEmail: 'accounts@kristellar.com',
      accountMobile: '9123456789',
      branchName: 'City Branch'
    },
    period: '2025-10'
  }
]);
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isAddStatementModalOpen, setIsAddStatementModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNo: '',
    ifscCode: '',
    relationshipManager: '',
    accountName: '',
    accountEmail: '',
    accountMobile: '',
    branchName: ''
  });
  const [statementForm, setStatementForm] = useState({
    month: '',
    year: '',
    file: null,
  });
  const [editField, setEditField] = useState(null);
  const [banks, setBanks] = useState(['HDFC Bank', 'SBI Bank']);
  const [periods, setPeriods] = useState(['2025-10']);
  const user = { role: 'Admin' };
  const fileInputRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isViewBankModalOpen, setIsViewBankModalOpen] = useState(false);
  const [currentBankDetails, setCurrentBankDetails] = useState(null);

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

  const handleAddBankDetailsSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: 'Bank details added successfully!', visible: true });
    setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    setIsAddBankModalOpen(false);
    setBanks(prev => [...new Set([...prev, bankDetails.bankName])]);
    setBankDetails({
      bankName: '',
      accountNo: '',
      ifscCode: '',
      relationshipManager: '',
      accountName: '',
      accountEmail: '',
      accountMobile: '',
      branchName: ''
    });
  };

  const handleBankDetailsClick = (transactionId, existingBankDetails) => {
    setSelectedTransactionId(transactionId);
    setBankDetails(existingBankDetails || {
      bankName: '',
      accountNo: '',
      ifscCode: '',
      relationshipManager: '',
      accountName: '',
      accountEmail: '',
      accountMobile: '',
      branchName: ''
    });
    setEditField(null);
    setIsBankModalOpen(true);
  };

  const handleBankDetailsInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({ ...bankDetails, [name]: value });
  };

  const handleBankDetailsSubmit = async (e) => {
    e.preventDefault();
    setTransactions(prev => prev.map(transaction =>
      transaction.id === selectedTransactionId
        ? { ...transaction, bank_details: bankDetails }
        : transaction
    ));
    setIsBankModalOpen(false);
    setBankDetails({
      bankName: '',
      accountNo: '',
      ifscCode: '',
      relationshipManager: '',
      accountName: '',
      accountEmail: '',
      accountMobile: '',
      branchName: ''
    });
    setEditField(null);
    setNotification({ message: 'Bank details saved successfully!', visible: true });
    setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    setBanks(prev => [...new Set([...prev, bankDetails.bankName].filter(Boolean))]);
  };

  const handleStatementInputChange = (e) => {
    const { name, value } = e.target;
    setStatementForm({ ...statementForm, [name]: value });
  };

  const handleStatementFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xls') || file.name.endsWith('.xlsx'))) {
      setStatementForm({ ...statementForm, file });
    } else {
      setNotification({ message: 'Please upload a valid Excel file (.xls or .xlsx)', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      e.target.value = null;
    }
  };

  const handleAddStatementSubmit = async (e) => {
  e.preventDefault();
  const { month, year, file, category } = statementForm;
  if (!month || !year || !file ) {
    setNotification({ message: 'All fields are required', visible: true });
    setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    return;
  }

  const period = `${year}-${month.padStart(2, '0')}`;
  const reader = new FileReader();
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const newTransactions = jsonData.map((row, index) => ({
      id: transactions.length + index + 1,
      transaction_id: `TXN${String(transactions.length + index + 1).padStart(3, '0')}`,
      value_date: new Date().toISOString(),
      posted_date: new Date().toISOString(),
      cheque_no: row.cheque_no || 'N/A',
      description: row.description || 'Imported transaction',
      cr_dr: row.cr_dr || 'Dr',
      amount: row.amount || 0,
      balance: row.balance || 0,
      category: row.category || category, // Use Excel category or fallback to form
      bank_details: {
        bankName: selectedBank || 'Unknown Bank',
        accountNo: bankDetails.accountNo || 'N/A',
        ifscCode: bankDetails.ifscCode || 'N/A',
        relationshipManager: bankDetails.relationshipManager || 'N/A',
        accountName: bankDetails.accountName || 'N/A',
        accountEmail: bankDetails.accountEmail || 'N/A',
        accountMobile: bankDetails.accountMobile || 'N/A',
        branchName: bankDetails.branchName || 'N/A'
      },
      period
    }));

    setTransactions(prev => [...prev, ...newTransactions]);
    setPeriods(prev => [...new Set([...prev, period])].sort().reverse());
    setNotification({ message: 'Statement added successfully!', visible: true });
    setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    setIsAddStatementModalOpen(false);
    setStatementForm({ month: '', year: '', file: null });
    fileInputRef.current.value = null;
  };
  reader.readAsArrayBuffer(file);
};

  const hasBankDetails = () => {
    return Object.values(bankDetails).some(value => value && value.trim() !== '');
  };

  const handleViewBankDetails = (bankName) => {
  // Find any transaction with this bank to get its details
  const transaction = transactions.find(t => t.bank_details?.bankName === bankName);
  if (transaction?.bank_details) {
    setCurrentBankDetails(transaction.bank_details);
    setIsViewBankModalOpen(true);
  }
};

  const renderInputField = (label, field, type = 'text') => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
        {label}:
      </label>
      <input
        type={type}
        name={field}
        value={bankDetails[field]}
        onChange={handleBankDetailsInputChange}
        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
      />
    </div>
  );

  const renderBankDetailField = (label, field, type = 'text') => {
    const isEditing = editField === field;
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (hasBankDetails() && !isEditing) {
            e.currentTarget.querySelector('.edit-button').style.opacity = '1';
          }
        }}
        onMouseLeave={(e) => {
          if (!isEditing) {
            e.currentTarget.querySelector('.edit-button').style.opacity = '0';
          }
        }}
      >
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
            {label}:
          </label>
          {isEditing ? (
            <input
              type={type}
              name={field}
              value={bankDetails[field]}
              onChange={handleBankDetailsInputChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
            />
          ) : (
            <span style={{ color: '#1e293b', fontSize: '14px' }}>
              {bankDetails[field] || 'Not provided'}
            </span>
          )}
        </div>
        {hasBankDetails() && !isEditing && (
          <button
            className="edit-button"
            onClick={() => setEditField(field)}
            style={{
              opacity: 0,
              backgroundColor: '#0a9396',
              color: 'white',
              padding: '5px 10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              position: 'absolute',
              right: '10px',
              transition: 'opacity 0.2s'
            }}
          >
            Edit
          </button>
        )}
      </div>
    );
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
              {hasBankDetails() ? (
                <>
                  {renderBankDetailField('Bank Name', 'bankName')}
                  {renderBankDetailField('Account Number', 'accountNo')}
                  {renderBankDetailField('IFSC Code', 'ifscCode')}
                  {renderBankDetailField('Relationship Manager', 'relationshipManager')}
                  {renderBankDetailField('Account Name', 'accountName')}
                  {renderBankDetailField('Account Email', 'accountEmail', 'email')}
                  {renderBankDetailField('Account Mobile', 'accountMobile', 'tel')}
                  {renderBankDetailField('Branch Name', 'branchName')}
                </>
              ) : (
                <>
                  {renderInputField('Bank Name', 'bankName')}
                  {renderInputField('Account Number', 'accountNo')}
                  {renderInputField('IFSC Code', 'ifscCode')}
                  {renderInputField('Relationship Manager', 'relationshipManager')}
                  {renderInputField('Account Name', 'accountName')}
                  {renderInputField('Account Email', 'accountEmail', 'email')}
                  {renderInputField('Account Mobile', 'accountMobile', 'tel')}
                  {renderInputField('Branch Name', 'branchName')}
                </>
              )}
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
                      bankName: '',
                      accountNo: '',
                      ifscCode: '',
                      relationshipManager: '',
                      accountName: '',
                      accountEmail: '',
                      accountMobile: '',
                      branchName: ''
                    });
                    setEditField(null);
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
      {isAddBankModalOpen && (
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
              Add Bank Details
            </h2>
            <form onSubmit={handleAddBankDetailsSubmit}>
              {renderInputField('Bank Name', 'bankName')}
              {renderInputField('Account Number', 'accountNo')}
              {renderInputField('IFSC Code', 'ifscCode')}
              {renderInputField('Relationship Manager', 'relationshipManager')}
              {renderInputField('Account Name', 'accountName')}
              {renderInputField('Account Email', 'accountEmail', 'email')}
              {renderInputField('Account Mobile', 'accountMobile', 'tel')}
              {renderInputField('Branch Name', 'branchName')}
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
                  Add Bank Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBankModalOpen(false);
                    setBankDetails({
                      bankName: '',
                      accountNo: '',
                      ifscCode: '',
                      relationshipManager: '',
                      accountName: '',
                      accountEmail: '',
                      accountMobile: '',
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
      {isAddStatementModalOpen && (
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
              Add Statement
            </h2>
            <form onSubmit={handleAddStatementSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Month:
                </label>
                <select
                  name="month"
                  value={statementForm.month}
                  onChange={handleStatementInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                >
                  <option value="">Select Month</option>
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('en-IN', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Year:
                </label>
                <input
                  type="number"
                  name="year"
                  value={statementForm.year}
                  onChange={handleStatementInputChange}
                  min="2000"
                  max="2099"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Upload Statement (Excel):
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls"
                  onChange={handleStatementFileChange}
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
                  Add Statement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddStatementModalOpen(false);
                    setStatementForm({ month: '', year: '', file: null });
                    fileInputRef.current.value = null;
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
      {isAddStatementModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', width: '400px', maxHeight: '80vh', overflowY: 'auto'
          }}>
            <h2 style={{ color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
              Add Statement
            </h2>
            <form onSubmit={handleAddStatementSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Month:
                </label>
                <select name="month" value={statementForm.month} onChange={handleStatementInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                  required
                >
                  <option value="">Select Month</option>
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                    <option key={m} value={m}>{new Date(0, m-1).toLocaleString('en-IN', { month: 'long' })}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Year:
                </label>
                <input type="number" name="year" value={statementForm.year} onChange={handleStatementInputChange}
                  min="2000" max="2099" required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  Upload Statement (Excel):
                </label>
                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleStatementFileChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <button type="submit" style={{
                  backgroundColor: '#94d2bd', color: 'white', padding: '10px 20px', border: 'none',
                  borderRadius: '6px', cursor: 'pointer', fontWeight: '500', flex: 1
                }}>
                  Add Statement
                </button>
                <button type="button" onClick={() => {
                  setIsAddStatementModalOpen(false);
                  setStatementForm({ month: '', year: '', file: null });
                  fileInputRef.current.value = null;
                }} style={{
                  backgroundColor: '#aecfeeff', color: 'white', padding: '10px 20px', border: 'none',
                  borderRadius: '6px', cursor: 'pointer', fontWeight: '500', flex: 1
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isViewBankModalOpen && currentBankDetails && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', width: '400px'
          }}>
            <h2 style={{ color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
              {currentBankDetails.bankName} - Bank Details
            </h2>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Account No:</strong> {currentBankDetails.accountNo}</p>
              <p><strong>IFSC:</strong> {currentBankDetails.ifscCode}</p>
              <p><strong>RM:</strong> {currentBankDetails.relationshipManager}</p>
              <p><strong>Account Name:</strong> {currentBankDetails.accountName}</p>
              <p><strong>Email:</strong> {currentBankDetails.accountEmail}</p>
              <p><strong>Mobile:</strong> {currentBankDetails.accountMobile}</p>
              <p><strong>Branch:</strong> {currentBankDetails.branchName}</p>
            </div>
            <button onClick={() => setIsViewBankModalOpen(false)} style={{
              marginTop: '20px', width: '100%', backgroundColor: '#0a9396', color: 'white',
              padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}>
              Close
            </button>
          </div>
        </div>
      )}
      <div className="header" style={{ padding: '20px' }}>
        <h1 style={{ fontSize: '24px' }}>Bank Statement</h1>
        {user && user.role === 'Admin' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="action-button"
              onClick={() => setIsAddBankModalOpen(true)}
            >
              Add Bank Details
            </button>
          </div>
        )}
      </div>
      <div className="tab-container" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* All Transactions & Bank Tabs */}
          <button
            className={`tab-button ${activeTab === 'transactionhistory' && !selectedPeriod ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('transactionhistory');
              setSelectedBank(null);
              setSelectedPeriod(null);
              setSelectedCategory(null);
            }}
            style={{ padding: '10px', border: 'none', backgroundColor: activeTab === 'transactionhistory' && !selectedPeriod ? '#0a9396' : '#e0e0e0', color: activeTab === 'transactionhistory' && !selectedPeriod ? 'white' : '#1e293b', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}
          >
            All Transactions
          </button>
          {banks.map((bank, index) => (
            <button
              key={index}
              className={`tab-button ${selectedBank === bank && !selectedPeriod ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('bank');
                setSelectedBank(bank);
                setSelectedPeriod(null);
                setSelectedCategory(null);
              }}
              style={{ padding: '10px', border: 'none', backgroundColor: selectedBank === bank && !selectedPeriod ? '#0a9396' : '#e0e0e0', color: selectedBank === bank && !selectedPeriod ? 'white' : '#1e293b', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}
            >
              {bank}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCategory(value || null);
              if (!selectedBank && !selectedPeriod) setActiveTab('transactionhistory');
            }}
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: selectedCategory ? '#0a9396' : '#ffffff', color: selectedCategory ? 'white' : '#1e293b', fontWeight: '500', cursor: 'pointer', minWidth: '150px', fontSize: '14px' }}
          >
            <option value="">All Categories</option>
            <option value="Reimbursement">Reimbursement</option>
            <option value="Food">Food</option>
          </select>
        </div>
      </div>

      {/* Action Row: Add Statement + Period + View Bank */}
      {user && user.role === 'Admin' && activeTab === 'bank' && selectedBank && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <button className="action-button" onClick={() => handleViewBankDetails(selectedBank)}
              style={{ padding: '10px', border: 'none', backgroundColor: '#0a9396', color: 'white', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}>
              View Bank Details
            </button>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="action-button" onClick={() => setIsAddStatementModalOpen(true)}
              style={{ padding: '10px', border: 'none', backgroundColor: '#0a9396', color: 'white', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}>
              Add Statement
            </button>

            <select value={selectedPeriod || ''} onChange={(e) => { const val = e.target.value; setActiveTab('period'); setSelectedPeriod(val || null); }}
              style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: selectedPeriod ? '#0a9396' : '#e0e0e0', color: selectedPeriod ? 'white' : '#1e293b', fontWeight: '500', cursor: 'pointer', minWidth: '180px' }}>
              <option value="">All Periods</option>
              {periods.filter(p => transactions.some(t => t.period === p && t.bank_details?.bankName === selectedBank))
                .sort().reverse().map(p => (
                  <option key={p} value={p}>{new Date(p).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</option>
                ))}
            </select>
          </div>
        </div>
      )}
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
              </tr>
            </thead>
            <tbody>
              {transactions
                .filter(transaction => 
                  (!selectedBank || transaction.bank_details?.bankName === selectedBank) &&
                  (!selectedPeriod || transaction.period === selectedPeriod) &&
                  (!selectedCategory || transaction.description.includes(selectedCategory))
                )
                .map((transaction, index) => (
                  <tr key={transaction.id}>
                    <td>{index + 1}</td>
                    <td>{transaction.transaction_id}</td>
                    <td>{formatDateToIST(transaction.value_date)}</td>
                    <td>{formatDateToIST(transaction.posted_date)}</td>
                    <td>{transaction.cheque_no}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.cr_dr}</td>
                    <td>₹{parseFloat(transaction.amount).toLocaleString('en-IN')}</td>
                    <td>₹{parseFloat(transaction.balance).toLocaleString('en-IN')}</td>
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