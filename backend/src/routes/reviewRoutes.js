const express = require('express');
const { getReviews, addReview, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getReviews)
  .post(protect, addReview);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteReview);

module.exports = router;
