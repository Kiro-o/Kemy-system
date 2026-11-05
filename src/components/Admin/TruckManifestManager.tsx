import React, { useState, useMemo } from 'react';
import {
  Truck,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Package,
  ArrowUp,
  ArrowDown,
  Calendar,
  AlertCircle,
  CheckSquare,
  Square,
  DollarSign,
  Layers,
  Store,
} from 'lucide-react';
import { Order, OrderStatus, RouteScheduleItem, WarehousePackItem, CompanySettings } from '../../types';
import { normalizeWhatsAppNumber } from '../../utils/whatsapp';
import { formatArabicDateTime } from '../../utils/dateUtils';

interface TruckManifestManagerProps {
  orders: Order[];
  schedules: RouteScheduleItem[];
  settings: CompanySettings;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const TruckManifestManager: React.FC<TruckManifestManagerProps> = ({
  orders,
  schedules,
  settings,
  onUpdateOrderStatus,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(schedules[0]?.id || '');
  const [checkedWarehouseItems, setCheckedWarehouseItems] = useState<{ [id: string]: boolean }>({});
  const [customStopOrder, setCustomStopOrder] = useState<string[]>([]);

  const activeRoute = schedules.find((s) => s.id === selectedRouteId) || schedules[0];

  // Filter orders belonging to this route and not cancelled
  const routeOrders = useMemo(() => {
    if (!activeRoute) return [];
    return orders.filter((o) => {
      const matchZone = activeRoute.districts.some(
        (d) => d.trim().toLowerCase() === (o.district || '').trim().toLowerCase()
      ) || (o.routeDay && o.routeDay.includes(activeRoute.daysDisplay));

      return matchZone && o.status !== 'ملغي';
    });
  }, [orders, activeRoute]);

  // Maintain ordered stops list
  const orderedOrders = useMemo(() => {
    if (customStopOrder.length === 0) return routeOrders;
    const sorted = [...routeOrders].sort((a, b) => {
      const idxA = customStopOrder.indexOf(a.id);
      const idxB = customStopOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
    return sorted;
  }, [routeOrders, customStopOrder]);

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= orderedOrders.length) return;

    const currentIds = orderedOrders.map((o) => o.id);
    const temp = currentIds[index];
    currentIds[index] = currentIds[newIdx];
    currentIds[newIdx] = temp;
    setCustomStopOrder(currentIds);
  };

  // Warehouse Aggregated Packing List Calculation
  const warehouseAggregated = useMemo(() => {
    const itemMap: { [key: string]: WarehousePackItem } = {};

    routeOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = `${item.productId}_${item.unit}`;
        if (!itemMap[key]) {
          itemMap[key] = {
            productId: item.productId,
            productName: item.productName,
            unit: item.unit,
            totalQuantity: 0,
            orderCount: 0,
          };
        }
        itemMap[key].totalQuantity += item.quantity;
        itemMap[key].orderCount += 1;
      });
    });

