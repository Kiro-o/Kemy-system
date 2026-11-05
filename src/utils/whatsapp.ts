import { Order } from '../types';
import { formatArabicDateTime } from './dateUtils';

/**
 * Format Egyptian phone number for WhatsApp URL
 * Strips +, 00, spaces, leading 0 and prefixes with 20 if needed
 */
export function normalizeWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('0020')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = '2' + cleaned;
  } else if (!cleaned.startsWith('20') && cleaned.length === 10) {
    cleaned = '20' + cleaned;
  }
  return cleaned;
}

/**
 * Formats a comprehensive Arabic wholesale invoice text suitable for WhatsApp
 */
export function formatWhatsAppInvoiceText(order: Order, companyName: string): string {
  const dateStr = formatArabicDateTime(order.createdAt);

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n` +
        `   📦 الكمية: ${item.quantity} × (${item.unit})\n` +
        `   💵 السعر: ${item.price.toLocaleString('ar-EG')} ج = ${item.subtotal.toLocaleString('ar-EG')} ج`
    )
    .join('\n\n');

  const message = 
`🏢 *طلب توريد مواد غذائية بالجملة*
*${companyName}*
---------------------------------------
🔖 *رقم الطلب:* #${order.id}
📅 *تاريخ الطلب:* ${dateStr}

🏪 *بيانات المحل / العميل:*
• *اسم المنشأة:* ${order.shopName}
• *النشاط:* ${order.businessType}
• *المسؤول:* ${order.responsibleName}
• *رقم الهاتف:* ${order.phone}
• *المنطقة بالإسكندرية:* ${order.district}
• *العنوان التفصيلي:* ${order.fullAddress}
${order.notes ? `• *ملاحظات السائق:* ${order.notes}\n` : ''}
---------------------------------------
📋 *تفاصيل الطلبية والأصناف:*

${itemsList}

---------------------------------------
📦 *إجمالي عدد الوحدات:* ${order.totalQuantity} وحدة (جردل / كرتونة / برميل)
💰 *الإجمالي النهائي المستحق:* *${order.totalAmount.toLocaleString('ar-EG')} جنيه مصري*
---------------------------------------
🚛 *خط السير وموعد التوصيل:* ${order.routeDay}
⚡ *التوصيل:* مجاناً لباب المحل بالإسكندرية
💵 *طريقة الدفع:* ${order.paymentMethod}
---------------------------------------
_تم الإرسال عبر المنظومة الإلكترونية للطلبات والجملة_`;

  return message;
}

/**
 * Generates the full WhatsApp web/app link
 */
export function generateWhatsAppUrl(adminPhone: string, order: Order, companyName: string): string {
  const normalizedPhone = normalizeWhatsAppNumber(adminPhone);
  const text = formatWhatsAppInvoiceText(order, companyName);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}

