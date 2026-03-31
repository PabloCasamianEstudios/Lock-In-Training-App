import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Lock, LogIn, UserPlus, Globe } from 'lucide-react';

const AuthScreen = ({ onAuthComplete, onGuestEntry }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, loading, error, setError } = useAuth();
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const validate = () => {
    if (!formData.email || !formData.password) return 'Protocol failure: Missing required credentials';
    if (!isLogin && !formData.username) return 'Identity failure: Username is mandatory';
    if (!formData.email.includes('@')) return 'Data corruption: Invalid email protocol format';
    if (formData.password.length < 6) return 'Security alert: Key must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);

    const vError = validate();
    if (vError) {
      setLocalError(vError);
      return;
    }

    try {
      if (!isLogin) {
        setSuccessMessage('Profile alignment complete. Initializing neural link...');
      } else {
        setSuccessMessage('Credentials accepted. Accessing system...');
      }

      const response = isLogin
        ? await login(formData)
        : await register({
            username: formData.username,
            email: formData.email,
            password: formData.password
          });

      if (isLogin) {
        onAuthComplete(response);
      } else {
        setIsLogin(true);
        setFormData({ username: '', email: '', password: '' });
      }
    } catch (err) {
      setSuccessMessage(null);
    }
  };

  const activeError = localError || error;

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setLocalError(null);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="smash-slash opacity-30" />
      <div className="scanline" />

      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-lg z-10"
      >
        <div className="system-card border-white shadow-[12px_12px_0px_var(--main-color)] p-12">
          <div className="mb-12 space-y-1">
            <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
              {isLogin ? 'SYSTEM' : 'NEW'}
              <span className="block text-main"> {isLogin ? 'ACCESS' : 'PLAYER'}</span>
            </h2>
            <div className="h-2 w-24 bg-main transform -skew-x-12" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {activeError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="bg-red-500/10 border-l-4 border-red-500 p-4 mb-4 transform -skew-x-12 flex items-start gap-4"
                >
                  <div className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-sm">ALERT</div>
                  <p className="text-red-500 font-bold italic text-xs uppercase tracking-tighter leading-tight">
                    {activeError}
                  </p>
                </motion.div>
              ) : successMessage ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="bg-green-500/10 border-l-4 border-green-500 p-4 mb-4 transform -skew-x-12 flex items-start gap-4"
                >
                  <div className="bg-green-500 text-black font-black text-[10px] px-2 py-0.5 rounded-sm">SYSTEM</div>
                  <p className="text-green-500 font-bold italic text-xs uppercase tracking-tighter leading-tight">
                    {successMessage}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs text-white font-black uppercase italic tracking-widest">Username Profile</label>
                  <div className="flex items-center bg-white transform -skew-x-12 px-4 focus-within:ring-4 focus-within:ring-main transition-all">
                    <User className="w-5 h-5 text-black transform skew-x-12 flex-shrink-0" />
                    <input
                      type="text"
                      className="w-full bg-transparent border-none p-4 text-black font-black italic focus:outline-none transform skew-x-12"
                      placeholder="e.g. SUNG_JIN_WOO"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs text-white font-black uppercase italic tracking-widest">Email Protocol</label>
              <div className="flex items-center bg-white transform -skew-x-12 px-4 focus-within:ring-4 focus-within:ring-main transition-all">
                <Mail className="w-5 h-5 text-black transform skew-x-12 flex-shrink-0" />
                <input
                  type="email"
                  className="w-full bg-transparent border-none p-4 text-black font-black italic focus:outline-none transform skew-x-12"
                  placeholder="ID@PLAYER.NET"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white font-black uppercase italic tracking-widest">Secure Key</label>
              <div className="flex items-center bg-white transform -skew-x-12 px-4 focus-within:ring-4 focus-within:ring-main transition-all">
                <Lock className="w-5 h-5 text-black transform skew-x-12 flex-shrink-0" />
                <input
                  type="password"
                  className="w-full bg-transparent border-none p-4 text-black font-black italic focus:outline-none transform skew-x-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="button-neon w-full flex items-center justify-center gap-4 text-2xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    {isLogin ? <LogIn className="w-6 h-6 mb-1" /> : <UserPlus className="w-6 h-6 mb-1" />}
                    <span>{isLogin ? 'ENTER STAGE' : 'FINALIZE PROFILE'}</span>
                  </>
                )}
              </motion.button>

              <div className="flex flex-col md:flex-row gap-4 justify-between items-center px-2">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-[10px] text-white/50 uppercase hover:text-main transition-colors font-black tracking-[0.2em] italic"
                >
                  {isLogin ? "No data? Create initialization protocol" : "Already registered? Access system"}
                </button>

                <button
                  type="button"
                  onClick={onGuestEntry}
                  className="text-[10px] text-secondary-color uppercase hover:text-white transition-colors flex items-center gap-2 font-black tracking-widest italic"
                >
                  <Globe className="w-3 h-3" />
                  GUEST OVERRIDE
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>

      <div className="absolute top-0 right-0 w-1/3 h-full bg-main/5 -skew-x-12 transform origin-top translate-x-1/2 pointer-events-none" />
    </div>
  );
};

export default AuthScreen;

