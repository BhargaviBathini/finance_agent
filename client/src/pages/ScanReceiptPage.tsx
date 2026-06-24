import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, Upload, RefreshCw, ChevronLeft, Shield, Sparkles } from 'lucide-react';
import { transactionsAPI, accountsAPI } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScanReceiptPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'upload' | 'scanning' | 'extracting' | 'review'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // OCR Extracted values
  const [formData, setFormData] = useState({
    name: 'Target Superstore',
    amount: '142.50',
    date: new Date().toISOString().substring(0, 10),
    category: 'Groceries',
    accountId: '',
  });

  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    // Load accounts for selector
    const fetchAccounts = async () => {
      try {
        const res = await accountsAPI.getAccounts();
        const list = res.data.institutions?.flatMap((i: any) => i.accounts || []) || [];
        setAccounts(list);
        if (list.length > 0) {
          setFormData(prev => ({ ...prev, accountId: list[0]._id || list[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  const handleUpload = () => {
    // Simulated upload of a grocery receipt
    setImage('/placeholder-receipt.png');
    setStep('scanning');
  };

  useEffect(() => {
    if (step === 'scanning') {
      const timer = setTimeout(() => {
        setStep('extracting');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'extracting') {
      const interval = setInterval(() => {
        setScanStep(prev => {
          if (prev >= 2) {
            clearInterval(interval);
            setTimeout(() => {
              setStep('review');
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionsAPI.createTransaction({
        name: formData.name,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        accountId: formData.accountId,
      });
      navigate('/transactions');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative pb-24">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <header className="bg-slate-950/60 backdrop-blur-xl border-b border-white/5 px-6 py-5 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>
          <span className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-purple-400" /> Receipt Scanner
          </span>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: UPLOAD SCREEN */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto text-center space-y-6"
            >
              <div className="p-0.5 rounded-3xl bg-gradient-to-tr from-white/10 to-transparent">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-[22px] p-8 border border-white/5 space-y-6 flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center animate-float-slow">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Upload Your Receipt</h2>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed px-4">
                      Upload any purchase receipt. Wind's AI-OCR engine will parse the items, total amount, taxes, and log it instantly.
                    </p>
                  </div>
                  
                  <div className="w-full pt-4">
                    <button
                      onClick={handleUpload}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Select and Scan Document
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ACTIVE SCANNING VIEW */}
          {step === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto space-y-6 text-center"
            >
              <h3 className="text-lg font-bold">Scanning Document</h3>
              <p className="text-slate-400 text-xs">AI engine is processing document layout...</p>
              
              <div className="relative w-full h-[400px] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Sweep Laser Line */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_15px_#4ade80] animate-laser-sweep z-10" />
                
                {/* Mock Receipt Graphic */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 opacity-40 select-none">
                  <div className="w-full max-w-[200px] border border-dashed border-white/20 p-4 space-y-3">
                    <div className="h-4 bg-white/20 rounded w-1/2 mx-auto"></div>
                    <div className="h-2 bg-white/10 rounded w-full"></div>
                    <div className="h-2 bg-white/10 rounded w-5/6"></div>
                    <div className="space-y-1.5 pt-4">
                      <div className="h-2 bg-white/15 rounded w-full"></div>
                      <div className="h-2 bg-white/15 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: TEXT EXTRACTION STEPS */}
          {step === 'extracting' && (
            <motion.div
              key="extracting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto space-y-6 text-center"
            >
              <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold">OCR Text Extraction</h3>
              
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 text-left space-y-4 max-w-sm mx-auto">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg border flex items-center justify-center ${scanStep >= 0 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                    {scanStep > 0 ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
                  </div>
                  <span className={`text-xs font-semibold ${scanStep >= 0 ? 'text-white' : 'text-slate-500'}`}>Reading character coordinates</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg border flex items-center justify-center ${scanStep >= 1 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                    {scanStep > 1 ? <Check className="w-4 h-4" /> : scanStep === 1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-semibold ${scanStep >= 1 ? 'text-white' : 'text-slate-500'}`}>Extracting numerical entities</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg border flex items-center justify-center ${scanStep >= 2 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                    {scanStep > 2 ? <Check className="w-4 h-4" /> : scanStep === 2 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-semibold ${scanStep >= 2 ? 'text-white' : 'text-slate-500'}`}>Taxonomy taxonomy mapping</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: REVIEW SPLIT VIEW */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
            >
              {/* Left Side Mock Receipt */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Document Scan</span>
                  <span className="text-[10px] text-slate-400">Target_06-24.pdf</span>
                </div>
                <div className="border border-white/5 rounded-2xl bg-slate-950 p-6 flex flex-col space-y-4 font-mono text-[11px] text-slate-400 leading-normal relative overflow-hidden">
                  {/* Highlight green bounding box */}
                  <div className="absolute top-1/3 left-4 right-4 h-8 border border-green-500/50 bg-green-500/5 rounded shadow-lg flex items-center justify-between px-2 text-[9px] text-green-400 font-sans font-bold">
                    <span>MATCHED ENTITY</span>
                    <span>TOTAL $142.50</span>
                  </div>

                  <div className="text-center font-bold text-white text-xs border-b border-dashed border-white/10 pb-3">TARGET SUPERSTORE</div>
                  <div className="flex justify-between">
                    <span>DATE: 06/24/2026</span>
                    <span>TIME: 14:32</span>
                  </div>
                  <div className="border-b border-dashed border-white/10 pb-2">
                    <div className="flex justify-between py-1">
                      <span>ORGANIC APPLES</span>
                      <span>$12.40</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>PAPER TOWELS</span>
                      <span>$18.90</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>PREMIUM BEEF CHUCK</span>
                      <span>$45.20</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>WIND SHIELD WIPERS</span>
                      <span>$66.00</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-bold text-white text-xs">
                    <span>TOTAL DUE</span>
                    <span>$142.50</span>
                  </div>
                </div>
              </div>

              {/* Right Side Glass Fields Form */}
              <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-base">Validate OCR Fields</h3>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Auto-parsed
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Merchant Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amount Due</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Transaction Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="Groceries">Groceries</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Travel">Travel</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Utilities">Utilities</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Charge Account</label>
                    <select
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    >
                      {accounts.map(acc => (
                        <option key={acc._id || acc.id} value={acc._id || acc.id}>
                          {acc.name} (•••• {acc.mask})
                        </option>
                      ))}
                      {accounts.length === 0 && <option value="">No Account Connected</option>}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl active:scale-[0.98] transition-all shadow-lg mt-4 disabled:opacity-50"
                  >
                    {loading ? 'Logging transaction...' : 'Approve & Sync Purchase'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
