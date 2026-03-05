import { BrowserRouter, Routes, Route } from "react-router-dom";
import CanvasBoard from "./components/CanvasBoard";

function App() {
  return (
    <BrowserRouter>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "60px",
          background: "#111827",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "600"
        }}
      >
        Collaborative Canvas
      </div>

      <Routes>
        <Route path="/" element={<CanvasBoard />} />
        <Route path="/room/:roomId" element={<CanvasBoard />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;