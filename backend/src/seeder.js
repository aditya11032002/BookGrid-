const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

// Load models
const Book = require('./models/Book');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const books = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/books.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Book.deleteMany(); // Clear existing books
    await Book.create(books);
    console.log('Dummy Books successfully Imported into MongoDB!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else {
  console.log('Run with -i argument to import');
  process.exit();
}
