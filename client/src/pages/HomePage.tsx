import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaidLink } from 'react-plaid-link';
import {
  Link as LinkIcon,
  TrendingUp,
  Eye,
  EyeOff,
  Plus,
  Banknote,
  User,
  CreditCard,
  PieChart,
  Landmark,
  LineChart,
  Lock,
  RefreshCw,
  Sparkles,
  Camera,
  Target,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { plaidAPI, chartsAPI, accountsAPI, goalsAPI } from '../utils/api';
import { motion } from 'framer-motion';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, setUser, setOnboardingStatus } = useAuthStore();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balances, setBalances] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  
  // Dynamic fields
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [mutualFunds, setMutualFunds] = useState<number | null>(null);
  const [loans, setLoans] = useState<number | null>(null);
  const [stocks, setStocks] = useState<number | null>(null);

  const [dataSharingEnabled, setDataSharingEnabled] = useState(true);
  const plaidLinkInitialized = useRef(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currency, setCurrency] = useState<string>('USD');
  const [hideBalances, setHideBalances] = useState(false);

  useEffect(() => {
    loadData();
    createLinkToken();
    loadGoals();
    loadInstitutions();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const summaryRes = await chartsAPI.getSummary();
      setSummary(summaryRes.data);
      if (summaryRes.data) {
        setCreditScore(summaryRes.data.creditScore || null);
        setMutualFunds(summaryRes.data.mutualFunds || null);
        setLoans(summaryRes.data.loans || null);
        setStocks(summaryRes.data.stocks || null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await accountsAPI.getBalances();
      await loadData();
      await loadInstitutions();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadInstitutions = async () => {
    try {
      const response = await accountsAPI.getAccounts();
      const instList = response.data.institutions || [];
      setInstitutions(instList);
      
      if (instList.length > 0 && instList[0].accounts && instList[0].accounts.length > 0) {
        setCurrency(instList[0].accounts[0].currency || 'USD');
      }
    } catch (error) {
      console.error('Failed to load institutions:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const response = await goalsAPI.getGoals('active');
      setGoals(response.data.goals || []);
    } catch (error) {
      console.error('Failed to load goals:', error);
      setGoals([]);
    }
  };

  const createLinkToken = async () => {
    try {
      setLinkError(null);
      const response = await plaidAPI.createLinkToken();
      setLinkToken(response.data.link_token);
    } catch (error) {
      console.error('Failed to create link token:', error);
    }
  };

  const onSuccess = async (publicToken: string) => {
    try {
      setLinkError(null);
      await plaidAPI.exchangeToken(publicToken);
      await plaidAPI.syncTransactions();
      setShowSuccessModal(true);
      await loadData();
      await loadInstitutions();
      setTimeout(async () => {
        await loadData();
        await loadInstitutions();
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to exchange token:', error);
      setLinkError('Failed to connect bank account.');
    }
  };

  const { open, ready } = usePlaidLink(linkToken ? {
    token: linkToken,
    onSuccess,
    onExit: () => setIsDemoLoading(false),
  } : {
    token: null,
    onSuccess: () => {},
  });

  const handleCheckBalance = async () => {
    try {
      const response = await accountsAPI.getBalances();
      setBalances(response.data.accounts || []);
      setShowBalanceModal(true);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  };

  const handleLoadDemo = async () => {
    try {
      setIsDemoLoading(true);
      const response = await plaidAPI.loadDemoData();
      setUser(response.data.user);
      setOnboardingStatus({
        complete: true,
        hasBankConnected: true,
        nextStep: 'complete'
      });
      await loadData();
      await loadInstitutions();
      await loadGoals();
    } catch (error) {
      console.error('Failed to load demo data:', error);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency === 'INR' ? 'INR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalBankBalance = institutions.reduce((total, institution) => total + (institution.totalBalance || 0), 0);

  // SVG Gauge calculations
  const calculateDashOffset = (score: number) => {
    const minScore = 300;
    const maxScore = 850;
    const cleanScore = Math.max(minScore, Math.min(maxScore, score));
    const percentage = (cleanScore - minScore) / (maxScore - minScore);
    const radius = 50;
    const circumference = Math.PI * radius; // Semi-circle circumference
    return circumference - percentage * circumference;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative pb-24 overflow-x-hidden">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 pt-8 relative z-10 space-y-6">
        
        {/* Header Profile Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg border border-white/10">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs text-slate-400">Welcome Back</p>
              <h2 className="text-lg font-bold">{user?.name || 'User'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2.5 bg-slate-900/60 border border-white/5 hover:bg-slate-800 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="p-2.5 bg-slate-900/60 border border-white/5 hover:bg-slate-800 rounded-xl transition-all active:scale-95"
            >
              <User className="w-5 h-5 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Net Worth Card (Glassmorphic) */}
        <div className="relative p-0.5 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-xl">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-[22px] p-6 border border-white/5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Net Worth Valuation</span>
              <button onClick={() => setHideBalances(!hideBalances)} className="text-slate-400 hover:text-white transition-colors">
                {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                {hideBalances ? '••••••••' : formatCurrency(summary?.netWorth || 0)}
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
              <div>
                <p className="text-xs text-slate-500">Connected Assets</p>
                <p className="font-semibold text-emerald-400 text-sm mt-0.5">
                  {hideBalances ? '••••••' : formatCurrency(summary?.totalAssets || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Connected Liabilities</p>
                <p className="font-semibold text-rose-400 text-sm mt-0.5">
                  {hideBalances ? '••••••' : formatCurrency(summary?.totalLiabilities || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Mode Injection Card */}
        {institutions.length === 0 && (
          <div className="p-0.5 rounded-3xl bg-gradient-to-r from-amber-500/30 to-purple-500/20 shadow-lg">
            <div className="bg-slate-900/90 rounded-[22px] p-5 border border-white/5 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mb-1">
                <Sparkles className="w-6 h-6 animate-float-slow" />
              </div>
              <div>
                <h3 className="font-bold text-base">⚡ Explore with Demo Data</h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed px-2">
                  No bank linked. Click below to inject mock portfolios, savings goals, and transaction history to explore the full app.
                </p>
              </div>
              <button
                onClick={handleLoadDemo}
                disabled={isDemoLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isDemoLoading ? 'Loading Simulator...' : 'Preload Mock Demo Data'}
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Portfolios & Assets Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Portfolio Holdings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            
            {/* Credit Score Gauge Dial */}
            <div className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-between h-40">
              <span className="text-xs text-slate-500 font-medium">Credit Gauge</span>
              
              {creditScore ? (
                <div className="relative w-24 h-16 flex items-center justify-center mt-2">
                  <svg className="w-full h-full transform -rotate-180" viewBox="0 0 120 70">
                    {/* Background Arc */}
                    <path
                      d="M 10 60 A 50 50 0 0 1 110 60"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    {/* Filled Gauge Path */}
                    <path
                      d="M 10 60 A 50 50 0 0 1 110 60"
                      fill="none"
                      stroke="url(#gauge-gradient)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={Math.PI * 50}
                      strokeDashoffset={calculateDashOffset(creditScore)}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute bottom-1 flex flex-col items-center">
                    <span className="text-lg font-extrabold text-white leading-none">{creditScore}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 leading-none">Excellent</span>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-xs py-4 text-center">N/A</div>
              )}
            </div>

            {/* Mutual Funds Holding */}
            <div className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/15">
                  <PieChart className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Mutual Funds</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold">
                  {hideBalances ? '••••••' : mutualFunds ? formatCurrency(mutualFunds) : '$0'}
                </h4>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                  +3.2% return
                </p>
              </div>
            </div>

            {/* Stock Portfolios */}
            <div className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/15">
                  <LineChart className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Stocks</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold">
                  {hideBalances ? '••••••' : stocks ? formatCurrency(stocks) : '$0'}
                </h4>
                <p className="text-[10px] text-emerald-400 font-semibold">
                  +1.8% today
                </p>
              </div>
            </div>

            {/* Outstanding Debts / Loans */}
            <div className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/15">
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Loans & Debt</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-rose-300">
                  {hideBalances ? '••••••' : loans ? formatCurrency(loans) : '$0'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  Outstanding
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Bank Balances View */}
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Linked Institutions</span>
            <button onClick={handleCheckBalance} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View Accounts
            </button>
          </div>
          
          <div className="space-y-3">
            {institutions.map(inst => (
              <div key={inst.institutionName} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                <div>
                  <h4 className="font-semibold text-slate-200">{inst.institutionName}</h4>
                  <p className="text-[10px] text-slate-500">{inst.accounts?.length || 0} Accounts linked</p>
                </div>
                <span className="font-bold text-slate-100">
                  {hideBalances ? '••••••' : formatCurrency(inst.totalBalance || 0)}
                </span>
              </div>
            ))}

            {institutions.length === 0 && (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-500">No bank accounts linked yet</p>
                <button
                  onClick={() => open()}
                  disabled={!ready}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg active:scale-95 transition-all shadow-md"
                >
                  Link Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Nav Shortcut Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Wind Command Suite</h3>
          <div className="space-y-2">
            
            {/* AI Assistant Banner */}
            <div 
              onClick={() => navigate('/chat')}
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/25 hover:border-indigo-400/50 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-indigo-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">AI Agent Copilot</h4>
                  <p className="text-[10px] text-slate-400">Discuss custom loan terms and cash flows</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            {/* OCR Receipt Scanner */}
            <div 
              onClick={() => navigate('/scan-receipt')}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Receipt OCR Scanner</h4>
                  <p className="text-[10px] text-slate-400">Extract fields & sync purchases immediately</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            {/* Savings Goals */}
            <div 
              onClick={() => navigate('/goals')}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Savings Goal Manager</h4>
                  <p className="text-[10px] text-slate-400">Monitor deadlines & Paused/Active statuses</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

          </div>
        </div>

      </div>

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">Connected Bank Accounts</h3>
            <div className="space-y-3">
              {balances.map(account => (
                <div key={account.id} className="flex justify-between items-center text-sm py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-semibold">{account.name}</p>
                    <p className="text-[10px] text-slate-400">•••• {account.mask}</p>
                  </div>
                  <span className="font-bold text-indigo-400">{formatCurrency(account.currentBalance)}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowBalanceModal(false)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl active:scale-95 transition-all"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}