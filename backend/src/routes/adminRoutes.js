const express = require('express');
const { getStats, getUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
