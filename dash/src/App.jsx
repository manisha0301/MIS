import { useState } from 'react';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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