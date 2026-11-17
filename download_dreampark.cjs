const fs = require('fs');
const https = require('https');
const path = require('path');

const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Cosmos_bipinnatus_pink%2C_Burdwan%2C_West_Bengal%2C_India_10_01_2013.jpg/1200px-Cosmos_bipinnatus_pink%2C_Burdwan%2C_West_Bengal%2C_India_10_01_2013.jpg";
const filePath = path.join(__dirname, 'public', 'images', 'incheon', 'dreampark.webp');

https.get(url, (res) => {
  const fileStream = fs.createWriteStream(filePath);
  res.pipe(fileStream);
  fileStream.on('finish', () => {
    console.log('Downloaded dreampark image.');
  });
});
