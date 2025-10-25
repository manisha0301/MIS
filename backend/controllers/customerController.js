const customerModel = require('../models/customerModel');
const fs = require('fs');
const path = require('path');

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
    const { clientId, name, address, state, contact, email, gstNumber, panNumber, purchaseOrderId, totalPurchases } = req.body;

    // req.files is an object: { contractProof: [file], purchaseOrder: [file] }
    const contractProofFile = req.files?.contractProof?.[0];
    const purchaseOrderFile = req.files?.purchaseOrder?.[0];

    // Validate required fields
    if (!clientId || !name || !address || !state || !contact || !email || !gstNumber || !purchaseOrderId || !contractProofFile || !purchaseOrderFile) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const customer = {
      id: null,  // will be auto-generated
      clientId,
      name,
      address,
      state,
      contact,
      email,
      gstNumber,
      panNumber,
      purchaseOrderId,
      totalPurchases: parseFloat(totalPurchases) || 0.00,
      contractProofUrl: contractProofFile
        ? `/uploads/contracts/${contractProofFile.filename}`
        : null,
      purchaseOrderUrl: purchaseOrderFile
        ? `/uploads/purchaseorders/${purchaseOrderFile.filename}`
        : null
    };

    const result = await customerModel.addCustomer(customer);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(400).json({ error: 'Error adding customer' });
  }
};

module.exports = { getCustomers, addCustomer };