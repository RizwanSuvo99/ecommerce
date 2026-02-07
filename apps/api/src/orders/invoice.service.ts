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
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const invoiceData = this.mapOrderToInvoiceData(order);
    return this.renderPDF(invoiceData);
  }

  private mapOrderToInvoiceData(order: any): InvoiceData {
    return {
      orderNumber: order.orderNumber,
      invoiceNumber: `INV-${order.orderNumber}`,
      invoiceDate: order.createdAt,
      customer: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone || '',
      },
      shippingAddress: {
        name: order.shippingAddress?.name || order.user.name,
        address: order.shippingAddress?.address || '',
        city: order.shippingAddress?.city || '',
        area: order.shippingAddress?.area || '',
        postalCode: order.shippingAddress?.postalCode || '',
        phone: order.shippingAddress?.phone || '',
      },
      billingAddress: {
        name: order.billingAddress?.name || order.shippingAddress?.name || order.user.name,
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
      tax: Number(order.tax),
      discount: Number(order.discount),
      couponCode: order.couponCode,
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    };
  }

  private async renderPDF(data: InvoiceData): Promise<Buffer> {
    // Using a PDFKit-style approach for PDF generation
    // In production, this would use pdfkit or puppeteer
    const PDFDocument = require('pdfkit');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${data.invoiceNumber}`,
          Author: 'BDShop',
          Subject: `Invoice for Order ${data.orderNumber}`,
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('BDShop', 50, 50);
      doc.fontSize(10).font('Helvetica').text('বিডিশপ', 50, 78);
      doc.fontSize(9).text('123 Gulshan Avenue, Dhaka-1212', 50, 95);
      doc.text('১২৩ গুলশান এভিনিউ, ঢাকা-১২১২', 50, 107);
      doc.text('Phone: +880-1700-000000', 50, 119);
      doc.text('Email: info@bdshop.com', 50, 131);

      // Invoice Title
      doc.fontSize(28).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(12).font('Helvetica').text('চালান', 400, 82, { align: 'right' });

      // Invoice Details
      doc.fontSize(9).font('Helvetica');
      doc.text(`Invoice #: ${data.invoiceNumber}`, 400, 105, { align: 'right' });
      doc.text(`Order #: ${data.orderNumber}`, 400, 117, { align: 'right' });
      doc.text(`Date: ${data.invoiceDate.toLocaleDateString('en-BD')}`, 400, 129, { align: 'right' });
      doc.text(
        `Payment: ${data.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}`,
        400, 141,
        { align: 'right' },
      );

      // Separator
      doc.moveTo(50, 160).lineTo(545, 160).stroke();

      // Bill To / Ship To
      const addressY = 175;
      doc.fontSize(10).font('Helvetica-Bold').text('Bill To / বিল প্রাপক', 50, addressY);
      doc.fontSize(9).font('Helvetica');
      doc.text(data.billingAddress.name, 50, addressY + 15);
      doc.text(data.billingAddress.address, 50, addressY + 27);
      doc.text(`${data.billingAddress.area}, ${data.billingAddress.city}`, 50, addressY + 39);
      doc.text(data.billingAddress.postalCode, 50, addressY + 51);
      doc.text(data.billingAddress.phone, 50, addressY + 63);

      doc.fontSize(10).font('Helvetica-Bold').text('Ship To / প্রাপকের ঠিকানা', 300, addressY);
      doc.fontSize(9).font('Helvetica');
      doc.text(data.shippingAddress.name, 300, addressY + 15);
      doc.text(data.shippingAddress.address, 300, addressY + 27);
      doc.text(`${data.shippingAddress.area}, ${data.shippingAddress.city}`, 300, addressY + 39);
      doc.text(data.shippingAddress.postalCode, 300, addressY + 51);
      doc.text(data.shippingAddress.phone, 300, addressY + 63);

      // Items Table Header
      const tableTop = addressY + 90;
      doc.rect(50, tableTop, 495, 20).fill('#1f2937');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff');
      doc.text('#', 55, tableTop + 5);
      doc.text('Item / পণ্য', 75, tableTop + 5);
      doc.text('SKU', 260, tableTop + 5);
      doc.text('Qty', 330, tableTop + 5);
      doc.text('Price / মূল্য', 380, tableTop + 5);
      doc.text('Total / মোট', 460, tableTop + 5, { align: 'right', width: 80 });

      // Items
      doc.fillColor('#000000');
      let y = tableTop + 25;
      data.items.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(50, y - 5, 495, 30).fill(bgColor);
        doc.fillColor('#000000');

        doc.fontSize(8).font('Helvetica');
        doc.text(`${index + 1}`, 55, y);
        doc.font('Helvetica-Bold').text(item.name, 75, y, { width: 175 });
        doc.font('Helvetica').fontSize(7).text(item.nameBn, 75, y + 11, { width: 175 });
        doc.fontSize(8).text(item.sku, 260, y);
        doc.text(`${item.quantity}`, 330, y);
        doc.text(`৳ ${item.unitPrice.toFixed(2)}`, 380, y);
        doc.font('Helvetica-Bold').text(`৳ ${item.totalPrice.toFixed(2)}`, 460, y, { align: 'right', width: 80 });
        y += 30;
      });

      // Totals
      const totalsX = 380;
      y += 10;
      doc.moveTo(totalsX, y).lineTo(545, y).stroke();
      y += 10;

      doc.fontSize(9).font('Helvetica');
      doc.text('Subtotal / উপমোট:', totalsX, y);
      doc.text(`৳ ${data.subtotal.toFixed(2)}`, 460, y, { align: 'right', width: 80 });
      y += 15;

      doc.text('Shipping / ডেলিভারি:', totalsX, y);
      doc.text(`৳ ${data.shippingCost.toFixed(2)}`, 460, y, { align: 'right', width: 80 });
      y += 15;

      doc.text('Tax / কর:', totalsX, y);
      doc.text(`৳ ${data.tax.toFixed(2)}`, 460, y, { align: 'right', width: 80 });
      y += 15;

      if (data.discount > 0) {
        doc.text(`Discount / ছাড়${data.couponCode ? ` (${data.couponCode})` : ''}:`, totalsX, y);
        doc.fillColor('#15803d').text(`-৳ ${data.discount.toFixed(2)}`, 460, y, { align: 'right', width: 80 });
        doc.fillColor('#000000');
        y += 15;
      }

      // Total
      y += 5;
      doc.moveTo(totalsX, y).lineTo(545, y).lineWidth(2).stroke();
      y += 8;
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Total / সর্বমোট:', totalsX, y);
      doc.text(`৳ ${data.totalAmount.toFixed(2)}`, 460, y, { align: 'right', width: 80 });

      // Payment Method
      y += 40;
      doc.fontSize(9).font('Helvetica-Bold').text('Payment Method / পেমেন্ট পদ্ধতি', 50, y);
      doc.font('Helvetica').text(data.paymentMethod, 50, y + 14);

      // Footer
      const footerY = 720;
      doc.moveTo(50, footerY).lineTo(545, footerY).lineWidth(0.5).stroke();
      doc.fontSize(8).font('Helvetica');
      doc.text('Terms: Products can be returned within 7 days. | শর্ত: ৭ দিনের মধ্যে পণ্য ফেরত দেওয়া যাবে।', 50, footerY + 10, {
        align: 'center',
        width: 495,
      });
      doc.text('Thank you for your purchase! | আপনার ক্রয়ের জন্য ধন্যবাদ!', 50, footerY + 25, {
        align: 'center',
        width: 495,
      });

      doc.end();
    });
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
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return this.mapOrderToInvoiceData(order);
  }
}
