// frontend/src/pages/AIValuation.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export const AIValuation: React.FC = () => {
  const [formData, setFormData] = useState({ brand: 'Patagonia', condition: 'Like new', originalPrice: '', ageYears: '' });
  const [outputMetrics, setOutputMetrics] = useState<any | null>(null);

  const triggerEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/ai/evaluate-value', formData);
      setOutputMetrics(res.data.metrics);
    } catch (err) {
      console.error('System failed to process AI value matrix.', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>AI Swap Value Valuation Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={triggerEvaluation} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Brand Tier</label>
              <select 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              >
                <option value="Patagonia">Patagonia</option>
                <option value="Gucci">Gucci</option>
                <option value="Zara">Zara</option>
                <option value="Nike">Nike</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Garment Condition</label>
              <select 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="New with tags">New with tags</option>
                <option value="Like new">Like new</option>
                <option value="Very good">Very good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Original Retail Value ($)</label>
                <input 
                  type="number" 
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1.5">Asset Age (Years)</label>
                <input 
                  type="number" 
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  value={formData.ageYears}
                  onChange={(e) => setFormData({ ...formData, ageYears: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3 mt-2">Run Algorithmic Assessment</Button>
          </form>

          {outputMetrics && (
            <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Calculated Index Value</span>
                <span className="text-xl font-bold text-gray-900">${outputMetrics.estimatedValueScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Value Retention Retention Score</span>
                <span className="text-sm font-bold text-primary">{outputMetrics.fairnessPercentage}%</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed pt-2 border-t border-gray-200/60">
                <strong>System Recommendation:</strong> {outputMetrics.recommendation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};