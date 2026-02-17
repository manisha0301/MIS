// backend/models/cctvModel.js
const pool = require('../config/db');

const cctvModel = {
  // Create table
  async createCctvsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS cctvs (
        id SERIAL PRIMARY KEY,
        location VARCHAR(255) NOT NULL,
        ip VARCHAR(50) NOT NULL,
        model_no VARCHAR(100) NOT NULL,
        serial_no VARCHAR(100) UNIQUE NOT NULL,
        manufacturer VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log('✅ CCTVs table initialized');
  },

  async getAllCctvs() {
    const result = await pool.query('SELECT * FROM cctvs ORDER BY id');
    return result.rows;
  },

  async getCctvById(id) {
    const result = await pool.query('SELECT * FROM cctvs WHERE id = $1', [id]);
    return result.rows[0];
  },

  async createCctv(data) {
    const {
      location, ip, modelNo, serialNo, manufacturer
    } = data;

    const query = `
      INSERT INTO cctvs 
      (location, ip, model_no, serial_no, manufacturer)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      location, ip, modelNo, serialNo, manufacturer
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateCctv(id, data) {
    const {
      location, ip, modelNo, serialNo, manufacturer
    } = data;

    const query = `
      UPDATE cctvs 
      SET location = $1, ip = $2, model_no = $3, serial_no = $4,
          manufacturer = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      location, ip, modelNo, serialNo, manufacturer, id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async deleteCctv(id) {
    const result = await pool.query('DELETE FROM cctvs WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = cctvModel;