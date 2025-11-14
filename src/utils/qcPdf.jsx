// src/utils/qcPdf.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";   // ✅ use the function, not side effect

export function generateQCReport(opts) {
  const { title, preface, sections, footerNotes = [], logoPath, meta = {} } = opts;

  const doc = new jsPDF({ unit: "pt", format: "A4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  let cursorY = margin;

  const draw = () => {
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, margin, cursorY);
    cursorY += 18;

    // Meta
    const metaBits = [];
    if (meta.inspector) metaBits.push(`Inspected by: ${meta.inspector}`);
    if (meta.date) metaBits.push(`Date: ${meta.date}`);
    if (meta.serial) metaBits.push(`Serial: ${meta.serial}`);
    if (metaBits.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(metaBits.join("   |   "), margin, cursorY);
      cursorY += 14;
    }

    // Preface
    if (preface) {
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(preface, pageW - 2 * margin);
      doc.text(lines, margin, cursorY);
      cursorY += 12 + lines.length * 12;
    }

    // Sections
    sections.forEach((section) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(section.heading, margin, cursorY);
      cursorY += 8;

      const body = (section.rows || []).map(r => [
        String(r.field || "").trim(),
        String(r.value ?? "").trim() || "—",
      ]);

      // ✅ call the function, passing doc
      autoTable(doc, {
        startY: cursorY + 6,
        theme: "grid",
        styles: { font: "helvetica", fontSize: 10, cellPadding: 6, lineWidth: 0.1 },
        headStyles: { fillColor: [230, 230, 230], textColor: 20, halign: "left" },
        head: [["Field", "Response"]],
        body,
        margin: { left: margin, right: margin },
        tableWidth: pageW - 2 * margin,
        didDrawPage: () => {
          const str = `Page ${doc.internal.getNumberOfPages()}`;
          doc.setFontSize(9);
          doc.text(str, pageW - margin, pageH - 10, { align: "right" });
        },
      });

      cursorY = doc.lastAutoTable.finalY + 16;
    });

    // Footer notes
    if (footerNotes.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      footerNotes.forEach((n) => {
        const lines = doc.splitTextToSize(n, pageW - 2 * margin);
        doc.text(lines, margin, cursorY);
        cursorY += lines.length * 12 + 4;
      });
    }

    return doc;
  };

  // Optional logo (async)
  return new Promise((resolve) => {
    if (!logoPath) return resolve(draw());
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const h = 28;
      const w = (img.width / img.height) * h;
      doc.addImage(img, "PNG", margin, cursorY, w, h);
      cursorY += h + 8;
      resolve(draw());
    };
    img.onerror = () => resolve(draw());
    img.src = logoPath;
  });
}

export function makeSections(sectionMap) {
  return Object.entries(sectionMap).map(([heading, obj]) => ({
    heading,
    rows: Object.entries(obj).map(([field, value]) => ({ field, value })),
  }));
}

