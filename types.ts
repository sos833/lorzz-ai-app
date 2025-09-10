export interface Source {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isStreaming?: boolean;
  sources?: Source[];
  file?: {
    url?: string;
    name: string;
    type: string;
  };
}