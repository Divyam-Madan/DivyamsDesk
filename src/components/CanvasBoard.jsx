import { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
const socket = io("https://divyamsdesk.onrender.com");

function CanvasBoard() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState("brush");
  const [eraserSize, setEraserSize] = useState(30);
  const lastPos = useRef(null);
  const [users, setUsers] = useState(1);
  const [cursors, setCursors] = useState({});
  const [backgroundColor, setBackgroundColor] = useState("#f8f9fa");
  const { roomId } = useParams();
  useEffect(() => {
  if (roomId) {
    socket.emit("join-room", roomId);
  }
}, [roomId]);

  const exportCanvas = () => {
  const canvas = canvasRef.current;
  const link = document.createElement("a");

  link.download = "canvas.png";
  link.href = canvas.toDataURL();

  link.click();
};

useEffect(() => {
  socket.on("users", (count) => {
    setUsers(count);
  });
}, []);

  const getMousePosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {

      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e) => {
  const ctx = canvasRef.current.getContext("2d");
  const { x, y } = getMousePosition(e);

  ctx.lineWidth = tool === "eraser" ? eraserSize : brushSize;

  if (tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
  }

  ctx.beginPath();
  ctx.moveTo(x, y);

  lastPos.current = { x, y };

  setDrawing(true);
};

  const draw = (e) => {
  if (!drawing) return;

  const ctx = canvasRef.current.getContext("2d");
  const { x, y } = getMousePosition(e);
  socket.emit("cursor", {
  room: roomId,
  x,
  y
});

  const last = lastPos.current;

  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(x, y);
  ctx.stroke();
  socket.emit("draw", {
  room: roomId,
  x0: last.x,
  y0: last.y,
  x1: x,
  y1: y,
  color: color,
  size: tool === "eraser" ? eraserSize : brushSize,
  tool: tool
});

  lastPos.current = { x, y };
};

useEffect(() => {
  socket.on("draw", (data) => {
    const ctx = canvasRef.current.getContext("2d");

    ctx.lineWidth = data.size;

    if (data.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = data.color;
    }

    ctx.beginPath();
    ctx.moveTo(data.x0, data.y0);
    ctx.lineTo(data.x1, data.y1);
    ctx.stroke();
  });

}, []);

useEffect(() => {
  socket.on("cursor", (data) => {
    setCursors((prev) => ({
      ...prev,
      other: { x: data.x, y: data.y }
    }));
  });
}, []);

  const stopDrawing = () => {
    setDrawing(false);
  };

  const clearCanvas = () => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  socket.emit("clear", roomId);
};
useEffect(() => {
  socket.on("clear", () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}, []);

  return (
    <div>

      {/* Toolbar */}
      <div
  style={{
    position: "fixed",
    top: 80,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#f9fafb",
    padding: "10px 20px",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    fontFamily: "sans-serif",
    zIndex: 10,
    color: "#111827"
  }}
>
        <h3 style={{margin:0, textAlign:"center"}}>
🎨 Tools
</h3>
        <h4 style={{margin:0}}>Board Settings</h4>

        <label>Board Color</label>
<input
  type="color"
  value={backgroundColor}
  onChange={(e) => setBackgroundColor(e.target.value)}
/>
<button onClick={() => setBackgroundColor("#1e1e1e")}>
Dark Mode
</button>
<button onClick={() => setBackgroundColor("#f8f9fa")}>
Light Mode
</button>


        <label>Color </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />


        <label style={{fontSize:"13px", fontWeight:"600"}}>
Brush Size
</label>
        <input
  type="range"
  min="1"
  max="20"
  value={brushSize}
  style={{ width: "80px" }}
  onChange={(e) => setBrushSize(e.target.value)}
/>
        <label>Eraser Size </label>
<input
  type="range"
  min="10"
  max="100"
  value={eraserSize}
  style={{ width: "80px" }}
  onChange={(e) => setEraserSize(e.target.value)}
/>
<button
  style={{
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    background: tool === "brush" ? "#4f46e5" : "#9ca3af",
    color: "white",
    cursor: "pointer"
  }}
  onClick={() => setTool("brush")}
>
🖌 Brush
</button>

<button
  style={{
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    background: tool === "eraser" ? "#ef4444" : "#9ca3af",
    color: "white",
    cursor: "pointer"
  }}
  onClick={() => setTool("eraser")}
>
🧽 Eraser
</button>
    <button
    style={{
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    background: "#111827",
    color: "white",
    cursor: "pointer"
  }}
  onClick={clearCanvas}
>
Clear Board
</button>

<button onClick={exportCanvas}>
Download PNG
</button>

<div>
Room: {roomId || "default"}
</div>
<button
  onClick={() =>
    navigator.clipboard.writeText(window.location.href)
  }
>
Copy Room Link
</button>

<button
  onClick={() => {
    const id = Math.random().toString(36).substring(2, 8);
    window.location.href = "/room/" + id;
  }}
>
New Room
</button>
<span>👥 {users} users</span>
      </div>

      <canvas
        ref={canvasRef}
        style={{
  border: "1px solid #ddd",
  display: "block",
  background: backgroundColor,
  cursor: tool === "eraser" ? "crosshair" : "default",
  marginTop: "60px"
}}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
      />
  {Object.values(cursors).map((c, i) => (
  <div
    key={i}
    style={{
      position: "absolute",
      left: c.x,
      top: c.y,
      width: "10px",
      height: "10px",
      background: "red",
      borderRadius: "50%",
      pointerEvents: "none"
    }}
  />
))}
    </div>
  );

}

export default CanvasBoard;