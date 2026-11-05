import { Product, CompanySettings, RouteScheduleItem, Order, Customer, SampleLeadRequest } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'جردل مايونيز للمطاعم والكريب 5 كجم',
    category: 'restaurant-bulk',
    unit: 'جردل 5 كجم',
    price: 490,
    oldPrice: 540,
    bulkDiscountNote: 'خصم خاص عند طلب 4 جرادل فأكثر (460 ج للجردل)',
    inStock: true,
    isWeeklyDeal: true,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
    description: 'مايونيز عالي الكثافة واللزوجة مخصص لساندوتشات الشاورما والكريب والبرجر، يتحمل السخونة على الجريل دون أن يسيل.'
  },
  {
    id: 'prod-2',
    name: 'كرتونة كاتشب ضغاط فاخر 12 عبوة (1 كجم)',
    category: 'sauces',
    unit: 'كرتونة 12 عبوة',
    price: 420,
    oldPrice: 460,
    bulkDiscountNote: 'خصم 20 ج لكل كرتونة عند طلب 5 كراتين',
    inStock: true,
    isWeeklyDeal: true,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    description: 'كاتشب طماطم طبيعي 100% عبوة سهلة العصر ومثالية لطاولات المطاعم وصالات التقديم.'
  },
  {
    id: 'prod-3',
    name: 'جردل زيتون أسود شرائح للبيتزا والكريب 5 كجم',
    category: 'pickles',
    unit: 'جردل 5 كجم',
    price: 380,
    oldPrice: 410,
    bulkDiscountNote: 'سعر خاص لمطاعم البيتزا والفطائر للطلبيات الكبيرة',
    inStock: true,
    isWeeklyDeal: false,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: 'زيتون مصري ممتاز منزوع النوى مقطع شرائح متناسقة جاهزة للفرن والخبز مباشرة.'
  },
  {
    id: 'prod-4',
    name: 'جركن صوص جبنة شيدر ذهبي ساخن 4 كجم',
    category: 'restaurant-bulk',
    unit: 'جركن 4 كجم',
    price: 530,
    oldPrice: 580,
    bulkDiscountNote: 'وفر 150 ج عند طلب كرتونة 3 جراكن',
    inStock: true,
    isWeeklyDeal: true,
    image: 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?auto=format&fit=crop&w=600&q=80',
    description: 'صوص جبنة شيدر غني ولذيذ قابل للتسخين السريع، قوام سائل مخملي للبطاطس والبرجر وساندوتشات الدجاج المقرمش.'
  },
  {
    id: 'prod-5',
    name: 'برميل مخلل مشكل فاخر للمطاعم 10 كجم',
    category: 'pickles',
    unit: 'برميل 10 كجم',
    price: 260,
    oldPrice: undefined,
    bulkDiscountNote: 'سعر الجملة للبراميل من أرض المستودع بالإسكندرية',
    inStock: true,
    isWeeklyDeal: false,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    description: 'تشكيلة مخللات شعبية مقرمشة (جزر، لفت، فلفل بلدي، خيار) متبلة بالخل والبهارات المصرية.'
  },
  {
    id: 'prod-6',
    name: 'جركن صوص تومية سورية أصلية بالثوم 4.5 كجم',
    category: 'restaurant-bulk',
    unit: 'جركن 4.5 كجم',
    price: 360,
    oldPrice: 395,
    bulkDiscountNote: 'خصم للمطاعم السورية وسلاسل الشاورما',
    inStock: true,
    isWeeklyDeal: false,
    image: 'https://images.unsplash.com/photo-1505575967455-40e256f73376?auto=format&fit=crop&w=600&q=80',
    description: 'تومية ناصعة البياض بقوام كريمي حريري بدون زفارة بيض، طعم ثوم متوازن معتدل الحموضة.'
  },
  {
    id: 'prod-7',
    name: 'جركن صوص باربيكيو مدخن فاخر 4.5 كجم',
    category: 'sauces',
    unit: 'جركن 4.5 كجم',
    price: 375,
    oldPrice: undefined,
    bulkDiscountNote: 'خصم 15 ج عند طلب جركنين فأكثر',
    inStock: true,
    isWeeklyDeal: false,
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    description: 'نكهة التدخين الخشبية الطبيعية مع قوام سميك يعطي لمعة ممتازة لأجنحة الدجاج والمشويات والبرجر.'
  },
  {
    id: 'prod-8',
    name: 'جردل خيار مخلل شرائح مقرمش للبرجر 5 كجم',
    category: 'pickles',
    unit: 'جردل 5 كجم',
    price: 290,
    oldPrice: 320,
    bulkDiscountNote: 'توفير 30 ج للجردل لفترة محدودة',
    inStock: true,
    isWeeklyDeal: true,
    image: 'https://images.unsplash.com/photo-1568600891621-50f697b9a1c7?auto=format&fit=crop&w=600&q=80',
    description: 'شرائح خيار مخلل على الطريقة الأمريكية المتبلة، قرمشة عالية تدوم طويلاً داخل الساندوتش.'
  },
  {
    id: 'prod-9',
    name: 'جردل هلابينو مكسيكي شرائح حار 5 كجم',
    category: 'restaurant-bulk',
    unit: 'جردل 5 كجم',
    price: 410,
    oldPrice: 440,
    bulkDiscountNote: 'خصم 40 ج عند طلب 3 جرادل',
    inStock: true,
    isWeeklyDeal: false,
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
    description: 'فلفل هلابينو أخضر حار مقطع حلقات متساوية، حرارة متزنة مثالية لمطاعم البرجر والتاكو والكريب.'
  },
  {
    id: 'prod-10',
    name: 'كرتونة مستردة معجون ديجون فاخر 12 عبوة (800 جم)',
    category: 'sauces',
    unit: 'كرتونة 12 عبوة',
    price: 390,
    oldPrice: undefined,
    bulkDiscountNote: 'توصيل مجاني للكرتونة مع أي طلبية أخرى',
    inStock: true,
    isWeeklyDeal: false,
    image: 'https://images.unsplash.com/photo-1627662168806-efa33a7cda86?auto=format&fit=crop&w=600&q=80',
    description: 'خردل ناعم الملمس بلون أصفر نقي وطعم لاذع مميز للشيفات والخلطات السرية.'
  },
  {
    id: 'prod-11',
    name: 'جركن صوص رانش أمريكي كريمي 4 كجم',
    category: 'sauces',
    unit: 'جركن 4 كجم',
    price: 440,
    oldPrice: 480,
    bulkDiscountNote: 'عرض خاص لطلبيات سلاسل البيتزا والكريب',
    inStock: true,
    isWeeklyDeal: true,
    image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=600&q=80',
    description: 'صوص رانش معتق بالأعشاب الطبيعية واللبن الرائب، مثالي كغموس للدجاج المقلي والبيتزا.'
  },
  {
    id: 'prod-12',
    name: 'جردل زيتون أخضر كلاماتا طبيعي 5 كجم',
    category: 'pickles',
    unit: 'جردل 5 كجم',
    price: 395,
    oldPrice: undefined,
    bulkDiscountNote: 'سعر خاص لمحلات العلافة والسرج والسوبرماركت',
    inStock: true,
    isWeeklyDeal: false,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    description: 'حبات زيتون أخضر كبيرة متماسكة مخللة في محلول ملحي وزيت زيتون بكر مع الليمون.'
  },
  {
    id: 'prod-13',
    name: 'كرتونة هوت صوص مكسيكي شطة حارة 24 زجاجة',
    category: 'sauces',
    unit: 'كرتونة 24 زجاجة',
    price: 330,
    oldPrice: 360,
    bulkDiscountNote: 'عرض الأسبوع للجملة',
    inStock: true,
    isWeeklyDeal: false,
    image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80',
    description: 'شطة حارة مركزة تابلت مخصص لطاولات المحلات والمطاعم الشعبية.'
  },
  {
    id: 'prod-14',
    name: 'برميل لفت مخلل بلدي مقرمش 10 كجم',
    category: 'pickles',
    unit: 'برميل 10 كجم',
    price: 180,
    oldPrice: undefined,
    bulkDiscountNote: 'سعر جملة خاص عند طلب 3 براميل',
    inStock: false,
    isWeeklyDeal: false,
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=600&q=80',
    description: 'لفت مخلل بلدي أحمر طبيعي بماء البنجر بدون أي ألوان صناعية (نافذ مؤقتاً وسيصل مع شحنة السبت).'
  }
];

