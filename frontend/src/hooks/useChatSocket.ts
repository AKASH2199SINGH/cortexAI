import { useEffect, useRef, useState } from "react";
import { ChatSocket, SocketMessage } from "@/services/chatSocket";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useChatSocket() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<ChatSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);

  const connect = () => {
    socketRef.current = new ChatSocket(handleSocketMessage, {
      onOpen: () => {
        setIsConnected(true);
        setError(null);
      },
      onClose: () => {
        setIsConnected(false);
        retryConnect();
      },
      onError: () => {
        setError("Connection lost. Reconnecting…");
        setIsConnected(false);
      },
    });

    socketRef.current.connect();
  };

  useEffect(() => {
    connect();
    return () => socketRef.current?.disconnect();
  }, []);

  const retryConnect = () => {
    if (reconnectTimeout.current) return;

    reconnectTimeout.current = window.setTimeout(() => {
      reconnectTimeout.current = null;
      connect();
    }, 1500);
  };

  const handleSocketMessage = (msg: SocketMessage) => {
    switch (msg.type) {
      case "assistant_start":
        setIsStreaming(true);
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        break;

      case "assistant_token":
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "assistant") {
            last.content += msg.content;
          }
          return updated;
        });
        break;

      case "assistant_end":
        setIsStreaming(false);
        break;

      case "error":
        setError(msg.content);
        setIsStreaming(false);
        break;
    }
  };

  const sendMessage = (content: string) => {
    if (!isConnected || isStreaming) return;

    setMessages(prev => [...prev, { role: "user", content }]);
    socketRef.current?.sendUserMessage(content);
  };

  return {
    messages,
    sendMessage,
    isStreaming,
    isConnected,
    error,
  };
}
