import { useState, useRef } from 'react';
import { FaMoneyBillWave, FaEdit, FaTrash } from 'react-icons/fa';
import * as XLSX from 'xlsx';

function ExpenditureDetails() {
  const [expenditureData, setExpenditureData] = useState({
    details: [
      {
        category: 'Rent',
        items: [
          { name: 'Office Lease', amount: 1500000, quarter: 'Mar-May' },
          { name: 'Parking Space', amount: 200000, quarter: 'Mar-May' },
          { name: 'Office Lease', amount: 1550000, quarter: 'Jun-Aug' },
          { name: 'Parking Space', amount: 210000, quarter: 'Jun-Aug' },
          { name: 'Office Lease', amount: 1600000, quarter: 'Sep-Nov' },
          { name: 'Parking Space', amount: 220000, quarter: 'Sep-Nov' },
          { name: 'Office Lease', amount: 1650000, quarter: 'Dec-Feb' },
          { name: 'Parking Space', amount: 230000, quarter: 'Dec-Feb' }
        ]
      },
      {
        category: 'Utilities',
        items: [
          { name: 'Electricity', amount: 50000, quarter: 'Mar-May' },
          { name: 'Water', amount: 15000, quarter: 'Mar-May' },
          { name: 'Internet', amount: 10000, quarter: 'Mar-May' },
          { name: 'Electricity', amount: 52000, quarter: 'Jun-Aug' },
          { name: 'Water', amount: 16000, quarter: 'Jun-Aug' },
          { name: 'Internet', amount: 11000, quarter: 'Jun-Aug' },
          { name: 'Electricity', amount: 53000, quarter: 'Sep-Nov' },
          { name: 'Water', amount: 17000, quarter: 'Sep-Nov' },
          { name: 'Internet', amount: 12000, quarter: 'Sep-Nov' },
          { name: 'Electricity', amount: 54000, quarter: 'Dec-Feb' },
          { name: 'Water', amount: 18000, quarter: 'Dec-Feb' },
          { name: 'Internet', amount: 13000, quarter: 'Dec-Feb' }
        ]
      },
      {
        category: 'Cleaning',
        items: [
          { name: 'Janitorial Services', amount: 30000, quarter: 'Mar-May' },
          { name: 'Cleaning Supplies', amount: 8000, quarter: 'Mar-May' },
          { name: 'Janitorial Services', amount: 31000, quarter: 'Jun-Aug' },
          { name: 'Cleaning Supplies', amount: 8500, quarter: 'Jun-Aug' },
          { name: 'Janitorial Services', amount: 32000, quarter: 'Sep-Nov' },
          { name: 'Cleaning Supplies', amount: 9000, quarter: 'Sep-Nov' },
          { name: 'Janitorial Services', amount: 33000, quarter: 'Dec-Feb' },
          { name: 'Cleaning Supplies', amount: 9500, quarter: 'Dec-Feb' }
        ]
      },
      {
        category: 'Repairs',
        items: [
          { name: 'HVAC Maintenance', amount: 25000, quarter: 'Mar-May' },
          { name: 'Equipment Repairs', amount: 15000, quarter: 'Mar-May' },
          { name: 'HVAC Maintenance', amount: 26000, quarter: 'Jun-Aug' },
          { name: 'Equipment Repairs', amount: 16000, quarter: 'Jun-Aug' },
          { name: 'HVAC Maintenance', amount: 27000, quarter: 'Sep-Nov' },
          { name: 'Equipment Repairs', amount: 17000, quarter: 'Sep-Nov' },
          { name: 'HVAC Maintenance', amount: 28000, quarter: 'Dec-Feb' },
          { name: 'Equipment Repairs', amount: 18000, quarter: 'Dec-Feb' }
        ]
      },
      {
        category: 'Supplies',
        items: Array.from({ length: 100 }, (_, index) => ({
          name: `Office Item ${index + 1}`,
          amount: 5000 + Math.floor(Math.random() * 10000),
          quarter: ['Mar-May', 'Jun-Aug', 'Sep-Nov', 'Dec-Feb'][Math.floor(index / 25)]
        }))
      },
      {
        category: 'Salaries',
        items: [
          { name: 'Employee Salaries', amount: 2500000, quarter: 'Mar-May' },
          { name: 'Bonuses', amount: 500000, quarter: 'Mar-May' },
          { name: 'Employee Salaries', amount: 2550000, quarter: 'Jun-Aug' },
          { name: 'Bonuses', amount: 510000, quarter: 'Jun-Aug' },
          { name: 'Employee Salaries', amount: 2600000, quarter: 'Sep-Nov' },
          { name: 'Bonuses', amount: 520000, quarter: 'Sep-Nov' },
          { name: 'Employee Salaries', amount: 2650000, quarter: 'Dec-Feb' },
          { name: 'Bonuses', amount: 530000, quarter: 'Dec-Feb' }
        ]
      }
    ]
  });
  const [selectedQuarter, setSelectedQuarter] = useState('All Quarters');
  const [editCategory, setEditCategory] = useState(null);
  const [editedItem, setEditedItem] = useState({ name: '', amount: '', quarter: 'Mar-May' });

  const fileInputRef = useRef(null);

  // Filter data based on selected quarter
  const filteredDetails = selectedQuarter === 'All Quarters'
    ? expenditureData.details
    : expenditureData.details.map(category => ({
        category: category.category,
        items: category.items.filter(item => item.quarter === selectedQuarter)
      })).filter(category => category.items.length > 0);

  // Calculate total expenditure for filtered data
  const totalExpenditure = filteredDetails.reduce(
    (sum, category) => sum + category.items.reduce((catSum, item) => catSum + item.amount, 0),
    0
  );

  // Function to handle Excel import
  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel data to expenditureData format and append to existing data
        const existingDetails = [...expenditureData.details];
        const categoryMap = new Map(existingDetails.map(cat => [cat.category, cat.items]));

        jsonData.forEach(row => {
          const category = row.Category;
          const item = {
            name: row.Item,
            amount: parseFloat(String(row.Amount).replace(/₹|,/g, '')) || 0,
            quarter: row.Quarter || 'All Quarters'
          };

          if (categoryMap.has(category)) {
            // Append item to existing category
            categoryMap.get(category).push(item);
          } else {
            // Add new category with item
            categoryMap.set(category, [item]);
          }
        });

        // Convert map back to details array
        const newDetails = Array.from(categoryMap, ([category, items]) => ({
          category,
          items
        }));

        setExpenditureData({ details: newDetails });
      };
      reader.readAsArrayBuffer(file);
      // Reset file input to allow re-importing the same file or multiple files
      event.target.value = null;
    }
  };

  // Function to export all expenditure data
  const exportAllToExcel = () => {
    const data = filteredDetails.flatMap(category =>
      category.items.map(item => ({
        Category: category.category,
        Item: item.name,
        Amount: `₹${item.amount.toLocaleString('en-IN')}`,
        Quarter: item.quarter
      }))
    );
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenditure_Details');
    XLSX.writeFile(workbook, `All_Expenditure_${selectedQuarter}.xlsx`);
  };

  // Handle edit form submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editCategory && editedItem.name && !isNaN(editedItem.amount)) {
      const updatedDetails = expenditureData.details.map(cat =>
        cat.category === editCategory.category
          ? { ...cat, items: cat.items.map(item =>
              item.name === editCategory.item.name ? { ...editedItem, amount: parseFloat(editedItem.amount) } : item
            )}
          : cat
      );
      setExpenditureData({ details: updatedDetails });
      setEditCategory(null);
      setEditedItem({ name: '', amount: '', quarter: 'Mar-May' });
    }
  };

  // Handle delete confirmation
  const handleDelete = (category) => {
    if (window.confirm(`Are you sure you want to delete the ${category.category} category?`)) {
      const updatedDetails = expenditureData.details.filter(cat => cat.category !== category.category);
      setExpenditureData({ details: updatedDetails });
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
          >
            Import from Excel
          </button>
          <button className="action-button" onClick={exportAllToExcel}>
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
          >
            <option value="All Quarters">All Quarters</option>
            <option value="Mar-May">Mar-May</option>
            <option value="Jun-Aug">Jun-Aug</option>
            <option value="Sep-Nov">Sep-Nov</option>
            <option value="Dec-Feb">Dec-Feb</option>
          </select>
        </div>
      </div>
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
                  <FaEdit
                    style={{ cursor: 'pointer', color: '#0a9396', fontSize: '16px' }}
                    onClick={() => {
                      setEditCategory({ category: category.category, item: category.items[0] });
                      setEditedItem({ ...category.items[0] });
                    }}
                  />
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
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item, index) => (
                      <tr
                        key={index}
                        style={{ backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white' }}
                      >
                        <td>{item.name}</td>
                        <td>₹{item.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {editCategory && editCategory.category === category.category && (
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
                        onClick={() => setEditCategory(null)}
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