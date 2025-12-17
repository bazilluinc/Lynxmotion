import React, { useState, useRef, useEffect } from 'react';

interface InputBarProps {
  onGenerate: (prompt: string, imageBase64?: string, imageMimeType?: string) => void;
  isGenerating: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract Base64 data (remove data:image/png;base64, prefix)
        const base64Data = result.split(',')[1];
        
        setSelectedImage({
          base64: base64Data,
          mimeType: file.type,
          preview: result
        });
        setShowAttachMenu(false); // Close menu immediately after selection as requested
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    onGenerate(
      prompt,
      selectedImage?.base64,
      selectedImage?.mimeType
    );

    // Reset state
    setPrompt('');
    setSelectedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-neutral-950 to-transparent z-40">
      <div className="max-w-3xl mx-auto relative">
        
        {/* Drop Up Menu */}
        {showAttachMenu && (
          <div 
            ref={menuRef}
            className="absolute bottom-full left-0 mb-4 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden min-w-[200px] animate-in slide-in-from-bottom-2 fade-in duration-200"
          >
             <div className="p-2">
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-left text-sm text-neutral-300 transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                 </svg>
                 <span>Upload Image</span>
               </button>
             </div>
             {/* Hidden File Input */}
             <input 
               type="file" 
               ref={fileInputRef}
               className="hidden"
               accept="image/*"
               onChange={handleFileChange}
             />
          </div>
        )}

        {/* Selected Image Preview (Above input) */}
        {selectedImage && (
          <div className="mb-3 flex items-start">
            <div className="relative group">
              <img 
                src={selectedImage.preview} 
                alt="Selected" 
                className="h-20 w-20 object-cover rounded-lg border border-indigo-500/50 shadow-lg shadow-indigo-500/20"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-neutral-800 text-white rounded-full p-1 hover:bg-red-500 transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Input Bar */}
        <div className="flex items-end gap-2 bg-neutral-900 border border-neutral-700 rounded-2xl p-2 shadow-lg ring-1 ring-white/5 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
          
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-3 rounded-xl transition-colors ${showAttachMenu ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/5 text-neutral-400 hover:text-neutral-200'}`}
            title="Attach media"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a video you want to generate..."
            className="flex-1 bg-transparent border-0 text-white placeholder-neutral-500 focus:ring-0 resize-none py-3 max-h-32 min-h-[48px]"
            rows={1}
            style={{ height: 'auto' }} // Simple auto-grow could be added, but minimal for now
          />

          <button
            onClick={() => handleSubmit()}
            disabled={!prompt.trim() || isGenerating}
            className={`p-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center
              ${prompt.trim() && !isGenerating 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
          >
             {isGenerating ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
               </svg>
             )}
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-neutral-600">
                Videos are generated using Google's Veo model. Content may be inaccurate or inappropriate.
            </p>
        </div>
      </div>
    </div>
  );
};
