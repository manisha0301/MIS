const pool = require('../config/db');

const createInvoicesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL CHECK (type IN ('sales', 'purchase')),
      number VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      company VARCHAR(100),
      customer VARCHAR(100),
      supplier VARCHAR(100),
      amount DECIMAL(10, 2) NOT NULL,
      due_date DATE NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      notes TEXT,
      status VARCHAR(20) NOT NULL CHECK (status IN ('Due', 'Paid')),
      pdf_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT check_customer_supplier CHECK (
        (type = 'sales' AND customer IS NOT NULL AND supplier IS NULL) OR
        (type = 'purchase' AND supplier IS NOT NULL AND customer IS NULL)
      )
    );
  `;
  try {
    await pool.query(query);
    console.log('Invoices table created or already exists');
  } catch (error) {
    console.error('Error creating invoices table:', error);
    throw error;
  }
};

const addInvoice = async (invoice) => {
  const { type, number, date, company, customer, supplier, amount, dueDate, paymentMethod, notes, status, pdfUrl } = invoice;
  const query = `
    INSERT INTO invoices (type, number, date, company, customer, supplier, amount, due_date, payment_method, notes, status, pdf_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;
  const values = [type, number, date, company, customer || null, supplier || null, amount, dueDate, paymentMethod, notes || null, status, pdfUrl || null];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding invoice:', error);
    throw error;
  }
};

const getInvoices = async (type) => {
  const query = `SELECT * FROM invoices WHERE type = $1 ORDER BY created_at DESC;`;
  try {
    const result = await pool.query(query, [type]);
    return result.rows;
  } catch (error) {
    console.error(`Error fetching ${type} invoices:`, error);
    throw error;
  }
};

const updateInvoiceStatus = async (id, status) => {
  const query = `UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *;`;
  try {
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
};

const updateInvoicePdf = async (id, pdfUrl) => {
  const query = `UPDATE invoices SET pdf_url = $1 WHERE id = $2 RETURNING *;`;
  try {
    const result = await pool.query(query, [pdfUrl, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating invoice PDF:', error);
    throw error;
  }
};

module.exports = {
  createInvoicesTable,
  addInvoice,
  getInvoices,
  updateInvoiceStatus,
  updateInvoicePdf,
};