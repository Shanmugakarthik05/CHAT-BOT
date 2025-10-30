import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import ChatPage from './components/ChatPage';
import { Persona } from './types';

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  const [persona, setPersona] = useState<Persona>(() => {
    const savedPersona = localStorage.getItem('persona') as Persona;
    return ['friendly', 'formal', 'concise'].includes(savedPersona) ? savedPersona : 'friendly';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('persona', persona);
  }, [persona]);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
  };

  const handleLogout = () => {
    setUserEmail(null);
  };

  return (
    <div className={`font-sans bg-bg-light dark:bg-bg-dark text-text-light-primary dark:text-dark-primary min-h-screen`}>
      {userEmail ? (
        <ChatPage 
          userEmail={userEmail} 
          onLogout={handleLogout}
          theme={theme}
          setTheme={setTheme}
          persona={persona}
          setPersona={setPersona}
        />
      ) : (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </div>
  );
};

export default App;