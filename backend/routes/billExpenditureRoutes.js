const express = require('express');
const router = express.Router();
const billExpenditureController = require('../controllers/billExpenditureController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/import', upload.single('file'), billExpenditureController.importTransactions);
router.get('/', billExpenditureController.getAllTransactions);
router.put('/:transactionId/bank-details', billExpenditureController.updateBankDetails);

module.exports = router;