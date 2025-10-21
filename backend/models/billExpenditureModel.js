const pool = require('../config/db');

const billExpenditureModel = {
  async createBillExpendituresTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS bill_expenditures (
        id SERIAL PRIMARY KEY,
        transaction_id VARCHAR(50) NOT NULL,
        value_date DATE,
        posted_date TIMESTAMP,
        cheque_no VARCHAR(50),
        description TEXT,
        cr_dr VARCHAR(2),
        amount DECIMAL(15, 2),
        balance DECIMAL(15, 2),
        bank_details JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    try {
      await pool.query(query);
      console.log('Bill Expenditures table created or already exists');
    } catch (error) {
      console.error('Error creating bill_expenditures table:', error);
      throw error;
    }
  },

  async importTransactions(transactions) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const query = `
        INSERT INTO bill_expenditures (
          transaction_id, value_date, posted_date, cheque_no, description, cr_dr, amount, balance, bank_details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
      `;
      for (const transaction of transactions) {
        const values = [
          transaction.transactionId,
          transaction.valueDate || null,
          transaction.postedDate || null,
          transaction.chequeNo || '-',
          transaction.description || '',
          transaction.crDr || '',
          transaction.amount || 0,
          transaction.balance || 0,
          transaction.bankDetails || {}
        ];
        await client.query(query, values);
      }
      await client.query('COMMIT');
      return { message: 'Transactions imported successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error importing transactions:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async getAllTransactions() {
    const query = 'SELECT * FROM bill_expenditures ORDER BY created_at DESC';
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  async updateBankDetails(transactionId, bankDetails) {
    const query = `
      UPDATE bill_expenditures
      SET bank_details = $1
      WHERE id = $2
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [bankDetails, transactionId]);
      if (result.rows.length === 0) {
        throw new Error('Transaction not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error updating bank details:', error);
      throw error;
    }
  }
};

module.exports = billExpenditureModel;