import React, { useEffect, useState } from 'react';
import '../styles/dashboard.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'User' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");

const response = await fetch('http://localhost:5000/api/admin/users', {
  method: 'GET',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
});

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");

const response = await fetch('http://localhost:5000/api/admin/users', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
});

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }
      setNewUser({ name: '', username: '', password: '', role: 'User' });
      setActiveTab('view');
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsers = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");

const response = await fetch('http://localhost:5000/api/admin/users', {
  method: 'DELETE',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
});

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete users');
      }
      setSelectedIds([]);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckbox = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(user => user.id));
    }
  };

  const getRoleBadgeStyle = (role) => {
    return role === 'Admin' 
      ? { backgroundColor: '#005f73', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }
      : { backgroundColor: '#0a9396', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' };
  };

  return (
    <div >
      <div className="header">
        <h1>👥 Administration Panel</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="tab-container">
            <button
              className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
              onClick={() => setActiveTab('view')}
            >
              📋 View Users
            </button>
            <button
              className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              ➕ Create User
            </button>
            <button
              className={`tab-button ${activeTab === 'delete' ? 'active' : ''}`}
              onClick={() => setActiveTab('delete')}
            >
              🗑️ Delete Users
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontWeight: '500'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#64748b',
          fontSize: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          Loading...
        </div>
      )}

      <div className="card">
        {activeTab === 'view' && !loading && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <h2 style={{ color: '#005f73', margin: 0 }}>📊 User Overview</h2>
              <div style={{ 
                backgroundColor: '#f1f5f9', 
                padding: '8px 16px', 
                borderRadius: '20px',
                color: '#005f73',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                Total Users: {users.length}
              </div>
            </div>
            
            {users.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                <h3 style={{ marginBottom: '8px' }}>No users found</h3>
                <p>Create your first user to get started!</p>
              </div>
            ) : (
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Sl. No</th>
                    <th>👤 Name</th>
                    <th>🔖 Username</th>
                    <th style={{ width: '120px' }}>🏷️ Role</th>
                    <th style={{ width: '140px' }}>📅 Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{index + 1}</td>
                      <td style={{ fontWeight: '600', color: '#1e293b' }}>{user.name}</td>
                      <td style={{ fontFamily: 'monospace', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '4px' }}>
                        {user.username}
                      </td>
                      <td>
                        <span style={getRoleBadgeStyle(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'create' && !loading && (
          <div style={{ maxWidth: '95%', margin: '0 auto' }}>
            <div style={{ 
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <h2 style={{ color: '#005f73', margin: 0 }}>➕ Create New User</h2>
              <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '14px' }}>
                Add a new user to the system with the required details below.
              </p>
            </div>

            <div style={{  margin: '0 auto' }}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    👤 Full Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                    placeholder="Enter full name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s ease',
                      backgroundColor: '#f9fafb'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0a9396'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    🔖 Username
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                    placeholder="Enter username"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      transition: 'border-color 0.3s ease',
                      backgroundColor: '#f9fafb'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0a9396'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    🔐 Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    placeholder="Enter password"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s ease',
                      backgroundColor: '#f9fafb'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0a9396'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    🏷️ Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Admin">Super-Admin</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleCreateUser}
                  disabled={loading}
                  className="action-button"
                  style={{
                    padding: '14px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginTop: '8px',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? '⏳ Creating...' : '✅ Create User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delete' && !loading && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <div>
                <h2 style={{ color: '#005f73', margin: 0 }}>🗑️ Delete Users</h2>
                <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '14px' }}>
                  Select users to remove from the system permanently.
                </p>
              </div>
              {selectedIds.length > 0 && (
                <div style={{ 
                  backgroundColor: '#fee2e2', 
                  padding: '8px 16px', 
                  borderRadius: '20px',
                  color: '#dc2626',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {selectedIds.length} selected
                </div>
              )}
            </div>

            {users.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                <h3 style={{ marginBottom: '8px' }}>No users to delete</h3>
                <p>There are no users in the system.</p>
              </div>
            ) : (
              <>
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === users.length && users.length > 0}
                          onChange={selectAll}
                          style={{ transform: 'scale(1.2)' }}
                        />
                      </th>
                      <th style={{ width: '80px' }}>Sl. No</th>
                      <th>👤 Name</th>
                      <th>🔖 Username</th>
                      <th style={{ width: '120px' }}>🏷️ Role</th>
                      <th style={{ width: '140px' }}>📅 Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr 
                        key={user.id} 
                        style={{ 
                          backgroundColor: selectedIds.includes(user.id) ? '#fee2e2' : undefined,
                          opacity: selectedIds.includes(user.id) ? 0.8 : 1
                        }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(user.id)}
                            onChange={() => toggleCheckbox(user.id)}
                            style={{ transform: 'scale(1.2)' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>{index + 1}</td>
                        <td style={{ fontWeight: '600', color: '#1e293b' }}>{user.name}</td>
                        <td style={{ fontFamily: 'monospace', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '4px' }}>
                          {user.username}
                        </td>
                        <td>
                          <span style={getRoleBadgeStyle(user.role)}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ color: '#64748b' }}>
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ 
                  padding: '20px',
                  borderTop: '1px solid #e2e8f0',
                  backgroundColor: '#f9fafb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>
                    {selectedIds.length > 0 
                      ? `${selectedIds.length} user${selectedIds.length > 1 ? 's' : ''} selected for deletion`
                      : 'Select users to delete'
                    }
                  </div>
                  <button
                    onClick={handleDeleteUsers}
                    disabled={selectedIds.length === 0 || loading}
                    style={{
                      backgroundColor: selectedIds.length === 0 || loading ? '#d1d5db' : '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: selectedIds.length === 0 || loading ? 'not-allowed' : 'pointer',
                      opacity: selectedIds.length === 0 || loading ? 0.6 : 1,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? '⏳ Deleting...' : `🗑️ Delete Selected (${selectedIds.length})`}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;