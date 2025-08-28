import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from '/src/components/Dashboard.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import CustomerList from './components/CustomerList.jsx';
import SalesAnalytics from './components/SalesAnalytics.jsx';
import ExpenditureDetails from './components/ExpenditureDetails.jsx';
import InvoiceList from './components/InvoiceList.jsx';
import './styles/dashboard.css';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;