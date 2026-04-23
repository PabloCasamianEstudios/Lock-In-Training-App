import AppContent from './components/navigation/AppContent';
import { LanguageProvider } from './LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
