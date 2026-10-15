import { BrowserRouter }  from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import { ThemeProvider }  from './context/ThemeContext';
import { LangProvider }   from './context/LangContext';
import { ToastProvider }  from './components/ui/Toast';
import AppRouter          from './routes/AppRouter';

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
