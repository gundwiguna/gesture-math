import React, { useCallback, useEffect, useRef, useState } from 'react';

// type GameStatus = 'Unstarted' | 'Running' | 'Stopped' | 'Winning' | 'Losing';

const useGame = (scoreToWin = 5) => {
  const [score, setScore] = React.useState(0);
  const [queLabel, setQueLabel] = React.useState('');
  const currentAnswer = React.useRef<number | null>(null);
  // const [status, setStatus] = React.useState<GameStatus>('Unstarted');

  const timerInstance = React.useRef<any>(null);
  const timeInterval = 100; // update every 0.1 seconds
  const timeoutMs = 15 * 1000; // 5 seconds
  const [currentTimeMs, setCurrentTimeMs] = React.useState(0);
  const [currentTimeProgress, setCurrentTimeProgress] = React.useState<any>(0); // only set in effect
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(false);

  useEffect(() => {
    timerRef.current = timerRunning;
  }, [timerRunning]);

  const ranodmizeNumber = (range = 9) => {
    const generated = Math.floor(Math.random() * range);
    return generated;
  };
  const generateQuestion = () => {
    const answer = ranodmizeNumber(5);
    const numberB = ranodmizeNumber(20);
    const numberA = numberB + answer;
    const label = `${numberA} - ${numberB} = ?`;

    currentAnswer.current = answer;
    setQueLabel(label);
  };

  const startTimer = () => {
    setTimerRunning(true);
    setCurrentTimeMs(0);
    clearInterval(timerInstance.current);
    timerInstance.current = setInterval(() => {
      let newTime;
      setCurrentTimeMs((prevTime) => {
        newTime = prevTime + timeInterval;
        if (newTime > timeoutMs) {
          newTime = timeoutMs;
        }
        return newTime;
      });
    }, timeInterval);
  };
  const stopTimer = () => {
    setTimerRunning(false);
  };

  // const handleTimeOut = () => {
  //     endGame();
  // };

  const startGame = () => {
    startTimer();
    generateQuestion();
    setScore(0);
  };

  const endGame = () => {
    clearInterval(timerInstance.current);
    setTimerRunning(false);
  };

  const answerQuestion = useCallback((input: number) => {
    // Don't react if game isn't running
    if (!timerRef.current) {
      console.log('NOT ANSWERED DUE TO NOT RUNNING GAME');
      return;
    }
    const inputAnswer = Number(input);

    if (inputAnswer !== undefined && inputAnswer === currentAnswer.current) {
      console.log('correctly answered');
      setScore((prevScore) => {
        let newScore = prevScore;
        if (prevScore < scoreToWin) {
          newScore = prevScore + 1;
        }
        if (scoreToWin === newScore) {
          endGame();
          return newScore;
        }
        generateQuestion();
        startTimer();
        return newScore;
      });
    }
  }, [timerRunning]);

  React.useEffect(() => {
    // When time is out
    if (currentTimeMs >= timeoutMs) {
      stopTimer();
      setCurrentTimeProgress(100);
      clearInterval(timerInstance.current);
    } else {
      const newTimeProgress = currentTimeMs / timeoutMs * 100;
      setCurrentTimeProgress(newTimeProgress.toFixed(2));
    }
  },[currentTimeMs]);

  React.useEffect(() => {
    if (!timerRunning) {
      clearInterval(timerInstance.current);
    }
    console.log(`Timer running = ${timerRunning}`);
  }, [timerRunning]);

  return {
    queLabel,
    answerQuestion,
    score,
    currentTimeProgress,
    timerRunning,
    startGame,
    stopTimer,
    endGame
  };
}

export default useGame;