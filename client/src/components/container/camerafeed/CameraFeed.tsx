import { useEffect, useRef, useState } from "react";
import "./camerafeed.css";
import offCamera from "../../../assets/OffCamera.jpg";

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
    const [cameraOn, setCameraOn] = useState(false);
    const [paused, setPaused] = useState(false);

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
        setCameraOn(false);
        setPaused(false);
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

            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            const label = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
            ctx.font = "bold 14px sans-serif";
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = "#00ff00";
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
        fetch("http://localhost:8000/frame", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
        })
            .then((res) => res.json())
            .then((data) => drawDetections(data.detections ?? []))
            .catch((err) => console.error("Frame send error:", err));
    };

    useEffect(() => {
        const captureInterval = setInterval(() => {
            sendFrame();
        }, 500);
        return () => clearInterval(captureInterval);
    }, [cameraOn, paused]);

    return (
        <div className="camera-feed-container">
            {!cameraOn && <img src={offCamera} className="camera-off-img" alt="Camera off" />}
            <div className="video-wrapper" style={{ display: cameraOn ? "block" : "none" }}>
                <video ref={videoRef} autoPlay playsInline />
                <canvas ref={overlayRef} className="detection-overlay" />
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div className="camera-controls">
                <button onClick={toggleCamera} className={cameraOn ? "btn-active" : "btn-inactive"}>
                    <span className={cameraOn ? "live-dot" : "live-dot-still"}>●</span>
                    {cameraOn ? "Live Feed" : "Turn On Camera"}
                </button>
                <button onClick={togglePause} disabled={!cameraOn} className={cameraOn && !paused ? "btn-active" : "btn-inactive"}>
                    <span>⏸</span>
                    {paused ? "Resume" : "Pause"}
                </button>
            </div>
        </div>
    );
};

export default CameraFeed;
