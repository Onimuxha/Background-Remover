// import React from 'react';
import { IconDownload, IconRotateDot, IconChecks } from '@tabler/icons-react';
import { downloadImage } from '../utils/imageUtils';

interface ImageProcessorProps {
  originalImage: string;
  processedImage: string | null;
  onReset: () => void;
  isProcessing: boolean;
}

export function ImageProcessor({ originalImage, processedImage, onReset, isProcessing }: ImageProcessorProps) {
  const handleDownload = () => {
    if (processedImage) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      downloadImage(processedImage, `background-removed-${timestamp}.png`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Before/After Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="group">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            Original
          </h3>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md border border-white/20 dark:border-gray-700/30">
            <img
              src={originalImage}
              alt="Original"
              className="w-full h-auto max-h-80 object-contain"
            />
          </div>
        </div>

        {/* Processed Image */}
        <div className="group">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${processedImage ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            Background Removed
            {processedImage && <IconChecks className="w-4 h-4 text-green-500" />}
          </h3>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-white/20 dark:border-gray-700/30">
            {processedImage ? (
              <div className="relative">
                {/* Checkered background to show transparency */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                         repeating-conic-gradient(
                           from 0deg,
                           #808080 0deg 90deg,
                           #ffffff 90deg 180deg
                         )
                       `,
                    backgroundSize: '20px 20px'
                  }}
                />
                <img
                  src={processedImage}
                  alt="Background removed"
                  className="relative w-full h-auto max-h-80 object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-400 dark:text-gray-500">
                {isProcessing ? (
                  <div className="text-center">
                    <div className="animate-pulse text-lg">Processing...</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-lg">Processed image will appear here</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {processedImage && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 flex items-center justify-center gap-3"
          >
            <IconDownload className="w-5 h-5 group-hover:animate-bounce" />
            Download PNG

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
          </button>

          <button
            onClick={onReset}
            className="group relative px-8 py-4 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
          >
            <IconRotateDot className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Process Another

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl" />
          </button>
        </div>
      )}

      {/* Show retry button if processing failed */}
      {!processedImage && !isProcessing && (
        <div className="flex justify-center">
          <button
            onClick={onReset}
            className="group relative px-8 py-4 bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/20 dark:border-gray-700/30 hover:bg-white/20 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
          >
            <IconRotateDot className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Try Another Image

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl" />
          </button>
        </div>
      )}
    </div>
  );
}