import React, { useState, useMemo } from 'react';
import {
  Send,
  MessageCircle,
  Truck,
  Sparkles,
  CheckCircle2,
  Clock,
  RotateCcw,
  Store,
  MapPin,
  Flame,
  CheckSquare,
  Square,
  ExternalLink,
  Phone,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Customer, Product, RouteScheduleItem, CompanySettings } from '../../types';
import { normalizeWhatsAppNumber } from '../../utils/whatsapp';

interface RouteBroadcasterProps {
  customers: Customer[];
  products: Product[];
  schedules: RouteScheduleItem[];
  settings: CompanySettings;
}

export const RouteBroadcaster: React.FC<RouteBroadcasterProps> = ({
  customers,
  products,
  schedules,
  settings,
}) => {
  // Active selected route for broadcast
  const [selectedRouteId, setSelectedRouteId] = useState<string>(schedules[0]?.id || '');
  const activeRoute = schedules.find((s) => s.id === selectedRouteId) || schedules[0];

  // Contacted tracking in memory / session
  const [contactedIds, setContactedIds] = useState<{ [customerId: string]: boolean }>({});
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Generate top deals / featured products list
  const topProductsSnippet = useMemo(() => {
    // Pick weekly deals first, then top in-stock products
    const deals = products.filter((p) => p.isWeeklyDeal && p.inStock);
    const regular = products.filter((p) => !p.isWeeklyDeal && p.inStock);
    const chosen = [...deals, ...regular].slice(0, 4);

    return chosen
      .map((p) => {
        const discountPart = p.oldPrice ? ` (وفر ${p.oldPrice - p.price} ج)` : '';
        const dealPart = p.isWeeklyDeal ? ' 🔥' : '';
        return `• *${p.name}* (${p.unit}): *${p.price.toLocaleString('ar-EG')} ج.م*${discountPart}${dealPart}`;
      })
      .join('\n');
  }, [products]);

  // Default auto-generated broadcast template
  const generateDefaultMessage = (route: RouteScheduleItem) => {
    const storeUrl = window.location.origin;

    return `مساء الخير يا فندم (${settings.companyName}) 🚚
نحيط علم سيادتكم بأن عربية التوزيع نازلة ${route.name} (${route.daysDisplay}) لتسليم البضاعة لباب المحل/المطعم مباشرة والدفع نقداً عند الاستلام مع السائق والتوصيل مجاناً.

🔥 *أبرز عروض وأسعار الأسبوع للجملة:*
${topProductsSnippet}

📦 لطلب نواقص محلك وحجز بضاعتك لتصلك في خط السير، تفضل باختيار كمياتك من الكتالوج هنا:
${storeUrl}

_يسعدنا دائماً خدمتكم وتوريد طلبياتكم بأعلى جودة_`;
  };

  const [messageTemplate, setMessageTemplate] = useState<string>(() =>
    generateDefaultMessage(activeRoute)
  );

  // When switching routes, offer to update route name in message
  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    const route = schedules.find((s) => s.id === routeId);
    if (route) {
      setMessageTemplate(generateDefaultMessage(route));
    }
  };

  // Filter customers that belong to the active route
  const targetCustomers = useMemo(() => {
    if (!activeRoute) return [];
    return customers.filter((cust) => {
      // Check if customer district is among this route's districts
      return activeRoute.districts.some(
        (d) => d.trim().toLowerCase() === (cust.district || '').trim().toLowerCase()
      );
    });
  }, [customers, activeRoute]);

  // Toggle single customer contacted state
  const handleToggleContacted = (customerId: string) => {
    setContactedIds((prev) => ({
      ...prev,
      [customerId]: !prev[customerId],
    }));
  };

  // Mark all contacted in this route
  const handleMarkAllContacted = () => {
    const updated: { [id: string]: boolean } = { ...contactedIds };
    targetCustomers.forEach((c) => {
      updated[c.id] = true;
    });
    setContactedIds(updated);
  };

  // Reset contacted in this route
  const handleResetCampaign = () => {
    const updated: { [id: string]: boolean } = { ...contactedIds };
    targetCustomers.forEach((c) => {
      delete updated[c.id];
    });
    setContactedIds(updated);
  };

  // Send WhatsApp message to a specific customer
  const handleSendWhatsApp = (cust: Customer) => {
    const cleanPhone = normalizeWhatsAppNumber(cust.phone);
    const personalizedMessage = messageTemplate.replace(
      'يا فندم',
      `أستاذ ${cust.responsibleName} (${cust.shopName})`
    );

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;
    window.open(url, '_blank');

    // Automatically mark as contacted
    setContactedIds((prev) => ({
      ...prev,
      [cust.id]: true,
    }));
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageTemplate);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch {
      // Fallback
    }
  };

  const contactedCount = targetCustomers.filter((c) => contactedIds[c.id]).length;
  const pendingCount = targetCustomers.length - contactedCount;

  return (
    <div className="space-y-5">
      {/* Route Selector Cards */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-700" />
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                1. تحديد خط السير وموعد رحلة سيارة التوزيع
              </h3>
              <p className="text-xs text-slate-500">
                اختر خط السير المستهدف لتصفية عملاء المنطقة وتجهيز رسالة العروض
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {schedules.map((schedule) => {
            const isSelected = selectedRouteId === schedule.id;

            // Count customers in this route
            const routeCustCount = customers.filter((c) =>
              schedule.districts.some(
                (d) => d.trim().toLowerCase() === (c.district || '').trim().toLowerCase()
              )
            ).length;

            return (
              <button
                key={schedule.id}
                onClick={() => handleSelectRoute(schedule.id)}
                type="button"
                className={`text-right p-3.5 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950 text-white border-brand-500 ring-2 ring-brand-500/30 shadow-md shadow-brand-950/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-sm font-black text-inherit">{schedule.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-brand-500 text-slate-950'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {routeCustCount} عميل بالدليل
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-90 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>مواعيد النزول: {schedule.daysDisplay}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-inherit/20 text-[11px] opacity-75 truncate">
                  {schedule.districts.slice(0, 4).join('، ')}...
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Smart Campaign Message Generator */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                2. صياغة وتخصيص رسالة البرودكاست التسويقية
              </h3>
              <p className="text-xs text-slate-500">
                مُولّدة تلقائياً بأحدث أسعار الجملة وعروض الأسبوع، يمكنك التعديل عليها بحرية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMessageTemplate(generateDefaultMessage(activeRoute))}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
              title="تحديث الأسعار وإعادة التوليد"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تحديث العروض</span>
            </button>

            <button
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-1 text-xs text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg border border-brand-200 transition-colors font-bold"
            >
              {copiedMessage ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMessage ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
            </button>
          </div>
        </div>

        {/* Message Editor Textarea */}
        <div className="relative">
          <textarea
            rows={7}
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 text-xs sm:text-sm font-sans rounded-2xl p-3.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 px-1">
            <span>
              💡 سيتم استبدال عبارة "يا فندم" تلقائياً باسم كل مسؤول ومحله عند الضغط على زر الإرسال.
            </span>
            <span>{messageTemplate.length} حرف</span>
          </div>
        </div>
      </div>

      {/* 1-Click Dispatch List */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                3. قائمة إرسال العروض لعملاء ({activeRoute.name})
              </h3>
              <span className="bg-brand-100 text-brand-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {targetCustomers.length} منشأة
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              اضغط على زر الواتساب لإرسال العرض فوراً مع تتبع حالة من تم التواصل معه
            </p>
          </div>

          {/* Progress & Batch Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-emerald-700">تم الإرسال: {contactedCount}</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-700">قيد الانتظار: {pendingCount}</span>
            </div>

            <button
              onClick={handleMarkAllContacted}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>تحديد الكل تم</span>
            </button>

            {contactedCount > 0 && (
              <button
                onClick={handleResetCampaign}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                title="إعادة ضبط حالة التواصل"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Customer Dispatch Cards */}
        {targetCustomers.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Store className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">
              لا توجد منشآت مسجلة في هذا الخط حتى الآن ({activeRoute.name})
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              يمكنك إضافة محلات جديدة في هذا الخط من تبويب "دليل العملاء والمحلات" لتبدأ بمراسلتهم
              مباشرة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {targetCustomers.map((cust) => {
              const isContacted = !!contactedIds[cust.id];

              return (
                <div
                  key={cust.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isContacted
                      ? 'bg-emerald-50/50 border-emerald-300/80 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => handleToggleContacted(cust.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                        title={isContacted ? 'إلغاء التحديد' : 'تحديد كتم التواصل'}
                      >
                        {isContacted ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {cust.shopName}
                          </h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                            {cust.businessType}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>المسؤول: {cust.responsibleName}</span>
                          <span>•</span>
                          <span className="font-bold text-brand-700">{cust.district}</span>
                        </div>

                        {cust.notes && (
                          <p className="text-[11px] text-slate-600 mt-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 line-clamp-1">
                            {cust.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        isContacted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {isContacted ? 'تم الإرسال ✅' : 'قيد الانتظار ⏳'}
                    </span>
                  </div>

                  {/* Dispatch Action Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400">
                      <span>إجمالي المسحوبات: </span>
                      <strong className="text-slate-700">
                        {(cust.totalSpent || 0).toLocaleString('ar-EG')} ج.م
                      </strong>
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(cust)}
                      className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white text-transparent" />
                      <span>إرسال عبر واتساب</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

