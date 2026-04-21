import { create } from 'zustand';

export type CallStatus = 'IDLE' | 'CALLING' | 'RINGING' | 'CONNECTED';

interface CallState {
    status: CallStatus;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    caller: string | null;      // Who initiated the call
    recipient: string | null;   // Who is receiving the call
    isVideoCall: boolean;

    // Actions
    setCallStatus: (status: CallStatus) => void;
    setLocalStream: (stream: MediaStream | null) => void;
    setRemoteStream: (stream: MediaStream | null) => void;
    setCallInfo: (caller: string | null, recipient: string | null, isVideoCall: boolean) => void;
    resetCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
    status: 'IDLE',
    localStream: null,
    remoteStream: null,
    caller: null,
    recipient: null,
    isVideoCall: false,

    setCallStatus: (status) => set({ status }),
    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),
    setCallInfo: (caller, recipient, isVideoCall) => set({ caller, recipient, isVideoCall }),
    resetCall: () => set({
        status: 'IDLE',
        localStream: null,
        remoteStream: null,
        caller: null,
        recipient: null
    })
}));
