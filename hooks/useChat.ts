import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, Persona } from '../types';
import { sendMessageToGemini, resetChatInstance } from '../services/geminiService';
import { Content, Part } from '@google/genai';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  text: "Hello! I'm Eva, your enterprise assistant. I can help with HR policies, IT support, and more. You can also upload a document for summarization or keyword extraction.",
};

const CHAT_HISTORY_KEY = 'enterprise_chat_history';

export const useChat = (persona: Persona) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [INITIAL_MESSAGE];
    } catch (error) {
      console.error("Failed to parse chat history from localStorage:", error);
      return [INITIAL_MESSAGE];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history to localStorage:", error);
    }
  }, [messages]);

  const clearChat = useCallback((silent = false) => {
    const confirmClear = silent ? true : window.confirm("Are you sure you want to clear the chat history? This action cannot be undone.");
    if (confirmClear) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem(CHAT_HISTORY_KEY);
      resetChatInstance();
    }
  }, []);
  
  useEffect(() => {
    // When persona changes, clear the chat to start a new context.
    clearChat(true); 
  }, [persona, clearChat]);


  const sendMessage = useCallback(async (text: string, file?: File) => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { role: 'user', text };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    const historyForApi: Content[] = messages
      .filter(m => m.role === 'user' || m.role === 'model')
      .map(message => ({
        role: message.role,
        parts: [{ text: message.text }],
      }));

    try {
      const responseText = await sendMessageToGemini(persona, historyForApi, text, file);
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages(prevMessages => [...prevMessages, modelMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      const systemMessage: ChatMessage = { role: 'system', text: `Error: ${errorMessage}` };
      setMessages(prevMessages => [...prevMessages, systemMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, persona]);

  return { messages, isLoading, error, sendMessage, clearChat };
};
