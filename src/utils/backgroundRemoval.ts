import { pipeline, env, RawImage } from '@xenova/transformers';

// Make sure remote model loading is allowed
env.allowRemoteModels = true;
env.allowLocalModels = false;

let backgroundRemovalPipeline: any = null;

// Public model that works without authentication
const MODEL_ID = 'Xenova/segformer_b2_clothes';

// Initialize the background removal pipeline
export async function initializeBackgroundRemoval(
  onProgress?: (stage: string, progress: number) => void
) {
  if (backgroundRemovalPipeline) return backgroundRemovalPipeline;

  onProgress?.('Initializing AI model...', 10);

  backgroundRemovalPipeline = await pipeline(
    'image-segmentation',
    MODEL_ID,
    {
      quantized: false,
      progress_callback: (progress: any) => {
        if (progress.status === 'downloading') {
          const percent = Math.round((progress.loaded / progress.total) * 80) + 10;
          onProgress?.('Downloading model...', percent);
        } else if (progress.status === 'ready') {
          onProgress?.('Model ready!', 90);
        }
      }
    }
  );

  onProgress?.('Model loaded!', 100);
  return backgroundRemovalPipeline;
}

// Load an image from a URL
function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // allow CORS
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Main background removal function
export async function removeBackground(
  imageUrl: string,
  onProgress?: (stage: string, progress: number) => void
): Promise<string> {
  try {
    onProgress?.('Preparing image...', 0);

    const imgEl = await loadImageElement(imageUrl);
    const rawImg = await RawImage.fromURL(imageUrl);

    if (!backgroundRemovalPipeline) {
      await initializeBackgroundRemoval(onProgress);
    }

    onProgress?.('Processing image...', 20);
    const result = await backgroundRemovalPipeline(rawImg);

    onProgress?.('Cleaning up edges...', 70);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imgEl.width;
    canvas.height = imgEl.height;

    if (result && result.length > 0) {
      let mainMask = null;
      let maxArea = 0;

      for (const segment of result) {
        if (segment.label !== 'background') {
          const area = segment.mask.width * segment.mask.height;
          if (area > maxArea) {
            maxArea = area;
            mainMask = segment.mask;
          }
        }
      }

      if (!mainMask) throw new Error('No foreground object found.');

      // Draw the original image
      ctx.drawImage(imgEl, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Create raw mask
      const maskCanvas = document.createElement('canvas');
      const maskCtx = maskCanvas.getContext('2d')!;
      maskCanvas.width = mainMask.width;
      maskCanvas.height = mainMask.height;

      const maskImageData = maskCtx.createImageData(mainMask.width, mainMask.height);
      const maskData = maskImageData.data;

      for (let i = 0; i < mainMask.data.length; i++) {
        const value = mainMask.data[i] * 255;
        const idx = i * 4;
        maskData[idx] = value;
        maskData[idx + 1] = value;
        maskData[idx + 2] = value;
        maskData[idx + 3] = 255;
      }

      maskCtx.putImageData(maskImageData, 0, 0);

      // Resize and blur mask for feathered edges
      const resizedMaskCanvas = document.createElement('canvas');
      const resizedMaskCtx = resizedMaskCanvas.getContext('2d')!;
      resizedMaskCanvas.width = canvas.width;
      resizedMaskCanvas.height = canvas.height;

      resizedMaskCtx.filter = 'blur(4px) brightness(1.2)';
      resizedMaskCtx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
      resizedMaskCtx.filter = 'none';

      const resizedMaskData = resizedMaskCtx.getImageData(0, 0, canvas.width, canvas.height);

      // Final alpha mask application
      for (let i = 0; i < data.length; i += 4) {
        let maskVal = resizedMaskData.data[i] / 255;
        maskVal = Math.pow(1 - maskVal, 2.0);
        data[i + 3] = Math.round(data[i + 3] * maskVal);

        if (data[i + 3] < 10) data[i + 3] = 0;
      }

      ctx.putImageData(imageData, 0, 0);
    } else {
      throw new Error('No segmentation results returned.');
    }

    onProgress?.('Exporting...', 90);
    const resultUrl = canvas.toDataURL('image/png');
    onProgress?.('Done!', 100);

    return resultUrl;
  } catch (error) {
    console.error('Background removal failed:', error);
    throw new Error('Failed to remove background. Please try again.');
  }
}
