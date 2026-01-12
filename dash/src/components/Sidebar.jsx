import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBox, FaUsers, FaChartLine, FaDollarSign, FaFileInvoiceDollar, FaUser, FaMoneyBillWave, FaProjectDiagram, } from 'react-icons/fa';
import logo from '../assets/LOGO_KRISTELLAR WHITE.png';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));

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
            <FaUsers style={{ marginRight: '8px' }} /> Client Analysis
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
            <FaDollarSign style={{ marginRight: '8px' }} /> Expenditure Analysis
          </NavLink>
          <NavLink
            to="/invoices"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaFileInvoiceDollar style={{ marginRight: '8px' }} /> Invoices
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaProjectDiagram style={{ marginRight: '8px' }} /> Project Analysis
          </NavLink>
          <NavLink
            to="/revenue"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaMoneyBillWave style={{ marginRight: '8px' }} /> Revenue
          </NavLink>
          {user && (user.role === 'Super-Admin') && (
          <NavLink
            to="/bill-expenditure"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaMoneyBillWave style={{ marginRight: '8px' }} /> Beneficiary Bank Information
          </NavLink>
          )}
          {user && (user.role === 'Admin' || user.role === 'Super-Admin') && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaUser style={{ marginRight: '8px' }} /> Admin
          </NavLink>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;