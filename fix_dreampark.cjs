const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'data', 'labsData.ts');
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  "imageUrl: '/images/incheon/baedari-bookstore.webp',",
  "imageUrl: '/images/incheon/dreampark.webp',"
);
content = content.replace(
  "imageCaption: '드림파크 탐구를 위한 숲 참고 이미지 (실제 장소 사진 아님)',",
  "imageCaption: '수도권 매립지 드림파크 야생화 생태공원의 아름다운 가을 코스모스 풍경',"
);
content = content.replace(
  "isRealIncheonPhoto: false,\n        photoCredit: 'Unsplash 참고 이미지 · 실제 장소 사진 아님 · 현장 실사로 교체 권장',",
  "isRealIncheonPhoto: true,\n        photoCredit: '드림파크 야생화단지 실제 풍경 (Wikimedia Commons)',"
);

fs.writeFileSync(p, content, 'utf8');
console.log('Fixed dreampark image data.');
