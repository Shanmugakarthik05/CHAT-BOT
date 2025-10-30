import React from 'react';
import WarningIcon from './icons/WarningIcon';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmButtonText 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center transition-opacity" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-bg-light dark:bg-dark-secondary rounded-lg shadow-xl p-6 w-full max-w-sm relative transform transition-all" 
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-4 text-center">
          <WarningIcon />
          <h3 className="text-lg font-semibold text-text-light-primary dark:text-dark-primary">{title}</h3>
          <p className="text-sm text-text-light-secondary dark:text-dark-secondary">{message}</p>
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium rounded-md text-text-light-primary dark:text-dark-primary bg-bg-light-secondary dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-light dark:focus:ring-offset-dark-secondary focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-light dark:focus:ring-offset-dark-secondary focus:ring-red-500"
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;