    return Object.values(itemMap).sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [routeOrders]);

  const toggleWarehouseItem = (key: string) => {
    setCheckedWarehouseItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (orderedOrders.length === 0) {
      alert('لا توجد طلبات في خط السير المحدد لتصديرها');
      return;
    }

    const headers = [
      'ترتيب الوقوف',
      'رقم الطلب',
      'اسم المحل أو المطعم',
      'المنطقة',
      'العنوان بالتفصيل',
      'المسؤول',
      'رقم الهاتف',
      'الأصناف المطلوب تسليمها',
      'المبلغ المطلوب تحصيله كاش (ج.م)',
      'حالة الطلب',
      'ملاحظات السائق'
    ];

    const rows = orderedOrders.map((order, idx) => {
      const itemsList = order.items.map(i => `${i.quantity} × ${i.productName} (${i.unit})`).join(' + ');
      return [
        idx + 1,
        `"${order.id}"`,
        `"${order.shopName.replace(/"/g, '""')}"`,
        `"${order.district}"`,
        `"${order.fullAddress.replace(/"/g, '""')}"`,
        `"${order.responsibleName.replace(/"/g, '""')}"`,
        `"${order.phone}"`,
        `"${itemsList.replace(/"/g, '""')}"`,
        order.totalAmount,
        `"${order.status}"`,
        `"${(order.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `كشف_تحميل_وسيارة_${activeRoute.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Metrics
  const totalStops = orderedOrders.length;
  const totalTruckPackages = routeOrders.reduce((sum, o) => sum + o.totalQuantity, 0);
  const totalCashToCollect = routeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const deliveredStops = orderedOrders.filter((o) => o.status === 'تم التسليم والتحصيل').length;

  return (
    <div className="space-y-5 print:space-y-4">
      {/* Route Filter & Print Actions Header (Hidden in print) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <Truck className="w-4 h-4 text-brand-700" />
            <span className="font-bold text-slate-700">خط سير السيارة:</span>
            <select
              value={selectedRouteId}
              onChange={(e) => {
                setSelectedRouteId(e.target.value);
                setCustomStopOrder([]);
              }}
              className="bg-transparent font-bold text-slate-900 focus:outline-none"
            >
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.daysDisplay})
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            يغطي مناطق: {activeRoute.districts.slice(0, 5).join('، ')}...
          </span>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف التحميل والسائق</span>
          </button>
        </div>
      </div>

      {/* Printable Heading (Appears on print & screen top) */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl print:bg-white print:text-black print:border print:border-black print:p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-brand-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-md print:border print:border-black">
                {settings.companyName}
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                كشف تحميل السيارة النص نقل وخط سير السائق 🚚
              </h2>
            </div>
            <p className="text-xs text-slate-300 print:text-black mt-1 font-medium">
              الخط: <strong>{activeRoute.name}</strong> • موعد النزول: <strong>{activeRoute.daysDisplay}</strong> • تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-800/80 print:border print:border-black p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 print:text-black block">عدد الوقفات</span>
              <span className="font-black text-white print:text-black text-base">{totalStops}</span>
            </div>
            <div className="bg-slate-800/80 print:border print:border-black p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 print:text-black block">إجمالي العبوات</span>
              <span className="font-black text-amber-400 print:text-black text-base">{totalTruckPackages}</span>
            </div>
            <div className="bg-slate-800/80 print:border print:border-black p-2 rounded-xl">
              <span className="text-[10px] text-slate-400 print:text-black block">المطلوب تحصيله كاش</span>
              <span className="font-black text-emerald-400 print:text-black text-base">{totalCashToCollect.toLocaleString('ar-EG')} ج</span>
            </div>
          </div>
        </div>
      </div>

      {/* Part 1: Warehouse Loading Summary (تجميع أصناف المخزن قبل التحميل) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 print:border-black">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 print:border-black flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-700 print:text-black" />
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base print:text-black">
                1. بيان تجميع أصناف المخزن لتحميل السيارة (Warehouse Packing List)
              </h3>
              <p className="text-xs text-slate-500 print:text-black">
                المجموع الكلي المجمّع لكافة طلبيات خط ({activeRoute.name}) لتجهيزها من الرفوف
              </p>
            </div>
          </div>

          <span className="text-xs bg-brand-50 text-brand-900 font-bold px-3 py-1 rounded-xl border border-brand-200 print:border-black">
            إجمالي الأصناف المختلفة: {warehouseAggregated.length} صنف
          </span>
        </div>

        {warehouseAggregated.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            لا توجد أصناف لتحميلها في هذا الخط حالياً
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {warehouseAggregated.map((item, idx) => {
              const key = `${item.productId}_${item.unit}`;
              const isChecked = !!checkedWarehouseItems[key];

              return (
                <div
                  key={key}
                  onClick={() => toggleWarehouseItem(key)}
                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between text-xs ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold print:bg-slate-100'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="print:hidden">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </span>
                    <div>
                      <span className="font-bold block leading-tight">{item.productName}</span>
                      <span className="text-[11px] text-slate-500 print:text-black">
                        عبوة: {item.unit} • مطلوب لـ {item.orderCount} محلات
                      </span>
                    </div>
                  </div>

                  <div className="text-left flex-shrink-0 bg-white print:bg-transparent px-2.5 py-1 rounded-lg border border-slate-200 print:border-black font-black text-brand-800 print:text-black text-sm">
                    {item.totalQuantity} <span className="text-[10px] font-normal">وحدة</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Part 2: Driver Run-Sheet & Delivery Sequence Table (خط سير السائق المرتب) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 print:border-black">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 print:border-black flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-700 print:text-black" />
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base print:text-black">
                2. خط سير السائق وترتيب التسليم والتحصيل النقدي (Driver Delivery Sequence)
              </h3>
              <p className="text-xs text-slate-500 print:text-black">
                ترتيب الوقوف لمحلات ومطاعم خط السير مع بيانات العنوان والمبالغ المستحقة كاش
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 print:hidden">
            <span>تم تسليمه: {deliveredStops}</span>
            <span>/</span>
            <span>المتبقي: {totalStops - deliveredStops}</span>
          </div>
        </div>

        {orderedOrders.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Truck className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">لا توجد طلبيات مدرجة في هذا الخط حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 print:bg-slate-200 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 text-center w-14">وقفة #</th>
                  <th className="py-2.5 px-3">المحل / المطعم والمسؤول</th>
                  <th className="py-2.5 px-3">العنوان بالتفصيل والعلامة</th>
                  <th className="py-2.5 px-3">البضاعة المطلوبة للتفريغ</th>
                  <th className="py-2.5 px-3">المطلوب تحصيله كاش</th>
                  <th className="py-2.5 px-3 text-center">حالة الاستلام</th>
                  <th className="py-2.5 px-3 text-center print:hidden">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orderedOrders.map((order, idx) => {
                  const isDelivered = order.status === 'تم التسليم والتحصيل';
                  const customerWaUrl = `https://wa.me/${normalizeWhatsAppNumber(order.phone)}?text=${encodeURIComponent(
                    `مرحباً ${order.shopName}، سيارة توريدات ${settings.companyName} في الطريق إليكم لتسليم طلبيتكم #${order.id}.`
                  )}`;

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isDelivered
                          ? 'bg-emerald-50/60 print:bg-transparent'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Stop Sequence Number & Reordering */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <span className="w-7 h-7 rounded-full bg-slate-900 text-white print:bg-transparent print:text-black print:border print:border-black font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="flex flex-col print:hidden">
                            <button
                              onClick={() => moveOrder(idx, 'up')}
                              disabled={idx === 0}
                              className="text-slate-400 hover:text-slate-800 disabled:opacity-20 p-0.5"
                              title="تقديم ترتيب المحل"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveOrder(idx, 'down')}
                              disabled={idx === orderedOrders.length - 1}
                              className="text-slate-400 hover:text-slate-800 disabled:opacity-20 p-0.5"
                              title="تأخير ترتيب المحل"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Store & Contact */}
                      <td className="py-3 px-3">
                        <span className="font-black text-slate-900 text-sm block">
                          {order.shopName}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span>{order.responsibleName}</span>
                          <span>•</span>
                          <span dir="ltr" className="font-mono font-bold text-slate-700">
                            {order.phone}
                          </span>
                        </div>
                      </td>

                      {/* Address & Landmark */}
                      <td className="py-3 px-3 max-w-xs">
                        <span className="font-bold text-brand-800 block text-xs">
                          {order.district}
                        </span>
                        <span className="text-[11px] text-slate-600 block leading-tight mt-0.5">
                          {order.fullAddress}
                        </span>
                        {order.notes && (
                          <span className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                            ملاحظة: {order.notes}
                          </span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3 px-3">
                        <div className="space-y-1 max-w-sm">
                          {order.items.map((it, itemIdx) => (
                            <span
                              key={itemIdx}
                              className="inline-block bg-slate-100 print:bg-transparent print:border print:border-slate-300 text-slate-800 px-2 py-0.5 rounded text-[11px] ml-1 mb-1 font-medium"
                            >
                              {it.quantity} × {it.productName} ({it.unit})
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Cash to collect */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-sm font-black text-emerald-800 print:text-black block">
                          {order.totalAmount.toLocaleString('ar-EG')} ج.م
                        </span>
                        <span className="text-[10px] text-slate-400 print:text-black">
                          نقداً مع السائق
                        </span>
                      </td>

                      {/* Delivery Status / Checkbox */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            const newStatus: OrderStatus = isDelivered ? 'جديد' : 'تم التسليم والتحصيل';
                            onUpdateOrderStatus(order.id, newStatus);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-emerald-50'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isDelivered ? 'text-emerald-700' : 'text-slate-400'}`} />
                          <span>{isDelivered ? 'تم التحصيل ✅' : 'قيد التسليم ⏳'}</span>
                        </button>
                      </td>

                      {/* Driver Actions (Hidden on print) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          <a
                            href={`tel:${order.phone}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="اتصال هاتفي بالمسؤول"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={customerWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#128C7E] transition-colors"
                            title="إرسال إشعار وصول بالواتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Driver & Warehouse Sign-off Block (Visible on print & screen) */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 print:border-black print:bg-white print:p-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-slate-600 print:text-black">
          <div>
            <strong>توقيع أمين المخزن المسؤول عن التحميل:</strong>
            <div className="mt-4 border-b border-dashed border-slate-400 print:border-black w-36"></div>
          </div>
          <div>
            <strong>توقيع سائق سيارة التوزيع:</strong>
            <div className="mt-4 border-b border-dashed border-slate-400 print:border-black w-36"></div>
          </div>
          <div>
            <strong>توقيع قسم الحسابات ومراجعة التحصيل:</strong>
            <div className="mt-4 border-b border-dashed border-slate-400 print:border-black w-36"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

