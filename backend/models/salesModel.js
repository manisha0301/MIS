const pool = require('../config/db');

async function createSalesTables() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS sales_quarters (
        id SERIAL PRIMARY KEY,
        quarter TEXT UNIQUE NOT NULL,
        direct_sales NUMERIC NOT NULL,
        institutional_sales NUMERIC NOT NULL,
        channel_sales NUMERIC NOT NULL,
        hit_percentage INTEGER NOT NULL CHECK (hit_percentage BETWEEN 0 AND 100),
        achieved_percentage INTEGER NOT NULL CHECK (achieved_percentage BETWEEN 0 AND 100),
        target NUMERIC NOT NULL,
        forecasted_sales NUMERIC NOT NULL
      );
    `;
    await pool.query(query);
    console.log('Sales tables created or already exist');
  } catch (error) {
    console.error('Error creating sales tables:', error);
    throw error;
  }
}

async function getAllSales() {
  try {
    const { rows } = await pool.query('SELECT * FROM sales_quarters ORDER BY id ASC');
    return rows;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
}

async function addSales(data) {
  const {
    quarter,
    direct_sales,
    institutional_sales,
    channel_sales,
    hit_percentage,
    achieved_percentage,
    target,
    forecasted_sales
  } = data;

  try {
    const query = `
      INSERT INTO sales_quarters (
        quarter, direct_sales, institutional_sales, channel_sales,
        hit_percentage, achieved_percentage, target, forecasted_sales
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      quarter,
      direct_sales,
      institutional_sales,
      channel_sales,
      hit_percentage,
      achieved_percentage,
      target,
      forecasted_sales
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error adding sales data:', error);
    throw error;
  }
}

module.exports = {
  createSalesTables,
  getAllSales,
  addSales
};