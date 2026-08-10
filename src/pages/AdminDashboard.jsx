import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { DollarSign, ShoppingBag, Users, Box, Tag, Award, TrendingUp, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, prodRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/products')
        ]);
        setData(dashRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showToast('Error loading dashboard analytics.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [showToast]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Generating Dashboard Logs...</p>
      </div>
    );
  }

  if (!data) return null;

  const lowStockProducts = products.filter(p => p.stock <= 10);

  const cardStats = [
    { name: 'Total Revenue', value: `₹${data.totalRevenue?.toLocaleString() || '0'}`, icon: DollarSign, color: 'border-emerald-500/20 bg-emerald-50 text-emerald-600' },
    { name: 'Total Orders', value: data.totalOrders?.toLocaleString(), icon: ShoppingBag, color: 'border-blue-500/20 bg-blue-50 text-blue-600' },
    { name: 'Total Customers', value: data.totalCustomers?.toLocaleString(), icon: Users, color: 'border-purple-500/20 bg-purple-50 text-purple-600' },
    { name: 'Total Products', value: data.totalProducts?.toLocaleString(), icon: Box, color: 'border-amber-500/20 bg-amber-50 text-amber-600' },
    { name: 'Total Categories', value: data.totalCategories?.toLocaleString(), icon: Tag, color: 'border-rose-500/20 bg-rose-50 text-rose-600' },
    { name: 'Total Sales Count', value: data.totalSales?.toLocaleString(), icon: Award, color: 'border-indigo-500/20 bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header title */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Analytics Dashboard</h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">Overview of business performance and key metrics</p>
        </div>
      </div>

      {/* Stock Alerts Widget */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200/50 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-2xl border border-red-200/20">
              <AlertCircle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-red-800">Critical Stock Warning ({lowStockProducts.length})</h3>
              <p className="text-[10px] text-red-600 font-light mt-0.5">The following high-demand accessories are running extremely low or sold out. Please restock immediately.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto max-w-md py-1">
            {lowStockProducts.slice(0, 3).map(p => (
              <div key={p.productId} className="flex items-center gap-2 bg-white border border-red-100 rounded-xl p-1.5 pr-3 flex-shrink-0">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-bold text-slate-800 truncate max-w-[100px]">{p.name}</span>
                <span className="text-[9px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">{p.stock} left</span>
              </div>
            ))}
            {lowStockProducts.length > 3 && (
              <span className="text-[9px] text-red-500 font-bold bg-white border border-red-100 rounded-xl px-2 py-1.5">+ {lowStockProducts.length - 3} more</span>
            )}
          </div>
          <Link
            to="/admin/products"
            className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-white hover:bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 text-center"
          >
            Refill Inventory
          </Link>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cardStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.name}</span>
                <div className={`p-2 rounded-xl border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{stat.value}</h3>
                <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1">
                  <TrendingUp className="w-2.5 h-2.5" /> +12.4% last 30d
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue SVG Line Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenue Overview</h3>
              <p className="text-lg font-black text-slate-900">₹{data.totalRevenue?.toLocaleString()}</p>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Active Session
            </span>
          </div>

          {/* Simple Custom SVG Line Chart */}
          <div className="w-full h-48 bg-slate-50/50 border border-slate-100 rounded-2xl p-2 relative flex items-center justify-center">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />

              {/* Draw Line Path */}
              <path
                d="M 20 120 Q 100 60 180 90 T 340 40 T 480 70"
                fill="none"
                stroke="#EAB308"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="path-draw"
              />

              {/* Draw Dots */}
              <circle cx="20" cy="120" r="4" fill="#ffffff" stroke="#EAB308" strokeWidth="2" />
              <circle cx="120" cy="75" r="4" fill="#ffffff" stroke="#EAB308" strokeWidth="2" />
              <circle cx="220" cy="95" r="4" fill="#ffffff" stroke="#EAB308" strokeWidth="2" />
              <circle cx="340" cy="40" r="4" fill="#ffffff" stroke="#EAB308" strokeWidth="2" />
              <circle cx="480" cy="70" r="4" fill="#ffffff" stroke="#EAB308" strokeWidth="2" />
            </svg>
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400">
              <span>May 18</span>
              <span>Jun 01</span>
              <span>Jun 16</span>
            </div>
          </div>
        </div>

        {/* Category breakdown (SVG Pie Chart) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Categories</h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">Sales distribution by volume</p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {/* Segment 1 */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#EAB308" strokeWidth="3" strokeDasharray="45 100" />
                {/* Segment 2 */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray="30 100" strokeDashoffset="-45" />
                {/* Segment 3 */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="25 100" strokeDashoffset="-75" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Volume</span>
                <span className="text-lg font-black text-slate-900">{data.totalSales}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-2 text-xs font-bold">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                  Car Accessories
                </span>
                <span className="text-slate-950">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                  Car Care
                </span>
                <span className="text-slate-950">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  Performance Parts
                </span>
                <span className="text-slate-950">25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of lists (Recent Orders, Top Products, Latest Customers) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-[10px] font-bold text-amber-500 hover:text-amber-600 uppercase flex items-center gap-0.5">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {data.recentOrders?.slice(0, 5).map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 font-bold text-slate-950">{order.orderId}</td>
                    <td className="py-3.5 font-extrabold text-slate-950">₹{order.totalAmount?.toLocaleString()}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        order.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Top Selling Products</h3>
            <Link to="/admin/products" className="text-[10px] font-bold text-amber-500 hover:text-amber-600 uppercase flex items-center gap-0.5">
              Inventory <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {data.topSellingProducts?.map((product) => (
              <div key={product.productId} className="flex items-center justify-between p-2 hover:bg-slate-50/60 rounded-2xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs uppercase border border-slate-200/50">
                    {product.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-950 line-clamp-1">{product.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{product.soldQuantity} units sold</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-950">₹{product.revenue?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
