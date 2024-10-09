import React, {
  ReactElement,
  ReactHTMLElement,
  useEffect,
  useRef,
  useState,
} from "react";

console.log("roller");
const DEBOUNCE_TIMEOUT = 1000;

export type Result = { result: number; sides: number; bonus: number };

interface TimeoutsMap {
  [key: number]: number;
}

export interface RollerProps {
  callback: (results: Result[]) => void;
  timeouts?: TimeoutsMap;
  diceRollFn?: (sides: number) => number;
  dice?: number[];
}

type IconUrl = string;

export type IconMap = {
  [key: number]: IconUrl;
};

type DieButtonProps = {
  sides: number;
  handleClick: (sides: number) => () => void;
};

const findTimeout = (timeouts: TimeoutsMap, clickCount: number) => {
  const keys: number[] = Object.keys(timeouts).map((k) => parseInt(k));
  let timeout = 0;
  for (const key of keys) {
    if (timeouts[key] < clickCount) timeout = timeouts[key];
    else return timeout;
  }
  return timeout;
};

const DieButton = ({ sides, handleClick }: DieButtonProps) => {
  // const icon = iconMap[sides] ? iconMap[sides] : D12Icon;
  return (
    <div>
      <div
        onClick={handleClick(sides)}
        className="hover:cursor-pointer select-none hover:border-gray-400 hover:bg-gray-50 active:bg-gray-200 active:text-gray-800 h-10 max-w-20 flex flex-row max-h-10 mb-2 border transition rounded-sm bg-white"
      >
        {/* <img
            className="h-8 m-1 fill-current stroke-width-1 stroke-black text-red"
            src={icon}
            alt=""
          /> */}
        <div className="btn rounded-sm text-black ml-2 mt-2">{`d${sides}`}</div>
      </div>
    </div>
  );
};

const rollDie: (sides: number) => number = (sides) => {
  return Math.floor(Math.random() * sides) + 1;
};

const Roller: (props: RollerProps) => ReactElement = ({
  dice = [4, 6, 8, 10, 12, 20],
  timeouts,
  callback,
  diceRollFn,
}) => {
  const [clicks, setClicks] = useState<{ sides: number }[]>([]);
  const [bonus, setBonus] = useState<number>(0);
  const [loadingWidth, setLoadingWidth] = useState<number>(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const clickCount = clicks.length;
  const waiting = clickCount > 0;
  const timeout = timeouts
    ? findTimeout(timeouts, clickCount) * DEBOUNCE_TIMEOUT
    : DEBOUNCE_TIMEOUT;

  const adjustBonus = (amount: number) => {
    return () => {
      setBonus((prevBonus) => prevBonus + amount);
    };
  };

  const makeRolls = async () => {
    setClicks((currentClicks) => {
      let output: Result[] = [];
      currentClicks.forEach(({ sides }) => {
        output.push({
          result: diceRollFn ? diceRollFn(sides) : rollDie(sides),
          bonus,
          sides,
        });
      });
      callback(output);
      return [];
    });
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
        setLoadingWidth((prevWidth) => prevWidth + 100 / (timeout / 10));
        if (loadingWidth >= 100) {
          clearInterval(intervalRef.current);
        }
      }, 10) as unknown as number;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [clicks, timeout, loadingWidth]);

  const rushRoll = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    loadingWidth < 100 && setLoadingWidth(100);
    makeRolls();
  };

  return (
    <div>
      <h1>Dice Tower</h1>
      <div className="bg-white text-black grid h-20">
        <div>hello</div>
      </div>
      <div>
        <button
          disabled={!waiting}
          onClick={rushRoll}
          className={`${
            waiting ? "loading-button" : ""
          } bg-white text-black hover:cursor-pointer hover:bg-gray-50 border rounded-sm w-20 active:bg-gray-200 justify-between relative overflow-hidden`}
        >
          Roll
          <div
            className="bg-green-500 h-1"
            style={{ maxWidth: `${(loadingWidth * 90) / 100}px` }}
          ></div>
        </button>
      </div>
      <div>
        <div>{`Bonus: ${bonus}`}</div>
        <div className="flex flex-row justify-between max-w-20 mb-2">
          <button
            className="bg-white text-black hover:cursor-pointer hover:bg-gray-50 border rounded-sm w-9 active:bg-gray-200 justify-between"
            onClick={adjustBonus(-1)}
          >
            -
          </button>
          <button
            className="bg-white text-black hover:cursor-pointer hover:bg-gray-50 border rounded-sm w-9 active:bg-gray-200 justify-between"
            onClick={adjustBonus(1)}
          >
            +
          </button>
        </div>
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
