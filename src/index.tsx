import React, { useEffect, useRef, useState, useCallback } from "react";
import "./index.css";

const DEFAULT_TIMEOUT = 1000;

export type Result = { result: number; sides: number; bonus: number };

interface TimeoutsMap {
  [key: number]: number;
}

export interface RollerProps {
  callback: (results: Result[]) => void;
  orientation?: "vertical" | "horizontal";
  timeoutMultipliers?: TimeoutsMap;
  diceRollFn?: (sides: number) => number;
  dice?: number[];
  defaultTimeout?: number;
}

type DieButtonProps = {
  sides: number;
  handleClick: (sides: number) => void;
};

const DieButton = React.memo(({ sides, handleClick }: DieButtonProps) => {
  return (
    <div className="die-button-wrapper">
      <div onClick={() => handleClick(sides)} className="die-button">
        <div className="die-button-btn">{`d${sides}`}</div>
      </div>
    </div>
  );
});

const findTimeoutMultiplier = (
  timeouts: TimeoutsMap | undefined,
  clickCount: number
) => {
  if (!timeouts) return 1;
  const keys = Object.keys(timeouts)
    .map((k) => parseInt(k))
    .sort((a, b) => a - b);
  if (keys[0] > clickCount) return 1;
  for (const key of keys) {
    if (clickCount <= key) {
      return timeouts[key];
    }
  }
  return timeouts[keys[keys.length - 1]];
};

const rollDie = (sides: number) => {
  return Math.floor(Math.random() * sides) + 1;
};

const Roller: React.FC<RollerProps> = ({
  dice = [4, 6, 8, 10, 12, 20],
  timeoutMultipliers,
  callback,
  diceRollFn,
  defaultTimeout = DEFAULT_TIMEOUT,
  orientation = "horizontal",
}) => {
  const [clicks, setClicks] = useState<{ sides: number }[]>([]);
  const [bonus, setBonus] = useState<number>(0);
  const [loadingWidth, setLoadingWidth] = useState<number>(0);

  const clicksRef = useRef<{ sides: number }[]>([]);
  const bonusRef = useRef<number>(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasRolledRef = useRef<boolean>(false);

  const clickCount = clicks.length;
  const waiting = clickCount > 0;
  const timeoutMultiplier = findTimeoutMultiplier(
    timeoutMultipliers,
    clickCount
  );
  const timeoutDuration = timeoutMultiplier * defaultTimeout;

  // Keep refs in sync with state
  useEffect(() => {
    clicksRef.current = clicks;
  }, [clicks]);

  useEffect(() => {
    bonusRef.current = bonus;
  }, [bonus]);

  const makeRolls = useCallback(() => {
    if (hasRolledRef.current) {
      return;
    }
    hasRolledRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const output: Result[] = clicksRef.current.map(({ sides }) => ({
      result: diceRollFn ? diceRollFn(sides) : rollDie(sides),
      bonus: bonusRef.current,
      sides,
    }));
    callback(output);
    setClicks([]);
    setLoadingWidth(0);
    startTimeRef.current = null;
  }, [callback, diceRollFn]);

  const animateProgress = useCallback(() => {
    if (!startTimeRef.current) return;

    const updateProgress = () => {
      if (!startTimeRef.current) return;

      const elapsed = performance.now() - startTimeRef.current;
      const progress = Math.min((elapsed / timeoutDuration) * 100, 100);
      setLoadingWidth(progress);

      if (progress < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        animationFrameRef.current = null;
      }
    };

    updateProgress();
  }, [timeoutDuration]);

  const handleClick = useCallback(
    (sides: number) => {
      if (hasRolledRef.current) {
        hasRolledRef.current = false;
      }

      setClicks((prevClicks) => {
        const newClicks = [...prevClicks, { sides }];
        clicksRef.current = newClicks;
        return newClicks;
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      startTimeRef.current = performance.now();
      setLoadingWidth(0);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      animateProgress();

      timeoutRef.current = setTimeout(() => {
        makeRolls();
      }, timeoutDuration);
    },
    [animateProgress, makeRolls, timeoutDuration]
  );

  const rushRoll = useCallback(() => {
    if (hasRolledRef.current) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    makeRolls();
  }, [makeRolls]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={`roller-wrapper-${orientation}`}>
      <div>
        <button
          disabled={!waiting}
          onClick={rushRoll}
          className={`${waiting ? "loading-button" : ""} roll-button`}
        >
          Roll
          <div
            className="timer-indicator"
            style={{
              width: "100%",
              maxWidth: waiting ? `${(loadingWidth * 78) / 100}px` : "0px",
            }}
          ></div>
        </button>
      </div>
      <div className="bonus-container">
        <div>Bonus:</div>
        <input
          className="bonus-input"
          type="number"
          value={bonus}
          onChange={(e) => setBonus(parseInt(e.target.value) || 0)}
        />
      </div>
      {dice.map((sides) => (
        <DieButton
          key={`die-button-${sides}`}
          sides={sides}
          handleClick={handleClick}
        />
      ))}
    </div>
  );
};

export default Roller;
