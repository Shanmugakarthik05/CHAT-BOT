
import React from 'react';
import BotIcon from './icons/BotIcon';
import Spinner from './Spinner';
import SearchIcon from './icons/SearchIcon';

const SearchingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center">
        <BotIcon />
      </div>
      <div className="max-w-xl p-3 rounded-lg shadow bg-bg-light-secondary dark:bg-dark-secondary rounded-bl-none">
        <div className="flex items-center gap-2 text-sm text-text-light-secondary dark:text-dark-secondary">
          <SearchIcon />
          <span>Eva is searching the knowledge base...</span>
          <Spinner />
        </div>
      </div>
    </div>
  );
};

export default SearchingIndicator;
