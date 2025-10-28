// backend/models/bankModel.js
const pool = require('../config/db');

const createBanksTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS banks (
      id SERIAL PRIMARY KEY,
      bank_name VARCHAR(100) NOT NULL UNIQUE,
      account_no VARCHAR(50),
      ifsc_code VARCHAR(20),
      relationship_manager VARCHAR(100),
      account_name VARCHAR(150),
      account_email VARCHAR(100),
      account_mobile VARCHAR(15),
      branch_name VARCHAR(150),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};

const getAllBanks = async () => {
  const { rows } = await pool.query('SELECT * FROM banks ORDER BY bank_name');
  return rows;
};

const getBankByName = async (bankName) => {
  const { rows } = await pool.query('SELECT * FROM banks WHERE bank_name = $1', [bankName]);
  return rows[0];
};

const createBank = async (data) => {
  const {
    bank_name, account_no, ifsc_code, relationship_manager,
    account_name, account_email, account_mobile, branch_name,
  } = data;
  const query = `
    INSERT INTO banks (bank_name, account_no, ifsc_code, relationship_manager,
                       account_name, account_email, account_mobile, branch_name)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (bank_name) DO UPDATE
    SET account_no = EXCLUDED.account_no,
        ifsc_code = EXCLUDED.ifsc_code,
        relationship_manager = EXCLUDED.relationship_manager,
        account_name = EXCLUDED.account_name,
        account_email = EXCLUDED.account_email,
        account_mobile = EXCLUDED.account_mobile,
        branch_name = EXCLUDED.branch_name
    RETURNING *;
  `;
  const values = [
    bank_name, account_no, ifsc_code, relationship_manager,
    account_name, account_email, account_mobile, branch_name,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

module.exports = {
  createBanksTable,
  getAllBanks,
  getBankByName,
  createBank,
};