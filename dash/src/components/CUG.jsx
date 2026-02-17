import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import API_BASE_URL from '../api/apiConfig';
import '../styles/AssetManagement.css';

function CUG() {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterInputs, setFilterInputs] = useState({
    manufacturer: '',
    modelNo: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    manufacturer: '',
    modelNo: '',
  });

  // Form state – matches Excel columns (except SL NO)
  const [formData, setFormData] = useState({
    id: null,
    modelNo: '',
    contactNo: '',
    name: '',
    manufacturer: '',
    imei1: '',
    imei2: '',
  });

  // Fetch all CUG records on mount
  useEffect(() => {
    fetchCugs();
  }, []);

  const fetchCugs = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Please login first');
      }

      const res = await fetch(`${API_BASE_URL}/api/cugs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired. Please login again.');
        throw new Error('Failed to load CUG records');
      }

      const data = await res.json();
      setDevices(data);
      setFilteredDevices(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Search + filter logic (client-side)
  useEffect(() => {
    let result = [...devices];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((d) =>
        d.model_no?.toLowerCase().includes(term) ||
        d.contact_no?.toLowerCase().includes(term) ||
        d.name?.toLowerCase().includes(term) ||
        d.manufacturer?.toLowerCase().includes(term) ||
        d.imei1?.toLowerCase().includes(term) ||
        d.imei2?.toLowerCase().includes(term)
      );
    }

    if (appliedFilters.manufacturer) {
      result = result.filter((d) => d.manufacturer === appliedFilters.manufacturer);
    }
    if (appliedFilters.modelNo) {
      result = result.filter((d) => d.model_no === appliedFilters.modelNo);
    }

    setFilteredDevices(result);
  }, [searchTerm, devices, appliedFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterInputs((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilterInputs({
      manufacturer: '',
      modelNo: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem('token');
      const payload = {
        modelNo: formData.modelNo,
        contactNo: formData.contactNo,
        name: formData.name,
        manufacturer: formData.manufacturer,
        imei1: formData.imei1 || null,
        imei2: formData.imei2 || null,
      };

      const res = await fetch(`${API_BASE_URL}/api/cugs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to add CUG record');

      const newRecord = await res.json();
      setDevices((prev) => [...prev, newRecord]);
      setFilteredDevices((prev) => [...prev, newRecord]);

      resetForm();
      setShowAddModal(false);
      alert('Record added successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditDevice = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem('token');
      const payload = {
        modelNo: formData.modelNo,
        contactNo: formData.contactNo,
        name: formData.name,
        manufacturer: formData.manufacturer,
        imei1: formData.imei1 || null,
        imei2: formData.imei2 || null,
      };

      const res = await fetch(`${API_BASE_URL}/api/cugs/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update CUG record');

      const updated = await res.json();

      setDevices((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );
      setFilteredDevices((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );

      resetForm();
      setShowEditModal(false);
      alert('Record updated successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/cugs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete record');

      setDevices((prev) => prev.filter((d) => d.id !== id));
      setFilteredDevices((prev) => prev.filter((d) => d.id !== id));
      alert('Record deleted successfully.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getActiveFilterCount = () => {
    const f = appliedFilters;
    return [f.manufacturer, f.modelNo].filter(Boolean).length;
  };

  const resetForm = () => {
    setFormData({
      id: null,
      modelNo: '',
      contactNo: '',
      name: '',
      manufacturer: '',
      imei1: '',
      imei2: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (device) => {
    setFormData({
      id: device.id,
      modelNo: device.model_no,
      contactNo: device.contact_no,
      name: device.name,
      manufacturer: device.manufacturer,
      imei1: device.imei1 || '',
      imei2: device.imei2 || '',
    });
    setShowEditModal(true);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Skip header
        const imported = data.slice(1).map((row) => ({
          modelNo: String(row[1] || ''),
          contactNo: String(row[2] || ''),
          name: String(row[3] || ''),
          manufacturer: String(row[4] || ''),
          imei1: String(row[5] || ''),
          imei2: String(row[6] || ''),
        }));

        const token = sessionStorage.getItem('token');

        // You can either:
        // A) Import one-by-one (safer, but slower)
        for (const rec of imported) {
          await fetch(`${API_BASE_URL}/api/cugs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rec),
          });
        }

        // B) Or refresh list after all attempts
        await fetchCugs();
        alert(`Attempted to import ${imported.length} records`);
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  if (loading) return <div className="loading">Loading CUG records...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  function HighlightText({ text, searchTerm }) {
    if (!searchTerm || !text) return <>{text || ''}</>;
    const term = searchTerm.toLowerCase();
    const value = String(text);
    if (!value.toLowerCase().includes(term)) return <>{value}</>;

    const parts = value.split(new RegExp(`(${term})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === term ? (
            <mark key={i} style={{ backgroundColor: '#fff3cd', padding: '1px 2px', borderRadius: '3px' }}>
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>CUG Phone Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <label className="action-button" style={{ cursor: 'pointer' }}>
            Import from Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
          <button className="action-button" onClick={openAddModal}>
            Add New Record
          </button>
        </div>
      </div>

      {/* Search + Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by Name, Contact, Model, IMEI, Manufacturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ flex: 1 }}
        />

        <button
          className="action-button"
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          style={{ backgroundColor: showFilterPanel ? '#64748b' : '#006d77', color: 'white', minWidth: '110px' }}
        >
          {showFilterPanel ? 'Close Filter' : `Filters${getActiveFilterCount() > 0 ? ` (${getActiveFilterCount()})` : ''}`}
        </button>

        {showFilterPanel && (
          <div
            className="filter-panel"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              padding: '20px',
              width: '360px',
              zIndex: 100,
              marginTop: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Advanced Filters</h3>
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                Clear all
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label className="form-label">Manufacturer</label>
                <input
                  className="form-input"
                  name="manufacturer"
                  value={filterInputs.manufacturer}
                  onChange={handleFilterChange}
                  placeholder="e.g. HMD"
                />
              </div>

              <div>
                <label className="form-label">Model No</label>
                <input
                  className="form-input"
                  name="modelNo"
                  value={filterInputs.modelNo}
                  onChange={handleFilterChange}
                  placeholder="e.g. TA-1657"
                />
              </div>
            </div>

            <div style={{marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'space-between', gap:'12px' }}>
              <button className="btn-secondary" onClick={() => setShowFilterPanel(false)}>
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setAppliedFilters({ ...filterInputs });
                  setShowFilterPanel(false);
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="invoice-table">
        <table>
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Model No</th>
              <th>Contact No</th>
              <th>Name</th>
              <th>Manufacturer</th>
              <th>IMEI 1</th>
              <th>IMEI 2</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device, index) => (
              <tr key={device.id}>
                <td>{index + 1}</td>
                <td><HighlightText text={device.model_no} searchTerm={searchTerm} /></td>
                <td><HighlightText text={device.contact_no} searchTerm={searchTerm} /></td>
                <td><HighlightText text={device.name} searchTerm={searchTerm} /></td>
                <td><HighlightText text={device.manufacturer} searchTerm={searchTerm} /></td>
                <td><HighlightText text={device.imei1} searchTerm={searchTerm} /></td>
                <td><HighlightText text={device.imei2} searchTerm={searchTerm} /></td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="action-button" onClick={() => openEditModal(device)}>
                      Edit
                    </button>
                    <button
                      className="action-button"
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                      onClick={() => handleDeleteDevice(device.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDevices.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', width: '92%' }}>
            <div className="modal-header-wrapper">
              <h2 className="modal-header">Add New CUG Record</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddDevice} className="laptop-form">
              <CugFormFields formData={formData} handleInputChange={handleInputChange} />
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', width: '92%' }}>
            <div className="modal-header-wrapper">
              <h2 className="modal-header">Edit Record – {formData.contactNo || formData.name}</h2>
              <button className="modal-close-btn" onClick={() => { setShowEditModal(false); resetForm(); }}>×</button>
            </div>

            <form onSubmit={handleEditDevice} className="laptop-form">
              <CugFormFields formData={formData} handleInputChange={handleInputChange} />
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowEditModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Update Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable form fields – matches Excel structure
function CugFormFields({ formData, handleInputChange }) {
  return (
    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div className="form-group">
        <label className="form-label">Model No <span className="required">*</span></label>
        <input
          className="form-input"
          required
          name="modelNo"
          value={formData.modelNo}
          onChange={handleInputChange}
          placeholder="TA-1657"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Contact No <span className="required">*</span></label>
        <input
          className="form-input"
          required
          name="contactNo"
          value={formData.contactNo}
          onChange={handleInputChange}
          placeholder="9668905700"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Name <span className="required">*</span></label>
        <input
          className="form-input"
          required
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Udaya bhanu Das"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Manufacturer <span className="required">*</span></label>
        <input
          className="form-input"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleInputChange}
          placeholder="HMD"
        />
      </div>

      <div className="form-group">
        <label className="form-label">IMEI Number 1</label>
        <input
          className="form-input"
          name="imei1"
          value={formData.imei1}
          onChange={handleInputChange}
          placeholder="Enter IMEI 1"
        />
      </div>

      <div className="form-group">
        <label className="form-label">IMEI Number 2</label>
        <input
          className="form-input"
          name="imei2"
          value={formData.imei2}
          onChange={handleInputChange}
          placeholder="Enter IMEI 2 (if dual SIM)"
        />
      </div>
    </div>
  );
}

export default CUG;