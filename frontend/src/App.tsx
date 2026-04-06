import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/sequence/SplashScreen';
import AuthScreen from './components/sequence/AuthScreen';
import SurveyStepper from './components/sequence/SurveyStepper';
import AnalyzingScreen from './components/sequence/AnalyzingScreen';
import RankAssignment from './components/sequence/RankAssignment';
import MainLayout from './components/MainLayout';
import { useAuth } from './hooks/useAuth';
import { useUser } from './hooks/useUser';

function App() {
  const [screen, setScreen] = useState('splash');
  const { user, setUser, logout } = useAuth();
  const { profile, setProfile, submitSurvey, fetchProfile } = useUser();

  const handleSplashComplete = useCallback(async () => {
    if (user) {
      if (profile && profile.stats && profile.rank) {
        setScreen('hub');
        return;
      }
      try {
        const upToDateProfile = await fetchProfile(user.id);
        if (upToDateProfile && (upToDateProfile.stats || upToDateProfile.rank)) {
          setScreen('hub');
        } else {
          setScreen('survey');
        }
      } catch (err) {
        if (profile && (profile.stats || profile.rank)) {
          setScreen('hub');
        } else {
          setScreen('survey');
        }
      }
    } else {
      setScreen('auth');
    }
  }, [user, profile, fetchProfile]);

  const handleAuthComplete = useCallback(async (userData: any) => {
    setUser(userData);
    if (profile && userData.id === profile.userId && (profile.stats || profile.rank)) {
      setScreen('hub');
      return;
    }
    try {
      const upToDateProfile = await fetchProfile(userData.id);
      if (upToDateProfile && (upToDateProfile.stats || upToDateProfile.rank)) {
        setScreen('hub');
      } else {
        setScreen('survey');
      }
    } catch (err) {
      setScreen('survey');
    }
  }, [setUser, profile, fetchProfile]);

  const handleGuestEntry = useCallback(() => {
    const guestUser = { id: 0, username: 'GuestPlayer', rank: 'E', isGuest: true };
    const guestProfile = {
      rank: 'E',
      level: 1,
      xp: 0,
      coins: 0,
      stats: { STR: 5, VIT: 5, AGI: 5, INT: 5, DISC: 5, LUK: 5 }
    };
    setUser(guestUser);
    setProfile(guestProfile);
    setScreen('hub');
  }, [setUser, setProfile]);

  const handleSurveyComplete = async (surveyData: any) => {
    if (!user?.id) return;
    setScreen('analyzing');
    try {
      const playerProfile = await submitSurvey(user.id, surveyData);
      setProfile(playerProfile);
    } catch (err) {
      const defaultProfile = {
        userId: user?.id,
        rank: 'E',
        level: 1,
        xp: 0,
        coins: 0,
        stats: { STR: 0, VIT: 0, AGI: 0, INT: 0, DISC: 0, LUK: 0 }
      };
      setProfile(defaultProfile);
    }
  };

  const handleAnalysisComplete = () => {
    if (profile) {
      setScreen('result');
    } else {
      setScreen('hub');
    }
  };

  const handleEnterHub = () => {
    setScreen('hub');
  };

  const handleLogout = () => {
    logout();
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
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default App;
