import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';
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
            className="bg-white border border-black/10 p-8 rounded-[32px] max-w-sm w-full shadow-2xl relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
            
            {user && (
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            )}

            <form onSubmit={handleAuth} className="text-center space-y-6 pt-4 text-black">
              <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mx-auto border border-black/5 mb-2">
                <motion.div
                  animate={{ rotate: isSignUp ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <Sparkles className="text-black" size={32} />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-light tracking-tight text-black">
                  {isSignUp ? 'Crear Cuenta' : 'Acceso Aura'}
                </h2>
                <p className="text-sm text-neutral-500 font-sans leading-relaxed">
                  {isSignUp ? 'Únete al estudio creativo más avanzado.' : 'Accede a tu estudio desde cualquier lugar.'}
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Tu Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/5 border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 transition-all font-sans text-black"
                />
                
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-black/5 border border-black/5 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-black/20 transition-all font-sans text-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
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
                      placeholder="Confirmar Contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={isSignUp}
                      className="w-full bg-black/5 border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 transition-all font-sans text-black"
                    />
                  </motion.div>
                )}
              </div>

              {authError && (
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all disabled:opacity-50 group font-sans"
              >
                {authLoading ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <>{isSignUp ? 'Registrarse' : 'Entrar'}</>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError(null);
                }}
                className="text-[10px] text-neutral-500 uppercase tracking-widest hover:text-black transition-colors font-bold"
              >
                {isSignUp ? '¿Ya tienes cuenta? Entra' : '¿No tienes cuenta? Regístrate'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
