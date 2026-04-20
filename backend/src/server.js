const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route files
const auth = require('./routes/authRoutes');
const books = require('./routes/bookRoutes');
const admin = require('./routes/adminRoutes');
const orders = require('./routes/orderRoutes');
const reviews = require('./routes/reviewRoutes');
const users = require('./routes/userRoutes');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/books', books);
app.use('/api/v1/admin', admin);
app.use('/api/v1/orders', orders);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/users', users);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
