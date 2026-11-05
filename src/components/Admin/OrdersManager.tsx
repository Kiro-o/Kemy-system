import React, { useState } from 'react';
import {
  Truck,
  Filter,
  Download,
  Phone,
  MessageCircle,
  Calendar,
  Store,
  MapPin,
  Clock,
  Eye,
  Trash2,
  CheckCircle,
  PackageCheck,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { Order, OrderStatus, RouteScheduleItem, CompanySettings } from '../../types';
import { formatArabicDateTime } from '../../utils/dateUtils';
import { exportOrdersToCsv } from '../../utils/exportCsv';
import { normalizeWhatsAppNumber } from '../../utils/whatsapp';

interface OrdersManagerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  schedules: RouteScheduleItem[];
  settings: CompanySettings;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  schedules,
  settings,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeOrderDetails, setActiveOrderDetails] = useState<Order | null>(null);

  // Filter orders by zone and status
  const filteredOrders = orders.filter((order) => {
    // Zone filter: matches either specific district or schedule days
    const matchesZone =
      selectedZone === 'all' ||
      order.routeDay.includes(selectedZone) ||
      order.district === selectedZone;

    // Status filter
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;

    return matchesZone && matchesStatus;
  });

  // Calculate stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'ملغي' ? o.totalAmount : 0), 0);
  const newOrdersCount = orders.filter((o) => o.status === 'جديد').length;
  const inTruckCount = orders.filter((o) => o.status === 'تم التحميل في السيارة').length;
  const deliveredCount = orders.filter((o) => o.status === 'تم التسليم والتحصيل').length;

  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      alert('لا توجد طلبات لتصديرها وفقاً للتصفية الحالية');
      return;
    }
    exportOrdersToCsv(filteredOrders);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'جديد':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'تم التحميل في السيارة':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'تم التسليم والتحصيل':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'ملغي':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block">إجمالي مبيعات الطلبيات</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-brand-800">
              {totalRevenue.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-slate-600">ج.م</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            من إجمالي {orders.length} طلبية مسجلة
          </span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-xs text-amber-800 font-bold block">طلبات جديدة للتجهيز</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-amber-900">{newOrdersCount}</span>
            <span className="text-xs font-bold text-amber-700">طلبية</span>
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">تحتاج مراجعة المخزن</span>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-sm">
          <span className="text-xs text-blue-800 font-bold block">في سيارات التوزيع</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-blue-900">{inTruckCount}</span>
            <span className="text-xs font-bold text-blue-700">طلبية</span>
          </div>
          <span className="text-[11px] text-blue-700 mt-1 block">قيد التوصيل لمناطق الإسكندرية</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-xs text-emerald-800 font-bold block">تم التسليم والتحصيل</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-900">{deliveredCount}</span>
            <span className="text-xs font-bold text-emerald-700">طلبية</span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">مكتملة ومحصلة نقداً</span>
        </div>
      </div>

      {/* Control Bar: Route Filter & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Route Zone Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <Truck className="w-4 h-4 text-brand-700" />
            <span className="font-bold text-slate-700">خط السير / المنطقة:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none"
            >
              <option value="all">كافة الخطوط والمناطق</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.daysDisplay}>
                  {s.name} ({s.daysDisplay})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">الحالة:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none"
            >
              <option value="all">جميع الحالات</option>
              <option value="جديد">جديد</option>
              <option value="تم التحميل في السيارة">تم التحميل في السيارة</option>
              <option value="تم التسليم والتحصيل">تم التسليم والتحصيل</option>
              <option value="ملغي">ملغي</option>
            </select>
          </div>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          title="تصدير بيانات الطلبيات المحددة إلى ملف إكسيل"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>تصدير إكسيل (CSV)</span>
        </button>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <Truck className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">لا توجد طلبات مطابقة للبحث أو التصفية الحالية</p>
            <p className="text-xs text-slate-500 mt-1">
              اختر خط سير آخر أو حالة مختلفة لمشاهدة الطلبات
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const customerWaUrl = `https://wa.me/${normalizeWhatsAppNumber(order.phone)}?text=${encodeURIComponent(
              `مرحباً ${order.shopName}، بخصوص طلبيتكم رقم #${order.id} من ${settings.companyName}:`
            )}`;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 transition-all hover:border-brand-500/50"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  {/* Order meta */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-mono font-bold text-xs flex-shrink-0">
                      #{order.id.replace('NOOR-', '')}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-base">{order.shopName}</h4>
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          {order.businessType}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-brand-700">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{order.district}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span>خط: {order.routeDay}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatArabicDateTime(order.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown Selector */}
                  <div className="flex items-center gap-2 self-start lg:self-center">
                    <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
                      تحديث الحالة:
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="جديد">جديد</option>
                      <option value="تم التحميل في السيارة">تم التحميل في السيارة</option>
                      <option value="تم التسليم والتحصيل">تم التسليم والتحصيل</option>
                      <option value="ملغي">ملغي</option>
                    </select>
                  </div>
                </div>

                {/* Items preview snippet */}
                <div className="py-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-700">الأصناف المطلوبة للتحميل:</span>
                    <span className="text-brand-800 font-black">
                      {order.totalQuantity} وحدة • {order.totalAmount.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {order.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-[11px] font-medium"
                      >
                        {it.quantity} × {it.productName} ({it.unit})
                      </span>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mt-2 bg-amber-50 text-amber-900 p-2 rounded-lg text-[11px] border border-amber-200">
                      <strong>ملاحظة السائق: </strong>
                      {order.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">المسؤول: {order.responsibleName}</span>
                    <span className="text-slate-300">|</span>
                    <a
                      href={`tel:${order.phone}`}
                      className="text-brand-700 hover:underline font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span dir="ltr">{order.phone}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5 mr-auto">
                    <a
                      href={customerWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                      title="مراسلة العميل عبر واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-transparent" />
                      <span>واتساب</span>
                    </a>

                    <button
                      onClick={() => setActiveOrderDetails(order)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                      title="عرض كامل التفاصيل"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>تفاصيل الفاتورة</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف الطلب #${order.id} نهائياً؟`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Modal if active */}
      {activeOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setActiveOrderDetails(null)}
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl relative z-10 text-right border border-slate-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-base">
                  تفاصيل فاتورة الطلب #{activeOrderDetails.id}
                </h3>
                <button
                  onClick={() => setActiveOrderDetails(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  إغلاق ✕
                </button>
              </div>

              <div className="py-3 text-xs space-y-2 text-slate-600">
                <p>
                  <strong>المنشأة:</strong> {activeOrderDetails.shopName} (
                  {activeOrderDetails.businessType})
                </p>
                <p>
                  <strong>المسؤول:</strong> {activeOrderDetails.responsibleName} (
                  {activeOrderDetails.phone})
                </p>
                <p>
                  <strong>المنطقة:</strong> {activeOrderDetails.district} -{' '}
                  {activeOrderDetails.fullAddress}
                </p>
                <p>
                  <strong>خط السير:</strong> {activeOrderDetails.routeDay}
                </p>
                {activeOrderDetails.notes && (
                  <p className="bg-amber-50 p-2 rounded-lg text-amber-900">
                    <strong>ملاحظات:</strong> {activeOrderDetails.notes}
                  </p>
                )}
              </div>

              <div className="divide-y divide-slate-100 border-t border-b border-slate-200 my-2 max-h-56 overflow-y-auto">
                {activeOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{item.productName}</span>
                      <span className="text-[11px] text-slate-500 block">
                        {item.quantity} × {item.unit} ({item.price} ج)
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {item.subtotal.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-black text-base text-slate-900 pt-2">
                <span>الإجمالي:</span>
                <span className="text-brand-800">
                  {activeOrderDetails.totalAmount.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

