import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { CompanySettings } from '../types';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';

interface CutOffBannerProps {
  settings: CompanySettings;
}

export const CutOffBanner: React.FC<CutOffBannerProps> = ({ settings }) => {
  const cutOffHour = settings.cutOffHour ?? 21; // Default 21 (9:00 PM)

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isBeforeCutoff: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, isBeforeCutoff: true });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const cutOffTime = new Date();
      cutOffTime.setHours(cutOffHour, 0, 0, 0);

      const isBefore = now.getTime() < cutOffTime.getTime();

      if (isBefore) {
        const diffMs = cutOffTime.getTime() - now.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isBeforeCutoff: true });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isBeforeCutoff: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [cutOffHour]);

  const emergencyWhatsAppUrl = `https://wa.me/${normalizeWhatsAppNumber(settings.adminWhatsApp)}?text=${encodeURIComponent(
    `السلام عليكم، أتواصل بخصوص طلبية طارئة بعد موعد إغلاق تحميل سيارة التوزيع من ${settings.companyName}`
  )}`;

  const formattedCutOffDisplay = cutOffHour > 12 
    ? `${cutOffHour - 12}:00 مساءً`
    : `${cutOffHour}:00 ${cutOffHour === 12 ? 'ظهراً' : 'صباحاً'}`;

  return (
    <div
      className={`rounded-2xl p-3 sm:p-4 my-3 border transition-all shadow-sm ${
        timeLeft.isBeforeCutoff
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border-emerald-700/40 shadow-emerald-950/15'
          : 'bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white border-amber-600/40 shadow-amber-950/15'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Status & Message */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${
              timeLeft.isBeforeCutoff
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {timeLeft.isBeforeCutoff ? (
              <Clock className="w-5 h-5 animate-pulse" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full ${
                  timeLeft.isBeforeCutoff
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-400 text-slate-950'
                }`}
              >
                {timeLeft.isBeforeCutoff ? '⚡ التحميل مفتوح الآن' : '⏰ تم إغلاق تحميل سيارة الغد'}
              </span>

              <span className="text-xs text-slate-300 font-bold">
                مواعيد تلقي وحجز طلبيات خط سير الغد تنتهي الساعة {formattedCutOffDisplay}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {timeLeft.isBeforeCutoff ? (
                <>
                  <strong className="text-emerald-300">باب تسجيل وتعديل طلبيات خط سير الغد مفتوح الآن</strong> — احجز بضاعتك لتصلك في موعد التحميل الصباحي لباب المحل مباشرة دون أي حد أدنى.
                </>
              ) : (
                <>
                  <strong className="text-amber-300">تم إغلاق تحميل سيارة الغد:</strong> سيتم جدولة أي طلبات جديدة للرحلة التالية المقررة لمنطقتك بالإسكندرية (أو تواصل مع الإدارة لحالات الطوارئ).
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Live Timer or Emergency Contact Button */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {timeLeft.isBeforeCutoff ? (
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-emerald-500/40 rounded-xl px-3 py-2 text-center" dir="ltr">
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 block font-bold leading-tight" dir="rtl">
                  متبقي للإغلاق:
                </span>
                <span className="font-mono text-sm sm:text-base font-black text-white tracking-widest">
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          ) : (
            <a
              href={emergencyWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>طلب طارئ عبر الإدارة</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

