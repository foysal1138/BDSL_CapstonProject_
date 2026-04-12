/**
 * WebSocket Client Configuration
 * Handles real-time communication with FastAPI WebSocket endpoints
 */

class WebSocketClient {
    constructor(baseURL = import.meta.env.VITE_WS_URL || 'ws://localhost:8760') {
        this.baseURL = baseURL;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000; // milliseconds
    }

    /**
     * Connect to WebSocket endpoint
     */
    connect(endpoint, handlers = {}) {
        return new Promise((resolve, reject) => {
            try {
                const url = `${this.baseURL}${endpoint}`;
                this.ws = new WebSocket(url);

                this.ws.onopen = () => {
                    console.log(`WebSocket connected to ${endpoint}`);
                    this.reconnectAttempts = 0;
                    handlers.onOpen?.();
                    resolve(this.ws);
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        handlers.onMessage?.(data);
                    } catch (e) {
                        console.error('Failed to parse WebSocket message:', e);
                        handlers.onMessage?.(event.data);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    handlers.onError?.(error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log(`WebSocket disconnected from ${endpoint}`);
                    handlers.onClose?.();
                    this.attemptReconnect(endpoint, handlers);
                };
            } catch (error) {
                console.error('WebSocket connection failed:', error);
                reject(error);
            }
        });
    }

    /**
     * Send message through WebSocket
     */
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            if (typeof data === 'object') {
                this.ws.send(JSON.stringify(data));
            } else {
                this.ws.send(data);
            }
        } else {
            console.error('WebSocket is not connected');
        }
    }

    /**
     * Send base64 encoded image data
     */
    sendFrame(base64Data) {
        this.send(base64Data);
    }

    /**
     * Close WebSocket connection
     */
    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    /**
     * Attempt to reconnect
     */
    attemptReconnect(endpoint, handlers) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect(endpoint, handlers).catch(err => {
                    console.error('Reconnection failed:', err);
                });
            }, this.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
            handlers.onMaxReconnectFailed?.();
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

export default new WebSocketClient();