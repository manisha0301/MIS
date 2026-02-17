import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import API_BASE_URL from '../api/apiConfig'; // keep if needed later
import '../styles/AssetManagement.css';

function BiometricDevice() {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterInputs, setFilterInputs] = useState({
    location: '',
    manufacturer: '',
    modelNo: '',
    communicationMode: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    location: '',
    manufacturer: '',
    modelNo: '',
    communicationMode: '',
  });

  // Form state – used for add & edit
  const [formData, setFormData] = useState({
    id: null,
    readerId: '',
    location: '',
    ip: '',
    modelNo: '',
    serialNo: '',
    manufacturer: '',
    communicationMode: '',
  });

  useEffect(() => {
    fetchDevices();
  }, []);
  
  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const res = await fetch(`${API_BASE_URL}/api/biometrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired. Please login again.');
        throw new Error('Failed to load biometric devices');
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

  // Combined search + filters
useEffect(() => {
  let result = [...devices];

  // 1. Text search
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    result = result.filter((d) =>
      d.reader_id?.toLowerCase().includes(term) ||
      d.location?.toLowerCase().includes(term) ||
      d.ip?.toLowerCase().includes(term) ||
      d.serial_no?.toLowerCase().includes(term) ||
      d.model_no?.toLowerCase().includes(term) ||
      d.manufacturer?.toLowerCase().includes(term) ||
      d.communication_mode?.toLowerCase().includes(term)
    );
  }

  // 2. Advanced filters - fixed property names to match backend (snake_case)
  if (appliedFilters.location) {
    result = result.filter((d) => d.location === appliedFilters.location);
  }
  if (appliedFilters.manufacturer) {
    result = result.filter((d) => d.manufacturer === appliedFilters.manufacturer);
  }
  if (appliedFilters.modelNo) {
    result = result.filter((d) => d.model_no === appliedFilters.modelNo);
  }
  if (appliedFilters.communicationMode) {
    result = result.filter((d) => d.communication_mode === appliedFilters.communicationMode);
  }

  setFilteredDevices(result);
}, [searchTerm, devices, appliedFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterInputs((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilterInputs({
      location: '',
      manufacturer: '',
      modelNo: '',
      communicationMode: '',
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
        readerId:        formData.readerId,
        location:        formData.location,
        ip:              formData.ip || null,
        modelNo:         formData.modelNo || null,
        serialNo:        formData.serialNo || null,
        manufacturer:    formData.manufacturer || null,
        communicationMode: formData.communicationMode || null,
      };

      const res = await fetch(`${API_BASE_URL}/api/biometrics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to add device');

      const newDevice = await res.json();
      setDevices(prev => [...prev, newDevice]);
      setFilteredDevices(prev => [...prev, newDevice]);

      resetForm();
      setShowAddModal(false);
      alert('Device added successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditDevice = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem('token');
      const payload = { ...formData }; // already has correct shape except key names

      // Rename keys to match backend expectation
      const body = {
        readerId: formData.readerId,
        location: formData.location,
        ip: formData.ip || null,
        modelNo: formData.modelNo || null,
        serialNo: formData.serialNo || null,
        manufacturer: formData.manufacturer || null,
        communicationMode: formData.communicationMode || null,
      };

      const res = await fetch(`${API_BASE_URL}/api/biometrics/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to update device');

      const updated = await res.json();

      setDevices(prev => prev.map(d => d.id === updated.id ? updated : d));
      setFilteredDevices(prev => prev.map(d => d.id === updated.id ? updated : d));

      resetForm();
      setShowEditModal(false);
      alert('Device updated!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm('Delete this device?')) return;

    try {
      const token = sessionStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/api/biometrics/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete');

      setDevices(prev => prev.filter(d => d.id !== id));
      setFilteredDevices(prev => prev.filter(d => d.id !== id));
      alert('Device deleted.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getActiveFilterCount = () => {
    const f = appliedFilters;
    return [f.location, f.manufacturer, f.modelNo, f.communicationMode].filter(Boolean).length;
  };

  const resetForm = () => {
    setFormData({
      id: null,
      readerId: '',
      location: '',
      ip: '',
      modelNo: '',
      serialNo: '',
      manufacturer: '',
      communicationMode: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (device) => {
    setFormData({
      id: device.id,
      readerId: device.reader_id,
      location: device.location,
      ip: device.ip || '',
      modelNo: device.model_no || '',
      serialNo: device.serial_no || '',
      manufacturer: device.manufacturer || '',
      communicationMode: device.communication_mode || '',
    });
    setShowEditModal(true);
  };

  // New: Handle Excel Import
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

      if (data.length < 2) {
        alert('No data found in the Excel sheet (need at least header + 1 row).');
        return;
      }

      const rows = data.slice(1); // skip header

      const validDevices = [];
      let skipped = 0;

      for (const row of rows) {
        if (row.length < 7 || !row[0] || !row[1]) {
          skipped++;
          continue;
        }

        // Force everything to string + trim
        const safe = (val) => {
          if (val == null) return null;
          return String(val).trim();
        };

        const newDevice = {
          readerId:         safe(row[0]),
          location:         safe(row[1]),
          ip:               safe(row[2]) || null,
          modelNo:          safe(row[3]) || null,
          serialNo:         safe(row[4]) || null,
          manufacturer:     safe(row[5]) || null,
          communicationMode: safe(row[6]) || null,
        };

        // Final required check (after conversion)
        if (!newDevice.readerId || !newDevice.location) {
          skipped++;
          continue;
        }

        validDevices.push(newDevice);
      }

      if (validDevices.length === 0) {
        alert(`No valid rows found. Skipped ${skipped} rows.`);
        return;
      }

      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Please log in first.');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const device of validDevices) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/biometrics`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(device),
          });

          if (res.ok) {
            successCount++;
          } else {
            failCount++;
            console.warn(`Failed to import ${device.readerId}: ${res.status}`);
          }
        } catch (err) {
          failCount++;
          console.error('Import failed for', device.readerId, err);
        }
      }

      alert(
        `Imported ${successCount} device${successCount !== 1 ? 's' : ''} successfully.\n` +
        (failCount > 0 ? `${failCount} failed (check console for details).` : '')
      );

      if (successCount > 0) {
        fetchDevices(); // refresh list
      }
    } catch (err) {
      console.error('Excel processing error:', err);
      alert('Failed to read Excel file: ' + err.message);
    }
  };

  reader.readAsBinaryString(file);
};

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

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
        <h1>Biometric Device Management</h1>
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
            Add New Device
          </button>
        </div>
      </div>

      {/* Search + Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by Reader ID, Location, IP, Serial, Model..."
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
              width: '420px',
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
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  name="location"
                  value={filterInputs.location}
                  onChange={handleFilterChange}
                  placeholder="e.g. 4TH FLOOR IN"
                />
              </div>

              <div>
                <label className="form-label">Manufacturer</label>
                <select name="manufacturer" value={filterInputs.manufacturer} onChange={handleFilterChange} className="form-select">
                  <option value="">All</option>
                  <option value="SAVIOR">SAVIOR</option>
                  {/* Add more manufacturers when known */}
                </select>
              </div>

              <div>
                <label className="form-label">Model No</label>
                <select name="modelNo" value={filterInputs.modelNo} onChange={handleFilterChange} className="form-select">
                  <option value="">All</option>
                  <option value="FTXX">FTXX</option>
                  <option value="88XX">88XX</option>
                  <option value="76XX">76XX</option>
                </select>
              </div>

              <div>
                <label className="form-label">Communication Mode</label>
                <select name="communicationMode" value={filterInputs.communicationMode} onChange={handleFilterChange} className="form-select">
                  <option value="">All</option>
                  <option value="Face + Card">Face + Card</option>
                  <option value="Finger + Card">Finger + Card</option>
                  <option value="Card">Card</option>
                  {/* Add more modes if needed */}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
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
              <th>Reader ID</th>
              <th>Location</th>
              <th>IP Address</th>
              <th>Model No</th>
              <th>Serial No</th>
              <th>Manufacturer</th>
              <th>Comm. Mode</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => (
              <tr key={device.id} >
                <td>
                  <HighlightText text={device.reader_id} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={device.location} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={device.ip} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={device.model_no} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={device.serial_no} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={device.manufacturer} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={device.communication_mode} searchTerm={searchTerm} />
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="action-button" onClick={(e) => { e.stopPropagation(); openEditModal(device); }}>
                      Edit
                    </button>
                    <button
                      className="action-button"
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteDevice(device.id); }}
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
                  No devices found
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
              <h2 className="modal-header">Add New Biometric Device</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddDevice} className="laptop-form">
              <DeviceFormFields formData={formData} handleInputChange={handleInputChange} />
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Save Device</button>
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
              <h2 className="modal-header">Edit Device – {formData.readerId}</h2>
              <button className="modal-close-btn" onClick={() => { setShowEditModal(false); resetForm(); }}>×</button>
            </div>

            <form onSubmit={handleEditDevice} className="laptop-form">
              <DeviceFormFields formData={formData} handleInputChange={handleInputChange} />
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowEditModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Update Device</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable form fields component
function DeviceFormFields({ formData, handleInputChange }) {
  return (
    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div className="form-group">
        <label className="form-label">Reader ID <span className="required">*</span></label>
        <input
          className="form-input"
          required
          name="readerId"
          value={formData.readerId}
          onChange={handleInputChange}
          placeholder="1"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Location <span className="required">*</span></label>
        <input
          className="form-input"
          required
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="4TH FLOOR IN"
        />
      </div>

      <div className="form-group">
        <label className="form-label">IP Address <span className="required">*</span></label>
        <input
          className="form-input"
          name="ip"
          value={formData.ip}
          onChange={handleInputChange}
          placeholder="172.30.0.45"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Model No <span className="required">*</span></label>
        <input
          className="form-input"
          name="modelNo"
          value={formData.modelNo}
          onChange={handleInputChange}
          placeholder="FTXX / 88XX / 76XX"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Serial No <span className="required">*</span></label>
        <input
          className="form-input"
          name="serialNo"
          value={formData.serialNo}
          onChange={handleInputChange}
          placeholder="107250203020"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Manufacturer <span className="required">*</span></label>
        <input
          className="form-input"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleInputChange}
          placeholder="SAVIOR"
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">Communication Mode <span className="required">*</span></label>
        <select
          className="form-select"
          name="communicationMode"
          value={formData.communicationMode}
          onChange={handleInputChange}
        >
          <option value="">Select mode</option>
          <option value="Face + Card">Face + Card</option>
          <option value="Finger + Card">Finger + Card</option>
          <option value="Card">Card</option>
          <option value="Face">Face</option>
          <option value="Finger">Finger</option>
        </select>
      </div>
    </div>
  );
}

export default BiometricDevice;