const pool = require('../config/db');

const createProductsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Products table created or already exists');
  } catch (error) {
    console.error('Error creating products table:', error);
  } 
};

module.exports = {
  createProductsTable,
  getAllProducts: async () => {
    const result = await pool.query('SELECT * FROM products');
    return result.rows;
  },
  addProduct: async (product) => {
    const { name, price, description, image } = product;
    const result = await pool.query(
      'INSERT INTO products (name, price, description, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, description, image]
    );
    return result.rows[0];
  },
};