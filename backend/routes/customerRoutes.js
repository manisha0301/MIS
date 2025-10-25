const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectories = () => {
  const contractsDir = path.join(__dirname, '../uploads/contracts');
  const purchaseOrdersDir = path.join(__dirname, '../uploads/purchaseorders');
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
    console.log('Created directory:', contractsDir);
  }
  
  if (!fs.existsSync(purchaseOrdersDir)) {
    fs.mkdirSync(purchaseOrdersDir, { recursive: true });
    console.log('Created directory:', purchaseOrdersDir);
  }
};

// Run directory creation when module is loaded
ensureDirectories();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'contractProof') {
      cb(null, path.join(__dirname, '../uploads/contracts'));
    } else if (file.fieldname === 'purchaseOrder') {
      cb(null, path.join(__dirname, '../uploads/purchaseorders'));
    }
  },
  filename: (req, file, cb) => {
    const clientId = req.body.clientId?.trim();
    const ext = path.extname(file.originalname);            // .pdf
    const type = file.fieldname === 'contractProof' ? 'contract' : 'po';
    const safeName = `${clientId}-${type}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

router.get('/', customerController.getCustomers);
router.post('/', upload.fields([
  { name: 'contractProof', maxCount: 1 },
  { name: 'purchaseOrder', maxCount: 1 }
]), customerController.addCustomer);

module.exports = router;