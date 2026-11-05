import React from 'react';
import { Phone, MessageCircle, ShieldCheck, MapPin, Truck, Cloud } from 'lucide-react';
import { CompanySettings } from '../types';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';

interface HeaderProps {
  settings: CompanySettings;
  onOpenAdmin: () => void;
  isCloudSynced?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ settings, onOpenAdmin, isCloudSynced = true }) => {
  const directWhatsAppUrl = `https://wa.me/${normalizeWhatsAppNumber(settings.adminWhatsApp)}?text=${encodeURIComponent(
    `السلام عليكم، أتواصل معكم بخصوص طلبيات الجملة والتوريدات الغذائية من ${settings.companyName}`
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top micro-bar: notice & quick contact */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
              توزيع الإسكندرية
            </span>

            {isCloudSynced && (
              <span className="inline-flex items-center gap-1 bg-emerald-900/60 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-md border border-emerald-500/30 font-bold">
                <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                <span>سحابة Firestore متصلة</span>
              </span>
            )}

            <span className="truncate">{settings.freeDeliveryBadge}</span>
          </div>

          <div className="flex items-center gap-3 mr-auto">
            <a
              href={`tel:${settings.supportPhone}`}
              className="inline-flex items-center gap-1 hover:text-brand-400 transition-colors"
              title="اتصال سريع بالدعم"
            >
              <Phone className="w-3 h-3 text-brand-400" />
              <span className="hidden sm:inline">الدعم السريع:</span>
              <span dir="ltr">{settings.supportPhone}</span>
            </a>

            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors text-[11px] border border-slate-700"
              title="الدخول إلى لوحة إدارة الطلبات والأسعار"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>لوحة الإدارة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Commercial Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white flex items-center justify-center shadow-md shadow-brand-900/10 flex-shrink-0 border-2 border-brand-500/30">
            <Truck className="w-6 h-6 text-amber-400" />
          </div>

          <div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {settings.companyName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              <span>{settings.tagline}</span>
            </p>
          </div>
        </div>

        {/* WhatsApp Direct Action Button */}
        <div className="flex items-center gap-2">
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white text-transparent" />
            <span className="hidden xs:inline">تواصل عبر واتساب</span>
            <span className="xs:hidden">واتساب</span>
          </a>
        </div>
      </div>
    </header>
  );
};
