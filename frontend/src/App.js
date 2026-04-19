import './App.css';
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="app-container">
      <div className="main-box">
        <Outlet />
      </div>
    </div>
  );
}

export default App;