import React, { useState, useRef, useEffect } from 'react';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import Spinner from './Spinner';
import { BoldIcon } from './icons/BoldIcon';
import { ItalicIcon } from './icons/ItalicIcon';
import { AtIcon } from './icons/AtIcon';

// FIX: Define types for the Web Speech API to resolve TypeScript errors.
// The Web Speech API is not yet a standard and types are not included in default TS libs.
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (this: SpeechRecognition, ev: Event) => any;
  onend: (this: SpeechRecognition, ev: Event) => any;
  onerror: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any;
  onresult: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => any;
}

interface MessageInputProps {
  onSend: (text: string, file?: File) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevDisabledRef = useRef<boolean | undefined>(undefined);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSpeechRecognitionSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const resetState = () => {
    setText('');
    setFile(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (prevDisabledRef.current === true && !disabled) {
      resetState();
    }
    prevDisabledRef.current = disabled;
  }, [disabled]);

  const handleSendText = () => {
    if (text.trim() && !disabled) {
      onSend(text);
    }
  };
  
  const handleSendActionWithFile = (actionText: string) => {
    if (file && !disabled) {
      onSend(actionText, file);
    }
  };

  const handleCancelFile = () => {
    setFile(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setText(''); // Clear text when a file is attached
    }
  };
  
  const applyFormatting = (syntax: '**' | '*') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    const newText = 
      text.substring(0, start) + 
      syntax + selectedText + syntax + 
      text.substring(end);

    setText(newText);

    textarea.focus();
    setTimeout(() => {
      textarea.setSelectionRange(start + syntax.length, end + syntax.length);
    }, 0);
  };

  const insertMention = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = text.substring(0, start) + "@" + text.substring(start);
    
    setText(newText);
    
    textarea.focus();
    setTimeout(() => {
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
  };


  const handleToggleRecording = () => {
    if (!isSpeechRecognitionSupported) {
      alert("Voice input is not supported by your browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      // FIX: Cast window to `any` to access non-standard SpeechRecognition properties.
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition: SpeechRecognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
        setText(transcript);
      };

      recognition.start();
    }
  };

  return (
    <div className="bg-bg-light dark:bg-dark-secondary p-3 rounded-lg flex items-center gap-2 border border-border-light dark:border-border-dark focus-within:ring-2 focus-within:ring-brand-accent transition-all">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-full text-text-light-secondary dark:text-dark-secondary hover:bg-bg-light-secondary dark:hover:bg-gray-700 hover:text-text-light-primary dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Attach file"
        disabled={disabled || !!file || isRecording}
      >
        <PaperclipIcon />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.pdf,.docx"
        disabled={disabled}
      />
      
      {file ? (
        <div className="flex-1 flex flex-wrap justify-between items-center gap-2 min-h-[40px]">
            {disabled ? (
              <div className="flex items-center w-full">
                <Spinner />
                <span className="ml-3 text-sm text-text-light-secondary dark:text-dark-secondary truncate" title={file.name}>
                  Analyzing: {file.name}
                </span>
              </div>
            ) : (
              <>
                <div className="text-sm text-text-light-secondary dark:text-dark-secondary truncate" title={file.name}>
                    Attached: <span className="font-medium text-brand-accent">{file.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                    <button 
                        onClick={() => handleSendActionWithFile('Summarize the attached document.')}
                        className="text-xs bg-brand-secondary text-white px-3 py-1.5 rounded-md hover:bg-brand-primary transition-colors"
                    >
                        Summarize Document
                    </button>
                    <button 
                        onClick={() => handleSendActionWithFile('Extract keywords from the attached document.')}
                        className="text-xs bg-brand-secondary text-white px-3 py-1.5 rounded-md hover:bg-brand-primary transition-colors"
                    >
                        Extract Keywords
                    </button>
                    <button 
                        onClick={handleCancelFile}
                        className="p-1 rounded-full text-text-light-secondary dark:text-dark-secondary hover:bg-bg-light-secondary dark:hover:bg-gray-700"
                        aria-label="Remove file"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
              </>
            )}
        </div>
      ) : (
        <>
            <button
              onClick={() => applyFormatting('**')}
              disabled={disabled}
              className="p-2 rounded-full text-text-light-secondary dark:text-dark-secondary hover:bg-bg-light-secondary dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              aria-label="Bold"
            >
              <BoldIcon />
            </button>
            <button
              onClick={() => applyFormatting('*')}
              disabled={disabled}
              className="p-2 rounded-full text-text-light-secondary dark:text-dark-secondary hover:bg-bg-light-secondary dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              aria-label="Italic"
            >
              <ItalicIcon />
            </button>
            <button
              onClick={insertMention}
              disabled={disabled}
              className="p-2 rounded-full text-text-light-secondary dark:text-dark-secondary hover:bg-bg-light-secondary dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              aria-label="Mention user"
            >
              <AtIcon />
            </button>
            <div className="h-6 w-px bg-border-light dark:bg-border-dark mx-1"></div>
            <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRecording ? 'Listening...' : 'Ask Eva about HR, IT, or upload a document...'}
                  className="w-full bg-transparent resize-none focus:outline-none text-text-light-primary dark:text-dark-primary placeholder-text-light-secondary dark:placeholder-dark-secondary"
                  rows={1}
                  disabled={disabled}
                />
            </div>
            {isSpeechRecognitionSupported && (
              <button
                onClick={handleToggleRecording}
                disabled={disabled}
                className={`p-2 rounded-full text-text-light-secondary dark:text-dark-secondary hover:bg-bg-light-secondary dark:hover:bg-gray-700 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                <MicrophoneIcon />
              </button>
            )}
            <button
              onClick={handleSendText}
              disabled={disabled || !text.trim()}
              className="bg-brand-primary p-2 rounded-full text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-brand-secondary transition-colors"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
        </>
      )}
    </div>
  );
};

export default MessageInput;