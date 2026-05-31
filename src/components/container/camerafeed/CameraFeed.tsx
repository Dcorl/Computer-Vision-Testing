import { useEffect, useRef, useState } from "react";
import "./camerafeed.css"
import offCamera from "../../../assets/OffCamera.jpg";

const CameraFeed = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
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

    return (
        <div className="camera-feed-container">
            {!cameraOn && <img src={offCamera} className="camera-off-img" alt="Camera off" />}
            <video ref={videoRef} autoPlay playsInline style={{ display: cameraOn ? "block" : "none" }} />
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