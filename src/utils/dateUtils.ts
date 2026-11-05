import { RouteScheduleItem } from '../types';

export const ARABIC_DAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

/**
 * Returns today's Arabic day name
 */
export function getTodayArabicDay(): string {
  const dayIndex = new Date().getDay(); // 0 is Sunday
  return ARABIC_DAYS[dayIndex];
}

/**
 * Find which route schedule covers a specific district
 */
export function getRouteForDistrict(district: string, schedules: RouteScheduleItem[]): RouteScheduleItem | undefined {
  if (!district) return undefined;
  return schedules.find(s => s.districts.some(d => d.trim().toLowerCase() === district.trim().toLowerCase()));
}

/**
 * Compute the next scheduled delivery description for a selected district
 */
export function getDeliveryScheduleInfo(district: string, schedules: RouteScheduleItem[]): {
  route: RouteScheduleItem | undefined;
  daysDisplay: string;
  isTodayDelivery: boolean;
  nextDayText: string;
} {
  const route = getRouteForDistrict(district, schedules);
  const todayArabic = getTodayArabicDay();

  if (!route) {
    return {
      route: undefined,
      daysDisplay: 'يحدد مع المندوب هاتفياً',
      isTodayDelivery: false,
      nextDayText: 'يتم التنسيق مع إدارة الحركة فور استلام الطلب'
    };
  }

  const isTodayDelivery = route.days.includes(todayArabic);
  const nextDayText = isTodayDelivery 
    ? `🚛 السيارة متواجدة في منطقتك اليوم (${todayArabic})! الطلب يُسلّم في نفس اليوم`
    : `موعد سيارة التوزيع القادمة لمنطقتك: ${route.daysDisplay}`;

  return {
    route,
    daysDisplay: route.daysDisplay,
    isTodayDelivery,
    nextDayText
  };
}

/**
 * Format ISO date string into readable Arabic format
 */
export function formatArabicDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const day = date.getDate();
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;

    return `${day} ${month} ${year} - ${hours}:${minutes} ${ampm}`;
  } catch {
    return isoString;
  }
}

