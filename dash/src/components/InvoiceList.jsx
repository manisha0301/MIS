import { useState, useEffect } from 'react';

function InvoiceList() {
  const [activeTab, setActiveTab] = useState('sales');
  const [modalTab, setModalTab] = useState('sales');
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    number: '',
    date: '',
    customer: '',
    supplier: '',
    company: '',
    amount: '',
    dueDate: '',
    paymentMethod: '',
    notes: '',
    status: 'Due',
    pdf: null,
  });
  const [previewPdf, setPreviewPdf] = useState('');
  const [notification, setNotification] = useState({ message: '', visible: false });
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Fetch invoices on component mount
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const salesResponse = await fetch('http://localhost:5000/api/invoices/sales', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const purchaseResponse = await fetch('http://localhost:5000/api/invoices/purchase', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!salesResponse.ok || !purchaseResponse.ok) {
          throw new Error('Failed to fetch invoices');
        }

        const salesData = await salesResponse.json();
        const purchaseData = await purchaseResponse.json();
        setSalesInvoices(salesData);
        setPurchaseInvoices(purchaseData);
      } catch (error) {
        setNotification({ message: 'Error fetching invoices', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    };
    fetchInvoices();
  }, []);

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

  const handleStatusToggle = async (id, tab) => {
    const newStatus = tab === 'sales'
      ? salesInvoices.find(inv => inv.id === id).status === 'Paid' ? 'Due' : 'Paid'
      : purchaseInvoices.find(inv => inv.id === id).status === 'Paid' ? 'Due' : 'Paid';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/invoices/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedInvoice = await response.json();
      if (tab === 'sales') {
        setSalesInvoices(prev => prev.map(inv => 
          inv.id === id ? { ...inv, status: newStatus } : inv
        ));
      } else {
        setPurchaseInvoices(prev => prev.map(inv => 
          inv.id === id ? { ...inv, status: newStatus } : inv
        ));
      }
      setNotification({ message: 'Status updated successfully!', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    } catch (error) {
      setNotification({ message: 'Error updating status', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const handlePdfUpload = async (e, id, tab) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append('pdf', file);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/invoices/${id}/pdf`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload PDF');
        }

        const updatedInvoice = await response.json();
        if (tab === 'sales') {
          setSalesInvoices(prev => prev.map(inv => 
            inv.id === id ? { ...inv, pdf_url: updatedInvoice.pdf_url } : inv
          ));
        } else {
          setPurchaseInvoices(prev => prev.map(inv => 
            inv.id === id ? { ...inv, pdf_url: updatedInvoice.pdf_url } : inv
          ));
        }
        setNotification({ message: 'PDF uploaded successfully!', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      } catch (error) {
        setNotification({ message: 'Error uploading PDF', visible: true });
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      }
    } else {
      setNotification({ message: 'Please upload a PDF file.', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const openPdf = (pdfUrl) => {
    window.open(`http://localhost:5000${pdfUrl}`, '_blank');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice({ ...newInvoice, [name]: value });
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setNewInvoice({ ...newInvoice, pdf: file });
      setPreviewPdf(URL.createObjectURL(file));
    } else {
      setNotification({ message: 'Please upload a PDF file.', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = modalTab === 'sales' 
      ? ['number', 'date', 'customer', 'company', 'amount', 'dueDate', 'paymentMethod']
      : ['number', 'date', 'supplier','company', 'amount', 'dueDate', 'paymentMethod'];
    
    if (requiredFields.some(field => !newInvoice[field])) {
      setNotification({ message: 'Please fill all required fields.', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      return;
    }

    const formData = new FormData();
    formData.append('type', modalTab);
    formData.append('number', newInvoice.number);
    formData.append('date', newInvoice.date);
    formData.append('company', newInvoice.company || '');
    formData.append('customer', newInvoice.customer || '');
    formData.append('supplier', newInvoice.supplier || '');
    formData.append('amount', newInvoice.amount);
    formData.append('dueDate', newInvoice.dueDate);
    formData.append('paymentMethod', newInvoice.paymentMethod);
    formData.append('notes', newInvoice.notes || '');
    formData.append('status', newInvoice.status);
    if (newInvoice.pdf) {
      formData.append('pdf', newInvoice.pdf);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add invoice');
      }

      const newInvoiceData = await response.json();
      if (modalTab === 'sales') {
        setSalesInvoices(prev => [...prev, newInvoiceData]);
      } else {
        setPurchaseInvoices(prev => [...prev, newInvoiceData]);
      }

      setNewInvoice({
        number: '',
        date: '',
        customer: '',
        supplier: '',
        company: '',
        amount: '',
        dueDate: '',
        paymentMethod: '',
        notes: '',
        status: 'Due',
        pdf: null,
      });
      setPreviewPdf('');
      setIsFormOpen(false);
      setNotification({ message: 'Invoice added successfully!', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    } catch (error) {
      setNotification({ message: 'Error adding invoice', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  return (
    <div className="dashboard">
      {notification.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: notification.message.includes('Please') || notification.message.includes('Error') ? '#ffcccc' : '#d4edda',
          color: notification.message.includes('Please') || notification.message.includes('Error') ? '#721c24' : '#155724',
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
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc' }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Invoices</h1>
        {user && (user.role === 'Admin') && (
        <button
          className="action-button"
          onClick={() => setIsFormOpen(true)}
        >
          Add New Invoice
        </button>
        )}
      </div>
      {isFormOpen && (
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
              Add New Invoice
            </h2>
            <div className="tab-container" style={{ display: 'flex', marginBottom: '20px' }}>
              <button
                className={`tab-button ${modalTab === 'sales' ? 'active' : ''}`}
                onClick={() => setModalTab('sales')}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  backgroundColor: modalTab === 'sales' ? '#0a9396' : '#e0e0e0',
                  color: modalTab === 'sales' ? 'white' : '#1e293b',
                  cursor: 'pointer',
                  borderRadius: '6px 0 0 6px',
                  fontWeight: '500'
                }}
              >
                Sales Invoice
              </button>
              <button
                className={`tab-button ${modalTab === 'purchase' ? 'active' : ''}`}
                onClick={() => setModalTab('purchase')}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  backgroundColor: modalTab === 'purchase' ? '#0a9396' : '#e0e0e0',
                  color: modalTab === 'purchase' ? 'white' : '#1e293b',
                  cursor: 'pointer',
                  borderRadius: '0 6px 6px 0',
                  fontWeight: '500'
                }}
              >
                Purchase Invoice
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Invoice Number:</label>
                <input
                  type="text"
                  name="number"
                  value={newInvoice.number}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Date:</label>
                <input
                  type="date"
                  name="date"
                  value={newInvoice.date}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Company:</label>
                    <select
                      name="company"
                      value={newInvoice.company}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    >
                      <option value="">Select Company</option>
                      <option value="Kristellar Aerospace">Kristellar Aerospace</option>
                      <option value="Kristellar Cyberspace">Kristellar Cyberspace</option>
                      <option value="Protelion">Protelion</option>
                    </select>
                  </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>
                  {modalTab === 'sales' ? 'Customer' : 'Supplier'}:
                </label>
                <input
                  type="text"
                  name={modalTab === 'sales' ? 'customer' : 'supplier'}
                  value={newInvoice[modalTab === 'sales' ? 'customer' : 'supplier']}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Amount (₹):</label>
                <input
                  type="number"
                  name="amount"
                  value={newInvoice.amount}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Due Date:</label>
                <input
                  type="date"
                  name="dueDate"
                  value={newInvoice.dueDate}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Payment Method:</label>
                <input
                  type="text"
                  name="paymentMethod"
                  value={newInvoice.paymentMethod}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Notes:</label>
                <textarea
                  name="notes"
                  value={newInvoice.notes}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', minHeight: '80px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Status:</label>
                <select
                  name="status"
                  value={newInvoice.status}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                >
                  <option value="Due">Due</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>PDF:</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
                {previewPdf && (
                  <button
                    type="button"
                    onClick={() => openPdf(previewPdf)}
                    style={{
                      marginTop: '10px',
                      backgroundColor: '#0a9396',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Preview PDF
                  </button>
                )}
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
                  Save Invoice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setNewInvoice({
                      number: '',
                      date: '',
                      customer: '',
                      supplier: '',
                      company:'',
                      amount: '',
                      dueDate: '',
                      paymentMethod: '',
                      notes: '',
                      status: 'Due',
                      pdf: null,
                    });
                    setPreviewPdf('');
                  }}
                  style={{
                    backgroundColor: '#aecfeeff',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    flex: '1',
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
      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Invoices
        </button>
        <button
          className={`tab-button ${activeTab === 'purchase' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase')}
        >
          Purchase Invoices
        </button>
      </div>
      {activeTab === 'sales' ? (
        <div>
          <h2>Sales Invoices (Outgoing)</h2>
          {salesInvoices.length > 0 ? (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Invoice Number</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount (₹)</th>
                  <th>Due Date</th>
                  <th>Payment Method</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {salesInvoices.map((invoice, index) => (
                  <tr key={invoice.id}>
                    <td>{index + 1}</td>
                    <td>{invoice.number}</td>
                    <td>{formatDateToIST(invoice.date)}</td>
                    <td>{invoice.customer}</td>
                    <td>₹{invoice.amount.toLocaleString('en-IN')}</td>
                    <td>{formatDateToIST(invoice.due_date)}</td>
                    <td>{invoice.payment_method}</td>
                    <td>{invoice.notes}</td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={invoice.status === 'Paid'}
                          onChange={() => handleStatusToggle(invoice.id, 'sales')}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td>
                      {invoice.pdf_url ? (
                        <button onClick={() => openPdf(invoice.pdf_url)} className="action-button">View PDF</button>
                      ) : (
                        <input type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e, invoice.id, 'sales')} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No sales invoices available.</p>
          )}
        </div>
      ) : (
        <div>
          <h2>Purchase Invoices (Incoming)</h2>
          {purchaseInvoices.length > 0 ? (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Invoice Number</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Amount (₹)</th>
                  <th>Due Date</th>
                  <th>Payment Method</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {purchaseInvoices.map((invoice, index) => (
                  <tr key={invoice.id}>
                    <td>{index + 1}</td>
                    <td>{invoice.number}</td>
                    <td>{formatDateToIST(invoice.date)}</td>
                    <td>{invoice.supplier}</td>
                    <td>₹{invoice.amount.toLocaleString('en-IN')}</td>
                    <td>{formatDateToIST(invoice.due_date)}</td>
                    <td>{invoice.payment_method}</td>
                    <td>{invoice.notes}</td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={invoice.status === 'Paid'}
                          onChange={() => handleStatusToggle(invoice.id, 'purchase')}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td>
                      {invoice.pdf_url ? (
                        <button onClick={() => openPdf(invoice.pdf_url)} className="action-button">View PDF</button>
                      ) : (
                        <input type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e, invoice.id, 'purchase')} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No purchase invoices available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default InvoiceList;