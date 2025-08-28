const pool = require('../config/db');

const createCustomersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id BIGINT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(15) NOT NULL,
        state VARCHAR(100) NOT NULL,
        total_purchases DECIMAL(10, 2) DEFAULT 0.00,
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
  // Additional model methods
  getAllCustomers: async () => {
    const result = await pool.query('SELECT * FROM customers');
    return result.rows;
  },
  addCustomer: async (customer) => {
    const { id, name, contact, state, totalPurchases } = customer;
    const result = await pool.query(
      'INSERT INTO customers (id, name, contact, state, total_purchases) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, name, contact, state, totalPurchases]
    );
    return result.rows[0];
  },
};