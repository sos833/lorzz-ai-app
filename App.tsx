import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';
// import ImageGenerator from './components/ImageGenerator'; // الخطوة 1: تعطيل الاستيراد

type View = 'login' | 'chat' | 'image';

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


  const handleNavigate = useCallback((targetView: 'chat' | 'image') => {
    // الخطوة 2: منع الانتقال إلى صفحة الصور
    if (targetView === 'image') {
      alert("Image generation feature is coming soon!"); // إظهار رسالة لطيفة
      return; // إيقاف التنفيذ
    }
    setView(targetView);
  }, []);

  const renderContent = () => {
    // If we are still checking for a user, show a blank screen to prevent flicker
    if (!username && view !== 'login') {
        return null; 
    }

    switch (view) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'chat':
        return <ChatScreen username={username} onNavigate={handleNavigate} onLogout={handleLogout} />;
      
      // الخطوة 3: تعطيل حالة عرض الصور
      case 'image':
        // return <ImageGenerator username={username} onNavigate={handleNavigate} />;
        // بدلاً من ذلك، نعود إلى الدردشة لتجنب أي خطأ
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