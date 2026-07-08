// frontend/src/components/ui/chat/AIFashionAssistant.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, Send, Bot, X, Calendar, CloudRain, ShieldCheck } from 'lucide-react';
import { Button } from '../button';

export const AIFashionAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { sender: 'assistant', text: 'Hello! I am your personal AI Stylist. Ask me anything about outfit fits, matching items, or fashion trends today!' }
  ]);

  const handleSend = () => {
    if (!query.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    const userQuery = query.toLowerCase();
    setQuery('');

    // Generate intelligent stylist responses matching trends, weather, and garments
    setTimeout(() => {
      let reply = "That sounds like a great style path! I recommend pairing a relaxed fit indigo denim jacket with organic cotton tees and stone-washed cargo jeans for a balanced, premium streetwear aesthetic.";
      
      if (userQuery.includes('rain') || userQuery.includes('weather') || userQuery.includes('monsoon')) {
        reply = "For rainy weather, layer a waterproof Patagonia Torrentshell jacket over a moisture-wicking activewear top. Pair with weather-resistant boots and circular fabric bottoms to stay dry and eco-friendly!";
      } else if (userQuery.includes('formal') || userQuery.includes('party') || userQuery.includes('interview')) {
        reply = "For formal occasions, go with a tailored unstructured blazer, minimalist cotton dress shirt, and slim-fit trousers. Accessorize with leather shoes and a matching belt for an elegant, quiet luxury look.";
      }

      setMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
    }, 1200);
  };

  // Web Speech API Voice Command trigger
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your query.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setQuery(speechResult);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-gray-100 shadow-premium z-50 flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">AI Fashion Stylist</h3>
                <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Online Curation Active
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
                <div 
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                    m.sender === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-gray-50">
            {[
              { text: 'Rainy Day Fit', icon: CloudRain },
              { text: 'Formal Setup', icon: Calendar }
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(`What should I wear for a ${p.text.toLowerCase()}?`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-150 transition-colors"
              >
                <p.icon className="w-3 h-3 text-emerald-600" /> {p.text}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 flex items-center gap-3">
            <button 
              onClick={startSpeechRecognition}
              className={`p-3 rounded-xl border transition-all ${
                isListening 
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <input 
              type="text" 
              placeholder="Ask for style suggestions..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            />
            <Button onClick={handleSend} className="p-3">
              <Send className="w-4 h-4" />
            </Button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
