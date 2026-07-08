// frontend/src/pages/Signup.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', username: '', address: '', city: '', state: '', country: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await axios.post('/auth/signup', {
        ...formData,
        coordinates: [77.674, 15.118] // Explicit deployment geospatial coordination fallback
      });
      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration processing error.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await axios.post('/auth/verify-otp', { email: formData.email, otp: otpCode });
      navigate('/login');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Validation verification failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {otpSent ? 'Confirm Security Verification' : 'Join Fashion Exchange'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium mb-4">
              {errorMsg}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Full Name</label>
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Username</label>
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Email Address</label>
                <input type="email" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Password</label>
                <input type="password" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Street Address</label>
                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="text" placeholder="City" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                <input type="text" placeholder="State" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required />
                <input type="text" placeholder="Country" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required />
              </div>
              <Button type="submit" className="w-full py-3 mt-2" disabled={loading}>
                {loading ? 'Registering Account...' : 'Create Account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-4">
                We've sent a 6-digit verification code to <strong>{formData.email}</strong>. Enter it below to verify your account.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 text-center mb-2">Secure Code (OTP)</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000"
                  className="w-full text-center bg-gray-50 border border-gray-200 tracking-[0.5em] font-mono text-xl rounded-xl px-4 py-3 focus:outline-none"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full py-3 mt-2" disabled={loading}>
                {loading ? 'Confirming Code...' : 'Verify Email'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};