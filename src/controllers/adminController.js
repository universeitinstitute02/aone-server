const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { getDBStatus } = require('../config/db');
const { localDb, readCollection } = require('../utils/localDb');

// @desc    Get dashboard metrics (Total Sales, Orders, Customers, Stock warnings, and Investments)
// @route   GET /api/admin/stats
// @access  Private (Admin/Employee only)
exports.getStats = async (req, res, next) => {
  try {
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalProducts = 0;
    let totalCustomers = 0;
    let lowStockCount = 0;
    let totalInvestments = 0;

    if (getDBStatus()) {
      // 1. Total Revenue from Mongoose
      const completedOrders = await Order.find({ paymentStatus: 'paid' });
      totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

      // 2. Count metrics
      totalOrders = await Order.countDocuments();
      totalProducts = await Product.countDocuments({ active: true });
      totalCustomers = await User.countDocuments({ role: 'customer' });
      lowStockCount = await Product.countDocuments({ stock: { $lt: 10 }, active: true });

      // 3. Investment totals
      const users = await User.find();
      totalInvestments = users.reduce((sum, usr) => sum + (usr.investmentAmount || 0), 0);
    } else {
      // Local collections
      const orders = readCollection('orders');
      const products = readCollection('products').filter(p => p.active !== false);
      const users = readCollection('users');

      const completedOrders = orders.filter(o => o.paymentStatus === 'paid');
      totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

      totalOrders = orders.length;
      totalProducts = products.length;
      totalCustomers = users.filter(u => u.role === 'customer').length;
      lowStockCount = products.filter(p => p.stock < 10).length;
      totalInvestments = users.reduce((sum, u) => sum + (u.investmentAmount || 0), 0);
    }

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalProducts,
        totalCustomers,
        lowStockCount,
        totalInvestments
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get chart analytics for dashboard visualizations
// @route   GET /api/admin/charts
// @access  Private (Admin/Employee only)
exports.getCharts = async (req, res, next) => {
  try {
    let ordersList = [];
    let productsList = [];

    if (getDBStatus()) {
      ordersList = await Order.find().populate('items.product');
      productsList = await Product.find({ active: true }).populate('category');
    } else {
      ordersList = readCollection('orders');
      productsList = readCollection('products').filter(p => p.active !== false).map(p => {
        return localDb.populate(p, 'products', 'category', 'categories');
      });
    }

    // 1. Monthly Revenue Analytics (Last 6 Months)
    const monthlyRevMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months with 0
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyRevMap[mLabel] = 0;
    }

    ordersList.forEach(ord => {
      if (ord.paymentStatus === 'paid' && ord.createdAt) {
        const orderDate = new Date(ord.createdAt);
        const mLabel = `${months[orderDate.getMonth()]} ${orderDate.getFullYear().toString().slice(-2)}`;
        if (monthlyRevMap[mLabel] !== undefined) {
          monthlyRevMap[mLabel] += ord.total;
        }
      }
    });

    const revenueChart = Object.keys(monthlyRevMap).map(key => ({
      name: key,
      value: Math.round(monthlyRevMap[key] * 100) / 100
    }));

    // 2. Sales by Product Category shares
    const categorySalesMap = {};
    ordersList.forEach(ord => {
      if (ord.orderStatus !== 'cancelled') {
        ord.items.forEach(item => {
          // Find item category
          let catName = 'Other';
          const pId = item.product.id || item.product._id || item.product;
          const prod = productsList.find(p => p.id === pId || p._id === pId);
          if (prod && prod.category) {
            catName = prod.category.name || catName;
          }
          categorySalesMap[catName] = (categorySalesMap[catName] || 0) + (item.price * item.quantity);
        });
      }
    });

    const categoryChart = Object.keys(categorySalesMap).map(key => ({
      name: key,
      value: Math.round(categorySalesMap[key] * 100) / 100
    }));

    // 3. Order Logistics Status shares
    const statusMap = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    ordersList.forEach(ord => {
      if (statusMap[ord.orderStatus] !== undefined) {
        statusMap[ord.orderStatus]++;
      }
    });

    const orderChart = Object.keys(statusMap).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: statusMap[key]
    }));

    res.status(200).json({
      success: true,
      charts: {
        revenueChart,
        categoryChart: categoryChart.length > 0 ? categoryChart : [{ name: 'Lubricants', value: 100 }],
        orderChart
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const users = await User.find().sort('-createdAt');
      return res.status(200).json({ success: true, count: users.length, users });
    } else {
      const users = readCollection('users');
      // Strip passwords for security
      const sanitizedUsers = users.map(u => {
        const { password, ...rest } = u;
        return rest;
      });
      sanitizedUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json({ success: true, count: sanitizedUsers.length, users: sanitizedUsers });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, investmentAmount } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Please specify a target role' });
    }

    if (getDBStatus()) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.role = role;
      if (investmentAmount !== undefined) {
        user.investmentAmount = parseFloat(investmentAmount);
      }
      await user.save();

      return res.status(200).json({ success: true, message: 'User updated successfully', user });
    } else {
      const user = localDb.findById('users', id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const updated = localDb.findByIdAndUpdate('users', id, {
        role,
        investmentAmount: investmentAmount !== undefined ? parseFloat(investmentAmount) : user.investmentAmount
      });

      return res.status(200).json({ success: true, message: 'User updated successfully', user: updated });
    }
  } catch (err) {
    next(err);
  }
};
