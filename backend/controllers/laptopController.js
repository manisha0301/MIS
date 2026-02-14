const laptopModel = require('../models/laptopModel');

const getAllLaptops = async (req, res) => {
  try {
    const laptops = await laptopModel.getAllLaptops();
    res.json(laptops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch laptops' });
  }
};

const getLaptopById = async (req, res) => {
  try {
    const laptop = await laptopModel.getLaptopById(req.params.id);
    if (!laptop) return res.status(404).json({ error: 'Laptop not found' });
    res.json(laptop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch laptop' });
  }
};

const createLaptop = async (req, res) => {
  try {
    const laptop = await laptopModel.createLaptop(req.body);
    res.status(201).json(laptop);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const updateLaptop = async (req, res) => {
  try {
    const laptop = await laptopModel.updateLaptop(req.params.id, req.body);
    if (!laptop) return res.status(404).json({ error: 'Laptop not found' });
    res.json(laptop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteLaptop = async (req, res) => {
  try {
    const laptop = await laptopModel.deleteLaptop(req.params.id);
    if (!laptop) return res.status(404).json({ error: 'Laptop not found' });
    res.json({ message: 'Laptop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete laptop' });
  }
};

module.exports = {
  getAllLaptops,
  getLaptopById,
  createLaptop,
  updateLaptop,
  deleteLaptop,
};