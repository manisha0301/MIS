// backend/routes/billExpenditureRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getTransactions, uploadStatement } = require('../controllers/billExpenditureController');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get('/transactions', getTransactions);
router.post('/upload', upload.single('statement'), uploadStatement);

module.exports = router;