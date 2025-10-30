import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, Persona } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { Content, Part } from '@google/genai';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  text: "Hello! I'm Eva, your enterprise assistant. I can help with HR policies, IT support, and more. Ask me a question about our company policies or upload a document for analysis.",
};

const CHAT_HISTORY_KEY = 'enterprise_chat_history';

export const useChat = (persona: Persona, isThinkingMode: boolean) => {
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
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history to localStorage:", error);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }, []);
  
  useEffect(() => {
    // When persona changes, clear the chat to start a new context.
    clearChat(); 
  }, [persona, clearChat]);


  const sendMessage = useCallback(async (text: string, file?: File) => {
    setIsLoading(true);
    setIsSearching(false);
    setError(null);

    const userMessage: ChatMessage = { role: 'user', text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Pass the history *before* the new user message to the API
    const historyForApi = messages;

    try {
      const responseText = await sendMessageToGemini(
        persona, 
        historyForApi, 
        text, 
        file,
        isThinkingMode, 
        () => { setIsSearching(true); }
      );
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages(prevMessages => [...prevMessages, modelMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      const systemMessage: ChatMessage = { role: 'system', text: `Error: ${errorMessage}` };
      setMessages(prevMessages => [...prevMessages, systemMessage]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [messages, persona, isThinkingMode]);

  return { messages, isLoading, isSearching, error, sendMessage, clearChat };
};