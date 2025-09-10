import React, { useState, useEffect } from 'react';
import { generateImage, AspectRatio } from '../services/geminiService';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ImageIcon } from './icons/ImageIcon';
import { SquareIcon } from './icons/SquareIcon';
import { WidescreenIcon } from './icons/WidescreenIcon';
import { PortraitIcon } from './icons/PortraitIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageGeneratorProps {
  username: string;
  onNavigate: (view: 'chat') => void;
}

type ImageHistoryItem = {
    id: string;
    prompt: string;
    imageDataUrl: string;
    aspectRatio: AspectRatio;
};

const LoadingSpinner: React.FC = () => (
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
    <div className="w-16 h-16 border-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-white font-semibold">...جاري إنشاء التحفة الفنية</p>
  </div>
);

const aspectRatiosMap: { [key in AspectRatio]: { label: string; icon: React.FC, className: string } } = {
    '1:1': { label: 'مربع', icon: SquareIcon, className: 'aspect-square' },
    '16:9': { label: 'شاشة عريضة', icon: WidescreenIcon, className: 'aspect-video' },
    '9:16': { label: 'طولي', icon: PortraitIcon, className: 'aspect-[9/16]' },
};

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ username, onNavigate }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  
  const storageKey = `lorzz-image-history-${username}`;

  useEffect(() => {
    if (!username) return;
    try {
      const savedHistory = localStorage.getItem(storageKey);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to load image history from localStorage", error);
    }
  }, [username, storageKey]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Data = await generateImage(prompt, aspectRatio);
      const imageDataUrl = `data:image/jpeg;base64,${base64Data}`;
      setGeneratedImage(imageDataUrl);

      const newItem: ImageHistoryItem = {
        id: `history-${Date.now()}`,
        prompt,
        imageDataUrl,
        aspectRatio,
      };
      
      const updatedHistory = [newItem, ...history].slice(0, 50); // Keep max 50 items
      setHistory(updatedHistory);
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory));

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectHistoryItem = (item: ImageHistoryItem) => {
    setGeneratedImage(item.imageDataUrl);
    setPrompt(item.prompt);
    setAspectRatio(item.aspectRatio);
    setError(null);
    setIsHistoryVisible(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="flex h-screen flex-col text-gray-200 bg-gray-900 relative overflow-hidden">
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-cyan-500/20 shadow-lg shadow-purple-500/10 backdrop-blur-lg z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Lorzz Image
          </h1>
          <span className="text-sm text-gray-400 hidden sm:inline">مولّد الصور بالذكاء الاصطناعي</span>
        </div>
        <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryVisible(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-300 hover:bg-white/10 hover:text-cyan-300 transition-colors"
              aria-label="عرض السجل"
            >
                <HistoryIcon />
                <span className="hidden sm:inline">السجل</span>
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-300 hover:bg-white/10 hover:text-cyan-300 transition-colors"
              aria-label="العودة للدردشة"
            >
              <span className="hidden sm:inline">العودة للدردشة</span>
              <ArrowRightIcon />
            </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-auto">
        <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center">
            <div className={`w-full max-w-full ${aspectRatiosMap[aspectRatio].className} bg-black/30 rounded-2xl border-2 border-dashed border-cyan-500/30 flex items-center justify-center relative overflow-hidden transition-all duration-300`}>
                {isLoading && <LoadingSpinner />}
                {error && !isLoading && (
                    <div className="text-center text-red-400 p-4">
                        <XCircleIcon className="mx-auto h-12 w-12" />
                        <p className="mt-2 font-semibold">فشل إنشاء الصورة</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {generatedImage && !isLoading && (
                    <>
                        <img src={generatedImage} alt={prompt} className="w-full h-full object-contain" />
                        <a
                            href={generatedImage}
                            download={`lorzz-image-${Date.now()}.jpeg`}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-opacity"
                            aria-label="تنزيل الصورة"
                        >
                            <DownloadIcon />
                        </a>
                    </>
                )}
                {!generatedImage && !isLoading && !error && (
                    <div className="text-center text-gray-500 p-4">
                        <ImageIcon className="mx-auto h-16 w-16" />
                        <p className="mt-4 font-semibold">ستظهر صورتك هنا</p>
                        <p className="text-sm">اكتب وصفاً أدناه ودع السحر يبدأ</p>
                    </div>
                )}
            </div>

            <div className="w-full max-w-md my-6">
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 text-center">نسبة العرض إلى الارتفاع</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(Object.keys(aspectRatiosMap) as AspectRatio[]).map((ratio) => {
                                const { label, icon: Icon } = aspectRatiosMap[ratio];
                                const isActive = aspectRatio === ratio;
                                return (
                                    <button
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        disabled={isLoading}
                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                                            isActive 
                                                ? 'bg-cyan-500/20 border-cyan-400 text-white' 
                                                : 'bg-black/30 border-cyan-500/30 text-gray-400 hover:bg-cyan-500/10 hover:border-cyan-500/80 disabled:opacity-50'
                                        }`}
                                        aria-pressed={isActive}
                                    >
                                        <Icon />
                                        <span className="text-sm font-medium">{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>

      <footer className="p-4 flex-shrink-0 bg-transparent backdrop-blur-lg z-10">
        <form onSubmit={handleGenerate} className="w-full max-w-3xl mx-auto bg-black/50 border border-cyan-500/20 flex items-center p-2 gap-2 rounded-lg">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: قط رائد فضاء يركب دراجة نارية على سطح المريخ، بأسلوب فني..."
            className="flex-1 bg-transparent px-2 py-2 text-white placeholder-gray-400 focus:outline-none resize-none h-12"
            rows={1}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="p-3 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-500/80 dark:hover:bg-cyan-400/90 disabled:bg-cyan-800/50 dark:disabled:bg-cyan-500/20 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_10px_theme(colors.cyan.500)] flex items-center gap-2"
          >
            <SparklesIcon />
            <span className="font-bold">تخيل</span>
          </button>
        </form>
      </footer>
      
      {/* History Panel */}
      <aside className={`absolute top-0 right-0 h-full w-full max-w-sm bg-gray-900/80 backdrop-blur-lg border-l border-cyan-500/20 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out flex flex-col ${isHistoryVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 flex-shrink-0">
            <h3 className="text-lg font-bold text-white">السجل</h3>
            <button onClick={() => setIsHistoryVisible(false)} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10">
                <XCircleIcon />
            </button>
        </div>
        
        {history.length > 0 ? (
            <>
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        {history.map(item => (
                            <div key={item.id} className="relative group cursor-pointer" onClick={() => handleSelectHistoryItem(item)}>
                                <img src={item.imageDataUrl} alt={item.prompt} className={`w-full object-cover rounded-lg border-2 border-transparent group-hover:border-cyan-400 transition-all ${item.aspectRatio === '1:1' ? 'aspect-square' : item.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`} />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                    <p className="text-xs text-white text-center line-clamp-3">{item.prompt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-cyan-500/20 flex-shrink-0">
                    <button onClick={handleClearHistory} className="w-full py-2 px-4 bg-red-600/30 text-red-300 hover:bg-red-600/50 hover:text-white rounded-lg transition-colors text-sm font-semibold">
                        مسح السجل
                    </button>
                </div>
            </>
        ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-4">
                <HistoryIcon />
                <p className="mt-4 font-semibold">لا يوجد سجل حتى الآن</p>
                <p className="text-sm">ستظهر الصور التي تنشئها هنا.</p>
            </div>
        )}
      </aside>
    </div>
  );
};

export default ImageGenerator;