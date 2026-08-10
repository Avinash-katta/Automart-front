import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusPendingId, setStatusPendingId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      showToast('Error loading order transaction logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [showToast]);

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusPendingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status?status=${newStatus}`);
      showToast(`Order status updated to ${newStatus}.`, 'success');
      // Update local state directly to be fast and responsive
      setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      showToast('Failed to update order status.', 'error');
    } finally {
      setStatusPendingId(null);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading orders directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Orders & Sales</h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">Oversee customer transactions, checkout logs, and status updates</p>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
            <AlertCircle className="w-8 h-8 text-slate-350" />
            <p className="text-xs font-bold uppercase tracking-wider">No transaction logs registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-4 pl-6 w-10"></th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer ID</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Order Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.orderId;
                  const isPending = statusPendingId === order.orderId;

                  return (
                    <React.Fragment key={order.orderId}>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        {/* Expand Trigger */}
                        <td className="p-4 pl-6">
                          <button
                            onClick={() => toggleExpand(order.orderId)}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>

                        {/* Order ID */}
                        <td className="p-4 font-black text-slate-900">{order.orderId}</td>

                        {/* Customer Info */}
                        <td className="p-4 font-semibold text-slate-600">User #{order.userId}</td>

                        {/* Total Amount */}
                        <td className="p-4 font-extrabold text-slate-950">₹{order.totalAmount?.toLocaleString()}</td>

                        {/* Order Date */}
                        <td className="p-4 text-slate-400 font-semibold">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            order.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' :
                            order.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>

                        {/* Quick Action Status Selector */}
                        <td className="p-4 pr-6 text-right">
                          <select
                            disabled={isPending}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500 disabled:opacity-50"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="SUCCESS">SUCCESS</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </td>
                      </tr>

                      {/* Expanded Order Items Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/40">
                          <td colSpan="7" className="p-6 border-b border-slate-100">
                            <div className="space-y-4 max-w-3xl mx-auto bg-white border border-slate-200/60 p-5 rounded-2xl">
                              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <ShoppingBag className="w-3.5 h-3.5 text-amber-500" /> Purchased Items ({order.orderItems?.length || 0})
                              </h4>
                              <div className="divide-y divide-slate-100">
                                {order.orderItems?.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between py-3 text-xs">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/50 flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                                        {item.imageUrl ? (
                                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                        ) : (
                                          item.productName?.charAt(0)
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-900">{item.productName}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold">Product ID: #{item.productId}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-extrabold text-slate-950">₹{item.totalPrice?.toLocaleString()}</p>
                                      <p className="text-[10px] text-slate-400 font-semibold">₹{item.pricePerUnit} × {item.quantity}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
