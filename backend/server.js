const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const productModel = require('./models/productModel');
const customerModel = require('./models/customerModel');
const invoiceModel = require('./models/invoiceModel');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await productModel.createProductsTable();
    await customerModel.createCustomersTable();
    await invoiceModel.createInvoicesTable();
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeDatabase();
});