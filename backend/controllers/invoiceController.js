const invoiceModel = require('../models/invoiceModel');

const addInvoice = async (req, res) => {
  try {
    const { type, number, date, company, customer, supplier, amount, dueDate, paymentMethod, notes, status } = req.body;
    const pdfUrl = req.file ? `/uploads/pdf/${req.file.filename}` : null;

    const invoice = {
      type,
      number,
      date,
      company,
      customer,
      supplier,
      amount: parseFloat(amount),
      dueDate,
      paymentMethod,
      notes,
      status,
      pdfUrl,
    };
    const newInvoice = await invoiceModel.addInvoice(invoice);
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add invoice' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const { type } = req.params;
    if (!['sales', 'purchase'].includes(type)) {
      return res.status(400).json({ error: 'Invalid invoice type' });
    }
    const invoices = await invoiceModel.getInvoices(type);
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch ${req.params.type} invoices` });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Due', 'Paid'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updatedInvoice = await invoiceModel.updateInvoiceStatus(id, status);
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
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    const pdfUrl = `/uploads/pdf/${req.file.filename}`;
    const updatedInvoice = await invoiceModel.updateInvoicePdf(id, pdfUrl);
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