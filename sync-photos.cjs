const fs = require('node:fs');
const path = require('node:path');
const lists = {};
for (const folder of ['photos', 'pinterest']) {
  const directory = path.join(__dirname, 'assets', folder);
  lists[folder] = fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(jpe?g|png|webp|avif|gif)$/i.test(entry.name))
    .map(entry => entry.name).sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }));
  fs.writeFileSync(path.join(directory, 'photos.json'), JSON.stringify(lists[folder], null, 2) + '\n');
}
fs.writeFileSync(path.join(__dirname, 'photo-list.js'), 'window.sitePhotos = ' + JSON.stringify(lists, null, 2) + ';\n');
console.log(`Photos: ${lists.photos.length}; Pinterest: ${lists.pinterest.length}`);
