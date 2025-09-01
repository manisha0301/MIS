const salesModel = require('../models/salesModel');

exports.getSalesData = async (req, res) => {
  try {
    const sales = await salesModel.getAllSales();
    
    if (sales.length === 0) {
      return res.status(404).json({ message: 'No sales data found' });
    }

    const formattedSalesData = {
      quarters: sales.map(s => s.quarter),
      directSales: sales.map(s => parseFloat(s.direct_sales)),
      institutionalSales: sales.map(s => parseFloat(s.institutional_sales)),
      channelSales: sales.map(s => parseFloat(s.channel_sales)),
      hitMiss: {
        hit: sales.map(s => s.hit_percentage),
        miss: sales.map(s => 100 - s.hit_percentage)
      },
      achievedNotAchieved: {
        achieved: sales.map(s => s.achieved_percentage),
        notAchieved: sales.map(s => 100 - s.achieved_percentage)
      },
      targets: sales.map(s => parseFloat(s.target))
    };

    const formattedForecastData = {
      quarters: formattedSalesData.quarters,
      revenueTargets: formattedSalesData.targets,
      forecastedSales: sales.map(s => parseFloat(s.forecasted_sales))
    };

    res.json({
      salesData: formattedSalesData,
      forecastData: formattedForecastData
    });
  } catch (error) {
    console.error('Error in getSalesData:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
};

exports.addSalesData = async (req, res) => {
  try {
    const requiredFields = [
      'quarter', 'direct_sales', 'institutional_sales', 'channel_sales',
      'hit_percentage', 'achieved_percentage', 'target', 'forecasted_sales'
    ];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Validate numeric fields
    const numericFields = requiredFields.slice(1); // All except quarter
    for (const field of numericFields) {
      if (isNaN(parseFloat(req.body[field]))) {
        return res.status(400).json({ error: `Invalid numeric value for: ${field}` });
      }
    }

    // Validate percentages
    const hit = parseInt(req.body.hit_percentage);
    const achieved = parseInt(req.body.achieved_percentage);
    if (hit < 0 || hit > 100 || achieved < 0 || achieved > 100) {
      return res.status(400).json({ error: 'Percentages must be between 0 and 100' });
    }

    const newData = await salesModel.addSales({
      quarter: req.body.quarter,
      direct_sales: parseFloat(req.body.direct_sales),
      institutional_sales: parseFloat(req.body.institutional_sales),
      channel_sales: parseFloat(req.body.channel_sales),
      hit_percentage: hit,
      achieved_percentage: achieved,
      target: parseFloat(req.body.target),
      forecasted_sales: parseFloat(req.body.forecasted_sales)
    });

    res.status(201).json(newData);
  } catch (error) {
    console.error('Error in addSalesData:', error);
    if (error.code === '23505') { // PostgreSQL unique violation
      res.status(409).json({ error: 'Quarter already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add sales data' });
    }
  }
};