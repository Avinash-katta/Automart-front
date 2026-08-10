import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { TrendingUp, ShoppingBag, Users, Calendar, DollarSign, Loader2 } from 'lucide-react';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'monthly', 'yearly', 'overall'
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dailyRes, monthlyRes, yearlyRes, overallRes] = await Promise.all([
          api.get('/admin/revenue/daily'),
          api.get('/admin/revenue/monthly'),
          api.get('/admin/revenue/yearly'),
          api.get('/admin/revenue/overall')
        ]);
        setAnalytics({
          daily: dailyRes.data,
          monthly: monthlyRes.data,
          yearly: yearlyRes.data,
          overall: overallRes.data
        });
      } catch (error) {
        console.error('Failed to load analytics:', error);
        showToast('Error loading analytics records.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [showToast]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Compiling Business Analytics...</p>
      </div>
    );
  }

  if (!analytics) return null;

  // Custom Line Chart Path Generator
  const generateLinePath = (data, key, width, height) => {
    if (!data || data.length === 0) return { path: '', points: [], rawData: [] };
    const padding = 30;

    let chartData = [...data];
    if (chartData.length === 1) {
      const firstItem = chartData[0];
      const firstLabel = firstItem.date || firstItem.month || firstItem.year || '';
      let preLabel = 'Start';
      if (firstLabel.includes('-')) {
        const parts = firstLabel.split('-');
        if (parts.length === 3) {
          try {
            const d = new Date(firstLabel);
            d.setDate(d.getDate() - 1);
            preLabel = d.toISOString().split('T')[0];
          } catch (e) {}
        } else if (parts.length === 2) {
          try {
            const yr = parseInt(parts[0]);
            const mn = parseInt(parts[1]);
            preLabel = mn === 1 ? `${yr - 1}-12` : `${yr}-${String(mn - 1).padStart(2, '0')}`;
          } catch (e) {}
        }
      } else if (firstLabel && firstLabel.length === 4 && !isNaN(firstLabel)) {
        preLabel = String(parseInt(firstLabel) - 1);
      }

      chartData = [
        { [key]: 0, date: preLabel, month: preLabel, year: preLabel, ordersCount: 0, itemsSold: 0 },
        firstItem
      ];
    }

    const values = chartData.map(d => Number(d[key] || 0));
    const maxValue = Math.max(...values, 100);
    const minValue = 0;

    const points = chartData.map((d, index) => {
      const x = padding + (index / (chartData.length - 1 || 1)) * (width - padding * 2);
      const val = Number(d[key] || 0);
      const y = height - padding - ((val - minValue) / (maxValue - minValue)) * (height - padding * 2);
      return `${x},${y}`;
    });

    return {
      path: `M ${points.join(' L ')}`,
      points: chartData.map((d, index) => {
        const x = padding + (index / (chartData.length - 1 || 1)) * (width - padding * 2);
        const val = Number(d[key] || 0);
        const y = height - padding - ((val - minValue) / (maxValue - minValue)) * (height - padding * 2);
        return { x, y, label: d.date || d.month || d.year, value: val };
      }),
      rawData: chartData
    };
  };

  const currentTabName = {
    daily: 'Daily Business Logs',
    monthly: 'Monthly Performance Trends',
    yearly: 'Yearly Growth Tracks',
    overall: 'Lifetime Executive Summary'
  }[activeTab];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Business Analytics</h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">Explore revenue growth indexes, orders sales, and product highlights</p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-200/60 p-1 rounded-2xl border border-slate-200/50 self-start">
          {['daily', 'monthly', 'yearly', 'overall'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Title Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider">{currentTabName}</h2>
          <p className="text-xs text-slate-400 font-light mt-0.5">Live database aggregations, computed dynamically from transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/50 text-right">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Lifetime Sales</p>
            <p className="text-sm font-black text-amber-500">₹{analytics.overall.lifetimeRevenue?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab !== 'overall' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Revenue Trend Line</h3>
              <span className="text-[9px] text-emerald-500 font-extrabold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +8.2% Growth
              </span>
            </div>

            {/* Line Chart */}
            <div className="h-64 w-full relative p-2 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-center">
              {analytics[activeTab]?.length === 0 ? (
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">No transaction data recorded for this period</div>
              ) : (
                <React.Fragment>
                  {(() => {
                    const lineData = generateLinePath(analytics[activeTab], 'revenue', 600, 200);
                    return (
                      <React.Fragment>
                        <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                          {/* Horizontal Grid lines */}
                          <line x1="30" y1="30" x2="570" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="30" y1="100" x2="570" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="30" y1="170" x2="570" y2="170" stroke="#f1f5f9" strokeWidth="1" />

                          {/* Trend path */}
                          <path
                            d={lineData.path}
                            fill="none"
                            stroke="#EAB308"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            className="path-draw"
                          />

                          {/* Points circles */}
                          {lineData.points.map((pt, idx) => (
                            <g key={idx} className="group cursor-pointer">
                              <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#EAB308" strokeWidth="2.5" />
                              <title>{`${pt.label}: ₹${pt.value?.toLocaleString()}`}</title>
                            </g>
                          ))}
                        </svg>
                        <div className="absolute bottom-2 left-8 right-8 flex justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400">
                          <span>{lineData.rawData[0]?.date || lineData.rawData[0]?.month || lineData.rawData[0]?.year}</span>
                          <span>{lineData.rawData[lineData.rawData.length - 1]?.date || lineData.rawData[lineData.rawData.length - 1]?.month || lineData.rawData[lineData.rawData.length - 1]?.year}</span>
                        </div>
                      </React.Fragment>
                    );
                  })()}
                </React.Fragment>
              )}
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Period Revenue</span>
                <h4 className="text-lg font-black text-slate-900">
                  ₹{analytics[activeTab]?.reduce((acc, item) => acc + Number(item.revenue), 0).toLocaleString()}
                </h4>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Period Orders</span>
                <h4 className="text-lg font-black text-slate-900">
                  {analytics[activeTab]?.reduce((acc, item) => acc + Number(item.ordersCount), 0).toLocaleString()}
                </h4>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Accessories Sold</span>
                <h4 className="text-lg font-black text-slate-900">
                  {analytics[activeTab]?.reduce((acc, item) => acc + Number(item.itemsSold), 0).toLocaleString()}
                </h4>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERALL EXECUTIVE TAB */}
      {activeTab === 'overall' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Overall details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Historical Highlights</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Lifetime Revenue</span>
                <p className="text-lg font-black text-slate-950">₹{analytics.overall.lifetimeRevenue?.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Orders Successful</span>
                <p className="text-lg font-black text-slate-950">{analytics.overall.totalOrders?.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Average Ticket Price</span>
                <p className="text-lg font-black text-slate-950">₹{analytics.overall.averageOrderValue?.toLocaleString()}</p>
              </div>
            </div>

            {/* Best Selling Products */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Top Selling Products</h4>
              <div className="divide-y divide-slate-100">
                {analytics.overall.bestSellingProducts?.map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 text-xs">
                    <span className="font-bold text-slate-900">{product.name}</span>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-950">₹{product.revenue?.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{product.soldQuantity} units sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Top Customers & Categories */}
          <div className="space-y-6">
            {/* Top Categories sales */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Top Performing Categories</h3>
              <div className="space-y-3">
                {analytics.overall.topCategories?.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-600">{cat.name}</span>
                      <span className="text-slate-950">₹{cat.revenue?.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Spending Customers */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Valued Customers</h3>
              <div className="space-y-3">
                {analytics.overall.topCustomers?.map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 uppercase">
                        {customer.username?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{customer.username}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">User ID: #{customer.userId}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-950">₹{customer.totalSpent?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
