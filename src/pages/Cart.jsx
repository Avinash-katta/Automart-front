import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Trash2, Minus, Plus, ArrowRight, ShoppingCart, Percent, Truck, Check, CreditCard, MapPin } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Cart = () => {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, clearCartState } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Checkout Step state: 1 = Basket, 2 = Address (Simulated), 3 = Payment (Razorpay Modal)
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    postalCode: ''
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscountRate, setAppliedDiscountRate] = useState(0); 
  const [appliedPromo, setAppliedPromo] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const formattedCode = couponCode.trim().toUpperCase();
    if (formattedCode === 'SAVVY10') {
      setAppliedDiscountRate(0.10);
      setAppliedPromo('SAVVY10 (10% Off)');
      showToast('Coupon SAVVY10 applied successfully!', 'success');
    } else if (formattedCode === '') {
      showToast('Please enter a coupon code', 'warning');
    } else {
      showToast('Invalid Coupon Code', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscountRate(0);
    setAppliedPromo('');
    setCouponCode('');
    showToast('Coupon removed', 'success');
  };

  // Billing Math:
  const subtotal = cartTotal;
  const shipping = subtotal > 999 ? 0 : 70;
  const discount = subtotal * appliedDiscountRate;
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + shipping + gst - discount;

  const handleQuantityChange = async (cartId, currentQty, stock, increment) => {
    if (increment) {
      if (currentQty >= stock) {
        showToast('Maximum stock reached.', 'warning');
      } else {
        await updateQuantity(cartId, currentQty + 1);
      }
    } else {
      if (currentQty > 1) {
        await updateQuantity(cartId, currentQty - 1);
      }
    }
  };

  const proceedToAddress = () => {
    setCheckoutStep(2);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.postalCode) {
      showToast('Please fill in all shipping details', 'warning');
      return;
    }
    setCheckoutStep(3);
    handleCheckout(); // Automatically open Razorpay checkout modal
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckoutLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast('Failed to load Razorpay SDK. Please check your internet connection.', 'error');
        setCheckoutLoading(false);
        return;
      }

      // 1. Create order on the backend
      const orderRequest = {
        amount: grandTotal
      };
      
      const orderResponse = await api.post('/payment/create-order', orderRequest);
      const { orderId, amount, currency } = orderResponse.data;

      // 2. Open Razorpay Checkout modal
      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      
      const options = {
        key: 'rzp_test_TKxeuHwECuglYX',
        amount: amount,
        currency: currency,
        name: 'AutoMart Store',
        description: 'Premium Automobile Accessories Purchase',
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyPayload = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: grandTotal
            };
            
            const verifyResponse = await api.post('/payment/verify', verifyPayload);
            if (verifyResponse.data.success) {
              clearCartState(); 
              showToast('Payment Successful! Your order has been placed successfully.', 'success');
              
              navigate('/order-success', {
                state: {
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  amountPaid: grandTotal,
                  paymentTime: new Date().toLocaleString('en-IN')
                }
              });
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            showToast('Payment verification failed. Please try again.', 'error');
          }
        },
        prefill: {
          name: shippingAddress.fullName || userObj.username || '',
          email: userObj.email || '',
          contact: shippingAddress.phone || ''
        },
        theme: {
          color: '#0F172A' // Carbon-slate luxury theme
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        showToast('Payment Failed. Please try again.', 'error');
      });
      rzp.open();
    } catch (error) {
      console.error('Checkout creation error:', error);
      const errMsg = error.response?.data?.error || 'Failed to initialize checkout. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center font-sans">
        <ShoppingCart className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-900">Your basket is empty</h2>
        <p className="mt-2 text-sm text-slate-400 font-light">Looks like you haven’t added anything yet.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-500 font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-md text-sm uppercase tracking-wider"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Checkout Progress Stepper (Amazon / Flipkart style) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider select-none">
            <button
              onClick={() => setCheckoutStep(1)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                checkoutStep >= 1 ? 'text-amber-500' : 'text-slate-300'
              }`}
            >
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${
                checkoutStep >= 1 ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 text-slate-400'
              }`}>1</span>
              Shopping Basket
            </button>
            <div className={`flex-grow h-0.5 mx-4 ${checkoutStep >= 2 ? 'bg-amber-500' : 'bg-slate-100'}`}></div>
            <button
              onClick={() => checkoutStep > 1 && setCheckoutStep(2)}
              disabled={checkoutStep === 1}
              className={`flex items-center gap-1.5 transition-colors ${
                checkoutStep >= 2 ? 'text-amber-500' : 'text-slate-300'
              }`}
            >
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${
                checkoutStep >= 2 ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 text-slate-400'
              }`}>2</span>
              Shipping Details
            </button>
            <div className={`flex-grow h-0.5 mx-4 ${checkoutStep >= 3 ? 'bg-amber-500' : 'bg-slate-100'}`}></div>
            <button
              disabled
              className={`flex items-center gap-1.5 transition-colors ${
                checkoutStep === 3 ? 'text-amber-500' : 'text-slate-300'
              }`}
            >
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${
                checkoutStep === 3 ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 text-slate-400'
              }`}>3</span>
              Secure Payment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Basket Items list OR Shipping Address Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {checkoutStep === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 border-b border-slate-50 pb-4">
                  Shopping Basket ({cartCount} items)
                </h2>
                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <div key={item.cartId} className="flex items-center justify-between py-6 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Name and Price */}
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 hover:text-amber-500 transition-colors">
                            <Link to={`/product/${item.productId}`}>{item.name}</Link>
                          </h3>
                          <p className="mt-1 text-xs text-slate-400 font-light">
                            ₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                          <button
                            onClick={() => handleQuantityChange(item.cartId, item.quantity, item.stock, false)}
                            disabled={item.quantity <= 1}
                            className="p-2 text-slate-500 hover:text-black disabled:text-slate-200 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-800 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.cartId, item.quantity, item.stock, true)}
                            disabled={item.quantity >= item.stock}
                            className="p-2 text-slate-500 hover:text-black disabled:text-slate-200 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="text-sm font-black text-slate-900 min-w-[80px] text-right">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {checkoutStep === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 animate-slide-in">
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 border-b border-slate-50 pb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  Delivery Destination
                </h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 text-xs outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number</label>
                      <input
                        type="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 text-xs outline-none"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Street Address</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.addressLine}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 text-xs outline-none"
                      placeholder="Apartment, building, street address"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City / State</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 text-xs outline-none"
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Postal Code (PIN)</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 text-xs outline-none"
                        placeholder="6-digit pincode"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase cursor-pointer hover:border-slate-800 transition-colors"
                    >
                      Back to Basket
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-500 rounded-xl text-xs font-bold uppercase cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      Go to Payment <CreditCard className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 text-center animate-pulse">
                <CreditCard className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
                <h3 className="text-base font-bold text-slate-800 uppercase">Awaiting Razorpay Checkout...</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed font-light">
                  A payment gateway window has been opened. Please complete the mock transaction details inside the modal.
                </p>
                <button
                  onClick={() => setCheckoutStep(2)}
                  className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase cursor-pointer"
                >
                  Cancel & Go Back
                </button>
              </div>
            )}

          </div>

          {/* Right Column: Checkout Summary (Sticky) */}
          <div className="lg:sticky lg:top-[88px] bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-950">
              Checkout Summary
            </h3>
            
            {/* Free Shipping Tracker */}
            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                {subtotal > 999 ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 animate-bounce" /> Free shipping unlocked!
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Add <strong className="text-amber-600">₹{(999 - subtotal).toFixed(2)}</strong> for FREE shipping
                  </span>
                )}
                <span className="text-slate-400 font-light">Target: ₹999</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${subtotal > 999 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Promo Code Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Code (SAVVY10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedPromo}
                className="flex-grow bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs outline-none transition-all uppercase placeholder-slate-400"
              />
              {!appliedPromo ? (
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-amber-500 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Apply
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Remove
                </button>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-3.5 text-xs border-b border-slate-100 pb-4">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Total Items</span>
                <span className="font-bold text-slate-800">{cartCount} units</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Shipping Fees</span>
                <span className="font-bold text-slate-800">
                  {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>GST (18%)</span>
                <span className="font-bold text-slate-800">₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {appliedDiscountRate > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider">
                  <span className="flex items-center gap-1 font-extrabold">
                    <Percent className="w-3.5 h-3.5" /> Coupon Discount
                  </span>
                  <span>-₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2">
              <span>Grand Total</span>
              <span className="text-base text-amber-600">
                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {checkoutStep === 1 && (
              <button
                onClick={proceedToAddress}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-500 font-bold py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer text-xs uppercase tracking-wider"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
