export interface WebSocketEvents<T> {
  onOpen?: (event: Event) => void;
  onMessage?: (data: T) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export interface WebSocketOptions<T> extends WebSocketEvents<T> {
  reconnect?: boolean;
  reconnectInterval?: number; // ms
  maxRetries?: number;
  parseJson?: boolean; // auto parse JSON messages
}

export class WebSocketClient<TSend = unknown, TReceive = unknown> {
  private url: string;
  private socket: WebSocket | null = null;
  private options: WebSocketOptions<TReceive>;
  private retries = 0;

  constructor(url: string, options: WebSocketOptions<TReceive> = {}) {
    this.url = url;
    this.options = {
      reconnect: true,
      reconnectInterval: 2000,
      maxRetries: 5,
      parseJson: true,
      ...options,
    };
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = (event) => {
      this.retries = 0;
      this.options.onOpen?.(event);
    };

    this.socket.onmessage = (event) => {
      let data = event.data;
      if (this.options.parseJson) {
        try {
          data = JSON.parse(event.data);
        } catch {
          // fallback to raw string
        }
      }
      this.options.onMessage?.(data as TReceive);
    };

    this.socket.onclose = (event) => {
      this.options.onClose?.(event);

      if (this.options.reconnect && this.retries < (this.options.maxRetries ?? Infinity) && !this.isConnected) {
        setTimeout(() => {
          this.retries++;
          this.connect();
        }, this.options.reconnectInterval);
      }
    };

    this.socket.onerror = (event) => {
      this.options.onError?.(event);
    };
  }

  send(data: TSend) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(payload);
    } else {
      console.warn('WebSocket not connected. Message not sent:', data);
    }
  }

  close(code?: number, reason?: string) {
    this.options.reconnect = false; // disable further reconnects
    this.socket?.close(code, reason);
  }

  get isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}
