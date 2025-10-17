const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

// Configure Multer for PDF uploads
const uploadPath = path.join(__dirname, '../uploads/pdf');
// Create the uploads/pdf directory if it doesn't exist
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('pdf');

router.get('/:type',  invoiceController.getInvoices);
router.post('/',  (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, invoiceController.addInvoice);
router.put('/:id/status',  invoiceController.updateInvoiceStatus);
router.put('/:id/pdf',  upload, invoiceController.updateInvoicePdf);

module.exports = router;