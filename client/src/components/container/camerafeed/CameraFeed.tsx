import { useEffect, useRef, useState } from "react";
import "./camerafeed.css";
import { useDetections } from "../detectioncontext/DetectionContext.tsx";

interface Detection {
    label: string;
    confidence: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const CameraFeed = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const frameCountRef = useRef(0);
    const [cameraOn, setCameraOn] = useState(false);
    const [paused, setPaused] = useState(false);
    const [fps, setFps] = useState<number | null>(null);
    const { updateDetections, clearLog } = useDetections();

    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setCameraOn(true);
                setPaused(false);
            })
            .catch((err) => {
                console.error("Camera access error:", err);
                setCameraOn(false);
            });
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        clearOverlay();
        clearLog();
        setCameraOn(false);
        setPaused(false);
        setFps(null);
    };

    const toggleCamera = () => {
        cameraOn ? stopCamera() : startCamera();
    };

    const togglePause = () => {
        if (!videoRef.current) return;
        if (paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
        setPaused(!paused);
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const clearOverlay = () => {
        const overlay = overlayRef.current;
        if (!overlay) return;
        overlay.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);
    };

    const labelColor = (label: string): string => {
        let hash = 0;
        for (let i = 0; i < label.length; i++) {
            hash = (hash << 5) - hash + label.charCodeAt(i);
            hash |= 0;
        }
        const hue = ((hash % 360) + 360) % 360;
        return `hsl(${hue}, 70%, 72%)`;
    };

    const drawDetections = (detections: Detection[]) => {
        const overlay = overlayRef.current;
        const video = videoRef.current;
        if (!overlay || !video) return;

        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;
        const ctx = overlay.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, overlay.width, overlay.height);

        for (const det of detections) {
            const x = det.x1;
            const y = det.y1;
            const w = det.x2 - det.x1;
            const h = det.y2 - det.y1;
            const color = labelColor(det.label);

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            const label = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
            ctx.font = "bold 14px 'Poppins', sans-serif";
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = color;
            ctx.fillRect(x, y - 22, textWidth + 8, 22);
            ctx.fillStyle = "#000";
            ctx.fillText(label, x + 4, y - 5);
        }
    };

    const sendFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !cameraOn || paused) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg").split(",")[1];
        frameCountRef.current++;
        fetch("http://localhost:8000/frame", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
        })
            .then((res) => res.json())
            .then((data) => {
                const detections = data.detections ?? [];
                drawDetections(detections);
                updateDetections(detections.map((d: Detection) => d.label));
            })
            .catch((err) => console.error("Frame send error:", err));
    };

    useEffect(() => {
        const captureInterval = setInterval(sendFrame, 200);
        return () => clearInterval(captureInterval);
    }, [cameraOn, paused]);

    useEffect(() => {
        if (!cameraOn) { setFps(null); return; }
        const fpsInterval = setInterval(() => {
            setFps(frameCountRef.current);
            frameCountRef.current = 0;
        }, 1000);
        return () => clearInterval(fpsInterval);
    }, [cameraOn]);

    return (
        <section className="camera-section">
            <div className="camera-frame">
<video
                    ref={videoRef}
                    className="camera-video"
                    autoPlay
                    playsInline
                    style={{ display: cameraOn ? 'block' : 'none' }}
                />
                <canvas ref={overlayRef} className="detection-overlay" />
                {!cameraOn && (
                    <div className="camera-off-state">
                        <div className="camera-icon-wrap">
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="6" y="18" width="52" height="36" rx="5" stroke="#6b6b85" strokeWidth="2.5"/>
                                <circle cx="32" cy="36" r="10" stroke="#6b6b85" strokeWidth="2.5"/>
                                <circle cx="32" cy="36" r="5" stroke="#6b6b85" strokeWidth="2"/>
                                <rect x="22" y="12" width="20" height="8" rx="3" stroke="#6b6b85" strokeWidth="2"/>
                                <line x1="8" y1="8" x2="56" y2="56" stroke="#6b6b85" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className="camera-off-text">No Signal</div>
                    </div>
                )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div className="controls-bar">
                <button
                    className={`btn ${cameraOn ? 'danger' : 'primary'}`}
                    onClick={toggleCamera}
                >
                    <div className="btn-icon" />
                    {cameraOn ? 'Stop Camera' : 'Turn On Camera'}
                </button>
                <button
                    className={`btn${cameraOn && paused ? ' warn' : ''}`}
                    onClick={togglePause}
                    disabled={!cameraOn}
                >
                    {paused ? 'Resume' : 'Pause'}
                </button>
                {cameraOn && fps !== null && (
                    <div className="fps-badge">{fps} fps</div>
                )}
            </div>
        </section>
    );
};

export default CameraFeed;
