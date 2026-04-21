import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useCallStore } from '../store/useCallStore';
import { sendWebRTCSignal, setOnWebRTCSignalCallback, type WebRTCSignal, sendCallLog } from '../services/websocket';
import toast from 'react-hot-toast';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

export const useWebRTC = () => {
    const { currentUser } = useChatStore();
    const callStore = useCallStore();

    // We use refs to keep the latest values without causing dependency cycles in callbacks
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const storeRef = useRef(callStore);
    const userRef = useRef(currentUser);

    useEffect(() => {
        storeRef.current = callStore;
        userRef.current = currentUser;
    }, [callStore, currentUser]);

    const cleanup = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (storeRef.current.localStream) {
            storeRef.current.localStream.getTracks().forEach(t => t.stop());
        }
        storeRef.current.resetCall();
    }, []);

    const createPeerConnection = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            const { status, caller, recipient } = storeRef.current;
            const user = userRef.current;
            if (event.candidate && user) {
                // If we are answering, we send candidates to caller. If we called, we send to recipient.
                const target = status === 'RINGING' ? caller : recipient;
                if (!target) return;

                sendWebRTCSignal({
                    type: 'CANDIDATE',
                    sender: user.username,
                    recipient: target,
                    candidate: event.candidate.candidate,
                    sdpMLineIndex: event.candidate.sdpMLineIndex!,
                    sdpMid: event.candidate.sdpMid!
                });
            }
        };

        pc.ontrack = (event) => {
            storeRef.current.setRemoteStream(event.streams[0]);
        };

        pcRef.current = pc;
        return pc;
    }, []);

    const handleOffer = async (signal: WebRTCSignal) => {
        const pc = createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }));

        // Get local media
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: storeRef.current.isVideoCall,
                audio: true
            });
            storeRef.current.setLocalStream(stream);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            sendWebRTCSignal({
                type: 'ANSWER',
                sender: userRef.current!.username,
                recipient: signal.sender,
                sdp: answer.sdp
            });
        } catch (err) {
            console.error('Failed to get media devices', err);
            toast.error('Could not access camera/microphone');
            cleanup();
        }
    };

    const handleAnswer = async (signal: WebRTCSignal) => {
        if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));
            storeRef.current.setCallStatus('CONNECTED');
        }
    };

    const handleCandidate = async (signal: WebRTCSignal) => {
        if (pcRef.current && signal.candidate) {
            try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate({
                    candidate: signal.candidate,
                    sdpMLineIndex: signal.sdpMLineIndex,
                    sdpMid: signal.sdpMid
                }));
            } catch (err) {
                console.error('Error adding received ice candidate', err);
            }
        }
    };

    useEffect(() => {
        setOnWebRTCSignalCallback(async (signal: WebRTCSignal) => {
            if (!userRef.current) return;

            switch (signal.type) {
                case 'CALL_REQUEST_VIDEO':
                case 'CALL_REQUEST_AUDIO':
                    if (storeRef.current.status !== 'IDLE') {
                        // Busy
                        sendWebRTCSignal({
                            type: 'CALL_REJECTED',
                            sender: userRef.current.username,
                            recipient: signal.sender
                        });
                        return;
                    }
                    storeRef.current.setCallInfo(signal.sender, userRef.current.username, signal.type === 'CALL_REQUEST_VIDEO');
                    storeRef.current.setCallStatus('RINGING');
                    break;

                case 'CALL_ACCEPTED':
                    if (storeRef.current.status === 'CALLING') {
                        // The other person accepted. We create offer.
                        const pc = createPeerConnection();
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({
                                video: storeRef.current.isVideoCall,
                                audio: true
                            });
                            storeRef.current.setLocalStream(stream);
                            stream.getTracks().forEach(track => pc.addTrack(track, stream));

                            const offer = await pc.createOffer();
                            await pc.setLocalDescription(offer);

                            sendWebRTCSignal({
                                type: 'OFFER',
                                sender: userRef.current.username,
                                recipient: storeRef.current.recipient!,
                                sdp: offer.sdp
                            });
                            storeRef.current.setCallStatus('CONNECTED');
                        } catch (err) {
                            console.error('Failed to access media', err);
                            toast.error('Could not access camera/microphone');
                            cleanup();
                        }
                    }
                    break;

                case 'CALL_REJECTED':
                    if (storeRef.current.status === 'CALLING') {
                        toast.error(`${signal.sender} rejected the call`);
                        sendCallLog(
                            userRef.current.username,
                            signal.sender,
                            `📞 Missed ${storeRef.current.isVideoCall ? 'Video' : 'Audio'} Call`
                        );
                        cleanup();
                    }
                    break;

                case 'OFFER':
                    if (storeRef.current.status === 'RINGING') {
                        await handleOffer(signal);
                        storeRef.current.setCallStatus('CONNECTED');
                    }
                    break;

                case 'ANSWER':
                    await handleAnswer(signal);
                    break;

                case 'CANDIDATE':
                    await handleCandidate(signal);
                    break;

                case 'CALL_ENDED':
                    toast(`${signal.sender} ended the call`, { icon: '📞' });
                    // If we were connected, log it
                    if (storeRef.current.status === 'CONNECTED') {
                        sendCallLog(
                            userRef.current.username,
                            signal.sender,
                            `📞 ${storeRef.current.isVideoCall ? 'Video' : 'Audio'} Call ended`
                        );
                    } else if (storeRef.current.status === 'RINGING') {
                        sendCallLog(
                            userRef.current.username,
                            signal.sender,
                            `📞 Missed ${storeRef.current.isVideoCall ? 'Video' : 'Audio'} Call`
                        );
                    }
                    cleanup();
                    break;
            }
        });
    }, [cleanup]);

    const initiateCall = (recipientUsername: string, isVideo: boolean) => {
        if (!userRef.current) return;
        callStore.setCallInfo(userRef.current.username, recipientUsername, isVideo);
        callStore.setCallStatus('CALLING');

        sendWebRTCSignal({
            type: isVideo ? 'CALL_REQUEST_VIDEO' : 'CALL_REQUEST_AUDIO',
            sender: userRef.current.username,
            recipient: recipientUsername
        });
    };

    const acceptCall = () => {
        if (!userRef.current || !storeRef.current.caller) return;
        sendWebRTCSignal({
            type: 'CALL_ACCEPTED',
            sender: userRef.current.username,
            recipient: storeRef.current.caller
        });
    };

    const rejectCall = () => {
        if (!userRef.current || !storeRef.current.caller) return;
        sendWebRTCSignal({
            type: 'CALL_REJECTED',
            sender: userRef.current.username,
            recipient: storeRef.current.caller
        });
        cleanup();
    };

    const endCall = () => {
        if (!userRef.current) return;
        const target = storeRef.current.status === 'RINGING' ? storeRef.current.caller : storeRef.current.recipient;
        if (target) {
            sendWebRTCSignal({
                type: 'CALL_ENDED',
                sender: userRef.current.username,
                recipient: target
            });
            if (storeRef.current.status === 'CONNECTED') {
                sendCallLog(
                    userRef.current.username,
                    target,
                    `📞 ${storeRef.current.isVideoCall ? 'Video' : 'Audio'} Call ended`
                );
            }
        }
        cleanup();
    };

    return {
        initiateCall,
        acceptCall,
        rejectCall,
        endCall
    };
};
