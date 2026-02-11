import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import API_BASE_URL from '../api/apiConfig';

function LaptopManagement() {
  const [laptops, setLaptops] = useState([]);
  const [filteredLaptops, setFilteredLaptops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterInputs, setFilterInputs] = useState({
    windows: '',
    kristellarAD: '',       // '' = all, 'true', 'false'
    ram: '',
    storage: '',
    purchaseFrom: '',
    purchaseTo: '',
    warrantyFrom: '',
    warrantyTo: '',
  });

  // Add this new state
  const [appliedFilters, setAppliedFilters] = useState({
    windows: '',
    kristellarAD: '',
    ram: '',
    storage: '',
    purchaseFrom: '',
    purchaseTo: '',
    warrantyFrom: '',
    warrantyTo: '',
  });

  // Form state - used for both add and edit
  const [formData, setFormData] = useState({
    id: null,
    employeeId: '',
    name: '',
    windows: '',
    kristellarAD: false,
    serialNumber: '',
    model: '',
    cpu: '',
    storage: '',
    ram: '',
    gpu: '',
    purchaseDate: '',
    warrantyExpDate: '',
  });

  // Dummy data
  useEffect(() => {
    const dummyData = [
      {
        id: 1,
        employeeId: 'KA002',
        name: 'Satyajit Panda',
        windows: 'Windows 11 pro',
        kristellarAD: true,
        serialNumber: 'T5NRCX01B22119B',
        model: 'ROG Zephyrus G14 GA403UM_GA403UM',
        cpu: 'AMD Ryzen 9 270 w/ Radeon 780M Graphics',
        storage: '953.86 GB',
        ram: '15.29 GB',
        gpu: 'NVIDIA GeForce RTX 5060 Laptop GPU',
        purchaseDate: '2024-05-15',
        warrantyExpDate: '2027-05-14',
      },
      {
        id: 2,
        employeeId: 'KA003',
        name: 'Neha Kathar',
        windows: 'Windows 11 pro',
        kristellarAD: true,
        serialNumber: 'S4NRKD030555167',
        model: 'ASUS TUF Gaming F15 FX507VV_FX507VV',
        cpu: '13th Gen Intel(R) Core(TM) i7-13620H',
        storage: '476.94 GB',
        ram: '15.63 GB',
        gpu: 'NVIDIA GeForce RTX 4060 Laptop GPU',
        purchaseDate: '2024-06-10',
        warrantyExpDate: '2027-06-09',
      },
      {
        id: 3,
        employeeId: 'KA012',
        name: 'Ayushi Shrivas',
        windows: 'Windows 11 pro',
        kristellarAD: true,
        serialNumber: '5CD35145PN',
        model: 'HP Spectre x360 2-in-1 Laptop 14-eu0xxx',
        cpu: 'Intel(R) Core(TM) Ultra 7 155H',
        storage: '953.86 GB',
        ram: '31.37 GB',
        gpu: 'Intel(R) Arc(TM) Graphics',
        purchaseDate: '2025-01-20',
        warrantyExpDate: '2028-01-19',
      },
    ];
    setLaptops(dummyData);
    setFilteredLaptops(dummyData);
  }, []);

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = laptops.filter(
      (laptop) =>
        laptop.employeeId?.toLowerCase().includes(term) ||
        laptop.name?.toLowerCase().includes(term) ||
        laptop.serialNumber?.toLowerCase().includes(term) ||
        laptop.windows?.toLowerCase().includes(term) ||
        laptop.cpu?.toLowerCase().includes(term) ||
        laptop.storage?.toLowerCase().includes(term) ||
        laptop.ram?.toLowerCase().includes(term) ||
        laptop.gpu?.toLowerCase().includes(term) ||
        laptop.purchaseDate?.toLowerCase().includes(term) ||
        laptop.warrantyExpDate?.toLowerCase().includes(term) ||
        laptop.model?.toLowerCase().includes(term)
    );
    setFilteredLaptops(filtered);
  }, [searchTerm, laptops]);

  useEffect(() => {
    let result = [...laptops];

    // 1. Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(laptop =>
        laptop.employeeId?.toLowerCase().includes(term) ||
        laptop.name?.toLowerCase().includes(term) ||
        laptop.serialNumber?.toLowerCase().includes(term) ||
        laptop.model?.toLowerCase().includes(term) ||
        laptop.windows?.toLowerCase().includes(term) ||
        laptop.cpu?.toLowerCase().includes(term) ||
        laptop.gpu?.toLowerCase().includes(term) ||
        laptop.purchaseDate?.includes(term) ||
        laptop.warrantyExpDate?.includes(term)
      );
    }

    // 2. Advanced filterInputs
    if (appliedFilters.windows) {
      result = result.filter(l => l.windows === appliedFilters.windows);
    }
    if (appliedFilters.kristellarAD !== '') {
      const value = appliedFilters.kristellarAD === 'true';
      result = result.filter(l => l.kristellarAD === value);
    }
    if (appliedFilters.ram) {
      result = result.filter(l => l.ram === appliedFilters.ram);
    }
    if (appliedFilters.storage) {
      result = result.filter(l => l.storage === appliedFilters.storage);
    }
    if (appliedFilters.purchaseFrom) {
      result = result.filter(l => l.purchaseDate >= appliedFilters.purchaseFrom);
    }
    if (appliedFilters.purchaseTo) {
      result = result.filter(l => l.purchaseDate <= appliedFilters.purchaseTo);
    }
    if (appliedFilters.warrantyFrom) {
      result = result.filter(l => l.warrantyExpDate >= appliedFilters.warrantyFrom);
    }
    if (appliedFilters.warrantyTo) {
      result = result.filter(l => l.warrantyExpDate <= appliedFilters.warrantyTo);
    }

    setFilteredLaptops(result);
  }, [searchTerm, laptops, appliedFilters]);

  // ── Filter handlers ───────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterInputs(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilterInputs({
      windows: '',
      kristellarAD: '',
      ram: '',
      storage: '',
      purchaseFrom: '',
      purchaseTo: '',
      warrantyFrom: '',
      warrantyTo: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ── ADD ───────────────────────────────────────────────
  const handleAddLaptop = (e) => {
    e.preventDefault();

    const newLaptop = {
      id: laptops.length + 1,
      ...formData,
      kristellarAD: formData.kristellarAD === 'true' || formData.kristellarAD === true,
    };

    setLaptops((prev) => [...prev, newLaptop]);
    setFilteredLaptops((prev) => [...prev, newLaptop]);

    resetForm();
    setShowAddModal(false);
    alert('Laptop added successfully!');
  };

  // ── EDIT ──────────────────────────────────────────────
  const handleEditLaptop = (e) => {
    e.preventDefault();

    const updatedLaptop = {
      ...formData,
      kristellarAD: formData.kristellarAD === 'true' || formData.kristellarAD === true,
    };

    setLaptops((prev) =>
      prev.map((l) => (l.id === updatedLaptop.id ? updatedLaptop : l))
    );
    setFilteredLaptops((prev) =>
      prev.map((l) => (l.id === updatedLaptop.id ? updatedLaptop : l))
    );

    resetForm();
    setShowEditModal(false);
    alert('Laptop updated successfully!');
  };

  const resetForm = () => {
    setFormData({
      id: null,
      employeeId: '',
      name: '',
      windows: '',
      kristellarAD: false,
      serialNumber: '',
      model: '',
      cpu: '',
      storage: '',
      ram: '',
      gpu: '',
      purchaseDate: '',
      warrantyExpDate: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (laptop) => {
    setFormData({ ...laptop });
    setShowEditModal(true);
  };

  const openDetailModal = (laptop) => {
    setSelectedLaptop(laptop);
    setShowDetailModal(true);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const importedLaptops = data.slice(1).map((row, index) => ({
        id: laptops.length + index + 1,
        employeeId: row[0] || '',
        name: row[1] || '',
        windows: row[2] || '',
        kristellarAD: row[3] === 'true' || row[3] === true,
        serialNumber: row[4] || '',
        model: row[5] || '',
        cpu: row[6] || '',
        storage: row[7] || '',
        ram: row[8] || '',
        gpu: row[9] || '',
        purchaseDate: row[10] || '',
        warrantyExpDate: row[11] || '',
      }));

      setLaptops((prev) => [...prev, ...importedLaptops]);
      setFilteredLaptops((prev) => [...prev, ...importedLaptops]);
      alert(`Imported ${importedLaptops.length} laptop records successfully!`);
    };
    reader.readAsBinaryString(file);
  };

  // Helper to highlight search term in text
  function HighlightText({ text, searchTerm }) {
    if (!searchTerm || !text) return <>{text || ''}</>;

    const term = searchTerm.toLowerCase();
    const value = String(text);

    if (!value.toLowerCase().includes(term)) {
      return <>{value}</>;
    }

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
        <h1>Laptop Management</h1>
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
            Add New Laptop
          </button>
        </div>
      </div>

      {/* Search + Filter Row */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'center',
        position: 'relative'
      }}>
        <input
          type="text"
          placeholder="Search by Employee ID, Name, Serial, Model..."
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
          {showFilterPanel ? 'Close Filter' : 'Filters'}
        </button>

        {/* Filter Panel */}
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
              width: '500px',
              zIndex: 100,
              marginTop: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Advanced Filters</h3>
              <button
                onClick={clearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Clear all
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Windows */}
                <div>
                  <label className="form-label">Windows Version</label>
                  <select name="windows" value={filterInputs.windows} onChange={handleFilterChange} className="form-select">
                    <option value="">All</option>
                    <option value="Windows 11 Home">Windows 11 Home</option>
                    <option value="Windows 11 pro">Windows 11 Pro</option>
                    <option value="Windows 11 Enterprise">Windows 11 Enterprise</option>
                    <option value="Windows 10 Pro">Windows 10 Pro</option>
                    <option value="Windows 10 Enterprise">Windows 10 Enterprise</option>
                    <option value="No OS">No OS / Linux</option>
                  </select>
                </div>

                {/* Kristellar AD */}
                <div>
                  <label className="form-label">Kristellar AD</label>
                  <select name="kristellarAD" value={filterInputs.kristellarAD} onChange={handleFilterChange} className="form-select">
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* RAM */}
                <div>
                  <label className="form-label">RAM</label>
                  <select name="ram" value={filterInputs.ram} onChange={handleFilterChange} className="form-select">
                    <option value="">All</option>
                    <option value="8 GB">8 GB</option>
                    <option value="16 GB">16 GB</option>
                    <option value="24 GB">24 GB</option>
                    <option value="32 GB">32 GB</option>
                    <option value="7.69 GB">~8 GB (7.69 GB)</option>
                    <option value="15.26 GB">~16 GB (15.26 GB)</option>
                    <option value="15.63 GB">~16 GB (15.63 GB)</option>
                    <option value="31.37 GB">~32 GB (31.37 GB)</option>
                  </select>
                </div>

                {/* Storage */}
                <div>
                  <label className="form-label">Storage</label>
                  <select name="storage" value={filterInputs.storage} onChange={handleFilterChange} className="form-select">
                    <option value="">All</option>
                    <option value="256 GB">256 GB</option>
                    <option value="512 GB">512 GB</option>
                    <option value="476.94 GB">~500 GB (476.94 GB)</option>
                    <option value="953.86 GB">~1 TB (953.86 GB)</option>
                    <option value="1 TB">1 TB</option>
                    <option value="2 TB">2 TB</option>
                  </select>
                </div>
              </div>

              {/* Date ranges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Purchase From</label>
                  <input
                    type="date"
                    name="purchaseFrom"
                    value={filterInputs.purchaseFrom}
                    onChange={handleFilterChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Purchase To</label>
                  <input
                    type="date"
                    name="purchaseTo"
                    value={filterInputs.purchaseTo}
                    onChange={handleFilterChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Warranty From</label>
                  <input
                    type="date"
                    name="warrantyFrom"
                    value={filterInputs.warrantyFrom}
                    onChange={handleFilterChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Warranty To</label>
                  <input
                    type="date"
                    name="warrantyTo"
                    value={filterInputs.warrantyTo}
                    onChange={handleFilterChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'space-between' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowFilterPanel(false)}
                style={{ marginRight: '12px' }}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setAppliedFilters({ ...filterInputs });   // ← this is the key line
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
              <th>Employee ID</th>
              <th>Name</th>
              <th>Model</th>
              <th>Serial Number</th>
              <th>Windows</th>
              <th>Kristellar AD</th>
              <th>Warranty Expiry</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLaptops.map((laptop) => (
              <tr
                key={laptop.id}
                onClick={() => openDetailModal(laptop)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <HighlightText text={laptop.employeeId} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={laptop.name} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={laptop.model || '-'} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={laptop.serialNumber || '-'} searchTerm={searchTerm} />
                </td>
                <td><HighlightText text={laptop.windows || '-'} searchTerm={searchTerm} /></td>
                <td>{laptop.kristellarAD ? 'Yes' : 'No'}</td>
                <td>{laptop.warrantyExpDate || '-'}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="action-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailModal(laptop);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="action-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(laptop);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLaptops.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  No laptops found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── ADD MODAL ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '820px', width: '92%' }}>
            <div className="modal-header-wrapper">
              <h2 className="modal-header">Add New Laptop Assignment</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddLaptop} className="laptop-form">
              <LaptopFormFields formData={formData} handleInputChange={handleInputChange} />
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Laptop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ────────────────────────────────────── */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '820px', width: '92%' }}>
            <div className="modal-header-wrapper">
              <h2 className="modal-header">Edit Laptop – {formData.employeeId}</h2>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditLaptop} className="laptop-form">
              <LaptopFormFields formData={formData} handleInputChange={handleInputChange} />
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Laptop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal remains the same */}
      {showDetailModal && selectedLaptop && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px', width: '92%' }}>
            <div className="modal-header-wrapper">
              <h2 className="modal-header">Laptop Details – {selectedLaptop.employeeId}</h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowDetailModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Employee Name</div>
                  <div className="detail-value"><HighlightText text={selectedLaptop.name} searchTerm={searchTerm} /></div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Employee ID</div>
                  <div className="detail-value"><HighlightText text={selectedLaptop.employeeId} searchTerm={searchTerm} /></div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Model</div>
                  <div className="detail-value"><HighlightText text={selectedLaptop.model} searchTerm={searchTerm} /></div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Serial Number</div>
                  <div className="detail-value"><HighlightText text={selectedLaptop.serialNumber} searchTerm={searchTerm} /></div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Windows Version</div>
                  <div className="detail-value">{<HighlightText text={selectedLaptop.windows} searchTerm={searchTerm} /> || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Kristellar AD</div>
                  <div className="detail-value">{selectedLaptop.kristellarAD ? 'Yes' : 'No'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Processor</div>
                  <div className="detail-value">{<HighlightText text={selectedLaptop.cpu} searchTerm={searchTerm} /> || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">RAM</div>
                  <div className="detail-value">{selectedLaptop.ram || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Storage</div>
                  <div className="detail-value">{selectedLaptop.storage || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">GPU</div>
                  <div className="detail-value">{<HighlightText text={selectedLaptop.gpu} searchTerm={searchTerm} /> || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Purchase Date</div>
                  <div className="detail-value">{<HighlightText text={selectedLaptop.purchaseDate} searchTerm={searchTerm} /> || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Warranty Expiry</div>
                  <div className="detail-value">{<HighlightText text={selectedLaptop.warrantyExpDate} searchTerm={searchTerm} /> || '—'}</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style >{`
      .modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  width: 92%;
  max-width: 820px;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
}

.modal-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 12px 12px 0 0;
}

.modal-header {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  font-weight: 300;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
  padding: 0 8px;
}

.modal-close-btn:hover {
  color: #ef4444;
}

.laptop-form {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
}

.form-input,
.form-select {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #ffffff;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.03);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary {
  background-color: #006d77;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 6px;
  font-size: 0.98rem;
  font-weight: 600;
  cursor: pointer;
  min-width: 140px;
}

.btn-primary:hover {
  background-color: #118ab2;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #475569;
  border: none;
  padding: 12px 28px;
  border-radius: 6px;
  font-size: 0.98rem;
  font-weight: 600;
  cursor: pointer;
  min-width: 140px;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

.required {
  color: #ef4444;
  font-weight: 600;
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

        .modal-body {
  padding: 24px 28px;
  background: #ffffff;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px 32px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.detail-value {
  font-size: 1.05rem;
  color: #1e293b;
  line-height: 1.4;
  word-break: break-word;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 28px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 0 0 12px 12px;
}

/* Optional: make long values look better */
.detail-value:empty::before {
  content: "—";
  color: #94a3b8;
}
  mark {
  background-color: #fff3cd !important;
  color: #856404;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 500;
}

/* Optional: more modern highlight style */
mark {
  background: linear-gradient(120deg, #ffecb3 0%, #ffecb3 100%);
  background-repeat: no-repeat;
  background-size: 100% 30%;
  background-position: 0 70%;
  padding: 0 2px;
  border-radius: 2px;
}
  
      `}</style>
    </div>
  );
}

// ── Reusable Form Fields Component ───────────────────────────────
function LaptopFormFields({ formData, handleInputChange }) {
  return (
    <div className="form-grid">
      {/* Column 1 */}
      <div className="form-column">
        <div className="form-group">
          <label className="form-label">
            Employee ID <span className="required">*</span>
          </label>
          <input
            className="form-input"
            required
            name="employeeId"
            value={formData.employeeId}
            onChange={handleInputChange}
            placeholder="KA001"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Model</label>
          <input
            className="form-input"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            placeholder="e.g. ASUS TUF Gaming F15 FX507VV"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Windows Version <span className="required">*</span>
          </label>
          <select
            className="form-select"
            required
            name="windows"
            value={formData.windows}
            onChange={handleInputChange}
          >
            <option value="">Select Windows Version</option>
            <option value="Windows 11 Home">Windows 11 Home</option>
            <option value="Windows 11 Pro">Windows 11 Pro</option>
            <option value="Windows 11 Enterprise">Windows 11 Enterprise</option>
            <option value="Windows 10 Pro">Windows 10 Pro</option>
            <option value="Windows 10 Enterprise">Windows 10 Enterprise</option>
            <option value="No OS">No OS / Linux</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            RAM <span className="required">*</span>
          </label>
          <select
            className="form-select"
            required
            name="ram"
            value={formData.ram}
            onChange={handleInputChange}
          >
            <option value="">Select RAM</option>
            <option value="8 GB">8 GB</option>
            <option value="16 GB">16 GB</option>
            <option value="24 GB">24 GB</option>
            <option value="32 GB">32 GB</option>
            <option value="7.69 GB">~8 GB (7.69 GB)</option>
            <option value="15.26 GB">~16 GB (15.26 GB)</option>
            <option value="15.63 GB">~16 GB (15.63 GB)</option>
            <option value="31.37 GB">~32 GB (31.37 GB)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Serial Number</label>
          <input
            className="form-input"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleInputChange}
            placeholder="e.g. S4NRKD030555167"
          />
        </div>
      </div>

      {/* Column 2 */}
      <div className="form-column">
        <div className="form-group">
          <label className="form-label">
            Employee Name <span className="required">*</span>
          </label>
          <input
            className="form-input"
            required
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">CPU / Processor</label>
          <input
            className="form-input"
            name="cpu"
            value={formData.cpu}
            onChange={handleInputChange}
            placeholder="e.g. Intel Core i7-13620H"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Kristellar AD</label>
          <select
            className="form-select"
            name="kristellarAD"
            value={formData.kristellarAD}
            onChange={handleInputChange}
          >
            <option value={false}>No</option>
            <option value={true}>Yes</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Storage <span className="required">*</span>
          </label>
          <select
            className="form-select"
            required
            name="storage"
            value={formData.storage}
            onChange={handleInputChange}
          >
            <option value="">Select Storage</option>
            <option value="256 GB">256 GB</option>
            <option value="512 GB">512 GB</option>
            <option value="476.94 GB">476.94 GB (~500 GB)</option>
            <option value="953.86 GB">953.86 GB (~1 TB)</option>
            <option value="1 TB">1 TB</option>
            <option value="2 TB">2 TB</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">GPU</label>
          <input
            className="form-input"
            name="gpu"
            value={formData.gpu}
            onChange={handleInputChange}
            placeholder="e.g. NVIDIA GeForce RTX 4060 Laptop GPU"
          />
        </div>
      </div>

      {/* Full width fields */}
      <div className="form-group full-width">
        <label className="form-label">Date of Purchase</label>
        <input
          type="date"
          className="form-input"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">Warranty Expiry Date</label>
        <input
          type="date"
          className="form-input"
          name="warrantyExpDate"
          value={formData.warrantyExpDate}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}

export default LaptopManagement;