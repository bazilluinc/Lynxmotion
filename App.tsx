import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputBar } from './components/InputBar';
import { VideoCard } from './components/VideoCard';
import { GeneratedVideo } from './types';
import { generateVideo } from './services/geminiService';

const App: React.FC = () => {
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAuthError, setShowAuthError] = useState(false);

  const handleGenerate = async (prompt: string, imageBase64?: string, imageMimeType?: string) => {
    setIsGenerating(true);
    setShowAuthError(false);
    
    // Create a temporary ID and initial state
    const newVideoId = Date.now().toString();
    const newVideo: GeneratedVideo = {
      id: newVideoId,
      prompt,
      status: 'generating',
      timestamp: Date.now(),
      aspectRatio: '16:9', // Defaulting to landscape
      thumbnailUrl: imageBase64 ? `data:${imageMimeType};base64,${imageBase64}` : undefined
    };

    setVideos(prev => [newVideo, ...prev]);

    try {
      const result = await generateVideo({
        prompt,
        imageBase64,
        imageMimeType,
        aspectRatio: '16:9'
      });

      setVideos(prev => prev.map(v => 
        v.id === newVideoId 
          ? { ...v, status: 'completed', videoUrl: result.videoUri } 
          : v
      ));
    } catch (error: any) {
      const errorMessage = error.message || "Generation failed";
      const isAuthError = errorMessage.includes("Requested entity was not found") || errorMessage.includes("404");
      
      if (isAuthError) {
        setShowAuthError(true);
      }

      setVideos(prev => prev.map(v => 
        v.id === newVideoId 
          ? { ...v, status: 'failed', error: errorMessage } 
          : v
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwitchKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      await aistudio.openSelectKey();
      setShowAuthError(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 relative">
      <Header />

      {showAuthError && (
         <div className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-50 animate-in fade-in slide-in-from-top-4">
            <div className="bg-red-500/10 border border-red-500/50 backdrop-blur-md text-red-100 px-6 py-4 rounded-xl shadow-2xl flex flex-col md:flex-row items-center gap-4">
               <div className="flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 <span className="text-sm font-medium">Authentication Failed: Veo model not found (404).</span>
               </div>
               <button 
                 onClick={handleSwitchKey}
                 className="whitespace-nowrap bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-red-600/20"
               >
                 Switch API Key
               </button>
            </div>
         </div>
      )}

      <main className="pt-24 pb-40 px-4 max-w-4xl mx-auto min-h-screen flex flex-col">
        {videos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-60 mt-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-900/50 to-purple-900/50 rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl shadow-indigo-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-neutral-200">Start Creating</h2>
              <p className="text-neutral-500 mt-2 max-w-md">
                Enter a prompt below or upload an image to animate it. <br/>
                Try "A cyberpunk city in the rain" or "A cat flying in space".
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>

      <InputBar onGenerate={handleGenerate} isGenerating={isGenerating} />
    </div>
  );
};

export default App;
