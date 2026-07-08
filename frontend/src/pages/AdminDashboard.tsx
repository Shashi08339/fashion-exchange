// frontend/src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, ShoppingBag, DollarSign, Leaf, Check, X, Shield, Activity, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import axios from 'axios';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>({
    totalUsers: 1204,
    totalListings: 450,
    pendingApproval: 3,
    totalRevenue: 49800,
    platformCommission: 2490,
    carbonSavedKg: 580.4,
    waterSavedLiters: 87000
  });

  const [approvalQueue, setApprovalQueue] = useState<any[]>([
    { id: '1', title: 'Vintage Oversized Blazer', brand: 'Gucci', value: 12000, owner: { email: 'seller1@test.com' }, image: 'https://res.cloudinary.com/demo/image/upload/v1600000000/sample.jpg' },
    { id: '2', title: 'High Top Leather Sneakers', brand: 'Nike', value: 4500, owner: { email: 'seller2@test.com' }, image: 'https://res.cloudinary.com/demo/image/upload/v1600000000/sample.jpg' }
  ]);

  const [systemHealth, setSystemHealth] = useState<any>({
    serverUptimeHours: 42.5,
    memoryUsagePercent: 62.4,
    cpuCores: 8,
    database: { status: 'Connected', latencyMs: 14.5 }
  });

  const handleApproveReject = async (id: string, action: 'approve' | 'reject') => {
    try {
      // Mock route call to test integration
      setApprovalQueue((prev: any[]) => prev.filter(item => item.id !== id));
      setMetrics((prev: any) => ({
        ...prev,
        pendingApproval: prev.pendingApproval - 1
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Shield className="w-8 h-8 text-emerald-600" /> Admin Command Center
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage approvals queue, oversee user status, monitor real-time system metrics, and audit activities.</p>
      </div>

      {/* Grid of Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Registered Users', value: metrics.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { title: 'Active Listings', value: metrics.totalListings, icon: ShoppingBag, color: 'text-amber-600 bg-amber-50' },
          { title: 'Platform Commissions', value: `₹${metrics.platformCommission}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
          { title: 'Carbon Diverted', value: `${metrics.carbonSavedKg} kg`, icon: Leaf, color: 'text-teal-600 bg-teal-50' }
        ].map((m, idx) => (
          <Card key={idx} className="glass-panel border-white/20 shadow-premium">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">{m.title}</span>
                <div className={`p-2 rounded-xl ${m.color}`}>
                  <m.icon className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">{m.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Verification Queue & System Health split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Verification Queue */}
        <Card className="glass-panel border-white/20 shadow-premium lg:col-span-2">
          <CardHeader className="border-b border-gray-100/60 pb-4">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
              <span>Listing Approval Queue</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">{approvalQueue.length} pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 divide-y divide-gray-100">
            {approvalQueue.length === 0 ? (
              <div className="text-center py-8 text-sm font-semibold text-gray-400">All listings have been audited. Queue is empty.</div>
            ) : (
              approvalQueue.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                      <p className="text-xs font-semibold text-gray-400">{item.brand} • Est. Value: ₹{item.value} • Owner: {item.owner.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveReject(item.id, 'approve')}
                      className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleApproveReject(item.id, 'reject')}
                      className="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="glass-panel border-white/20 shadow-premium">
          <CardHeader className="border-b border-gray-100/60 pb-4">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" /> Live System Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uptime</span>
              <span className="text-sm font-bold text-gray-900">{systemHealth.serverUptimeHours} hours</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span>CPU & Memory Load</span>
                <span>{systemHealth.memoryUsagePercent}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${systemHealth.memoryUsagePercent}%` }} 
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Database Status</span>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {systemHealth.database.status}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">DB Connection Latency</span>
              <span className="text-sm font-bold text-gray-900">{systemHealth.database.latencyMs} ms</span>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" className="w-full gap-2 font-semibold text-xs py-2.5">
                <RefreshCw className="w-3.5 h-3.5" /> Force Garbage Collection
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};
