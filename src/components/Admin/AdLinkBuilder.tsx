import React, { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Share2,
  Sparkles,
  Target,
  Megaphone,
  Store,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { ALL_ALEX_DISTRICTS } from '../../data/initialData';
import { normalizeWhatsAppNumber } from '../../utils/whatsapp';

interface AdLinkBuilderProps {
  settings: CompanySettings;
}

export const AdLinkBuilder: React.FC<AdLinkBuilderProps> = ({ settings }) => {
  const [targetDistrict, setTargetDistrict] = useState<string>('العجمي');
  const [adAngle, setAdAngle] = useState<'discount' | 'samples' | 'fast_delivery' | 'crepe_burger'>(
    'discount'
  );
  const [customPromoCode, setCustomPromoCode] = useState('ALEX2026');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const cleanPhone = normalizeWhatsAppNumber(settings.adminWhatsApp);
  const storefrontBaseUrl = window.location.origin;

  // Preset promotional message generator
  const getPreFilledMessage = () => {
    switch (adAngle) {
      case 'discount':
        return `مرحباً، شاهدت إعلانكم لخصومات مطاعم (${targetDistrict}) بالإسكندرية بكود [${customPromoCode}]، وأرغب في استلام قائمة أسعار الجملة للصوصات والمخللات.`;
      case 'samples':
        return `السلام عليكم، مهتم بعرض سيارة التوريدات وتجربة عينات مجانية لمطعمنا في (${targetDistrict}) لمعاينة كثافة المايونيز والشيدر.`;
      case 'fast_delivery':
        return `مساء الخير، محتاجين توريد نواقص مستعجل لمطعمنا في (${targetDistrict}) في خط سير الغد مع التوصيل المجاني كاش عند الاستلام.`;
      case 'crepe_burger':
        return `السلام عليكم، نحن سلسلة كريب وبرجر في (${targetDistrict}) ونرغب في توريد كميات جرادل مايونيز وشيدر وتومية وهلابينو بأفضل سعر جملة.`;
    }
  };

  const generatedWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    getPreFilledMessage()
  )}`;

  const generatedStorefrontUrl = `${storefrontBaseUrl}?ref=ad_${targetDistrict}&promo=${customPromoCode}`;

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(id);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-5">
      {/* Overview */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              ماكينة جمع طلبات المحلات الجديدة ومولد روابط الحملات الإعلانية
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            توليد روابط واتساب وروابط متجر مخصصة لإعلانات فيسبوك وإنستجرام لاستهداف مطاعم مناطق محددة بالإسكندرية
          </p>
        </div>

        <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 font-bold px-3 py-1.5 rounded-xl self-start md:self-center">
          ⚡ تحويل فوري لعملاء جدد في الـ CRM
        </span>
      </div>

      {/* Builder Form */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-700" />
          <span>تخصيص زاوية الإعلان والمنطقة المستهدفة:</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">المنطقة بالإسكندرية الموجه إليها الإعلان</label>
            <select
              value={targetDistrict}
              onChange={(e) => setTargetDistrict(e.target.value)}
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
            <label className="block font-bold text-slate-700 mb-1">زاوية العرض الإعلاني (Offer Angle)</label>
            <select
              value={adAngle}
              onChange={(e) => setAdAngle(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-brand-500"
            >
              <option value="discount">عرض خصم خاص للمطاعم الجديدة</option>
              <option value="samples">عرض زيارة سيارة التوريدات وتجربة عينات مجانية</option>
              <option value="crepe_burger">عرض مخصص لمطاعم الكريب والبرجر والشاورما</option>
              <option value="fast_delivery">عرض توصيل سريع صباحي بدون حد أدنى</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">كود الخصم الترويجي (Promo Code)</label>
            <input
              type="text"
              value={customPromoCode}
              onChange={(e) => setCustomPromoCode(e.target.value.toUpperCase())}
              placeholder="ALEX2026"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Generated WhatsApp Campaign Link Box */}
        <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 fill-[#25D366] text-transparent" />
              <span>1. رابط الإعلان المباشر إلى واتساب (WhatsApp Ad Direct Link):</span>
            </span>
            <span className="text-[10px] bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
              الأعلى في معدل التحويل للمطاعم
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs font-mono text-slate-700 break-all select-all flex items-center justify-between gap-2">
            <span className="line-clamp-2">{generatedWhatsAppUrl}</span>
          </div>

          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200 text-xs text-slate-600">
            <strong className="text-emerald-900 block mb-1">نص الرسالة التي سيجدها الشيف جاهزة للإرسال:</strong>
            <p className="italic font-sans">"{getPreFilledMessage()}"</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => copyToClipboard(generatedWhatsAppUrl, 'wa')}
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              {copiedLink === 'wa' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink === 'wa' ? 'تم نسخ الرابط!' : 'نسخ رابط واتساب الإعلاني'}</span>
            </button>

            <a
              href={generatedWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>تجربة فتح الرابط</span>
            </a>
          </div>
        </div>

        {/* Generated Storefront Campaign Link Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Store className="w-4 h-4 text-brand-700" />
              <span>2. رابط المتجر والكتالوج الإلكتروني المباشر (Storefront Web Link):</span>
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              لإعلانات تصفح الكتالوج
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 break-all select-all flex items-center justify-between gap-2">
            <span className="truncate">{generatedStorefrontUrl}</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => copyToClipboard(generatedStorefrontUrl, 'store')}
              className="inline-flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              {copiedLink === 'store' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink === 'store' ? 'تم نسخ الرابط!' : 'نسخ رابط المتجر الإعلاني'}</span>
            </button>

            <a
              href={generatedStorefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl border border-slate-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>معاينة المتجر</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

