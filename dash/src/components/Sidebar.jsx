import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaBox,
  FaUsers,
  FaChartLine,
  FaDollarSign,
  FaFileInvoiceDollar,
  FaUser,
  FaMoneyBillWave,
  FaProjectDiagram,
  FaChevronDown,
  FaPlus,
  FaMinus,
  FaPhone,
  FaPhoneAlt,
  FaPhoneSlash,
  FaPhoneSquareAlt,
  FaPhoneVolume,
} from 'react-icons/fa';
import logo from '../assets/LOGO_KRISTELLAR WHITE.png';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  // Now we store only one active section (or null if all closed)
  const [activeSection, setActiveSection] = useState(null);

  const user = JSON.parse(sessionStorage.getItem("user"));

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleSection = (section) => {
    setActiveSection((prev) => {
      // If clicking the already open section → close it
      if (prev === section) {
        return null;
      }
      // Otherwise open the clicked one (and automatically close others)
      return section;
    });
  };

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
          {/* Dashboard - Direct link, no dropdown */}
          <NavLink
            to="/"
            className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaHome style={{ marginRight: '10px' }} />
            Dashboard
          </NavLink>

          {/* Operations */}
          <div className="sidebar-section">
            <button
              className="sidebar-title"
              onClick={() => toggleSection('operations')}
            >
              <span>Operations</span>
              {activeSection === 'operations' ? (
                <FaMinus className="chevron" />
              ) : (
                <FaPlus className="chevron" />
              )}
            </button>

            {activeSection === 'operations' && (
              <div className="sidebar-dropdown">
                <NavLink
                  to="/products"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaBox style={{ marginRight: '10px' }} />
                  Products
                </NavLink>

                <NavLink
                  to="/customers"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaUsers style={{ marginRight: '10px' }} />
                  Clients / Client Analysis
                </NavLink>

                <NavLink
                  to="/invoices"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaFileInvoiceDollar style={{ marginRight: '10px' }} />
                  Invoices
                </NavLink>
              </div>
            )}
          </div>

          {/* Analytics & Insights */}
          <div className="sidebar-section">
            <button
              className="sidebar-title"
              onClick={() => toggleSection('analytics')}
            >
              <span>Analytics & Insights</span>
              {activeSection === 'analytics' ? (
                <FaMinus className="chevron" />
              ) : (
                <FaPlus className="chevron" />
              )}
            </button>

            {activeSection === 'analytics' && (
              <div className="sidebar-dropdown">
                <NavLink
                  to="/sales-analytics"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaChartLine style={{ marginRight: '10px' }} />
                  Sales Analytics
                </NavLink>

                <NavLink
                  to="/expenditure"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaDollarSign style={{ marginRight: '10px' }} />
                  Expenditure Analysis
                </NavLink>

                <NavLink
                  to="/projects"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaProjectDiagram style={{ marginRight: '10px' }} />
                  Project Analysis
                </NavLink>

                <NavLink
                  to="/revenue"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaMoneyBillWave style={{ marginRight: '10px' }} />
                  Revenue
                </NavLink>
              </div>
            )}
          </div>

          {/* Asset Management */}
          <div className="sidebar-section">
            <button
              className="sidebar-title"
              onClick={() => toggleSection('asset-management')}
            >
              <span>Asset Management</span>
              {activeSection === 'asset-management' ? (
                <FaMinus className="chevron" />
              ) : (
                <FaPlus className="chevron" />
              )}
            </button>

            {activeSection === 'asset-management' && (
              <div className="sidebar-dropdown">
                <NavLink
                  to="/laptop-management"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaChartLine style={{ marginRight: '10px' }} />
                  Laptop Management
                </NavLink>

                <NavLink
                  to="/smart-rack"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaDollarSign style={{ marginRight: '10px' }} />
                  Smart Rack
                </NavLink>

                <NavLink
                  to="/biometric"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaProjectDiagram style={{ marginRight: '10px' }} />
                  Biometric
                </NavLink>

                <NavLink
                  to="/cctv"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaMoneyBillWave style={{ marginRight: '10px' }} />
                  CCTV
                </NavLink>

                <NavLink
                  to="/cug"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaPhoneAlt style={{ marginRight: '10px' }} />
                  CUG Set
                </NavLink>

                <NavLink
                  to="/alcatel"
                  className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FaPhoneVolume style={{ marginRight: '10px' }} />
                  Alcatel Phones
                </NavLink>
              </div>
            )}
          </div>

          {/* Finance Setup - Super-Admin only */}
          {user && user.role === 'Super-Admin' && (
            <div className="sidebar-section">
              <button
                className="sidebar-title"
                onClick={() => toggleSection('finance')}
              >
                <span>Finance Setup</span>
                {activeSection === 'finance' ? (
                  <FaMinus className="chevron" />
                ) : (
                  <FaPlus className="chevron" />
                )}
              </button>

              {activeSection === 'finance' && (
                <div className="sidebar-dropdown">
                  <NavLink
                    to="/bill-expenditure"
                    className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaMoneyBillWave style={{ marginRight: '10px' }} />
                    Beneficiary Bank Information
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* System Administration - Admin & Super-Admin */}
          {user && (user.role === 'Admin' || user.role === 'Super-Admin') && (
            <div className="sidebar-section">
              <button
                className="sidebar-title"
                onClick={() => toggleSection('admin')}
              >
                <span>System Administration</span>
                {activeSection === 'admin' ? (
                  <FaMinus className="chevron" />
                ) : (
                  <FaPlus className="chevron" />
                )}
              </button>

              {activeSection === 'admin' && (
                <div className="sidebar-dropdown">
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser style={{ marginRight: '10px' }} />
                    Admin
                  </NavLink>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;