import AppContent from './components/navigation/AppContent';
import { LanguageProvider } from './LanguageContext';
import { ThemeProvider } from './ThemeContext';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
