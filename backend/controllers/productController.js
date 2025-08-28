const productModel = require('../models/productModel');

const getProducts = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if ( !name || !price || !description || !req.file) {
      return res.status(400).json({ error: 'All fields ( name, price, description, image) are required' });
    }

    const image = `/uploads/products/${req.file.filename}`;
    const product = {
      name,
      price: parseFloat(price),
      description,
      image,
    };

    const newProduct = await productModel.addProduct(product);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: 'Error adding product' });
  }
};

module.exports = { getProducts, addProduct };