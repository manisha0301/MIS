import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import API_BASE_URL from '../api/apiConfig';
import '../styles/AssetManagement.css';

const excelDateToJSDate = (serial) => {
  if (typeof serial !== 'number') return serial ? String(serial).trim() : null;
  
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  const date = new Date(date_info.getUTCFullYear(), date_info.getUTCMonth(), date_info.getUTCDate());
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

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
    kristellar_ad: '',       // '' = all, 'true', 'false'
    ram: '',
    storage: '',
    purchaseFrom: '',
    purchaseTo: '',
    warrantyFrom: '',
    warrantyTo: '',
    issueFrom: '',
    issueTo: '',
  });

  // Add this new state
  const [appliedFilters, setAppliedFilters] = useState({
    windows: '',
    kristellar_ad: '',
    ram: '',
    storage: '',
    purchaseFrom: '',
    purchaseTo: '',
    warrantyFrom: '',
    warrantyTo: '',
    issueFrom: '',
    issueTo: '',
  });

  // Form state - used for both add and edit
  const [formData, setFormData] = useState({
    id: null,
    employee_id: '',
    name: '',
    windows: '',
    windowsCustom: '',
    kristellar_ad: false,
    serial_number: '',
    model: '',
    cpu: '',
    storage: '',
    storageCustom: '',
    ram: '',
    ramCustom: '',
    gpu: '',
    purchase_date: '',
    warranty_exp_date: '',
    issue_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch laptops from backend
  useEffect(() => {
    const fetchLaptops = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${API_BASE_URL}/api/laptops`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Optional: handle logout / redirect to login
            throw new Error('Session expired. Please log in again.');
          }
          throw new Error('Failed to fetch laptops');
        }

        const data = await response.json();
        console.log("Data: ", data);
        setLaptops(data);
        setFilteredLaptops(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchLaptops();
  }, []);

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = laptops.filter(
      (laptop) =>
        laptop.employee_id?.toLowerCase().includes(term) ||
        laptop.name?.toLowerCase().includes(term) ||
        laptop.serial_number?.toLowerCase().includes(term) ||
        laptop.windows?.toLowerCase().includes(term) ||
        laptop.cpu?.toLowerCase().includes(term) ||
        laptop.storage?.toLowerCase().includes(term) ||
        laptop.ram?.toLowerCase().includes(term) ||
        laptop.gpu?.toLowerCase().includes(term) ||
        laptop.purchase_date?.toLowerCase().includes(term) ||
        laptop.warranty_exp_date?.toLowerCase().includes(term) ||
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
        laptop.employee_id?.toLowerCase().includes(term) ||
        laptop.name?.toLowerCase().includes(term) ||
        laptop.serial_number?.toLowerCase().includes(term) ||
        laptop.model?.toLowerCase().includes(term) ||
        laptop.windows?.toLowerCase().includes(term) ||
        laptop.cpu?.toLowerCase().includes(term) ||
        laptop.gpu?.toLowerCase().includes(term) ||
        laptop.purchase_date?.includes(term) ||
        laptop.issue_date?.toLowerCase().includes(term) ||
        laptop.warranty_exp_date?.includes(term)
      );
    }

    // 2. Advanced filterInputs
    if (appliedFilters.windows) {
      result = result.filter(l => l.windows === appliedFilters.windows);
    }
    if (appliedFilters.kristellar_ad !== '') {
      const value = appliedFilters.kristellar_ad === 'true';
      result = result.filter(l => l.kristellar_ad === value);
    }
    if (appliedFilters.ram) {
      result = result.filter(l => l.ram === appliedFilters.ram);
    }
    if (appliedFilters.storage) {
      result = result.filter(l => l.storage === appliedFilters.storage);
    }
    if (appliedFilters.purchaseFrom) {
      result = result.filter(l => l.purchase_date >= appliedFilters.purchaseFrom);
    }
    if (appliedFilters.purchaseTo) {
      result = result.filter(l => l.purchase_date <= appliedFilters.purchaseTo);
    }
    if (appliedFilters.warrantyFrom) {
      result = result.filter(l => l.warranty_exp_date >= appliedFilters.warrantyFrom);
    }
    if (appliedFilters.warrantyTo) {
      result = result.filter(l => l.warranty_exp_date <= appliedFilters.warrantyTo);
    }
    if (appliedFilters.issueFrom) {
      result = result.filter(l => l.issue_date >= appliedFilters.issueFrom);
    }
    if (appliedFilters.issueTo) {
      result = result.filter(l => l.issue_date <= appliedFilters.issueTo);
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
      kristellar_ad: '',
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

  const prepareEditFormData = (laptop) => {
    if (!laptop) return formData;

    // OS
    let windows = laptop.windows || '';
    let windowsCustom = '';
    const osOptions = [
      'Windows 11 Home', 'Windows 11 Pro', 'Windows 11 pro',
      'Windows 10', 'Ubuntu', 'macOS', 'Linux', 'No OS'
    ];
    if (windows && !osOptions.includes(windows)) {
      windows = 'others';
      windowsCustom = laptop.windows;
    }

    // RAM
    let ram = laptop.ram || '';
    let ramCustom = '';
    const ramOptions = ['8 GB', '16 GB', '24 GB', '32 GB', '64 GB'];
    if (ram && !ramOptions.includes(ram)) {
      ram = 'others';
      ramCustom = laptop.ram;
    }

    // Storage
    let storage = laptop.storage || '';
    let storageCustom = '';
    const storageOptions = ['256 GB', '512 GB', '1 TB', '2 TB'];
    if (storage && !storageOptions.includes(storage)) {
      storage = 'others';
      storageCustom = laptop.storage;
    }

    // Dates → YYYY-MM-DD for <input type="date">
    const purchase_date = formatDateToYYYYMMDD(laptop.purchase_date) || '';
    const warranty_exp_date = formatDateToYYYYMMDD(laptop.warranty_exp_date) || '';
    const issue_date = formatDateToYYYYMMDD(laptop.issue_date) || '';

    return {
      ...laptop,
      windows,
      windowsCustom,
      ram,
      ramCustom,
      storage,
      storageCustom,
      purchase_date,
      warranty_exp_date,
      issue_date,
    };
  };

  // ── ADD ───────────────────────────────────────────────
  const handleAddLaptop = async (e) => {
    e.preventDefault();

    const finalWindows = formData.windows === "others"
    ? (formData.windowsCustom || "Others")
    : formData.windows;
    const finalRam = formData.ram === "others"
    ? (formData.ramCustom || "Others")
    : formData.ram;
    const finalStorage = formData.storage === "others"
    ? (formData.storageCustom || "Others")
    : formData.storage;

    const payload = {
      employeeId: formData.employee_id,
      name: formData.name,
      windows: finalWindows,
      kristellarAD: formData.kristellar_ad,
      serialNumber: formData.serial_number,
      model: formData.model,
      cpu: formData.cpu,
      storage: finalStorage,
      ram: finalRam,
      gpu: formData.gpu,
      purchaseDate: formData.purchase_date || null,
      warrantyExpDate: formData.warranty_exp_date || null,
      issueDate: formData.issue_date || null,
    };

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/laptops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to add laptop');

      const newLaptop = await res.json();
      setLaptops(prev => [...prev, newLaptop]);
      // filters will auto-update via useEffect

      resetForm();
      setShowAddModal(false);
      alert('Laptop added successfully!');
    } catch (err) {
      console.error(err);
      alert('Error adding laptop: ' + err.message);
    }
  };

  // ── EDIT ──────────────────────────────────────────────
  const handleEditLaptop = async (e) => {
    e.preventDefault();

    const finalWindows = formData.windows === "others"
    ? (formData.windowsCustom || "Others")
    : formData.windows;
    const finalRam = formData.ram === "others"
    ? (formData.ramCustom || "Others")
    : formData.ram;
    const finalStorage = formData.storage === "others"
    ? (formData.storageCustom || "Others")
    : formData.storage;

    const payload = {
      employeeId: formData.employee_id,
      name: formData.name,
      windows: finalWindows,
      kristellarAD: formData.kristellar_ad,
      serialNumber: formData.serial_number,
      model: formData.model,
      cpu: formData.cpu,
      storage: finalStorage,
      ram: finalRam,
      gpu: formData.gpu,
      purchaseDate: formData.purchase_date || null,
      warrantyExpDate: formData.warranty_exp_date || null,
      issueDate: formData.issue_date || null,
    };

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/laptops/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update laptop');

      const updatedLaptop = await res.json();

      setLaptops(prev =>
        prev.map(l => (l.id === updatedLaptop.id ? updatedLaptop : l))
      );
      // filters will auto-update

      resetForm();
      setShowEditModal(false);
      alert('Laptop updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error updating laptop: ' + err.message);
    }
  };

  const handleDeleteLaptop = async (id) => {
    if (!window.confirm("Are you sure you want to delete this laptop record?")) return;

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/laptops/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete laptop');

      setLaptops(prev => prev.filter(l => l.id !== id));
      // filters auto-update

      alert("Laptop record deleted successfully.");
    } catch (err) {
      console.error(err);
      alert('Error deleting laptop: ' + err.message);
    }
  };

  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to count how many filters are actually set
  const getActiveFilterCount = () => {
    const filters = appliedFilters;
    let count = 0;

    if (filters.windows) count++;
    if (filters.kristellar_ad !== '') count++;
    if (filters.ram) count++;
    if (filters.storage) count++;
    if (filters.purchaseFrom) count++;
    if (filters.purchaseTo) count++;
    if (filters.warrantyFrom) count++;
    if (filters.warrantyTo) count++;
    if (filters.issueFrom) count++;
    if (filters.issueTo) count++;

    return count;
  };

  const resetForm = () => {
    setFormData({
      id: null,
      employee_id: '',
      name: '',
      windows: '',
      kristellar_ad: false,
      serial_number: '',
      model: '',
      cpu: '',
      storage: '',
      ram: '',
      gpu: '',
      purchase_date: '',
      warranty_exp_date: '',
      issue_date: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (laptop) => {
    setFormData(prepareEditFormData(laptop));
    setShowEditModal(true);
  };

  const openDetailModal = (laptop) => {
    setSelectedLaptop(laptop);
    setShowDetailModal(true);
  };

  const handleImportExcel = async (e) => {
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

        // Map Excel columns → backend payload (camelCase)
        const importedPayloads = data.slice(1)
          .map((row) => ({
            employeeId: String(row[0] || '').trim(),
            name: String(row[1] || '').trim(),
            windows: String(row[2] || '').trim(),
            kristellarAD: row[3] === 'true' || row[3] === true || String(row[3]).toLowerCase() === 'yes',
            serialNumber: String(row[4] || '').trim(),
            model: String(row[5] || '').trim(),
            cpu: String(row[6] || '').trim(),
            storage: String(row[7] || '').trim(),
            ram: String(row[8] || '').trim(),
            gpu: String(row[9] || '').trim(),
            purchaseDate: row[10] ? excelDateToJSDate(row[10]) : null,
            warrantyExpDate: row[11] ? excelDateToJSDate(row[11]) : null,
            issueDate: row[12] ? excelDateToJSDate(row[12]) : null,
          }))
          .filter((p) => p.employeeId && p.name); // skip blank rows

        if (importedPayloads.length === 0) {
          alert('No valid laptop records found in the Excel file.');
          return;
        }

        const token = sessionStorage.getItem('token');
        let successCount = 0;
        let failedCount = 0;
        let failureReasons = [];

        // Import one by one (safe & easy to debug)
        for (const payload of importedPayloads) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/laptops`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });

            if (res.ok) successCount++;
            else {
              failedCount++;
              const errData = await res.json().catch(() => ({}));
              const msg = errData.error || 'Unknown error';
              failureReasons.push(
                `${payload.employeeId || payload.serialNumber || 'row'}: ${msg}`
              );
            }
          } catch (err) {
            failedCount++;
            failureReasons.push(
              `${payload.employeeId || payload.serialNumber || 'row'}: ${err.message}`
            );
          }
        }

        // ── Build user-friendly message ───────────────────────────────
      let message = `Successfully Imported ${successCount} laptop${successCount === 1 ? '' : 's'}.`;

      if (failedCount > 0) {
        message += `\n\n${failedCount} record${failedCount === 1 ? ' was' : 's were'} skipped (already exists or invalid).`;

        if (failureReasons.length > 0 && failureReasons.length <= 8) {
          message += '\n\nDetails:\n' + failureReasons.join('\n');
        } 
      }

      alert(message);

        // Refresh list from database
        if (successCount > 0) {
          const refreshRes = await fetch(`${API_BASE_URL}/api/laptops`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (refreshRes.ok) {
            const freshData = await refreshRes.json();
            setLaptops(freshData);
            setFilteredLaptops(freshData);
          }
        }
      } catch (err) {
        console.error(err);
        alert('Error importing Excel file: ' + err.message);
      }
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

  if (loading) return <div className="loading">Loading laptops...</div>;
  if (error) return <div className="error">Error: {error}</div>;

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
          {showFilterPanel 
            ? 'Close Filter' 
            : `Filters${getActiveFilterCount() > 0 ? ` (${getActiveFilterCount()})` : ''}`
          }
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
                    <option value="Windows 11 Pro">Windows 11 Pro</option>
                    <option value="Windows 10">Windows 10</option>
                    <option value="Ubuntu">Ubuntu</option>
                    <option value="macOS">macOS</option>
                    <option value="Linux">Other Linux</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                {/* Kristellar AD */}
                <div>
                  <label className="form-label">Kristellar AD</label>
                  <select name="kristellar_ad" value={filterInputs.kristellar_ad} onChange={handleFilterChange} className="form-select">
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Issue From</label>
                  <input
                    type="date"
                    name="issueFrom"
                    value={filterInputs.issueFrom}
                    onChange={handleFilterChange}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Issue To</label>
                  <input
                    type="date"
                    name="issueTo"
                    value={filterInputs.issueTo}
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
                  <HighlightText text={laptop.employee_id} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={laptop.name} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={laptop.model || '-'} searchTerm={searchTerm} />
                </td>
                <td>
                  <HighlightText text={laptop.serial_number || '-'} searchTerm={searchTerm} />
                </td>
                <td><HighlightText text={laptop.windows || '-'} searchTerm={searchTerm} /></td>
                <td>{laptop.kristellar_ad ? 'Yes' : 'No'}</td>
                <td>{formatDateToYYYYMMDD(laptop.warranty_exp_date) || '-'}</td>
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
                    <button
                      className="action-button"
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLaptop(laptop.id);
                      }}
                    >
                      Delete
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
              <h2 className="modal-header">Edit Laptop – {formData.employee_id}</h2>
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
              <h2 className="modal-header">Laptop Details</h2>
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
                  <div className="detail-value"><HighlightText text={selectedLaptop.employee_id} searchTerm={searchTerm} /></div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Model</div>
                  <div className="detail-value"><HighlightText text={selectedLaptop.model} searchTerm={searchTerm} /></div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Serial Number</div>
                  <div className="detail-value"><HighlightText text={selectedLaptop.serial_number} searchTerm={searchTerm} /></div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Windows Version</div>
                  <div className="detail-value">{<HighlightText text={selectedLaptop.windows} searchTerm={searchTerm} /> || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Kristellar AD</div>
                  <div className="detail-value">{selectedLaptop.kristellar_ad ? 'Yes' : 'No'}</div>
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
                  <div className="detail-value">{<HighlightText text={formatDateToYYYYMMDD(selectedLaptop.purchase_date)} searchTerm={searchTerm} /> || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Warranty Expiry</div>
                  <div className="detail-value">{<HighlightText text={formatDateToYYYYMMDD(selectedLaptop.warranty_exp_date)} searchTerm={searchTerm} /> || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Issue Date</div>
                  <div className="detail-value">
                    {<HighlightText text={formatDateToYYYYMMDD(selectedLaptop.issue_date)} searchTerm={searchTerm} /> || '—'}
                  </div>
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
            name="employee_id"
            value={formData.employee_id}
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
            OS <span className="required">*</span>
          </label>
          <select
            className="form-select"
            required
            name="windows"
            value={formData.windows}
            onChange={handleInputChange}
          >
            <option value="">Select OS</option>
            <option value="Windows 11 Home">Windows 11 Home</option>
            <option value="Windows 11 Pro">Windows 11 Pro</option>
            <option value="Windows 10">Windows 10</option>
            <option value="Ubuntu">Ubuntu</option>
            <option value="macOS">macOS</option>
            <option value="Linux">Other Linux</option>
            <option value="others">Others</option>
          </select>

          {formData.windows === "others" && (
            <input
              type="text"
              className="form-input"
              name="windowsCustom"
              value={formData.windowsCustom || ""}
              onChange={handleInputChange}
              placeholder="Specify OS (e.g. Fedora 40, Chrome OS...)"
              style={{ marginTop: "8px" }}
              required
            />
          )}
        </div>

        {/* ── RAM with Others ── */}
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
            <option value="64 GB">64 GB</option>
            <option value="others">Others</option>
          </select>

          {formData.ram === "others" && (
            <input
              type="text"
              className="form-input"
              name="ramCustom"
              value={formData.ramCustom || ""}
              onChange={handleInputChange}
              placeholder="e.g. 12 GB, 18 GB..."
              style={{ marginTop: "8px" }}
              required
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Serial Number <span className="required">*</span>
            </label>
          <input
            className="form-input"
            name="serial_number"
            value={formData.serial_number}
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
            name="kristellar_ad"
            value={formData.kristellar_ad}
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
            <option value="1 TB">1 TB</option>
            <option value="2 TB">2 TB</option>
            <option value="others">Others</option>
          </select>

          {formData.storage === "others" && (
            <input
              type="text"
              className="form-input"
              name="storageCustom"
              value={formData.storageCustom || ""}
              onChange={handleInputChange}
              placeholder="e.g. 128 GB, 4 TB..."
              style={{ marginTop: "8px" }}
              required
            />
          )}
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
          name="purchase_date"
          value={formData.purchase_date}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">Warranty Expiry Date</label>
        <input
          type="date"
          className="form-input"
          name="warranty_exp_date"
          value={formData.warranty_exp_date}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">
          Issue Date <span className="required">*</span>
          </label>
        <input
          type="date"
          className="form-input"
          name="issue_date"
          value={formData.issue_date}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}

export default LaptopManagement;