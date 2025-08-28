// mockData.js
export const salesData = {
  quarters: ['Mar-Apr-May 2024', 'Jun-Jul-Aug 2024', 'Sep-Oct-Nov 2024', 'Dec-Jan-Feb 2025', 'Mar-Apr-May 2025'],
  directSales: [9960000, 12450000, 14940000, 16600000, 18000000],
  institutionalSales: [6640000, 7470000, 8300000, 9130000, 9500000],
  channelSales: [4150000, 4980000, 5810000, 6640000, 7000000],
  hitMiss: {
    hit: [75, 80, 85, 90, 88],
    miss: [25, 20, 15, 10, 12]
  },
  achievedNotAchieved: {
    achieved: [80, 85, 90, 95, 92],
    notAchieved: [20, 15, 10, 5, 8]
  },
  targets: [16600000, 20750000, 24900000, 29050000, 31000000]
};

export const forecastData = {
  quarters: ['Mar-Apr-May 2024', 'Jun-Jul-Aug 2024', 'Sep-Oct-Nov 2024', 'Dec-Jan-Feb 2025', 'Mar-Apr-May 2025'],
  revenueTargets: [16600000, 20750000, 24900000, 29050000, 31000000],
  forecastedSales: [14940000, 19090000, 23240000, 27390000, 29500000]
};

export const kpiData = {
  totalRevenue: 53600000,
  topProduct: 'ARMORED PHONE',
  topState: 'NY'
};

export const productData = [
  { id: 1, name: 'ARMORED PHONE', price: 180000, category: 'Electronics', stock: 150, sales: 500, description: 'High-quality widget for enterprise solutions.', image: '/src/assets/Product1.png' },
  { id: 2, name: 'SGA 10', price: 41417, category: 'Gadgets', stock: 200, sales: 300, description: 'Premium gadget with advanced features.', image: '/src/assets/Product2.png' },
  { id: 3, name: 'SGA 100', price: 96517, category: 'Tools', stock: 120, sales: 400, description: 'Cost-effective tool for small businesses.', image: '/src/assets/Product3.png' },
];

export const customerData = [
  { id: 1, name: 'John Doe', contact: '9876543210', state: 'Maharashtra', totalPurchases: 25000 },
  { id: 2, name: 'Jane Smith', contact: '8765432109', state: 'Karnataka', totalPurchases: 18500 },
  { id: 3, name: 'Raj Patel', contact: '7654321098', state: 'Gujarat', totalPurchases: 32000 },
];

export const customerPurchasesByState = {
  labels: ['Maharashtra', 'Uttar Pradesh', 'Tamil Nadu', 'Kerala', 'West Bengal'],
  datasets: [
    {
      label: 'Purchases (₹)',
      data: [5000000, 4500000, 3000000, 2500000, 2000000],
      backgroundColor: '#0a9396',
      borderColor: '#005f73',
      borderWidth: 1
    }
  ]
};

