import React, { useCallback } from 'react';
import { IconUpload, IconX } from '@tabler/icons-react';
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
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
          <img
            src={selectedImage}
            alt="Selected"
            className="w-full h-auto max-h-96 object-contain rounded-2xl"
          />
        </div>

        {!isProcessing && (
          <button
            onClick={onClear}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-md"
            aria-label="Remove image"
          >
            <IconX className="w-5 h-5" />
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
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer group border-2 ${
        isDragOver
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400'
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

      <div className="flex flex-col items-center justify-center p-12 min-h-64 bg-gray-50 dark:bg-gray-900 relative">
        <div className="relative mb-6">
          <div className="p-4 rounded-full bg-gray-200 dark:bg-gray-700 transition-transform duration-300 group-hover:scale-105">
            <IconUpload className="w-10 h-10 text-gray-600 dark:text-gray-300" />
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
          Upload Your Image
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-center mb-4 max-w-sm">
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
    </div>
  );
}
