import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';
// import ImageGenerator from './components/ImageGenerator'; // تمت إزالته

type View = 'login' | 'chat'; // تمت إزالة 'image'

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [username, setUsername] = useState<string>('');

  // Auto-login check on initial load
  useEffect(() => {
    try {
      const lastUser = localStorage.getItem('lorzz-last-user');
      if (lastUser) {
        setUsername(lastUser);
        setView('chat');
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }
  }, []);

  const handleLogin = useCallback((name: string) => {
    if (name.trim()) {
      const trimmedName = name.trim();
      setUsername(trimmedName);
      localStorage.setItem('lorzz-last-user', trimmedName);
      setView('chat');
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('lorzz-last-user');
    setUsername('');
    setView('login');
  }, []);
  
  // دالة onNavigate لم تعد ضرورية، ولكن سنتركها فارغة لتجنب الأخطاء
  const handleNavigate = useCallback(() => {
    // لا تفعل شيئًا
  }, []);


  const renderContent = () => {
    switch (view) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'chat':
        return <ChatScreen username={username} onNavigate={handleNavigate} onLogout={handleLogout} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      {renderContent()}
    </div>
  );
};

export default App;