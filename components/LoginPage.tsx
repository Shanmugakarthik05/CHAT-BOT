import React, { useState, FormEvent } from 'react';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, theme, setTheme }) => {
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isCodeSent, setIsCodeSent] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSendCode = (e: FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsCodeSent(true);
      setError('');
    } else {
      setError('Please enter a valid email address.');
    }
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (code === '123456') { // Hardcoded for demo purposes
      onLoginSuccess(email);
    } else {
      setError('Invalid verification code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative">
       <div className="absolute top-4 right-4">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full text-text-light-secondary dark:text-dark-secondary hover:bg-bg-light-secondary dark:hover:bg-gray-700 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
        </div>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-bg-light dark:bg-dark-secondary rounded-lg shadow-lg">
          <div>
            <h2 className="text-3xl font-extrabold text-center text-brand-accent">
              Enterprise Assistant Login
            </h2>
            <p className="mt-2 text-center text-sm text-text-light-secondary dark:text-dark-secondary">
              Secure access for InnovateCorp employees
            </p>
          </div>
          {!isCodeSent ? (
            <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-border-light dark:border-border-dark bg-bg-light-secondary dark:bg-gray-800 text-text-light-primary dark:text-dark-primary placeholder-gray-500 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    placeholder="Enter your corporate email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-800 focus:ring-brand-accent transition-colors duration-200"
                >
                  Send Verification Code
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <p className="text-center text-sm text-green-500 dark:text-green-400">
                A verification code has been sent to {email}.<br/>(Hint: it's 123456)
              </p>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="code" className="sr-only">Verification Code</label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-border-light dark:border-border-dark bg-bg-light-secondary dark:bg-gray-800 text-text-light-primary dark:text-dark-primary placeholder-gray-500 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>
               {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-800 focus:ring-brand-accent transition-colors duration-200"
                >
                  Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;