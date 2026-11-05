import React, { useState } from 'react';
import { Gift, X, Store, Phone, User, MapPin, Check, Sparkles, MessageCircle } from 'lucide-react';
import { BusinessType, SampleLeadRequest, CompanySettings } from '../types';
import { ALL_ALEX_DISTRICTS } from '../data/initialData';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';
import confetti from 'canvas-confetti';

interface LeadMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onSubmitRequest: (request: SampleLeadRequest) => void;
}

const POPULAR_SAMPLE_ITEMS = [
  'جردل مايونيز عالي الكثافة 5 كجم',
  'جركن صوص جبنة شيدر ذهبي ساخن',
  'جركن صوص تومية سورية أصلية',
  'جردل زيتون أسود شرائح للبيتزا',
  'جردل خيار مخلل شرائح مقرمش للبرجر',
  'كرتونة كاتشب ضغاط فاخر 12 عبوة',
  'برميل مخلل مشكل للمطاعم 10 كجم',
  'جركن باربيكيو مدخن فاخر'
];

export const LeadMachineModal: React.FC<LeadMachineModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSubmitRequest,
}) => {
  const [shopName, setShopName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('محل كريب وبرجر');
  const [district, setDistrict] = useState(ALL_ALEX_DISTRICTS[0]);
  const [responsibleName, setResponsibleName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'جردل مايونيز عالي الكثافة 5 كجم',
    'جركن صوص جبنة شيدر ذهبي ساخن'
  ]);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !responsibleName.trim() || !phone.trim()) {
      alert('يرجى ملء اسم المنشأة، اسم المسؤول، ورقم الهاتف');
      return;
    }

    const newLead: SampleLeadRequest = {
      id: `LEAD-${Date.now().toString().slice(-4)}`,
      shopName: shopName.trim(),
      businessType,
      district,
      responsibleName: responsibleName.trim(),
      phone: phone.trim(),
      interestedItems: selectedItems,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'جديد',
    };

    onSubmitRequest(newLead);

    // Trigger confetti
    try {
      confetti({ particleCount: 60, spread: 60 });
    } catch {
      // Ignore
    }

    // Direct WhatsApp message notification
    const waText = 
`🎁 *طلب زيارة سيارة التوريدات وعينات مجانية*
• *المحل / المطعم:* ${newLead.shopName} (${newLead.businessType})
• *المسؤول:* ${newLead.responsibleName}
• *الموبايل:* ${newLead.phone}
• *المنطقة بالإسكندرية:* ${newLead.district}
• *الأصناف المطلوبة للمعاينة:*
${newLead.interestedItems.map((i) => `  - ${i}`).join('\n')}
${newLead.notes ? `• *ملاحظات:* ${newLead.notes}\n` : ''}
_يرجى التنسيق وتحديد موعد مرور سيارة التوزيع_`;

    const waUrl = `https://wa.me/${normalizeWhatsAppNumber(settings.adminWhatsApp)}?text=${encodeURIComponent(waText)}`;
    try {
      window.open(waUrl, '_blank');
    } catch {
      // Handled
    }

    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 text-center">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl text-right overflow-hidden relative z-10 border border-slate-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 via-brand-700 to-emerald-800 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-amber-300 ring-2 ring-white/20">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black">طلب زيارة وعينات مجانية لمحلك</h3>
                <span className="text-xs text-amber-100">
                  خدمة مخصصة للمطاعم والكافيهات والسوبرماركت بالإسكندرية
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSuccess ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900">تم تسجيل طلبكم بنجاح!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                سيتواصل معكم مندوب سيارة التوزيع في منطقة <strong>{district}</strong> لتحديد موعد المرور على مطعمك وتقديم عينات الصوصات والمخللات مجاناً لباب المحل.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="bg-brand-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm"
              >
                حسناً، تم
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950 font-medium leading-relaxed">
                🚚 <strong>سيارة التوريدات تصل لباب محلك:</strong> نتيح لأصحاب المطاعم وسلاسل الكريب معاينة عينات عملية من خاماتنا والتأكد من الجودة والكثافة والأسعار قبل بدء التوريد المنتظم.
              </div>

              {/* Shop Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    اسم المحل أو المطعم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="مثال: كريب الزعيم، مطعم البرنس"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع النشاط</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="محل كريب وبرجر">محل كريب وبرجر</option>
                    <option value="مطعم مأكولات سريعة">مطعم مأكولات سريعة وشاورما</option>
                    <option value="سوبرماركت وبقالة">سوبرماركت وبقالة</option>
                    <option value="مطعم بيتزا وفطائر">مطعم بيتزا وفطائر</option>
                    <option value="كافيه ومشروبات">كافيه ومشروبات</option>
                    <option value="مطبخ سحابي وفندق">مطبخ سحابي وفندق</option>
                    <option value="علاّفة وسرج">علاّفة وسرج</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              {/* District & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    المنطقة بالإسكندرية <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-brand-800 focus:ring-2 focus:ring-brand-500"
                  >
                    {ALL_ALEX_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    اسم المسؤول ورقم الموبايل <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      required
                      value={responsibleName}
                      onChange={(e) => setResponsibleName(e.target.value)}
                      placeholder="الشيف أو المدير"
                      className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                    <input
                      type="tel"
                      dir="ltr"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-mono text-right focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sample Items Checkboxes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  الأصناف التي ترغب في معاينة عينات منها وأسعارها:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {POPULAR_SAMPLE_ITEMS.map((item) => {
                    const isChecked = selectedItems.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => handleToggleItem(item)}
                        className={`text-right text-[11px] font-medium p-2 rounded-lg border transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ملاحظات أو مواعيد الزيارة المفضلة
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يفضل الزيارة قبل الساعة 2 ظهراً..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-brand-700 hover:bg-brand-800 active:scale-98 text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4 text-amber-300" />
                <span>إرسال طلب الزيارة والعينات المجانية</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

