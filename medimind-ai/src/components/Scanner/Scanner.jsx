import React, { useRef, useState } from "react";

const Scanner = ({ onBack }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  // Open camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });

    videoRef.current.srcObject = stream;
  };

  // Capture photo
  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");
    setImage(dataUrl);

    recognizeImage(dataUrl);
  };

  // Send to AI recognition
  const recognizeImage = async (image) => {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer YOUR_HUGGINGFACE_API_KEY",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: image }),
        },
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onBack}>Back</button>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", borderRadius: 12 }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button onClick={startCamera}>Start Camera</button>
      <button onClick={capture}>Scan Medication</button>

      {image && (
        <div>
          <h3>Captured Image</h3>
          <img src={image} alt="captured" width="200" />
        </div>
      )}

      {result && (
        <div>
          <h3>Recognition Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Scanner;
