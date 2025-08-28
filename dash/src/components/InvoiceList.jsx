import { useState } from 'react';
import { salesInvoices as initialSalesInvoices, purchaseInvoices as initialPurchaseInvoices } from '/src/data/mockData';


function InvoiceList() {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesInvoices, setSalesInvoices] = useState(initialSalesInvoices);
  const [purchaseInvoices, setPurchaseInvoices] = useState(initialPurchaseInvoices);

  const handleStatusToggle = (id, tab) => {
    if (tab === 'sales') {
      setSalesInvoices(prev => prev.map(inv => 
        inv.id === id ? { ...inv, status: inv.status === 'Paid' ? 'Due' : 'Paid' } : inv
      ));
    } else {
      setPurchaseInvoices(prev => prev.map(inv => 
        inv.id === id ? { ...inv, status: inv.status === 'Paid' ? 'Due' : 'Paid' } : inv
      ));
    }
  };

  const handlePdfUpload = (e, id, tab) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const pdfUrl = URL.createObjectURL(file);
      if (tab === 'sales') {
        setSalesInvoices(prev => prev.map(inv => 
          inv.id === id ? { ...inv, pdfUrl } : inv
        ));
      } else {
        setPurchaseInvoices(prev => prev.map(inv => 
          inv.id === id ? { ...inv, pdfUrl } : inv
        ));
      }
    } else {
      alert('Please upload a PDF file.');
    }
  };

  const openPdf = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="dashboard">
      <h1>Invoices</h1>
      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Invoices
        </button>
        <button
          className={`tab-button ${activeTab === 'purchase' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase')}
        >
          Purchase Invoices
        </button>
      </div>
      {activeTab === 'sales' ? (
        <div>
          <h2>Sales Invoices (Outgoing)</h2>
          {salesInvoices.length > 0 ? (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Invoice Number</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount (₹)</th>
                  <th>Due Date</th>
                  <th>Payment Method</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {salesInvoices.map((invoice, index) => (
                  <tr key={invoice.id}>
                    <td>{index + 1}</td>
                    <td>{invoice.number}</td>
                    <td>{invoice.date}</td>
                    <td>{invoice.customer}</td>
                    <td>₹{invoice.amount.toLocaleString('en-IN')}</td>
                    <td>{invoice.dueDate}</td>
                    <td>{invoice.paymentMethod}</td>
                    <td>{invoice.notes}</td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={invoice.status === 'Paid'}
                          onChange={() => handleStatusToggle(invoice.id, 'sales')}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td>
                      {invoice.pdfUrl ? (
                        <button onClick={() => openPdf(invoice.pdfUrl)} className="action-button">View PDF</button>
                      ) : (
                        <input type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e, invoice.id, 'sales')} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No sales invoices available.</p>
          )}
        </div>
      ) : (
        <div>
          <h2>Purchase Invoices (Incoming)</h2>
          {purchaseInvoices.length > 0 ? (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>SL No</th>
                  <th>Invoice Number</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Amount (₹)</th>
                  <th>Due Date</th>
                  <th>Payment Method</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {purchaseInvoices.map((invoice, index) => (
                  <tr key={invoice.id}>
                    <td>{index + 1}</td>
                    <td>{invoice.number}</td>
                    <td>{invoice.date}</td>
                    <td>{invoice.supplier}</td>
                    <td>₹{invoice.amount.toLocaleString('en-IN')}</td>
                    <td>{invoice.dueDate}</td>
                    <td>{invoice.paymentMethod}</td>
                    <td>{invoice.notes}</td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={invoice.status === 'Paid'}
                          onChange={() => handleStatusToggle(invoice.id, 'purchase')}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td>
                      {invoice.pdfUrl ? (
                        <button onClick={() => openPdf(invoice.pdfUrl)} className="action-button">View PDF</button>
                      ) : (
                        <input type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e, invoice.id, 'purchase')} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No purchase invoices available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default InvoiceList;