export const INITIAL_ROUTE_SCHEDULES: RouteScheduleItem[] = [
  {
    id: 'route-west',
    name: 'خط غرب الإسكندرية والعجمي',
    days: ['السبت', 'الاثنين'],
    daysDisplay: 'السبت والاثنين',
    districts: ['العجمي', 'البيطاش', 'الهانوفيل', 'الدخيلة', 'أبو يوسف', 'الكيلو 21', 'شهر العسل', 'المكس'],
    color: 'emerald'
  },
  {
    id: 'route-east',
    name: 'خط شرق الإسكندرية والكورنيش',
    days: ['الأحد', 'الأربعاء'],
    daysDisplay: 'الأحد والأربعاء',
    districts: ['ميامي', 'سيدي بشر', 'المندرة', 'المنتزه', 'العصافرة', 'المعمورة', 'أبو قير', 'طوسون'],
    color: 'blue'
  },
  {
    id: 'route-central',
    name: 'خط وسط البلد وسموحة وبحري',
    days: ['الثلاثاء', 'الخميس'],
    daysDisplay: 'الثلاثاء والخميس',
    districts: ['سموحة', 'محطة الرمل', 'المنشية', 'بحري', 'الأنفوشي', 'القباري', 'كرموز', 'محرم بك', 'الإبراهيمية', 'سيدي جابر', 'الشاطبي', 'رشدي', 'ستانلي', 'لوران', 'بولكلي', 'العوايد'],
    color: 'amber'
  }
];

