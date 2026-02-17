// backend/models/cugModel.js
const pool = require('../config/db');

const cugModel = {
  // Create table
  async createCugsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS cugs (
        id SERIAL PRIMARY KEY,
        model_no VARCHAR(100) NOT NULL,
        contact_no VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        manufacturer VARCHAR(100) NOT NULL,
        imei1 VARCHAR(100),
        imei2 VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log('✅ CUGs table initialized');
  },

  async getAllCugs() {
    const result = await pool.query('SELECT * FROM cugs ORDER BY contact_no');
    return result.rows;
  },

  async getCugById(id) {
    const result = await pool.query('SELECT * FROM cugs WHERE id = $1', [id]);
    return result.rows[0];
  },

  async createCug(data) {
    const {
      modelNo, contactNo, name, manufacturer, imei1, imei2
    } = data;

    const query = `
      INSERT INTO cugs 
      (model_no, contact_no, name, manufacturer, imei1, imei2)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      modelNo, contactNo, name, manufacturer, imei1 || null, imei2 || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateCug(id, data) {
    const {
      modelNo, contactNo, name, manufacturer, imei1, imei2
    } = data;

    const query = `
      UPDATE cugs 
      SET model_no = $1, contact_no = $2, name = $3, manufacturer = $4,
          imei1 = $5, imei2 = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      modelNo, contactNo, name, manufacturer, imei1 || null, imei2 || null, id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async deleteCug(id) {
    const result = await pool.query('DELETE FROM cugs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = cugModel;