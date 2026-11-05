const fs = require('fs');
const path = require('path');

// ─── 1. Icons Manifest ─────────────────────────────────────────────
const iconsDir = path.join(__dirname, 'icons');
if (fs.existsSync(iconsDir)) {
  const iconFiles = fs.readdirSync(iconsDir);
  const iconManifest = iconFiles
    .filter(f => f.endsWith('.svg'))
    .map(svgFile => {
      const name = svgFile.replace('.svg', '');
      const jsonFile = `${name}.json`;
      let meta = null;
      if (fs.existsSync(path.join(iconsDir, jsonFile))) {
        try {
          meta = JSON.parse(fs.readFileSync(path.join(iconsDir, jsonFile), 'utf-8'));
        } catch {}
      }
      return {
        name,
        svgPath: `icons/${svgFile}`,
        jsonPath: `icons/${jsonFile}`,
        tags: meta?.tags || [],
        categories: meta?.categories || []
      };
    });

  fs.writeFileSync(path.join(__dirname, 'icons-manifest.json'), JSON.stringify(iconManifest));
  console.log(`Generated icons-manifest.json with ${iconManifest.length} icons.`);
}

// ─── 2. Elements Manifest ──────────────────────────────────────────
const CATEGORY_MAP = {
  buttons: 'Buttons',
  cards: 'Cards',
  checkboxes: 'Checkboxes',
  forms: 'Forms',
  inputs: 'Inputs',
  loaders: 'loaders',
  notifications: 'Notifications',
  patterns: 'Patterns',
  radio: 'Radio-buttons',
  'radio-buttons': 'Radio-buttons',
  toggles: 'Toggle-switches',
  tooltips: 'Tooltips'
};

const REVERSE_CATEGORY_MAP = {};
for (const [urlCat, ghDir] of Object.entries(CATEGORY_MAP)) {
  REVERSE_CATEGORY_MAP[ghDir.toLowerCase()] = urlCat;
}

const categories = Array.from(new Set(Object.values(CATEGORY_MAP)));
const elementManifest = [];

for (const dir of categories) {
  const fullDir = path.join(__dirname, dir);
  if (!fs.existsSync(fullDir)) continue;

  const urlCategory = REVERSE_CATEGORY_MAP[dir.toLowerCase()] || dir.toLowerCase();
  const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.html'));

  for (const filename of files) {
    const rawContent = fs.readFileSync(path.join(fullDir, filename), 'utf-8');
    const nameWithoutExt = filename.replace(/\.html$/i, '');
    const underscoreIdx = nameWithoutExt.indexOf('_');
    const rawSlug = underscoreIdx > 0 ? nameWithoutExt.substring(underscoreIdx + 1) : nameWithoutExt;

    let tags = [];
    const tagsMatch = rawContent.match(/\/\*.*?Tags?:\s*([^*]+)\*\//i);
    if (tagsMatch) {
      tags = tagsMatch[1]
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t && t.length > 0 && t.length < 30);
    }
    if (!tags.includes(urlCategory)) {
      tags.unshift(urlCategory);
    }

    const title = rawSlug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .replace(/\s\d+$/, '');

    elementManifest.push({
      name: filename,
      path: `${dir}/${filename}`,
      categoryDir: dir,
      category: urlCategory,
      slug: `${urlCategory}-${rawSlug}`,
      rawSlug,
      title,
      author: 'PRIYANSHU KESHARWANI',
      tags
    });
  }
}

fs.writeFileSync(path.join(__dirname, 'elements-manifest.json'), JSON.stringify(elementManifest));
console.log(`Generated elements-manifest.json with ${elementManifest.length} elements.`);
