const fs = require('fs');

async function fetchGoogleBooks() {
  try {
    console.log('Fetching real books from Google Books API...');
    // Extended genres
    const queries = ['subject:fiction', 'subject:history', 'subject:science', 'subject:fantasy', 'subject:literature', 'subject:horror', 'subject:biography', 'subject:mystery'];
    let allBooks = [];

    for (let q of queries) {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=40&langRestrict=en`);
      const data = await response.json();
      
      if (data.items) {
        data.items.forEach(item => {
          const info = item.volumeInfo;
          // Filter to ensure high quality data
          if (info.title && info.authors && info.description && info.imageLinks && info.imageLinks.thumbnail) {
            allBooks.push({
              title: info.title,
              author: info.authors[0],
              genre: info.categories || [q.replace('subject:', '').charAt(0).toUpperCase() + q.replace('subject:', '').slice(1)],
              price: parseFloat((Math.random() * 15 + 9.99).toFixed(2)),
              description: info.description,
              rating: info.averageRating || parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
              stock: Math.floor(Math.random() * 100) + 10,
              coverImage: info.imageLinks.thumbnail.replace('http:', 'https:').replace('&edge=curl', ''),
              publishedDate: info.publishedDate || new Date().toISOString(),
              language: 'English'
            });
          }
        });
      }
    }

    // Filter out duplicates
    const uniqueBooks = Array.from(new Map(allBooks.map(item => [item.title, item])).values());

    fs.writeFileSync(__dirname + '/../data/books.json', JSON.stringify(uniqueBooks, null, 2));
    console.log(`Successfully generated data/books.json with ${uniqueBooks.length} unique real books!`);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

fetchGoogleBooks();
