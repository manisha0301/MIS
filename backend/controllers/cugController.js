// backend/controllers/cugController.js
const cugModel = require('../models/cugModel');

const getAllCugs = async (req, res) => {
  try {
    const cugs = await cugModel.getAllCugs();
    res.json(cugs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch CUG records' });
  }
};

const getCugById = async (req, res) => {
  try {
    const cug = await cugModel.getCugById(req.params.id);
    if (!cug) return res.status(404).json({ error: 'CUG record not found' });
    res.json(cug);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CUG record' });
  }
};

const createCug = async (req, res) => {
  try {
    const cug = await cugModel.createCug(req.body);
    res.status(201).json(cug);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Failed to create CUG record' });
  }
};

const updateCug = async (req, res) => {
  try {
    const cug = await cugModel.updateCug(req.params.id, req.body);
    if (!cug) return res.status(404).json({ error: 'CUG record not found' });
    res.json(cug);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update CUG record' });
  }
};

const deleteCug = async (req, res) => {
  try {
    const cug = await cugModel.deleteCug(req.params.id);
    if (!cug) return res.status(404).json({ error: 'CUG record not found' });
    res.json({ message: 'CUG record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete CUG record' });
  }
};

module.exports = {
  getAllCugs,
  getCugById,
  createCug,
  updateCug,
  deleteCug,
};