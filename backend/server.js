const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const expenditureRoutes = require('./routes/expenditureRoutes');
const salesRoutes = require('./routes/salesRoutes');
const projectRoutes = require('./routes/projectRoutes');
const billExpenditureRoutes = require('./routes/billExpenditureRoutes');
const bankRoutes = require('./routes/bankRoutes');
const productModel = require('./models/productModel');
const customerModel = require('./models/customerModel');
const invoiceModel = require('./models/invoiceModel');
const expenditureModel = require('./models/expenditureModel');
const salesModel = require('./models/salesModel');
const projectModel = require('./models/projectModel');
const billExpenditureModel = require('./models/billExpenditureModel');
const bankModel = require('./models/bankModel');
const path = require('path');
const authRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userModel = require('./models/userModel');
const bcrypt = require('bcryptjs');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenditures', expenditureRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/bill-expenditures', billExpenditureRoutes);

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await userModel.createUsersTable();
    await productModel.createProductsTable();
    await customerModel.createCustomersTable();
    await invoiceModel.createSalesInvoicesTable();
    await invoiceModel.createPurchaseInvoicesTable();
    await expenditureModel.createExpendituresTable();
    await salesModel.createSalesTables();
    await projectModel.createProjectsTable();
    await projectModel.createCapxTable();
    await projectModel.createOpxTable();
    await projectModel.createBdexpTable();
    await bankModel.createBanksTable();
    await billExpenditureModel.createBillExpendituresTable();

    // Create default admin if not exists
    const admin = await userModel.findUserByUsername("admin");
    if (!admin) {
      const hashedPassword = await bcrypt.hash("password", 10);
      await userModel.createUser({
        name: "Default Admin",
        username: "admin",
        password: hashedPassword,
        role: "Admin",
      });
      console.log("✅ Default admin created (username=admin, password=password)");
    }
    
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