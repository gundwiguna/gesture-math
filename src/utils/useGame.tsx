import React from 'react';

type GameStatus = 'Unstarted' | 'Running' | 'Stopped' | 'Winning' | 'Losing';

function useGame(scoreToWin = 5) {
  const [score, setScore] = React.useState(0);
  const [queLabel, setQueLabel] = React.useState('');
  const currentAnswer = React.useRef<number | null>(null);
  const [status, setStatus] = React.useState<GameStatus>('Unstarted');

  const timerInstance = React.useRef<any>(null);
  const timeInterval = 100; // update every 0.1 seconds
  const timeoutMs = 5 * 1000; // 5 seconds
  const [currentTimeMs, setCurrentTimeMs] = React.useState(0);
  const [currentTimeProgress, setCurrentTimeProgress] = React.useState<any>(0);

  function ranodmizeNumber(range = 9) {
    const generated = Math.floor(Math.random() * range);
    return generated;
  }
  function generateQuestion() {
    const answer = ranodmizeNumber(5);
    const numberB = ranodmizeNumber(20);
    const numberA = numberB + answer;
    const label = `${numberA} - ${numberB} = ${answer}`;

    currentAnswer.current = answer;
    setQueLabel(label);
  }

  function handleTimeOut() {
      endGame();
  };

  function startGame() {
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
    setScore(0);
  }

  function endGame() {
    clearInterval(timerInstance.current);
  }

  function answerQuestion(inputAnswer: number) {
    if (inputAnswer !== undefined && inputAnswer === currentAnswer.current) {
      const newScore = score + 1;
      setScore(newScore);

      if (newScore >= scoreToWin) {
        endGame();
        return;
      }
      generateQuestion();
    }
  }

  React.useEffect(() => {
    if (currentTimeMs > timeoutMs) {
      setCurrentTimeProgress(100);
      clearInterval(timerInstance.current);
    } else {
      const newTimeProgress = currentTimeMs / timeoutMs * 100;
      setCurrentTimeProgress(newTimeProgress.toFixed(2));
    }
  },[currentTimeMs]);

  return {
    queLabel,
    answerQuestion,
    score,
    currentTimeProgress,
    startGame,
    endGame
  };
}

export default useGame;