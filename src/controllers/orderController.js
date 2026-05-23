const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Helper to generate Invoice & Tracking
const generateInvoiceAndTracking = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const trackNum = Math.floor(1000000000 + Math.random() * 9000000000);
  
  return {
    invoiceNumber: `A1L-${dateStr}-${randNum}`,
    trackingId: `TRK-${trackNum}`
  };
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in the order cart' });
    }

    let subtotal = 0;
    const processedItems = [];

    // Verify stock and price for each item
    for (let item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found with ID ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${product.name}. Available: ${product.stock}` });
      }

      const activePrice = product.discountPrice !== null ? product.discountPrice : product.price;
      subtotal += activePrice * item.quantity;

      processedItems.push({
      product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: activePrice
      });
    }

    // Shipping cost computation ($5 flat, free over $150)
    const shippingCost = subtotal > 150 ? 0 : 5.0;

    // Apply Coupon Code
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });

      if (coupon && new Date(coupon.expiryDate) > new Date() && subtotal >= coupon.minPurchase) {
        if (coupon.discountType === 'percentage') {
          discount = subtotal * (coupon.discountValue / 100);
        } else {
          discount = coupon.discountValue;
        }
      }
    }

    const total = Math.max(0, subtotal + shippingCost - discount);
    const { invoiceNumber, trackingId } = generateInvoiceAndTracking();

    const order = await Order.create({
      user: req.user._id,
      items: processedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
      orderStatus: 'pending',
      subtotal,
      shippingCost,
      discount,
      total,
      couponCode: couponCode || null,
      invoiceNumber,
      trackingId
    });

    for (let item of processedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get customer purchase history
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('user', 'name email').populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role === 'customer') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order invoice' });
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders across system
// @route   GET /api/orders
// @access  Private (Admin/Employee only)
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order workflow status (pending -> processing -> shipped -> delivered -> cancelled)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Employee only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.orderStatus = orderStatus || order.orderStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    await order.save();

    return res.status(200).json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    next(err);
  }
};
