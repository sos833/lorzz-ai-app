import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { ChatMessage } from '../types';
import { SendIcon } from './icons/SendIcon';
import { LinkIcon } from './icons/LinkIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ImageIcon } from './icons/ImageIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface ChatScreenProps {
  username: string;
  onNavigate: (view: 'image') => void;
  onLogout: () => void;
}

const UserAvatar: React.FC<{ name: string }> = ({ name }) => {
    const isAI = name === 'Lorzz AI';
    const initial = isAI ? 'L' : name.charAt(0).toUpperCase();
    const glowClass = isAI ? 'ring-cyan-400 shadow-[0_0_10px_theme(colors.cyan.400)]' : 'ring-green-400 shadow-[0_0_10px_theme(colors.green.400)]';

    return (
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl bg-gray-500 dark:bg-black/50 ring-2 ${glowClass}`}>
            {initial}
        </div>
    );
};


const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const { text, sender, timestamp, isStreaming, sources, file } = message;
    const isAI = sender === 'Lorzz AI';
    const messageBubbleClass = isAI 
        ? 'bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-cyan-500/30' 
        : 'bg-green-100 dark:bg-gray-800/50';

    return (
        <div className="flex items-start gap-4 p-4">
            <UserAvatar name={sender} />
            <div className="flex-1">
                <div className="flex items-baseline gap-2">
                    <span className={`font-bold ${isAI ? 'text-cyan-500 dark:text-cyan-300' : 'text-green-500 dark:text-green-300'}`}>{sender}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(timestamp).toLocaleTimeString()}</span>
                </div>
                
                <div className={`mt-2 p-4 rounded-lg rounded-tl-none ${messageBubbleClass}`}>
                  {file && (
                      <div className="mb-2">
                          {file.url ? (
                            <img src={file.url} alt={file.name} className="max-w-xs max-h-64 rounded-lg border border-gray-300 dark:border-gray-700" />
                          ) : (
                            <div className="p-3 bg-gray-200 dark:bg-black/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-cyan-500/20">
                              <p className="font-semibold">مرفق محفوظ:</p>
                              <p className="truncate">{file.name}</p>
                            </div>
                          )}
                      </div>
                  )}
                  
                  {text && (
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {text}
                          {isStreaming && <span className="inline-block w-2.5 h-5 ml-1 bg-cyan-400 animate-pulse rounded-full"></span>}
                      </p>
                  )}
                </div>
                
                {sources && sources.length > 0 && (
                    <div className="mt-3">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">المصادر</h4>
                        <div className="flex flex-col space-y-2">
                            {sources.map((source, index) => (
                                <a
                                    key={index}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 hover:underline flex items-center gap-2 transition-colors"
                                    aria-label={`Source: ${source.title}`}
                                >
                                    <LinkIcon />
                                    <span className="truncate">{source.title}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatScreen: React.FC<ChatScreenProps> = ({ username, onNavigate, onLogout }) => {
  const { messages, sendMessage, isLoading } = useChat(username);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, toggleRecording, isSpeechRecognitionSupported, error: speechError, clearError: clearSpeechError } = useSpeechRecognition(setInput);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || file) {
      sendMessage(input, file);
      setInput('');
      removeFile();
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <div className="flex h-screen text-gray-800 dark:text-gray-200 relative">
      
      {speechError && (
        <div
          className="absolute top-20 right-4 max-w-sm w-full bg-red-100 dark:bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-800 dark:text-white p-4 rounded-lg shadow-lg flex items-start gap-4 z-50 animate-fade-in-down"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex-shrink-0 text-red-500 dark:text-red-400 mt-0.5">
            <ExclamationTriangleIcon />
          </div>
          <div className="flex-1">
            <p className="font-bold">خطأ في الميكروفون</p>
            <p className="text-sm text-red-700 dark:text-red-200">{speechError}</p>
          </div>
          <button
            onClick={clearSpeechError}
            className="p-1 -m-1 text-red-600 dark:text-red-200 hover:text-red-800 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
            aria-label="Dismiss error"
          >
            <XCircleIcon />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-black/30">
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-200 dark:border-cyan-500/20 shadow-lg dark:shadow-purple-500/10 backdrop-blur-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white"># القناة-العامة</h2>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          <div>
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>
        
        <footer className="p-4 flex-shrink-0 bg-white/80 dark:bg-transparent backdrop-blur-lg">
          <div className="w-full max-w-4xl mx-auto">
            {filePreview && (
              <div className="bg-gray-200 dark:bg-black/50 border border-gray-300 dark:border-cyan-500/20 p-2 rounded-t-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file?.name}</span>
                  </div>
                  <button 
                      onClick={removeFile} 
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
                      aria-label="Remove file"
                  >
                      <XCircleIcon />
                  </button>
              </div>
            )}
            <form onSubmit={handleSend} className={`bg-gray-200 dark:bg-black/50 border border-gray-300 dark:border-cyan-500/20 flex items-center p-2 gap-2 ${filePreview ? 'rounded-b-lg' : 'rounded-lg'}`}>
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
              />
              <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/10 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors"
                  aria-label="Attach file"
              >
                  <PaperclipIcon />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "...جارِ الاستماع" : "اسأل لورز..."}
                className="flex-1 bg-transparent px-2 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                disabled={isLoading}
              />
              {isSpeechRecognitionSupported && (
                <button 
                  type="button" 
                  onClick={toggleRecording} 
                  className={`p-2 rounded-md hover:bg-gray-300 dark:hover:bg-white/10 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-300'}`}
                  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  <MicrophoneIcon />
                </button>
              )}
              <button 
                type="submit" 
                disabled={isLoading || (!input.trim() && !file)} 
                className="p-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-500/80 dark:hover:bg-cyan-400/90 disabled:bg-cyan-800/50 dark:disabled:bg-cyan-500/20 disabled:text-gray-300 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 dark:shadow-[0_0_10px_theme(colors.cyan.500)]"
              >
                <SendIcon />
              </button>
            </form>
           </div>
        </footer>
      </div>

       {/* Right Sidebar - User List */}
       <aside className="w-64 bg-gray-50 dark:bg-black/40 backdrop-blur-xl border-r border-gray-200 dark:border-cyan-500/20 flex flex-col">
          <div className="px-4 h-16 flex items-center border-b border-gray-200 dark:border-cyan-500/20 shadow-lg dark:shadow-purple-500/10">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Lorzz</h1>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
             <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">المتواجدون — 2</h3>
             <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                    <UserAvatar name={username} />
                    <span className="font-semibold text-green-600 dark:text-green-300">{username}</span>
                </div>
                <div className="flex items-center gap-3">
                    <UserAvatar name="Lorzz AI" />
                    <span className="font-semibold text-cyan-600 dark:text-cyan-300">Lorzz AI</span>
                </div>
             </div>
             <div className="pt-4 border-t border-gray-200 dark:border-cyan-500/20">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">أدوات</h3>
                <button 
                    onClick={() => onNavigate('image')}
                    className="w-full flex items-center gap-3 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                    <ImageIcon />
                    <span className="font-semibold">تخيل الصور</span>
                </button>
            </div>
          </div>
           <div className="p-2 border-t border-gray-200 dark:border-cyan-500/20">
            <div className="flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-black/40">
                <UserAvatar name={username} />
                <span className="font-semibold text-gray-900 dark:text-white flex-1 truncate">{username}</span>
                <button 
                    onClick={onLogout}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    aria-label="تسجيل الخروج"
                >
                    <LogoutIcon />
                </button>
            </div>
        </div>
       </aside>
    </div>
  );
};

export default ChatScreen;