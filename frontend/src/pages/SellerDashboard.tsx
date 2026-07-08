// frontend/src/pages/SellerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Heart, BarChart3, Leaf, Award, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import axios from 'axios';

export const SellerDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>({
    revenue: 14890,
    views: 4208,
    likes: 832,
    swapsCompleted: 14,
    growthPercent: 24,
    carbonSavedKg: 182.5,
    waterSavedLiters: 27300
  });

  const [topProducts, setTopProducts] = useState<any[]>([
    { id: '1', title: 'Patagonia Fleece Sweater', views: 824, likes: 212, revenue: 3500 },
    { id: '2', title: 'Vintage Levi\'s 501 Jeans', views: 742, likes: 189, revenue: 2400 },
    { id: '3', title: 'Nike Air Max 90 Sneakers', views: 610, likes: 140, revenue: 5500 }
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
             Seller Analytics Hub
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor your circular fashion inventory, earnings, and positive environmental footprint.</p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-1.5 font-semibold"><Package className="w-4 h-4" /> Manage Inventory</Button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Revenue', value: `₹${metrics.revenue}`, icon: TrendingUp, detail: `+${metrics.growthPercent}% Growth month-over-month`, color: 'text-emerald-600 bg-emerald-50' },
          { title: 'Listing Views', value: metrics.views, icon: Eye, detail: 'Across all active garments', color: 'text-blue-600 bg-blue-50' },
          { title: 'Saves / Likes', value: metrics.likes, icon: Heart, detail: 'Wishlist additions count', color: 'text-rose-600 bg-rose-50' },
          { title: 'Swaps Completed', value: metrics.swapsCompleted, icon: Award, detail: 'Successful swaps & sales', color: 'text-amber-600 bg-amber-50' }
        ].map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="glass-panel border-white/20 shadow-premium">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">{m.title}</span>
                  <div className={`p-2 rounded-xl ${m.color}`}>
                    <m.icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">{m.value}</h3>
                  <p className="text-[11px] font-semibold text-gray-400 mt-1">{m.detail}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Eco Impact Stats Row */}
      <Card className="glass-panel bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-white/20 shadow-premium overflow-hidden">
        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/50 text-emerald-800 border border-emerald-200">
              <Leaf className="w-3.5 h-3.5" /> Sustainable Circulation Metric
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Environmental Impact</h2>
            <p className="text-sm text-gray-500">Every swap reduces raw production waste, saves manufacturing water, and prevents logistics carbon output.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-sm border border-white/50 p-6 rounded-2xl">
            <div className="p-3 bg-emerald-600 rounded-2xl text-white">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{metrics.carbonSavedKg} kg</div>
              <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">Carbon Footprint Saved</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-sm border border-white/50 p-6 rounded-2xl">
            <div className="p-3 bg-teal-600 rounded-2xl text-white">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{metrics.waterSavedLiters} Liters</div>
              <div className="text-xs font-bold uppercase text-gray-500 tracking-wider">Manufacturing Water Saved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Charts & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Performance Graph (SVG based) */}
        <Card className="glass-panel border-white/20 shadow-premium lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" /> Monthly Growth Curves
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="w-full h-64 relative bg-gray-50/50 rounded-2xl border border-gray-100 flex items-end justify-between p-6">
              {/* SVG Curve Line */}
              <svg className="absolute inset-0 w-full h-full p-6 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M 0 90 Q 25 70 50 40 T 100 20"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />
                <path
                  d="M 0 90 Q 25 70 50 40 T 100 20 L 100 100 L 0 100 Z"
                  fill="url(#grad)"
                  opacity="0.08"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Chart Grid Lines */}
              <div className="w-full flex justify-between z-10 text-[10px] font-bold text-gray-400">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Listings */}
        <Card className="glass-panel border-white/20 shadow-premium">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Top Performing Garments</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center">#{idx + 1}</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{p.title}</h4>
                    <span className="text-[11px] font-semibold text-gray-400">{p.views} views • {p.likes} saves</span>
                  </div>
                </div>
                <span className="text-sm font-black text-gray-900">₹{p.revenue}</span>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="outline" className="w-full gap-2 font-semibold">View All Items <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
