export type ProductCategory = 
  | 'sauces' // الصوصات والكاتشب والمايونيز
  | 'pickles' // الزيتون والمخللات
  | 'restaurant-bulk' // عبوات المطاعم والكريب (جرادل وجراكن)
  | 'weekly-deals'; // عروض التوفير الأسبوعية 🔥

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string; // e.g. "جردل 5 كجم", "كرتونة 12 عبوة", "برميل 10 كجم", "جركن 4 كجم"
  price: number; // Wholesale price in EGP
  oldPrice?: number; // Optional strikethrough price for deals
  bulkDiscountNote?: string; // e.g. "خصم خاص عند طلب 5 جرادل فأكثر: 450 ج"
  minOrderQuantity?: number;
  inStock: boolean;
  isWeeklyDeal: boolean;
  image: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type BusinessType = 
  | 'مطعم مأكولات سريعة'
  | 'محل كريب وبرجر'
  | 'سوبرماركت وبقالة'
  | 'مطعم بيتزا وفطائر'
  | 'كافيه ومشروبات'
  | 'علاّفة وسرج'
  | 'مطبخ سحابي وفندق'
  | 'أخرى';

export type OrderStatus = 
  | 'جديد'
  | 'تم التحميل في السيارة'
  | 'تم التسليم والتحصيل'
  | 'ملغي';

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string; // e.g. "NOOR-7824"
  createdAt: string; // ISO date
  shopName: string;
  businessType: BusinessType;
  responsibleName: string;
  phone: string;
  district: string;
  fullAddress: string;
  notes?: string;
  routeDay: string; // e.g. "السبت والاثنين"
  nextDeliveryDate: string; // e.g. "السبت القادم"
  items: OrderItem[];
  totalQuantity: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string; // e.g. "نقداً عند الاستلام مع السائق"
}

export interface RouteScheduleItem {
  id: string;
  name: string; // e.g. "خط غرب الإسكندرية والعجمي"
  days: string[]; // e.g. ["السبت", "الاثنين"]
  daysDisplay: string; // "السبت والاثنين"
  districts: string[]; // ["العجمي", "البيطاش", "الهانوفيل", "الدخيلة", "أبو يوسف", "الكيلو 21"]
  color: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  city: string;
  adminWhatsApp: string; // e.g. "201000000000"
  supportPhone: string;
  minOrderAmount: number; // 0 for zero minimum order restriction
  freeDeliveryBadge: string;
  adminPin: string;
  routeSchedules: RouteScheduleItem[];
  cutOffHour: number; // default: 21 (9:00 PM)
}

export type CustomerStatus = 'عميل منتظم' | 'عميل محتمل / مسجل جديد' | 'متوقف';

export interface RecurringOrderItem {
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
}

export interface RecurringSubscription {
  id: string; // e.g. "REC-001"
  customerId: string;
  shopName: string;
  responsibleName: string;
  phone: string;
  district: string;
  deliveryDays: string[]; // e.g. ["السبت", "الثلاثاء"]
  deliveryDaysDisplay: string; // e.g. "كل سبت وثلاثاء"
  items: RecurringOrderItem[];
  totalAmount: number;
  isActive: boolean;
  notes?: string;
  lastDispatchedDate?: string;
}

export interface Customer {
  id: string;
  shopName: string;
  businessType: BusinessType;
  responsibleName: string;
  phone: string;
  district: string;
  address?: string;
  status: CustomerStatus;
  notes?: string;
  totalOrdersCount: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  isRecurringSubscriber?: boolean;
  recurringSubscription?: RecurringSubscription;
}

export interface WarehousePackItem {
  productId: string;
  productName: string;
  unit: string;
  totalQuantity: number;
  orderCount: number;
  isLoaded?: boolean;
}

export interface DeliveryStop {
  stopNumber: number;
  orderId: string;
  shopName: string;
  businessType: string;
  responsibleName: string;
  phone: string;
  district: string;
  fullAddress: string;
  itemsSummary: string;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
}

export interface SampleLeadRequest {
  id: string;
  shopName: string;
  businessType: BusinessType;
  district: string;
  responsibleName: string;
  phone: string;
  interestedItems: string[];
  notes?: string;
  createdAt: string;
  status: 'جديد' | 'تم التواصل وتحديد الموعد' | 'تمت الزيارة والتوريد';
}
