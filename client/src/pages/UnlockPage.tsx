import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Fingerprint, Delete } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../utils/api';
import type { AxiosResponse } from 'axios';
import { motion } from 'framer-motion';

// Toast notifications
const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message)
};

type VerifyPinResponse = {
  verified: boolean;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    hasBankConnected: boolean;
    onboardingComplete: boolean;
    hasWebAuthn?: boolean;
  };
  onboardingComplete?: boolean;
  nextStep?: string;
};

export default function UnlockPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const [webAuthnAvailable, setWebAuthnAvailable] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [autoWebAuthnAttempted, setAutoWebAuthnAttempted] = useState(false);
  
  // Custom numeric keypad state
  const [pinDigits, setPinDigits] = useState<string>('');

  const { user, setUnlocked, setUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Check WebAuthn availability and user status
  const checkWebAuthn = useCallback(async () => {
    try {
      if (!window.PublicKeyCredential) {
        setWebAuthnAvailable(false);
        setShowPinInput(true);
        return;
      }

      const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setWebAuthnAvailable(isAvailable);

      const isFirstTimeUser = !user?.onboardingComplete;
      setIsFirstTime(isFirstTimeUser);

      if (isAvailable && user?.hasWebAuthn && !isFirstTimeUser && !autoWebAuthnAttempted) {
        setAutoWebAuthnAttempted(true);
        await handleWebAuthnUnlock();
      } else {
        setShowPinInput(true);
      }
    } catch (err) {
      console.error('Error checking WebAuthn:', err);
      setWebAuthnAvailable(false);
      setShowPinInput(true);
    }
  }, [user, autoWebAuthnAttempted]);

  const handleWebAuthnUnlock = useCallback(async () => {
    if (!user?.email) {
      setError('User email not found');
      setShowPinInput(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const authResponse = await authAPI.getWebAuthnAuthOptions(user.email);
      const authOptions = authResponse.data;
      
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(authOptions.challenge, (c: string) => c.charCodeAt(0)),
          timeout: 60000,
          userVerification: 'required',
          allowCredentials: authOptions.allowCredentials?.map((cred: any) => ({
            id: Uint8Array.from(cred.id, (c: string) => c.charCodeAt(0)),
            type: 'public-key',
            transports: cred.transports || ['internal'],
          })),
        },
      }) as any;
      
      if (!credential) {
        throw new Error('Authentication was cancelled');
      }
      
      const response = {
        id: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        type: credential.type,
        response: {
          authenticatorData: Array.from(new Uint8Array(credential.response.authenticatorData)),
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
          signature: Array.from(new Uint8Array(credential.response.signature)),
          userHandle: credential.response.userHandle 
            ? Array.from(new Uint8Array(credential.response.userHandle))
            : undefined,
        },
      };
      
      const verifyResponse = await authAPI.verifyWebAuthnAuth({
        email: user.email,
        credential: response,
      });
      
      setUnlocked(true);
      setUser(verifyResponse.data.user);
      
      if (verifyResponse.data.user.onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding/bank-connection');
      }
      
    } catch (err: any) {
      console.error('WebAuthn unlock error:', err);
      if (err.name === 'NotAllowedError' || 
          err.message?.includes('not registered') ||
          err.message?.includes('not found')) {
        setShowPinInput(true);
        setError('Please use your PIN to log in');
      } else if (err.name !== 'AbortError') {
        setError('Authentication failed. Please try again or use your PIN.');
        setShowPinInput(true);
      } else {
        setShowPinInput(true);
      }
    } finally {
      setLoading(false);
    }
  }, [user, navigate, setUnlocked, setUser]);

  const handlePinSubmit = async (enteredPin: string) => {
    if (!user?.email) {
      setError('User email not found');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.verifyPin({
        email: user.email,
        pin: enteredPin
      }) as AxiosResponse<VerifyPinResponse>;
      
      setUnlocked(true);
      setUser(response.data.user);
      
      toast.success('Successfully authenticated');
      
      const { onboardingComplete, nextStep = 'bank-connection' } = response.data;
      
      if (onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate(`/onboarding/${nextStep}`);
      }
      
    } catch (err: any) {
      console.error('Unlock error:', err);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPinDigits(''); // Clear digits on failure
      
      if (newAttempts >= 3) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.response?.data?.error || 'Incorrect PIN. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Keyboard entry handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showPinInput || loading) return;
      if (e.key >= '0' && e.key <= '9') {
        if (pinDigits.length < 6) {
          const newPin = pinDigits + e.key;
          setPinDigits(newPin);
          if (newPin.length === 6) {
            handlePinSubmit(newPin);
          }
        }
      } else if (e.key === 'Backspace') {
        setPinDigits(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPinInput, pinDigits, loading]);

  const handleKeyPress = (num: string) => {
    if (loading) return;
    setError(null);
    if (pinDigits.length < 6) {
      const newPin = pinDigits + num;
      setPinDigits(newPin);
      if (newPin.length === 6) {
        handlePinSubmit(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPinDigits(prev => prev.slice(0, -1));
  };

  const handleFirstTimeSetup = useCallback(async () => {
    if (!isFirstTime || !user?.email) return;
    
    try {
      setIsSettingUp(true);
      if (webAuthnAvailable) {
        try {
          const regResponse = await authAPI.getWebAuthnRegOptions(user.email);
          const options = regResponse.data;
          
          const credential = await navigator.credentials.create({
            publicKey: {
              rp: { 
                id: window.location.hostname, 
                name: 'Financial App' 
              },
              user: {
                id: Uint8Array.from(options.user.id, (c: string) => c.charCodeAt(0)),
                name: user.email,
                displayName: user.name || user.email,
              },
              pubKeyCredParams: [
                { type: 'public-key', alg: -7 },
                { type: 'public-key', alg: -257 },
              ],
              timeout: 60000,
              challenge: Uint8Array.from(options.challenge, (c: string) => c.charCodeAt(0)),
              attestation: 'none',
              authenticatorSelection: {
                userVerification: 'required',
                requireResidentKey: true,
              },
            },
          }) as any;
          
          if (!credential) {
            throw new Error('Aborted');
          }
          
          const response = {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            type: credential.type,
            response: {
              attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            },
          };
          
          const verifyResponse = await authAPI.verifyWebAuthnReg({
            email: user.email,
            credential: response,
          });
          
          setUser(verifyResponse.data.user);
          setIsFirstTime(false);
          toast.success('Biometrics configured');
          
          if (verifyResponse.data.user.onboardingComplete) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding/bank-connection');
          }
        } catch (err: any) {
          console.error(err);
          setError('Failed to setup biometric lock. Use your PIN.');
          setShowPinInput(true);
        } finally {
          setIsSettingUp(false);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Setup failed');
      setShowPinInput(true);
      setIsSettingUp(false);
    }
  }, [isFirstTime, user, webAuthnAvailable, navigate, setUser]);

  useEffect(() => {
    if (isFirstTime && !isSettingUp && webAuthnAvailable) {
      handleFirstTimeSetup();
    }
  }, [isFirstTime, isSettingUp, webAuthnAvailable, handleFirstTimeSetup]);

  useEffect(() => {
    checkWebAuthn();
  }, [checkWebAuthn]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (isSettingUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-6">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Secure Setup</h1>
          <p className="text-slate-400">Initializing encryption & authentication keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {showPinInput ? 'Security Pin' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400">
            {showPinInput ? 'Enter your 6-digit PIN' : 'Authenticate with your device'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm w-full text-center">
            {error}
          </div>
        )}

        {/* PIN Indicators & Custom Numpad */}
        {showPinInput ? (
          <div className="w-full flex flex-col items-center">
            {/* Dots */}
            <div className="flex gap-4 mb-10">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    idx < pinDigits.length
                      ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Custom PhonePe-like Numpad grid */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-xs px-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  disabled={loading}
                  className="w-16 h-16 rounded-full bg-slate-900/60 border border-white/5 flex items-center justify-center text-xl font-bold text-white hover:bg-slate-800/80 active:scale-90 transition-all duration-150 mx-auto"
                >
                  {num}
                </button>
              ))}
              {/* Backspace Key */}
              <button
                onClick={handleBackspace}
                disabled={loading || pinDigits.length === 0}
                className="w-16 h-16 rounded-full flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all duration-150 mx-auto"
              >
                <Delete className="w-6 h-6" />
              </button>
              {/* 0 Key */}
              <button
                onClick={() => handleKeyPress('0')}
                disabled={loading}
                className="w-16 h-16 rounded-full bg-slate-900/60 border border-white/5 flex items-center justify-center text-xl font-bold text-white hover:bg-slate-800/80 active:scale-90 transition-all duration-150 mx-auto"
              >
                0
              </button>
              {/* Fingerprint key inside pad */}
              {webAuthnAvailable && !isFirstTime ? (
                <button
                  onClick={() => setShowPinInput(false)}
                  disabled={loading}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-indigo-400 hover:text-indigo-300 active:scale-90 transition-all duration-150 mx-auto"
                >
                  <Fingerprint className="w-6 h-6" />
                </button>
              ) : (
                <div className="w-16 h-16" />
              )}
            </div>
            
            {webAuthnAvailable && !isFirstTime && (
              <button
                onClick={() => setShowPinInput(false)}
                className="mt-8 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors tracking-wide uppercase"
              >
                Or use fingerprint biometric
              </button>
            )}
          </div>
        ) : (
          <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <button
              onClick={handleWebAuthnUnlock}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Unlock with Biometrics
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowPinInput(true)}
              className="mt-6 text-sm text-slate-400 hover:text-slate-300 font-semibold transition-colors"
            >
              Enter Secure PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}