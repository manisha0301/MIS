const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// No authMiddleware used as per instructions

router.get('/', salesController.getSalesData);
router.post('/', salesController.addSalesData);

module.exports = router;