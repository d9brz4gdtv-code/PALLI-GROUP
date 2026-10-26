import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '../lib/firebase';
import { User } from '../types';
import { ArrowLeft, Mail, Lock, User as UserIcon, LogIn, UserPlus } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleForgotPassword = async () => {
    if (!email) {
      setError('পাসওয়ার্ড রিসেট করতে অনুগ্রহ করে উপরের Email বক্সে আপনার ইমেইলটি লিখুন।');
      setInfoMessage('');
      return;
    }
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      await resetPassword(email);
      setInfoMessage(`আপনার ইমেইলে (${email}) একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে! আপনার Gmail ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।`);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
      } else if (err.code === 'auth/invalid-email') {
        setError('সঠিক ইমেইল ঠিকানা প্রদান করুন।');
      } else {
        setError('পাসওয়ার্ড রিসেট লিংক পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const userProfile = await signInWithGoogle();
      onAuthSuccess(userProfile as User);
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError('অনুগ্রহ করে সব তথ্য পূরণ করুন।');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let userProfile;
      if (isSignUp) {
        userProfile = await signUpWithEmail(email, password, name);
      } else {
        userProfile = await signInWithEmail(email, password);
      }
      onAuthSuccess(userProfile as User);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('ভুল পাসওয়ার্ড বা ইমেইল! অনুগ্রহ করে আবার চেষ্টা করুন।');
      } else if (err.code === 'auth/user-not-found') {
        setError('এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে।');
      } else if (err.code === 'auth/weak-password') {
        setError('পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।');
      } else if (err.code === 'auth/invalid-email') {
        setError('ইমেইলটি সঠিক নয়।');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password লগইন অপশনটি চালু করা নেই।');
      } else if (err.code === 'auth/too-many-requests') {
        setError('অনেকবার ভুল চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।');
      } else {
        setError('সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4 font-sans">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-12 h-12 bg-[#3B55A4] rounded-xl flex items-center justify-center shadow-lg shadow-[#3B55A4]/20">
          <span className="text-white text-3xl font-black">P</span>
        </div>
        <h1 className="text-3xl font-black text-[#2D3E66] tracking-tight uppercase">Palli group</h1>
      </motion.div>

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[1000px] bg-white rounded-[40px] shadow-2xl shadow-black/5 overflow-hidden flex flex-col md:flex-row min-h-[600px] relative"
      >
        {/* Back Button for Mobile/Sign-up (Desktop Only) */}
        {isSignUp && (
          <button 
            onClick={() => setIsSignUp(false)}
            className="absolute top-6 left-6 z-20 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all text-gray-600 hidden md:flex"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Form Section */}
        <div className={`flex-1 p-8 md:p-16 flex flex-col items-center justify-center transition-all duration-500 ${isSignUp ? 'md:order-2' : 'md:order-1'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? 'signup' : 'signin'}
              initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
              className="w-full max-w-sm flex flex-col items-center"
            >
              <h2 className="text-4xl font-black text-[#2D3E66] mb-2">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
              <p className="text-gray-400 text-sm mb-8 font-medium">
                {isSignUp ? 'Register with your details' : 'Use your email account'}
              </p>

              {/* Social Login */}
              <div className="flex gap-4 mb-8">
                <button 
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-12 h-12 rounded-2xl border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all group"
                  title="Sign in with Google"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </button>
              </div>

              <div className="w-full space-y-4">
                {isSignUp && (
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3B55A4] transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#F0F2F5] border-2 border-transparent rounded-2xl px-12 py-4 text-gray-700 focus:border-[#3B55A4] focus:bg-white outline-none transition-all font-bold text-sm"
                    />
                  </div>
                )}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3B55A4] transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F0F2F5] border-2 border-transparent rounded-2xl px-12 py-4 text-gray-700 focus:border-[#3B55A4] focus:bg-white outline-none transition-all font-bold text-sm"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3B55A4] transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F0F2F5] border-2 border-transparent rounded-2xl px-12 py-4 text-gray-700 focus:border-[#3B55A4] focus:bg-white outline-none transition-all font-bold text-sm"
                  />
                </div>
              </div>

              {!isSignUp && (
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="mt-4 text-xs font-bold text-gray-400 hover:text-[#3B55A4] transition-colors uppercase tracking-widest disabled:opacity-50"
                >
                  Forgot Your Password?
                </button>
              )}

              <button 
                onClick={handleAuth}
                disabled={loading}
                className="mt-10 w-full bg-[#3B55A4] text-white py-4 rounded-2xl font-black tracking-[0.2em] hover:bg-[#2D3E66] transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-[#3B55A4]/20 flex items-center justify-center gap-2 uppercase text-xs"
              >
                {loading ? 'LOADING...' : (isSignUp ? <><UserPlus size={16} /> SIGN UP</> : <><LogIn size={16} /> SIGN IN</>)}
              </button>

              {infoMessage && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-xs text-emerald-700 font-bold text-center bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 leading-relaxed"
                >
                  {infoMessage}
                </motion.p>
              )}

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-xs text-red-500 font-black text-center bg-red-50 px-4 py-2 rounded-xl border border-red-100"
                >
                  {error}
                </motion.p>
              )}

              {/* Mobile Toggle */}
              <div className="mt-8 flex flex-col items-center gap-4 md:hidden">
                <p className="text-sm text-gray-400 font-medium">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-2 text-[#3B55A4] font-black uppercase text-xs tracking-widest"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
                
                {isSignUp && (
                  <button 
                    onClick={() => setIsSignUp(false)}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#3B55A4] transition-all font-black text-[10px] tracking-widest uppercase"
                  >
                    <ArrowLeft size={14} />
                    Back to Login
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Overlay Section (Desktop Only) */}
        <div className={`hidden md:flex flex-1 bg-[#3B55A4] p-16 flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500 ${isSignUp ? 'md:order-1' : 'md:order-2'}`}>
          {/* Decorative background */}
          <div className={`absolute inset-0 bg-gradient-to-br from-[#3B55A4] to-[#2D3E66] transition-all duration-700 ${isSignUp ? 'rounded-r-[100px]' : 'rounded-l-[100px]'}`}></div>
          
          <div className="relative z-10 text-white max-w-xs">
            <motion.div
              key={isSignUp ? 'overlay-signup' : 'overlay-signin'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-black mb-6">{isSignUp ? 'Welcome Back!' : 'Hello, Friend!'}</h2>
              <p className="text-sm leading-relaxed mb-10 opacity-80 font-medium">
                {isSignUp 
                  ? 'To keep connected with us please login with your personal info' 
                  : 'Enter your personal details and start journey with us'}
              </p>
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="border-2 border-white text-white px-12 py-4 rounded-2xl font-black tracking-[0.2em] hover:bg-white hover:text-[#3B55A4] transition-all active:scale-95 uppercase text-xs"
              >
                {isSignUp ? 'SIGN IN' : 'SIGN UP'}
              </button>
            </motion.div>
          </div>

          {/* Back Button for Desktop Sign-up */}
          {isSignUp && (
            <button 
              onClick={() => setIsSignUp(false)}
              className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-all font-black text-[10px] tracking-widest uppercase"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
