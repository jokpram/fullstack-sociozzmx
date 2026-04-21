import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useChatStore, type ChatMessage, type User } from '../store/useChatStore';

export interface WebRTCSignal {
    type: string; // 'OFFER', 'ANSWER', 'CANDIDATE', 'CALL_REQUEST_VIDEO', 'CALL_REQUEST_AUDIO', 'CALL_ACCEPTED', 'CALL_REJECTED', 'CALL_ENDED'
    sender: string;
    recipient: string;
    sdp?: string;
    candidate?: string;
    sdpMLineIndex?: number;
    sdpMid?: string;
}

// Global callback for webrtc signals so the UI can respond
let onWebRTCSignalCallback: ((signal: WebRTCSignal) => void) | null = null;
export const setOnWebRTCSignalCallback = (cb: (signal: WebRTCSignal) => void) => {
    onWebRTCSignalCallback = cb;
};

const WS_ENDPOINT = 'http://localhost:8081/ws';
let stompClient: Client | null = null;
let currentSessionId: string | null = null;

export const connectWebSocket = (currentUser: User, onConnected: () => void) => {
    // Generate a simple session ID if not using a rigorous one
    if (!currentSessionId) {
        currentSessionId = Math.random().toString(36).substring(2, 15);
    }

    stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_ENDPOINT),
        connectHeaders: {
            username: currentUser.username,
            'Session-Id': currentSessionId,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
        console.log('Connected to WebSocket:', frame);

        // Subscribe to global public chat
        stompClient?.subscribe('/topic/public', (message) => {
            const chatMessage: ChatMessage = JSON.parse(message.body);
            useChatStore.getState().addMessage(chatMessage);
        });

        // Subscribe to private user queue
        stompClient?.subscribe(`/user/queue/messages`, (message) => {
            const chatMessage: ChatMessage = JSON.parse(message.body);
            useChatStore.getState().addMessage(chatMessage);
        });

        // Subscribe to WebRTC signaling queue
        stompClient?.subscribe(`/user/queue/webrtc`, (message) => {
            const signal: WebRTCSignal = JSON.parse(message.body);
            if (onWebRTCSignalCallback) {
                onWebRTCSignalCallback(signal);
            }
        });

        // Notify backend that user is connected
        useChatStore.getState().addMessage({
            senderId: currentUser.username,
            content: `${currentUser.fullName} joined the chat.`,
            type: 'JOIN'
        });

        onConnected();
    };

    stompClient.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
    };

    stompClient.activate();
    return currentSessionId;
};

export const disconnectWebSocket = (currentUser: User) => {
    if (stompClient) {
        useChatStore.getState().addMessage({
            senderId: currentUser.username,
            content: `${currentUser.fullName} left the chat.`,
            type: 'LEAVE'
        });
        stompClient.deactivate();
        stompClient = null;
        currentSessionId = null;
    }
};

export const sendGlobalMessage = (sender: User, content: string) => {
    if (stompClient && stompClient.connected) {
        const message: ChatMessage = {
            senderId: sender.username,
            content,
            type: 'CHAT',
            timestamp: new Date().toISOString()
        };
        stompClient.publish({
            destination: '/app/chat.publicMessage',
            body: JSON.stringify(message)
        });
    }
};

export const sendPrivateMessage = (sender: User, recipientId: string, content: string) => {
    if (stompClient && stompClient.connected) {
        const message: ChatMessage = {
            senderId: sender.username,
            recipientId: recipientId,
            content,
            type: 'CHAT',
            timestamp: new Date().toISOString()
        };
        stompClient.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(message)
        });
    }
};

export const sendCallLog = (senderId: string, recipientId: string, content: string) => {
    if (stompClient && stompClient.connected) {
        const message: ChatMessage = {
            senderId,
            recipientId,
            content,
            type: 'CALL', // Backend matches MessageType.CALL
            timestamp: new Date().toISOString()
        };
        stompClient.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(message)
        });
    }
};

export const sendGroupMessage = (sender: User, groupId: number, content: string) => {
    if (stompClient && stompClient.connected) {
        const message: ChatMessage = {
            senderId: sender.username,
            groupId: groupId,
            content,
            type: 'CHAT',
            timestamp: new Date().toISOString()
        };
        stompClient.publish({
            destination: '/app/chat.sendMessage', // Reusing the same endpoint, backend checks for groupId
            body: JSON.stringify(message)
        });
    }
};

export const sendWebRTCSignal = (signal: WebRTCSignal) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: '/app/webrtc.signal',
            body: JSON.stringify(signal)
        });
    }
};

export const getSessionId = () => currentSessionId;
