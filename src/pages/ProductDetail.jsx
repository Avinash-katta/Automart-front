import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { ProductDetailSkeleton } from '../components/Skeleton';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, ShieldCheck, Wrench, Award, Check, MessageSquare } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Interactive Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reviews State
  const [reviews, setReviews] = useState([
    { id: 1, author: 'Karan Sharma', rating: 5, date: 'July 24, 2026', comment: 'Extremely high quality carbon weave. Installed on my Polo GT, fitment was 100% spot on! Highly recommend!' },
    { id: 2, author: 'Rohan Mehta', rating: 4, date: 'July 15, 2026', comment: 'Looks great and feels solid. Took around 20 minutes to align properly but once installed it sits perfectly.' }
  ]);

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        if (response.data.reviewsJson) {
          try {
            const parsed = JSON.parse(response.data.reviewsJson);
            if (Array.isArray(parsed)) {
              setReviews(parsed);
            }
          } catch (e) {
            console.error('Failed to parse product reviews JSON:', e);
          }
        }
      } catch (error) {
        console.error('Failed to load product details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      showToast('Maximum stock reached.', 'warning');
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const success = await addToCart(product.productId, quantity);
    if (success) {
      setQuantity(1); // Reset counter on success
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      showToast('Please fill out all review fields.', 'warning');
      return;
    }

    try {
      const response = await api.post(`/products/${id}/reviews`, {
        author: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim()
      });

      if (response.data && response.data.reviewsJson) {
        const parsed = JSON.parse(response.data.reviewsJson);
        if (Array.isArray(parsed)) {
          setReviews(parsed);
        }
      }

      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      showToast('Thank you! Your product review has been submitted.', 'success');
    } catch (error) {
      console.error('Failed to submit product review:', error);
      showToast('Failed to submit review. Please try again.', 'error');
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800">Product not found</h2>
        <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const primaryImage = product.images && product.images.length > 0
    ? product.images[0].imageUrl
    : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600';
  
  // Gallery angles list
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [{ imageUrl: primaryImage }];

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 15;

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black transition-all">
            <ArrowLeft className="w-4 h-4 text-amber-500" /> Back to Products
          </Link>
        </div>

        {/* Product Details Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
          
          {/* Left Column: Interactive Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-xs relative">
              <img
                src={galleryImages[activeImageIndex]?.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-350 hover:scale-103"
              />
              {isOutOfStock && (
                <span className="absolute top-4 left-4 text-xs font-extrabold uppercase tracking-widest bg-red-600 text-white px-3 py-1.5 rounded-full">
                  Sold Out
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-video rounded-xl overflow-hidden border-2 bg-slate-50 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={img.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Actions & Details */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100/50 w-fit">
                  {product.brand}
                </span>
              )}
              <h1 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                {product.name}
              </h1>
              
              {/* Ratings Summary */}
              <div className="flex items-center gap-1.5 mt-2.5">
                <div className="flex text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current text-slate-200" />
                </div>
                <span className="text-xs font-bold text-slate-800">4.5</span>
                <span className="text-xs text-slate-400 font-light">({reviews.length} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                ₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400 font-light block">Inc. of all taxes</span>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                {product.description || 'Elevate your vehicle dynamics and comfort with our premium-grade automotive accessory, designed for precise fitment and lasting style.'}
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Inventory Status */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Availability</span>
              {isOutOfStock ? (
                <span className="font-extrabold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase tracking-wider">Out of Stock</span>
              ) : isLowStock ? (
                <span className="font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 uppercase tracking-wider animate-pulse">
                  Only {product.stock} items left
                </span>
              ) : (
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                  In Stock ({product.stock} units)
                </span>
              )}
            </div>

            {!isOutOfStock && (
              <div className="space-y-4 pt-2">
                {/* Quantity Toggles */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="p-2.5 text-slate-500 hover:text-black disabled:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3.5 text-xs font-bold text-slate-800 select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock}
                      className="p-2.5 text-slate-500 hover:text-black disabled:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Add to Basket button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md cursor-pointer active:scale-99 uppercase tracking-wider text-xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Basket
                </button>
              </div>
            )}

            {isOutOfStock && (
              <button
                disabled
                className="w-full bg-slate-100 text-slate-400 font-semibold py-4 rounded-xl cursor-not-allowed border border-slate-200 text-xs uppercase tracking-wider"
              >
                Sold Out
              </button>
            )}
          </div>
        </div>

        {/* Bottom Section: Specifications & Ratings Scorecard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          {/* Technical Specifications */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Wrench className="w-4 h-4 text-amber-500" />
              Technical Specifications
            </h3>
            
            <div className="divide-y divide-slate-50 text-xs">
              <div className="grid grid-cols-2 py-3">
                <span className="text-slate-400 font-light">OEM Brand</span>
                <span className="font-semibold text-slate-800">{product.brand || 'AutoMart Performance'}</span>
              </div>
              <div className="grid grid-cols-2 py-3">
                <span className="text-slate-400 font-light">Origin Country</span>
                <span className="font-semibold text-slate-800">Germany / EU</span>
              </div>
              <div className="grid grid-cols-2 py-3">
                <span className="text-slate-400 font-light">Certifications</span>
                <span className="font-semibold text-slate-800">ISO 9001, ECE Registered</span>
              </div>
              <div className="grid grid-cols-2 py-3">
                <span className="text-slate-400 font-light">Fitment Type</span>
                <span className="font-semibold text-slate-800">Direct OEM Replacement</span>
              </div>
              <div className="grid grid-cols-2 py-3">
                <span className="text-slate-400 font-light">Material Grade</span>
                <span className="font-semibold text-slate-800">High-Tensile Carbon Steel & ABS</span>
              </div>
            </div>
          </div>

          {/* Ratings Scorecard */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Star className="w-4 h-4 text-amber-500" />
              Customer Ratings Scorecard
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              <div className="text-center sm:border-r border-slate-100 sm:pr-10">
                <h2 className="text-5xl font-black text-slate-900">4.5</h2>
                <div className="flex justify-center text-amber-500 my-2">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current text-slate-200" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Out of 5 Stars
                </span>
              </div>

              {/* Stars percentage bars */}
              <div className="flex-grow w-full space-y-3.5 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-3">
                  <span className="w-10 text-right">5 Stars</span>
                  <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="w-8 text-right font-light text-slate-400">78%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-10 text-right">4 Stars</span>
                  <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="w-8 text-right font-light text-slate-400">15%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-10 text-right">3 Stars</span>
                  <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '5%' }}></div>
                  </div>
                  <span className="w-8 text-right font-light text-slate-400">5%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-10 text-right">2 Stars</span>
                  <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '1%' }}></div>
                  </div>
                  <span className="w-8 text-right font-light text-slate-400">1%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-10 text-right">1 Star</span>
                  <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '1%' }}></div>
                  </div>
                  <span className="w-8 text-right font-light text-slate-400">1%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Customer Reviews & Post Review Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 items-start">
          {/* Reviews List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Verified Customer Reviews ({reviews.length})
            </h3>
            
            <div className="space-y-6 divide-y divide-slate-150">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-5 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rev.author}</p>
                      <p className="text-[9px] text-slate-400 font-light mt-0.5">{rev.date}</p>
                    </div>
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-light leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Write A Review</h3>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">Share your fitment experiences with other buyers</p>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun K."
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold text-slate-800"
                />
              </div>

              {/* Interactive Stars Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rating Score</label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const starsCount = index + 1;
                    return (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setReviewRating(starsCount)}
                        onMouseEnter={() => setHoverRating(starsCount)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-amber-500 focus:outline-none cursor-pointer p-0.5"
                      >
                        <Star
                          className={`w-5 h-5 transition-all ${
                            starsCount <= (hoverRating || reviewRating) ? 'fill-current' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Comments</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Tell us about product quality, fitment alignment, and look..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-3 px-4 outline-none focus:border-amber-500 font-semibold text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