export const ALL_ALEX_DISTRICTS = [
  'العجمي',
  'البيطاش',
  'الهانوفيل',
  'الدخيلة',
  'أبو يوسف',
  'الكيلو 21',
  'المكس',
  'ميامي',
  'سيدي بشر',
  'المندرة',
  'المنتزه',
  'العصافرة',
  'المعمورة',
  'أبو قير',
  'طوسون',
  'سموحة',
  'محطة الرمل',
  'المنشية',
  'بحري',
  'الأنفوشي',
  'القباري',
  'كرموز',
  'محرم بك',
  'الإبراهيمية',
  'سيدي جابر',
  'الشاطبي',
  'رشدي',
  'ستانلي',
  'لوران',
  'بولكلي',
  'العوايد',
  'خورشيد',
  'منطقة أخرى بالإسكندرية'
];

export const INITIAL_SETTINGS: CompanySettings = {
  companyName: 'شركة النور للتوريدات الغذائية والجملة - الإسكندرية',
  tagline: 'الموزع المعتمد لصوصات ومخللات وعبوات المطاعم والماركت بالجملة',
  city: 'الإسكندرية، مصر',
  adminWhatsApp: '201000000000',
  supportPhone: '01000000000',
  minOrderAmount: 0, // 0 EGP: Zero minimum order restrictions
  freeDeliveryBadge: '🚚 التوصيل مجاناً لأي كمية بدون حد أدنى لباب المحل - الدفع نقداً عند الاستلام مع السائق',
  adminPin: '1234',
  routeSchedules: INITIAL_ROUTE_SCHEDULES,
  cutOffHour: 21 // 9:00 PM
};

