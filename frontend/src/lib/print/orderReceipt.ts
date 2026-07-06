import type { Order } from "@/lib/orders/types";
import { formatMoney } from "@/lib/orders/types";
import {
  buildOrderTotalsPrintHtml,
  calculateOrderTotals,
} from "@/lib/orders/orderTotals";

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("th-TH");
}

function channelLabel(channel: string) {
  if (channel === "Online Store") return "เว็บ";
  return channel;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildOrderReceiptHtml(order: Order) {
  const totals = calculateOrderTotals(order);
  const totalsHtml = buildOrderTotalsPrintHtml(totals);

  const itemsHtml = (order.items ?? [])
    .map((item) => {
      const options = [item.color, item.size].filter(Boolean).join(" / ") || "-";
      return `
        <div class="item">
          <div class="item-name">
            <div class="title">${escapeHtml(item.product_name)}</div>
            <div class="meta">(${escapeHtml(options)}) x ${item.quantity}</div>
          </div>
          <div class="amount">฿${formatMoney(item.price * item.quantity)}</div>
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>ใบเสร็จ #${escapeHtml(order.order_number)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: "Courier New", Courier, monospace;
      font-size: 12px;
      color: #0f172a;
      background: #fff;
    }
    .receipt { max-width: 360px; margin: 0 auto; }
    .header {
      text-align: center;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    .brand { font-size: 18px; font-weight: 900; letter-spacing: 0.2em; margin: 0; }
    .sub { font-size: 10px; color: #64748b; margin: 4px 0 0; }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 4px;
      font-size: 11px;
      color: #475569;
    }
    .row strong { color: #0f172a; }
    .section {
      border-top: 1px dashed #cbd5e1;
      padding-top: 12px;
      margin-top: 12px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }
    .item-name { max-width: 70%; }
    .title { font-weight: 700; }
    .meta { font-size: 10px; color: #64748b; margin-top: 2px; }
    .amount { font-weight: 700; white-space: nowrap; }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 11px;
      color: #334155;
    }
    .grand-total {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 900;
      color: #0f172a;
      margin-top: 6px;
    }
    .discount { color: #be123c; font-weight: 700; }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #64748b;
      margin-top: 16px;
    }
    @media print {
      body { padding: 0; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1 class="brand">AESTHETE</h1>
      <p class="sub">ห้างสรรพสินค้าแฟชั่นชั้นนำ</p>
      <p class="sub">ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</p>
    </div>

    <div class="row"><span>เลขที่ออเดอร์:</span><strong>#${escapeHtml(order.order_number)}</strong></div>
    <div class="row"><span>วันเวลา:</span><span>${escapeHtml(formatDate(order.created_at))}</span></div>
    <div class="row"><span>ช่องทาง:</span><span>${escapeHtml(channelLabel(order.channel))}</span></div>
    <div class="row"><span>ชำระเงิน:</span><span>${escapeHtml(order.payment_method ?? "-")}</span></div>
    <div class="row"><span>ลูกค้า:</span><span>${escapeHtml(order.customer?.name ?? "Walk-in")}</span></div>

    <div class="section">
      ${itemsHtml || '<div class="row"><span>ไม่มีรายการสินค้า</span></div>'}
    </div>

    <div class="section">
      ${totalsHtml}
    </div>

    <div class="footer section">
      <p>ขอบคุณที่วางใจเลือกช้อปสินค้า AESTHETE</p>
    </div>
  </div>
</body>
</html>`;
}

export function printOrderReceipt(order: Order) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(iframe);

  const printWindow = iframe.contentWindow;
  const printDocument = iframe.contentDocument ?? printWindow?.document;

  if (!printWindow || !printDocument) {
    iframe.remove();
    return;
  }

  printDocument.open();
  printDocument.write(buildOrderReceiptHtml(order));
  printDocument.close();

  const triggerPrint = () => {
    try {
      printWindow.focus();
      printWindow.print();
    } finally {
      window.setTimeout(() => iframe.remove(), 1000);
    }
  };

  if (printDocument.readyState === "complete") {
    window.setTimeout(triggerPrint, 150);
    return;
  }

  iframe.onload = () => window.setTimeout(triggerPrint, 150);
}
