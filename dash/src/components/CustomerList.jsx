import { useEffect, useState } from 'react';
import API_BASE_URL from '../api/apiConfig';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    address: '',
    state: '',
    contact: '',
    email: '',
    gstNumber: '',
    panNumber: '',
    purchaseOrderId: '',
    contractProof: null,
    purchaseOrder: null,
    totalPurchases: 0
  });
  const [viewPdf, setViewPdf] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    // Fetch customers from backend
    fetch(`${API_BASE_URL}/api/customers`)
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error('Error fetching customers:', err));
  }, []);

  console.log('Customers:', customers);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalPurchases' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.clientId || !formData.name || !formData.address || 
        !formData.state || !formData.contact || !formData.email || 
        !formData.gstNumber || !formData.purchaseOrderId || 
        !formData.contractProof || !formData.purchaseOrder) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('clientId', formData.clientId);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('contact', formData.contact);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('gstNumber', formData.gstNumber);
      formDataToSend.append('panNumber', formData.panNumber);
      formDataToSend.append('purchaseOrderId', formData.purchaseOrderId);
      formDataToSend.append('totalPurchases', formData.totalPurchases || 0);
      if (formData.contractProof) {
        formDataToSend.append('contractProof', formData.contractProof);
      }
      if (formData.purchaseOrder) {
        formDataToSend.append('purchaseOrder', formData.purchaseOrder);
      }

      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const addedCustomer = await response.json();
        setCustomers(prev => [...prev, addedCustomer]);
        setFormData({
          clientId: '',
          name: '',
          address: '',
          state: '',
          contact: '',
          email: '',
          gstNumber: '',
          panNumber: '',
          purchaseOrderId: '',
          contractProof: null,
          purchaseOrder: null,
          totalPurchases: 0
        });
        setShowModal(false);
        alert('Client added successfully!');
      } else {
        throw new Error('Failed to add client');
      }
    } catch (error) {
      alert('Error adding client');
    }
  };

  const handleCancel = () => {
    setFormData({
      clientId: '',
      name: '',
      address: '',
      state: '',
      contact: '',
      email: '',
      gstNumber: '',
      panNumber: '',
      purchaseOrderId: '',
      contractProof: null,
      purchaseOrder: null,
      totalPurchases: 0
    });
    setShowModal(false);
  };

  const handleViewPdf = (url) => {
    setViewPdf(url);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = customers.filter(client =>
    client.clientid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gst_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.purchase_order_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="dashboard">
        <div className="header">
          <h1>Client Analysis</h1>
          {user && user.role === 'Admin' && (
            <button 
              onClick={() => setShowModal(true)}
              className="action-button"
            >
              Add New Client
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Search by Client ID, Name, State, GST Number or Purchase Order ID"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />

        <div className="invoice-table">
          <table>
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>State</th>
                <th>Contact</th>
                <th>Email</th>
                <th>GST Number</th>
                <th>Pan Number</th>
                <th>Purchase Order ID</th>
                <th>Contract Proof</th>
                <th>Purchase Order</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(client => (
                <tr key={client.id}>
                  <td>{client.clientid}</td>
                  <td>{client.name}</td>
                  <td>{client.address}</td>
                  <td>{client.state}</td>
                  <td>{client.contact}</td>
                  <td>{client.email}</td>
                  <td>{client.gst_number}</td>
                  <td>{client.pan_number}</td>
                  <td>{client.purchase_order_id}</td>
                  <td>
                    {client.contract_proof_url ? (
                      <button 
                        className="action-button"
                        onClick={() => handleViewPdf(`${API_BASE_URL}${client.contract_proof_url}`)}
                      >
                        View Contract
                      </button>
                    ):
                    ('N/A')}
                  </td>
                  <td>
                    {client.purchase_order_url ? (
                      <button 
                        className="action-button"
                        onClick={() => handleViewPdf(`${API_BASE_URL}${client.purchase_order_url}`)}
                      >
                        View PO
                      </button>
                    ):
                    ('N/A')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-header">Add New Client</h2>
              
              <div>
                <div className="form-group">
                  <label className="form-label">
                    Client ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter client ID"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Client Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter client name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Address <span className="required">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter address"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    State <span className="required">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select State</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Contact Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter contact number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email ID <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    GST Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Pan Number 
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter Pan number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Purchase Order ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="purchaseOrderId"
                    value={formData.purchaseOrderId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter purchase order ID"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Contract Proof (PDF) <span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    name="contractProof"
                    onChange={handleFileChange}
                    className="form-input"
                    accept="application/pdf"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Purchase Order Copy (PDF) <span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    name="purchaseOrder"
                    onChange={handleFileChange}
                    className="form-input"
                    accept="application/pdf"
                  />
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary"
                  >
                    Save Client
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        {viewPdf && (
          <div className="pdf-viewer">
            <div className="pdf-content">
              <div className="form-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => setViewPdf(null)}
                >
                  Close
                </button>
              </div>
              <iframe
                src={viewPdf}
                width="100%"
                height="600px"
                style={{ border: 'none', marginTop: '20px' }}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 20px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 6px;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          color: #1e293b;
          background-color: #ffffff;
          box-sizing: border-box;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #0a9396;
          box-shadow: 0 0 0 2px rgba(10, 147, 150, 0.1);
        }

        .form-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .btn-primary {
          flex: 1;
          background-color: #005f73;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .btn-primary:hover {
          background-color: #0a9396;
          transform: translateY(-2px);
        }

        .btn-secondary {
          flex: 1;
          background-color: #64748b;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .btn-secondary:hover {
          background-color: #475569;
          transform: translateY(-2px);
        }

        .btn-pdf {
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .btn-pdf:hover {
          background-color: #1d4ed8;
        }

        .pdf-viewer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .pdf-content {
          background: white;
          border-radius: 8px;
          padding: 20px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .required {
          color: #dc2626;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        th {
          background-color: #f8fafc;
          font-weight: 600;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          color: #1e293b;
          background-color: #ffffff;
          box-sizing: border-box;
        }

       .search-input:focus {
          outline: none;
          border-color: #0a9396;
          box-shadow: 0 0 0 2px rgba(10, 147, 150, 0.1);
        }
      `}</style>
    </>
  );
}

export default CustomerList;