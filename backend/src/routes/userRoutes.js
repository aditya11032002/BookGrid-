const express = require('express');
const { getWishlist, toggleWishlist } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.route('/wishlist')
  .get(protect, getWishlist)
  .post(protect, toggleWishlist);

module.exports = router;
