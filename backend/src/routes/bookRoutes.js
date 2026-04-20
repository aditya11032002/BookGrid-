const express = require('express');
const { getBooks, getBook, createBook } = require('../controllers/bookController');
const { protect, authorize } = require('../middlewares/auth');

// Include other resource routers
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bookId/reviews', reviewRouter);

router.route('/')
  .get(getBooks)
  .post(protect, authorize('admin'), createBook);

router.route('/:id').get(getBook);

module.exports = router;
