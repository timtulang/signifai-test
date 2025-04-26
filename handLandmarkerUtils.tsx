import {
    HandLandmarker,
    FilesetResolver
  } from '@mediapipe/tasks-vision';
  
  let handLandmarker: HandLandmarker;
  let lastVideoTime = -1;
  let results: any;
  const HAND_CONNECTIONS = [
    [0,1], [1,2], [2,3], [3,4],       // Thumb
    [0,5], [5,6], [6,7], [7,8],       // Index
    [5,9], [9,10], [10,11], [11,12],  // Middle
    [9,13], [13,14], [14,15], [15,16],// Ring
    [13,17], [17,18], [18,19], [19,20],// Pinky
    [0,17]                            // Palm base to pinky
  ];
  
  export const initializeHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
  
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });
  };
  
  export const startWebcamAndDetect = ( // Call to use
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
  ) => {
    const constraints = { video: true };
  
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => predictWebcam(videoRef, canvasRef));
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });
  };
  const drawConnections = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
  
    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
  
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    }
  };
  
  const predictWebcam = async (
    videoRef: React.RefObject<HTMLVideoElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
  ) => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
  
    // Set canvas size to match the video frame size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    if (lastVideoTime !== video.currentTime) {
      const startTimeMs = performance.now();
      lastVideoTime = video.currentTime;
      results = handLandmarker.detectForVideo(video, startTimeMs);
    }
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    if (results?.landmarks) {
      for (const landmarks of results.landmarks) {
        drawConnections(ctx, landmarks, video.videoWidth, video.videoHeight);
        
        for (const landmark of landmarks) {
          ctx.beginPath();
          ctx.arc(landmark.x * video.videoWidth, landmark.y * video.videoHeight, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      }
    }
  
    
    window.requestAnimationFrame(() => predictWebcam(videoRef, canvasRef));
  };