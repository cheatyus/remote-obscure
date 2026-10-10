export class WebSocketService {
    static instance = null;
    
    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }
    
    ws = null;
    isAuthenticated = false;
    onFrameCallback = null;
    onMessageCallback = null;
    onDisconnectCallback = null;
    onConnectCallback = null;
    reconnectTimer = null;
    serverUrl = '';
    password = '';
    
    connect(ip, port, password) {
        this.password = password;
        this.serverUrl = `ws://${ip}:${port}`;
        
        try {
            if (this.ws) {
                this.ws.close();
            }
            
            this.ws = new WebSocket(this.serverUrl);
            this.ws.binaryType = 'blob';
            
            this.ws.onopen = () => {
                this.send({ type: 'auth', password: this.password });
            };
            
            this.ws.onmessage = (event) => {
                if (typeof event.data === 'string') {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'auth_result') {
                        this.isAuthenticated = msg.success;
                        if (msg.success && this.onConnectCallback) {
                            this.onConnectCallback();
                        } else if (!msg.success && this.onMessageCallback) {
                            this.onMessageCallback({ type: 'error', message: 'Falha na autenticação' });
                            this.ws.close();
                        }
                    } else if (this.onMessageCallback) {
                        this.onMessageCallback(msg);
                    }
                } else {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = reader.result.split(',')[1];
                        const imageUri = `data:image/jpeg;base64,${base64}`;
                        if (this.onFrameCallback) {
                            this.onFrameCallback(imageUri);
                        }
                    };
                    reader.readAsDataURL(event.data);
                }
            };
            
            this.ws.onclose = () => {
                this.isAuthenticated = false;
                if (this.onDisconnectCallback) {
                    this.onDisconnectCallback();
                }
            };
            
            this.ws.onerror = (error) => {
                console.log('WebSocket Error:', error);
            };
        } catch (e) {
            console.error('Connection error:', e);
            if (this.onDisconnectCallback) {
                this.onDisconnectCallback();
            }
        }
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isAuthenticated = false;
    }
    
    send(obj) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(obj));
        }
    }
    
    sendMouseClick(x, y, button = 'left') {
        if (x === undefined && y === undefined) {
            this.send({ type: 'mouse_click', button });
        } else {
            this.send({ type: 'mouse_click', x, y, button });
        }
    }
    
    sendMouseDown(button = 'left') {
        this.send({ type: 'mouse_down', button });
    }
    
    sendMouseUp(button = 'left') {
        this.send({ type: 'mouse_up', button });
    }
    
    sendMouseDoubleClick(x, y) {
        this.send({ type: 'mouse_double_click', x, y });
    }
    
    sendMouseMove(x, y) {
        this.send({ type: 'mouse_move', x, y });
    }

    sendMouseMoveRelative(dx, dy) {
        this.send({ type: 'mouse_move_relative', dx, dy });
    }
    
    sendScroll(delta) {
        this.send({ type: 'mouse_scroll', delta });
    }
    
    sendKeyPress(key) {
        this.send({ type: 'key_press', key });
    }
    
    sendKeyCombo(keys) {
        this.send({ type: 'key_combo', keys });
    }
    
    sendSpecialKey(key) {
        this.send({ type: 'key_special', key });
    }
    
    sendSystemCommand(action) {
        this.send({ type: 'system', action });
    }
    
    requestProgramList() {
        this.send({ type: 'programs_list' });
    }
    
    sendCloseProgram(pid) {
        this.send({ type: 'program_close', pid });
    }
    
    sendOpenProgram(path) {
        this.send({ type: 'program_open', path });
    }
}
