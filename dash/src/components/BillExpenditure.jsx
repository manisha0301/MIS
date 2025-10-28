import { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Line } from 'react-chartjs-2';

function BillExpenditure() {
  const [activeTab, setActiveTab] = useState('transactionhistory');
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const [banks, setBanks] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [bankPeriods, setBankPeriods] = useState([]); // ← NEW
  const [allPeriods, setAllPeriods] = useState([]);  
  const user = JSON.parse(sessionStorage.getItem('user'));
  const fileInputRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isViewBankModalOpen, setIsViewBankModalOpen] = useState(false);
  const [currentBankDetails, setCurrentBankDetails] = useState(null);
  const [chartFilter, setChartFilter] = useState('all'); // 'all' or bank name
  const [allCategories, setAllCategories] = useState([]); // ← Add this

  const API_BASE = 'http://localhost:5000/api';

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

  // Show notification
  const showNotification = (msg) => {
    setNotification({ message: msg, visible: true });
    setTimeout(() => setNotification({ message: '', visible: false }), 3000);
  };

  const fetchBanks = async () => {
    try {
      const res = await fetch(`${API_BASE}/banks`);
      const data = await res.json();
      setBanks(data.map(b => b.bank_name));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBank) params.append('bank', selectedBank);
      if (selectedPeriod) params.append('period', selectedPeriod);
      if (selectedCategory) params.append('category', selectedCategory);

      const res = await fetch(`${API_BASE}/bill-expenditures/transactions?${params}`);
      const data = await res.json();
      setTransactions(data);

      // === 1. Current filtered periods (for any UI use) ===
      const currentPeriods = [...new Set(data.map(t => t.period).filter(Boolean))].sort().reverse();
      setPeriods(currentPeriods);

      // === 2. If a bank is selected → update bank-specific periods ===
      if (selectedBank) {
        setBankPeriods(currentPeriods);
      }

      // === 3. Global all-time periods (only for "All Transactions") ===
      if (!selectedBank) {
        const globalPeriodSet = new Set([
          ...allPeriods,
          ...data.map(t => t.period).filter(Boolean)
        ]);
        setAllPeriods([...globalPeriodSet].sort().reverse());
      }

      const uniqueCats = [...new Set(data.map(t => t.category).filter(Boolean))];
      setCategories(uniqueCats);
      // Preserve all-time categories
      setAllCategories(prev => {
        const combined = [...prev, ...uniqueCats];
        return [...new Set(combined)].sort();
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
  if (!selectedBank) {
    setBankPeriods([]);
  }
}, [selectedBank]);

  useEffect(() => {
    fetchBanks();
    setAllPeriods([]);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedBank, selectedPeriod, selectedCategory]);

  const handleAddBankDetailsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/banks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bank_name: bankDetails.bankName,
          account_no: bankDetails.accountNo,
          ifsc_code: bankDetails.ifscCode,
          relationship_manager: bankDetails.relationshipManager,
          account_name: bankDetails.accountName,
          account_email: bankDetails.accountEmail,
          account_mobile: bankDetails.accountMobile,
          branch_name: bankDetails.branchName,
        })
      });
      if (res.ok) {
        showNotification('Bank added successfully!');
        setIsAddBankModalOpen(false);
        fetchBanks();
        setBankDetails({
          bankName: '', accountNo: '', ifscCode: '', relationshipManager: '',
          accountName: '', accountEmail: '', accountMobile: '', branchName: ''
        });
      }
    } catch (err) {
      showNotification('Failed to add bank');
    }
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
      showNotification('Please upload a valid Excel file (.xls or .xlsx)');
      e.target.value = null;
    }
  };

  const handleAddStatementSubmit = async (e) => {
    e.preventDefault();
    const { month, year, file } = statementForm;
    if (!month || !year || !file || !selectedBank) {
      showNotification('All fields and bank selection are required');
      return;
    }

    const formData = new FormData();
    formData.append('statement', file);
    formData.append('bankName', selectedBank);
    formData.append('month', month);
    formData.append('year', year);

    try {
      const res = await fetch(`${API_BASE}/bill-expenditures/upload`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (res.ok) {
        showNotification(`Imported ${result.count} transactions!`);
        setIsAddStatementModalOpen(false);
        setStatementForm({ month: '', year: '', file: null });
        fetchTransactions();
      } else {
        showNotification(result.error || 'Import failed');
      }
      // const newCats = [...new Set(data.map(t => t.category).filter(Boolean))];
      // setCategories(prev => [...new Set([...prev, ...newCats])]);
    } catch (err) {
      showNotification('Upload failed');
    }
  };

  const hasBankDetails = () => {
    return Object.values(bankDetails).some(value => value && value.trim() !== '');
  };

  const handleViewBankDetails = async (bankName) => {
    try {
      const res = await fetch(`${API_BASE}/banks/${encodeURIComponent(bankName)}`);
      const data = await res.json();
      setCurrentBankDetails(data);
      setIsViewBankModalOpen(true);
    } catch (err) {
      showNotification('Failed to load bank details');
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

  const chartData = useMemo(() => {
    const bankMonthMap = {};

    transactions.forEach(t => {
      const bank = t.bank_name || 'Unknown';
      const period = t.period;
      const amount = parseFloat(t.amount) || 0;

      if (!bankMonthMap[bank]) bankMonthMap[bank] = {};
      bankMonthMap[bank][period] = (bankMonthMap[bank][period] || 0) + amount;
    });

    const allMonths = [...new Set(transactions.map(t => t.period))].filter(Boolean).sort();
    const allBanks = [...new Set(transactions.map(t => t.bank_name).filter(Boolean))].sort();

    const quarters = allMonths.map(m =>
      new Date(m + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    );

    const colors = [
      '#0a9396', '#94d2bd', '#aecfeeff', '#ee9b00', '#ca6702', '#bb3e03', '#ae2012', '#9b2226'
    ];

    const datasets = allBanks.map((bank, idx) => {
      const data = allMonths.map(month => bankMonthMap[bank][month] || 0);
      const color = colors[idx % colors.length];

      return {
        label: bank,
        data,
        borderColor: color,
        backgroundColor: color,
        fill: false,
      };
    });

    return { quarters, datasets, allBanks }; // ← expose allBanks
  }, [transactions]);

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
                  {/* {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('en-IN', { month: 'long' })}</option>
                  ))} */}
                  {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={String(i+1).padStart(2, '0')}>
                    {new Date(0, i).toLocaleString('en', { month: 'long' })}
                  </option>
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
              {currentBankDetails.bank_name} - Bank Details
            </h2>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Account No:</strong> {currentBankDetails.account_no}</p>
              <p><strong>IFSC:</strong> {currentBankDetails.ifsc_code}</p>
              <p><strong>RM:</strong> {currentBankDetails.relationship_manager}</p>
              <p><strong>Account Name:</strong> {currentBankDetails.account_name}</p>
              <p><strong>Email:</strong> {currentBankDetails.account_email}</p>
              <p><strong>Mobile:</strong> {currentBankDetails.account_mobile}</p>
              <p><strong>Branch:</strong> {currentBankDetails.branch_name}</p>
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
            className={`tab-button ${!selectedBank && !selectedPeriod ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('transactionhistory');
              setSelectedBank(null);
              setSelectedPeriod(null);
              setSelectedCategory(null);
            }}
            style={{ padding: '10px', border: 'none', backgroundColor: !selectedBank && !selectedPeriod ? '#0a9396' : '#e0e0e0', color: !selectedBank && !selectedPeriod ? 'white' : '#1e293b', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}
          >
            All Transactions
          </button>
          {banks.map((bank, index) => (
            <button
              key={index}
              // className={`tab-button ${selectedBank === bank && !selectedPeriod ? 'active' : ''}`}
              className={`tab-button ${selectedBank === bank ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('bank');
                setSelectedBank(bank);
                setSelectedPeriod(null);
                setSelectedCategory(null);
              }}
              style={{ padding: '10px', border: 'none', backgroundColor: selectedBank === bank ? '#0a9396' : '#e0e0e0', color: selectedBank === bank ? 'white' : '#1e293b', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}
            >
              {bank}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <div style={{ display: 'flex', gap: '10px'}}>
          <select
            value={selectedCategory}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedCategory(value);
            }}
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: '#ffffff', color: '#1e293b', fontWeight: '500', cursor: 'pointer', minWidth: '150px', fontSize: '14px' }}
          >
            <option value="">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={selectedPeriod} 
            onChange={(e) => { 
              const val = e.target.value; 
              setSelectedPeriod(val); 
            }}
              style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '6px', backgroundColor: '#fff', color: '#1e293b', fontWeight: '500', cursor: 'pointer', minWidth: '180px', fontSize: '14px' }}>
              <option value="">All Periods</option>
              {selectedBank 
                ? bankPeriods.map(p => (
                    <option key={p} value={p}>
                      {new Date(p + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                    </option>
                  ))
                : allPeriods.map(p => (
                    <option key={p} value={p}>
                      {new Date(p + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                    </option>
                  ))
              }
            </select>
        </div>
      </div>

      {/* Action Row: Add Statement + Period + View Bank */}
      { user.role === 'Admin' && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
          {selectedBank &&(
          <div>
            <button className="action-button" onClick={() => handleViewBankDetails(selectedBank)}
              style={{ padding: '10px', border: 'none', backgroundColor: '#0a9396', color: 'white', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}>
              View Bank Details
            </button>
          </div>
          )}
          <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', flex: 1}}>
           {user.role === 'Admin' &&(
              <button className="action-button" onClick={() => setIsAddStatementModalOpen(true)}
                style={{ padding: '10px', border: 'none', backgroundColor: '#0a9396', color: 'white', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}>
                Add Statement
              </button>
            )}
          </div>
        </div>
      )}
      <h2 style={{marginBottom: '1px'}}>KRISTELLAR AEROSPACE PRIVATE LIMITED</h2>
      <div style={{
        height: '300px',           
        overflow: 'auto',          
        borderRadius: '8px',
      }}>
        {transactions.length > 0 ? (
          <table className="invoice-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Bank</th>
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
                // .filter(transaction => 
                //   (!selectedBank || transaction.bank_details?.bankName === selectedBank) &&
                //   (!selectedPeriod || transaction.period === selectedPeriod) &&
                //   (!selectedCategory || transaction.description.includes(selectedCategory))
                // )
                .map((transaction, index) => (
                  <tr key={transaction.id}>
                    <td>{index + 1}</td>
                    <td>{transaction.bank_name}</td>
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

      <div style={{ marginTop: '40px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '10px' }}>Monthly Expenditure by Bank</h2>

        {/* FILTER BUTTONS – UNDER THE HEADING */}
        {/* <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setChartFilter('all')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: chartFilter === 'all' ? '#0a9396' : '#e0e0e0',
              color: chartFilter === 'all' ? 'white' : '#1e293b',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '13px'
            }}
          >
            All Banks
          </button>
          {chartData.allBanks.map(bank => (
            <button
              key={bank}
              onClick={() => setChartFilter(bank)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: chartFilter === bank ? '#0a9396' : '#e0e0e0',
                color: chartFilter === bank ? 'white' : '#1e293b',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '13px'
              }}
            >
              {bank}
            </button>
          ))}
        </div> */}

        {/* THE CHART */}
        <div style={{ height: '250px', position: 'relative' }}>
          <Line
            data={{
              labels: chartData.quarters,
              datasets: chartData.datasets
                .map(ds => ({
                  ...ds,
                  hidden: chartFilter !== 'all' && chartFilter !== ds.label
                }))
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                tooltip: {
                  callbacks: {
                    label: context => {
                      const value = context.parsed.y;
                      return `${context.dataset.label}: ₹${value.toLocaleString('en-IN')}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: value => '₹' + value.toLocaleString('en-IN')
                  }
                }
              }
            }}
          />
        </div>
      </div>

    </div>
  );
}

export default BillExpenditure;