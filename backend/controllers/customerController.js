const customerModel = require('../models/customerModel');

const getCustomers = async (req, res) => {
  try {
    const customers = await customerModel.getAllCustomers();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching customers' });
  }
};

const addCustomer = async (req, res) => {
  try {
    const customer = await customerModel.addCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: 'Error adding customer' });
  }
};

module.exports = { getCustomers, addCustomer };