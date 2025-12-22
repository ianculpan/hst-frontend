import AppBar from './components/AppBar';
import './theme/App.css';
import AppRouter from './components/AppRouter.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthProvider from './components/AuthProvider.jsx';
import ModalProvider from './components/modals/ModalProvider.jsx';

function App() {
  return (
    <Router>
      <ModalProvider>
        <AuthProvider>
          <div className="mx-auto py-3 text-brand bg-brand">
            <AppBar />
          </div>
          <div className="min-h-screen mx-auto text-brand bg-brand px-4">
            <AppRouter />
          </div>
        </AuthProvider>
      </ModalProvider>
    </Router>
  );
}

export default App;
