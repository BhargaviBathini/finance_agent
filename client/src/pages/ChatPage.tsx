import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Trash2, Lock, Unlock, Loader2, DollarSign, Home, PiggyBank, Mic, MicOff, Volume2, VolumeX, ChevronLeft } from 'lucide-react';
import { chatAPI } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [dataSharing, setDataSharing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadSession();
    loadSuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSession = async () => {
    try {
      const response = await chatAPI.getSession();
      setChatId(response.data.chatId);
      setMessages(response.data.messages || []);
      setDataSharing(response.data.dataSharing === true);
    } catch (error) {
      console.error('Failed to load chat session:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await chatAPI.getSuggestions();
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        message: text,
        chatId: chatId || undefined,
        dataSharing,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDataSharing = async () => {
    try {
      const nextState = !dataSharing;
      setDataSharing(nextState);
      await chatAPI.updateDataSharing({
        enabled: nextState,
        chatId: chatId || undefined,
      });
    } catch (error) {
      console.error('Failed to update data sharing:', error);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      try {
        await chatAPI.clearChat(chatId || undefined);
        setMessages([]);
      } catch (error) {
        console.error('Failed to clear chat:', error);
      }
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      const txt = e.results[0][0].transcript;
      setInput(txt);
    };
    rec.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);

    setRecognition(rec);
    rec.start();
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Render message bubble content with inline calculations detection
  const renderMessageContent = (content: string) => {
    const containsCompound = content.toLowerCase().includes('compound') || content.toLowerCase().includes('invest') || content.toLowerCase().includes('rate');
    const containsLoan = content.toLowerCase().includes('loan') || content.toLowerCase().includes('afford') || content.toLowerCase().includes('emi');

    return (
      <div className="space-y-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        
        {/* Inline Compound Projection Card */}
        {containsCompound && (
          <div className="mt-3 bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-3 font-sans text-xs">
            <div className="font-bold text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Compound Calculator
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-900 p-2 rounded-lg border border-white/5">
                <span className="text-slate-500 block">5 Years Projection</span>
                <span className="font-bold text-emerald-400 mt-1 block">$74,200</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-white/5">
                <span className="text-slate-500 block">10 Years Projection</span>
                <span className="font-bold text-indigo-400 mt-1 block">$185,400</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/insights')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-[10px]"
            >
              Open Interactive Simulator
            </button>
          </div>
        )}

        {/* Inline Loan EMIs Calculator Card */}
        {containsLoan && (
          <div className="mt-3 bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-3 font-sans text-xs">
            <div className="font-bold text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> EMI Estimation
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-900 p-2 rounded-lg border border-white/5">
                <span className="text-slate-500 block">Estimated EMI</span>
                <span className="font-bold text-white mt-1 block">$420 / month</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-white/5">
                <span className="text-slate-500 block">Tenure Term</span>
                <span className="font-bold text-white mt-1 block">5 Years @ 7.5%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative pb-20">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="bg-slate-950/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 bg-slate-900/60 border border-white/5 rounded-xl hover:bg-slate-800 transition-all">
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div>
              <h1 className="text-sm font-bold tracking-wider uppercase text-slate-200">Wind AI Agent</h1>
              <p className="text-[10px] text-slate-500">Gemini LLM Integration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle Personalization */}
            <button
              onClick={handleToggleDataSharing}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                dataSharing
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900/60 border-white/5 text-slate-400'
              }`}
            >
              {dataSharing ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{dataSharing ? 'Personalized' : 'Generic'}</span>
            </button>
            <button
              onClick={handleClearChat}
              className="p-2.5 bg-slate-900/60 border border-white/5 hover:bg-slate-800 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-5">
          
          {messages.length === 0 && (
            <div className="text-center py-12 max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold">Hello, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                I'm your financial copilot. Ask me questions about cash flows, savings goals, anomalies, or expected returns.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border border-white/5 text-slate-100 rounded-tl-none backdrop-blur-md'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between mb-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>CO-PILOT RESPONSE</span>
                    <button 
                      onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.content)}
                      className="p-1 rounded bg-white/5 hover:bg-white/10"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
                {msg.role === 'assistant' ? renderMessageContent(msg.content) : <p className="text-sm">{msg.content}</p>}
                <span className="block text-[9px] text-slate-500 mt-2 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-400">Synthesizing insights...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Horizontal suggestions list */}
      {messages.length === 0 && suggestions.length > 0 && (
        <div className="px-6 pb-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  className="flex-shrink-0 px-4 py-2.5 bg-slate-900/60 border border-white/5 hover:border-white/10 rounded-full text-xs text-slate-300 transition-all font-semibold active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Console */}
      <div className="bg-slate-950/60 backdrop-blur-xl border-t border-white/5 px-6 py-4 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Discuss wealth projection..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none no-scrollbar"
            rows={1}
            style={{ maxHeight: '100px' }}
            disabled={loading}
          />
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-3 border rounded-xl active:scale-95 transition-all ${
              isListening
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl active:scale-95 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
