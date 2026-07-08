// frontend/src/components/layout/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../button';
import { Leaf } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, terminateAuthSession } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await terminateAuthSession();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 font-black text-xl text-gray-900 tracking-tight">
        <Leaf className="w-6 h-6 text-primary" />
        <span>FASHION <span className="text-primary">EXCHANGE</span></span>
      </Link>
      
      <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
        <Link to="/marketplace" className="hover:text-gray-900 transition-colors">Marketplace</Link>
        {isAuthenticated && (
          <>
            <Link to="/chat" className="hover:text-gray-900 transition-colors">Messages</Link>
            <Link to="/ai-valuation" className="hover:text-gray-900 transition-colors">AI Valuation</Link>
            <Link to="/seller-dashboard" className="hover:text-gray-900 transition-colors">Seller Panel</Link>
            <Link to="/admin-dashboard" className="hover:text-gray-900 transition-colors">Admin Panel</Link>
            <Button variant="outline" onClick={handleLogout} className="px-4 py-2 text-xs">Sign Out</Button>
          </>
        )}
        {!isAuthenticated && (
          <div className="flex items-center gap-3">
            <Link to="/login" className="hover:text-gray-900 transition-colors px-3 py-2">Sign In</Link>
            <Button onClick={() => navigate('/signup')} className="text-xs">Get Started</Button>
          </div>
        )}
      </div>
    </nav>
  );
};