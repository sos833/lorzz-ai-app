import { useState, useEffect, useCallback, useRef } from 'react';
import { Chat } from '@google/genai';
import { createChatSession } from '../services/geminiService';
import type { ChatMessage, Source } from '../types';

// Helper function to load messages from localStorage
const loadMessages = (username: string): ChatMessage[] => {
  try {
    const saved = localStorage.getItem(`lorzz-chat-history-${username}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Revive Date objects from string representations
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (error) {
    console.error("Failed to load chat history:", error);
  }
  return [];
};

// Helper function to save messages to localStorage
const saveMessages = (username: string, messages: ChatMessage[]) => {
  if (!username) return;
  try {
    // When saving, nullify the temporary object URL for files
    const storableMessages = messages.map(msg => {
      if (msg.file && msg.file.url) {
        // Don't store the blob URL as it will be invalid on next load
        return { ...msg, file: { name: msg.file.name, type: msg.file.type } };
      }
      return msg;
    });
    localStorage.setItem(`lorzz-chat-history-${username}`, JSON.stringify(storableMessages));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const getErrorMessage = (error: unknown): string => {
    console.error("Error during API call:", error);

    if (error instanceof Error) {
        if (error.name === 'TypeError' && error.message.toLowerCase().includes('fetch')) {
            return "فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.";
        }
        const errorMessage = error.message || '';
        if (errorMessage.includes('400')) {
             return "حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.";
        }
        if (errorMessage.includes('429')) {
             return "لقد أرسلت طلبات كثيرة جدًا. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.";
        }
        if (errorMessage.includes('500') || errorMessage.includes('503')) {
             return "الخدمة غير متاحة حاليًا أو تواجه ضغطًا. يرجى المحاولة مرة أخرى لاحقاً.";
        }
    }
    return "عذراً، حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.";
};


export const useChat = (username: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatRef = useRef<Chat | null>(null);

  // Load history or set welcome message on username change
  useEffect(() => {
    if (!username) return;

    chatRef.current = createChatSession();
    const history = loadMessages(username);

    if (history.length > 0) {
      setMessages(history);
    } else {
       const welcomeMessage: ChatMessage = {
            id: 'welcome-message',
            text: `مرحباً بك يا ${username}! أنا لورز، مساعدك الذكي الفائق. أنا هنا لمساعدتك في أي شيء. كيف يمكنني إبهارك اليوم؟`,
            sender: 'Lorzz AI',
            timestamp: new Date(),
        };
      setMessages([welcomeMessage]);
      saveMessages(username, [welcomeMessage]); // Save initial state
    }
  }, [username]);

  const sendMessage = useCallback(async (text: string, file: File | null = null) => {
    if ((!text.trim() && !file) || isLoading || !chatRef.current) return;

    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: username,
      timestamp: new Date(),
    };

    if (file) {
      userMessage.file = {
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type
      };
    }
    
    const aiMessageId = `ai-${Date.now()}`;
    const aiPlaceholderMessage: ChatMessage = {
        id: aiMessageId,
        text: '',
        sender: 'Lorzz AI',
        timestamp: new Date(),
        isStreaming: true,
    };
    
    setMessages(prev => [...prev, userMessage, aiPlaceholderMessage]);

    try {
      const parts: any[] = [{ text }];
      if (file) {
        const imagePart = await fileToGenerativePart(file);
        parts.unshift(imagePart);
      }

      const stream = await chatRef.current.sendMessageStream({ message: parts });
      let accumulatedText = '';
      const groundingChunks = new Map<string, Source>();


      for await (const chunk of stream) {
        accumulatedText += chunk.text;
         chunk.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach(gc => {
            if (gc.web && gc.web.uri) {
                groundingChunks.set(gc.web.uri, { uri: gc.web.uri, title: gc.web.title || gc.web.uri });
            }
        });
        setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
        ));
      }
      
      const sources = Array.from(groundingChunks.values());

      setMessages(prev => {
        const finalMessages = prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, isStreaming: false, sources: sources.length > 0 ? sources : undefined } : msg
        );
        saveMessages(username, finalMessages);
        return finalMessages;
      });

    } catch (error) {
      const userFriendlyMessage = getErrorMessage(error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: userFriendlyMessage,
        sender: 'Lorzz AI',
        timestamp: new Date(),
      };
      setMessages(prev => {
        const messagesWithError = [...prev.filter(m => m.id !== aiMessageId), errorMessage];
        saveMessages(username, messagesWithError);
        return messagesWithError;
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, username, messages]);

  return { messages, sendMessage, isLoading };
};