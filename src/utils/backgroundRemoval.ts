import { pipeline, env, RawImage } from '@xenova/transformers';

// Allow loading remote models (disable local model fallback)
env.allowRemoteModels = true;
env.allowLocalModels = false;

let backgroundRemovalPipeline: any = null;

// Initialize the background removal model pipeline
export async function initializeBackgroundRemoval(
  onProgress?: (stage: string, progress: number) => void
) {
  if (backgroundRemovalPipeline) return backgroundRemovalPipeline;

  try {
    onProgress?.('Initializing AI model...', 10);

    backgroundRemovalPipeline = await pipeline(
      'image-segmentation',
      'Xenova/segformer_b2_clothes',
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

    onProgress?.('Model loaded successfully!', 100);
    return backgroundRemovalPipeline;
  } catch (error) {
    console.error('Failed to initialize background removal:', error);
    throw new Error('Failed to load AI model. Please check your internet connection.');
  }
}

// Helper to load an HTMLImageElement from URL
function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Needed for CORS
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// ✅ Main function to remove background and return transparent PNG data URL
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

    onProgress?.('Generating transparent image...', 70);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imgEl.width;
    canvas.height = imgEl.height;

    if (result && result.length > 0) {
      let personMask = null;
      let maxArea = 0;

      // Select the largest foreground object
      for (const segment of result) {
        if (segment.label !== 'background') {
          const area = segment.mask.width * segment.mask.height;
          if (area > maxArea) {
            maxArea = area;
            personMask = segment.mask;
          }
        }
      }

      if (personMask) {
        // Draw the original image
        ctx.drawImage(imgEl, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Create and draw the raw mask
        const maskCanvas = document.createElement('canvas');
        const maskCtx = maskCanvas.getContext('2d')!;
        maskCanvas.width = personMask.width;
        maskCanvas.height = personMask.height;

        const maskImageData = maskCtx.createImageData(personMask.width, personMask.height);
        const maskData = maskImageData.data;

        for (let i = 0; i < personMask.data.length; i++) {
          const pixelIndex = i * 4;
          const value = personMask.data[i] * 255;
          maskData[pixelIndex] = value;
          maskData[pixelIndex + 1] = value;
          maskData[pixelIndex + 2] = value;
          maskData[pixelIndex + 3] = 255;
        }

        maskCtx.putImageData(maskImageData, 0, 0);

        // Resize and blur the mask to feather edges
        const resizedMaskCanvas = document.createElement('canvas');
        const resizedMaskCtx = resizedMaskCanvas.getContext('2d')!;
        resizedMaskCanvas.width = canvas.width;
        resizedMaskCanvas.height = canvas.height;

        resizedMaskCtx.filter = 'blur(2px)';
        resizedMaskCtx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
        resizedMaskCtx.filter = 'none';

        const resizedMaskData = resizedMaskCtx.getImageData(0, 0, canvas.width, canvas.height);

        // ✅ Apply the inverted + smoothed alpha mask
        for (let i = 0; i < data.length; i += 4) {
          let maskVal = resizedMaskData.data[i] / 255;
          maskVal = Math.pow(1 - maskVal, 1.5); // stronger fade near edge
          data[i + 3] = Math.round(data[i + 3] * maskVal);

        }

        ctx.putImageData(imageData, 0, 0);
      } else {
        throw new Error('No foreground object detected in the image');
      }
    } else {
      throw new Error('No segmentation results returned');
    }

    onProgress?.('Finalizing...', 90);
    const resultUrl = canvas.toDataURL('image/png');
    onProgress?.('Complete!', 100);

    return resultUrl;
  } catch (error) {
    console.error('Background removal failed:', error);
    throw new Error('Failed to remove background. Please try again.');
  }
}
