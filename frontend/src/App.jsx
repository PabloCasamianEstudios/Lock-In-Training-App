import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/sequence/SplashScreen';
import AuthScreen from './components/sequence/AuthScreen';
import SurveyStepper from './components/sequence/SurveyStepper';
import AnalyzingScreen from './components/sequence/AnalyzingScreen';
import RankAssignment from './components/sequence/RankAssignment';
import MainLayout from './components/MainLayout';
import { userService } from './services/mockApi';

function App() {
  const [screen, setScreen] = useState('splash');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const handleSplashComplete = () => {
    const savedToken = localStorage.getItem('lockin_token');
    const savedUser = JSON.parse(localStorage.getItem('lockin_user'));

    if (savedToken && savedUser) {
      setUser(savedUser);
      if (savedUser.hasCompletedSurvey) {
        const savedProfile = JSON.parse(localStorage.getItem('lockin_profile'));
        setProfile(savedProfile);
        setScreen('hub');
      } else {
        setScreen('survey');
      }
    } else {
      setScreen('auth');
    }
  };

  const handleAuthComplete = (userData) => {
    setUser(userData);
    if (userData.hasCompletedSurvey) {
      const savedProfile = JSON.parse(localStorage.getItem('lockin_profile'));
      setProfile(savedProfile);
      setScreen('hub');
    } else {
      setScreen('survey');
    }
  };

  const handleGuestEntry = () => {
    setUser({ username: 'GuestPlayer', rank: 'E', isGuest: true });
    setScreen('survey');
  };

  const handleSurveyComplete = async (surveyData) => {
    setScreen('analyzing');
    const playerProfile = await userService.submitSurvey(surveyData);
    setProfile(playerProfile);
  };

  const handleAnalysisComplete = () => {
    setScreen('result');
  };

  const handleEnterHub = () => {
    setScreen('hub');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setProfile(null);
    setScreen('splash');
  };

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
            <AuthScreen
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
            <SurveyStepper onComplete={handleSurveyComplete} />
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
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default App;
