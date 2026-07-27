const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
const files = fs.readdirSync(iconsDir);

const manifest = files
  .filter(f => f.endsWith('.svg'))
  .map(svgFile => {
    const name = svgFile.replace('.svg', '');
    const jsonFile = `${name}.json`;
    let meta = null;
    if (fs.existsSync(path.join(iconsDir, jsonFile))) {
      meta = JSON.parse(fs.readFileSync(path.join(iconsDir, jsonFile), 'utf-8'));
    }
    return {
      name,
      svgPath: `icons/${svgFile}`,
      jsonPath: `icons/${jsonFile}`,
      tags: meta?.tags || [],
      categories: meta?.categories || []
    };
  });

fs.writeFileSync(path.join(__dirname, 'icons-manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Generated icons-manifest.json with ${manifest.length} icons.`);
