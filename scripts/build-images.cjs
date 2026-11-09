// Deterministic encoding only. Source files must never be overwritten.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'assets/images');
async function main() {
  const photo = await sharp(path.join(dir, 'centering-2-valve.jpeg'))
    .resize(1280).webp({ quality: 90 }).toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="1200" viewBox="0 0 1280 1200">
  <title>入口阀台：①数字显示 ②阀按钮</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#ffdd38"/></marker></defs>
  <rect width="1280" height="1200" rx="20" fill="#102b46"/>
  <image x="0" y="100" width="1280" height="960" href="data:image/webp;base64,${photo.toString('base64')}"/>
  <g font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="40" font-weight="700" fill="white">
    <text x="40" y="66">① 观察数字显示：按住后应大于 150</text>
    <text x="40" y="1150">② 按住此阀按钮 · 连续异常 3 次联系点检</text>
  </g>
  <g fill="none" stroke="#102b46" stroke-width="14" stroke-linejoin="round"><path d="M407 88 L407 225"/><path d="M540 1090 L540 905"/></g>
  <g fill="none" stroke="#ffdd38" stroke-width="6" stroke-linejoin="round" marker-end="url(#arrow)"><path d="M407 88 L407 225"/><path d="M540 1090 L540 905"/></g>
  <g fill="none" stroke="#ffdd38" stroke-width="5"><rect x="381" y="244" width="54" height="42" rx="8"/><circle cx="540" cy="870" r="27"/></g>
  </svg>`;
  fs.writeFileSync(path.join(dir, 'centering-2-valve-guide-v1.svg'), svg);
  await sharp(path.join(dir, 'lower-roll-controls-annotated.png')).webp({ lossless: true }).toFile(path.join(dir, 'lower-roll-controls-v1.webp'));
  await sharp(path.join(dir, 'lower-roll-qcds.png')).webp({ lossless: true }).toFile(path.join(dir, 'lower-roll-qcds-v1.webp'));
  console.log('Derived images built; source files preserved.');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
