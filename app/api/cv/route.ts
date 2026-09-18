import { NextResponse } from 'next/server';

function escapePdf(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function createPdf(lines: Array<{ text: string; size?: number; gap?: number }>) {
  let y = 790;
  const commands = lines.map(({ text, size = 11, gap = 18 }) => {
    const command = `BT /F1 ${size} Tf 56 ${y} Td (${escapePdf(text)}) Tj ET`;
    y -= gap;
    return command;
  }).join('\n');
  const stream = `${commands}\n`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

export async function GET() {
  const pdf = createPdf([
    { text: 'R. GADING UTAMA', size: 24, gap: 30 },
    { text: 'Creative Marketer & Digital Problem Solver', size: 14, gap: 32 },
    { text: 'PROFILE', size: 12, gap: 20 },
    { text: 'Creative problem solver combining marketing, design, technology, and AI.', gap: 16 },
    { text: 'Builds campaigns, practical workflows, and digital tools for business needs.', gap: 28 },
    { text: 'SELECTED EXPERIENCE', size: 12, gap: 22 },
    { text: '2023-present  Marketing Communication, PropTech & Creative Growth', gap: 17 },
    { text: '2023-present  Owner & Marketing Lead, Kosan Bu Endang', gap: 17 },
    { text: '2021-2023     Founder, Geektuku, akkc.id, and Diskonlicious', gap: 30 },
    { text: 'CAPABILITIES', size: 12, gap: 22 },
    { text: 'Creative marketing / Graphic design / Meta Ads / Web app development', gap: 17 },
    { text: 'Workflow automation / Generative AI / Campaign ideation / Operations', gap: 30 },
    { text: 'CONTACT', size: 12, gap: 22 },
    { text: 'WhatsApp  +62 896-5348-4274', gap: 17 },
    { text: 'Instagram  @gadingg_', gap: 17 },
    { text: 'Portfolio details and case studies are available on the main website.', gap: 17 },
  ]);

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="R-Gading-Utama-CV.pdf"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
