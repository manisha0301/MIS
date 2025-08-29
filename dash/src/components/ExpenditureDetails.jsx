import { useState, useEffect, useRef } from 'react';
import { FaMoneyBillWave, FaEdit, FaTrash } from 'react-icons/fa';
import * as XLSX from 'xlsx';

function ExpenditureDetails() {
  const [expenditureData, setExpenditureData] = useState({ details: [] });
  const [selectedQuarter, setSelectedQuarter] = useState('All Quarters');
  const [editItem, setEditItem] = useState(null);
  const [editedItem, setEditedItem] = useState({ id: '', name: '', amount: '', quarter: 'Mar-May' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch expenditure data from backend
  const fetchExpenditures = async (quarter = 'All Quarters') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/expenditures?quarter=${quarter}`);
      if (!response.ok) throw new Error('Failed to fetch expenditures');
      const data = await response.json();
      setExpenditureData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refetch when quarter changes
  useEffect(() => {
    fetchExpenditures(selectedQuarter);
  }, [selectedQuarter]);

  // Filter data for display (client-side fallback if needed)
  const filteredDetails = expenditureData.details.filter(category => 
    category.items.length > 0
  );

  // Calculate total expenditure for filtered data
  const totalExpenditure = filteredDetails.reduce(
    (sum, category) => sum + category.items.reduce((catSum, item) => catSum + item.amount, 0),
    0
  );

  // Handle Excel import
  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Map Excel data to expenditureData format
          const categoryMap = new Map();
          jsonData.forEach(row => {
            const category = row.Category;
            const item = {
              name: row.Item,
              amount: parseFloat(String(row.Amount).replace(/₹|,/g, '')) || 0,
              quarter: row.Quarter || 'All Quarters'
            };
            if (categoryMap.has(category)) {
              categoryMap.get(category).items.push(item);
            } else {
              categoryMap.set(category, { category, items: [item] });
            }
          });
          const newDetails = Array.from(categoryMap.values());

          // Send to backend
          const response = await fetch('http://localhost:5000/api/expenditures/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDetails)
          });
          if (!response.ok) throw new Error('Failed to import expenditures');
          await fetchExpenditures(selectedQuarter); // Refresh data
        } catch (err) {
          setError(err.message);
        }
      };
      reader.readAsArrayBuffer(file);
      event.target.value = null; // Reset file input
    }
  };

  // Handle Excel export
  const exportAllToExcel = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/expenditures/export?quarter=${selectedQuarter}`);
      if (!response.ok) throw new Error('Failed to export expenditures');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Expenditure_${selectedQuarter}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editItem && editedItem.name && !isNaN(editedItem.amount)) {
      try {
        const response = await fetch('http://localhost:5000/api/expenditures', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editedItem.id,
            updatedItem: { ...editedItem, amount: parseFloat(editedItem.amount) }
          })
        });
        if (!response.ok) throw new Error('Failed to update expenditure');
        await fetchExpenditures(selectedQuarter); // Refresh data
        setEditItem(null);
        setEditedItem({ id: '', name: '', amount: '', quarter: 'Mar-May' });
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Handle delete confirmation
  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete the ${category.category} category?`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/expenditures/${encodeURIComponent(category.category)}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete category');
        await fetchExpenditures(selectedQuarter); // Refresh data
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="header" style={{ padding: '12px' }}>
        <h1 style={{ fontSize: '24px' }}>Expenditure Details</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="action-button"
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
          >
            Import from Excel
          </button>
          <button
            className="action-button"
            onClick={exportAllToExcel}
            disabled={loading}
          >
            Export Expenditure Report
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx, .xls"
            onChange={handleImportExcel}
          />
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            style={{
              padding: '6px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#1e293b'
            }}
            disabled={loading}
          >
            <option value="All Quarters">All Quarters</option>
            <option value="Mar-May">Mar-May</option>
            <option value="Jun-Aug">Jun-Aug</option>
            <option value="Sep-Nov">Sep-Nov</option>
            <option value="Dec-Feb">Dec-Feb</option>
          </select>
        </div>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}
      <div className="grid">
        <div className="card kpi-card">
          <h2>Total Expenditure</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FaMoneyBillWave className="icon" />
            <p>₹{totalExpenditure.toLocaleString('en-IN')}</p>
          </div>
        </div>
        {filteredDetails.length > 0 ? (
          filteredDetails.map(category => (
            <div key={category.category} className="card" style={{ height: '300px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h2>{category.category}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <FaTrash
                    style={{ cursor: 'pointer', color: '#797979ff', fontSize: '16px' }}
                    onClick={() => handleDelete(category)}
                  />
                </div>
              </div>
              <div className="customer-list" style={{ minHeight: '150px', height: 'calc(100% - 50px)' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item, index) => (
                      <tr
                        key={item.id}
                        style={{ backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white' }}
                      >
                        <td>{item.name}</td>
                        <td>₹{item.amount.toLocaleString('en-IN')}</td>
                        <td>
                          <FaEdit
                            style={{ cursor: 'pointer', color: '#0a9396', fontSize: '16px' }}
                            onClick={() => {
                              setEditItem({...item, category: category.category });
                              setEditedItem({ id: item.id, name: item.name, amount: item.amount, quarter: item.quarter });
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {editItem && editItem.category === category.category && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <form onSubmit={handleEditSubmit} style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                    <h3>Edit Item</h3>
                    <input
                      type="text"
                      value={editedItem.name}
                      onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                      placeholder="Item Name"
                      style={{ margin: '10px 0', padding: '5px', width: '100%' }}
                    />
                    <input
                      type="number"
                      value={editedItem.amount}
                      onChange={(e) => setEditedItem({ ...editedItem, amount: e.target.value })}
                      placeholder="Amount"
                      style={{ margin: '10px 0', padding: '5px', width: '100%' }}
                    />
                    <select
                      value={editedItem.quarter}
                      onChange={(e) => setEditedItem({ ...editedItem, quarter: e.target.value })}
                      style={{ margin: '10px 0', padding: '5px', width: '100%' }}
                    >
                      <option value="Mar-May">Mar-May</option>
                      <option value="Jun-Aug">Jun-Aug</option>
                      <option value="Sep-Nov">Sep-Nov</option>
                      <option value="Dec-Feb">Dec-Feb</option>
                    </select>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" style={{ padding: '5px 10px', background: '#0a9396', color: 'white', border: 'none' }}>
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditItem(null)}
                        style={{ padding: '5px 10px', background: '#aecfeeff', color: 'white', border: 'none' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No expenditure data available for the selected quarter.</p>
        )}
      </div>
    </div>
  );
}

export default ExpenditureDetails;