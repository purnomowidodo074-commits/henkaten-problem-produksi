import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export interface ProblemForPdf {
  date: string;
  line: string;
  jenisProblem: string;
  problem: string;
  namaMesin: string;
  planningPerbaikan: string;
  status: string;
  keterangan: string;
  picPerbaikan: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch("/logo.png");
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function buildChartData(problems: ProblemForPdf[]) {
  const currentYear = new Date().getFullYear();
  const map: Record<string, { onProgress: number; finish: number }> = {};
  for (const p of problems) {
    const d = new Date(p.date);
    if (d.getFullYear() !== currentYear) continue;
    const key = MONTHS_ID[d.getMonth()];
    if (!map[key]) map[key] = { onProgress: 0, finish: 0 };
    if (p.status === "On progress") map[key].onProgress++;
    else map[key].finish++;
  }
  return MONTHS_ID.map((m) => ({ month: m, onProgress: map[m]?.onProgress ?? 0, finish: map[m]?.finish ?? 0 }));
}

function drawKpiCards(
  doc: jsPDF,
  total: number,
  onProgress: number,
  finish: number,
  x: number,
  y: number,
  totalW: number
) {
  const gap = 4;
  const cardW = (totalW - gap * 2) / 3;
  const cardH = 18;

  const cards = [
    { label: "Total Problem Bulan Ini", value: total, rgb: [51, 65, 85] as [number, number, number] },
    { label: "On Progress", value: onProgress, rgb: [245, 158, 11] as [number, number, number] },
    { label: "Finish", value: finish, rgb: [16, 185, 129] as [number, number, number] },
  ];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cx = x + i * (cardW + gap);

    // Card bg + border
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 226, 234);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, cardW, cardH, 1.5, 1.5, "FD");

    // Colored icon box
    const iconSz = 9;
    const iconX = cx + 4;
    const iconY = y + (cardH - iconSz) / 2;
    doc.setFillColor(card.rgb[0], card.rgb[1], card.rgb[2]);
    doc.roundedRect(iconX, iconY, iconSz, iconSz, 1, 1, "F");

    // Value
    const textX = iconX + iconSz + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(30, 41, 59);
    doc.text(String(card.value), textX, y + 9);

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, textX, y + 14);
  }
}

