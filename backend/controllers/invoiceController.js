// Updated invoiceController.js
const invoiceModel = require('../models/invoiceModel');

const addInvoice = async (req, res) => {
  try {
    const { type, number, date, company, customer, supplier, clientId, amount, gstPercentage, tdsPercentage, dueDate, paymentMethod, notes, status } = req.body;
    const pdfUrl = req.file ? `/uploads/pdf/${req.file.filename}` : null;

    let invoice;
    if (type === 'sales') {
      invoice = {
        number,
        date,
        company,
        customer,
        clientId,
        amount: parseFloat(amount),
        gstPercentage: parseFloat(gstPercentage),
        dueDate,
        paymentMethod,
        notes,
        status: status || 'Due',
        pdfUrl,
      };
      const newInvoice = await invoiceModel.addSalesInvoice(invoice);
      res.status(201).json(newInvoice);
    } else if (type === 'purchase') {
      invoice = {
        number,
        date,
        company,
        supplier,
        clientId,
        amount: parseFloat(amount),
        gstPercentage: parseFloat(gstPercentage),
        tdsPercentage: parseFloat(tdsPercentage),
        dueDate,
        paymentMethod,
        notes,
        status: status || 'Due',
        pdfUrl,
      };
      const newInvoice = await invoiceModel.addPurchaseInvoice(invoice);
      res.status(201).json(newInvoice);
    } else {
      return res.status(400).json({ error: 'Invalid invoice type' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add invoice' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const { type } = req.params;
    let invoices;
    if (type === 'sales') {
      invoices = await invoiceModel.getSalesInvoices();
    } else if (type === 'purchase') {
      invoices = await invoiceModel.getPurchaseInvoices();
    } else {
      return res.status(400).json({ error: 'Invalid invoice type' });
    }
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch ${req.params.type} invoices` });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { status } = req.body;
    if (!['Due', 'Paid'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    let updatedInvoice;
    if (type === 'sales') {
      updatedInvoice = await invoiceModel.updateSalesInvoiceStatus(id, status);
    } else if (type === 'purchase') {
      updatedInvoice = await invoiceModel.updatePurchaseInvoiceStatus(id, status);
    } else {
      return res.status(400).json({ error: 'Invalid invoice type' });
    }
    if (!updatedInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
};

const updateInvoicePdf = async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    const pdfUrl = `/uploads/pdf/${req.file.filename}`;
    let updatedInvoice;
    if (type === 'sales') {
      updatedInvoice = await invoiceModel.updateSalesInvoicePdf(id, pdfUrl);
    } else if (type === 'purchase') {
      updatedInvoice = await invoiceModel.updatePurchaseInvoicePdf(id, pdfUrl);
    } else {
      return res.status(400).json({ error: 'Invalid invoice type' });
    }
    if (!updatedInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice PDF' });
  }
};

module.exports = {
  addInvoice,
  getInvoices,
  updateInvoiceStatus,
  updateInvoicePdf,
};