// backend/routes/bankRoutes.js
const express = require('express');
const router = express.Router();
const { getBanks, getBankDetails, addBank } = require('../controllers/bankController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', getBanks);
router.get('/:bankName', getBankDetails);
router.post('/', addBank);

module.exports = router;