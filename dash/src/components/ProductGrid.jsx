import { useState, useEffect } from 'react';
import { productData } from '/src/data/mockData';

function ProductGrid() {
  const [products, setProducts] = useState(productData);
  const [newProduct, setNewProduct] = useState({ id: Date.now(), name: '', price: '', description: '', image: '' });
  const [previewImage, setPreviewImage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', visible: false });

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: URL.createObjectURL(file) });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.image) {
      setNotification({ message: 'Please fill all fields and upload an image.', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      return;
    }
    setProducts([...products, newProduct]);
    setNewProduct({ id: Date.now(), name: '', price: '', description: '', image: '' });
    setPreviewImage('');
    setIsFormOpen(false);
    setNotification({ message: 'Product added successfully!', visible: true });
    setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
  };

  return (
    <div className="dashboard">
      {notification.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: notification.message.includes('Please') ? '#ffcccc' : '#d4edda',
          color: notification.message.includes('Please') ? '#721c24' : '#155724',
          padding: '12px 20px',
          borderRadius: '6px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease-in',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification({ ...notification, visible: false })}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '0 5px'
            }}
          >
            &times;
          </button>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>Products</h1>
        <button
          className="action-button"
          style={{ backgroundColor: '#0a9396', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.3s' }}
          onClick={() => setIsFormOpen(true)}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#005f73')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#0a9396')}
        >
          Add New Product
        </button>
      </div>
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            width: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>Add New Product</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Price (₹):</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Description:</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', minHeight: '80px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: '#1e293b', fontWeight: '500', marginBottom: '5px' }}>Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                />
                {previewImage && (
                  <img src={previewImage} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'contain', marginTop: '10px', borderRadius: '4px', border: '1px solid #e0e0e0' }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#94d2bd',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    flex: 1,
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#0a9396')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#94d2bd')}
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setNewProduct({ id: Date.now(), name: '', price: '', description: '', image: '' });
                    setPreviewImage('');
                  }}
                  style={{
                    backgroundColor: '#aecfeeff',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    flex: '1',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#005f73')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#aecfeeff')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div
        className="product-grid"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f2f2f2 100%)',
          padding: '20px',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          margin: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        {products.map(product => (
          <div
            key={product.id}
            className="product-card"
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '15px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '5px', marginBottom: '10px', position: 'relative', paddingTop: '56.25%' }}>
              <img src={product.image} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
            </div>
            <h3 style={{ color: '#1e293b', fontSize: '18px', margin: '10px 0', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{product.name}</h3>
            <div style={{ backgroundColor: '#f0f4f8', padding: '10px', borderRadius: '6px', margin: '10px 0' }}>
              <p style={{ color: '#0a9396', fontSize: '20px', fontWeight: '600', margin: 0 }}>₹{product.price.toLocaleString('en-IN')}</p>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e0e0e0', minHeight: '60px' }}>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;