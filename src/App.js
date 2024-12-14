import './App.css';
import AuthProvider from './components/security/AuthProvider';
import Routes from './components/routes';

function App() {
  return (
    <AuthProvider>
      <Routes/>
    </AuthProvider>
  );
}

export default App;
