// frontend/src/pages/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Image, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const socketRef = useRef<any>(null);
  const activeChatId = "chat_room_1"; // Dynamic replacement point for operational runtime routing logic

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_SERVER_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:8000');
    socketRef.current = io(socketUrl, {
      withCredentials: true
    });

    socketRef.current.emit('join_chat_room', { chatId: activeChatId });

    socketRef.current.on('new_message_received', (hydratedMsg: any) => {
      setMessages((prev) => [...prev, hydratedMsg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [activeChatId]);

  const handleDispatchMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    socketRef.current.emit('send_chat_message', {
      chatId: activeChatId,
      content: inputMessage,
      mediaUrls: []
    });
    setInputMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-smooth flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Active Exchange Partner</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">Online</span>
          </div>
        </div>

        {/* Dynamic Pipeline Output Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/20">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'me' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Form Controls */}
        <form onSubmit={handleDispatchMessage} className="p-4 border-t border-gray-100 bg-white flex gap-3 items-center">
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
            <Image className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            placeholder="Type your message here..."
            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <Button type="submit" className="p-3 rounded-xl"><Send className="w-4 h-4" /></Button>
        </form>
      </div>
    </div>
  );
};