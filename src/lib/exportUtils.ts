import { CURRENCY } from "./constants";

// ─── CSV Export ───
export function exportToCSV(data: Record<string, any>[], columns: { key: string; label: string }[], filename: string) {
  const header = columns.map(c => c.label).join(",");
  const rows = data.map(row =>
    columns.map(c => {
      const val = String(row[c.key] ?? "").replace(/"/g, '""');
      return `"${val}"`;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

// ─── PDF Export ───
export function exportToPDF(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  title: string,
  filename: string
) {
  const pageWidth = 842; // A4 landscape
  const pageHeight = 595;
  const margin = 40;
  const headerHeight = 80;
  const rowHeight = 20;
  const fontSize = 9;
  const headerFontSize = 10;
  const colWidth = (pageWidth - 2 * margin) / columns.length;
  
  let currentY = 0;
  let pageNum = 1;
  const pages: string[] = [];
  let currentPageContent = "";

  const startNewPage = () => {
    if (currentPageContent) {
      pages.push(currentPageContent);
    }
    currentPageContent = "";
    currentY = margin + headerHeight;
    pageNum++;
    
    // Header on each page
    currentPageContent += drawText("AgroConnect SARL — ERP", margin, margin + 20, 14, "0 0.278 0.631 rg");
    currentPageContent += drawText(title, margin, margin + 38, 12, "0.2 0.2 0.2 rg");
    currentPageContent += drawText(`Généré le ${new Date().toLocaleDateString("fr-FR")} — Page ${pageNum}`, margin, margin + 52, 8, "0.5 0.5 0.5 rg");
    currentPageContent += drawLine(margin, margin + 60, pageWidth - margin, margin + 60);
    
    // Table header
    currentPageContent += drawRect(margin, currentY, pageWidth - 2 * margin, rowHeight, "0.106 0.420 0.227");
    columns.forEach((col, i) => {
      currentPageContent += drawText(col.label, margin + i * colWidth + 4, currentY + 14, headerFontSize, "1 1 1 rg");
    });
    currentY += rowHeight;
  };

  // First page
  currentPageContent += drawText("AgroConnect SARL — ERP", margin, margin + 20, 14, "0 0.278 0.631 rg");
  currentPageContent += drawText(title, margin, margin + 38, 12, "0.2 0.2 0.2 rg");
  currentPageContent += drawText(`Généré le ${new Date().toLocaleDateString("fr-FR")} — Page 1`, margin, margin + 52, 8, "0.5 0.5 0.5 rg");
  currentPageContent += drawLine(margin, margin + 60, pageWidth - margin, margin + 60);
  
  currentY = margin + headerHeight;
  // Table header
  currentPageContent += drawRect(margin, currentY, pageWidth - 2 * margin, rowHeight, "0.106 0.420 0.227");
  columns.forEach((col, i) => {
    currentPageContent += drawText(col.label, margin + i * colWidth + 4, currentY + 14, headerFontSize, "1 1 1 rg");
  });
  currentY += rowHeight;

  // Rows
  data.forEach((row, rowIdx) => {
    if (currentY + rowHeight > pageHeight - margin) {
      startNewPage();
    }
    
    const bg = rowIdx % 2 === 0 ? "0.96 0.96 0.96" : "1 1 1";
    currentPageContent += drawRect(margin, currentY, pageWidth - 2 * margin, rowHeight, bg);
    
    columns.forEach((col, i) => {
      const val = truncate(String(row[col.key] ?? "—"), Math.floor(colWidth / 5));
      currentPageContent += drawText(val, margin + i * colWidth + 4, currentY + 14, fontSize, "0.15 0.15 0.15 rg");
    });
    currentY += rowHeight;
  });

  pages.push(currentPageContent);

  // Build minimal PDF
  const pdfContent = buildPDF(pages, pageWidth, pageHeight);
  const blob = new Blob([pdfContent], { type: "application/pdf" });
  downloadBlob(blob, `${filename}.pdf`);
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.substring(0, max - 1) + "…" : s;
}

function escapeText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function drawText(text: string, x: number, y: number, size: number, color: string = "0 0 0 rg"): string {
  return `BT\n${color}\n/F1 ${size} Tf\n${x} ${y} Td\n(${escapeText(text)}) Tj\nET\n`;
}

function drawRect(x: number, y: number, w: number, h: number, color: string): string {
  return `${color} rg\n${x} ${y} ${w} ${h} re\nf\n`;
}

function drawLine(x1: number, y1: number, x2: number, y2: number): string {
  return `0.8 0.8 0.8 RG\n0.5 w\n${x1} ${y1} m\n${x2} ${y2} l\nS\n`;
}

function buildPDF(pages: string[], width: number, height: number): Uint8Array {
  const encoder = new TextEncoder();
  
  // We'll build a simple single-page PDF with all content on page 1
  // For multi-page, we concatenate content streams
  const allContent = pages.map((content, i) => {
    // Flip Y coordinates for PDF (origin is bottom-left)
    const flipped = content.replace(/(\d+\.?\d*) (\d+\.?\d*) Td/g, (_, x, y) => {
      return `${x} ${height - parseFloat(y)} Td`;
    }).replace(/(\d+\.?\d*) (\d+\.?\d*) (\d+\.?\d*) (\d+\.?\d*) re/g, (_, x, y, w, h) => {
      return `${x} ${height - parseFloat(y) - parseFloat(h)} ${w} ${h} re`;
    }).replace(/(\d+\.?\d*) (\d+\.?\d*) m/g, (_, x, y) => {
      return `${x} ${height - parseFloat(y)} m`;
    }).replace(/(\d+\.?\d*) (\d+\.?\d*) l/g, (_, x, y) => {
      return `${x} ${height - parseFloat(y)} l`;
    });
    return flipped;
  });

  // Build multi-page PDF
  let pdf = "%PDF-1.4\n";
  const objects: string[] = [];
  
  // Object 1: Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  
  // Object 2: Pages
  const pageRefs = pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ");
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>\nendobj\n`);
  
  // Font object
  const fontObjNum = 3 + pages.length * 2;
  
  // Page + Stream objects
  pages.forEach((_, i) => {
    const pageObjNum = 3 + i * 2;
    const streamObjNum = 4 + i * 2;
    
    objects.push(`${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents ${streamObjNum} 0 R /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> >>\nendobj\n`);
    
    const streamData = allContent[i];
    objects.push(`${streamObjNum} 0 obj\n<< /Length ${streamData.length} >>\nstream\n${streamData}\nendstream\nendobj\n`);
  });
  
  // Font object
  objects.push(`${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  
  // Build final PDF
  let body = "";
  const offsets: number[] = [];
  let currentOffset = pdf.length;
  
  objects.forEach(obj => {
    offsets.push(currentOffset);
    body += obj;
    currentOffset += obj.length;
  });
  
  pdf += body;
  
  // Cross-reference
  const xrefOffset = pdf.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(off => {
    xref += `${String(off).padStart(10, "0")} 00000 n \n`;
  });
  
  pdf += xref;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  
  return new Uint8Array(encoder.encode(pdf)) as unknown as BlobPart;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper to prepare flat data from any module
export function flattenForExport(data: any[], columnDefs: { key: string; label: string; render?: (row: any) => string }[]): { data: Record<string, any>[]; columns: { key: string; label: string }[] } {
  const columns = columnDefs.map(c => ({ key: c.key, label: c.label }));
  const flatData = data.map(row => {
    const flat: Record<string, any> = {};
    columnDefs.forEach(c => {
      flat[c.key] = c.render ? c.render(row) : (row[c.key] ?? "");
    });
    return flat;
  });
  return { data: flatData, columns };
}
