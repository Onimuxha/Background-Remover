import { useState, useCallback } from 'react';
import { IconBolt, IconBrandGithub, IconCarambola, IconMessageChatbot, IconUpload } from '@tabler/icons-react';
import { ImageUpload } from './components/ImageUpload';
import { ImageProcessor } from './components/ImageProcessor';
import { ProcessingIndicator } from './components/ProcessingIndicator';
import { DarkModeToggle } from './components/DarkModeToggle';
import { useDarkMode } from './hooks/useDarkMode';
import { createImagePreview } from './utils/imageUtils';
import { removeBackground, initializeBackgroundRemoval } from './utils/backgroundRemoval';
import { ImageData, ProcessingState } from './types';

import { ShootingStars } from "../src/components/ui/shooting-stars";
import { StarsBackground } from "../src/components/ui/stars-background";
import { Highlighter } from './components/ui/highlighter';

function App() {
  const [isDark, setIsDark] = useDarkMode();
  const [imageData, setImageData] = useState<ImageData>({
    original: '',
    processed: null,
    file: null
  });
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: ''
  });
  const [modelInitialized, setModelInitialized] = useState(false);

  const handleImageSelect = useCallback(async (file: File) => {
    try {
      const preview = await createImagePreview(file);
      setImageData({
        original: preview,
        processed: null,
        file
      });

      // Initialize model if not already done
      if (!modelInitialized) {
        setProcessingState({
          isProcessing: true,
          progress: 0,
          stage: 'Initializing AI model...'
        });

        await initializeBackgroundRemoval((stage, progress) => {
          setProcessingState({
            isProcessing: true,
            progress,
            stage
          });
        });

        setModelInitialized(true);
        setProcessingState({
          isProcessing: false,
          progress: 100,
          stage: 'Model ready!'
        });
      }

      // Process the image
      setProcessingState({
        isProcessing: true,
        progress: 0,
        stage: 'Starting background removal...'
      });

      const processedUrl = await removeBackground(preview, (stage, progress) => {
        setProcessingState({
          isProcessing: true,
          progress,
          stage
        });
      });

      setImageData(prev => ({
        ...prev,
        processed: processedUrl
      }));

      setProcessingState({
        isProcessing: false,
        progress: 100,
        stage: 'Complete!'
      });
    } catch (error) {
      console.error('Processing failed:', error);
      setProcessingState({
        isProcessing: false,
        progress: 0,
        stage: 'Processing failed. Please try again.'
      });
      // Don't reset the image data on error, keep showing the original
    }
  }, [modelInitialized]);

  const handleClearImage = useCallback(() => {
    setImageData({
      original: '',
      processed: null,
      file: null
    });
    setProcessingState({
      isProcessing: false,
      progress: 0,
      stage: ''
    });
  }, []);

  const handleReset = useCallback(() => {
    handleClearImage();
  }, [handleClearImage]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <ShootingStars />
        <StarsBackground />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border-b border-white/20 dark:border-gray-700/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-1">
                <img src="/text-white.png" alt="eraser" className="w-12 h-12" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Background Remover
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Powered by me
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <IconBrandGithub className="w-5 h-5" />
                </a>
                <DarkModeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <h1 className="text-4xl md:text-8xl font-semibold text-gray-900 dark:text-white">
                Remove Backgrounds
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Professional background removal powered by AI. Upload any image and get a perfect transparent PNG in seconds.
              <Highlighter action="underline" color="#9333EA">100% private</Highlighter> — <Highlighter action="box" color="#fff">Nothing is stored,</Highlighter> everything runs in your browser.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {[
                { label: 'AI Powered', icon: <IconMessageChatbot className="w-4 h-4" /> },
                { label: 'No Upload Required', icon: <IconUpload className="w-4 h-4" /> },
                { label: 'High Quality', icon: <IconCarambola className="w-4 h-4" /> },
                { label: 'Instant Results', icon: <IconBolt className="w-4 h-4" /> },
              ].map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 shadow-sm"
                >
                  {feature.icon}
                  {feature.label}
                </span>
              ))}
            </div>

          </div>

          {/* Main Interface */}
          <div className="max-w-5xl mx-auto">
            {!imageData.original ? (
              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={imageData.original}
                onClear={handleClearImage}
                isProcessing={processingState.isProcessing}
              />
            ) : (
              <ImageProcessor
                originalImage={imageData.original}
                processedImage={imageData.processed}
                onReset={handleReset}
                isProcessing={processingState.isProcessing}
              />
            )}
          </div>

          {/* Features Section */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: '🔒',
                title: 'Complete Privacy',
                description: 'Your images never leave your device. All processing happens locally in your browser.'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'State-of-the-art AI models optimized for speed. Get results in seconds, not minutes.'
              },
              {
                icon: '🎯',
                title: 'Professional Quality',
                description: 'High-resolution output with perfect edge detection. Perfect for e-commerce and design.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-3xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/30 dark:border-gray-700/30 hover:bg-white/60 dark:hover:bg-gray-700/50 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Built using React, TypeScript, and Transformers.js
            </p>
          </div>
        </footer>
      </div>

      {/* Processing Indicator */}
      <ProcessingIndicator state={processingState} />
    </div>
  );
}

export default App;