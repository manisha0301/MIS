const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
// const authMiddleware = require('../middleware/authMiddleware');

router.get('/', customerController.getCustomers);
router.post('/', /* authMiddleware, */ customerController.addCustomer);

module.exports = router;