const fs = require("fs-extra");
const path = require("path");
const QRCode = require("qrcode");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const Order = require("../modals/Order");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "pdfs");

async function generateOfferPDF(order) {
  await fs.ensureDir(UPLOAD_DIR);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const textSize = 12;
  let y = 800;

  page.drawText("OFFER DOCUMENT", { x: 50, y, size: 16, font });
  y -= 40;

  page.drawText(`Offer ID: ${order.offer_id}`, {
    x: 50,
    y,
    size: textSize,
    font,
  });
  y -= 20;
  page.drawText(`Company: ${order.company_snapshot.company_name}`, {
    x: 50,
    y,
    size: textSize,
    font,
  });
  y -= 20;
  page.drawText(`Customer: ${order.customer_snapshot.company_name}`, {
    x: 50,
    y,
    size: textSize,
    font,
  });
  y -= 20;
  page.drawText(`Product: ${order.product_snapshot.name}`, {
    x: 50,
    y,
    size: textSize,
    font,
  });
  y -= 20;
  page.drawText(`Amount: €${order.order_amount}`, {
    x: 50,
    y,
    size: textSize,
    font,
  });

  const pdfBytes = await pdfDoc.save();
  const filename = `${order.offer_id}-${Date.now()}.pdf`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, pdfBytes);

  return filename;
}

async function generateLieferscheinPDF(order) {
  await fs.ensureDir(UPLOAD_DIR);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const textSize = 12;
  let y = 800;

  page.drawText("LIEFERSCHEIN", { x: 50, y, size: 16, font });
  y -= 40;

  page.drawText(`Order ID: ${order.order_id}`, {
    x: 50,
    y,
    size: textSize,
    font,
  });
  y -= 20;
  page.drawText(`Company: ${order.company_snapshot.company_name}`, {
    x: 50,
    y,
    size: textSize,
    font,
  });
  y -= 20;
  page.drawText(`Customer: ${order.customer_snapshot.company_name}`, {
    x: 50,
    y,
    size: textSize,
    font,
  });
  y -= 20;
  page.drawText(`Product: ${order.product_snapshot.name}`, {
    x: 50,
    y,
    size: textSize,
    font,
  });
  y -= 20;
  page.drawText(
    `Quantity: ${order.quantity_ordered} ${order.product_snapshot.unit_type}`,
    { x: 50, y, size: textSize, font }
  );

  // QR Code with delivery passcode
  const qrURL = `https://kinetra.io/confirm-delivery/${order._id}`;
  const qrImageBuffer = await QRCode.toBuffer(qrURL);
  const qrImage = await pdfDoc.embedPng(qrImageBuffer);
  const qrDims = qrImage.scale(0.3);
  page.drawImage(qrImage, {
    x: 400,
    y: 700,
    width: qrDims.width,
    height: qrDims.height,
  });
  page.drawText("Scan to confirm delivery", { x: 400, y: 685, size: 10, font });

  const pdfBytes = await pdfDoc.save();
  const filename = `delivery-note-${order.order_id}-${Date.now()}.pdf`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, pdfBytes);

  return filename;
}

module.exports = {
  generateOfferPDF,
  generateLieferscheinPDF,
};