export const expenditureData = {
  details: [
    {
      category: 'Rent',
      items: [
        { name: 'Office Lease', amount: 1500000, quarter: 'Mar-May' },
        { name: 'Parking Space', amount: 200000, quarter: 'Mar-May' },
        { name: 'Office Lease', amount: 1550000, quarter: 'Jun-Aug' },
        { name: 'Parking Space', amount: 210000, quarter: 'Jun-Aug' },
        { name: 'Office Lease', amount: 1600000, quarter: 'Sep-Nov' },
        { name: 'Parking Space', amount: 220000, quarter: 'Sep-Nov' },
        { name: 'Office Lease', amount: 1650000, quarter: 'Dec-Feb' },
        { name: 'Parking Space', amount: 230000, quarter: 'Dec-Feb' }
      ]
    },
    {
      category: 'Utilities',
      items: [
        { name: 'Electricity', amount: 50000, quarter: 'Mar-May' },
        { name: 'Water', amount: 15000, quarter: 'Mar-May' },
        { name: 'Internet', amount: 10000, quarter: 'Mar-May' },
        { name: 'Electricity', amount: 52000, quarter: 'Jun-Aug' },
        { name: 'Water', amount: 16000, quarter: 'Jun-Aug' },
        { name: 'Internet', amount: 11000, quarter: 'Jun-Aug' },
        { name: 'Electricity', amount: 53000, quarter: 'Sep-Nov' },
        { name: 'Water', amount: 17000, quarter: 'Sep-Nov' },
        { name: 'Internet', amount: 12000, quarter: 'Sep-Nov' },
        { name: 'Electricity', amount: 54000, quarter: 'Dec-Feb' },
        { name: 'Water', amount: 18000, quarter: 'Dec-Feb' },
        { name: 'Internet', amount: 13000, quarter: 'Dec-Feb' }
      ]
    },
    {
      category: 'Cleaning',
      items: [
        { name: 'Janitorial Services', amount: 30000, quarter: 'Mar-May' },
        { name: 'Cleaning Supplies', amount: 8000, quarter: 'Mar-May' },
        { name: 'Janitorial Services', amount: 31000, quarter: 'Jun-Aug' },
        { name: 'Cleaning Supplies', amount: 8500, quarter: 'Jun-Aug' },
        { name: 'Janitorial Services', amount: 32000, quarter: 'Sep-Nov' },
        { name: 'Cleaning Supplies', amount: 9000, quarter: 'Sep-Nov' },
        { name: 'Janitorial Services', amount: 33000, quarter: 'Dec-Feb' },
        { name: 'Cleaning Supplies', amount: 9500, quarter: 'Dec-Feb' }
      ]
    },
    {
      category: 'Repairs',
      items: [
        { name: 'HVAC Maintenance', amount: 25000, quarter: 'Mar-May' },
        { name: 'Equipment Repairs', amount: 15000, quarter: 'Mar-May' },
        { name: 'HVAC Maintenance', amount: 26000, quarter: 'Jun-Aug' },
        { name: 'Equipment Repairs', amount: 16000, quarter: 'Jun-Aug' },
        { name: 'HVAC Maintenance', amount: 27000, quarter: 'Sep-Nov' },
        { name: 'Equipment Repairs', amount: 17000, quarter: 'Sep-Nov' },
        { name: 'HVAC Maintenance', amount: 28000, quarter: 'Dec-Feb' },
        { name: 'Equipment Repairs', amount: 18000, quarter: 'Dec-Feb' }
      ]
    },
    {
      category: 'Supplies',
      items: Array.from({ length: 100 }, (_, index) => ({
        name: `Office Item ${index + 1}`,
        amount: 5000 + Math.floor(Math.random() * 10000),
        quarter: ['Mar-May', 'Jun-Aug', 'Sep-Nov', 'Dec-Feb'][Math.floor(index / 25)]
      }))
    },
    {
      category: 'Salaries',
      items: [
        { name: 'Employee Salaries', amount: 2500000, quarter: 'Mar-May' },
        { name: 'Bonuses', amount: 500000, quarter: 'Mar-May' },
        { name: 'Employee Salaries', amount: 2550000, quarter: 'Jun-Aug' },
        { name: 'Bonuses', amount: 510000, quarter: 'Jun-Aug' },
        { name: 'Employee Salaries', amount: 2600000, quarter: 'Sep-Nov' },
        { name: 'Bonuses', amount: 520000, quarter: 'Sep-Nov' },
        { name: 'Employee Salaries', amount: 2650000, quarter: 'Dec-Feb' },
        { name: 'Bonuses', amount: 530000, quarter: 'Dec-Feb' }
      ]
    }
  ],
  // Simplified data for ExpenditureChart.jsx pie chart
  categories: ['Rent', 'Utilities', 'Cleaning', 'Repairs', 'Supplies', 'Salaries'],
  values: [3870000, 86000, 39000, 40000, 750000, 3050000] // Aggregated quarterly totals for demo
};

