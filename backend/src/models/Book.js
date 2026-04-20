const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a book title'],
    trim: true,
    maxlength: [150, 'Title cannot be more than 150 characters']
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
    trim: true,
  },
  genre: {
    type: [String],
    required: [true, 'Please add at least one genre']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be non-negative']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be below 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  coverImage: {
    type: String,
    default: 'https://via.placeholder.com/400x600?text=No+Cover'
  },
  publishedDate: {
    type: Date
  },
  language: {
    type: String,
    default: 'English'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', BookSchema);
