import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVeo } from '../hooks/useVeo';
import { AspectRatio } from '../types';
import CloseIcon from './icons/CloseIcon';
import Spinner from './Spinner';
import VideoIcon from './icons/VideoIcon';

interface VideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: File | null;
  initialPrompt?: string;
}

const VideoGeneratorModal: React.FC<VideoGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialImage,
  initialPrompt,
}) => {
  const {
    isKeyReady,
    isCheckingKey,
    isGenerating,
    progressMessage,
    videoUrl,
    error,
    openKeySelector,
    generateVideo,
    reset,
  } = useVeo();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (initialImage) {
      setImageFile(initialImage);
    }
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialImage, initialPrompt]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      reset();
      setImageFile(null);
      setPreviewUrl(null);
      setPrompt('');
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleGenerateClick = () => {
    if (imageFile && isKeyReady) {
      generateVideo(imageFile, prompt, aspectRatio);
    }
  };

  const handleTryAgain = () => {
    reset();
    if(initialImage) setImageFile(initialImage);
  };
  
  if (!isOpen) return null;

  const renderContent = () => {
    if (isCheckingKey) {
      return (
        <div className="text-center p-8">
          <Spinner />
          <p className="mt-4 text-text-light-secondary dark:text-dark-secondary">
            Checking API key status...
          </p>
        </div>
      );
    }

    if (!isKeyReady) {
      return (
        <div className="text-center p-8 space-y-4">
          <h3 className="text-lg font-semibold text-text-light-primary dark:text-dark-primary">
            API Key Required for Video Generation
          </h3>
          <p className="text-sm text-text-light-secondary dark:text-dark-secondary">
            The Veo video generation model requires you to select your own API key. This is a mandatory step. Please ensure your key is enabled for the 'Generative Language API'.
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
           <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-brand-accent hover:underline">
              Learn about billing
            </a>
          <button
            onClick={openKeySelector}
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Select API Key
          </button>
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div className="text-center p-8 space-y-4">
          <Spinner />
          <h3 className="text-lg font-semibold text-text-light-primary dark:text-dark-primary">
            Generating Your Video...
          </h3>
          <p className="text-sm text-text-light-secondary dark:text-dark-secondary min-h-[40px]">
            {progressMessage}
          </p>
          <p className="text-xs text-text-light-secondary dark:text-dark-secondary pt-4">
            This process can take several minutes. Please keep this window open.
          </p>
        </div>
      );
    }

    if (error) {
        return (
            <div className="text-center p-8 space-y-4">
                <h3 className="text-lg font-semibold text-red-500">Generation Failed</h3>
                <p className="text-sm bg-red-900 bg-opacity-40 text-red-200 p-3 rounded-md">{error}</p>
                <button
                    onClick={handleTryAgain}
                    className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (videoUrl) {
      return (
        <div className="space-y-4 p-4">
          <h3 className="text-lg font-semibold text-text-light-primary dark:text-dark-primary text-center">Your Video is Ready!</h3>
          <video src={videoUrl} controls autoPlay loop className="w-full rounded-md" />
          <button
            onClick={handleTryAgain}
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Generate Another Video
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-1">1. Upload Image</label>
          <div 
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-light dark:border-border-dark border-dashed rounded-md cursor-pointer hover:border-brand-accent"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-48 rounded-md" />
            ) : (
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                    <p className="text-sm text-text-light-secondary dark:text-dark-secondary">Click to upload an image</p>
                </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
        </div>
         <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-text-light-primary dark:text-dark-primary">2. Describe the video (optional)</label>
          <textarea
            id="prompt"
            rows={3}
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm bg-bg-light-secondary dark:bg-gray-800 focus:border-brand-accent focus:ring-brand-accent sm:text-sm"
            placeholder="e.g., A futuristic city skyline at sunset"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div>
            <label className="block text-sm font-medium text-text-light-primary dark:text-dark-primary mb-2">3. Select Aspect Ratio</label>
             <div className="flex space-x-2 rounded-md bg-bg-light-secondary dark:bg-gray-900 p-1">
                {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                    <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`w-full px-3 py-2 text-sm font-medium rounded transition-colors ${
                        aspectRatio === ratio 
                        ? 'bg-brand-primary text-white shadow' 
                        : 'text-text-light-secondary dark:text-dark-secondary hover:bg-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        {ratio === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                    </button>
                ))}
             </div>
        </div>
        <button
          onClick={handleGenerateClick}
          disabled={!imageFile}
          className="w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <VideoIcon className="h-5 w-5" />
          Generate Video
        </button>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-bg-light dark:bg-dark-secondary rounded-lg shadow-xl w-full max-w-lg relative transform transition-all"
        onClick={e => e.stopPropagation()}
      >
         <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
            <h2 className="text-xl font-semibold text-text-light-primary dark:text-dark-primary">
                Create Video with Veo
            </h2>
            <button
                onClick={onClose}
                className="p-1 rounded-full text-text-light-secondary dark:text-dark-secondary hover:bg-bg-light-secondary dark:hover:bg-gray-700"
                aria-label="Close video generator"
            >
                <CloseIcon />
            </button>
         </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default VideoGeneratorModal;
