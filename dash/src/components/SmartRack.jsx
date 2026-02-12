import { useEffect, useState } from 'react';
import '../styles/AssetManagement.css';
import * as XLSX from 'xlsx';

function SmartRack() {
  const [activeTab, setActiveTab] = useState('servers');
  const [searchTerm, setSearchTerm] = useState('');

  // All data
  const [allData, setAllData] = useState({
    servers: [
      {
        id: 1,
        serverName: '',
        makeModel: 'HPE DL380 Gen 11',
        logicalProcessors: 64,
        processorType: 'Intel(R) Xeon(R) Gold 6242 CPU @ 2.80GHz',
        sockets: 2,
        coresPerSocket: 16,
        memory: '255.54GB',
        vmCount: 10,
      },
      {
        id: 2,
        serverName: '',
        makeModel: 'Proliant DL380 Gen10 Plus',
        logicalProcessors: 48,
        processorType: 'Intel(R) Xeon(R) Silver 4310 CPU @ 2.10GHz',
        sockets: 2,
        coresPerSocket: 12,
        memory: '511.7 GB',
        vmCount: 25,
      },
      {
        id: 3,
        serverName: '',
        makeModel: 'HPE ProLiant DL360 Gen11',
        logicalProcessors: 64,
        processorType: 'INTEL(R) XEON(R) SILVER 4514Y',
        sockets: 2,
        coresPerSocket: 16,
        memory: '511.7 GB',
        vmCount: 18,
      },
    ],
    storage: [
      {
        id: 1,
        storageName: '',
        makeModel: 'HPE MSA 2062 SAN Storage',
        controller: 'Dual Controller, 16Gb Fibre Channel',
        installedDisks: '6 × 1.92 TB SAS SSD (RI SFF)',
        usableCapacity: 'Approx. 11.5 TB (before RAID)',
        connectivity: '16Gb FC SFP Modules',
      },
    ],
    switches: [
      {
        id: 1,
        layer: 'L3',
        makeModel: 'HPE Aruba CX 6300F (JL668A)',
        ports: '24 × 1GbE RJ45 + 4 × SFP56',
        uplinks: '10G SFP+ SR (300m, MMF)',
      },
      {
        id: 2,
        layer: 'L2',
        makeModel: 'HPE Aruba Instant On 1930',
        ports: '24 × 1GbE PoE+',
        uplinks: '4 × SFP / SFP+',
      },
    ],
    firewalls: [
      {
        id: 1,
        name: '',
        makeModel: 'FortiGate 60F',
        throughput: '~10 Gbps',
        vpnSupport: 'IPSec & SSL VPN',
        cloudManagement: 'FortiCloud',
      },
    ],
  });

  const [filteredData, setFilteredData] = useState({ ...allData });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  // Asset configuration (matches Excel columns)
  const assetConfigs = {
    servers: {
      title: 'Servers',
      fields: [
        { name: 'serverName', label: 'Server Name', type: 'text' },
        { name: 'makeModel', label: 'Make & Model', type: 'text' },
        { name: 'logicalProcessors', label: 'Logical Processors', type: 'number' },
        { name: 'processorType', label: 'Processor Type', type: 'text' },
        { name: 'sockets', label: 'Sockets', type: 'number' },
        { name: 'coresPerSocket', label: 'Core Per Sockets', type: 'number' },
        { name: 'memory', label: 'Memory', type: 'text' },
        { name: 'vmCount', label: 'No. of VM Created', type: 'number' },
      ],
    },
    storage: {
      title: 'Storage',
      fields: [
        { name: 'storageName', label: 'Storage Name', type: 'text' },
        { name: 'makeModel', label: 'Make & Model', type: 'text' },
        { name: 'controller', label: 'Controller', type: 'text' },
        { name: 'installedDisks', label: 'Installed Disks', type: 'text' },
        { name: 'usableCapacity', label: 'Usable Capacity', type: 'text' },
        { name: 'connectivity', label: 'Connectivity', type: 'text' },
      ],
    },
    switches: {
      title: 'Switches',
      fields: [
        { name: 'layer', label: 'Layer', type: 'text' },
        { name: 'makeModel', label: 'Make & Model', type: 'text' },
        { name: 'ports', label: 'Ports', type: 'text' },
        { name: 'uplinks', label: 'Uplinks', type: 'text' },
      ],
    },
    firewalls: {
      title: 'Firewalls',
      fields: [
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'makeModel', label: 'Make & Model', type: 'text' },
        { name: 'throughput', label: 'Firewall Throughput', type: 'text' },
        { name: 'vpnSupport', label: 'VPN Support', type: 'text' },
        { name: 'cloudManagement', label: 'Cloud Management', type: 'text' },
      ],
    },
  };

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const currentItems = allData[activeTab] || [];

    const filtered = currentItems.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(term)
      )
    );

    setFilteredData((prev) => ({ ...prev, [activeTab]: filtered }));
  }, [searchTerm, allData, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    const config = assetConfigs[activeTab];
    const newForm = { id: null };
    config.fields.forEach((f) => {
      newForm[f.name] = f.type === 'number' ? 0 : '';
    });
    setFormData(newForm);
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setFormData({ ...item });
    setShowEditModal(true);
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newItem = {
      ...formData,
      id: Date.now(),
    };

    setAllData((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newItem],
    }));

    setShowAddModal(false);
    alert(`${assetConfigs[activeTab].title.slice(0, -1)} added successfully!`);
  };

  const handleEdit = (e) => {
    e.preventDefault();

    setAllData((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((item) =>
        item.id === formData.id ? formData : item
      ),
    }));

    setShowEditModal(false);
    alert(`${assetConfigs[activeTab].title.slice(0, -1)} updated successfully!`);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    setAllData((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((item) => item.id !== id),
    }));
  };

  // ── Excel Import ───────────────────────────────────────────────
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      // Convert sheet to JSON, using first row as headers
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (data.length < 2) {
        alert('Excel file is empty or has no data rows.');
        return;
      }

      const headers = data[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g, '')); // normalize
      const rows = data.slice(1);

      const config = assetConfigs[activeTab];
      const fieldNames = config.fields.map(f => f.name);

      // Try to map columns by fuzzy/similar name matching
      const columnMap = {};
      fieldNames.forEach((field) => {
        const bestMatch = headers.findIndex(h =>
          h.includes(field.toLowerCase()) ||
          field.toLowerCase().includes(h)
        );
        if (bestMatch !== -1) {
          columnMap[field] = bestMatch;
        }
      });

      if (Object.keys(columnMap).length === 0) {
        alert('Could not match any columns in the Excel file.\n\nMake sure column names are similar to:\n' +
          config.fields.map(f => `• ${f.label}`).join('\n'));
        return;
      }

      const importedItems = rows
        .filter(row => row.some(cell => cell !== '' && cell != null)) // skip empty rows
        .map((row, index) => {
          const item = { id: Date.now() + index };
          fieldNames.forEach((field) => {
            const colIndex = columnMap[field];
            if (colIndex !== undefined && row[colIndex] != null) {
              let value = row[colIndex];
              // Convert numbers properly
              if (config.fields.find(f => f.name === field)?.type === 'number') {
                value = Number(value);
                if (isNaN(value)) value = 0;
              }
              item[field] = value;
            }
          });
          return item;
        });

      if (importedItems.length === 0) {
        alert('No valid rows found in the Excel file.');
        return;
      }

      setAllData((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], ...importedItems],
      }));

      alert(`Imported ${importedItems.length} ${assetConfigs[activeTab].title.toLowerCase()} successfully!`);
    };

    reader.readAsBinaryString(file);
    e.target.value = ''; // reset input
  };

  const currentConfig = assetConfigs[activeTab];
  const currentItems = filteredData[activeTab] || [];

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Smart Rack Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <label className="action-button" style={{ cursor: 'pointer' }}>
            Import {currentConfig.title} from Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
        <button className="action-button" onClick={openAddModal}>
          Add New {currentConfig.title.slice(0, -1)}
        </button>
        </div>
      </div>


      {/* Search */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder={`Search ${currentConfig.title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ width: '100%', maxWidth: '100%' }}
        />
      </div>
      {/* Tabs */}
      <div 
        className="tabs"
        style={{
            display: 'flex',
            gap: '4px',           // ← adjust this value (8px, 12px, 16px etc.)
            flexWrap: 'wrap',      // optional: good on small screens
        }}>
        {Object.entries(assetConfigs).map(([key, config]) => (
          <button
            key={key}
            className={`tab-button ${activeTab === key ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(key);
              setSearchTerm('');
            }}
          >
            {config.title}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="invoice-table">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              {currentConfig.fields.map((field) => (
                <th key={field.name}>{field.label}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => openDetailModal(item)}
                style={{ cursor: 'pointer' }}
              >
                <td>{index + 1}</td>
                {currentConfig.fields.map((field) => (
                  <td key={field.name}>{item[field.name] || '-'}</td>
                ))}
                <td onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="action-button"
                      onClick={() => openDetailModal(item)}
                    >
                      View
                    </button>
                    <button
                      className="action-button"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-button"
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={currentConfig.fields.length + 2} style={{ textAlign: 'center', padding: '20px' }}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header-wrapper">
              <h2>Add New {currentConfig.title.slice(0, -1)}</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdd} className='laptop-form'>
              <div className="form-grid">
                {currentConfig.fields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="form-label">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header-wrapper">
              <h2>Edit {currentConfig.title.slice(0, -1)}</h2>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEdit} className='laptop-form'>
              <div className="form-grid">
                {currentConfig.fields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="form-label">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px', width: '92%' }}>
            <div className="modal-header-wrapper">
              <h2>{currentConfig.title.slice(0, -1)} Details</h2>
              <button className="modal-close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className='modal-body'>
                <div className="detail-grid">
                {currentConfig.fields.map((field) => (
                    <div key={field.name} className="detail-item">
                    <div className="detail-label">{field.label}</div>
                    <div className="detail-value">{selectedItem[field.name] || '—'}</div>
                    </div>
                ))}
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

export default SmartRack;