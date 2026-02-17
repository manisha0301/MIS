// backend/controllers/cctvController.js
const cctvModel = require('../models/cctvModel');

const getAllCctvs = async (req, res) => {
  try {
    const cctvs = await cctvModel.getAllCctvs();
    res.json(cctvs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch CCTVs' });
  }
};

const getCctvById = async (req, res) => {
  try {
    const cctv = await cctvModel.getCctvById(req.params.id);
    if (!cctv) return res.status(404).json({ error: 'CCTV camera not found' });
    res.json(cctv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CCTV camera' });
  }
};

const createCctv = async (req, res) => {
  try {
    const cctv = await cctvModel.createCctv(req.body);
    res.status(201).json(cctv);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const updateCctv = async (req, res) => {
  try {
    const cctv = await cctvModel.updateCctv(req.params.id, req.body);
    if (!cctv) return res.status(404).json({ error: 'CCTV camera not found' });
    res.json(cctv);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCctv = async (req, res) => {
  try {
    const cctv = await cctvModel.deleteCctv(req.params.id);
    if (!cctv) return res.status(404).json({ error: 'CCTV camera not found' });
    res.json({ message: 'CCTV camera deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete CCTV camera' });
  }
};

module.exports = {
  getAllCctvs,
  getCctvById,
  createCctv,
  updateCctv,
  deleteCctv,
};