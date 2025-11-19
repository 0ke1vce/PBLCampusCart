import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = {
    student: { email: 'student@gmail.com', password: 'password123' },
    vendor: { email: 'spicyhut@gmail.com', password: 'password123' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(demoAccounts[userType].email);
    setPassword(demoAccounts[userType].password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">CampusCart</h1>
          <p className="text-gray-600">Campus Food, Grocery & Stationary Delivery</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setUserType('student')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              userType === 'student'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👨‍🎓 Student
          </button>
          <button
            onClick={() => setUserType('vendor')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              userType === 'vendor'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏪 Vendor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="your.email@campus.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Food • Grocery • Stationary Delivery</p>
        </div>
      </div>
    </div>
  );
}