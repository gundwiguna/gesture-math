import { useEffect, useRef } from 'react';
import useGestureRecognizer from "../utils/useGestureRecognizer";
import useGame from '../utils/useGame';

declare type RunningMode = "IMAGE" | "VIDEO";

const Game = () => {
  const gameInstance = useGame(15);
  const {
    gestureRecognizer,
    ready,
    setGestureParams,
    gestureMessage,
    setWebcamRunning,
    webcamRunning
  } = useGestureRecognizer(gameInstance.answerQuestion);

  const videoRef = useRef<any>();
  const gestureOutputRef = useRef<any>();
  const canvasOutputRef = useRef<any>();

  // Check if webcam access is supported.
  const hasGetUserMedia = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };
  // If webcam supported, add event listener to button for when user
  // wants to activate it.
  const enableCam = () => {
    if (!hasGetUserMedia()) {
      alert("getUserMedia() is not supported by your browser");
      return;
    }

    if (!gestureRecognizer) {
      alert("Please wait for gestureRecognizer to load");
      return;
    }

    setWebcamRunning(!webcamRunning);
  };

  useEffect(() => {
    setGestureParams({
      videoElement: videoRef.current,
      canvasOutputElement: canvasOutputRef.current,
      gestureOutputElement: gestureOutputRef.current,
    });

    (window as any).gameInstance = gameInstance;
  }, []);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={enableCam}>
          {webcamRunning ? 'Disable Camera' : 'Enable Camera'}
        </button>
        {!gameInstance.timerRunning && webcamRunning && <button onClick={gameInstance.startGame}>Start Game</button>}
        {gameInstance.timerRunning && <button onClick={gameInstance.stopTimer}>Stop Game</button>}
      </div>
      <div>Score: {gameInstance.score}</div>

      <div style={{ display: 'flex', justifyContent: 'center'}}>
        <div style={{
            width: `${gameInstance.timerRunning ? (100 - gameInstance.currentTimeProgress) : 0}%`,
            height: '5px', backgroundColor: '#FFF'
          }} className='time-left'></div>
      </div>

      <div className='question-container'>
        <div className='question-border'>
          <div className='question-board'>
            {!webcamRunning ? 'Enable Camera To Begin Playing' : gameInstance.timerRunning ? gameInstance.queLabel : 'Ready To Play'}
          </div>
        </div>
      </div>

      <div>
        <div style={{
            position: 'relative',
            transform: 'rotateY(180deg) scale(0.5) translateY(-50%)',
            marginBottom: '-50%',
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#FFF'
          }}>
          <video ref={videoRef} id="webcam" autoPlay playsInline></video>
          <canvas ref={canvasOutputRef} className="output_canvas" id="output_canvas" width="1280" height="720" style={{ position: 'absolute', left: '0px', top: '0px' }}></canvas>
          <p ref={gestureOutputRef} id='gesture_output' className="output" />
        </div>
      </div>

      <div id="prompt" style={{ display: ready && webcamRunning ? 'block' : 'none' }}>
        <h3>Classified hand gesture:</h3>
        <div id="number-container">{gestureMessage}</div>
      </div>
    </div>
  );
};

export default Game;
