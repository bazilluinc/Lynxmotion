import React, { useState } from 'react';
import { ApiKeyGate } from './components/ApiKeyGate';
import { Header } from './components/Header';
import { InputBar } from './components/InputBar';
import { VideoCard } from './components/VideoCard';
import { GeneratedVideo } from './types';
import { generateVideo } from './services/geminiService';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Scroll to bottom helper could be added here if needed, 
  // but standard reversed list (newest first) works well for this.

  const handleGenerate = async (prompt: string, imageBase64?: string, imageMimeType?: string) => {
    setIsGenerating(true);
    
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
    } catch (error) {
      setVideos(prev => prev.map(v => 
        v.id === newVideoId 
          ? { ...v, status: 'failed', error: 'Generation failed' } 
          : v
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasApiKey) {
    return <ApiKeyGate onKeySelected={() => setHasApiKey(true)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      <Header />

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
