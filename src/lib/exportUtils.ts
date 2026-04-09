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

// ─── Simple PDF Export (text-based, no binary issues) ───
export function exportToPDF(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  title: string,
  filename: string
) {
  // Build an HTML table and print it
  const colWidths = columns.map(() => `${Math.floor(100 / columns.length)}%`);
  
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @media print { @page { size: A4 landscape; margin: 15mm; } }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; margin: 0; padding: 20px; }
  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; border-bottom: 2px solid #1B6B3A; padding-bottom: 12px; }
  .header h1 { color: #1B6B3A; font-size: 18px; margin: 0; }
  .header p { color: #666; font-size: 10px; margin: 2px 0; }
  .title { font-size: 14px; font-weight: bold; color: #0D47A1; margin: 8px 0 4px; }
  .meta { font-size: 9px; color: #888; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1B6B3A; color: white; padding: 6px 8px; text-align: left; font-size: 10px; font-weight: 600; }
  td { padding: 5px 8px; border-bottom: 1px solid #e0e0e0; font-size: 10px; }
  tr:nth-child(even) { background: #f8f8f8; }
  .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 8px; color: #999; text-align: center; }
</style></head><body>`;
  
  html += `<div class="header"><div><h1>AgroConnect SARL</h1><p>Distribution Agroalimentaire — Douala, Cameroun</p></div></div>`;
  html += `<div class="title">${title}</div>`;
  html += `<div class="meta">Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")} — ${data.length} enregistrement(s)</div>`;
  
  html += `<table><thead><tr>`;
  columns.forEach(c => { html += `<th>${c.label}</th>`; });
  html += `</tr></thead><tbody>`;
  
  data.forEach(row => {
    html += `<tr>`;
    columns.forEach(c => {
      html += `<td>${escapeHtml(String(row[c.key] ?? "—"))}</td>`;
    });
    html += `</tr>`;
  });
  
  html += `</tbody></table>`;
  html += `<div class="footer">AgroConnect ERP — Document confidentiel — ${new Date().getFullYear()}</div>`;
  html += `</body></html>`;

  // Open in new window and trigger print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
export function flattenForExport(
  data: any[],
  columnDefs: { key: string; label: string; render?: (row: any) => string }[]
): { data: Record<string, any>[]; columns: { key: string; label: string }[] } {
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
