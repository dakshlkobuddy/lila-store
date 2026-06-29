import jsPDF from "jspdf";
import "jspdf-autotable";
import { money } from "./format.js";
import { BRAND } from "../constants.js";

/**
 * Generates and downloads a PDF Invoice for a given order.
 * @param {Object} order The order object from Supabase.
 */
export function generateInvoice(order) {
  if (!order) return;

  // Initialize jsPDF (portrait, pt, A4)
  const doc = new jsPDF("p", "pt", "a4");

  const pageWidth = doc.internal.pageSize.width;
  
  // ── Header ──────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(34, 34, 34);
  doc.text(BRAND, 40, 60);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Lila & Co. Store", 40, 78);
  doc.text("Online Women's Everyday Wear", 40, 92);
  doc.text("Email: support@lilastore.com", 40, 106);
  
  // Invoice Details (Right-aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(34, 34, 34);
  doc.text("INVOICE", pageWidth - 40, 60, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Order ID: ${order.id}`, pageWidth - 40, 78, { align: "right" });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}`, pageWidth - 40, 92, { align: "right" });
  doc.text(`Status: ${order.status}`, pageWidth - 40, 106, { align: "right" });

  // ── Customer Details ────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text("Bill To:", 40, 150);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const ship = order.shipping || {};
  let y = 166;
  doc.text(`${ship.name || order.customer_name}`, 40, y); y += 14;
  if (ship.phone) { doc.text(`${ship.phone}`, 40, y); y += 14; }
  if (ship.address) { doc.text(`${ship.address}`, 40, y); y += 14; }
  if (ship.city && ship.state) { doc.text(`${ship.city}, ${ship.state} - ${ship.pincode || ""}`, 40, y); y += 14; }

  // ── Order Items Table ───────────────────────────────────
  const items = order.order_items || [];
  
  const tableData = items.map((item, index) => {
    const details = [item.size, item.colour].filter(Boolean).join(" | ");
    const name = details ? `${item.product_name}\n(${details})` : item.product_name;
    return [
      index + 1,
      name,
      money(item.price),
      item.quantity,
      money(item.price * item.quantity)
    ];
  });

  doc.autoTable({
    startY: 230,
    head: [["#", "Item Description", "Unit Price", "Qty", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [192, 87, 59], textColor: 255, fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 8, valign: "middle" },
    columnStyles: {
      0: { cellWidth: 40 },
      2: { cellWidth: 80, halign: "right" },
      3: { cellWidth: 50, halign: "center" },
      4: { cellWidth: 90, halign: "right" },
    },
    margin: { left: 40, right: 40 }
  });

  // ── Total Summary ───────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY || 230;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(34, 34, 34);
  doc.text("Grand Total:", pageWidth - 130, finalY + 30, { align: "right" });
  
  doc.setFontSize(14);
  doc.text(money(order.total), pageWidth - 40, finalY + 30, { align: "right" });

  // ── Footer ──────────────────────────────────────────────
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for shopping with Lila & Co.!", pageWidth / 2, doc.internal.pageSize.height - 40, { align: "center" });

  // Save the PDF
  doc.save(`Invoice_${order.id}.pdf`);
}
