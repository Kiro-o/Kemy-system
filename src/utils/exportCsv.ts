import { Order, Customer } from '../types';
import { formatArabicDateTime } from './dateUtils';

/**
 * Exports orders list to CSV with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportOrdersToCsv(orders: Order[]): void {
  const headers = [
    'رقم الطلب',
    'التاريخ والوقت',
    'اسم المحل أو المطعم',
    'نوع النشاط',
    'المسؤول',
    'رقم الهاتف',
    'المنطقة بالإسكندرية',
    'العنوان التفصيلي',
    'خط السير',
    'حالة الطلب',
    'عدد الوحدات',
    'الإجمالي بالجنيه',
    'الأصناف المطلوبة',
    'ملاحظات إضافية'
  ];

  const rows = orders.map(order => {
    const itemsSummary = order.items
      .map(i => `${i.productName} (${i.quantity} × ${i.unit} - ${i.subtotal}ج)`)
      .join(' | ');

    return [
      `"${order.id}"`,
      `"${formatArabicDateTime(order.createdAt)}"`,
      `"${order.shopName.replace(/"/g, '""')}"`,
      `"${order.businessType}"`,
      `"${order.responsibleName.replace(/"/g, '""')}"`,
      `"${order.phone}"`,
      `"${order.district}"`,
      `"${order.fullAddress.replace(/"/g, '""')}"`,
      `"${order.routeDay}"`,
      `"${order.status}"`,
      order.totalQuantity,
      order.totalAmount,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      `"${(order.notes || '').replace(/"/g, '""')}"`
    ];
  });

  // UTF-8 BOM (\uFEFF) ensures Excel opens Arabic correctly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateTag = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `طلبيات_شركة_النور_الإسكندرية_${dateTag}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports CRM customers list to CSV with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportCustomersToCsv(customers: Customer[]): void {
  const headers = [
    'كود العميل',
    'اسم المحل أو المنشأة',
    'نوع النشاط',
    'الشخص المسؤول',
    'رقم الواتساب / الهاتف',
    'المنطقة بالإسكندرية',
    'العنوان التفصيلي',
    'حالة العميل',
    'عدد الطلبيات المنفذة',
    'إجمالي المسحوبات بالجنيه',
    'تاريخ آخر طلبية',
    'تاريخ التسجيل في الدليل',
    'ملاحظات واحتياجات العميل'
  ];

  const rows = customers.map(cust => {
    return [
      `"${cust.id}"`,
      `"${cust.shopName.replace(/"/g, '""')}"`,
      `"${cust.businessType}"`,
      `"${cust.responsibleName.replace(/"/g, '""')}"`,
      `"${cust.phone}"`,
      `"${cust.district}"`,
      `"${(cust.address || '').replace(/"/g, '""')}"`,
      `"${cust.status}"`,
      cust.totalOrdersCount || 0,
      cust.totalSpent || 0,
      `"${cust.lastOrderDate ? formatArabicDateTime(cust.lastOrderDate) : 'لا يوجد طلبات بعد'}"`,
      `"${formatArabicDateTime(cust.createdAt)}"`,
      `"${(cust.notes || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateTag = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `دليل_عملاء_ومحلات_النور_الإسكندرية_${dateTag}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
