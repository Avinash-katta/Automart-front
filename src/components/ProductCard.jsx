import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Scale, Check } from 'lucide-react';

const ProductCard = ({ product, isCompared, onCompareToggle }) => {
  const { addToCart } = useCart();

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0].imageUrl
    : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'; // Default placeholder fallback

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.productId, 1);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCompareToggle(product);
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
      
      {/* Compare Specification Badge/Checkbox */}
      {onCompareToggle && (
        <button
          onClick={handleCompareClick}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full border transition-all cursor-pointer shadow-xs ${
            isCompared
              ? 'bg-amber-500 border-amber-500 text-slate-950 scale-105'
              : 'bg-white/90 backdrop-blur-xs border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-white'
          }`}
          title="Compare Specifications"
        >
          {isCompared ? <Check className="w-3 h-3 stroke-[3]" /> : <Scale className="w-3 h-3" />}
        </button>
      )}

      {/* Product Image Link */}
      <Link to={`/product/${product.productId}`} className="relative block aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Text Details */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.productId}`} className="block transition-colors">
          <h3 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-amber-600 transition-colors uppercase tracking-wide">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 min-h-[32px] font-light leading-normal">
          {product.description || 'No description available'}
        </p>

        {/* Stock Level Warning */}
        <div className="mt-2 min-h-[16px]">
          {isLowStock && (
            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-wider">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Price & Cart Actions */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <span className="text-sm font-black text-slate-900">
            ₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className="p-2.5 rounded-xl bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-255 cursor-pointer shadow-xs transform active:scale-95 flex items-center justify-center"
            title={isOutOfStock ? 'Out of Stock' : 'Quick Add to Basket'}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
