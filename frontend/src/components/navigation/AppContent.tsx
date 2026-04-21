import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from '../sequence/SplashScreen';
import AuthPage from '../../pages/AuthPage';
import SurveyStepper from '../sequence/SurveyStepper';
import AnalyzingScreen from '../sequence/AnalyzingScreen';
import RankAssignment from '../sequence/RankAssignment';
import MainLayout from '../MainLayout';
import { useAppNavigation } from '../../hooks/useAppNavigation';

export function AppContent() {
  const {
    screen,
    user,
    profile,
    handleSplashComplete,
    handleAuthComplete,
    handleGuestEntry,
    handleSurveyComplete,
    handleAnalysisComplete,
    handleEnterHub,
    handleLogout,
    distributeStats,
    fetchProfile
  } = useAppNavigation();

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-rpg">
      <AnimatePresence mode="wait">
        {screen === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
          >
            <SplashScreen onComplete={handleSplashComplete} />
          </motion.div>
        )}

        {screen === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <AuthPage
              onAuthComplete={handleAuthComplete}
              onGuestEntry={handleGuestEntry}
            />
          </motion.div>
        )}

        {screen === 'survey' && (
          <motion.div
            key="survey"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <SurveyStepper 
              onComplete={handleSurveyComplete} 
              onLogout={handleLogout}
            />
          </motion.div>
        )}

        {screen === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
          >
            <AnalyzingScreen onAnalysisComplete={handleAnalysisComplete} />
          </motion.div>
        )}

        {screen === 'result' && profile && (
          <motion.div
            key="result"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <RankAssignment
              profile={profile}
              onRestart={handleLogout}
              onEnterHub={handleEnterHub}
            />
          </motion.div>
        )}

        {screen === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'fixed', inset: 0 }}
          >
            <MainLayout
              user={user}
              profile={profile}
              onLogout={handleLogout}
              distributeStats={distributeStats}
              fetchProfile={fetchProfile}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AppContent;


