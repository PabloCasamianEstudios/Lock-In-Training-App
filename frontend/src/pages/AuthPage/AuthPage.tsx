import { useState, FC, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { User as UserIcon, Mail, Lock } from 'lucide-react';
import { LoginResponse } from '../../types';
import { useLanguage } from '../../LanguageContext';
import { AuthHeader, AuthStatusMessage, AuthField, AuthActions } from '@/components/auth';

interface AuthPageProps {
  onAuthComplete: (userData: LoginResponse) => void;
  onGuestEntry: () => void;
}

const AuthPage: FC<AuthPageProps> = ({ onAuthComplete, onGuestEntry }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, loading, error, setError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const validate = (): string | null => {
    if (!formData.email || !formData.password) return t('auth.errors.missing_credentials');
    if (!isLogin && !formData.username) return t('auth.errors.username_mandatory');
    if (!formData.email.includes('@')) return t('auth.errors.invalid_email');
    if (formData.password.length < 6) return t('auth.errors.password_short');
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
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
        setSuccessMessage(t('auth.messages.register_success'));
      } else {
        setSuccessMessage(t('auth.messages.login_success'));
      }

      const response = isLogin
        ? await login(formData)
        : await register({
            username: formData.username,
            email: formData.email,
            password: formData.password
          });

      if (isLogin) {
        onAuthComplete(response as LoginResponse);
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
          <AuthHeader isLogin={isLogin} />

          <form onSubmit={handleSubmit} className="space-y-8">
            <AuthStatusMessage error={activeError} successMessage={successMessage} />

            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AuthField
                    label={t('auth.username')}
                    type="text"
                    placeholder={t('auth.username_placeholder')}
                    value={formData.username}
                    onChange={(val) => setFormData({ ...formData, username: val })}
                    icon={<UserIcon className="w-5 h-5 text-black transform skew-x-12 flex-shrink-0" />}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AuthField
              label={t('auth.email')}
              type="email"
              placeholder="user@email.com"
              value={formData.email}
              onChange={(val) => setFormData({ ...formData, email: val })}
              icon={<Mail className="w-5 h-5 text-black transform skew-x-12 flex-shrink-0" />}
            />

            <AuthField
              label={t('auth.password')}
              type="password"
              placeholder={t('auth.password_placeholder')}
              value={formData.password}
              onChange={(val) => setFormData({ ...formData, password: val })}
              icon={<Lock className="w-5 h-5 text-black transform skew-x-12 flex-shrink-0" />}
            />

            <AuthActions
              isLogin={isLogin}
              loading={loading}
              onToggleMode={toggleMode}
              onGuestEntry={onGuestEntry}
            />
          </form>
        </div>
      </motion.div>

      <div className="absolute top-0 right-0 w-1/3 h-full bg-main/5 -skew-x-12 transform origin-top translate-x-1/2 pointer-events-none" />
    </div>
  );
};

export default AuthPage;
