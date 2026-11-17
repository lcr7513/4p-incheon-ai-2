const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
  { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80&fm=webp', name: 'songdo-gtower.webp' },
  { url: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=80&fm=webp', name: 'startup-park.webp' },
  { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80&fm=webp', name: 'baedari-bookstore.webp' }, 
  { url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80&fm=webp', name: 'dreampark.webp' },
  { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80&fm=webp', name: 'seaside-park.webp' }
];

const dir = path.join(__dirname, 'public', 'images', 'incheon');

images.forEach(img => {
  const filePath = path.join(dir, img.name);
  https.get(img.url, (res) => {
    const fileStream = fs.createWriteStream(filePath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      console.log(`Downloaded ${img.name}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${img.name}:`, err);
  });
});
