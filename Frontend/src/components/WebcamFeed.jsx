import React, { useRef, useEffect } from "react";

function WebcamFeed() {
    const videoRef = useRef(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => { videoRef.current.srcObject = stream; })
            .catch(err => console.error("Camera error:", err));
    }, []);

    return <video ref={videoRef} autoPlay className="webcam-feed" />;
}

export default WebcamFeed;
