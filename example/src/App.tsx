import "./App.css";
import Roller from "../../src/index";

function App() {
  return (
    <div>
      <Roller
        timeoutMultipliers={{ 1: 1, 3: 3 }}
        callback={(results) => console.log(results)}
      />
      <Roller
        orientation="vertical"
        timeoutMultipliers={{ 1: 1, 3: 3 }}
        callback={(results) => console.log(results)}
      />
    </div>
  );
}

export default App;
