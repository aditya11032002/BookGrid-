const User = require('../models/User');
const Book = require('../models/Book');

// @desc    Get user wishlist
// @route   GET /api/v1/users/wishlist
// @access  Private/User
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    
    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle book in wishlist (Add/Remove)
// @route   POST /api/v1/users/wishlist
// @access  Private/User
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const user = await User.findById(req.user.id);
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const index = user.wishlist.indexOf(bookId);
    let message = '';
    let added = false;
    
    if (index === -1) {
      user.wishlist.push(bookId);
      message = 'Book added to wishlist';
      added = true;
    } else {
      user.wishlist.splice(index, 1);
      message = 'Book removed from wishlist';
    }

    await user.save();

    res.status(200).json({
      success: true,
      message,
      added,
      data: user.wishlist
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
