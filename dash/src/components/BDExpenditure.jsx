import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function BDExpenditure() {
  const { id } = useParams();
  const projectId = id;
  const [expenditures, setExpenditures] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    area: '',
    date: '',
    amount: 0,
    receiptProof: null // will store File object
  });
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(sessionStorage.getItem('user')) 

  // Load BD expenditures for this project
  const fetchExpenditures = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/bdexp`);
      const data = await res.json();
      if (res.ok) {
        setExpenditures(data);
      } else {
        showNotification(data.message || 'Failed to load expenditures', 'error');
      }
    } catch (err) {
      showNotification('Network error', 'error');
    }
  };

  useEffect(() => {
    fetchExpenditures();
  }, [projectId]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, visible: true });
    // avoid stale state by using functional updater
    setTimeout(() => setNotification(n => ({ ...n, visible: false })), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    // If file input, store the File object (not just the name)
    if (name === 'receiptProof') {
      setFormData(prev => ({
        ...prev,
        receiptProof: files && files[0] ? files[0] : null
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.area || !formData.date || !formData.amount || !formData.receiptProof) {
      showNotification('All fields are required', 'error');
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append('projectId', projectId);
    form.append('area', formData.area);
    form.append('date', formData.date);
    form.append('amount', formData.amount);
    // Append the actual File object under the key 'receiptProof' (matches backend multer)
    form.append('receiptProof', formData.receiptProof);

    console.log("Submitting form data:", {
      area: formData.area, date: formData.date, amount: formData.amount, receiptName: formData.receiptProof?.name
    });

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/bdexp`, {
        method: 'POST',
        body: form
      });

      const data = await res.json();
      if (res.ok) {
        // backend returns bdexp (has 'receipt' path)
        setExpenditures(prev => [...prev, data.bdexp]);
        showNotification('Expenditure added successfully!');
        setShowModal(false);
        resetForm();
      } else {
        showNotification(data.message || 'Failed to save', 'error');
      }
    } catch (err) {
      showNotification('Upload failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ area: '', date: '', amount: 0, receiptProof: null });
    // Note: file input element will be uncontrolled so no need to reset its value here
  };

  const handleCancel = () => {
    resetForm();
    setShowModal(false);
  };

  const handleViewReceipt = (receiptPath) => {
    if (!receiptPath) {
      showNotification('No receipt available', 'error');
      return;
    }
    const url = `http://localhost:5000${receiptPath}`;
    window.open(url, '_blank');
  };

  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate total expenditure
  const totalExpenditure = expenditures.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return (
    <>
      <div className="dashboard">
        <div className="header" style={{ padding: '20px' }}>
          <h1>BD Expenditures</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="total-expenditure">
              Total Expenditure: ₹{totalExpenditure.toLocaleString('en-IN')}
            </div>
            {user && user.role === 'Admin' && (
              <button 
                onClick={() => setShowModal(true)}
                className="action-button"
              >
                Add New Expenditure
              </button>
            )}
          </div>
        </div>
        
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Sl. No</th>
              <th>Area</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Receipt Proof</th>
            </tr>
          </thead>
          <tbody>
            {expenditures.map((expenditure, index) => (
              <tr key={expenditure.id}>
                <td>{index + 1}</td>
                <td>{expenditure.area}</td>
                <td>{formatDateToYYYYMMDD(expenditure.date)}</td>
                <td>₹{Number(expenditure.amount).toLocaleString('en-IN')}</td>
                <td>
                  <button
                    className="view-button"
                    // backend stores path in `receipt` column; fallback to `receiptProof` if present
                    onClick={() => handleViewReceipt(expenditure.receipt || expenditure.receiptProof)}
                  >
                    View Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-header">Add New Expenditure</h2>
              
              <div>
                <div className="form-group">
                  <label className="form-label">
                    Area <span className="required">*</span>
                  </label>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select Area</option>
                    <option value="Travel">Travel</option>
                    <option value="Hotel Booking">Hotel Booking</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Compliance & Legal Cost">Compliance & Legal Cost</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Amount (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Receipt Proof <span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    name="receiptProof"
                    accept="application/pdf"
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  {formData.receiptProof && (
                    <p className="form-label" style={{ fontSize: '12px', color: '#64748b' }}>
                      Selected: {formData.receiptProof.name}
                    </p>
                  )}
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary"
                  >
                    Save Expenditure
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

        .action-button {
          background-color: #005f73;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .action-button:hover {
          background-color: #0a9396;
        }

        .total-expenditure {
          background-color: #0a9396;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
          margin-left: 10px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
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

        .view-button {
          background-color: #0a9396;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .view-button:hover {
          background-color: #005f73;
        }
      `}</style>
    </>
  );
}

export default BDExpenditure;