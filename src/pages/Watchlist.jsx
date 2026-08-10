import React from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';

const Watchlist = () => {
  const { watchlist, toggleWatchlist } = useWatchlist();
  const { addToCart } = useCart();

  const handleAddToBasket = (e, product) => {
    e.preventDefault();
    addToCart(product.productId, 1);
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-all">
            <ArrowLeft className="w-4 h-4 text-amber-500" /> Back to Catalog
          </Link>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" /> My Watchlist
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">Your saved premium parts and custom accessories</p>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center justify-center p-8">
            <Heart className="w-12 h-12 text-slate-200 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Your Watchlist is empty</h3>
            <p className="text-xs text-slate-400 font-light mt-1 max-w-xs leading-relaxed">
              Save your favorite carbon trims, matrix lights, or custom tuning spares to track specifications and prices.
            </p>
            <Link
              to="/"
              className="mt-6 text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/5 border border-amber-500/10 px-6 py-3 rounded-full transition-all uppercase tracking-wider"
            >
              Discover Accessories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {watchlist.map((product) => {
              const img = product.images && product.images.length > 0
                ? product.images[0].imageUrl
                : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400';

              return (
                <div key={product.productId} className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full">
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => toggleWatchlist(product)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-red-50 text-red-500 rounded-full border border-slate-100 shadow-xs transition-colors cursor-pointer"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Image */}
                  <Link to={`/product/${product.productId}`} className="relative block aspect-square w-full bg-slate-50 overflow-hidden">
                    <img src={img} alt={product.name} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103" />
                  </Link>

                  {/* Specs */}
                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/product/${product.productId}`}>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1 uppercase tracking-wide">{product.name}</h3>
                    </Link>
                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 min-h-[32px] font-light leading-normal">{product.description}</p>
                    
                    {/* Actions Row */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                      <span className="text-sm font-black text-slate-950">₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      <button
                        onClick={(e) => handleAddToBasket(e, product)}
                        disabled={product.stock <= 0}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white disabled:bg-slate-100 disabled:text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add to Basket
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Watchlist;
