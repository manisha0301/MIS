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

export const expenditureData = {
  categories: ['Rent', 'Utilities', 'Cleaning', 'Repairs', 'Supplies'],
  values: [5000000, 2000000, 1000000, 800000, 1200000]
};

export const salesInvoices = [
  { id: 1, number: 'INV001', date: '2025-01-10', customer: 'Acme Corp', amount: 500000, dueDate: '2025-02-10', paymentMethod: 'Bank Transfer', notes: 'First installment', status: 'Paid' },
  { id: 2, number: 'INV002', date: '2025-02-15', customer: 'Beta Inc', amount: 750000, dueDate: '2025-03-15', paymentMethod: 'Credit Card', notes: 'Annual contract', status: 'Due' }
];

export const purchaseInvoices = [
  { id: 1, number: 'PUR001', date: '2025-01-05', supplier: 'Delta Supplies', amount: 300000, dueDate: '2025-02-05', paymentMethod: 'Bank Transfer', notes: 'Office supplies', status: 'Paid' },
  { id: 2, number: 'PUR002', date: '2025-02-10', supplier: 'Gamma Tech', amount: 450000, dueDate: '2025-03-10', paymentMethod: 'Credit Card', notes: 'Hardware purchase', status: 'Due' }
];

export const productData = [
  { id: 1, name: 'ARMORED PHONE', price: 180000, category: 'Electronics', stock: 150, sales: 500, description: 'High-quality widget for enterprise solutions.', image: '/src/assets/Product1.png' },
  { id: 2, name: 'SGA 10', price: 41417, category: 'Gadgets', stock: 200, sales: 300, description: 'Premium gadget with advanced features.', image: '/src/assets/Product2.png' },
  { id: 3, name: 'SGA 100', price: 96517, category: 'Tools', stock: 120, sales: 400, description: 'Cost-effective tool for small businesses.', image: '/src/assets/Product3.png' }
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

export const projectData = [
  {
    id: 1,
    name: 'Hypersonic Ballistic Missile (HSBM)',
    description: 'Revamping the company website with modern UI/UX and improved performance.',
    lead: 'Alice Johnson',
    team: ['Bob Smith', 'Clara Lee', 'David Kim'],
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    timeline: { completed: 40, inProgress: 50, remaining: 10 },
    image: '/src/assets/project1.png',
    company: 'Kristellar Aerospace',
    revenue: 2000000
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Building a cross-platform mobile application for customer engagement.',
    lead: 'Emma Davis',
    team: ['Frank Wilson', 'Grace Chen', 'Henry Patel'],
    startDate: '2025-03-01',
    endDate: '2025-09-30',
    timeline: { completed: 20, inProgress: 60, remaining: 20 },
    image: '/src/assets/project2.png',
    company: 'Kristellar Cyberspace',
    revenue: 1500000
  },
  {
    id: 3,
    name: 'ERP System Upgrade project',
    description: 'Upgrading the enterprise resource planning system for better efficiency.',
    lead: 'James Brown',
    team: ['Ivy Taylor', 'Jack Moore', 'Kelly White'],
    startDate: '2025-02-10',
    endDate: '2025-08-15',
    timeline: { completed: 30, inProgress: 50, remaining: 20 },
    image: '/src/assets/project3.png',
    company: 'Protelion',
    revenue: 1800000
  }
];