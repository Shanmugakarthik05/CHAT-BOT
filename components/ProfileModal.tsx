import React from 'react';
import CloseIcon from './icons/CloseIcon';
import { Persona } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onLogout: () => void;
  persona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  userEmail, 
  onLogout,
  persona,
  onPersonaChange
}) => {
  if (!isOpen) return null;

  const personas: Persona[] = ['friendly', 'formal', 'concise'];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center transition-opacity" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-bg-light dark:bg-dark-secondary rounded-lg shadow-xl p-6 w-full max-w-md relative transform transition-all" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-text-light-secondary dark:text-dark-secondary hover:text-text-light-primary dark:hover:text-dark-primary"
          aria-label="Close profile settings"
        >
          <CloseIcon />
        </button>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary">User Profile</h3>
            <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Manage your preferences and session.</p>
          </div>

          <div className="border-t border-border-light dark:border-border-dark"></div>

          <div>
            <p className="text-sm font-medium text-text-light-secondary dark:text-dark-secondary mb-1">Logged in as</p>
            <p className="text-text-light-primary dark:text-dark-primary font-mono bg-bg-light-secondary dark:bg-gray-900 px-2 py-1 rounded text-sm">{userEmail}</p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-text-light-primary dark:text-dark-primary mb-2">Preferences</h4>
            <div className="mt-4">
              <label className="block text-sm text-text-light-primary dark:text-dark-primary mb-2">Eva's Persona</label>
              <div className="flex space-x-2 rounded-md bg-bg-light-secondary dark:bg-gray-900 p-1">
                {personas.map(p => (
                  <button
                    key={p}
                    onClick={() => onPersonaChange(p)}
                    className={`w-full px-3 py-1 text-sm font-medium rounded capitalize transition-colors ${
                      persona === p 
                      ? 'bg-brand-primary text-white shadow' 
                      : 'text-text-light-secondary dark:text-dark-secondary hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-border-light dark:border-border-dark pt-2"></div>
          
          <button
            onClick={onLogout}
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;