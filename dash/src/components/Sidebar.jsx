import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBox, FaUsers, FaChartLine, FaDollarSign, FaTachometerAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import logo from '../assets/logo.png';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="hamburger" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" />
        </div>
        <div className="sidebar-nav">
          <NavLink
            to="/"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaHome style={{ marginRight: '8px' }} /> Dashboard
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaBox style={{ marginRight: '8px' }} /> Products
          </NavLink>
          <NavLink
            to="/customers"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaUsers style={{ marginRight: '8px' }} /> Customers
          </NavLink>
          <NavLink
            to="/sales-analytics"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaChartLine style={{ marginRight: '8px' }} /> Sales Analytics
          </NavLink>
          <NavLink
            to="/expenditure"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaDollarSign style={{ marginRight: '8px' }} /> Expenditure
          </NavLink>
          <NavLink
            to="/invoices"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaFileInvoiceDollar style={{ marginRight: '8px' }} /> Invoices
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaUsers style={{ marginRight: '8px' }} /> Admin
          </NavLink>
          <NavLink
            // to="/admin"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => {
  sessionStorage.clear();
  window.location.href = "/";
}}
          >
            <FaUsers style={{ marginRight: '8px' }} /> Logout
          </NavLink>
        </div>
      </div>
    </>
  );
}

export default Sidebar;