import React from 'react';
import { X, Trash2, Plus, Minus, Package, ShoppingBag, ArrowLeft } from 'lucide-react';
import { CartItem, Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (product: Product, quantity: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  minOrderAmount: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  onProceedToCheckout,
  minOrderAmount,
}) => {
  if (!isOpen) return null;

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
  const isBelowMin = minOrderAmount > 0 && totalAmount < minOrderAmount;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">سلة التوريد والجملة</h2>
                <span className="text-xs text-slate-500 font-medium">
                  {totalQuantity} عبوة / كرتونة محددة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-red-600 hover:text-red-700 font-bold p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="تفريغ السلة بالكامل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Package className="w-16 h-16 stroke-1 text-slate-300 mb-3" />
                <p className="text-base font-bold text-slate-700">السلة فارغة حالياً</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  تصفح المنتجات وأضف ما يحتاجه مطعمك أو محلك من صوصات ومخللات وعبوات جملة
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-3.5 flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {item.product.unit} • {item.product.price.toLocaleString('ar-EG')} ج.م للوحدة
                    </span>

                    {/* Stepper controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => onUpdateQuantity(item.product, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onUpdateQuantity(item.product, 0)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        title="حذف الصنف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-left flex-shrink-0">
                    <span className="text-sm font-black text-brand-700 block">
                      {(item.quantity * item.product.price).toLocaleString('ar-EG')}
                    </span>
                    <span className="text-[10px] text-slate-400">ج.م</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>إجمالي الوحدات:</span>
                  <span className="font-bold text-slate-900">{totalQuantity} وحدة</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن والتوصيل لمطعمك بالإسكندرية:</span>
                  <span className="font-bold text-emerald-600">مجاناً بالكامل</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>المبلغ الإجمالي المستحق:</span>
                  <span className="text-brand-800 text-lg">
                    {totalAmount.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              </div>

              {isBelowMin ? (
                <div className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                  الحد الأدنى للطلبية هو {minOrderAmount.toLocaleString('ar-EG')} ج.م. يرجى إضافة منتجات
                  بقيمة {(minOrderAmount - totalAmount).toLocaleString('ar-EG')} ج.م إضافية.
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className="w-full bg-brand-700 hover:bg-brand-800 active:scale-98 text-white font-black text-sm py-3 px-4 rounded-xl shadow-md shadow-brand-700/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>متابعة إدخال بيانات المحل والتوصيل</span>
                  <ArrowLeft className="w-4 h-4 -scale-x-100 sm:scale-x-100" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

