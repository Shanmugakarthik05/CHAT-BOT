import { useState, useCallback, useEffect } from 'react';
import { generateVideoFromImage } from '../services/geminiService';
import { AspectRatio } from '../types';

// FIX: Define an interface for the aistudio object to resolve type conflicts.
interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
}

// FIX: The global declaration of `window.aistudio` was removed to fix a TypeScript error
// where subsequent property declarations were conflicting. Accessing `window.aistudio`
// is now done using a type assertion `(window as any).aistudio` to avoid these conflicts.

export const useVeo = () => {
    const [isKeyReady, setIsKeyReady] = useState(false);
    const [isCheckingKey, setIsCheckingKey] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const checkApiKey = useCallback(async () => {
        setIsCheckingKey(true);
        setError(null);
        try {
            const aistudio = (window as any).aistudio as AIStudio | undefined;
            if (aistudio) {
                const hasKey = await aistudio.hasSelectedApiKey();
                setIsKeyReady(hasKey);
            } else {
                 setIsKeyReady(false);
                 console.warn("AI Studio context is not available.");
            }
        } catch (e) {
            console.error("Error checking for API key:", e);
            setError("Could not verify API key status.");
            setIsKeyReady(false);
        } finally {
            setIsCheckingKey(false);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const openKeySelector = useCallback(async () => {
        try {
            const aistudio = (window as any).aistudio as AIStudio | undefined;
            if (aistudio) {
                await aistudio.openSelectKey();
                // Assume success after dialog opens to avoid race conditions.
                // The next API call will validate the key.
                setIsKeyReady(true);
                setError(null);
            } else {
                 setError("Cannot open API key selector: AI Studio context not available.");
            }
        } catch (e) {
            console.error("Error opening key selector:", e);
            setError("Failed to open the API key selector.");
        }
    }, []);

    const generateVideo = useCallback(async (
        imageFile: File,
        prompt: string,
        aspectRatio: AspectRatio
    ) => {
        setIsGenerating(true);
        setProgressMessage('Preparing your request...');
        setError(null);
        setVideoUrl(null);

        try {
            const url = await generateVideoFromImage({
                imageFile,
                prompt,
                aspectRatio,
                onProgress: setProgressMessage,
            });
            setVideoUrl(url);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            // If the error indicates a bad key, reset the key state to re-trigger the selection prompt.
            if (errorMessage.toLowerCase().includes('api key not valid')) {
                setIsKeyReady(false);
            }
        } finally {
            setIsGenerating(false);
            setProgressMessage('');
        }
    }, []);

    const reset = useCallback(() => {
        setIsGenerating(false);
        setProgressMessage('');
        setVideoUrl(null);
        setError(null);
    }, []);

    return {
        isKeyReady,
        isCheckingKey,
        isGenerating,
        progressMessage,
        videoUrl,
        error,
        checkApiKey,
        openKeySelector,
        generateVideo,
        reset,
    };
};
