import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  MessageCircle,
  Truck,
  Shield,
  Save,
  Check,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { CompanySettings, RouteScheduleItem } from '../../types';

interface SettingsManagerProps {
  settings: CompanySettings;
  onSaveSettings: (newSettings: CompanySettings) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<CompanySettings>({
    ...settings,
    adminPin: settings.adminPin || '1980',
  });
  const [pinChange, setPinChange] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync form state whenever live settings update from Firestore doc settings/general
  useEffect(() => {
    setFormData({
      ...settings,
      adminPin: settings.adminPin || '1980',
    });
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: CompanySettings = {
      ...formData,
      adminPin: pinChange.trim().length === 4 ? pinChange.trim() : (formData.adminPin || '1980'),
    };

    onSaveSettings(updated);
    setPinChange('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleRouteDistrictChange = (scheduleId: string, value: string) => {
    const districtsArray = value.split(/[،,]/).map((d) => d.trim()).filter(Boolean);
    const updatedSchedules = formData.routeSchedules.map((s) =>
      s.id === scheduleId ? { ...s, districts: districtsArray } : s
    );
    setFormData({ ...formData, routeSchedules: updatedSchedules });
  };

  const handleRouteDaysChange = (scheduleId: string, daysDisplay: string) => {
    const daysArray = daysDisplay.split(/[و،,]/).map((d) => d.trim()).filter(Boolean);
    const updatedSchedules = formData.routeSchedules.map((s) =>
      s.id === scheduleId ? { ...s, daysDisplay, days: daysArray } : s
    );
    setFormData({ ...formData, routeSchedules: updatedSchedules });
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>تم حفظ كافة إعدادات الشركة وخطوط السير بنجاح! تم تحديث المتجر فوراً.</span>
        </div>
      )}

      {/* Main Business Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Building2 className="w-5 h-5 text-brand-700" />
          <h3 className="font-black text-slate-900 text-sm sm:text-base">
            بيانات المنشأة وهوية المتجر
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              اسم الشركة التجاري الرسمي
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              الوصف المختصر والشعار (Tagline)
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              رقم واتساب الإدارة لاستقبال الفواتير
            </label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                required
                value={formData.adminWhatsApp}
                onChange={(e) => setFormData({ ...formData, adminWhatsApp: e.target.value })}
                placeholder="201000000000"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-right focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              بالكود الدولي لمصر (مثال: 201000000000)
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم الهاتف للدعم السريع</label>
            <input
              type="text"
              dir="ltr"
              value={formData.supportPhone}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-right focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              الحد الأدنى للطلبية (0 = بدون حد أدنى)
            </label>
            <input
              type="number"
              min="0"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-brand-800 focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              0 ج = إتاحة الطلب لأي كمية بدون قيود
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ساعة إغلاق طلبات الغد (نظام 24 س)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="23"
                value={formData.cutOffHour ?? 21}
                onChange={(e) => setFormData({ ...formData, cutOffHour: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-xs text-amber-700 font-bold whitespace-nowrap">
                {(formData.cutOffHour ?? 21) > 12 ? `${(formData.cutOffHour ?? 21) - 12} م` : `${formData.cutOffHour ?? 21} ص`}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              الافتراضي: 21 (الساعة 9:00 مساءً)
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            نص شريط الإشعار والتوصيل المجاني أعلى الموقع
          </label>
          <input
            type="text"
            value={formData.freeDeliveryBadge}
            onChange={(e) => setFormData({ ...formData, freeDeliveryBadge: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Truck Delivery Routes Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Truck className="w-5 h-5 text-brand-700" />
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              تعديل جدول خطوط سير سيارات التوزيع بالإسكندرية
            </h3>
            <span className="text-[11px] text-slate-500">
              يظهر هذا الجدول للعميل في الصفحة الرئيسية ويحدد موعد التحميل عند اختيار منطقته
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {formData.routeSchedules.map((schedule, idx) => (
            <div
              key={schedule.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="text-brand-800">الخط رقم {idx + 1}: {schedule.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    أيام سيارة التوزيع (مفصول بـ "و" أو فاصلة)
                  </label>
                  <input
                    type="text"
                    value={schedule.daysDisplay}
                    onChange={(e) => handleRouteDaysChange(schedule.id, e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    المناطق المشمولة (مفصولة بفاصلة أو "،")
                  </label>
                  <input
                    type="text"
                    value={schedule.districts.join('، ')}
                    onChange={(e) => handleRouteDistrictChange(schedule.id, e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Admin PIN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <Shield className="w-5 h-5 text-amber-600" />
          <h3 className="font-black text-slate-900 text-sm sm:text-base">
            أمان لوحة التحكم وتغيير رمز PIN
          </h3>
        </div>

        <div className="max-w-xs text-xs space-y-1">
          <label className="block font-bold text-slate-700">
            تغيير رمز PIN الحالي ({formData.adminPin || '1980'})
          </label>
          <input
            type="password"
            maxLength={4}
            value={pinChange}
            onChange={(e) => setPinChange(e.target.value)}
            placeholder="أدخل 4 أرقام جديدة"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono tracking-widest text-center focus:ring-2 focus:ring-brand-500"
          />
          <span className="text-[10px] text-slate-400 block">اتركه فارغاً إذا كنت لا تريد تغييره</span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="bg-brand-700 hover:bg-brand-800 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-md shadow-brand-700/20 transition-all flex items-center gap-2 active:scale-98"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التعديلات في النظام</span>
        </button>
      </div>
    </form>
  );
};

