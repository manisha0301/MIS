const pool = require('../config/db');

const ExpenditureModel = {
  async createExpendituresTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS expenditures (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        item_name VARCHAR(100) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        quarter VARCHAR(20) NOT NULL
      );
    `;
    try {
      await pool.query(query);
      console.log('Expenditures table created or already exists');
    } catch (error) {
      console.error('Error creating expenditures table:', error);
      throw error;
    }
  },

  async getAllExpenditures(quarter = 'All Quarters') {
    try {
      const query = quarter === 'All Quarters'
        ? 'SELECT * FROM expenditures '
        : 'SELECT * FROM expenditures WHERE quarter = $1';
      const result = await pool.query(query, quarter === 'All Quarters' ? [] : [quarter]);
      // Group by category
      const grouped = result.rows.reduce((acc, row) => {
        const { id, category, item_name, amount, quarter } = row;
        const existingCategory = acc.find(cat => cat.category === category);
        if (existingCategory) {
          existingCategory.items.push({ id, name: item_name, amount: parseFloat(amount), quarter });
        } else {
          acc.push({
            category,
            items: [{ id, name: item_name, amount: parseFloat(amount), quarter }]
          });
        }
        return acc;
      }, []);
      return grouped;
    } catch (error) {
      console.error('Error fetching expenditures:', error);
      throw error;
    }
  },

  async addExpenditures(expenditures) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const query = `
        INSERT INTO expenditures (category, item_name, amount, quarter)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      for (const expenditure of expenditures) {
        await client.query(query, [
          expenditure.category,
          expenditure.item_name,
          expenditure.amount,
          expenditure.quarter
        ]);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding expenditures:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateExpenditure(id, updatedItem) {
    const query = `
      UPDATE expenditures
      SET item_name = $1, amount = $2, quarter = $3
      WHERE id = $4  
      RETURNING *;
    `;
    try {
      const result = await pool.query(query, [
        updatedItem.name,
        updatedItem.amount,
        updatedItem.quarter,
        id
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating expenditure:', error);
      throw error;
    }
  },

  async deleteCategory(category) {
    const query = 'DELETE FROM expenditures WHERE category = $1';
    try {
      await pool.query(query, [category]);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

module.exports = ExpenditureModel;