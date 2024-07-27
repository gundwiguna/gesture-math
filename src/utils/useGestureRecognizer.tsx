import {
  GestureRecognizer,
  DrawingUtils,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from 'react';
// import { predictWebcam } from "./predict";

declare type RunningMode = "IMAGE" | "VIDEO";

const useGestureRecognizer = (resultCallback?: any) => {
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
  const [ready, setready] = useState<boolean>(false);
  let runningMode: RunningMode = "IMAGE";

  const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    const gr = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/numbers2.task",
        delegate: "GPU"
      },
      runningMode: runningMode
    });
    setready(true);
    setGestureRecognizer(gr);
  };

  useEffect(() => {
    createGestureRecognizer();
  }, []);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [gestureMessage, setGestureMessage] = useState('');
  const [gestureParams, setGestureParams] = useState<any>({
    videoElement: null,
    canvasOutputElement: null,
    gestureOutputElement: null,
  });
  const lastVideoTime = useRef(-1);
  const resultsRef = useRef<any>();
  // const stream = useRef();
  const videoHeight = "360px";
  const videoWidth = "480px";

  useEffect(() => {
    const { videoElement } = gestureParams;

    if (videoElement && videoElement.srcObject && !webcamRunning) {
      videoElement.srcObject.getTracks().forEach((track: any) => {
        track.stop();
      });
    }

    if (!webcamRunning || !videoElement) {
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
      videoElement.srcObject = stream;
      videoElement.addEventListener("loadeddata", predictWebcam);
    });
  }, [webcamRunning, gestureParams]);


  const predictWebcam = async () => {
    const { videoElement, canvasOutputElement, gestureOutputElement } = gestureParams;
    if (!gestureRecognizer || !videoElement || !canvasOutputElement || !gestureOutputElement) {
      return;
    }
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }
    if (videoElement.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = videoElement.currentTime;
      resultsRef.current = gestureRecognizer.recognizeForVideo(videoElement, Date.now());
    }
    
    const canvasCtx = canvasOutputElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasOutputElement.width, canvasOutputElement.height);
    const drawingUtils = new DrawingUtils(canvasCtx);

    canvasOutputElement.style.height = videoHeight;
    videoElement.style.height = videoHeight;
    canvasOutputElement.style.width = videoWidth;
    videoElement.style.width = videoWidth;

    if (resultsRef.current.landmarks) {
      for (const landmarks of resultsRef.current.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          GestureRecognizer.HAND_CONNECTIONS,
          {
            color: "#55FF55",
            lineWidth: 5
          }
        );
        drawingUtils.drawLandmarks(landmarks, {
          color: "#FF5555",
          lineWidth: 2
        });
      }
    }
    canvasCtx.restore();
    if (resultsRef.current.gestures.length > 0) {
      gestureOutputElement.style.display = "none" || "block"; // disabled
      gestureOutputElement.style.width = videoWidth;
      const categoryName = resultsRef.current.gestures[0][0].categoryName;
      const categoryScore = parseFloat(
        resultsRef.current.gestures[0][0].score * 100 as any
      ).toFixed(2);
      const handedness = resultsRef.current.handednesses[0][0].displayName;
      setGestureMessage(`GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`);
      if (resultCallback) {
        resultCallback(categoryName);
      }
    } else {
      gestureOutputElement.style.display = "none";
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
  }


  return {
    gestureRecognizer,
    ready,
    webcamRunning,
    setWebcamRunning,
    predictWebcam,
    gestureMessage,
    setGestureParams
  };
};

export default useGestureRecognizer;