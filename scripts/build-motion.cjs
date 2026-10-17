const fs = require('node:fs');
const path = require('node:path');
const source = path.dirname(require.resolve('gsap/package.json'));
const destination = path.resolve(__dirname, '../public/assets/vendor/gsap');
fs.mkdirSync(destination, { recursive: true });
for (const file of ['gsap.min.js', 'ScrollTrigger.min.js']) {
  fs.copyFileSync(path.join(source, 'dist', file), path.join(destination, file));
}
const metadata = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
fs.writeFileSync(path.join(destination, 'NOTICE.txt'), `GSAP ${metadata.version}\n${metadata.license}\nhttps://gsap.com/standard-license/\nCopyright and license headers are retained in the distributed scripts.\n`);
console.log('Built local GSAP and ScrollTrigger assets.');
