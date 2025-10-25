// Updated invoiceModel.js
const pool = require('../config/db');

const createSalesInvoicesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS sales_invoices (
      id SERIAL PRIMARY KEY,
      number VARCHAR(50) NOT NULL UNIQUE,
      date DATE NOT NULL,
      company VARCHAR(100),
      customer VARCHAR(100) NOT NULL,
      client_id VARCHAR(50) NOT NULL REFERENCES customers(clientId),
      amount DECIMAL(10, 2) NOT NULL,
      gst_percentage DECIMAL(5,2) NOT NULL,
      due_date DATE NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      notes TEXT,
      status VARCHAR(20) NOT NULL CHECK (status IN ('Due', 'Paid')),
      pdf_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Sales invoices table created or already exists');
  } catch (error) {
    console.error('Error creating sales invoices table:', error);
    throw error;
  }
};

const createPurchaseInvoicesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS purchase_invoices (
      id SERIAL PRIMARY KEY,
      number VARCHAR(50) NOT NULL UNIQUE,
      date DATE NOT NULL,
      company VARCHAR(100),
      supplier VARCHAR(100) NOT NULL,
      client_id VARCHAR(50) NOT NULL REFERENCES customers(clientId),
      amount DECIMAL(10, 2) NOT NULL,
      gst_percentage DECIMAL(5,2) NOT NULL,
      tds_percentage DECIMAL(5,2),
      due_date DATE NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      notes TEXT,
      status VARCHAR(20) NOT NULL CHECK (status IN ('Due', 'Paid')),
      pdf_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Purchase invoices table created or already exists');
  } catch (error) {
    console.error('Error creating purchase invoices table:', error);
    throw error;
  }
};

const addSalesInvoice = async (invoice) => {
  const { number, date, company, customer, clientId, amount, gstPercentage, dueDate, paymentMethod, notes, status, pdfUrl } = invoice;
  const query = `
    INSERT INTO sales_invoices (number, date, company, customer, client_id, amount, gst_percentage, due_date, payment_method, notes, status, pdf_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;
  const values = [number, date, company || null, customer, clientId, amount, gstPercentage, dueDate, paymentMethod, notes || null, status, pdfUrl || null];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding sales invoice:', error);
    throw error;
  }
};

const addPurchaseInvoice = async (invoice) => {
  const { number, date, company, supplier, clientId, amount, gstPercentage, tdsPercentage, dueDate, paymentMethod, notes, status, pdfUrl } = invoice;
  const query = `
    INSERT INTO purchase_invoices (number, date, company, supplier, client_id, amount, gst_percentage, tds_percentage, due_date, payment_method, notes, status, pdf_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;
  const values = [number, date, company || null, supplier, clientId, amount, gstPercentage, tdsPercentage || null, dueDate, paymentMethod, notes || null, status, pdfUrl || null];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding purchase invoice:', error);
    throw error;
  }
};

const getSalesInvoices = async () => {
  const query = `
    SELECT 
      si.*,
      c.clientid               AS clientid,
      c.name             AS client_name,
      c.address          AS client_address,
      c.state            AS client_state,
      c.contact          AS client_contact,
      c.email            AS client_email,
      c.gst_number       AS client_gst_number,
      c.pan_number       AS client_pan_number,
      c.purchase_order_id AS client_po_id,
      c.contract_proof_url,
      c.purchase_order_url
    FROM sales_invoices si
    LEFT JOIN customers c ON si.client_id = c.clientId
    ORDER BY si.created_at DESC;
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching sales invoices:', error);
    throw error;
  }
};

const getPurchaseInvoices = async () => {
  const query = `
    SELECT 
      pi.*,
      c.clientid               AS clientid,
      c.name             AS client_name,
      c.address          AS client_address,
      c.state            AS client_state,
      c.contact          AS client_contact,
      c.email            AS client_email,
      c.gst_number       AS client_gst_number,
      c.pan_number       AS client_pan_number,
      c.purchase_order_id AS client_po_id,
      c.contract_proof_url,
      c.purchase_order_url
    FROM purchase_invoices pi
    LEFT JOIN customers c ON pi.client_id = c.clientId
    ORDER BY pi.created_at DESC;
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching purchase invoices:', error);
    throw error;
  }
};

const getSalesInvoiceById = async (id) => {
  const query = `SELECT * FROM sales_invoices WHERE id = $1;`;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching sales invoice by id:', error);
    throw error;
  }
};

const getPurchaseInvoiceById = async (id) => {
  const query = `SELECT * FROM purchase_invoices WHERE id = $1;`;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching purchase invoice by id:', error);
    throw error;
  }
};

const updateSalesInvoiceStatus = async (id, status) => {
  const query = `UPDATE sales_invoices SET status = $1 WHERE id = $2 RETURNING *;`;
  try {
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating sales invoice status:', error);
    throw error;
  }
};

const updatePurchaseInvoiceStatus = async (id, status) => {
  const query = `UPDATE purchase_invoices SET status = $1 WHERE id = $2 RETURNING *;`;
  try {
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating purchase invoice status:', error);
    throw error;
  }
};

const updateSalesInvoicePdf = async (id, pdfUrl) => {
  const query = `UPDATE sales_invoices SET pdf_url = $1 WHERE id = $2 RETURNING *;`;
  try {
    const result = await pool.query(query, [pdfUrl, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating sales invoice PDF:', error);
    throw error;
  }
};

const updatePurchaseInvoicePdf = async (id, pdfUrl) => {
  const query = `UPDATE purchase_invoices SET pdf_url = $1 WHERE id = $2 RETURNING *;`;
  try {
    const result = await pool.query(query, [pdfUrl, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating purchase invoice PDF:', error);
    throw error;
  }
};

module.exports = {
  createSalesInvoicesTable,
  createPurchaseInvoicesTable,
  addSalesInvoice,
  addPurchaseInvoice,
  getSalesInvoices,
  getPurchaseInvoices,
  getSalesInvoiceById,
  getPurchaseInvoiceById,
  updateSalesInvoiceStatus,
  updatePurchaseInvoiceStatus,
  updateSalesInvoicePdf,
  updatePurchaseInvoicePdf,
};