export type SocketMessage =
  | { type: "user_message"; content: string }
  | { type: "assistant_start" }
  | { type: "assistant_token"; content: string }
  | { type: "assistant_end" }
  | { type: "status"; content: string }
  | { type: "error"; content: string };

type MessageHandler = (message: SocketMessage) => void;

interface SocketEvents {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
}

export class ChatSocket {
  private socket: WebSocket | null = null;
  private onMessage: MessageHandler;
  private events?: SocketEvents;

  constructor(onMessage: MessageHandler, events?: SocketEvents) {
    this.onMessage = onMessage;
    this.events = events;
  }

  connect() {
    if (this.socket) return;

    const WS_URL =
      import.meta.env.VITE_BACKEND_WS_URL ||
      "ws://localhost:8000/ws/chat";

    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      this.events?.onOpen?.();
    };

    this.socket.onmessage = (e) => {
      try {
        this.onMessage(JSON.parse(e.data));
      } catch {
        console.error("Invalid WS message");
      }
    };

    this.socket.onerror = () => {
      this.events?.onError?.();
    };

    this.socket.onclose = () => {
      this.socket = null;
      this.events?.onClose?.();
    };
  }

  sendUserMessage(content: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    this.socket.send(
      JSON.stringify({ type: "user_message", content })
    );
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}
