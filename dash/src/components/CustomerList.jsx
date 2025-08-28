import { useEffect } from 'react';
import { useState } from 'react';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    state: '',
    totalPurchases: 0
  });

  useEffect(() => {
    // Fetch customers from backend
    fetch('http://localhost:5000/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error('Error fetching customers:', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalPurchases' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.contact || !formData.state) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newCustomer = {
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
        ...formData
      };
      const response = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
      if (response.ok) {
        const addedCustomer = await response.json();
        setCustomers(prev => [...prev, addedCustomer]);
        setFormData({
          name: '',
          contact: '',
          state: '',
          totalPurchases: 0
        });
        setShowModal(false);
        alert('Customer added successfully!');
      } else {
        throw new Error('Failed to add customer');
      }
    } catch (error) {
      alert('Error adding customer');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      contact: '',
      state: '',
      totalPurchases: 0
    });
    setShowModal(false);
  };

  return (
    <>
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

        .required {
          color: #dc2626;
        }
      `}</style>

      <div className="dashboard">
        <div className="header">
          <h1>Customers</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="action-button"
          >
            Add New Customer
          </button>
        </div>

        <div className="customer-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>State</th>
                <th>Total Purchases</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.contact}</td>
                  <td>{customer.state}</td>
                  <td>₹{Number(customer.total_purchases).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-header">Add New Customer</h2>
              
              <div>
                <div className="form-group">
                  <label className="form-label">
                    Customer Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter customer name"
                  />
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
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Total Purchases (₹)
                  </label>
                  <input
                    type="number"
                    name="totalPurchases"
                    value={formData.totalPurchases}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter total purchases"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary"
                  >
                    Save Customer
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
      </div>
    </>
  );
}

export default CustomerList;