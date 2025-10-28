// backend/controllers/bankController.js
const bankModel = require('../models/bankModel');

const getBanks = async (req, res) => {
  try {
    const banks = await bankModel.getAllBanks();
    res.json(banks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
};

const getBankDetails = async (req, res) => {
  const { bankName } = req.params;
  try {
    const bank = await bankModel.getBankByName(bankName);
    if (!bank) return res.status(404).json({ error: 'Bank not found' });
    res.json(bank);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const addBank = async (req, res) => {
  const data = req.body;
  try {
    const bank = await bankModel.createBank(data);
    res.status(201).json(bank);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add bank' });
  }
};

module.exports = { getBanks, getBankDetails, addBank };