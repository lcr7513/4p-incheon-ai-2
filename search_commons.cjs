const https = require("https");

async function searchCommons(term) {
  return new Promise((resolve) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(term)}&srlimit=10`;
    https.get(url, { headers: { "User-Agent": "IncheonLabPhotoBot/1.0 (contact@example.edu)" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query?.search || []);
        } catch(e) { resolve([]); }
      });
    }).on("error", () => resolve([]));
  });
}

async function run() {
  const terms = [
    "Cheongna",
    "청라",
    "송도",
    "Songdo",
    "수도권매립지",
    "드림파크",
    "Dreampark",
    "원적산",
    "스타트업파크",
    "투모로우시티",
    "Tomorrow City Incheon"
  ];

  for (const t of terms) {
    const res = await searchCommons(t);
    console.log(`=== Results for: ${t} (${res.length}) ===`);
    res.slice(0, 5).forEach(r => console.log(`  ${r.title}`));
  }
}

run();
