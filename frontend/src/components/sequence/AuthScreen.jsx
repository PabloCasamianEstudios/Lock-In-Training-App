import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/mockApi';
import { User, Mail, Lock, LogIn, UserPlus, Globe } from 'lucide-react';

const AuthScreen = ({ onAuthComplete, onGuestEntry }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = isLogin
        ? await authService.login(formData)
        : await authService.register(formData);

      onAuthComplete(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black z-10" />
                    <input
                      type="text"
                      className="input-neon text-lg pl-12"
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
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black z-10" />
                <input
                  type="email"
                  className="input-neon text-lg pl-12"
                  placeholder="ID@PLAYER.NET"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white font-black uppercase italic tracking-widest">Secure Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black z-10" />
                <input
                  type="password"
                  className="input-neon text-lg pl-12"
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
                  onClick={() => setIsLogin(!isLogin)}
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
