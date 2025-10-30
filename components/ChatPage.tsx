import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import ProfileIcon from './icons/ProfileIcon';
import ProfileModal from './ProfileModal';
import Spinner from './Spinner';
import BotIcon from './icons/BotIcon';
import { Persona } from '../types';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface ChatPageProps {
  userEmail: string;
  onLogout: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  persona: Persona;
  setPersona: (persona: Persona) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ userEmail, onLogout, theme, setTheme, persona, setPersona }) => {
  const { messages, isLoading, sendMessage, clearChat } = useChat(persona);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-bg-light dark:bg-dark-primary">
      <header className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-lg">E</div>
            <h1 className="text-xl font-bold text-brand-accent">Eva - Enterprise Assistant</h1>
        </div>
        <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full text-text-light-secondary dark:text-dark-secondary hover:bg-bg-light-secondary dark:hover:bg-gray-700 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 rounded-full text-text-light-secondary dark:text-dark-secondary hover:bg-bg-light-secondary dark:hover:bg-gray-700"
              aria-label="Open profile"
            >
              <ProfileIcon />
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center">
                <BotIcon />
              </div>
              <div className="max-w-xl p-3 rounded-lg shadow bg-bg-light-secondary dark:bg-dark-secondary rounded-bl-none">
                <Spinner />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 md:p-6 border-t border-border-light dark:border-border-dark">
        <div className="max-w-4xl mx-auto">
          <MessageInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </footer>
      
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={userEmail}
        onLogout={onLogout}
        onClearHistory={clearChat}
        persona={persona}
        onPersonaChange={setPersona}
      />
    </div>
  );
};

export default ChatPage;