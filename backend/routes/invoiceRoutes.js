// Updated invoiceRoutes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const invoiceModel = require('../models/invoiceModel');

// Configure Multer for PDF uploads
const uploadPath = path.join(__dirname, '../uploads/pdf');
// Create the uploads/pdf directory if it doesn't exist
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const invoiceNumber = req.invoiceNumber || req.body.number;
    if (!invoiceNumber) {
      return cb(new Error('Invoice number is required for filename'));
    }
    cb(null, `${invoiceNumber}.pdf`);
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

const fetchInvoiceForPdf = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    let invoice;
    if (type === 'sales') {
      invoice = await invoiceModel.getSalesInvoiceById(id);
    } else if (type === 'purchase') {
      invoice = await invoiceModel.getPurchaseInvoiceById(id);
    } else {
      return res.status(400).json({ error: 'Invalid invoice type' });
    }
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    req.invoiceNumber = invoice.number;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice for PDF update' });
  }
};

router.get('/:type', invoiceController.getInvoices);

router.post('/', (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, invoiceController.addInvoice);

router.put('/:type/:id/status', invoiceController.updateInvoiceStatus);

router.put('/:type/:id/pdf', fetchInvoiceForPdf, (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Multer error: ' + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, invoiceController.updateInvoicePdf);

module.exports = router;