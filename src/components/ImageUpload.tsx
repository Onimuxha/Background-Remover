import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { isValidImageFile } from '../utils/imageUtils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: string | null;
  onClear: () => void;
  isProcessing: boolean;
}

export function ImageUpload({ onImageSelect, selectedImage, onClear, isProcessing }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(isValidImageFile);
    
    if (imageFile) {
      onImageSelect(imageFile);
    }
  }, [onImageSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidImageFile(file)) {
      onImageSelect(file);
    }
    e.target.value = '';
  }, [onImageSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  if (selectedImage) {
    return (
      <div className="relative group">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-white/20 dark:border-gray-700/30">
          <img
            src={selectedImage}
            alt="Selected"
            className="w-full h-auto max-h-96 object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {!isProcessing && (
          <button
            onClick={onClear}
            className="absolute top-4 right-4 p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative overflow-hidden rounded-3xl transition-all duration-300 cursor-pointer group ${
        isDragOver
          ? 'border-2 border-purple-400 bg-purple-500/20 scale-105'
          : 'border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-400'
      }`}
    >
      <input
        id="image-upload-input"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center justify-center p-12 min-h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 relative">
        <div className="relative mb-6">
          <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
          Upload Your Image
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4 max-w-sm">
          Drag and drop your image here, or click to browse
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>JPG</span>
          <span>•</span>
          <span>PNG</span>
          <span>•</span>
          <span>WEBP</span>
        </div>
      </div>
      
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
    </div>
  );
}