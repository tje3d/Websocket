"use strict";
exports.__esModule = true;
var WebSocketManager = /** @class */ (function () {
    function WebSocketManager(server) {
        this.server = '';
        this.debug = false;
        this.connectionTimer = null;
        this.socket = null;
        this.listeners = {
            open: [],
            close: [],
            message: [],
            error: []
        };
        this.addDefaultListeners();
        if (server) {
            this.server = server;
        }
        if (this.server.length) {
            this.createConnection();
        }
    }
    WebSocketManager.prototype.send = function (data) {
        if (this.isClosed()
            || this.isConnecting()
            || this.socket == null) {
            this._logWarn('Trying to send data while not connected!');
            return;
        }
        this.socket.send(data);
        this._log("Data Sent: " + data);
    };
    WebSocketManager.prototype.createConnection = function () {
        this._log('Creating New Connection');
        this.socket = null;
        this.socket = new WebSocket(this.server);
        this.attachListeners();
        return this;
    };
    WebSocketManager.prototype.closeConnection = function () {
        if (this.socket === null) {
            return;
        }
        this.socket.close();
        this.socket = null;
    };
    WebSocketManager.prototype.reconnect = function () {
        this.createConnection();
    };
    /**
     * Getters / Setters
     */
    WebSocketManager.prototype.setServer = function (server) {
        this.server = server;
        this.closeConnection();
        this.createConnection();
        return this;
    };
    WebSocketManager.prototype.getServer = function () {
        return this.server;
    };
    /**
     * Validation
     */
    WebSocketManager.prototype.isConnecting = function () {
        if (!this.socket
            || this.socket == null) {
            return false;
        }
        return this.socket.readyState === this.socket.CONNECTING;
    };
    WebSocketManager.prototype.isClosed = function () {
        if (!this.socket
            || this.socket == null) {
            return false;
        }
        return this.socket.readyState === this.socket.CLOSED;
    };
    WebSocketManager.prototype.isConnected = function () {
        return !this.isConnecting() && !this.isClosed();
    };
    WebSocketManager.prototype.isReady = function () {
        return this.isConnected();
    };
    /**
     * Logging
     */
    WebSocketManager.prototype._log = function (data) {
        if (!this.debug) {
            return;
        }
        console.log('## Websocket', data);
    };
    WebSocketManager.prototype._logWarn = function (data) {
        if (!this.debug) {
            return;
        }
        console.warn('## Websocket', data);
    };
    /**
     * Events
     */
    WebSocketManager.prototype.addDefaultListeners = function () {
        this.addEventListener('open', this._onOpen);
        this.addEventListener('close', this._onClose);
        this.addEventListener('error', this._onError);
        this.addEventListener('message', this._onMessage);
    };
    WebSocketManager.prototype.addEventListener = function (type, func) {
        this.listeners[type].push(func);
        if (this.socket == null) {
            return;
        }
        this.socket.addEventListener(type, func.bind(this));
    };
    WebSocketManager.prototype.attachListeners = function () {
        var _this = this;
        Object.keys(this.listeners).forEach(function (type) {
            _this.listeners[type].forEach(function (func) {
                if (_this.isClosed() || _this.socket == null) {
                    return;
                }
                _this.socket.addEventListener(type, func.bind(_this));
            });
        });
    };
    WebSocketManager.prototype._onOpen = function () {
        this._log('On Connection Open');
    };
    WebSocketManager.prototype._onClose = function () {
        var _this = this;
        this._log('On Connection Close');
        if (this.connectionTimer !== null) {
            clearTimeout(this.connectionTimer);
            this.connectionTimer = null;
        }
        this.connectionTimer = setTimeout(function () {
            _this.createConnection();
        }, 3000);
    };
    WebSocketManager.prototype._onError = function () {
        this._log('On Connection Error');
    };
    WebSocketManager.prototype._onMessage = function (evt) {
        this._log("Connection Message: " + evt.data);
    };
    return WebSocketManager;
}());
exports["default"] = new WebSocketManager;
