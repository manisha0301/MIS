const pool = require('../config/db');

const laptopModel = {
  // Create table
  async createLaptopsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS laptops (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        windows VARCHAR(100),
        kristellar_ad BOOLEAN DEFAULT false,
        serial_number VARCHAR(100),
        model VARCHAR(255),
        cpu VARCHAR(255),
        storage VARCHAR(100),
        ram VARCHAR(100),
        gpu VARCHAR(255),
        purchase_date DATE,
        warranty_exp_date DATE,
        issue_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log('✅ Laptops table initialized');
  },

  async getAllLaptops() {
    const result = await pool.query('SELECT * FROM laptops ORDER BY employee_id');
    return result.rows;
  },

  async getLaptopById(id) {
    const result = await pool.query('SELECT * FROM laptops WHERE id = $1', [id]);
    return result.rows[0];
  },

  async createLaptop(data) {
    const {
      employeeId, name, windows, kristellarAD, serialNumber,
      model, cpu, storage, ram, gpu, purchaseDate, warrantyExpDate, issueDate
    } = data;

    const query = `
      INSERT INTO laptops 
      (employee_id, name, windows, kristellar_ad, serial_number, model, cpu, storage, ram, gpu, 
       purchase_date, warranty_exp_date, issue_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      employeeId, name, windows, kristellarAD, serialNumber,
      model, cpu, storage, ram, gpu, purchaseDate, warrantyExpDate, issueDate
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateLaptop(id, data) {
    const {
      employeeId, name, windows, kristellarAD, serialNumber,
      model, cpu, storage, ram, gpu, purchaseDate, warrantyExpDate, issueDate
    } = data;

    const query = `
      UPDATE laptops 
      SET employee_id = $1, name = $2, windows = $3, kristellar_ad = $4,
          serial_number = $5, model = $6, cpu = $7, storage = $8, ram = $9,
          gpu = $10, purchase_date = $11, warranty_exp_date = $12, issue_date = $13,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `;

    const values = [
      employeeId, name, windows, kristellarAD, serialNumber,
      model, cpu, storage, ram, gpu, purchaseDate, warrantyExpDate, issueDate, id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async deleteLaptop(id) {
    const result = await pool.query('DELETE FROM laptops WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = laptopModel;