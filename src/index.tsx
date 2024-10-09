import React, { useEffect, useRef, useState } from "react";

import "./index.css";

console.log("roller");
const DEFAULT_TIMEOUT = 1000;

export type Result = { result: number; sides: number; bonus: number };

interface TimeoutsMap {
  [key: number]: number;
}

export interface RollerProps {
  callback: (results: Result[]) => void;
  orientation?: "vertical" | "horizontal";
  timeouts?: TimeoutsMap;
  diceRollFn?: (sides: number) => number;
  dice?: number[];
  defaultTimeout?: number;
}

type IconUrl = string;

export type IconMap = {
  [key: number]: IconUrl;
};

type DieButtonProps = {
  sides: number;
  handleClick: (sides: number) => () => void;
};

const findTimeoutMultiplier = (timeouts: TimeoutsMap, clickCount: number) => {
  const keys: number[] = Object.keys(timeouts).map((k) => parseInt(k));
  let timeoutMultiplier = 1;
  for (const key of keys) {
    if (key <= clickCount) timeoutMultiplier = timeouts[key];
    else return timeoutMultiplier;
  }
  return timeoutMultiplier;
};

const DieButton = ({ sides, handleClick }: DieButtonProps) => {
  // const icon = iconMap[sides] ? iconMap[sides] : D12Icon;
  return (
    <div>
      <div onClick={handleClick(sides)} className="die-button">
        {/* <img
            className="h-8 m-1 fill-current stroke-width-1 stroke-black text-red"
            src={icon}
            alt=""
          /> */}
        <div className="die-button-btn">{`d${sides}`}</div>
      </div>
    </div>
  );
};

const rollDie: (sides: number) => number = (sides) => {
  return Math.floor(Math.random() * sides) + 1;
};

const Roller: React.FC<RollerProps> = ({
  dice = [4, 6, 8, 10, 12, 20],
  timeouts,
  callback,
  diceRollFn,
  defaultTimeout,
  orientation = "horizontal",
}) => {
  const [clicks, setClicks] = useState<{ sides: number }[]>([]);
  const [bonus, setBonus] = useState<number>(0);
  const [loadingWidth, setLoadingWidth] = useState<number>(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debounceTimeout = defaultTimeout || DEFAULT_TIMEOUT;
  const clickCount = clicks.length;
  const waiting = clickCount > 0;
  const timeout = timeouts
    ? findTimeoutMultiplier(timeouts, clickCount) * debounceTimeout
    : debounceTimeout;

  const makeRolls = async () => {
    setClicks((currentClicks) => {
      const output: Result[] = currentClicks.map(({ sides }) => ({
        result: diceRollFn ? diceRollFn(sides) : rollDie(sides),
        bonus,
        sides,
      }));
      callback(output);
      return [];
    });
    setLoadingWidth(0); // Reset the loading width after rolling
  };

  const handleClick = (sides: number) => {
    return () => {
      setClicks((prevClicks) => [...prevClicks, { sides }]);
      setLoadingWidth(0);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        makeRolls();
      }, timeout);
    };
  };

  useEffect(() => {
    if (clicks.length > 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setLoadingWidth((prevWidth) => {
          const increment = 100 / (timeout / 10);
          const newWidth = prevWidth + increment;

          if (newWidth >= 100) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
            return 100;
          }

          return newWidth;
        });
      }, 0) as unknown as NodeJS.Timeout;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [clicks, timeout]);

  const rushRoll = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setLoadingWidth(100);
    makeRolls();
  };

  return (
    <div className={`roller-wrapper-${orientation}`}>
      <div>
        <button
          disabled={true}
          onClick={rushRoll}
          className={`${waiting ? "loading-button" : ""} roll-button`}
        >
          <div className="roll-button-text">Roll</div>
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
          onChange={(e) => setBonus(parseInt(e.target.value))}
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
