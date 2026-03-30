import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/sequence/SplashScreen';
import AuthScreen from './components/sequence/AuthScreen';
import SurveyStepper from './components/sequence/SurveyStepper';
import AnalyzingScreen from './components/sequence/AnalyzingScreen';
import RankAssignment from './components/sequence/RankAssignment';
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
      setScreen(savedUser.hasCompletedSurvey ? 'result' : 'survey');
      if (savedUser.hasCompletedSurvey) {
        setProfile(JSON.parse(localStorage.getItem('lockin_profile')));
      }
    } else {
      setScreen('auth');
    }
  };

  const handleAuthComplete = (userData) => {
    setUser(userData);
    setScreen(userData.hasCompletedSurvey ? 'result' : 'survey');
    if (userData.hasCompletedSurvey) {
      setProfile(JSON.parse(localStorage.getItem('lockin_profile')));
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

  const handleRestart = () => {
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
            <AnalyzingScreen onComplete={handleAnalysisComplete} />
          </motion.div>
        )}

        {screen === 'result' && profile && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <RankAssignment profile={profile} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>

      {user && (
        <div className="absolute bottom-4 left-4 z-[60] bg-black/40 border border-main/20 px-2 py-1 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-main animate-pulse" />
          <span className="text-[8px] text-main/60 uppercase font-mono tracking-tighter">
            PROT: {user.username} | {screen.toUpperCase()}_STAGE
          </span>
        </div>
      )}
    </div>
  );
}

export default App;
