import React, { useState, useMemo } from 'react';
import {
  Repeat,
  Calendar,
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Package,
  Store,
  DollarSign,
  Phone,
  Send,
  X,
  ExternalLink,
} from 'lucide-react';
import { Customer, Product, RecurringSubscription, RecurringOrderItem, CompanySettings } from '../../types';
import { normalizeWhatsAppNumber } from '../../utils/whatsapp';

interface RecurringOrdersManagerProps {
  customers: Customer[];
  products: Product[];
  settings: CompanySettings;
  onUpdateCustomer: (customer: Customer) => void;
}

export const RecurringOrdersManager: React.FC<RecurringOrdersManagerProps> = ({
  customers,
  products,
  settings,
  onUpdateCustomer,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dispatchedIds, setDispatchedIds] = useState<{ [id: string]: boolean }>({});

  // Form State for editing recurring subscription
  const [deliveryDaysDisplay, setDeliveryDaysDisplay] = useState('كل سبت واثنين');
  const [recurringItems, setRecurringItems] = useState<RecurringOrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedQty, setSelectedQty] = useState<number>(2);
  const [notes, setNotes] = useState('');

  // Filter customers with recurring subscription active
  const recurringCustomers = useMemo(() => {
    return customers.filter((c) => c.isRecurringSubscriber && c.recurringSubscription);
  }, [customers]);

  const handleOpenEdit = (cust: Customer) => {
    setSelectedCustomer(cust);
    if (cust.recurringSubscription) {
      setDeliveryDaysDisplay(cust.recurringSubscription.deliveryDaysDisplay);
      setRecurringItems(cust.recurringSubscription.items || []);
      setNotes(cust.recurringSubscription.notes || '');
    } else {
      setDeliveryDaysDisplay('كل سبت واثنين');
      setRecurringItems([]);
      setNotes('');
    }
    setIsEditModalOpen(true);
  };

  const handleAddItemToBasket = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod || selectedQty <= 0) return;

    const existingIdx = recurringItems.findIndex((it) => it.productId === prod.id);
    if (existingIdx >= 0) {
      const updated = [...recurringItems];
      updated[existingIdx].quantity += selectedQty;
      setRecurringItems(updated);
    } else {
      setRecurringItems([
        ...recurringItems,
        {
          productId: prod.id,
          productName: prod.name,
          unit: prod.unit,
          price: prod.price,
          quantity: selectedQty,
        },
      ]);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setRecurringItems(recurringItems.filter((i) => i.productId !== productId));
  };

  const calculateTotal = (items: RecurringOrderItem[]) => {
    return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  };

  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const totalAmount = calculateTotal(recurringItems);
    const subscription: RecurringSubscription = {
      id: selectedCustomer.recurringSubscription?.id || `REC-${Date.now().toString().slice(-4)}`,
      customerId: selectedCustomer.id,
      shopName: selectedCustomer.shopName,
      responsibleName: selectedCustomer.responsibleName,
      phone: selectedCustomer.phone,
      district: selectedCustomer.district,
      deliveryDays: deliveryDaysDisplay.split(/[و،,]/).map((d) => d.trim()),
      deliveryDaysDisplay,
      items: recurringItems,
      totalAmount,
      isActive: true,
      notes: notes.trim() || undefined,
    };

    onUpdateCustomer({
      ...selectedCustomer,
      isRecurringSubscriber: true,
      recurringSubscription: subscription,
    });

    setIsEditModalOpen(false);
  };

  const handleRemoveSubscription = (cust: Customer) => {
    if (confirm(`هل أنت متأكد من إلغاء تفعيل الاشتراك الأسبوعي لمطعم "${cust.shopName}"؟`)) {
      onUpdateCustomer({
        ...cust,
        isRecurringSubscriber: false,
        recurringSubscription: undefined,
      });
    }
  };

  // 1-Click Auto-Replenishment WhatsApp Dispatch
  const handleDispatchReplenishment = (cust: Customer) => {
    const sub = cust.recurringSubscription;
    if (!sub) return;

    const itemsSummary = sub.items
      .map((it) => `• ${it.quantity} × ${it.productName} (${it.unit}) = ${it.price * it.quantity} ج`)
      .join('\n');

    const promptMessage = 
`مساء الخير شيف *${cust.responsibleName}* (*${cust.shopName}*) 🚚
من شركة النور للتوريدات الغذائية بالإسكندرية.

ميعاد توريدك الأسبوعي الدوري غداً إن شاء الله (${sub.deliveryDaysDisplay}):
${itemsSummary}
---------------------------------------
💰 *إجمالي الفاتورة المحفوظة:* *${sub.totalAmount.toLocaleString('ar-EG')} جنيه مصري*
💵 *الدفع:* نقداً عند الاستلام مع السائق والتوصيل مجاناً لباب المحل.

هل نأكد لسيادتك تحميل نفس الكمية في السيارة النص نقل صباحاً؟`;

    const cleanPhone = normalizeWhatsAppNumber(cust.phone);
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(promptMessage)}`;
    window.open(url, '_blank');

    setDispatchedIds((prev) => ({
      ...prev,
      [cust.id]: true,
    }));
  };

  return (
    <div className="space-y-5">
      {/* Overview & Quick Info */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-brand-700" />
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              أوتوميشن الاشتراكات الأسبوعية والطلبيات الدورية للمطاعم
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            تثبيت سلة نواقص أسبوعية للمطاعم المنتظمة وإرسال تذكير تأكيد التحميل بنقرة واحدة قبل موعد خط السير
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-brand-50 text-brand-900 border border-brand-200 px-3 py-1.5 rounded-xl self-start md:self-center">
          <Repeat className="w-4 h-4 text-brand-700" />
          <span>{recurringCustomers.length} مطاعم مشتركة أسبوعياً</span>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {recurringCustomers.map((cust) => {
          const sub = cust.recurringSubscription!;
          const isDispatched = !!dispatchedIds[cust.id];

          return (
            <div
              key={cust.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col justify-between transition-all hover:border-brand-500/40"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{cust.shopName}</h4>
                    <span className="text-xs text-brand-800 font-bold block mt-0.5">
                      {cust.district} • {cust.businessType}
                    </span>
                  </div>
                  <span className="bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    نشط أسبوعياً
                  </span>
                </div>

                {/* Days & Contact */}
                <div className="py-2.5 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>مواعيد التوريد الثابتة: {sub.deliveryDaysDisplay}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>المسؤول: {cust.responsibleName} ({cust.phone})</span>
                  </div>
                </div>

                {/* Recurring Basket Items */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    السلة الأسبوعية المحفوظة:
                  </span>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {sub.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>{it.quantity} × {it.productName} ({it.unit})</span>
                        <span className="font-bold text-slate-900">{it.price * it.quantity} ج</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between font-black text-brand-800 text-xs">
                    <span>إجمالي الأسبوع:</span>
                    <span>{sub.totalAmount.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handleDispatchReplenishment(cust)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                    isDispatched
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-[#25D366] hover:bg-[#20ba5a] text-white active:scale-98'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 fill-current text-transparent" />
                  <span>
                    {isDispatched ? 'تم إرسال تذكير التأكيد ✅' : 'إرسال تذكير تأكيد التحميل (واتساب)'}
                  </span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => handleOpenEdit(cust)}
                    className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 p-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل السلة</span>
                  </button>

                  <button
                    onClick={() => handleRemoveSubscription(cust)}
                    className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إلغاء التكرار</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Subscription from any customer */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h4 className="font-bold text-slate-800">ترقية أي مطعم لاشتراك دوري:</h4>
          <p className="text-slate-500 mt-0.5">
            اختر أي مطعم من القائمة لتحديد سلة أصنافه الثابتة وأيام توريده الأسبوعية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              const cust = customers.find((c) => c.id === e.target.value);
              if (cust) handleOpenEdit(cust);
            }}
            defaultValue=""
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500"
          >
            <option value="" disabled>اختر المحل أو المطعم...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shopName} ({c.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Edit / Configure Subscription Modal */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative z-10 text-right border border-slate-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-brand-700" />
                  <h3 className="font-black text-slate-900 text-base">
                    ضبط التوريد الأسبوعي: {selectedCustomer.shopName}
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSubscription} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    أيام التوريد الأسبوعية الثابتة
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryDaysDisplay}
                    onChange={(e) => setDeliveryDaysDisplay(e.target.value)}
                    placeholder="مثال: كل سبت واثنين، كل ثلاثاء وخميس"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 font-bold"
                  />
                </div>

                {/* Add Item to Basket */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">إضافة أصناف للسلة الدورية:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.unit} - {p.price}ج)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={selectedQty}
                        onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 bg-white border border-slate-300 rounded-xl px-2 py-2 text-center text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleAddItemToBasket}
                        className="flex-1 bg-brand-700 hover:bg-brand-800 text-white font-bold py-2 px-2 rounded-xl transition-colors"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items in Basket List */}
                <div>
                  <span className="font-bold text-slate-700 block mb-1">
                    الأصناف المحددة حالياً ({recurringItems.length}):
                  </span>
                  {recurringItems.length === 0 ? (
                    <p className="text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                      لم يتم إضافة أصناف بعد
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto divide-y divide-slate-100">
                      {recurringItems.map((it) => (
                        <div key={it.productId} className="flex justify-between items-center pt-1.5">
                          <div>
                            <span className="font-bold text-slate-800">{it.productName}</span>
                            <span className="text-[10px] text-slate-400 block">
                              {it.quantity} × {it.unit} ({it.price} ج)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-brand-800">{it.price * it.quantity} ج</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.productId)}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>إجمالي السلة الدورية للأسبوع:</span>
                  <span className="text-brand-800">
                    {calculateTotal(recurringItems).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ملاحظات أو تعليمات خاصة للمندوب والسائق
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: يفضل استلام الأوردر قبل فتح شيفت الظهر..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2 rounded-xl font-bold shadow-sm"
                  >
                    حفظ وتفعيل الاشتراك
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

