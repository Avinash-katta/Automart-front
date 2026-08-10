import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Scale, Check } from 'lucide-react';

const CompareDrawer = ({ selectedProducts, onRemove, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!selectedProducts || selectedProducts.length === 0) return null;

  return (
    <>
      {/* Bottom Sticky Tray */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-white py-4 px-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-xl text-amber-500 border border-amber-500/20 hidden sm:block">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">Compare Specifications</h4>
            <p className="text-[10px] text-slate-400 font-light mt-0.5">Select up to 3 products to compare fitment, origin, and certifications</p>
          </div>
        </div>

        {/* Selected Products Thumbnails */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 max-w-full">
          {selectedProducts.map(p => {
            const img = p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300';
            return (
              <div key={p.productId} className="flex items-center gap-2 bg-slate-800 border border-slate-700/50 rounded-xl p-1.5 pr-2.5 flex-shrink-0 relative group">
                <img src={img} alt={p.name} className="w-8 h-8 object-cover rounded-lg" />
                <span className="text-[10px] font-bold text-slate-200 truncate max-w-[80px]">{p.name}</span>
                <button
                  onClick={() => onRemove(p.productId)}
                  className="p-0.5 bg-slate-700 hover:bg-red-500 hover:text-white rounded-full text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Tray Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onClear}
            className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          >
            Compare Now ({selectedProducts.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Comparison Details Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-slide-in">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Specs Matcher
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">Automotive Specs Comparison</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">Direct comparison of pricing, stock limits, fitment parameters, and certificates.</p>
            </div>

            {/* Comparison Grid Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60">
                    <th className="p-4 w-1/4">Specification</th>
                    {selectedProducts.map(p => (
                      <th key={p.productId} className="p-4 w-1/4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images && p.images.length > 0 ? p.images[0].imageUrl : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300'}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                          />
                          <div>
                            <p className="font-bold text-white line-clamp-1">{p.name}</p>
                            <p className="text-[9px] text-amber-500 uppercase tracking-widest mt-0.5 font-black">{p.brand || 'AutoMart'}</p>
                          </div>
                        </div>
                      </th>
                    ))}
                    {/* Fill empty spaces up to 3 cols */}
                    {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, idx) => (
                      <th key={idx} className="p-4 w-1/4 text-slate-700 font-light italic">Empty comparison slot</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {/* Price */}
                  <tr>
                    <td className="p-4 font-bold text-slate-400 bg-slate-950/20">Price (INR)</td>
                    {selectedProducts.map(p => (
                      <td key={p.productId} className="p-4 font-extrabold text-white text-sm">
                        ₹{parseFloat(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, idx) => (
                      <td key={idx} className="p-4 text-slate-750">-</td>
                    ))}
                  </tr>

                  {/* Stock Availability */}
                  <tr>
                    <td className="p-4 font-bold text-slate-400 bg-slate-950/20">Stock Status</td>
                    {selectedProducts.map(p => (
                      <td key={p.productId} className="p-4">
                        {p.stock <= 0 ? (
                          <span className="text-red-500 font-extrabold uppercase text-[9px] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Out of Stock</span>
                        ) : p.stock <= 10 ? (
                          <span className="text-orange-500 font-extrabold uppercase text-[9px] bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">Only {p.stock} left</span>
                        ) : (
                          <span className="text-emerald-500 font-extrabold uppercase text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">In Stock ({p.stock})</span>
                        )}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, idx) => (
                      <td key={idx} className="p-4 text-slate-750">-</td>
                    ))}
                  </tr>

                  {/* Fitment Type */}
                  <tr>
                    <td className="p-4 font-bold text-slate-400 bg-slate-950/20">Fitment Type</td>
                    {selectedProducts.map(p => (
                      <td key={p.productId} className="p-4 font-semibold text-slate-200">
                        {p.fitmentType || 'Direct OEM Replacement'}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, idx) => (
                      <td key={idx} className="p-4 text-slate-750">-</td>
                    ))}
                  </tr>

                  {/* Material Grade */}
                  <tr>
                    <td className="p-4 font-bold text-slate-400 bg-slate-950/20">Material Grade</td>
                    {selectedProducts.map(p => (
                      <td key={p.productId} className="p-4 font-semibold text-slate-200">
                        {p.materialGrade || 'High-Tensile Carbon Steel & ABS'}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, idx) => (
                      <td key={idx} className="p-4 text-slate-750">-</td>
                    ))}
                  </tr>

                  {/* Certifications */}
                  <tr>
                    <td className="p-4 font-bold text-slate-400 bg-slate-950/20">Certifications</td>
                    {selectedProducts.map(p => (
                      <td key={p.productId} className="p-4 font-semibold text-slate-200 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> ISO 9001 / ECE
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, idx) => (
                      <td key={idx} className="p-4 text-slate-750">-</td>
                    ))}
                  </tr>

                  {/* Warranty */}
                  <tr>
                    <td className="p-4 font-bold text-slate-400 bg-slate-950/20">Warranty Protection</td>
                    {selectedProducts.map(p => (
                      <td key={p.productId} className="p-4 font-semibold text-slate-200">
                        2-Year structural coverage
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - selectedProducts.length) }).map((_, idx) => (
                      <td key={idx} className="p-4 text-slate-750">-</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 border border-slate-800 hover:border-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompareDrawer;
