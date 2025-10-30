
import { GoogleGenAI, Part, Content, Chat } from "@google/genai";
import { Persona } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatInstance: Chat | null = null;
let currentPersona: Persona | null = null;

const getSystemInstruction = (persona: Persona): string => {
  switch (persona) {
    case 'formal':
      return "You are Eva, a professional and formal enterprise assistant. Provide direct and respectful answers. Address the user formally.";
    case 'concise':
      return "You are Eva, an efficient enterprise assistant. Your answers must be as brief and to-the-point as possible. Use bullet points and avoid filler words.";
    case 'friendly':
    default:
      return "You are Eva, a friendly and helpful enterprise assistant. Your tone should be encouraging and approachable. Use conversational language.";
  }
};

const getChat = (persona: Persona, history: Content[]) => {
  if (!chatInstance || currentPersona !== persona) {
    console.log(`Initializing new chat instance for persona: ${persona}`);
    currentPersona = persona;
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(persona),
      },
      history: history,
    });
  }
  return chatInstance;
};

export const resetChatInstance = () => {
  chatInstance = null;
  currentPersona = null;
};

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const sendMessageToGemini = async (
  persona: Persona,
  history: Content[],
  message: string,
  file?: File
): Promise<string> => {
  try {
    const chat = getChat(persona, history);
    
    const messageParts: Part[] = [{ text: message }];
    if (file) {
      messageParts.push(await fileToGenerativePart(file));
    }
    
    // FIX: The `chat.sendMessage` method expects an object with a `message` property, not `parts`.
    const response = await chat.sendMessage({ message: messageParts });
    return response.text;
  } catch (e) {
    console.error("Error calling Gemini API:", e);
    if (e instanceof Error) {
        return `Error: An error occurred while communicating with the AI. ${e.message}`;
    }
    return "Error: An unknown error occurred while communicating with the AI.";
  }
};
