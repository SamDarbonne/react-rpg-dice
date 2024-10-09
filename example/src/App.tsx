import "./App.css";
import Roller from "../../src/index";

function App() {
  return (
    <div>
      <Roller
        timeouts={{ 1: 2, 3: 4 }}
        callback={(results) => console.log(results)}
      />
      <Roller
        orientation="vertical"
        timeouts={{ 1: 2, 3: 4 }}
        callback={(results) => console.log(results)}
      />
    </div>
  );
}

export default App;
