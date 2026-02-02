export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface SendMessageRequest {
  message: string;
  session_id: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

// Future extensibility types
export interface ToolExecutionRequest {
  toolName: string;
  toolArgs: Record<string, unknown>;
  requiresConfirmation: boolean;
}

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

export interface MemoryIndicator {
  id: string;
  action: 'saved' | 'recalled' | 'updated';
  summary: string;
  timestamp: Date;
}
