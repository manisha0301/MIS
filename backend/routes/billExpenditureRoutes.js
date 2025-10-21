const express = require('express');
const router = express.Router();
const billExpenditureController = require('../controllers/billExpenditureController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/import', authMiddleware, upload.single('file'), billExpenditureController.importTransactions);
router.get('/', authMiddleware, billExpenditureController.getAllTransactions);
router.put('/:transactionId/bank-details', authMiddleware, billExpenditureController.updateBankDetails);

module.exports = router;