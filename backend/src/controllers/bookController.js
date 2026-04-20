const Book = require('../models/Book');

// @desc    Get all books with optional search/filters
// @route   GET /api/v1/books
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // Pagination
    const page = parseInt(reqQuery.page, 10) || 1;
    const limit = parseInt(reqQuery.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Fields to exclude from normal matching
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    // Create operators ($gt, $gte, etc) for things like price/rating filters if provided
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Parse back to JSON
    const parsedQuery = JSON.parse(queryStr);

    // If there's a custom text search
    if (req.query.search) {
      parsedQuery.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { author: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    query = Book.find(parsedQuery);

    // Sort functionality
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field selection
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Pagination
    const total = await Book.countDocuments(parsedQuery);
    query = query.skip(startIndex).limit(limit);

    const books = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      pagination,
      data: books
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single book
// @route   GET /api/v1/books/:id
// @access  Public
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new book
// @route   POST /api/v1/books
// @access  Private/Admin
exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