export const salesInvoices = [
  { id: 1, number: 'INV-001', date: '2025-03-15', customer: 'John Doe', amount: 25000, status: 'Paid', dueDate: '2025-04-15', paymentMethod: 'Credit Card', notes: 'First purchase', pdfUrl: null },
  { id: 2, number: 'INV-002', date: '2025-04-20', customer: 'Jane Smith', amount: 18500, status: 'Due', dueDate: '2025-05-20', paymentMethod: 'Bank Transfer', notes: 'Pending approval', pdfUrl: null },
  { id: 3, number: 'INV-003', date: '2025-05-10', customer: 'Raj Patel', amount: 32000, status: 'Paid', dueDate: '2025-06-10', paymentMethod: 'Cash', notes: 'Bulk order', pdfUrl: null },
  { id: 4, number: 'INV-004', date: '2025-06-05', customer: 'Acme Corp', amount: 50000, status: 'Due', dueDate: '2025-07-05', paymentMethod: 'Credit Card', notes: 'Corporate deal', pdfUrl: null },
  { id: 5, number: 'INV-005', date: '2025-07-25', customer: 'Beta Inc', amount: 45000, status: 'Paid', dueDate: '2025-08-25', paymentMethod: 'Bank Transfer', notes: 'Repeat customer', pdfUrl: null },
  { id: 6, number: 'INV-006', date: '2025-08-01', customer: 'Gamma LLC', amount: 30000, status: 'Due', dueDate: '2025-09-01', paymentMethod: 'Cash', notes: 'New client', pdfUrl: null },
  { id: 7, number: 'INV-007', date: '2025-08-10', customer: 'Delta Co', amount: 40000, status: 'Paid', dueDate: '2025-09-10', paymentMethod: 'Credit Card', notes: 'Urgent delivery', pdfUrl: null },
  { id: 8, number: 'INV-008', date: '2025-08-15', customer: 'Epsilon Ltd', amount: 35000, status: 'Due', dueDate: '2025-09-15', paymentMethod: 'Bank Transfer', notes: 'Discount applied', pdfUrl: null },
  { id: 9, number: 'INV-009', date: '2025-08-20', customer: 'John Doe', amount: 28000, status: 'Paid', dueDate: '2025-09-20', paymentMethod: 'Cash', notes: 'Second purchase', pdfUrl: null },
  { id: 10, number: 'INV-010', date: '2025-08-21', customer: 'Jane Smith', amount: 22000, status: 'Due', dueDate: '2025-09-21', paymentMethod: 'Credit Card', notes: 'Follow-up needed', pdfUrl: null }
];

export const purchaseInvoices = [
  { id: 1, number: 'PINV-001', date: '2025-03-10', supplier: 'Supplier A', amount: 15000, status: 'Paid', dueDate: '2025-04-10', paymentMethod: 'Bank Transfer', notes: 'Raw materials', pdfUrl: null },
  { id: 2, number: 'PINV-002', date: '2025-04-15', supplier: 'Supplier B', amount: 20000, status: 'Due', dueDate: '2025-05-15', paymentMethod: 'Credit', notes: 'Equipment', pdfUrl: null },
  { id: 3, number: 'PINV-003', date: '2025-05-05', supplier: 'Supplier C', amount: 10000, status: 'Paid', dueDate: '2025-06-05', paymentMethod: 'Cash', notes: 'Office supplies', pdfUrl: null },
  { id: 4, number: 'PINV-004', date: '2025-06-20', supplier: 'Supplier D', amount: 30000, status: 'Due', dueDate: '2025-07-20', paymentMethod: 'Bank Transfer', notes: 'Maintenance', pdfUrl: null },
  { id: 5, number: 'PINV-005', date: '2025-07-15', supplier: 'Supplier E', amount: 25000, status: 'Paid', dueDate: '2025-08-15', paymentMethod: 'Credit', notes: 'Software license', pdfUrl: null },
  { id: 6, number: 'PINV-006', date: '2025-08-02', supplier: 'Supplier F', amount: 18000, status: 'Due', dueDate: '2025-09-02', paymentMethod: 'Cash', notes: 'Consulting fees', pdfUrl: null },
  { id: 7, number: 'PINV-007', date: '2025-08-12', supplier: 'Supplier G', amount: 22000, status: 'Paid', dueDate: '2025-09-12', paymentMethod: 'Bank Transfer', notes: 'Marketing materials', pdfUrl: null },
  { id: 8, number: 'PINV-008', date: '2025-08-16', supplier: 'Supplier H', amount: 27000, status: 'Due', dueDate: '2025-09-16', paymentMethod: 'Credit', notes: 'Travel expenses', pdfUrl: null },
  { id: 9, number: 'PINV-009', date: '2025-08-18', supplier: 'Supplier I', amount: 19000, status: 'Paid', dueDate: '2025-09-18', paymentMethod: 'Cash', notes: 'Training', pdfUrl: null },
  { id: 10, number: 'PINV-010', date: '2025-08-21', supplier: 'Supplier J', amount: 23000, status: 'Due', dueDate: '2025-09-21', paymentMethod: 'Bank Transfer', notes: 'Miscellaneous', pdfUrl: null }
];