import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, getRoleBasedRedirect } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Starting login process...');
      const result = await login(email, password);
      console.log('📨 Login result:', result);
      
      if (result.success && result.redirectPath) {
        console.log('✅ Login successful, redirect path provided:', result.redirectPath);
        console.log('🧭 Navigating to:', result.redirectPath);
        navigate(result.redirectPath);
      } else if (result.success) {
        // Fallback to getRoleBasedRedirect if no redirectPath provided
        console.log('✅ Login successful, getting redirect path from context...');
        const redirectPath = getRoleBasedRedirect();
        console.log('🔀 Redirect path from context:', redirectPath);
        console.log('🧭 Navigating to:', redirectPath);
        navigate(redirectPath);
      } else {
        console.log('❌ Login failed:', result.error);
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('💥 Login exception:', err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            POS System Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">Quick Login (Demo):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickLogin('superadmin@pos.com')}
              className="px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Super Admin
            </button>
            <button
              onClick={() => quickLogin('owner@restaurant.com')}
              className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Owner
            </button>
            <button
              onClick={() => quickLogin('manager@restaurant.com')}
              className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Manager
            </button>
            <button
              onClick={() => quickLogin('cashier@restaurant.com')}
              className="px-3 py-2 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Cashier
            </button>
            <button
              onClick={() => quickLogin('waiter@restaurant.com')}
              className="px-3 py-2 text-xs bg-pink-100 text-pink-700 rounded hover:bg-pink-200"
            >
              Waiter
            </button>
            <button
              onClick={() => quickLogin('kitchen@restaurant.com')}
              className="px-3 py-2 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              Kitchen
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Password: password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
