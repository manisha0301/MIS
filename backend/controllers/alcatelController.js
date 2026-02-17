// backend/controllers/alcatelController.js
const alcatelModel = require('../models/alcatelModel');

const getAllAlcatels = async (req, res) => {
  try {
    const alcatels = await alcatelModel.getAllAlcatels();
    res.json(alcatels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Alcatel records' });
  }
};

const getAlcatelById = async (req, res) => {
  try {
    const alcatel = await alcatelModel.getAlcatelById(req.params.id);
    if (!alcatel) return res.status(404).json({ error: 'Alcatel record not found' });
    res.json(alcatel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Alcatel record' });
  }
};

const createAlcatel = async (req, res) => {
  try {
    const alcatel = await alcatelModel.createAlcatel(req.body);
    res.status(201).json(alcatel);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Failed to create Alcatel record' });
  }
};

const updateAlcatel = async (req, res) => {
  try {
    const alcatel = await alcatelModel.updateAlcatel(req.params.id, req.body);
    if (!alcatel) return res.status(404).json({ error: 'Alcatel record not found' });
    res.json(alcatel);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update Alcatel record' });
  }
};

const deleteAlcatel = async (req, res) => {
  try {
    const alcatel = await alcatelModel.deleteAlcatel(req.params.id);
    if (!alcatel) return res.status(404).json({ error: 'Alcatel record not found' });
    res.json({ message: 'Alcatel record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Alcatel record' });
  }
};

module.exports = {
  getAllAlcatels,
  getAlcatelById,
  createAlcatel,
  updateAlcatel,
  deleteAlcatel,
};