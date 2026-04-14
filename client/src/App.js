import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import './App.css';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">ChatWave</span>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <SocketProvider>
      <ChatPage />
    </SocketProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
