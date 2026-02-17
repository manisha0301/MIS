import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import '../styles/AssetManagement.css';
import API_BASE_URL from '../api/apiConfig';

function Alcatel() {
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

  // Form state – matches Alcatel Phone sheet
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    phoneNo: '',
    manufacturer: '',
    ipAddress: '',
    modelNo: '',
    macNo: '',
  });

  // Fetch all Alcatel records on mount
  useEffect(() => {
    fetchAlcatels();
  }, []);

  const fetchAlcatels = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Please login first');
      }

      const res = await fetch(`${API_BASE_URL}/api/alcatels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired. Please login again.');
        throw new Error('Failed to load Alcatel records');
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

    // Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((d) =>
        d.name?.toLowerCase().includes(term) ||
        d.phone_no?.toLowerCase().includes(term) ||
        d.manufacturer?.toLowerCase().includes(term) ||
        d.ip_address?.toLowerCase().includes(term) ||
        d.model_no?.toLowerCase().includes(term) ||
        d.mac_no?.toLowerCase().includes(term)
      );
    }

    // Advanced filters
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
    setFilterInputs({ manufacturer: '', modelNo: '' });
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
        name: formData.name,
        phoneNo: formData.phoneNo,
        manufacturer: formData.manufacturer,
        ipAddress: formData.ipAddress,
        modelNo: formData.modelNo,
        macNo: formData.macNo,
      };

      const res = await fetch(`${API_BASE_URL}/api/alcatels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to add Alcatel record');

      const newRecord = await res.json();
      setDevices((prev) => [...prev, newRecord]);
      setFilteredDevices((prev) => [...prev, newRecord]);

      resetForm();
      setShowAddModal(false);
      alert('Alcatel phone added successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditDevice = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem('token');
      const payload = {
        name: formData.name,
        phoneNo: formData.phoneNo,
        manufacturer: formData.manufacturer,
        ipAddress: formData.ipAddress,
        modelNo: formData.modelNo,
        macNo: formData.macNo,
      };

      const res = await fetch(`${API_BASE_URL}/api/alcatels/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update Alcatel record');

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

      const res = await fetch(`${API_BASE_URL}/api/alcatels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to delete Alcatel record');

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
      name: '',
      phoneNo: '',
      manufacturer: '',
      ipAddress: '',
      modelNo: '',
      macNo: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (device) => {
    setFormData({
      id: device.id,
      name: device.name,
      phoneNo: device.phone_no,
      manufacturer: device.manufacturer,
      ipAddress: device.ip_address,
      modelNo: device.model_no,
      macNo: device.mac_no,
    });
    setShowEditModal(true);
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Skip header row
      const imported = data.slice(1).map((row) => ({
        name: String(row[1] || ''),           // Column B - Name
        phoneNo: String(row[2] || ''),        // Column C - Phone no.
        manufacturer: String(row[3] || ''),   // Column D - Manufacturer
        ipAddress: String(row[4] || ''),      // Column E - IP Address
        modelNo: String(row[5] || ''),        // Column F - Model No
        macNo: String(row[6] || ''),          // Column G - Mac No
      }));

      try {
        const token = sessionStorage.getItem('token');
        const added = [];

        for (const item of imported) {
          const res = await fetch(`${API_BASE_URL}/api/alcatels`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
          });

          if (!res.ok) {
            console.error(`Failed to import row: ${JSON.stringify(item)}`);
            continue;
          }

          const newRecord = await res.json();
          added.push(newRecord);
        }

        setDevices((prev) => [...prev, ...added]);
        setFilteredDevices((prev) => [...prev, ...added]);
        alert(`Imported ${added.length} Alcatel records successfully!`);
      } catch (err) {
        alert('Error during import: ' + err.message);
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
        <h1>Alcatel Phone Management</h1>
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
          placeholder="Search by Name, Phone No, IP Address, Model, Manufacturer, MAC..."
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
          <div className="filter-panel" style={{
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
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Advanced Filters</h3>
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                Clear all
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label className="form-label">Manufacturer</label>
                <input className="form-input" name="manufacturer" value={filterInputs.manufacturer} onChange={handleFilterChange} placeholder="e.g. Alcatel" />
              </div>
              <div>
                <label className="form-label">Model No</label>
                <input className="form-input" name="modelNo" value={filterInputs.modelNo} onChange={handleFilterChange} placeholder="e.g. H2P" />
              </div>
            </div>

            <div style={{marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'space-between', gap:'12px' }}>
              <button className="btn-secondary" onClick={() => setShowFilterPanel(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={() => { setAppliedFilters({ ...filterInputs }); setShowFilterPanel(false); }}>
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
              <th>Name</th>
              <th>Phone No.</th>
              <th>Manufacturer</th>
              <th>IP Address</th>
              <th>Model No</th>
              <th>Mac No</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device, index) => (
              <tr key={device.id}>
                <td>{index + 1}</td>
                <td><HighlightText text={device.name} searchTerm={searchTerm} /></td>
                <td><HighlightText text={device.phone_no} searchTerm={searchTerm} /></td>
                <td><HighlightText text={device.manufacturer} searchTerm={searchTerm} /></td>
                <td><HighlightText text={device.ip_address} searchTerm={searchTerm} /></td>
                <td><HighlightText text={device.model_no} searchTerm={searchTerm} /></td>
                <td><HighlightText text={device.mac_no} searchTerm={searchTerm} /></td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="action-button" onClick={() => openEditModal(device)}>Edit</button>
                    <button className="action-button" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={() => handleDeleteDevice(device.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDevices.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No records found</td>
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
              <h2 className="modal-header">Add New Alcatel Phone</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddDevice} className="laptop-form">
              <AlcatelFormFields formData={formData} handleInputChange={handleInputChange} />
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
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
              <h2 className="modal-header">Edit Alcatel Phone – {formData.name || formData.phoneNo}</h2>
              <button className="modal-close-btn" onClick={() => { setShowEditModal(false); resetForm(); }}>×</button>
            </div>

            <form onSubmit={handleEditDevice} className="laptop-form">
              <AlcatelFormFields formData={formData} handleInputChange={handleInputChange} />
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowEditModal(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="btn-primary">Update Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable form fields for Alcatel Phones
function AlcatelFormFields({ formData, handleInputChange }) {
  return (
    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div className="form-group">
        <label className="form-label">Name <span className="required">*</span></label>
        <input className="form-input" required name="name" value={formData.name} onChange={handleInputChange} placeholder="Tech Support" />
      </div>

      <div className="form-group">
        <label className="form-label">Phone No. <span className="required">*</span></label>
        <input className="form-input" required name="phoneNo" value={formData.phoneNo} onChange={handleInputChange} placeholder="101" />
      </div>

      <div className="form-group">
        <label className="form-label">Manufacturer</label>
        <input className="form-input" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} placeholder="Alcatel" />
      </div>

      <div className="form-group">
        <label className="form-label">IP Address</label>
        <input className="form-input" name="ipAddress" value={formData.ipAddress} onChange={handleInputChange} placeholder="172.30.0.66" />
      </div>

      <div className="form-group">
        <label className="form-label">Model No</label>
        <input className="form-input" name="modelNo" value={formData.modelNo} onChange={handleInputChange} placeholder="H2P" />
      </div>

      <div className="form-group">
        <label className="form-label">Mac No</label>
        <input className="form-input" name="macNo" value={formData.macNo} onChange={handleInputChange} placeholder="3c:28:a6:03:87:e4" />
      </div>
    </div>
  );
}

export default Alcatel;