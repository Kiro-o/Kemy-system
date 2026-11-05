import React, { useState } from 'react';
import { Plus, Minus, Package, Tag, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onUpdateQuantity: (product: Product, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartQuantity,
  onUpdateQuantity,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleIncrement = () => {
    if (!product.inStock) return;
    const newQty = cartQuantity + 1;
    onUpdateQuantity(product, newQty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  const handleDecrement = () => {
    if (cartQuantity <= 0) return;
    onUpdateQuantity(product, cartQuantity - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) {
      onUpdateQuantity(product, 0);
    } else {
      onUpdateQuantity(product, Math.min(val, 999));
    }
  };

  // Determine category badge text
  const getCategoryName = (cat: Product['category']) => {
    switch (cat) {
      case 'restaurant-bulk':
        return 'عبوة مطاعم';
      case 'sauces':
        return 'صوصات';
      case 'pickles':
        return 'مخللات';
      case 'weekly-deals':
        return 'عرض الأسبوع';
      default:
        return 'جملة';
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between relative shadow-sm hover:shadow-md ${
        cartQuantity > 0 ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-brand-900/5' : 'border-slate-200/90'
      } ${!product.inStock ? 'opacity-75 bg-slate-50/60' : ''}`}
    >
      {/* Top badges */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 items-start">
        {product.isWeeklyDeal && (
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm shadow-orange-500/30 flex items-center gap-1">
            🔥 عرض الأسبوع
          </span>
        )}
        <span className="bg-slate-900/80 backdrop-blur-sm text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
          {getCategoryName(product.category)}
        </span>
      </div>

      {/* Out of Stock overlay badge */}
      {!product.inStock && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>نفذ من المخزن</span>
        </div>
      )}

      {/* Product Image Section */}
      <div className="relative w-full h-44 sm:h-48 bg-slate-100 overflow-hidden group">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {/* Packaging Unit Pill overlay */}
        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm border border-slate-200/60 flex items-center gap-1">
          <Package className="w-3.5 h-3.5 text-brand-600" />
          <span>{product.unit}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Description snippet if available */}
          {product.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Bulk Tier Discount Note if any */}
          {product.bulkDiscountNote && (
            <div className="mt-2.5 bg-amber-50/80 border border-amber-200/90 rounded-lg p-1.5 sm:p-2 text-[11px] text-amber-900 font-semibold flex items-start gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{product.bulkDiscountNote}</span>
            </div>
          )}
        </div>

        {/* Pricing & Order Section */}
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          {/* Price display */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs text-slate-400 font-normal">سعر الجملة:</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-black text-brand-700">
                  {product.price.toLocaleString('ar-EG')}
                </span>
                <span className="text-xs font-bold text-brand-800">ج.م</span>
              </div>
            </div>

            {product.oldPrice && product.oldPrice > product.price && (
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block line-through">
                  {product.oldPrice.toLocaleString('ar-EG')} ج
                </span>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                  وفر {(product.oldPrice - product.price).toLocaleString('ar-EG')} ج
                </span>
              </div>
            )}
          </div>

          {/* Action / Stepper */}
          {product.inStock ? (
            cartQuantity === 0 ? (
              <button
                onClick={handleIncrement}
                className="w-full bg-brand-700 hover:bg-brand-800 active:scale-98 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-sm shadow-brand-700/20 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>إضافة للطلبية</span>
              </button>
            ) : (
              <div className="flex items-center justify-between gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-brand-500/40">
                {/* Decrement */}
                <button
                  onClick={handleDecrement}
                  aria-label="إنقاص الكمية"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 active:scale-95 shadow-sm flex items-center justify-center font-bold text-base transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                {/* Direct Number Input */}
                <div className="flex-1 flex flex-col items-center">
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={cartQuantity}
                    onChange={handleInputChange}
                    className="w-14 text-center font-black text-slate-900 bg-transparent text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-brand-500 rounded"
                  />
                  <span className="text-[9px] text-slate-500 font-bold -mt-0.5">وحدة</span>
                </div>

                {/* Increment */}
                <button
                  onClick={handleIncrement}
                  aria-label="زيادة الكمية"
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-white active:scale-95 shadow-sm flex items-center justify-center font-bold text-base transition-all ${
                    justAdded ? 'bg-brand-600 scale-105' : 'bg-brand-700 hover:bg-brand-800'
                  }`}
                >
                  {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            )
          ) : (
            <button
              disabled
              className="w-full bg-slate-200 text-slate-400 font-bold text-xs py-2.5 px-3 rounded-xl cursor-not-allowed"
            >
              غير متوفر بالمخزن حالياً
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

