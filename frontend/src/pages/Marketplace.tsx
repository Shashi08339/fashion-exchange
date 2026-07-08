// frontend/src/pages/Marketplace.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, MapPin, SlidersHorizontal, Leaf, HelpCircle, ShieldCheck, Heart, User } from 'lucide-react';
import { VirtualTryOn } from '../components/ui/listing/VirtualTryOn';

export const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState('50');
  
  // Advanced Filters
  const [priceMax, setPriceMax] = useState('10000');
  const [sizeFilter, setSizeFilter] = useState('');
  const [ecoOnly, setEcoOnly] = useState(false);

  // Selected item modal details
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [tryOnActive, setTryOnActive] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [checkoutMsg, setCheckoutMsg] = useState('');

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        category,
        radiusKm: radius
      });
      // Fallback coordinates default
      params.append('lat', '12.971');
      params.append('lng', '77.594');

      const res = await axios.get(`/listings?${params.toString()}`);
      
      // Filter locally for demo completeness
      let results = res.data.data || [];
      if (sizeFilter) {
        results = results.filter((item: any) => item.size.toLowerCase() === sizeFilter.toLowerCase());
      }
      if (priceMax) {
        results = results.filter((item: any) => item.estimatedValue <= parseInt(priceMax));
      }
      if (ecoOnly) {
        results = results.filter((item: any) => (item.aiDetails?.carbonSavings || 0) > 10);
      }

      setListings(results);
    } catch (err) {
      console.error('Failed to load active marketplace listings.', err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, radius, sizeFilter, priceMax, ecoOnly]);

  const handleBuyItem = async (listingId: string) => {
    setCheckoutStatus('loading');
    try {
      const response = await axios.post('/payment/checkout', {
        listingId,
        useCoins: true
      });
      setCheckoutStatus('success');
      setCheckoutMsg(`Purchase successful! You saved ${response.data.carbonSaved} kg of CO2 and earned ${response.data.coinsEarned} coins!`);
      // Update local lists
      setListings(prev => prev.filter(item => item._id !== listingId));
      setTimeout(() => {
        setSelectedItem(null);
        setCheckoutStatus('idle');
      }, 3500);
    } catch (err: any) {
      setCheckoutStatus('error');
      setCheckoutMsg(err.response?.data?.message || 'Checkout payment failed. Please check your wallet balance.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Search and Filters Header */}
      <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 p-6 shadow-premium space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search items, brands, or trends using AI NLP..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select 
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
            </select>

            <select 
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
            >
              <option value="">All Sizes</option>
              <option value="S">Small (S)</option>
              <option value="M">Medium (M)</option>
              <option value="L">Large (L)</option>
            </select>

            <select 
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
            >
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km</option>
            </select>

            <Button onClick={fetchListings} className="bg-emerald-600 hover:bg-emerald-700">Search</Button>
          </div>
        </div>

        {/* Detailed sliders */}
        <div className="flex flex-wrap gap-6 items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-4 flex-1 max-w-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Price (₹{priceMax})</span>
            <input 
              type="range" 
              min="500" 
              max="15000" 
              step="500"
              value={priceMax} 
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="eco-filter"
              checked={ecoOnly} 
              onChange={(e) => setEcoOnly(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="eco-filter" className="text-xs font-bold uppercase text-gray-500 tracking-wider cursor-pointer flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-600 animate-bounce" /> Carbon Offset Only
            </label>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-20 bg-white/40 border border-gray-100 rounded-3xl">
          <HelpCircle className="w-10 h-10 text-gray-400 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-gray-800">No Listings Match Filters</h3>
          <p className="text-sm text-gray-500 mt-1">Try widening your distance parameters or removing price bounds.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {listings.map((item) => (
            <Card 
              key={item._id} 
              onClick={() => { setSelectedItem(item); setTryOnActive(false); }}
              className="overflow-hidden group hover:border-emerald-300 transition-all cursor-pointer glass-panel border-white/20 shadow-premium"
            >
              <div className="relative aspect-square bg-gray-150 overflow-hidden">
                <img 
                  src={item.images[0]} 
                  alt={item.title} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                {(item.aiDetails?.carbonSavings || 0) > 10 && (
                  <span className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> Eco-Elite
                  </span>
                )}
              </div>
              <CardContent className="p-5">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{item.brand}</span>
                <h4 className="font-extrabold text-slate-800 text-base mt-0.5 truncate">{item.title}</h4>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-150/40">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Size {item.size}</span>
                  <span className="text-base font-black text-slate-900">₹{item.estimatedValue}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-premium border border-white/25 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 truncate">{selectedItem.title}</h3>
              <button onClick={() => setSelectedItem(null)} className="text-sm font-bold uppercase text-red-500">Close</button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image / Canvas fitting preview */}
              <div className="space-y-4">
                {tryOnActive ? (
                  <VirtualTryOn garmentImage={selectedItem.images[0]} garmentTitle={selectedItem.title} />
                ) : (
                  <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                    <img src={selectedItem.images[0]} alt={selectedItem.title} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => setTryOnActive(!tryOnActive)} 
                    className="flex-1 font-semibold gap-1.5"
                  >
                    <User className="w-4 h-4 text-emerald-600" /> {tryOnActive ? 'View Photo' : 'AI Try On'}
                  </Button>
                  <Button className="p-3 border border-gray-200" variant="outline">
                    <Heart className="w-4 h-4 text-rose-500" />
                  </Button>
                </div>
              </div>

              {/* Garment Details & Actions */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{selectedItem.brand}</span>
                    <h2 className="text-2xl font-black text-slate-950 mt-1">₹{selectedItem.estimatedValue}</h2>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">{selectedItem.description}</p>
                  </div>

                  {/* Sustainability specs */}
                  <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/10 p-4 space-y-2">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5" /> Environmental Circular Impact
                    </span>
                    <div className="grid grid-cols-2 gap-4 pt-1.5">
                      <div>
                        <div className="text-[10px] font-bold uppercase text-gray-500">CO2 Diverted</div>
                        <div className="text-sm font-black text-gray-900">{selectedItem.aiDetails?.carbonSavings || 12.4} kg</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase text-gray-500">Water Saved</div>
                        <div className="text-sm font-black text-gray-900">{selectedItem.aiDetails?.waterSavings || 2600} L</div>
                      </div>
                    </div>
                  </div>

                  {/* Trust index */}
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50/50 border border-emerald-100 px-3.5 py-2.5 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" /> Verified Authentic & Hand-inspected
                  </div>

                  {/* Location Info */}
                  <div className="text-xs text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Located at: {selectedItem.location?.address}
                  </div>
                </div>

                {/* Checkout Trigger */}
                <div className="space-y-3">
                  {checkoutStatus === 'loading' && <div className="text-xs font-bold text-emerald-600 animate-pulse">Routing secure transaction ledger...</div>}
                  {checkoutStatus === 'success' && <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">{checkoutMsg}</div>}
                  {checkoutStatus === 'error' && <div className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{checkoutMsg}</div>}
                  
                  {checkoutStatus !== 'success' && (
                    <Button 
                      onClick={() => handleBuyItem(selectedItem._id)}
                      disabled={checkoutStatus === 'loading'}
                      className="w-full py-4 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 shadow-glow"
                    >
                      Instant Swap/Buy with Wallet
                    </Button>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};