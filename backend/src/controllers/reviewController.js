const Review = require('../models/Review');
const Book = require('../models/Book');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/books/:bookId/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    let query;

    if (req.params.bookId) {
      query = Review.find({ book: req.params.bookId }).populate({
        path: 'user',
        select: 'name'
      });
    } else {
      query = Review.find().populate({
        path: 'book',
        select: 'title'
      }).populate({
        path: 'user',
        select: 'name'
      });
    }

    const reviews = await query;

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add review
// @route   POST /api/v1/books/:bookId/reviews
// @access  Private/User
exports.addReview = async (req, res, next) => {
  try {
    req.body.book = req.params.bookId;
    req.body.user = req.user.id;

    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({ success: false, message: `No book with the id of ${req.params.bookId}` });
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this book' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: `No review with the id of ${req.params.id}` });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
