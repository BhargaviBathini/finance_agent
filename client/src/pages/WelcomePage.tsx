import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import { Sparkles, Shield, TrendingUp, Cpu } from 'lucide-react';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    { icon: Cpu, title: 'AI-Powered Agent', desc: 'Predictive analytics, custom insights, and natural language copilot.' },
    { icon: Shield, title: 'WebAuthn Secure', desc: 'Biometric passwordless unlock and bank-grade data encryption.' },
    { icon: TrendingUp, title: 'Wealth Projection', desc: 'Interactive simulators and automated savings goal calculations.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-aurora-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-aurora-fast"></div>
        <div className="absolute top-1/2 left-2/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] animate-aurora-slow"></div>
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">WIND</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-6 py-12 gap-12 w-full">
        {/* Left Intro Text */}
        <div className="flex-1 text-center md:text-left space-y-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Personal Finance
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white"
          >
            Your Money, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AI-Engineered.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg leading-relaxed max-w-md mx-auto md:mx-0"
          >
            Meet the smart financial agent that syncs with your bank, alerts you on duplicates, projects future trends, and helps you invest.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold shadow-lg shadow-indigo-500/35 hover:shadow-indigo-500/50 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started Free
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Right Feature Panel */}
        <div className="flex-1 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative p-0.5 rounded-3xl bg-gradient-to-b from-indigo-500/30 via-purple-500/10 to-transparent"
          >
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[22px] p-8 border border-white/5 space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Cpu className="text-indigo-400 w-5 h-5" /> Wind Intelligence
              </h3>
              
              <div className="space-y-4">
                {features.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-200"
                    >
                      <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{feat.title}</h4>
                        <p className="text-slate-400 text-xs mt-1 leading-normal">{feat.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-slate-600 text-xs border-t border-white/5">
        &copy; {new Date().getFullYear()} Wind Finance Inc. All rights reserved. Secure bank connection powered by Plaid.
      </footer>
    </div>
  );
};

export default WelcomePage;