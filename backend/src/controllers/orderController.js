const Order = require('../models/Order');
const User = require('../models/User');
const { orderConfirmation } = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.addOrderItems = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      totalPrice
    });

    const createdOrder = await order.save();

    // Fetch user details to send confirmation email
    const user = await User.findById(req.user._id);
    if (user) {
      orderConfirmation(createdOrder, user).catch((err) =>
        console.error('Order confirmation email failed:', err.message)
      );
    }

    res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email');
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
