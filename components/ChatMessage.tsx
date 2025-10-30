import React from 'react';
import { ChatMessage as Message } from '../types';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';

// A simple parser to convert markdown-like syntax to React elements.
const parseAndRenderText = (text: string): React.ReactNode => {
  // Regex to match **bold**, *italic*, and @mentions
  const regex = /(\*\*(?:[^*]+?)\*\*|\*(?:[^*]+?)\*|@\w+)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('@')) {
      return (
        <span key={index} className="bg-brand-secondary bg-opacity-20 text-brand-accent dark:text-blue-300 font-medium rounded px-1 py-0.5">
          {part}
        </span>
      );
    }
    return part; // Plain text
  });
};


interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isModel = message.role === 'model';
  const isSystem = message.role === 'system';

  const containerClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : ''}`;
  
  const bubbleClasses = `max-w-xl p-3 rounded-lg shadow ${
    isUser
      ? 'bg-brand-primary text-white rounded-br-none'
      : isModel
      ? 'bg-bg-light-secondary dark:bg-dark-secondary text-text-light-primary dark:text-dark-primary rounded-bl-none'
      : 'bg-red-900 bg-opacity-50 text-red-200 w-full text-center'
  }`;

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className={bubbleClasses}>
          <p className="text-sm">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center">
            <BotIcon />
        </div>
      )}
      <div className={bubbleClasses}>
        <div className="text-sm whitespace-pre-wrap">{parseAndRenderText(message.text)}</div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 dark:bg-gray-600 flex items-center justify-center">
            <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;