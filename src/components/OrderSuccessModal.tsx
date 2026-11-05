import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, Printer, PlusCircle, MapPin, Truck } from 'lucide-react';
import { Order, CompanySettings } from '../types';
import { formatArabicDateTime } from '../utils/dateUtils';
import { formatWhatsAppInvoiceText } from '../utils/whatsapp';

interface OrderSuccessModalProps {
  isOpen: boolean;
  order: Order | null;
  settings: CompanySettings;
  whatsappUrl: string;
  onClose: () => void;
  onNewOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  order,
  settings,
  whatsappUrl,
  onClose,
  onNewOrder,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopyText = async () => {
    const text = formatWhatsAppInvoiceText(order, settings.companyName);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl text-right overflow-hidden transform transition-all relative z-10 border border-slate-100">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-brand-700 to-teal-800 text-white p-5 sm:p-6 text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 text-white ring-4 ring-white/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-black">تم تسجيل طلبكم بنجاح!</h3>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              رقم الطلبية المعتمد: <strong className="font-mono text-white text-base">#{order.id}</strong>
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Delivery route highlight */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
              <Truck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block">
                  موعد سيارة التوزيع لمنطقة ({order.district}):
                </span>
                <span className="font-semibold text-emerald-800 mt-0.5 block">
                  {order.routeDay} • {order.nextDeliveryDate}
                </span>
                <span className="text-[11px] text-emerald-700 block mt-1">
                  سيتواصل معك السائق أو المندوب قبل الوصول لتجهيز مكان التفريغ.
                </span>
              </div>
            </div>

            {/* Invoice Printable View */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3 font-sans print:border-none print:p-0">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-slate-500 font-medium">
                <span>تاريخ الطلب: {formatArabicDateTime(order.createdAt)}</span>
                <span className="font-bold text-slate-800">{order.shopName}</span>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pt-2 flex justify-between items-center text-slate-700">
                    <div>
                      <span className="font-bold">{item.productName}</span>
                      <span className="text-[11px] text-slate-500 block">
                        {item.quantity} × {item.unit} ({item.price.toLocaleString('ar-EG')} ج)
                      </span>
                    </div>
                    <span className="font-black text-slate-900">
                      {item.subtotal.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>المبلغ الإجمالي النهائي:</span>
                <span className="text-brand-800 text-base">
                  {order.totalAmount.toLocaleString('ar-EG')} ج.م
                </span>
              </div>

              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>طريقة الدفع: {order.paymentMethod}</span>
                <span>العنوان: {order.district}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white text-transparent" />
                <span>إعادة فتح واتساب</span>
              </a>

              <button
                onClick={handleCopyText}
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">تم نسخ الفاتورة!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ نص الفاتورة</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom auxiliary buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={handlePrint}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة إيصال الطلب</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNewOrder();
                }}
                className="inline-flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>بدء طلبية جديدة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

