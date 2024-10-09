import "./App.css";
import Roller from "../../src/index";

function App() {
  return (
    <>
      <Roller callback={(results) => console.log(results)} />
    </>
  );
}

export default App;
