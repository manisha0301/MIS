const ExpenditureModel = require('../models/expenditureModel');
const XLSX = require('xlsx');

const ExpenditureController = {
  async getExpenditures(req, res) {
    try {
      const quarter = req.query.quarter || 'All Quarters';
      const expenditures = await ExpenditureModel.getAllExpenditures(quarter);
      res.json({ details: expenditures });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching expenditures' });
    }
  },

  async importExpenditures(req, res) {
    try {
      const data = req.body;
      const expenditures = data.flatMap(category =>
        category.items.map(item => ({
          category: category.category,
          item_name: item.name,
          amount: parseFloat(String(item.amount).replace(/₹|,/g, '')) || 0,
          quarter: item.quarter || 'All Quarters'
        }))
      );
      await ExpenditureModel.addExpenditures(expenditures);
      res.json({ message: 'Expenditures imported successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error importing expenditures' });
    }
  },

  async exportExpenditures(req, res) {
    try {
      const quarter = req.query.quarter || 'All Quarters';
      const expenditures = await ExpenditureModel.getAllExpenditures(quarter);
      const data = expenditures.flatMap(category =>
        category.items.map(item => ({
          Category: category.category,
          Item: item.name,
          Amount: `₹${item.amount.toLocaleString('en-IN')}`,
          Quarter: item.quarter
        }))
      );
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenditure_Details');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', `attachment; filename=Expenditure_${quarter}.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: 'Error exporting expenditures' });
    }
  },

  async updateExpenditure(req, res) {
    try {
      const { id, updatedItem } = req.body;
      const result = await ExpenditureModel.updateExpenditure(id, updatedItem);
      if (result) {
        res.json({ message: 'Expenditure updated successfully' });
      } else {
        res.status(404).json({ error: 'Expenditure not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating expenditure' });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { category } = req.params;
      await ExpenditureModel.deleteCategory(category);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting category' });
    }
  }
};

module.exports = ExpenditureController;