export const INITIAL_ORDERS: Order[] = [
  // Order 1 for West Route (العجمي)
  {
    id: 'NOOR-9102',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    shopName: 'مطعم كريب كينج - فرع العجمي',
    businessType: 'محل كريب وبرجر',
    responsibleName: 'كابتن هيثم الشامي',
    phone: '01012345678',
    district: 'العجمي',
    fullAddress: 'شارع البيطاش الرئيسي، بجوار بنك مصر، أمام محطة مياه العجمي',
    notes: 'الاستلام الصباحي قبل فتح الشيفت الساعة 11 ص، والتأكيد على صوص الشيدر الساخن.',
    routeDay: 'السبت والاثنين',
    nextDeliveryDate: 'السبت القادم',
    items: [
      {
        productId: 'prod-1',
        productName: 'جردل مايونيز للمطاعم والكريب 5 كجم',
        unit: 'جردل 5 كجم',
        price: 490,
        quantity: 8,
        subtotal: 3920
      },
      {
        productId: 'prod-4',
        productName: 'جركن صوص جبنة شيدر ذهبي ساخن 4 كجم',
        unit: 'جركن 4 كجم',
        price: 530,
        quantity: 4,
        subtotal: 2120
      },
      {
        productId: 'prod-3',
        productName: 'جردل زيتون أسود شرائح للبيتزا والكريب 5 كجم',
        unit: 'جردل 5 كجم',
        price: 380,
        quantity: 3,
        subtotal: 1140
      }
    ],
    totalQuantity: 15,
    totalAmount: 7180,
    status: 'جديد',
    paymentMethod: 'نقداً عند الاستلام مع السائق'
  },
  // Order 2 for West Route (البيطاش)
  {
    id: 'NOOR-9103',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    shopName: 'سوبرماركت البركة - البيطاش',
    businessType: 'سوبرماركت وبقالة',
    responsibleName: 'الحاج محمود الديب',
    phone: '01145678901',
    district: 'البيطاش',
    fullAddress: 'شارع الحنفية متفرع من البيطاش الرئيسي، بجوار صيدلية الدكتور وليد',
    notes: 'تفريغ الكراتين في المخزن الأرضي والدفع كاش مع الحاج محمود شخصياً.',
    routeDay: 'السبت والاثنين',
    nextDeliveryDate: 'السبت القادم',
    items: [
      {
        productId: 'prod-2',
        productName: 'كرتونة كاتشب ضغاط فاخر 12 عبوة (1 كجم)',
        unit: 'كرتونة 12 عبوة',
        price: 420,
        quantity: 6,
        subtotal: 2520
      },
      {
        productId: 'prod-5',
        productName: 'برميل مخلل مشكل فاخر للمطاعم 10 كجم',
        unit: 'برميل 10 كجم',
        price: 260,
        quantity: 5,
        subtotal: 1300
      },
      {
        productId: 'prod-8',
        productName: 'جردل خيار مخلل شرائح مقرمش للبرجر 5 كجم',
        unit: 'جردل 5 كجم',
        price: 290,
        quantity: 3,
        subtotal: 870
      }
    ],
    totalQuantity: 14,
    totalAmount: 4690,
    status: 'جديد',
    paymentMethod: 'نقداً عند الاستلام مع السائق'
  },
  // Order 3 for West Route (الهانوفيل)
  {
    id: 'NOOR-9104',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    shopName: 'برجر وكريب العجمي ستار - الهانوفيل',
    businessType: 'محل كريب وبرجر',
    responsibleName: 'كابتن رامي فودة',
    phone: '01511223344',
    district: 'الهانوفيل',
    fullAddress: 'شارع الهانوفيل الرئيسي أمام فتح الله ماركت، مول السلام',
    notes: 'الرجاء التأكيد على تاريخ الصلاحية الحديث لصوص الباربيكيو والهلابينو.',
    routeDay: 'السبت والاثنين',
    nextDeliveryDate: 'السبت القادم',
    items: [
      {
        productId: 'prod-1',
        productName: 'جردل مايونيز للمطاعم والكريب 5 كجم',
        unit: 'جردل 5 كجم',
        price: 490,
        quantity: 6,
        subtotal: 2940
      },
      {
        productId: 'prod-4',
        productName: 'جركن صوص جبنة شيدر ذهبي ساخن 4 كجم',
        unit: 'جركن 4 كجم',
        price: 530,
        quantity: 3,
        subtotal: 1590
      },
      {
        productId: 'prod-7',
        productName: 'جركن صوص باربيكيو مدخن فاخر 4.5 كجم',
        unit: 'جركن 4.5 كجم',
        price: 375,
        quantity: 2,
        subtotal: 750
      },
      {
        productId: 'prod-9',
        productName: 'جردل هلابينو مكسيكي شرائح حار 5 كجم',
        unit: 'جردل 5 كجم',
        price: 410,
        quantity: 3,
        subtotal: 1230
      }
    ],
    totalQuantity: 14,
    totalAmount: 6510,
    status: 'جديد',
    paymentMethod: 'نقداً عند الاستلام مع السائق'
  },
  // Order 4 for East Route (ميامي)
  {
    id: 'NOOR-8941',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    shopName: 'سوبرماركت أولاد رجب - ميامي',
    businessType: 'سوبرماركت وبقالة',
    responsibleName: 'أ / إبراهيم عبد الله',
    phone: '01123456789',
    district: 'ميامي',
    fullAddress: 'شارع خالد بن الوليد، متفرع من الكورنيش، برج النخيل',
    notes: 'برجاء رن جرس المستودع الخلفي للماركت لتفريغ الشحنة.',
    routeDay: 'الأحد والأربعاء',
    nextDeliveryDate: 'الأربعاء القادم',
    items: [
      {
        productId: 'prod-2',
        productName: 'كرتونة كاتشب ضغاط فاخر 12 عبوة (1 كجم)',
        unit: 'كرتونة 12 عبوة',
        price: 420,
        quantity: 5,
        subtotal: 2100
      },
      {
        productId: 'prod-5',
        productName: 'برميل مخلل مشكل فاخر للمطاعم 10 كجم',
        unit: 'برميل 10 كجم',
        price: 260,
        quantity: 3,
        subtotal: 780
      }
    ],
    totalQuantity: 8,
    totalAmount: 2880,
    status: 'تم التحميل في السيارة',
    paymentMethod: 'نقداً عند الاستلام مع السائق'
  },
  // Order 5 for Central Route (سموحة)
  {
    id: 'NOOR-8810',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    shopName: 'شاورما على السيخ - سموحة',
    businessType: 'مطعم مأكولات سريعة',
    responsibleName: 'الشيف أنس الحلبي',
    phone: '01234567890',
    district: 'سموحة',
    fullAddress: 'ميدان فيكتور عمانويل، بجوار نادي سموحة بوابة 3',
    notes: 'تم التسليم واستلام المبلغ مع السائق أحمد.',
    routeDay: 'الثلاثاء والخميس',
    nextDeliveryDate: 'الثلاثاء',
    items: [
      {
        productId: 'prod-6',
        productName: 'جركن صوص تومية سورية أصلية بالثوم 4.5 كجم',
        unit: 'جركن 4.5 كجم',
        price: 360,
        quantity: 4,
        subtotal: 1440
      },
      {
        productId: 'prod-8',
        productName: 'جردل خيار مخلل شرائح مقرمش للبرجر 5 كجم',
        unit: 'جردل 5 كجم',
        price: 290,
        quantity: 3,
        subtotal: 870
      }
    ],
    totalQuantity: 7,
    totalAmount: 2310,
    status: 'تم التسليم والتحصيل',
    paymentMethod: 'نقداً عند الاستلام مع السائق'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    shopName: 'مطعم كريب كينج - فرع العجمي',
    businessType: 'محل كريب وبرجر',
    responsibleName: 'كابتن هيثم الشامي',
    phone: '01012345678',
    district: 'العجمي',
    address: 'شارع البيطاش الرئيسي، بجوار بنك مصر، أمام محطة مياه العجمي',
    status: 'عميل منتظم',
    notes: 'بيسحب مايونيز 5 كجم وصوص شيدر ومخلل أسبوعياً - اشتراك أسبوعي متكرر',
    totalOrdersCount: 8,
    totalSpent: 26400,
    lastOrderDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    isRecurringSubscriber: true,
    recurringSubscription: {
      id: 'REC-001',
      customerId: 'CUST-001',
      shopName: 'مطعم كريب كينج - فرع العجمي',
      responsibleName: 'كابتن هيثم الشامي',
      phone: '01012345678',
      district: 'العجمي',
      deliveryDays: ['السبت', 'الاثنين'],
      deliveryDaysDisplay: 'كل سبت واثنين',
      items: [
        {
          productId: 'prod-1',
          productName: 'جردل مايونيز للمطاعم والكريب 5 كجم',
          unit: 'جردل 5 كجم',
          price: 490,
          quantity: 4
        },
        {
          productId: 'prod-4',
          productName: 'جركن صوص جبنة شيدر ذهبي ساخن 4 كجم',
          unit: 'جركن 4 كجم',
          price: 530,
          quantity: 2
        },
        {
          productId: 'prod-3',
          productName: 'جردل زيتون أسود شرائح للبيتزا 5 كجم',
          unit: 'جردل 5 كجم',
          price: 380,
          quantity: 2
        }
      ],
      totalAmount: 3780,
      isActive: true,
      notes: 'تأكيد التحميل الصباحي في سيارة خط العجمي'
    }
  },
  {
    id: 'CUST-002',
    shopName: 'سوبرماركت البركة - البيطاش',
    businessType: 'سوبرماركت وبقالة',
    responsibleName: 'الحاج محمود الديب',
    phone: '01145678901',
    district: 'البيطاش',
    address: 'شارع الحنفية، متفرع من البيطاش الرئيسي، الإسكندرية',
    status: 'عميل منتظم',
    notes: 'طلب مستمر لكراتين الكاتشب وبراميل المخلل المشكل والزيتون',
    totalOrdersCount: 5,
    totalSpent: 14800,
    lastOrderDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    isRecurringSubscriber: true,
    recurringSubscription: {
      id: 'REC-002',
      customerId: 'CUST-002',
      shopName: 'سوبرماركت البركة - البيطاش',
      responsibleName: 'الحاج محمود الديب',
      phone: '01145678901',
      district: 'البيطاش',
      deliveryDays: ['السبت'],
      deliveryDaysDisplay: 'كل سبت صباحاً',
      items: [
        {
          productId: 'prod-2',
          productName: 'كرتونة كاتشب ضغاط فاخر 12 عبوة (1 كجم)',
          unit: 'كرتونة 12 عبوة',
          price: 420,
          quantity: 4
        },
        {
          productId: 'prod-5',
          productName: 'برميل مخلل مشكل فاخر للمطاعم 10 كجم',
          unit: 'برميل 10 كجم',
          price: 260,
          quantity: 3
        }
      ],
      totalAmount: 2460,
      isActive: true,
      notes: 'تفريغ المخزن الأرضي'
    }
  },
  {
    id: 'CUST-003',
    shopName: 'سوبرماركت أولاد رجب - ميامي',
    businessType: 'سوبرماركت وبقالة',
    responsibleName: 'أ / إبراهيم عبد الله',
    phone: '01123456789',
    district: 'ميامي',
    address: 'شارع خالد بن الوليد، متفرع من الكورنيش، برج النخيل',
    status: 'عميل منتظم',
    notes: 'تفريغ البضاعة من الباب الخلفي للماركت، استلام شحنات الأحد والأربعاء',
    totalOrdersCount: 6,
    totalSpent: 19500,
    lastOrderDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'CUST-004',
    shopName: 'شاورما على السيخ - سموحة',
    businessType: 'مطعم مأكولات سريعة',
    responsibleName: 'الشيف أنس الحلبي',
    phone: '01234567890',
    district: 'سموحة',
    address: 'ميدان فيكتور عمانويل، بجوار نادي سموحة بوابة 3',
    status: 'عميل منتظم',
    notes: 'بيطلب جراكن تومية سورية وصوصات رانش وخيار مخلل شرائح باستمرار',
    totalOrdersCount: 4,
    totalSpent: 11200,
    lastOrderDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    isRecurringSubscriber: true,
    recurringSubscription: {
      id: 'REC-003',
      customerId: 'CUST-004',
      shopName: 'شاورما على السيخ - سموحة',
      responsibleName: 'الشيف أنس الحلبي',
      phone: '01234567890',
      district: 'سموحة',
      deliveryDays: ['الثلاثاء', 'الخميس'],
      deliveryDaysDisplay: 'كل ثلاثاء وخميس',
      items: [
        {
          productId: 'prod-6',
          productName: 'جركن صوص تومية سورية أصلية بالثوم 4.5 كجم',
          unit: 'جركن 4.5 كجم',
          price: 360,
          quantity: 3
        },
        {
          productId: 'prod-8',
          productName: 'جردل خيار مخلل شرائح مقرمش للبرجر 5 كجم',
          unit: 'جردل 5 كجم',
          price: 290,
          quantity: 2
        }
      ],
      totalAmount: 1660,
      isActive: true,
      notes: 'تأكيد التسليم مع الشيف أنس'
    }
  },
  {
    id: 'CUST-005',
    shopName: 'مطعم أسماك وكشكول بحري - المنشية',
    businessType: 'مطعم مأكولات سريعة',
    responsibleName: 'المعلم صبحي الشرقاوي',
    phone: '01098765432',
    district: 'المنشية',
    address: 'شارع فرنسا، قرب ميدان التحرير بالمنشية، الإسكندرية',
    status: 'عميل محتمل / مسجل جديد',
    notes: 'تم تسجيله في خط سير وسط البلد - مهتم ببراميل المخلل البلدي والمستردة وطحينة الجملة',
    totalOrdersCount: 1,
    totalSpent: 1850,
    lastOrderDate: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'CUST-006',
    shopName: 'برجر وكريب العجمي ستار - الهانوفيل',
    businessType: 'محل كريب وبرجر',
    responsibleName: 'كابتن رامي فودة',
    phone: '01511223344',
    district: 'الهانوفيل',
    address: 'شارع الهانوفيل الرئيسي أمام فتح الله ماركت',
    status: 'عميل منتظم',
    notes: 'سحب أسبوعي لصوص الشيدر والمايونيز والهلابينو الحار',
    totalOrdersCount: 3,
    totalSpent: 9600,
    lastOrderDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  }
];

export const INITIAL_SAMPLE_REQUESTS: SampleLeadRequest[] = [
  {
    id: 'LEAD-101',
    shopName: 'مطعم جريل آند كريب فاميلى - المندرة',
    businessType: 'محل كريب وبرجر',
    district: 'المندرة',
    responsibleName: 'الشيف يوسف الشريف',
    phone: '01022334455',
    interestedItems: ['جردل مايونيز 5 كجم', 'صوص جبنة شيدر', 'خيار مخلل شرائح'],
    notes: 'افتتاح فرع جديد يوم الخميس - يرغب في زيارة سيارة التوزيع لمعاينة العينات والأسعار',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    status: 'جديد'
  },
  {
    id: 'LEAD-102',
    shopName: 'بيتزا وفطائر السلطان - الدخيلة',
    businessType: 'مطعم بيتزا وفطائر',
    district: 'الدخيلة',
    responsibleName: 'المعلم كمال عاشور',
    phone: '01199887766',
    interestedItems: ['زيتون أسود شرائح 5 كجم', 'كرتونة كاتشب 12 عبوة'],
    notes: 'طلب عينة زيتون أسود ومقارنة سعر الجملة مع المورد الحالي',
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    status: 'تم التواصل وتحديد الموعد'
  }
];