function drawBarChart(
  doc: jsPDF,
  data: { month: string; onProgress: number; finish: number }[],
  x: number,
  y: number,
  w: number,
  h: number
) {
  const maxVal = Math.max(...data.map((d) => d.onProgress + d.finish), 1);
  const scale = h / maxVal;
  const baseY = y + h;
  const groupW = w / 12;
  const barW = Math.min(4, groupW * 0.32);
  const barGap = 0.8;

  // Grid lines + Y labels
  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const val = Math.round((maxVal * i) / gridSteps);
    const gy = baseY - val * scale;
    doc.setDrawColor(i === 0 ? 180 : 230, i === 0 ? 180 : 230, i === 0 ? 180 : 230);
    doc.setLineWidth(i === 0 ? 0.3 : 0.15);
    doc.line(x, gy, x + w, gy);
    doc.setFontSize(4.5);
    doc.setTextColor(150, 150, 150);
    doc.text(String(val), x - 1.5, gy + 1.2, { align: "right" });
  }

  // Bars
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const gx = x + i * groupW;
    const bx1 = gx + (groupW - barW * 2 - barGap) / 2;
    const bx2 = bx1 + barW + barGap;

    if (d.finish > 0) {
      const bh = d.finish * scale;
      doc.setFillColor(16, 185, 129);
      doc.rect(bx1, baseY - bh, barW, bh, "F");
    }
    if (d.onProgress > 0) {
      const bh = d.onProgress * scale;
      doc.setFillColor(245, 158, 11);
      doc.rect(bx2, baseY - bh, barW, bh, "F");
    }

    // Month label
    doc.setFontSize(4.5);
    doc.setTextColor(110, 110, 110);
    doc.text(d.month, gx + groupW / 2, baseY + 3.5, { align: "center" });
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function downloadPdf(problems: ProblemForPdf[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentW = pageW - margin * 2;

  const logoData = await fetchLogoBase64();

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(204, 0, 0);
  doc.rect(0, 0, pageW, 4, "F");

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 4, pageW, 18, "F");

  // Toyota logo — top-left, vertically centered in the 18mm white area
  if (logoData) {
    doc.addImage(logoData, "PNG", margin, 9, 22, 8);
  }

  // Centered title — both lines share the same size and color
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  doc.text("SISTEM INFORMASI", pageW / 2, 11, { align: "center" });
  doc.text("Henkaten & Problem Produksi", pageW / 2, 18, { align: "center" });

  doc.setFillColor(204, 0, 0);
  doc.rect(0, 22, pageW, 4, "F");

  // ── KPI Cards ─────────────────────────────────────────────────────────────
  const now = new Date();
  const totalBulanIni = problems.filter((p) => {
    const d = new Date(p.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const onProgressCount = problems.filter((p) => p.status === "On progress").length;
  const finishCount = problems.filter((p) => p.status === "Finish").length;

  drawKpiCards(doc, totalBulanIni, onProgressCount, finishCount, margin, 29, contentW);

  // ── Monthly Chart ──────────────────────────────────────────────────────────
  const chartContainerY = 50;
  const chartContainerH = 58;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 226, 234);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, chartContainerY, contentW, chartContainerH, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Rekapitulasi Bulanan", margin + 4, chartContainerY + 6);

  const chartInnerX = margin + 10;
  const chartInnerY = chartContainerY + 9;
  const chartInnerW = contentW - 16;
  const chartInnerH = 38;
  drawBarChart(doc, buildChartData(problems), chartInnerX, chartInnerY, chartInnerW, chartInnerH);

  // Chart legend (centered)
  const legLineY = chartContainerY + chartContainerH - 7;
  const midX = pageW / 2;
  doc.setFontSize(6);
  doc.setTextColor(80, 80, 80);

  doc.setFillColor(16, 185, 129);
  doc.rect(midX - 22, legLineY, 3.5, 3, "F");
  doc.text("Finish", midX - 17, legLineY + 2.3);

  doc.setFillColor(245, 158, 11);
  doc.rect(midX - 2, legLineY, 3.5, 3, "F");
  doc.text("On Progress", midX + 3, legLineY + 2.3);

  // ── Table Title ────────────────────────────────────────────────────────────
  const titleY = chartContainerY + chartContainerH + 4;
  doc.setFillColor(255, 204, 0);
  doc.rect(margin, titleY, contentW, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("MANAGEMENT DATA PROBLEM PRODUKSI", pageW / 2, titleY + 6.2, { align: "center" });

  // ── Table ──────────────────────────────────────────────────────────────────
  // 9 columns totalling 190mm:
  // 15+19+12+36+18+16+18+15+auto(41) = 190
  autoTable(doc, {
    startY: titleY + 11,
    head: [["Tanggal", "Line", "Jenis Problem", "Problem", "Nama Mesin", "PIC Perbaikan", "Planning Perbaikan", "Status", "Keterangan"]],
    body: problems.map((p) => [
      format(new Date(p.date), "dd/MM/yyyy"),
      p.line,
      p.jenisProblem,
      p.problem,
      p.namaMesin,
      p.picPerbaikan || "-",
      p.planningPerbaikan || "-",
      p.status,
      p.keterangan || "-",
    ]),
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 6,
      cellPadding: { top: 1.8, right: 1.5, bottom: 1.8, left: 1.5 },
      overflow: "linebreak",
      lineWidth: 0.2,
      lineColor: [200, 200, 200],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.3,
      lineColor: [160, 160, 160],
      halign: "left",
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: 19 },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 36 },
      4: { cellWidth: 18 },
      5: { cellWidth: 16 },
      6: { cellWidth: 18, halign: "center" },
      7: { cellWidth: 15, halign: "center" },
      8: { cellWidth: "auto" },
    },
    didParseCell: (data) => {
      if (data.section === "body") {
        if (problems[data.row.index]?.status === "On progress") {
          data.cell.styles.fillColor = [255, 251, 200];
        }
      }
    },
  });

  // ── Footer legend ──────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY: number = (doc as any).lastAutoTable?.finalY ?? 260;
  const footY = finalY + 5;

  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.setDrawColor(180, 180, 180);

  doc.setFillColor(255, 251, 200);
  doc.rect(margin, footY, 4, 3, "FD");
  doc.text("On Progress", margin + 6, footY + 2.4);

  doc.setFillColor(255, 255, 255);
  doc.rect(margin + 34, footY, 4, 3, "FD");
  doc.text("Finish", margin + 40, footY + 2.4);

  doc.save("List problem Produksi & Henkaten.pdf");
}
