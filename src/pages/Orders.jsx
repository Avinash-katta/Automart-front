import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Package, Calendar, Tag, ChevronDown, ChevronUp, CheckCircle2, Truck, Box, MapPin, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        // Sort orders by date descending
        const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
      } catch (error) {
        console.error('Failed to load orders:', error);
        showToast('Failed to load order history', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'FAILED':
        return 'text-red-700 bg-red-50 border-red-100';
      default: // PENDING
        return 'text-amber-700 bg-amber-50 border-amber-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 font-sans">
        <h1 className="text-3xl font-extrabold text-slate-900 uppercase mb-8">Order History</h1>
        <div className="space-y-4">
          <div className="h-20 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"></div>
          <div className="h-20 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"></div>
          <div className="h-20 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center font-sans">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No orders found</h2>
        <p className="mt-2 text-sm text-slate-400 font-light">You haven't placed any orders yet.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-500 font-semibold px-6 py-3 rounded-full transition-colors text-sm shadow-md uppercase tracking-wider"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-8">
          Order History
        </h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId;
            
            return (
              <div
                key={order.orderId}
                className="border border-slate-100 rounded-3xl overflow-hidden bg-white hover:border-amber-100 hover:shadow-xs transition-all duration-300"
              >
                {/* Header Summary */}
                <div
                  onClick={() => toggleExpand(order.orderId)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-8 gap-y-2">
                    {/* Order ID */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Order ID
                      </span>
                      <span className="text-xs font-semibold text-slate-800 break-all">{order.orderId}</span>
                    </div>

                    {/* Date */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Date Placed
                      </span>
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    {/* Total Amount */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Total Amount
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        ₹{parseFloat(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                    {/* Status */}
                    <span
                      className={`px-3 py-1 text-[9px] font-bold tracking-wider rounded-full border uppercase ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    {/* Chevron Trigger */}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-amber-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                </div>

                {/* Expandable Items Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-50 bg-[#FCFCFC] p-6 space-y-8 animate-slide-in">
                    
                    {/* Visual Order Delivery Tracker Stepper */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs max-w-2xl mx-auto">
                      <h5 className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-5 text-center">
                        Delivery Status Tracker
                      </h5>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider select-none relative">
                        {order.status === 'SUCCESS' ? (
                          <>
                            {/* Step 1: Paid */}
                            <div className="flex flex-col items-center gap-1.5 text-emerald-600">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500 text-white"><CheckCircle2 className="w-4 h-4" /></span>
                              <span>Paid</span>
                            </div>
                            <div className="flex-grow h-0.5 mx-2 bg-emerald-500"></div>
                            {/* Step 2: Dispatched */}
                            <div className="flex flex-col items-center gap-1.5 text-emerald-600">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500 text-white"><Box className="w-3.5 h-3.5" /></span>
                              <span>Dispatched</span>
                            </div>
                            <div className="flex-grow h-0.5 mx-2 bg-emerald-500"></div>
                            {/* Step 3: In Transit */}
                            <div className="flex flex-col items-center gap-1.5 text-amber-500">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-500 text-slate-900"><Truck className="w-3.5 h-3.5" /></span>
                              <span>In Transit</span>
                            </div>
                            <div className="flex-grow h-0.5 mx-2 bg-slate-100"></div>
                            {/* Step 4: Delivered */}
                            <div className="flex flex-col items-center gap-1.5 text-slate-300">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-400"><MapPin className="w-3.5 h-3.5" /></span>
                              <span>Delivered</span>
                            </div>
                          </>
                        ) : order.status === 'FAILED' ? (
                          <div className="w-full flex items-center justify-center gap-2 text-red-600 py-2">
                            <ShieldAlert className="w-5 h-5 animate-pulse" />
                            <span>Payment Failed. Order Canceled.</span>
                          </div>
                        ) : (
                          <>
                            {/* Step 1: Awaiting Payment */}
                            <div className="flex flex-col items-center gap-1.5 text-amber-500">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-500 text-slate-900"><CheckCircle2 className="w-4 h-4" /></span>
                              <span>Awaiting Pay</span>
                            </div>
                            <div className="flex-grow h-0.5 mx-2 bg-slate-100"></div>
                            {/* Step 2: Dispatched */}
                            <div className="flex flex-col items-center gap-1.5 text-slate-300">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-400"><Box className="w-3.5 h-3.5" /></span>
                              <span>Dispatched</span>
                            </div>
                            <div className="flex-grow h-0.5 mx-2 bg-slate-100"></div>
                            {/* Step 3: In Transit */}
                            <div className="flex flex-col items-center gap-1.5 text-slate-300">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-400"><Truck className="w-3.5 h-3.5" /></span>
                              <span>In Transit</span>
                            </div>
                            <div className="flex-grow h-0.5 mx-2 bg-slate-100"></div>
                            {/* Step 4: Delivered */}
                            <div className="flex flex-col items-center gap-1.5 text-slate-300">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-400"><MapPin className="w-3.5 h-3.5" /></span>
                              <span>Delivered</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                        Items Ordered ({order.orderItems?.length || 0})
                      </h4>
                      
                      <div className="divide-y divide-slate-100">
                        {order.orderItems?.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                          >
                            <div className="flex items-center gap-4">
                              {/* Product Thumbnail */}
                              <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                <img
                                  src={item.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150'}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {/* Item details */}
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 hover:text-amber-500 transition-colors">
                                  <Link to={`/product/${item.productId}`}>{item.productName}</Link>
                                </h5>
                                <p className="text-[10px] text-slate-400 font-light mt-0.5">
                                  ₹{parseFloat(item.pricePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })} x {item.quantity}
                                </p>
                              </div>
                            </div>
                            {/* Item Subtotal */}
                            <span className="text-xs font-bold text-slate-800">
                              ₹{parseFloat(item.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
