const pool = require('../config/db');

const createCustomersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        clientId VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        state VARCHAR(100) NOT NULL,
        contact VARCHAR(15) NOT NULL,
        email VARCHAR(255) NOT NULL,
        gst_number VARCHAR(15) NOT NULL,
        pan_number VARCHAR(10),
        purchase_order_id VARCHAR(50) NOT NULL,
        contract_proof_url TEXT,
        purchase_order_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Customers table created or already exists');
  } catch (error) {
    console.error('Error creating customers table:', error);
  }
};

module.exports = {
  createCustomersTable,
  getAllCustomers: async () => {
    const result = await pool.query('SELECT * FROM customers');
    return result.rows;
  },
  addCustomer: async (customer) => {
    const { 
      clientId, name, address, state, contact, email, 
      gstNumber, panNumber, purchaseOrderId,
      contractProofUrl, purchaseOrderUrl 
    } = customer;
    const result = await pool.query(
      `INSERT INTO customers (
        clientId, name, address, state, contact, email, 
        gst_number, pan_number, purchase_order_id, 
        contract_proof_url, purchase_order_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        clientId, name, address, state, contact, email, 
        gstNumber, panNumber, purchaseOrderId, 
        contractProofUrl, purchaseOrderUrl
      ]
    );
    return result.rows[0];
  },
};