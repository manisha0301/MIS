// backend/models/billExpenditureModel.js
const pool = require('../config/db');

const createBillExpendituresTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS bill_expenditures (
      id SERIAL PRIMARY KEY,
      transaction_id VARCHAR(50) UNIQUE NOT NULL,
      value_date DATE NOT NULL,
      posted_date DATE NOT NULL,
      cheque_no VARCHAR(50),
      description TEXT NOT NULL,
      cr_dr VARCHAR(2) NOT NULL CHECK (cr_dr IN ('CR','DR')),
      amount NUMERIC(15,2) NOT NULL,
      balance NUMERIC(15,2) NOT NULL,
      category VARCHAR(100),
      bank_id INTEGER REFERENCES banks(id) ON DELETE SET NULL,
      period VARCHAR(7) NOT NULL,   -- YYYY-MM
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};

const getAllTransactions = async ({
  bankId, period, category,
}) => {
  let query = 'SELECT be.*, b.bank_name FROM bill_expenditures be LEFT JOIN banks b ON be.bank_id = b.id';
  const values = [];
  const where = [];

  if (bankId) {
    where.push(`be.bank_id = $${values.length + 1}`);
    values.push(bankId);
  }
  if (period) {
    where.push(`be.period = $${values.length + 1}`);
    values.push(period);
  }
  if (category) {
    // FIXED: Filter by category column, not description
    where.push(`be.category = $${values.length + 1}`);
    values.push(category);
  }

  if (where.length) query += ' WHERE ' + where.join(' AND ');
  query += ' ORDER BY be.value_date DESC, be.id DESC';

  const { rows } = await pool.query(query, values);
  return rows;
};

const bulkInsert = async (records) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertQuery = `
      INSERT INTO bill_expenditures
        (transaction_id, value_date, posted_date, cheque_no, description,
         cr_dr, amount, balance, category, bank_id, period)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (transaction_id) DO NOTHING
      RETURNING id;
    `;

    for (const rec of records) {
      const {
        transaction_id, value_date, posted_date, cheque_no, description,
        cr_dr, amount, balance, category, bank_id, period,
      } = rec;
      await client.query(insertQuery, [
        transaction_id, value_date, posted_date, cheque_no, description,
        cr_dr, amount, balance, category, bank_id, period,
      ]);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = {
  createBillExpendituresTable,
  getAllTransactions,
  bulkInsert,
};