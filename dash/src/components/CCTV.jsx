import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import API_BASE_URL from '../api/apiConfig'; // ← keep if you plan to use backend later
import '../styles/AssetManagement.css';

function CCTV() {
  const [cameras, setCameras] = useState([]);
  const [filteredCameras, setFilteredCameras] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterInputs, setFilterInputs] = useState({
    location: '',
    manufacturer: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    location: '',
    manufacturer: '',
  });

  // Form state – used for both add and edit
  const [formData, setFormData] = useState({
    id: null,
    location: '',
    ip: '',
    modelNo: '',
    serialNo: '',
    manufacturer: '',
  });

  // Fetch all cameras on mount
  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Please login first');

      const res = await fetch(`${API_BASE_URL}/api/cctvs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired. Please login again.');
        throw new Error('Failed to load CCTV cameras');
      }

      const data = await res.json();
      setCameras(data);
      setFilteredCameras(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Search + filter logic
  useEffect(() => {
    let result = [...cameras];

    // Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(cam =>
        cam.location?.toLowerCase().includes(term) ||
        cam.ip?.toLowerCase().includes(term) ||
        cam.model_no?.toLowerCase().includes(term) ||
        cam.serial_no?.toLowerCase().includes(term) ||
        cam.manufacturer?.toLowerCase().includes(term)
      );
    }

    // Advanced filters
    if (appliedFilters.location) {
      result = result.filter(c => c.location === appliedFilters.location);
    }
    if (appliedFilters.manufacturer) {
      result = result.filter(c => c.manufacturer === appliedFilters.manufacturer);
    }

    setFilteredCameras(result);
  }, [searchTerm, cameras, appliedFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterInputs(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilterInputs({ location: '', manufacturer: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── ADD ───────────────────────────────────────────────
  const handleAddCamera = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const payload = {
        location: formData.location,
        ip: formData.ip,
        modelNo: formData.modelNo,
        serialNo: formData.serialNo,
        manufacturer: formData.manufacturer,
      };

      const res = await fetch(`${API_BASE_URL}/api/cctvs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add camera');
      }

      const newCamera = await res.json();
      setCameras(prev => [...prev, newCamera]);
      setFilteredCameras(prev => [...prev, newCamera]);

      resetForm();
      setShowAddModal(false);
      alert('Camera added successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // ── UPDATE ───────────────────────────────────────────
  const handleEditCamera = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const payload = {
        location: formData.location,
        ip: formData.ip,
        modelNo: formData.modelNo,
        serialNo: formData.serialNo,
        manufacturer: formData.manufacturer,
      };

      const res = await fetch(`${API_BASE_URL}/api/cctvs/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update camera');
      }

      const updatedCamera = await res.json();

      setCameras(prev =>
        prev.map(c => (c.id === updatedCamera.id ? updatedCamera : c))
      );
      setFilteredCameras(prev =>
        prev.map(c => (c.id === updatedCamera.id ? updatedCamera : c))
      );

      resetForm();
      setShowEditModal(false);
      alert('Camera updated successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // ── DELETE ───────────────────────────────────────────
  const handleDeleteCamera = async (id) => {
    if (!window.confirm("Are you sure you want to delete this camera?")) return;

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/cctvs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete camera');

      setCameras(prev => prev.filter(c => c.id !== id));
      setFilteredCameras(prev => prev.filter(c => c.id !== id));
      alert('Camera deleted successfully.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      location: '',
      ip: '',
      modelNo: '',
      serialNo: '',
      manufacturer: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (camera) => {
    setFormData({
      id: camera.id,
      location: camera.location,
      ip: camera.ip,
      modelNo: camera.model_no,
      serialNo: camera.serial_no,
      manufacturer: camera.manufacturer,
    });
    setShowEditModal(true);
  };

  // Helper to count active filters
const getActiveFilterCount = () => {
  const filters = appliedFilters;
  let count = 0;

  if (filters.location)     count++;
  if (filters.manufacturer) count++;

  return count;
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

        // Skip header row, filter empty rows
        const rows = data.slice(1).filter(row => row.some(cell => cell?.toString().trim()));

        const token = sessionStorage.getItem('token');
        let successCount = 0;
        let failed = [];

        for (const row of rows) {
          // Adjust indices according to your Excel structure:
          // SL NO, Locations, IP, Model No, Serial No, Manufacturer
          const payload = {
            location:     String(row[1] || '').trim(),
            ip:           String(row[2] || '').trim(),
            modelNo:      String(row[3] || '').trim(),
            serialNo:     String(row[4] || '').trim(),
            manufacturer: String(row[5] || '').trim(),
          };

          if (!payload.location || !payload.ip || !payload.serialNo) {
            failed.push(`Row skipped (missing required fields): ${payload.serialNo || 'unknown'}`);
            continue;
          }

          try {
            const res = await fetch(`${API_BASE_URL}/api/cctvs`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              successCount++;
            } else {
              const err = await res.json();
              failed.push(`Failed ${payload.serialNo}: ${err.error || 'unknown error'}`);
            }
          } catch (err) {
            failed.push(`Error ${payload.serialNo}: ${err.message}`);
          }
        }

        await fetchCameras(); // Refresh list

        let msg = `${successCount} camera(s) imported successfully.`;
        if (failed.length > 0) {
          msg += `\n\nFailed entries:\n${failed.join('\n')}`;
        }
        alert(msg);
      } catch (err) {
        alert('Excel processing failed: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

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
            <mark key={i} style={{ backgroundColor: '#fff3cd', padding: '1px 2px' }}>
              {part}
            </mark>
          ) : part
        )}
      </>
    );
  }

  if (loading) return <div className="loading">Loading CCTV cameras...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <div className="header">
        <h1>CCTV Camera Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <label className="action-button" style={{ cursor: 'pointer' }}>
            Import from Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
          <button className="action-button" onClick={openAddModal}>
            Add New Camera
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by Location, IP, Serial, Model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ flex: 1 }}
        />

        <button
  className="action-button"
  onClick={() => setShowFilterPanel(!showFilterPanel)}
  style={{
    backgroundColor: showFilterPanel ? '#64748b' : '#006d77',
    color: 'white',
    minWidth: '110px'
  }}
>
  {showFilterPanel
    ? 'Close Filter'
    : `Filters${getActiveFilterCount() > 0 ? ` (${getActiveFilterCount()})` : ''}`
  }
</button>

        {showFilterPanel && (
          <div className="filter-panel" style={{
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
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Advanced Filters</h3>
              <button onClick={clearFilters} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
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
                  placeholder="e.g. Workstation-3rd"
                />
              </div>

              <div>
                <label className="form-label">Manufacturer</label>
                <input 
                     className='form-input'
                     name='manufacturer'
                     value={filterInputs.manufacturer}
                     onChange={handleFilterChange}
                     placeholder='e.g. Hanwa'
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'space-between', gap:'12px' }}>
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
              <th>SL NO</th>
              <th>Location</th>
              <th>IP Address</th>
              <th>Model No</th>
              <th>Serial No</th>
              <th>Manufacturer</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCameras.map((cam) => (
              <tr
                key={cam.id}
                // onClick={() => openDetailModal(cam)}
                // style={{ cursor: 'pointer' }}
              >
                <td>{cam.id}</td>
                <td><HighlightText text={cam.location} searchTerm={searchTerm} /></td>
                <td><HighlightText text={cam.ip} searchTerm={searchTerm} /></td>
                <td><HighlightText text={cam.model_no} searchTerm={searchTerm} /></td>
                <td><HighlightText text={cam.serial_no} searchTerm={searchTerm} /></td>
                <td>{cam.manufacturer || '—'}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="action-button" onClick={(e) => { e.stopPropagation(); openEditModal(cam); }}>
                      Edit
                    </button>
                    <button
                      className="action-button"
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteCamera(cam.id); }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCameras.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  No cameras found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header-wrapper">
              <h2 className="modal-header">Add New CCTV Camera</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddCamera} className="laptop-form">
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Location <span className="required">*</span></label>
                  <input required name="location" value={formData.location} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">IP Address <span className="required">*</span></label>
                  <input required name="ip" value={formData.ip} onChange={handleInputChange} className="form-input" placeholder="172.30.0.21" />
                </div>
                <div className="form-group">
                  <label className="form-label">Model No <span className="required">*</span></label>
                  <input name="modelNo" value={formData.modelNo} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Serial No <span className="required">*</span></label>
                  <input name="serialNo" value={formData.serialNo} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Manufacturer <span className="required">*</span></label>
                  <input name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} className="form-input" placeholder="Hanwa, Hikvision, etc." />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Camera</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL – almost same as add */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header-wrapper">
              <h2 className="modal-header">Edit Camera – {formData.serialNo || formData.ip}</h2>
              <button className="modal-close-btn" onClick={() => { setShowEditModal(false); resetForm(); }}>×</button>
            </div>

            <form onSubmit={handleEditCamera} className="laptop-form">
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Location <span className="required">*</span></label>
                  <input required name="location" value={formData.location} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">IP Address <span className="required">*</span></label>
                  <input required name="ip" value={formData.ip} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Model No <span className="required">*</span></label>
                  <input name="modelNo" value={formData.modelNo} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Serial No <span className="required">*</span></label>
                  <input name="serialNo" value={formData.serialNo} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Manufacturer <span className="required">*</span></label>
                  <input name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} className="form-input" />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowEditModal(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="btn-primary">Update Camera</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CCTV;