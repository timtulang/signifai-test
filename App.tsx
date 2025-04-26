import React, { useEffect, useRef } from 'react';
import { initializeHandLandmarker, startWebcamAndDetect } from './handLandmarkerUtils';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const setup = async () => {
      await initializeHandLandmarker();
      startWebcamAndDetect(videoRef, canvasRef);
    };

    setup();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        id="webcam"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        id="output_canvas"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default App;