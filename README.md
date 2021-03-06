## Reconnectable Websocket Wrapper

# Installation
> yarn install tje3d-websocket-manager

# Usage
```js
import WebsocketManager from 'WebsocketManager';
WebsocketManager.setServer('ws://localhost:8080');

if (WebsocketManager.isReady()) {
    WebsocketManager.send('ping');
}

// ...
WebsocketManager.addEventListener('open', () => {
    console.log('Connected');
    // WebsocketManager.send('Heyy')
});

WebsocketManager.addEventListener('message', evt => {
    console.log('Message Received', evt.data);
});

WebsocketManager.addEventListener('error', evt => {
    console.log('Connection error');
});

const closeFunc = () => {
    console.log('Disconnected');

    // try to connect after disconnection
    setTimeout(()=>{
        WebsocketManager.reconnect();
    }, 2000);
};

WebsocketManager.addEventListener('close', closeFunc);
WebsocketManager.removeEventListener('close', closeFunc);
```