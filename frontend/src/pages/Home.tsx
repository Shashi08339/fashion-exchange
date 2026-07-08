// frontend/src/pages/Home.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Leaf, Sparkles, User, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ListingUpload } from '../components/ui/listing/ListingUpload';
import { VirtualTryOn } from '../components/ui/listing/VirtualTryOn';
import { AIFashionAssistant } from '../components/ui/chat/AIFashionAssistant';

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'none' | 'upload' | 'tryon'>('none');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-6">
            <Leaf className="w-3.5 h-3.5" /> Circular Luxury Fashion Ecosystem
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight max-w-5xl mx-auto leading-[1.05] mb-8">
            Wardrobe Exchange. <br/> Zero Waste. Powered by <span className="text-emerald-600 text-glow">Fashion Exchange</span>
          </h1>
          <p className="text-lg font-medium text-gray-500 max-w-2xl mx-auto mb-10">
            Verify luxury garment authenticity, simulate fittings in our AI fitting room, and swap clothes instantly with local verified tiers.
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            <Button onClick={() => setActiveTab('upload')} className="gap-2 text-sm px-8 py-4 bg-emerald-600 hover:bg-emerald-750 font-bold shadow-glow">
              Upload Item <Sparkles className="w-4 h-4" />
            </Button>
            <Button onClick={() => setActiveTab('tryon')} variant="outline" className="gap-2 text-sm px-8 py-4 font-bold border-gray-200">
              AI Fitting Room <User className="w-4 h-4 text-emerald-600" />
            </Button>
            <Button onClick={() => setIsAssistantOpen(true)} className="gap-2 text-sm px-8 py-4 bg-slate-900 text-white font-bold">
              Stylist Chatbot <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Counter Widget */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto border border-white/50 bg-white/40 backdrop-blur-md rounded-3xl p-8 shadow-premium">
          <div className="text-center">
            <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">580.4 KG</div>
            <div className="text-xs font-bold uppercase text-gray-400 tracking-wider">Carbon Savings Made</div>
          </div>
          <div className="text-center border-y md:border-y-0 md:border-x border-gray-200/50 py-4 md:py-0">
            <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">87,000 L</div>
            <div className="text-xs font-bold uppercase text-gray-400 tracking-wider">Manufacturing Water Saved</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">99.8 %</div>
            <div className="text-xs font-bold uppercase text-gray-400 tracking-wider">Authenticity Verified</div>
          </div>
        </div>
      </div>

      {/* Dynamic Interaction Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Garment Uploader Dashboard</h3>
                <button onClick={() => setActiveTab('none')} className="text-xs font-bold uppercase text-red-500">Close</button>
              </div>
              <ListingUpload onUploadSuccess={() => setActiveTab('none')} />
            </motion.div>
          )}

          {activeTab === 'tryon' && (
            <motion.div
              key="tryon"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Interactive Fitting Room</h3>
                <button onClick={() => setActiveTab('none')} className="text-xs font-bold uppercase text-red-500">Close</button>
              </div>
              <VirtualTryOn 
                garmentImage="https://res.cloudinary.com/demo/image/upload/v1600000000/sample.jpg" 
                garmentTitle="Gucci Vintage Tweed Blazer" 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side drawer chatbot assistant */}
      <AIFashionAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
};