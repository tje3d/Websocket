interface WebsocketEvents {
    open    : Array<void>;
    close   : Array<void>;
    message : Array<void>;
    error   : Array<void>;
}

class WebSocketManager
 {
    private server: string            = '';
    protected debug: boolean          = false;
    protected connectionTimer: any    = null;
    public socket: WebSocket | null   = null;
    public listeners: WebsocketEvents = {
        open    : [],
        close   : [],
        message : [],
        error   : [],
    };

    constructor(server?: string) {
        this.addDefaultListeners();

        if (server) {
            this.server = server;
        }

        if (this.server.length) {
            this.createConnection();
        }
    }

    send(data: any): void {
        if (
            this.isClosed()
            || this.isConnecting()
            || this.socket == null
        ) {
            this._logWarn('Trying to send data while not connected!');
            return;
        }
        
        this.socket.send(data);

        this._log(`Data Sent: ${data}`);
    }

    createConnection(): WebSocketManager {
        this._log('Creating New Connection');

        this.socket = null;
        this.socket = new WebSocket(this.server);
        this.attachListeners();
        return this;
    }

    closeConnection(): void {
        if (this.socket === null) {
            return;
        }

        this.socket.close();
        this.socket = null;
    }

    reconnect(): void {
        this.createConnection();
    }

    /**
     * Getters / Setters
     */
    setServer(server: string): WebSocketManager {
        this.server = server;
        this.closeConnection();
        this.createConnection();
        return this;
    }

    getServer(): string {
        return this.server;
    }

    /**
     * Validation
     */
    isConnecting(): boolean {
        if (
            !this.socket
            || this.socket == null
        ) {
            return false;
        }

        return this.socket.readyState === this.socket.CONNECTING;
    }

    isClosed(): boolean {
        if (
            !this.socket
            || this.socket == null
        ) {
            return false;
        }

        return this.socket.readyState === this.socket.CLOSED;
    }

    isConnected(): boolean {
        return !this.isConnecting() && !this.isClosed();
    }

    isReady(): boolean {
        return this.isConnected();
    }

    /**
     * Logging
     */
    _log(data: string | Object): void {
        if (!this.debug) {
            return;
        }

        console.log('## Websocket', data);
    }

    _logWarn(data: string | Object): void {
        if (!this.debug) {
            return;
        }

        console.warn('## Websocket', data);
    }

    /**
     * Events
     */
     addDefaultListeners(): void {
        this.addEventListener( 'open'    , this._onOpen    );
        this.addEventListener( 'close'   , this._onClose   );
        this.addEventListener( 'error'   , this._onError   );
        this.addEventListener( 'message' , this._onMessage );
    }

    addEventListener(type: string, func: Function): void {
        this.listeners[type].push(func);

        if (this.socket == null) {
            return;
        }

        this.socket.addEventListener(type, func.bind(this));
    }

    removeEventListener(type: string, func: Function): void {
        this.listeners[type].forEach((funcArray: Function, index: number) => {
            if (funcArray === func) {
                this.listeners[type].splice(index, 1);
            }
        });

        if (this.socket == null) {
            return;
        }

        this.socket.removeEventListener(type, func.bind(this));
    }

    attachListeners(): void {
        Object.keys(this.listeners).forEach(type => {
            this.listeners[type].forEach(func => {
                if (this.isClosed() || this.socket == null) {
                    return;
                }

                this.socket.addEventListener(type, func.bind(this));
            })
        });
    }

    _onOpen(): void {
        this._log('On Connection Open');
    }

    _onClose(): void {
        this._log('On Connection Close');

        if (this.connectionTimer !== null) {
            clearTimeout(this.connectionTimer);
            this.connectionTimer = null;
        }

        this.connectionTimer = setTimeout(()=>{
            this.createConnection();
        }, 3000);
    }

    _onError(): void {
        this._log('On Connection Error');
    }

    _onMessage(evt: MessageEvent): void {
        this._log(`Connection Message: ${evt.data}`);
    }
}

export default new WebSocketManager;