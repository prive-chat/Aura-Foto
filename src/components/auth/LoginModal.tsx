import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function LoginModal() {
  const { showLoginModal, setShowLoginModal, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (isSignUp && password !== confirmPassword) {
      setAuthError('Las contraseñas no coinciden');
      setAuthLoading(false);
      return;
    }

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthError(error.message === 'Invalid login credentials' ? 'Credenciales inválidas' : error.message);
    } else {
      setShowLoginModal(false);
    }
    setAuthLoading(false);
  };

  return (
    <AnimatePresence>
      {(showLoginModal || !user) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl"
          onClick={() => user && setShowLoginModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-2 p-10 rounded-[40px] max-w-sm w-full shadow-2xl relative overflow-hidden border-white/5"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {user && (
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors p-2"
              >
                <X size={20} />
              </button>
            )}

            <form onSubmit={handleAuth} className="text-center space-y-8 pt-4">
              <div className="flex justify-center mb-4">
                <Logo size={80} />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl font-serif font-light tracking-tight text-white">
                  {isSignUp ? 'Crear Cuenta' : 'Acceso Aura'}
                </h2>
                <p className="text-[10px] text-white/40 font-sans uppercase tracking-[0.3em] font-bold">
                  {isSignUp ? 'Únete al estudio creativo' : 'Entra a tu galería personal'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="group relative">
                  <input
                    type="email"
                    placeholder="CORREO ELECTRÓNICO"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-sans text-white placeholder:text-white/20 uppercase tracking-widest font-bold"
                  />
                </div>
                
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="CONTRASEÑA"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-12 text-xs focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-sans text-white placeholder:text-white/20 uppercase tracking-widest font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="CONFIRMAR CONTRASEÑA"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={isSignUp}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-sans text-white placeholder:text-white/20 uppercase tracking-widest font-bold"
                    />
                  </motion.div>
                )}
              </div>

              {authError && (
                <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold animate-pulse">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-white text-black py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all disabled:opacity-50 group font-sans text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-white/5"
              >
                {authLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>{isSignUp ? 'CREAR ESTUDIO' : 'ENTRAR AL ESTUDIO'}</>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError(null);
                }}
                className="text-[9px] text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors font-bold"
              >
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo en Aura? Regístrate aquí'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
