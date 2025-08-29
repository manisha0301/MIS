const express = require('express');
const router = express.Router();
const ExpenditureController = require('../controllers/expenditureController');

router.get('/', ExpenditureController.getExpenditures);
router.post('/import', ExpenditureController.importExpenditures);
router.get('/export', ExpenditureController.exportExpenditures);
router.put('/', ExpenditureController.updateExpenditure);
router.delete('/:category', ExpenditureController.deleteCategory);

module.exports = router;