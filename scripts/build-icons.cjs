const fs = require('node:fs');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const icons = {
  'arrow-right': 'ArrowRight', 'arrow-up-right': 'ArrowUpRight',
  'arrow-left': 'ArrowLeft', 'arrow-up': 'ArrowUp', 'arrow-down': 'ArrowDown',
  'external-link': 'ExternalLink', menu: 'Menu', x: 'X', instagram: 'Instagram', linkedin: 'Linkedin', lightbulb: 'Lightbulb', 'pen-tool': 'PenTool', 'code-2': 'CodeXml', users: 'Users',
  'message-circle': 'MessageCircle', 'file-text': 'FileText', mail: 'Mail',
  'maximize-2': 'Maximize2', 'zoom-in': 'ZoomIn', 'zoom-out': 'ZoomOut', 'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight', 'refresh-cw': 'RefreshCw',
  'image-off': 'ImageOff', search: 'Search', 'bar-chart-3': 'ChartNoAxesCombined',
  trophy: 'Trophy', 'check-check': 'CheckCheck', 'calendar-days': 'CalendarDays',
  'layout-dashboard': 'LayoutDashboard', 'map-pin': 'MapPin',
  'mouse-pointer-2': 'MousePointer2', 'plus': 'Plus', play: 'Play', pause: 'Pause',
  megaphone: 'Megaphone', palette: 'Palette', layers: 'Layers', sparkles: 'Sparkles', workflow: 'Workflow',
};

async function build() {
const lucide = await import('lucide-react');
const symbols = Object.entries(icons).map(([id, component]) => {
  if (!lucide[component]) throw new Error(`Unknown Lucide icon: ${component}`);
  const svg = renderToStaticMarkup(React.createElement(lucide[component]));
  const paths = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<symbol id="${id}" viewBox="0 0 24 24">${paths}</symbol>`;
});
// Combine the existing Lucide palette and code paths into one shared silhouette.
const inner = component => renderToStaticMarkup(React.createElement(component)).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const code = inner(lucide.CodeXml);
symbols.push(`<symbol id="design-build" viewBox="0 0 28 28">${inner(lucide.Palette)}<g transform="translate(12 13) scale(.6)"><g stroke="var(--canvas,#060706)" stroke-width="7">${code}</g><g stroke-width="3">${code}</g></g></symbol>`);
const destination = path.join(__dirname, '../public/assets/icons');
fs.mkdirSync(destination, { recursive: true });
fs.writeFileSync(path.join(destination, 'lucide.svg'),
  `<!-- Generated from lucide-react. Run npm run build:icons. -->\n<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('\n')}</svg>\n`);
fs.copyFileSync(path.join(path.dirname(require.resolve('lucide-react/package.json')), 'LICENSE'), path.join(destination, 'LICENSE-Lucide.txt'));
console.log(`Built ${symbols.length} Lucide icons.`);
}
build().catch((error) => { console.error(error); process.exitCode = 1; });
