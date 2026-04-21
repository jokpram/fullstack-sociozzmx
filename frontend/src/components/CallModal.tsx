import React, { useEffect, useRef, useState } from 'react';
import { useCallStore } from '../store/useCallStore';
import { useChatStore } from '../store/useChatStore';
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff, PhoneIncoming, UserCircle } from 'lucide-react';

interface CallModalProps {
    onAccept: () => void;
    onReject: () => void;
    onEnd: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ onAccept, onReject, onEnd }) => {
    const { status, caller, recipient, isVideoCall, localStream, remoteStream } = useCallStore();
    const { currentUser, allUsers } = useChatStore();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!localStream.getAudioTracks()[0]?.enabled);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!localStream.getVideoTracks()[0]?.enabled);
        }
    };

    if (status === 'IDLE') return null;

    const isIncoming = currentUser && caller && caller !== currentUser.username;
    const targetUsername = isIncoming ? caller : recipient;
    const targetUser = allUsers.find(u => u.username === targetUsername);
    const displayName = targetUser ? targetUser.fullName : targetUsername;

    // Incoming Call Screen
    if (status === 'RINGING' && isIncoming) {
        return (
            <div className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mb-4 relative">
                        <UserCircle className="w-12 h-12 text-brand-slate" />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white animate-bounce">
                            <PhoneIncoming className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-brand-slate mb-1">{displayName}</h3>
                    <p className="text-gray-500 font-medium mb-8">
                        Incoming {isVideoCall ? 'Video' : 'Audio'} Call...
                    </p>
                    <div className="flex gap-4 w-full justify-center">
                        <button
                            onClick={onReject}
                            className="bg-brand-red hover:bg-red-600 text-white p-4 rounded-full transition-transform hover:scale-110 shadow-lg shadow-brand-red/30"
                        >
                            <PhoneOff className="w-6 h-6" />
                        </button>
                        <button
                            onClick={onAccept}
                            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-transform hover:scale-110 shadow-lg shadow-green-500/30"
                        >
                            {isVideoCall ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Outgoing Call / Active Call Screen
    return (
        <div className="fixed inset-0 bg-brand-black z-[100] flex flex-col animate-in fade-in duration-300">
            {/* Main Video Area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-6">
                            <UserCircle className="w-20 h-20 text-white/50" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{displayName}</h2>
                        <p className="text-gray-400 text-lg">
                            {status === 'CALLING' ? 'Calling...' :
                                status === 'RINGING' ? 'Ringing...' : 'Connecting Media...'}
                        </p>
                    </div>
                )}

                {/* Local Video Thumbnail */}
                {isVideoCall && status === 'CONNECTED' && (
                    <div className="absolute top-6 right-6 w-32 h-48 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                        {localStream ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <UserCircle className="w-12 h-12 text-gray-500" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Call Controls */}
            <div className="h-24 bg-gradient-to-t from-black to-transparent flex items-center justify-center gap-6 px-6 pb-6 pt-4">
                {status === 'CONNECTED' && (
                    <>
                        <button
                            onClick={toggleAudio}
                            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-brand-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>

                        {isVideoCall && (
                            <button
                                onClick={toggleVideo}
                                className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-white text-brand-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                            </button>
                        )}
                    </>
                )}

                <button
                    onClick={onEnd}
                    className="p-4 rounded-full bg-brand-red text-white hover:bg-red-600 transition-all hover:scale-110 shadow-lg shadow-brand-red/30"
                >
                    <PhoneOff className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
