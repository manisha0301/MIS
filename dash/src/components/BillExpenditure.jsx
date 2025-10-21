import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

function BillExpenditure() {
  const [activeTab, setActiveTab] = useState('transactionhistory');
  const [transactions, setTransactions] = useState([]);
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
  const [editField, setEditField] = useState(null); // Track which field is being edited
  const user = JSON.parse(sessionStorage.getItem('user')); // Replace with actual user auth logic
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

  const fetchTransactions = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bill-expenditures', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTransactions(data);
      } else {
        setNotification({ message: data.error || 'Failed to fetch transactions', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    } catch (error) {
      setNotification({ message: 'Error fetching transactions', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xls') || file.name.endsWith('.xlsx'))) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/bill-expenditures/import', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const data = await response.json();
        if (response.ok) {
          setNotification({ message: 'Excel file imported successfully!', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
          fetchTransactions();
        } else {
          setNotification({ message: data.error || 'Error importing Excel file', visible: true });
          setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
        }
      } catch (error) {
        setNotification({ message: 'Error importing Excel file', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
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
    setEditField(null); // Reset edit mode
    setIsBankModalOpen(true);
  };

  const handleBankDetailsInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({ ...bankDetails, [name]: value });
  };

  const handleBankDetailsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bill-expenditures/${selectedTransactionId}/bank-details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bankDetails)
      });
      const data = await response.json();
      if (response.ok) {
        setTransactions(prev => prev.map(transaction =>
          transaction.id === selectedTransactionId
            ? { ...transaction, bank_details: data.transaction.bank_details }
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
        setEditField(null);
        setNotification({ message: 'Bank details saved successfully!', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      } else {
        setNotification({ message: data.error || 'Failed to save bank details', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    } catch (error) {
      setNotification({ message: 'Error saving bank details', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const hasBankDetails = () => {
    return Object.values(bankDetails).some(value => value && value.trim() !== '');
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
                  {renderBankDetailField('Account Number', 'accountNo')}
                  {renderBankDetailField('IFSC Code', 'ifscCode')}
                  {renderBankDetailField('Relationship Manager', 'relationshipManager')}
                  {renderBankDetailField('Name', 'rmName')}
                  {renderBankDetailField('Email', 'rmEmail', 'email')}
                  {renderBankDetailField('Mobile', 'rmMobile', 'tel')}
                  {renderBankDetailField('Branch Name', 'branchName')}
                </>
              ) : (
                <>
                  {renderInputField('Account Number', 'accountNo')}
                  {renderInputField('IFSC Code', 'ifscCode')}
                  {renderInputField('Relationship Manager', 'relationshipManager')}
                  {renderInputField('Name', 'rmName')}
                  {renderInputField('Email', 'rmEmail', 'email')}
                  {renderInputField('Mobile', 'rmMobile', 'tel')}
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
                      accountNo: '',
                      ifscCode: '',
                      relationshipManager: '',
                      rmName: '',
                      rmEmail: '',
                      rmMobile: '',
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
                  <td>{transaction.transaction_id}</td>
                  <td>{formatDateToIST(transaction.value_date)}</td>
                  <td>{formatDateTimeToIST(transaction.posted_date)}</td>
                  <td>{transaction.cheque_no}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.cr_dr}</td>
                  <td>₹{parseFloat(transaction.amount).toLocaleString('en-IN')}</td>
                  <td>₹{parseFloat(transaction.balance).toLocaleString('en-IN')}</td>
                  <td>
                    <button
                      className="action-button"
                      onClick={() => handleBankDetailsClick(transaction.id, transaction.bank_details)}
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