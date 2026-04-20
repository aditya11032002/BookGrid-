const express = require('express');
const { addOrderItems, getOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, authorize('admin'), getOrders);

module.exports = router;
