import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { loginWithGoogle, loginAsGuest } = useAuth();
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
    } catch (err) {
      setError('Failed to sign in. Please try again or skip for now.');
    }
  };

  const handleSkip = () => {
    loginAsGuest();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5 relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm mt-4">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/40 z-10 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 text-white text-3xl">
          🏛️
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Civora</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Your voice. Your locality. Your priority. Sign in to track your civic requests easily.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full relative flex items-center justify-center bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-2xl shadow-sm hover:bg-gray-50 hover:shadow transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              <path fill="none" d="M1 1h22v22H1z"/>
            </svg>
            Continue with Google
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider font-semibold">Or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={handleSkip}
            className="w-full py-3 px-4 bg-transparent border-2 border-gray-200 text-gray-500 font-semibold rounded-2xl hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all active:scale-[0.98]"
          >
            Skip for now
          </button>
        </div>
      </div>
      
      <p className="absolute bottom-6 text-xs text-gray-400 font-medium z-10 max-w-[250px] text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};
