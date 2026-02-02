import { SendMessageRequest, StreamCallbacks } from '@/types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Sends a message to the chat API and handles streaming response.
 * Uses Server-Sent Events (SSE) for real-time token streaming.
 */
export async function sendMessage(
  request: SendMessageRequest,
  callbacks: StreamCallbacks
): Promise<void> {
  const controller = new AbortController();
  
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Process any remaining buffer content
        if (buffer.trim()) {
          callbacks.onToken(buffer);
        }
        callbacks.onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // Handle SSE format: "data: <content>\n\n"
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6);
          if (content === '[DONE]') {
            callbacks.onComplete();
            return;
          }
          try {
            // Try to parse as JSON (common SSE format)
            const parsed = JSON.parse(content);
            if (parsed.content) {
              callbacks.onToken(parsed.content);
            } else if (typeof parsed === 'string') {
              callbacks.onToken(parsed);
            }
          } catch {
            // If not JSON, treat as plain text
            if (content.trim()) {
              callbacks.onToken(content);
            }
          }
        } else if (line.trim() && !line.startsWith(':')) {
          // Handle plain text streaming (non-SSE format)
          callbacks.onToken(line);
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      callbacks.onComplete();
    } else {
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

/**
 * Generates a unique session ID for conversation tracking
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Gets or creates a session ID from localStorage
 */
export function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'chat_session_id';
  let sessionId = localStorage.getItem(STORAGE_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Clears the current session and generates a new one
 */
export function clearSession(): string {
  const STORAGE_KEY = 'chat_session_id';
  const newSessionId = generateSessionId();
  localStorage.setItem(STORAGE_KEY, newSessionId);
  return newSessionId;
}

/**
 * Generates a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
