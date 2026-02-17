// backend/controllers/biometricController.js
const biometricModel = require('../models/biometricModel');

const getAllBiometrics = async (req, res) => {
  try {
    const biometrics = await biometricModel.getAllBiometrics();
    res.json(biometrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch biometrics' });
  }
};

const getBiometricById = async (req, res) => {
  try {
    const biometric = await biometricModel.getBiometricById(req.params.id);
    if (!biometric) return res.status(404).json({ error: 'Biometric device not found' });
    res.json(biometric);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch biometric device' });
  }
};

const createBiometric = async (req, res) => {
  try {
    const biometric = await biometricModel.createBiometric(req.body);
    res.status(201).json(biometric);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const updateBiometric = async (req, res) => {
  try {
    const biometric = await biometricModel.updateBiometric(req.params.id, req.body);
    if (!biometric) return res.status(404).json({ error: 'Biometric device not found' });
    res.json(biometric);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteBiometric = async (req, res) => {
  try {
    const biometric = await biometricModel.deleteBiometric(req.params.id);
    if (!biometric) return res.status(404).json({ error: 'Biometric device not found' });
    res.json({ message: 'Biometric device deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete biometric device' });
  }
};

module.exports = {
  getAllBiometrics,
  getBiometricById,
  createBiometric,
  updateBiometric,
  deleteBiometric,
};