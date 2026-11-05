import React from 'react';
import { ShoppingBag, ArrowLeft, Eye } from 'lucide-react';
import { CartItem } from '../types';

interface CartBottomBarProps {
  cart: CartItem[];
  onOpenCheckout: () => void;
  onOpenDrawer: () => void;
  minOrderAmount: number;
}

export const CartBottomBar: React.FC<CartBottomBarProps> = ({
  cart,
  onOpenCheckout,
  onOpenDrawer,
  minOrderAmount,
}) => {
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
  const isBelowMin = minOrderAmount > 0 && totalAmount < minOrderAmount;

  if (totalQuantity === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl transition-all animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left / Info side */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDrawer}
              className="relative w-12 h-12 rounded-2xl bg-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-700/30 flex-shrink-0 active:scale-95 transition-transform"
              title="معاينة محتويات الطلبية"
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalQuantity}
              </span>
            </button>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-slate-500 font-bold">إجمالي الطلبية:</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {totalAmount.toLocaleString('ar-EG')}
                </span>
                <span className="text-xs font-bold text-slate-600">ج.م</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{totalQuantity} عبوة / كرتونة</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">التوصيل مجاناً بدون حد أدنى</span>
              </div>
            </div>
          </div>

          {/* Mobile quick inspect icon */}
          <button
            onClick={onOpenDrawer}
            className="sm:hidden text-xs text-brand-700 font-bold bg-brand-50 px-2.5 py-1.5 rounded-lg border border-brand-200 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>عرض</span>
          </button>
        </div>

        {/* Right / Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenDrawer}
            className="hidden sm:inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold px-4 py-3 rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة الأصناف</span>
          </button>

          <button
            onClick={onOpenCheckout}
            disabled={isBelowMin}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 font-black text-sm sm:text-base px-6 py-3 rounded-xl shadow-lg transition-all active:scale-98 ${
              isBelowMin
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-brand-700 to-emerald-700 hover:from-brand-800 hover:to-emerald-800 text-white shadow-brand-700/25 ring-2 ring-brand-500/30'
            }`}
          >
            <span>إتمام الطلب وتحديد العنوان</span>
            <ArrowLeft className="w-5 h-5 -scale-x-100 sm:scale-x-100" />
          </button>
        </div>
      </div>

      {/* Minimum order notice alert only if minOrderAmount > 0 */}
      {isBelowMin && (
        <div className="text-center text-[11px] text-red-600 font-bold mt-1.5">
          ⚠️ الحد الأدنى لطلبيات الجملة والتوريدات هو {minOrderAmount.toLocaleString('ar-EG')} ج.م (متبقي{' '}
          {(minOrderAmount - totalAmount).toLocaleString('ar-EG')} ج.م)
        </div>
      )}
    </div>
  );
};
