const https = require('https');
const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent("수도권매립지 드림파크 야생화 생태공원");

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<img[^>]+src="([^">]+)"/g);
    if(match) {
        match.forEach(m => console.log(m));
    }
  });
});
