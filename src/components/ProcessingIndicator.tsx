import { IconLoader3 } from '@tabler/icons-react';
import { ProcessingState } from '../types';

interface ProcessingIndicatorProps {
  state: ProcessingState;
}

export function ProcessingIndicator({ state }: ProcessingIndicatorProps) {
  if (!state.isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 relative">
              <IconLoader3 size={24} stroke={2} className='animate-spin' />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            Processing Your Image
          </h3>
          
          <p className="text-gray-300 mb-6">
            {state.stage}
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${state.progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
          
          <div className="text-purple-300 font-medium">
            {state.progress}%
          </div>
        </div>
      </div>
    </div>
  );
}