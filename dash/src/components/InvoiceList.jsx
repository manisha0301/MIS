import { useEffect, useState } from 'react';
import { FaEye } from "react-icons/fa";
import API_BASE_URL from '../api/apiConfig';

function InvoiceList() {
  const [activeTab, setActiveTab] = useState('sales');
  const [modalTab, setModalTab] = useState('sales');
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
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
    clientId: '',
    gstPercentage: '',
    tdsPercentage: ''
  });
  const [previewPdf, setPreviewPdf] = useState('');
  const [notification, setNotification] = useState({ message: '', visible: false });
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, []);

  const fetchInvoices = async () => {
    try {
      const [salesRes, purchaseRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/invoices/sales`),
        fetch(`${API_BASE_URL}/api/invoices/purchase`)
      ]);

      if (!salesRes.ok || !purchaseRes.ok) throw new Error('Failed to fetch invoices');

      const salesData = await salesRes.json();
      const purchaseData = await purchaseRes.json();

      setSalesInvoices(salesData);
      setPurchaseInvoices(purchaseData);
    } catch (error) {
      showNotification('Error fetching invoices');
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`);
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      showNotification('Error fetching clients');
    }
  };

  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => setNotification({ message: '', visible: false }), 3000);
  };

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

  const handleStatusToggle = async (id, type) => {
    const invoiceList = type === 'sales' ? salesInvoices : purchaseInvoices;
    const invoice = invoiceList.find(inv => inv.id === id);
    const newStatus = invoice.status === 'Paid' ? 'Due' : 'Paid';

    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices/${type}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      if (type === 'sales') {
        setSalesInvoices(prev => prev.map(inv =>
          inv.id === id ? { ...inv, status: newStatus } : inv
        ));
      } else {
        setPurchaseInvoices(prev => prev.map(inv =>
          inv.id === id ? { ...inv, status: newStatus } : inv
        ));
      }
      showNotification('Status updated!');
    } catch (error) {
      showNotification('Error updating status');
    }
  };

  const openPdf = (pdfUrl) => {
    window.open(`${API_BASE_URL}${pdfUrl}`, '_blank');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'clientId') {
      const client = clients.find(c => c.clientid === value);
      setSelectedClient(client);
      setNewInvoice(prev => ({
        ...prev,
        clientId: value,
        supplier: client ? client.name : ''
      }));
    } else {
      setNewInvoice(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setNewInvoice({ ...newInvoice, pdf: file });
      setPreviewPdf(URL.createObjectURL(file));
    } else {
      showNotification('Please upload a PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('type', modalTab);
    formData.append('number', newInvoice.number);
    formData.append('date', newInvoice.date);
    formData.append('company', newInvoice.company || '');
    formData.append('customer', modalTab === 'sales' ? newInvoice.customer || '' : '');
    formData.append('supplier', modalTab === 'purchase' ? newInvoice.supplier || '' : '');
    formData.append('amount', newInvoice.amount);
    formData.append('gstPercentage', newInvoice.gstPercentage);
    formData.append('dueDate', newInvoice.dueDate);
    formData.append('paymentMethod', newInvoice.paymentMethod);
    formData.append('notes', newInvoice.notes || '');
    formData.append('status', newInvoice.status);
    formData.append('clientId', newInvoice.clientId);

    if (modalTab === 'purchase') {
      formData.append('tdsPercentage', newInvoice.tdsPercentage || '');
    }

    if (newInvoice.pdf) {
      formData.append('pdf', newInvoice.pdf);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Failed to add invoice');

      const addedInvoice = await res.json();
      if (modalTab === 'sales') {
        setSalesInvoices(prev => [addedInvoice, ...prev]);
      } else {
        setPurchaseInvoices(prev => [addedInvoice, ...prev]);
      }

      setIsFormOpen(false);
      resetForm();
      showNotification('Invoice added successfully!');
    } catch (error) {
      showNotification('Error adding invoice');
    }
  };

  const resetForm = () => {
    setNewInvoice({
      type: 'sales',
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
      clientId: '',
      gstPercentage: '',
      tdsPercentage: ''
    });
    setPreviewPdf('');
  };
  
  const openViewModal = (invoice, tab) => {
    const client = clients.find(c => c.clientId === invoice.clientId);
    setSelectedInvoice(invoice);
    setSelectedClient(client);
    setIsViewModalOpen(true);
    setModalTab(tab);
  };

  const calculateAmountWithGst = (amount, gstPercentage) => {
    const a = Number(amount) || 0;
    const g = Number(gstPercentage) || 0;
    return a + (a * g) / 100;
  };
  
  const calculateAmountAfterTds = (amount, tdsPercentage) => {
    const a = Number(amount) || 0;
    const t = Number(tdsPercentage) || 0;
    return a - (a * t) / 100;
  };
  
  // format number with Indian grouping and exactly 2 decimals
  const formatNumber = (num) => {
    const n = Number(num) || 0;
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
            width: '900px',
            maxWidth: '150vh',
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
              {modalTab === 'sales' ? (
                <>
                  <div style={{ marginBottom: '15px', flexDirection: 'row', display: 'flex', gap: '10px' }}>
                    <div style={{ width: '50%' }}>
                      <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Client ID:</label>
                      <select
                        name="clientId"
                        value={newInvoice.clientId}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                      >
                        <option value="">Select Client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.clientid}>{client.clientid}</option>
                        ))}
                      </select>
                    </div>
                    {selectedClient && (
                      <div style={{ width: '50%', marginBottom: '15px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f9fafb', marginTop: '22px' }}>
                        <p><strong>Name:</strong> {selectedClient.name}</p>
                        <p><strong>Address:</strong> {selectedClient.address}</p>
                        <p><strong>State:</strong> {selectedClient.state}</p>
                        <p><strong>Contact:</strong> {selectedClient.contact}</p>
                        <p><strong>Email:</strong> {selectedClient.email}</p>
                        <p><strong>GST Number:</strong> {selectedClient.gst_number}</p>
                        <p><strong>PAN Number:</strong> {selectedClient.pan_number}</p>
                        <p><strong>Purchase Order ID:</strong> {selectedClient.purchase_order_id}</p>
                      </div>
                    )}
                  </div>
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
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Date of Invoice:</label>
                    <input
                      type="date"
                      name="date"
                      value={newInvoice.date}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Mode of Payment:</label>
                    <select
                      name="paymentMethod"
                      value={newInvoice.paymentMethod}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    >
                      <option value="">Select Payment Method</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Payment Due Date:</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={newInvoice.dueDate}
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
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>GST %:</label>
                    <input
                      type="number"
                      name="gstPercentage"
                      value={newInvoice.gstPercentage}
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
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>PDF Proof of Invoice:</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfChange}
                      style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '15px', flexDirection: 'row', display: 'flex', gap: '10px' }}>
                    <div style={{ width: '50%' }}>
                      <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Client ID:</label>
                      <select
                        name="clientId"
                        value={newInvoice.clientId}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                      >
                        <option value="">Select Client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.clientid}>{client.clientid}</option>
                        ))}
                      </select>
                    </div>
                    {selectedClient && (
                      <div style={{ width: '50%', marginBottom: '15px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f9fafb', marginTop: '22px' }}>
                        <p><strong>Name:</strong> {selectedClient.name}</p>
                        <p><strong>Address:</strong> {selectedClient.address}</p>
                        <p><strong>State:</strong> {selectedClient.state}</p>
                        <p><strong>Contact:</strong> {selectedClient.contact}</p>
                        <p><strong>Email:</strong> {selectedClient.email}</p>
                        <p><strong>GST Number:</strong> {selectedClient.gst_number}</p>
                        <p><strong>PAN Number:</strong> {selectedClient.pan_number}</p>
                        <p><strong>Purchase Order ID:</strong> {selectedClient.purchase_order_id}</p>
                      </div>
                    )}
                  </div>
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
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Date of Invoice:</label>
                    <input
                      type="date"
                      name="date"
                      value={newInvoice.date}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Mode of Payment:</label>
                    <select
                      name="paymentMethod"
                      value={newInvoice.paymentMethod}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    >
                      <option value="">Select Payment Method</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Payment Due Date:</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={newInvoice.dueDate}
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
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>GST %:</label>
                    <input
                      type="number"
                      name="gstPercentage"
                      value={newInvoice.gstPercentage}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>TDS %:</label>
                    <input
                      type="number"
                      name="tdsPercentage"
                      value={newInvoice.tdsPercentage}
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
                    <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>PDF Proof of Invoice:</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfChange}
                      style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
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
                      company: '',
                      amount: '',
                      dueDate: '',
                      paymentMethod: '',
                      notes: '',
                      status: 'Due',
                      pdf: null,
                      clientId: '',
                      gstPercentage: '',
                      tdsPercentage: ''
                    });
                    setPreviewPdf('');
                    setSelectedClient(null);
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
      {isViewModalOpen && selectedInvoice && (
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
            width: '900px',
            maxWidth: '150vh',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
              Invoice Details
            </h2>
            <div style={{ marginBottom: '15px', flexDirection: 'row', display: 'flex', gap: '10px' }}>
              <div style={{ width: '50%' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Client ID:</label>
                <input
                  type="text"
                  value={selectedInvoice.client_id}
                  readOnly
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f9fafb' }}
                />
              </div>
              {selectedClient && (
                <div style={{ width: '50%', marginBottom: '15px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f9fafb', marginTop: '22px' }}>
                  <p><strong>Name:</strong> {selectedClient.name}</p>
                  <p><strong>Address:</strong> {selectedClient.address}</p>
                  <p><strong>State:</strong> {selectedClient.state}</p>
                  <p><strong>Contact:</strong> {selectedClient.contact}</p>
                  <p><strong>Email:</strong> {selectedClient.email}</p>
                  <p><strong>GST Number:</strong> {selectedClient.gstNumber}</p>
                  <p><strong>PAN Number:</strong> {selectedClient.panNumber}</p>
                  <p><strong>Purchase Order ID:</strong> {selectedClient.purchaseOrderId}</p>
                </div>
              )}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Invoice Number:</label>
              <input
                type="text"
                value={selectedInvoice.number}
                readOnly
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f9fafb' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Date of Invoice:</label>
              <input
                type="text"
                value={formatDateToIST(selectedInvoice.date)}
                readOnly
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f9fafb' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Mode of Payment:</label>
              <input
                type="text"
                value={selectedInvoice.payment_method}
                readOnly
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f9fafb' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Payment Due Date:</label>
              <input
                type="text"
                value={formatDateToIST(selectedInvoice.due_date)}
                readOnly
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f9fafb' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Amount (₹):</label>
              <input
                type="text"
                value={selectedInvoice.amount.toLocaleString('en-IN')}
                readOnly
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f9fafb' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>GST %:</label>
              <input
                type="text"
                value={selectedInvoice.gst_percentage}
                readOnly
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f9fafb' }}
              />
            </div>

            {modalTab === 'sales' && (
              <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Amount with GST (₹):</label>
              <input
                type="text"
// -                value={calculateAmountWithGst(selectedInvoice.amount, selectedInvoice.gst_percentage).toLocaleString('en-IN')}
                  value={formatNumber(calculateAmountWithGst(selectedInvoice.amount, selectedInvoice.gst_percentage))}
                 readOnly
                 style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f9fafb' }}
               />
             </div>
             )}
            {modalTab === 'purchase' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Amount after TDS (₹):</label>
                <input
                  type="text"
// -                  value={calculateAmountAfterTds(selectedInvoice.amount, selectedInvoice.gst_percentage, selectedInvoice.tds_percentage).toLocaleString('en-IN')}
                   value={formatNumber(calculateAmountAfterTds(selectedInvoice.amount, selectedInvoice.tds_percentage))}
                   readOnly
                   style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f9fafb' }}
                 />
               </div>
             )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Notes:</label>
              <textarea
                value={selectedInvoice.notes}
                readOnly
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', minHeight: '80px', backgroundColor: '#f9fafb' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Status:</label>
              <input
                type="text"
                value={selectedInvoice.status}
                readOnly
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f9fafb' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>PDF Documents:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedInvoice.pdf_url && (
                  <button
                    type="button"
                    onClick={() => openPdf(selectedInvoice.pdf_url)}
                    style={{
                      backgroundColor: '#0a9396',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    View Invoice PDF
                  </button>
                )}
                {selectedClient?.purchase_order_url && (
                  <button
                    type="button"
                    onClick={() => openPdf(selectedClient.purchase_order_url)}
                    style={{
                      backgroundColor: '#0a9396',
                      color: 'white',
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    View Purchase Order PDF
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedInvoice(null);
                  setSelectedClient(null);
                }}
                style={{
                  backgroundColor: '#aecfeeff',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#005f73')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#aecfeeff')}
              >
                Close
              </button>
            </div>
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
                  <th>Client ID</th>
                  <th>Payment Due Date</th>
                  <th>Amount</th>
                  <th>GST %</th>
                  <th>Amount with GST</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {salesInvoices.map((invoice, index) => (
                  <tr key={invoice.id}>
                    <td>{index + 1}</td>
                    <td>{invoice.number}</td>
                    <td>{invoice.client_id}</td>
                    <td>{formatDateToIST(invoice.due_date)}</td>
                    <td>₹ {invoice.amount.toLocaleString('en-IN')}</td>
                    <td>{invoice.gst_percentage}%</td>
                    <td>
                      ₹ {formatNumber(calculateAmountWithGst(invoice.amount, invoice.gst_percentage))}
                    </td>
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
                      <button
                        onClick={() => openViewModal(invoice, 'sales')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px'
                        }}
                      >
                        <FaEye style={{ marginLeft: "16px" }} />
                      </button>
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
                  <th>Client ID</th>
                  <th>Payment Due Date</th>
                  <th>Amount</th>
                  <th>GST %</th>
                  <th>TDS %</th>
                  <th>Amount after TDS</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {purchaseInvoices.map((invoice, index) => (
                  <tr key={invoice.id}>
                    <td>{index + 1}</td>
                    <td>{invoice.number}</td>
                    <td>{invoice.client_id}</td>
                    <td>{formatDateToIST(invoice.due_date)}</td>
                    <td>₹ {invoice.amount.toLocaleString('en-IN')}</td>
                    <td>{invoice.gst_percentage}%</td>
                    <td>{invoice.tds_percentage}%</td>
                    <td>
                      ₹ {formatNumber(calculateAmountAfterTds(invoice.amount, invoice.tds_percentage))}
                    </td>
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
                      <button
                        onClick={() => openViewModal(invoice, 'purchase')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px'
                        }}
                      >
                        <FaEye style={{ marginLeft: "16px" }} />
                      </button>
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