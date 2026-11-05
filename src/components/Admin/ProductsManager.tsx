import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Flame,
  Package,
  RotateCcw,
  Sparkles,
  DollarSign,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';

interface ProductsManagerProps {
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct: (updated: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProducts: () => void;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
}) => {
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Form states for Add / Edit
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'sauces',
    unit: 'جردل 5 كجم',
    price: 350,
    oldPrice: undefined,
    bulkDiscountNote: '',
    inStock: true,
    isWeeklyDeal: false,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
    description: '',
  });

  const handleStartPriceEdit = (p: Product) => {
    setEditingPriceId(p.id);
    setTempPrice(p.price.toString());
  };

  const handleSavePrice = (p: Product) => {
    const newPrice = parseFloat(tempPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      onUpdateProduct({
        ...p,
        price: newPrice,
      });
    }
    setEditingPriceId(null);
  };

  const handleToggleStock = (p: Product) => {
    onUpdateProduct({
      ...p,
      inStock: !p.inStock,
    });
  };

  const handleToggleDeal = (p: Product) => {
    onUpdateProduct({
      ...p,
      isWeeklyDeal: !p.isWeeklyDeal,
    });
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      category: 'restaurant-bulk',
      unit: 'جردل 5 كجم',
      price: 300,
      oldPrice: undefined,
      bulkDiscountNote: '',
      inStock: true,
      isWeeklyDeal: false,
      image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
      description: '',
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setIsAddModalOpen(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.price || formData.price <= 0) {
      alert('يرجى ملء اسم الصنف وسعر الجملة بشكل صحيح');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...(formData as Product),
        id: editingProduct.id,
      });
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name.trim(),
        category: (formData.category || 'sauces') as ProductCategory,
        unit: formData.unit?.trim() || 'جردل 5 كجم',
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
        bulkDiscountNote: formData.bulkDiscountNote?.trim() || undefined,
        inStock: formData.inStock ?? true,
        isWeeklyDeal: formData.isWeeklyDeal ?? false,
        image: formData.image || 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80',
        description: formData.description?.trim() || undefined,
      };
      onAddProduct(newProduct);
    }

    setIsAddModalOpen(false);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.unit.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Action Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto flex-1 max-w-sm">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="بحث في المنتجات لتعديل السعر..."
            className="w-full bg-slate-50 text-xs sm:text-sm rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              if (confirm('هل تريد استعادة قائمة الأصناف الافتراضية وإلغاء التعديلات؟')) {
                onResetProducts();
              }
            }}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors"
            title="استعادة الـ 14 صنف الافتراضي"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">استعادة الافتراضي</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف جملة جديد</span>
          </button>
        </div>
      </div>

      {/* Info notice about inline price editing */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <span>
          💡 <strong>تحديث الأسعار السريع:</strong> يمكنك الضغط مباشرة على سعر أي صنف لتعديله فوراً وحفظه دون فتح شاشات إضافية (مفيد جداً في أوقات التغير السريع للأسعار).
        </span>
      </div>

      {/* Products Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">الصورة والصنف</th>
                <th className="py-3 px-3">العبوة والوحدة</th>
                <th className="py-3 px-3">سعر الجملة الحالي</th>
                <th className="py-3 px-3">حالة المخزن</th>
                <th className="py-3 px-3">عرض أسبوعي</th>
                <th className="py-3 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isEditingPrice = editingPriceId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Image & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                            {p.name}
                          </p>
                          {p.bulkDiscountNote && (
                            <span className="text-[10px] text-amber-700 block truncate max-w-[200px]">
                              {p.bulkDiscountNote}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {p.unit}
                      </span>
                    </td>

                    {/* Price with Inline Quick Editor */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isEditingPrice ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePrice(p);
                              if (e.key === 'Escape') setEditingPriceId(null);
                            }}
                            autoFocus
                            className="w-20 bg-white border border-brand-500 rounded px-2 py-1 text-xs font-black text-slate-900 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSavePrice(p)}
                            className="text-emerald-600 hover:text-emerald-700 p-1"
                            title="حفظ السعر"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                            title="إلغاء"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartPriceEdit(p)}
                          className="group flex items-baseline gap-1 hover:bg-amber-50 px-2 py-1 rounded transition-colors text-right"
                          title="اضغط للتعديل السريع للسعر"
                        >
                          <span className="font-black text-brand-800 text-sm">
                            {p.price.toLocaleString('ar-EG')}
                          </span>
                          <span className="text-[10px] text-slate-500">ج.م</span>
                          <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-amber-600 mr-1" />
                        </button>
                      )}
                    </td>

                    {/* Stock toggle */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStock(p)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                          p.inStock
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                        }`}
                      >
                        {p.inStock ? 'متوفر بالمخزن' : 'نافذ (غير متوفر)'}
                      </button>
                    </td>

                    {/* Weekly deal toggle */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleDeal(p)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          p.isWeeklyDeal
                            ? 'bg-orange-50 border-orange-300 text-orange-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        title="تبديل وسم العرض الأسبوعي"
                      >
                        <Flame
                          className={`w-4 h-4 ${p.isWeeklyDeal ? 'fill-orange-500 text-orange-500' : ''}`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="تعديل التفاصيل بالكامل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف الصنف "${p.name}"؟`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="حذف الصنف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative z-10 text-right border border-slate-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <h3 className="font-black text-slate-900 text-base">
                  {editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جملة جديد'}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductForm} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الصنف التجاري</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: جردل باربيكيو للمطاعم 5 كجم"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">القسم</label>
                    <select
                      value={formData.category || 'sauces'}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as ProductCategory })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
                    >
                      <option value="restaurant-bulk">عبوات المطاعم والكريب (جرادل وجراكن)</option>
                      <option value="sauces">الصوصات والكاتشب والمايونيز</option>
                      <option value="pickles">الزيتون والمخللات</option>
                      <option value="weekly-deals">عروض التوفير الأسبوعية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">نوع العبوة والوزن</label>
                    <input
                      type="text"
                      required
                      value={formData.unit || ''}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="مثال: جردل 5 كجم، كرتونة 12 قطعة"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">سعر الجملة (ج.م)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-brand-800 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      السعر القديم قبل الخصم (اختياري)
                    </label>
                    <input
                      type="number"
                      value={formData.oldPrice || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          oldPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="لو الصنف في عرض"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ملاحظة شريحة الخصم للكميات
                  </label>
                  <input
                    type="text"
                    value={formData.bulkDiscountNote || ''}
                    onChange={(e) => setFormData({ ...formData, bulkDiscountNote: e.target.value })}
                    placeholder="مثال: خصم خاص عند طلب 4 جرادل فأكثر (450 ج للجردل)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رابط صورة المنتج (URL)</label>
                  <input
                    type="url"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">وصف الصنف واستخداماته</label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف جودة المنتج وتفاصيله لمطاعم الإسكندرية..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.inStock ?? true}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>متوفر بالمخزن وجاهز للشحن</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-orange-600">
                    <input
                      type="checkbox"
                      checked={formData.isWeeklyDeal ?? false}
                      onChange={(e) => setFormData({ ...formData, isWeeklyDeal: e.target.checked })}
                      className="rounded text-orange-500 focus:ring-orange-500"
                    />
                    <span>عرض أسبوعي مميز 🔥</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-700 hover:bg-brand-800 text-white px-5 py-2 rounded-xl font-bold transition-colors shadow-sm"
                  >
                    {editingProduct ? 'حفظ التعديلات' : 'إضافة الصنف'}
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

