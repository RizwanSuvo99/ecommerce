import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface InvoiceLineItem {
  name: string;
  nameBn: string;
  sku: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceData {
  orderNumber: string;
  invoiceNumber: string;
  invoiceDate: Date;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    area: string;
    postalCode: string;
    phone: string;
  };
  billingAddress: {
    name: string;
    address: string;
    city: string;
    area: string;
    postalCode: string;
    phone: string;
  };
  items: InvoiceLineItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  couponCode: string | null;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
}

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInvoice(orderId: string): Promise<Buffer> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
        shippingAddress: true,
        billingAddress: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const invoiceData = this.mapOrderToInvoiceData(order);
    return this.renderPDF(invoiceData);
  }

  private mapOrderToInvoiceData(order: any): InvoiceData {
    const payment = order.payments?.[0];
    return {
      orderNumber: order.orderNumber,
      invoiceNumber: `INV-${order.orderNumber}`,
      invoiceDate: order.createdAt,
      customer: {
        name: order.user?.name || order.guestFullName || 'Guest',
        email: order.user?.email || order.guestEmail || '',
        phone: order.user?.phone || order.guestPhone || '',
      },
      shippingAddress: {
        name: order.shippingAddress?.name || order.user?.name || order.guestFullName || 'Guest',
        address: order.shippingAddress?.address || '',
        city: order.shippingAddress?.city || '',
        area: order.shippingAddress?.area || '',
        postalCode: order.shippingAddress?.postalCode || '',
        phone: order.shippingAddress?.phone || '',
      },
      billingAddress: {
        name: order.billingAddress?.name || order.shippingAddress?.name || order.user?.name || order.guestFullName || 'Guest',
        address: order.billingAddress?.address || order.shippingAddress?.address || '',
        city: order.billingAddress?.city || order.shippingAddress?.city || '',
        area: order.billingAddress?.area || order.shippingAddress?.area || '',
        postalCode: order.billingAddress?.postalCode || order.shippingAddress?.postalCode || '',
        phone: order.billingAddress?.phone || order.shippingAddress?.phone || '',
      },
      items: order.items.map((item: any) => ({
        name: item.product?.name || item.productName || 'Unknown Product',
        nameBn: item.product?.nameBn || item.productNameBn || '',
        sku: item.product?.sku || item.sku || '',
        variant: item.variantName || '',
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      tax: Number(order.taxAmount),
      discount: Number(order.discountAmount),
      couponCode: order.couponCode || null,
      totalAmount: Number(order.totalAmount),
      paymentMethod: payment?.method || 'CASH_ON_DELIVERY',
      paymentStatus: payment?.status || 'PENDING',
    };
  }

  private async renderPDF(data: InvoiceData): Promise<Buffer> {
    const puppeteer = require('puppeteer');
    const html = this.buildInvoiceHtml(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private formatBDT(amount: number): string {
    return `৳ ${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private escapeHtml(str: string): string {
    return (str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private buildInvoiceHtml(data: InvoiceData): string {
    const e = (s: string) => this.escapeHtml(s);
    const f = (n: number) => this.formatBDT(n);
    const invoiceDate = new Date(data.invoiceDate).toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const itemRows = data.items
      .map(
        (item, i) => `
        <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
          <td style="padding:12px 16px;font-size:14px;color:#4b5563">${i + 1}</td>
          <td style="padding:12px 16px">
            <div style="font-size:14px;font-weight:500;color:#111827">${e(item.name)}</div>
            <div style="font-size:12px;color:#6b7280">${e(item.nameBn)}</div>
            ${item.variant ? `<div style="font-size:11px;color:#9ca3af;margin-top:2px">${e(item.variant)}</div>` : ''}
          </td>
          <td style="padding:12px 16px;font-size:14px;color:#4b5563;font-family:monospace">${e(item.sku)}</td>
          <td style="padding:12px 16px;font-size:14px;color:#111827;text-align:center">${item.quantity}</td>
          <td style="padding:12px 16px;font-size:14px;color:#111827;text-align:right">${f(item.unitPrice)}</td>
          <td style="padding:12px 16px;font-size:14px;font-weight:500;color:#111827;text-align:right">${f(item.totalPrice)}</td>
        </tr>`,
      )
      .join('');

    const discountRow =
      data.discount > 0
        ? `<div style="display:flex;justify-content:space-between;font-size:14px">
            <span style="color:#4b5563">ছাড় / Discount ${data.couponCode ? `(${e(data.couponCode)})` : ''}:</span>
            <span style="color:#15803d">-${f(data.discount)}</span>
          </div>`
        : '';

    return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans Bengali', 'Noto Sans', sans-serif; color: #111827; }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:32px">

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1f2937;padding-bottom:24px">
      <div>
        <h1 style="font-size:24px;font-weight:700;color:#111827">BDShop</h1>
        <p style="font-size:14px;color:#4b5563">বিডিশপ</p>
        <p style="font-size:14px;color:#4b5563;margin-top:4px">123 Gulshan Avenue, Dhaka-1212</p>
        <p style="font-size:14px;color:#4b5563">১২৩ গুলশান এভিনিউ, ঢাকা-১২১২</p>
        <p style="font-size:14px;color:#4b5563">ফোন: +880-1700-000000</p>
        <p style="font-size:14px;color:#4b5563">ইমেইল: info@bdshop.com</p>
      </div>
      <div style="text-align:right">
        <h2 style="font-size:30px;font-weight:700;color:#111827">চালান</h2>
        <p style="font-size:18px;color:#4b5563">INVOICE</p>
        <div style="margin-top:16px;font-size:14px">
          <p><span style="color:#4b5563">চালান নং:</span> <span style="font-weight:500">${e(data.invoiceNumber)}</span></p>
          <p><span style="color:#4b5563">অর্ডার নং:</span> <span style="font-weight:500">${e(data.orderNumber)}</span></p>
          <p><span style="color:#4b5563">তারিখ:</span> <span style="font-weight:500">${invoiceDate}</span></p>
          <p><span style="color:#4b5563">পেমেন্ট:</span> <span style="font-weight:500;color:${data.paymentStatus === 'paid' ? '#15803d' : '#dc2626'}">${data.paymentStatus === 'paid' ? 'পরিশোধিত' : 'অপরিশোধিত'}</span></p>
        </div>
      </div>
    </div>

    <!-- Addresses -->
    <div style="display:flex;gap:32px;margin-top:24px">
      <div style="flex:1">
        <h3 style="font-size:14px;font-weight:600;color:#374151;text-transform:uppercase;margin-bottom:8px">বিল প্রাপক / Bill To</h3>
        <p style="font-size:14px;font-weight:500;color:#111827">${e(data.billingAddress.name)}</p>
        <p style="font-size:14px;color:#4b5563">${e(data.billingAddress.address)}</p>
        <p style="font-size:14px;color:#4b5563">${e(data.billingAddress.area)}, ${e(data.billingAddress.city)}</p>
        <p style="font-size:14px;color:#4b5563">${e(data.billingAddress.postalCode)}</p>
        <p style="font-size:14px;color:#4b5563">${e(data.billingAddress.phone)}</p>
        <p style="font-size:14px;color:#4b5563">${e(data.customer.email)}</p>
      </div>
      <div style="flex:1">
        <h3 style="font-size:14px;font-weight:600;color:#374151;text-transform:uppercase;margin-bottom:8px">প্রাপকের ঠিকানা / Ship To</h3>
        <p style="font-size:14px;font-weight:500;color:#111827">${e(data.shippingAddress.name)}</p>
        <p style="font-size:14px;color:#4b5563">${e(data.shippingAddress.address)}</p>
        <p style="font-size:14px;color:#4b5563">${e(data.shippingAddress.area)}, ${e(data.shippingAddress.city)}</p>
        <p style="font-size:14px;color:#4b5563">${e(data.shippingAddress.postalCode)}</p>
        <p style="font-size:14px;color:#4b5563">${e(data.shippingAddress.phone)}</p>
      </div>
    </div>

    <!-- Items Table -->
    <table style="width:100%;border-collapse:collapse;margin-top:32px">
      <thead>
        <tr style="background:#1f2937;color:#fff">
          <th style="padding:8px 16px;text-align:left;font-size:12px;font-weight:500;text-transform:uppercase">#</th>
          <th style="padding:8px 16px;text-align:left;font-size:12px;font-weight:500;text-transform:uppercase">পণ্য / Item</th>
          <th style="padding:8px 16px;text-align:left;font-size:12px;font-weight:500;text-transform:uppercase">SKU</th>
          <th style="padding:8px 16px;text-align:center;font-size:12px;font-weight:500;text-transform:uppercase">পরিমাণ / Qty</th>
          <th style="padding:8px 16px;text-align:right;font-size:12px;font-weight:500;text-transform:uppercase">মূল্য / Price</th>
          <th style="padding:8px 16px;text-align:right;font-size:12px;font-weight:500;text-transform:uppercase">মোট / Total</th>
        </tr>
      </thead>
      <tbody style="border-bottom:1px solid #e5e7eb">
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;margin-top:24px">
      <div style="width:288px">
        <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px">
          <span style="color:#4b5563">উপমোট / Subtotal:</span>
          <span style="color:#111827">${f(data.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px">
          <span style="color:#4b5563">ডেলিভারি / Shipping:</span>
          <span style="color:#111827">${f(data.shippingCost)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px">
          <span style="color:#4b5563">কর / Tax (VAT):</span>
          <span style="color:#111827">${f(data.tax)}</span>
        </div>
        ${discountRow}
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;padding-top:8px;border-top:2px solid #1f2937;margin-top:8px">
          <span style="color:#111827">সর্বমোট / Total:</span>
          <span style="color:#111827">${f(data.totalAmount)}</span>
        </div>
        <div style="font-size:12px;color:#6b7280;text-align:right;margin-top:4px">
          কথায়: ${Math.floor(data.totalAmount).toLocaleString()} টাকা মাত্র
        </div>
      </div>
    </div>

    <!-- Payment Method -->
    <div style="margin-top:32px;padding:16px;background:#f9fafb;border-radius:8px">
      <h3 style="font-size:14px;font-weight:600;color:#374151;margin-bottom:4px">পেমেন্ট পদ্ধতি / Payment Method</h3>
      <p style="font-size:14px;color:#4b5563;text-transform:capitalize">${e(data.paymentMethod)}</p>
    </div>

    <!-- Footer -->
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb">
      <div style="display:flex;justify-content:space-between">
        <div>
          <h3 style="font-size:14px;font-weight:600;color:#374151;margin-bottom:8px">শর্তাবলী / Terms &amp; Conditions</h3>
          <ul style="font-size:12px;color:#6b7280;list-style:none;padding:0">
            <li>• ডেলিভারির ৭ দিনের মধ্যে পণ্য ফেরত দেওয়া যাবে।</li>
            <li>• Products can be returned within 7 days of delivery.</li>
            <li>• ক্ষতিগ্রস্ত পণ্য ২৪ ঘন্টার মধ্যে জানাতে হবে।</li>
            <li>• Damaged items must be reported within 24 hours.</li>
          </ul>
        </div>
        <div style="text-align:right">
          <div style="margin-top:48px;padding-top:16px;border-top:1px solid #9ca3af;display:inline-block">
            <p style="font-size:14px;font-weight:500;color:#374151">অনুমোদিত স্বাক্ষর</p>
            <p style="font-size:12px;color:#6b7280">Authorized Signature</p>
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:32px;font-size:12px;color:#9ca3af">
        <p>আপনার ক্রয়ের জন্য ধন্যবাদ! / Thank you for your purchase!</p>
        <p style="margin-top:4px">www.bdshop.com</p>
      </div>
    </div>

  </div>
</body>
</html>`;
  }

  async getInvoiceData(orderId: string): Promise<InvoiceData> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
        shippingAddress: true,
        billingAddress: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return this.mapOrderToInvoiceData(order);
  }
}
