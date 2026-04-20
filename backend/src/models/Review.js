const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from submitting more than one review per book
ReviewSchema.index({ book: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(bookId) {
  const obj = await this.aggregate([
    {
      $match: { book: bookId }
    },
    {
      $group: {
        _id: '$book',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('Book').findByIdAndUpdate(bookId, {
      rating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.book);
});

// Call getAverageRating before remove
ReviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.getAverageRating(doc.book);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
