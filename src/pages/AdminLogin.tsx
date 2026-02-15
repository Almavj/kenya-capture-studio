import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Lock } from 'lucide-react';
import { api } from '@/lib/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(email, password);
      if (result.success) {
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('adminUser', result.user?.email || 'Admin');
        navigate('/admin/dashboard');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-rose-600 via-rose-700 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-rose-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-300 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-8">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <Camera className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-4 font-display">Kenya Capture</h2>
          <p className="text-xl text-rose-100 mb-4">Studio</p>
          <p className="text-rose-200 text-lg font-light">Professional Photography Management</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm">
          {/* Mobile Logo - Only show on small screens */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4">
              <Camera className="w-8 h-8 text-rose-600" />
            </div>
            <h1 className="text-3xl font-bold font-display">Kenya Capture</h1>
            <p className="text-muted-foreground">Admin Portal</p>
          </div>

          {/* Login Form */}
          <div className="space-y-8">
            <div className="text-center hidden lg:block">
              <h2 className="text-3xl font-bold font-display mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all text-slate-900"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all text-slate-900"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg mt-8"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Footer Link */}
            <p className="text-center text-sm text-slate-600">
              <a href="/" className="text-rose-600 font-semibold hover:text-rose-700 transition-colors">
                ← Back to Website
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
