import React from 'react';
import { Truck, MapPin, Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { CompanySettings } from '../types';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';

interface FooterProps {
  settings: CompanySettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin }) => {
  const directWhatsAppUrl = `https://wa.me/${normalizeWhatsAppNumber(settings.adminWhatsApp)}?text=${encodeURIComponent(
    `السلام عليكم، أتواصل مع إدارة ${settings.companyName}`
  )}`;

  return (
    <footer className="bg-slate-900 text-slate-300 mt-12 pb-24 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold">
                <Truck className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-black text-white text-base">{settings.companyName}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              الموزع المعتمد والمتخصص لتوريدات المواد الغذائية بالجملة لمطاعم الكريب، البرجر، البيتزا،
              الشاورما، والسوبرماركت بكافة مناطق وأحياء محافظة الإسكندرية.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span>مستودعات التوزيع الرئيسية - الإسكندرية، مصر</span>
            </div>
          </div>

          {/* Quick links & Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm">خدمة عملاء المطاعم والتوريدات</h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                <span>هاتف المبيعات:</span>
                <a href={`tel:${settings.supportPhone}`} className="text-white hover:underline font-mono" dir="ltr">
                  {settings.supportPhone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>واتساب الحجوزات:</span>
                <a href={directWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-mono" dir="ltr">
                  +{settings.adminWhatsApp}
                </a>
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                ساعات العمل: السبت إلى الخميس من 8:00 صباحاً حتى 10:00 مساءً.
              </p>
            </div>
          </div>

          {/* Guarantees & Wholesale Policy */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm">شروط وسياسة التوريد</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• التوصيل مجاني بالكامل لباب المحل دون أي رسوم إضافية.</li>
              <li>• الدفع نقداً عند استلام البضاعة ومطابقة الفاتورة مع السائق.</li>
              <li>• تخضع المنتجات لأعلى معايير سلامة الأغذية وتواريخ الإنتاج الحديثة.</li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>دخول الإدارة والتحكم (PIN)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.companyName} - جميع الحقوق محفوظة.</p>
          <p className="text-[11px]">نظام الطلبيات السريعة B2B لمطاعم وتجار الإسكندرية</p>
        </div>
      </div>
    </footer>
  );
};

