import React, { useState, useCallback } from 'react';
import { Scissors, Sparkles, Github } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { ImageProcessor } from './components/ImageProcessor';
import { ProcessingIndicator } from './components/ProcessingIndicator';
import { DarkModeToggle } from './components/DarkModeToggle';
import { useDarkMode } from './hooks/useDarkMode';
import { createImagePreview } from './utils/imageUtils';
import { removeBackground, initializeBackgroundRemoval } from './utils/backgroundRemoval';
import { ImageData, ProcessingState } from './types';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 dark:bg-cyan-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-10 animate-pulse animation-delay-4000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border-b border-white/20 dark:border-gray-700/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    AI Background Remover
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Powered by Machine Learning
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
                  <Github className="w-5 h-5" />
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
              <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                Remove Backgrounds
              </h2>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Professional background removal powered by AI. Upload any image and get a perfect transparent PNG in seconds. 
              <span className="text-purple-600 dark:text-purple-400 font-semibold"> 100% private</span> - everything runs in your browser.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['AI Powered', 'No Upload Required', 'High Quality', 'Instant Results'].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 rounded-full bg-white/20 dark:bg-gray-800/40 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {feature}
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
        <footer className="mt-20 py-8 border-t border-white/20 dark:border-gray-700/30 bg-white/10 dark:bg-gray-900/30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Built with ❤️ using React, TypeScript, and Transformers.js
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