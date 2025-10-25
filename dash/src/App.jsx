import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import CustomerList from './components/CustomerList.jsx';
import SalesAnalytics from './components/SalesAnalytics.jsx';
import ExpenditureDetails from './components/ExpenditureDetails.jsx';
import InvoiceList from './components/InvoiceList.jsx';
import Login from './components/Login.jsx';
import './styles/dashboard.css';
import Admin from './components/Admin.jsx';
import Projects from './components/Projects.jsx';
import ProjectDetails from './components/ProjectDetails.jsx';
import Revenue from './components/Revenue.jsx';
import AddProject from './components/AddProject.jsx';
import BillExpenditure from './components/BillExpenditure.jsx';
import BDExpenditure from './components/BDExpenditure.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ✅ Check token at startup
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Function to handle successful login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      {isAuthenticated ? (
        <div className="app">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<ProductGrid />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/sales-analytics" element={<SalesAnalytics />} />
              <Route path="/expenditure" element={<ExpenditureDetails />} />
              <Route path="/invoices" element={<InvoiceList />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/projects/add" element={<AddProject />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/projects/bdexpenditure/:id" element={<BDExpenditure />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/revenue" element={<Revenue />} />
              <Route path="/bill-expenditure" element={<BillExpenditure />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;