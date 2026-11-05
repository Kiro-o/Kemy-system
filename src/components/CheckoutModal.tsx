import React, { useState } from 'react';
import {
  X,
  Store,
  Phone,
  User,
  MapPin,
  Calendar,
  FileText,
  Truck,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { CartItem, BusinessType, Order, CompanySettings } from '../types';
import { ALL_ALEX_DISTRICTS } from '../data/initialData';
import { getDeliveryScheduleInfo } from '../utils/dateUtils';
import { generateWhatsAppUrl } from '../utils/whatsapp';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: CompanySettings;
  onOrderCompleted: (order: Order, whatsappUrl: string) => void;
}

const BUSINESS_TYPES: BusinessType[] = [
  'مطعم مأكولات سريعة',
  'محل كريب وبرجر',
  'سوبرماركت وبقالة',
  'مطعم بيتزا وفطائر',
  'كافيه ومشروبات',
  'علاّفة وسرج',
  'مطبخ سحابي وفندق',
  'أخرى',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  settings,
  onOrderCompleted,
}) => {
  const [shopName, setShopName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('محل كريب وبرجر');
  const [responsibleName, setResponsibleName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState(ALL_ALEX_DISTRICTS[0]); // Default "العجمي"
  const [fullAddress, setFullAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

  // Dynamic delivery route information based on selected district
  const scheduleInfo = getDeliveryScheduleInfo(district, settings.routeSchedules);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!shopName.trim()) {
      newErrors.shopName = 'اسم المحل أو المطعم مطلوب';
    }
    if (!responsibleName.trim()) {
      newErrors.responsibleName = 'اسم الشخص المسؤول عن الاستلام مطلوب';
    }

    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'يرجى إدخال رقم هاتف صحيح للتواصل والتسليم (11 رقم)';
    }

    if (!fullAddress.trim() || fullAddress.trim().length < 5) {
      newErrors.fullAddress = 'يرجى إدخال العنوان بالتفصيل وعلامة مميزة ليسهل على السائق الوصول';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Generate unique order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `NOOR-${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      shopName: shopName.trim(),
      businessType,
      responsibleName: responsibleName.trim(),
      phone: phone.trim(),
      district,
      fullAddress: fullAddress.trim(),
      notes: notes.trim() || undefined,
      routeDay: scheduleInfo.daysDisplay,
      nextDeliveryDate: scheduleInfo.nextDayText,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        unit: item.product.unit,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.quantity * item.product.price,
      })),
      totalQuantity,
      totalAmount,
      status: 'جديد',
      paymentMethod: 'نقداً عند الاستلام مع السائق (التوصيل مجاناً)',
    };

    // Build the WhatsApp message link
    const whatsappUrl = generateWhatsAppUrl(settings.adminWhatsApp, newOrder, settings.companyName);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if confetti fails
    }

    // Try to open WhatsApp in new tab
    try {
      window.open(whatsappUrl, '_blank');
    } catch {
      // Handled in confirmation screen
    }

    onOrderCompleted(newOrder, whatsappUrl);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl text-right overflow-hidden transform transition-all relative z-10 border border-slate-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-amber-400">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black">بيانات المنشأة وتأكيد الطلبية</h3>
                <span className="text-xs text-brand-200">
                  شركة النور للتوريدات الغذائية والجملة بالإسكندرية
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-brand-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {/* Dynamic District Route Preview Banner */}
            <div
              className={`p-3 rounded-2xl border transition-all ${
                scheduleInfo.isTodayDelivery
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Truck
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    scheduleInfo.isTodayDelivery ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                />
                <div className="text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 flex-wrap">
                    <span>خط السير المعتمد لمنطقة ({district}):</span>
                    <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 font-black text-slate-800">
                      {scheduleInfo.daysDisplay}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {scheduleInfo.nextDayText}
                  </p>
                </div>
              </div>
            </div>

            {/* Shop Name & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المحل أو المطعم <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="مثال: مطعم كريب وكهربا"
                    className={`w-full bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl pr-9 pl-3 py-2.5 border ${
                      errors.shopName ? 'border-red-500' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  />
                </div>
                {errors.shopName && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.shopName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نوع النشاط <span className="text-red-500">*</span>
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="w-full bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Responsible Person & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المسؤول عن الاستلام <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={responsibleName}
                    onChange={(e) => setResponsibleName(e.target.value)}
                    placeholder="الشيف أو مدير الفرع"
                    className={`w-full bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl pr-9 pl-3 py-2.5 border ${
                      errors.responsibleName ? 'border-red-500' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  />
                </div>
                {errors.responsibleName && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.responsibleName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الموبايل للتواصل والتسليم <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className={`w-full bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl pr-9 pl-3 py-2.5 border text-right ${
                      errors.phone ? 'border-red-500' : 'border-slate-300'
                    } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Alexandria District Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المنطقة في الإسكندرية <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-brand-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl pr-9 pl-3 py-2.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                >
                  {ALL_ALEX_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                العنوان بالتفصيل وعلامة مميزة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="اسم الشارع، رقم العقار أو المحل، علامة بارزة بجوار المحل"
                className={`w-full bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 border ${
                  errors.fullAddress ? 'border-red-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-brand-500`}
              />
              {errors.fullAddress && (
                <p className="text-[11px] text-red-500 mt-1">{errors.fullAddress}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ملاحظات إضافية لسائق سيارة التوزيع (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: الاستلام بعد الساعة 1 ظهراً، الاتصال قبل الوصول بـ 15 دقيقة..."
                className="w-full bg-slate-50 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Order Brief Summary Box */}
            <div className="bg-slate-100 rounded-2xl p-3 sm:p-4 text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between items-center text-slate-600">
                <span>الأصناف ({cart.length} أصناف):</span>
                <span className="font-bold text-slate-800">{totalQuantity} وحدة إجمالاً</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>مصاريف التوصيل لباب المحل بالإسكندرية:</span>
                <span className="font-bold text-emerald-600">مجاناً</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>طريقة الدفع:</span>
                <span className="font-bold text-slate-800">نقداً عند الاستلام مع السائق</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>المبلغ الإجمالي المستحق:</span>
                <span className="text-brand-800 text-base">
                  {totalAmount.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] active:scale-98 text-white font-black text-sm sm:text-base py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2.5"
            >
              <MessageCircle className="w-5 h-5 fill-white text-transparent" />
              <span>إرسال الطلب الآن عبر واتساب</span>
            </button>

            <p className="text-center text-[11px] text-slate-400">
              🔒 يتم إرسال نسخة من الفاتورة مباشرة لإدارة التوزيع لحجز كمياتك وتحميلها بالسيارة فوراً
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

