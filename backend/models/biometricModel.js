// backend/models/biometricModel.js
const pool = require('../config/db');

const biometricModel = {
  // Create table
  async createBiometricsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS biometrics (
        id SERIAL PRIMARY KEY,
        reader_id VARCHAR(50) UNIQUE NOT NULL,
        location VARCHAR(255) NOT NULL,
        ip VARCHAR(50) NOT NULL,
        model_no VARCHAR(100) NOT NULL,
        serial_no VARCHAR(100) NOT NULL,
        manufacturer VARCHAR(100) NOT NULL,
        communication_mode VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log('✅ Biometrics table initialized');
  },

  async getAllBiometrics() {
    const result = await pool.query('SELECT * FROM biometrics ORDER BY reader_id');
    return result.rows;
  },

  async getBiometricById(id) {
    const result = await pool.query('SELECT * FROM biometrics WHERE id = $1', [id]);
    return result.rows[0];
  },

  async createBiometric(data) {
    const {
      readerId, location, ip, modelNo,
      serialNo, manufacturer, communicationMode
    } = data;

    const query = `
      INSERT INTO biometrics 
      (reader_id, location, ip, model_no, serial_no, manufacturer, communication_mode)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      readerId, location, ip, modelNo,
      serialNo, manufacturer, communicationMode
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateBiometric(id, data) {
    const {
      readerId, location, ip, modelNo,
      serialNo, manufacturer, communicationMode
    } = data;

    const query = `
      UPDATE biometrics 
      SET reader_id = $1, location = $2, ip = $3, model_no = $4,
          serial_no = $5, manufacturer = $6, communication_mode = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      readerId, location, ip, modelNo,
      serialNo, manufacturer, communicationMode, id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async deleteBiometric(id) {
    const result = await pool.query('DELETE FROM biometrics WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = biometricModel;