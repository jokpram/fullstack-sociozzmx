import React, { useRef, useState, useEffect } from 'react';
import { Camera, Video, X, RotateCcw, Check, Square } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [captureType, setCaptureType] = useState<'photo' | 'video' | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    useEffect(() => {
        const startCamera = async () => {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode },
                    audio: true, // Audio needed for video recording
                });
                streamRef.current = newStream;
                setStream(newStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Unable to access camera. Please check permissions.");
                onClose();
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [facingMode, onClose]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setPreviewSrc(dataUrl);
                setCaptureType('photo');
                // Stop camera stream when showing preview
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            }
        }
    };

    const startRecording = () => {
        if (stream) {
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(blob);
                setPreviewSrc(videoUrl);
                setCaptureType('video');
                setRecordedChunks(chunks);
                // Stop camera stream
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleConfirm = async () => {
        if (previewSrc) {
            if (captureType === 'photo') {
                const response = await fetch(previewSrc);
                const blob = await response.blob();
                const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                onCapture(file);
            } else if (captureType === 'video' && recordedChunks.length > 0) {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
                onCapture(file);
            }
        }
    };

    const handleRetake = () => {
        setPreviewSrc(null);
        setCaptureType(null);
        setRecordedChunks([]);
        // By changing state, we might need to manually restart camera if not triggered by effect
        setFacingMode(prev => prev);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            {/* Header / Controls */}
            <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={onClose} className="p-2 text-white bg-black/40 rounded-full hover:bg-black/60">
                    <X className="w-6 h-6" />
                </button>
                {!previewSrc && (
                    <button onClick={toggleCamera} className="p-2 text-white bg-black/40 rounded-full hover:bg-black/60">
                        <RotateCcw className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Main View Area */}
            <div className="flex-1 w-full bg-black relative flex items-center justify-center overflow-hidden">
                {!previewSrc ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-contain ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                ) : captureType === 'photo' ? (
                    <img src={previewSrc} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                    <video src={previewSrc} controls className="w-full h-full object-contain" />
                )}
                {/* Hidden canvas for taking photos */}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Bottom Controls */}
            <div className="w-full h-32 bg-black flex items-center justify-center gap-8 pb-4">
                {!previewSrc ? (
                    <>
                        {/* Shutter Button */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={takePhoto}
                                disabled={isRecording}
                                className="w-16 h-16 rounded-full bg-white/20 border-4 border-white flex items-center justify-center hover:bg-white/40 disabled:opacity-50"
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </button>
                            {isRecording ? (
                                <button
                                    onClick={stopRecording}
                                    className="w-16 h-16 rounded-full bg-brand-red/20 border-4 border-brand-red flex items-center justify-center animate-pulse"
                                >
                                    <Square className="w-6 h-6 text-brand-red fill-brand-red" />
                                </button>
                            ) : (
                                <button
                                    onClick={startRecording}
                                    className="w-16 h-16 rounded-full bg-white/20 border-4 border-white flex items-center justify-center hover:bg-white/40"
                                >
                                    <Video className="w-8 h-8 text-white" />
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-12">
                        <button
                            onClick={handleRetake}
                            className="flex flex-col items-center gap-2 text-white/80 hover:text-white"
                        >
                            <div className="p-4 rounded-full bg-white/10">
                                <RotateCcw className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium">Retake</span>
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex flex-col items-center gap-2 text-white/80 hover:text-white"
                        >
                            <div className="p-4 rounded-full bg-brand-red">
                                <Check className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-medium">Use {captureType === 'photo' ? 'Photo' : 'Video'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraCapture;
