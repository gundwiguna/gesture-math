import { useEffect, useRef } from 'react';
import useGestureRecognizer from "../utils/useGestureRecognizer";

declare type RunningMode = "IMAGE" | "VIDEO";

function Game() {
  const {
    gestureRecognizer,
    ready,
    setGestureParams,
    gestureMessage,
    setWebcamRunning,
    webcamRunning
  } = useGestureRecognizer();

  const videoRef = useRef<any>();
  const gestureOutputRef = useRef<any>();
  const canvasOutputRef = useRef<any>();

  // Check if webcam access is supported.
  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  // If webcam supported, add event listener to button for when user
  // wants to activate it.
  function enableCam() {
    if (!hasGetUserMedia()) {
      alert("getUserMedia() is not supported by your browser");
      return;
    }

    if (!gestureRecognizer) {
      alert("Please wait for gestureRecognizer to load");
      return;
    }

    setWebcamRunning(!webcamRunning);
  }

  function ranodmizeNumber(range = 9) {
    const generated = Math.floor(Math.random() * range);
    return generated;
  }
  function generateQuestion() {
    const answer = ranodmizeNumber(5);
    const numberB = ranodmizeNumber(20);
    const numberA = numberB + answer;
    const label = `${numberA} - ${numberB} = ${answer}`;
    return label;
  }

  useEffect(() => {
    setGestureParams({
      videoElement: videoRef.current,
      canvasOutputElement: canvasOutputRef.current,
      gestureOutputElement: gestureOutputRef.current,
    });
    for (let i = 0; i < 10; i++) {
      console.log(generateQuestion());
    }
  }, []);
  return (
    <div>
      <button onClick={enableCam}>
        {webcamRunning ? 'Disable Prediction' : 'Enable Prediction'}
      </button>
      <div style={{ position: 'relative', transform: 'rotateY(180deg)' }}>
        <video ref={videoRef} id="webcam" autoPlay playsInline></video>
        <canvas ref={canvasOutputRef} className="output_canvas" id="output_canvas" width="1280" height="720" style={{ position: 'absolute', left: '0px', top: '0px' }}></canvas>
        <p ref={gestureOutputRef} id='gesture_output' className="output" />
      </div>

      <div id="prompt" style={{ display: ready ? 'block' : 'none' }}>
        <h3>Classified hand gesture:</h3>
        <div id="number-container">{gestureMessage}</div>
      </div>
    </div>
  );
}

export default Game;
