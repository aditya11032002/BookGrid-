const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find();
    let totalRevenue = 0;
    orders.forEach(o => { totalRevenue += o.totalPrice; });

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        totalOrders,
        totalRevenue,
        recentOrders
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && req.user.id === user.id) {
       return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
