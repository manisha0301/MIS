// backend/models/alcatelModel.js
const pool = require('../config/db');

const alcatelModel = {
  // Create table
  async createAlcatelsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS alcatels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone_no VARCHAR(50) UNIQUE NOT NULL,
        manufacturer VARCHAR(100) NOT NULL,
        ip_address VARCHAR(50) UNIQUE NOT NULL,
        model_no VARCHAR(100),
        mac_no VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log('✅ Alcatels table initialized');
  },

  async getAllAlcatels() {
    const result = await pool.query('SELECT * FROM alcatels ORDER BY phone_no');
    return result.rows;
  },

  async getAlcatelById(id) {
    const result = await pool.query('SELECT * FROM alcatels WHERE id = $1', [id]);
    return result.rows[0];
  },

  async createAlcatel(data) {
    const {
      name, phoneNo, manufacturer, ipAddress, modelNo, macNo
    } = data;

    const query = `
      INSERT INTO alcatels 
      (name, phone_no, manufacturer, ip_address, model_no, mac_no)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      name, phoneNo, manufacturer, ipAddress, modelNo || null, macNo || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateAlcatel(id, data) {
    const {
      name, phoneNo, manufacturer, ipAddress, modelNo, macNo
    } = data;

    const query = `
      UPDATE alcatels 
      SET name = $1, phone_no = $2, manufacturer = $3, ip_address = $4,
          model_no = $5, mac_no = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      name, phoneNo, manufacturer, ipAddress, modelNo || null, macNo || null, id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async deleteAlcatel(id) {
    const result = await pool.query('DELETE FROM alcatels WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = alcatelModel;