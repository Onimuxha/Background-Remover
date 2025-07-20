export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
}

export interface ImageData {
  original: string;
  processed: string | null;
  file: File | null;
}