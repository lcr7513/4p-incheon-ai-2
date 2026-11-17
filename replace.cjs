const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'data', 'labsData.ts');
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'",
  "imageUrl: '/images/incheon/songdo-gtower.webp'"
);
content = content.replace(
  "imageUrl: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=80'",
  "imageUrl: '/images/incheon/startup-park.webp'"
);
content = content.replace(
  "imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80'",
  "imageUrl: '/images/incheon/baedari-bookstore.webp'"
);
content = content.replace(
  "imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80'",
  "imageUrl: '/images/incheon/dreampark.webp'"
);
content = content.replace(
  "imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80'",
  "imageUrl: '/images/incheon/seaside-park.webp'"
);

fs.writeFileSync(p, content, 'utf8');
console.log('Replaced.');
