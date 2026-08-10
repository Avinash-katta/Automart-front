import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ShoppingCart, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const state = location.state;

  if (!state || !state.orderId) {
    // If no order status context is present, redirect to home
    return <Navigate to="/" replace />;
  }

  const { orderId, paymentId, amountPaid, paymentTime } = state;

  // Calculate estimated delivery date: 4 days from now
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full p-8 border border-gray-100 rounded-2xl shadow-sm text-center space-y-8 bg-white">
        
        {/* Animated Check Circle */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 animate-pulse">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full p-1 text-white border-2 border-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Text Headers */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-light">
            Your order has been placed successfully. Thank you for shopping with us!
          </p>
        </div>

        {/* Receipt details */}
        <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 text-left space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-gray-400 tracking-wider mb-2 border-b border-gray-100 pb-2">
            Payment Receipt
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-400 block font-light">Order ID</span>
              <span className="font-semibold text-gray-800 break-all">{orderId}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-light">Payment ID</span>
              <span className="font-semibold text-gray-800 break-all">{paymentId}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-light">Amount Paid</span>
              <span className="font-bold text-gray-900">
                ₹{parseFloat(amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-light">Date & Time</span>
              <span className="font-semibold text-gray-800">{paymentTime}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-start gap-2.5 mt-2">
            <Calendar className="w-5 h-5 text-[#0F6FFF] mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-xs text-gray-400 block font-light">Estimated Delivery</span>
              <span className="font-semibold text-emerald-600 text-sm">{getDeliveryDate()}</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#0F6FFF] hover:bg-[#0051D4] text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-100 text-sm cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-black text-gray-700 hover:text-black font-semibold py-3.5 px-4 rounded-xl transition-all text-sm cursor-pointer"
          >
            View Orders
            <ArrowRight className="w-4 h-4 text-[#0F6FFF]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
