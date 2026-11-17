const fs = require('fs');
const https = require('https');
const path = require('path');

const img = { url: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=1200&q=80&fm=webp', name: 'dreampark.webp' };
const dir = path.join(__dirname, 'public', 'images', 'incheon');

const filePath = path.join(dir, img.name);
https.get(img.url, (res) => {
  const fileStream = fs.createWriteStream(filePath);
  res.pipe(fileStream);
  fileStream.on('finish', () => {
    console.log(`Downloaded ${img.name}`);
  });
});
