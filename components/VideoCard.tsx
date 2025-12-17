import React, { useEffect, useState } from 'react';
import { GeneratedVideo } from '../types';
import { fetchVideoBlob } from '../services/geminiService';

interface VideoCardProps {
  video: GeneratedVideo;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingBlob, setLoadingBlob] = useState(false);

  useEffect(() => {
    let active = true;

    if (video.status === 'completed' && video.videoUrl && !blobUrl) {
      setLoadingBlob(true);
      fetchVideoBlob(video.videoUrl)
        .then((url) => {
          if (active) {
            setBlobUrl(url);
            setLoadingBlob(false);
          }
        })
        .catch((err) => {
          console.error("Failed to load video blob", err);
          if (active) setLoadingBlob(false);
        });
    }

    return () => {
      active = false;
    };
  }, [video.status, video.videoUrl, blobUrl]);

  const isPortrait = video.aspectRatio === '9:16';

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
          AI
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-200">
             {video.prompt}
          </p>
          <div className="mt-1 flex items-center gap-2">
             <span className={`text-xs px-1.5 py-0.5 rounded ${video.status === 'completed' ? 'bg-green-500/20 text-green-400' : video.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {video.status.toUpperCase()}
             </span>
             <span className="text-xs text-neutral-500">
               {new Date(video.timestamp).toLocaleTimeString()}
             </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`relative bg-black flex items-center justify-center ${isPortrait ? 'aspect-[9/16] max-h-[600px]' : 'aspect-video'}`}>
        
        {video.status === 'completed' && blobUrl ? (
          <video 
            src={blobUrl} 
            controls 
            autoPlay 
            loop 
            className="w-full h-full object-contain"
          />
        ) : video.status === 'failed' ? (
           <div className="text-center p-8">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
             <p className="text-neutral-400 text-sm">Generation failed. Please try again.</p>
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-8 space-y-4">
             {video.thumbnailUrl && (
                <div className="absolute inset-0 w-full h-full">
                   <img src={video.thumbnailUrl} alt="Reference" className="w-full h-full object-cover opacity-30 blur-sm" />
                   <div className="absolute inset-0 bg-black/50" />
                </div>
             )}
             <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-400 font-medium animate-pulse">Dreaming up your video...</p>
                <p className="text-neutral-500 text-xs mt-2">This may take a minute or two.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
