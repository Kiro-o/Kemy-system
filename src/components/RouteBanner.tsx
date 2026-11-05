import React, { useState } from 'react';
import { Truck, Calendar, MapPin, ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import { RouteScheduleItem } from '../types';
import { getTodayArabicDay } from '../utils/dateUtils';

interface RouteBannerProps {
  schedules: RouteScheduleItem[];
}

export const RouteBanner: React.FC<RouteBannerProps> = ({ schedules }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const todayArabic = getTodayArabicDay();

  // Find if any route runs today
  const activeTodayRoute = schedules.find(s => s.days.includes(todayArabic));

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-emerald-950/20 border border-emerald-800/30 my-4 sm:my-6 overflow-hidden relative">
      {/* Background subtle decoration */}
      <div className="absolute -top-10 -left-10 w-44 h-44 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center flex-shrink-0 animate-soft-pulse">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                جدول خطوط سير سيارات التوزيع بالإسكندرية
              </h2>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                اليوم: {todayArabic}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              تصل سيارة البضائع لباب مطعمك أو محلك مجاناً وفقاً لجدول المناطق الأسبوعي التالي:
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-end sm:self-center inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          <span>{isExpanded ? 'طي التفاصيل' : 'عرض كافة المناطق'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Today Quick Callout Banner if applicable */}
      {activeTodayRoute && (
        <div className="mt-3 bg-gradient-to-r from-emerald-900/60 to-brand-900/40 border border-brand-500/40 rounded-xl p-2.5 sm:p-3 flex items-center gap-2 text-xs sm:text-sm text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <strong className="text-white font-bold">السيارة متواجدة اليوم في الإسكندرية: </strong>
            <span>{activeTodayRoute.name} ({activeTodayRoute.districts.slice(0, 4).join('، ')}...) - اطلب الآن للاستلام الفوري!</span>
          </div>
        </div>
      )}

      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3.5">
        {schedules.map((schedule) => {
          const isToday = schedule.days.includes(todayArabic);

          return (
            <div
              key={schedule.id}
              className={`rounded-xl p-3.5 transition-all relative border ${
                isToday
                  ? 'bg-emerald-950/70 border-brand-500 shadow-md shadow-brand-950/40 ring-1 ring-brand-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Today Badge */}
              {isToday && (
                <div className="absolute -top-2.5 left-3 bg-brand-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                  ⚡ تحميل اليوم
                </div>
              )}

              {/* Day Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isToday ? 'bg-brand-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {schedule.daysDisplay}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">{schedule.name}</span>
                </div>
              </div>

              {/* Districts Tag List */}
              <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-slate-800/80">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {isExpanded
                    ? schedule.districts.join('، ')
                    : schedule.districts.slice(0, 4).join('، ') +
                      (schedule.districts.length > 4 ? ` (+${schedule.districts.length - 4} مناطق)` : '')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Friday Notice */}
      <div className="mt-3 pt-2 text-center text-[11px] text-slate-400 border-t border-slate-800/60 flex items-center justify-center gap-1.5">
        <span>💡 يوم الجمعة: عطلة أسبوعية لسيارات التوزيع واستقبال حجز طلبيات السبت والأحد.</span>
      </div>
    </div>
  );
};

