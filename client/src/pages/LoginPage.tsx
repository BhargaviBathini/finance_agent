import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Fingerprint, Sparkles } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { authenticateWebAuthn, registerWebAuthn, isWebAuthnAvailable, isPlatformAuthenticatorAvailable } from '../utils/webauthn';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWebAuthnPrompt, setShowWebAuthnPrompt] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);

  const handleWebAuthnRegistration = async () => {
    try {
      setLoading(true);
      const result = await registerWebAuthn();
      
      if (authenticatedUser) {
        const updatedUser = { ...authenticatedUser, hasWebAuthn: true };
        setUser(updatedUser);
        setAuth(updatedUser, useAuthStore.getState().token || '', useAuthStore.getState().refreshToken || '');
      }
      
      handleProceedToBankConnection();
    } catch (err: any) {
      console.error('WebAuthn setup error:', err);
      setError(err.message || 'Failed to set up Windows Hello authentication');
      handleProceedToBankConnection();
    } finally {
      setLoading(false);
      setShowWebAuthnPrompt(false);
    }
  };

  const handleProceedToBankConnection = () => {
    navigate('/onboarding/bank-connection');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const { user, token, refreshToken } = response.data;
      
      setAuth(user, token, refreshToken);
      setAuthenticatedUser(user);
      
      const webAuthnAvailable = isWebAuthnAvailable() && await isPlatformAuthenticatorAvailable();
      
      if (webAuthnAvailable && user.hasWebAuthn) {
        try {
          const webAuthnResponse = await authenticateWebAuthn(email);
          setUser(webAuthnResponse.user);
          if (!user.hasBankConnected) {
            navigate('/onboarding/bank-connection');
          } else {
            navigate('/');
          }
        } catch (webAuthnError) {
          console.error('WebAuthn authentication failed:', webAuthnError);
          if (!user.hasBankConnected) {
            navigate('/onboarding/bank-connection');
          } else {
            navigate('/');
          }
        }
      } else if (webAuthnAvailable && !user.hasWebAuthn) {
        setShowWebAuthnPrompt(true);
      } else {
        if (!user.hasBankConnected) {
          navigate('/onboarding/bank-connection');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (showWebAuthnPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
        {/* Background Aurora Effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
              <Fingerprint className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Enhance Security</h1>
            <p className="text-slate-400">Set up Windows Hello for passwordless biometric unlock</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleWebAuthnRegistration}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Setting up...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    Set up Windows Hello
                  </>
                )}
              </button>

              <button
                onClick={handleProceedToBankConnection}
                className="w-full py-3.5 px-6 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                Skip for now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your dashboard</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 transition-all outline-none"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}