import { GoogleGenAI, Part, Content, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import { Persona, ChatMessage, AspectRatio } from "../types";
import { searchDocuments } from './documentSearch';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

// NOTE: This instance is for chat and search. Video generation will create its own instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (persona: Persona): string => {
  const baseInstruction = "You are Eva, an enterprise assistant. When answering questions based on provided documents, you MUST cite the title of the source document at the end of your answer in parentheses, like this: (Source: [Document Title]).";
  
  switch (persona) {
    case 'formal':
      return `${baseInstruction} Your persona is professional and formal. Provide direct and respectful answers. Address the user formally.`;
    case 'concise':
      return `${baseInstruction} Your persona is efficient. Your answers must be as brief and to-the-point as possible. Use bullet points and avoid filler words.`;
    case 'friendly':
    default:
      return `${baseInstruction} Your persona is friendly and helpful. Your tone should be encouraging and approachable. Use conversational language.`;
  }
};


const searchFunctionDeclaration: FunctionDeclaration = {
  name: 'search_company_documents',
  description: 'Searches company policies and documents (e.g., HR, IT, General) to answer user questions about internal company information.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The user\'s question or search query about company policies.',
      },
    },
    required: ['query'],
  },
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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const sendMessageToGemini = async (
  persona: Persona,
  history: ChatMessage[],
  message: string,
  file: File | undefined,
  isThinkingMode: boolean,
  onSearching?: () => void
): Promise<string> => {
  try {
    const modelName = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const modelConfig = {
      systemInstruction: getSystemInstruction(persona),
      tools: [{ functionDeclarations: [searchFunctionDeclaration] }],
      ...(isThinkingMode && { thinkingConfig: { thinkingBudget: 32768 } }),
    };

    const historyForApi: Content[] = history
      .filter(m => m.role === 'user' || m.role === 'model') // Exclude system messages from history
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

    const messageParts: Part[] = [{ text: message }];
    if (file) {
      messageParts.push(await fileToGenerativePart(file));
    }
    const userMessageContent: Content = { role: 'user', parts: messageParts };

    // First API call to see if the model wants to use a tool
    const initialResponse: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: [...historyForApi, userMessageContent],
      config: modelConfig,
    });
    
    const functionCalls = initialResponse.functionCalls;

    if (functionCalls && functionCalls.length > 0 && functionCalls[0].name === 'search_company_documents') {
      onSearching?.(); // Notify the UI that we are searching
      
      const functionCall = functionCalls[0];
      const searchQuery = functionCall.args.query;
      const searchResults = searchDocuments(searchQuery);

      let searchResultsText = "No relevant documents found.";
      if (searchResults.length > 0) {
        searchResultsText = "Found the following relevant document excerpts:\n\n" + 
          searchResults.map(r => `Document: ${r.title}\nContent: ${r.content}`).join('\n\n---\n\n');
      }

      const toolResponsePart: Part = {
          functionResponse: {
            name: 'search_company_documents',
            response: {
              content: searchResultsText,
            },
          },
        };
      
      const modelFunctionCallContent = initialResponse.candidates?.[0]?.content;
      if (!modelFunctionCallContent) {
          throw new Error("Could not get model content from function call response");
      }

      // Second API call with the search results
      const finalResponse: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: [
            ...historyForApi, 
            userMessageContent, 
            modelFunctionCallContent, 
            { role: 'user', parts: [toolResponsePart] }
        ],
        config: modelConfig,
      });
      
      return finalResponse.text;
    } else {
      // No function call, just return the direct response
      return initialResponse.text;
    }

  } catch (e) {
    console.error("Error calling Gemini API:", e);
    if (e instanceof Error) {
        return `Error: An error occurred while communicating with the AI. ${e.message}`;
    }
    return "Error: An unknown error occurred while communicating with the AI.";
  }
};

export const generateVideoFromImage = async ({
  imageFile,
  prompt,
  aspectRatio,
  onProgress,
}: {
  imageFile: File;
  prompt: string;
  aspectRatio: AspectRatio;
  onProgress: (message: string) => void;
}): Promise<string> => {
  // Create a new instance right before the call to ensure the latest API key is used.
  const videoGenAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Image = await fileToBase64(imageFile);

  try {
    onProgress('Starting video generation... this may take a few minutes.');
    let operation = await videoGenAI.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: base64Image,
        mimeType: imageFile.type,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio,
      },
    });

    onProgress('Your request is being processed. Checking status...');
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
      onProgress('Still processing... your video is being created.');
      operation = await videoGenAI.operations.getVideosOperation({ operation: operation });
    }

    onProgress('Video generated! Fetching the file...');
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation succeeded, but no download link was found.");
    }

    // The API key must be appended to the download URI.
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download the video file. Status: ${videoResponse.status}`);
    }
    const videoBlob = await videoResponse.blob();
    onProgress('Done!');
    return URL.createObjectURL(videoBlob);
  } catch (error) {
    console.error("Error during video generation:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("Your API Key is not valid. Please select a new one and try again.");
    }
    throw error;
  }
};