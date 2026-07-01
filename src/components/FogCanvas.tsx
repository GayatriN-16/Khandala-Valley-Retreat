import React, { useRef, useEffect, useState } from "react";
import { RefreshCw, Wind, Sun } from "lucide-react";
import { motion } from "motion/react";

export default function FogCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [clearedPercent, setClearedPercent] = useState(0);
  const [windSpeed, setWindSpeed] = useState(10); // km/h
  const [isAutoClearing, setIsAutoClearing] = useState(false);

  // Initialize and draw initial fog
  const initFog = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match container size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 800;
    canvas.height = rect.height || 350;

    // Draw solid fog layer
    ctx.globalCompositeOperation = "source-over";
    
    // Create misty white/gray gradient
    const grad = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      10,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 1.2
    );
    grad.addColorStop(0, "rgba(235, 240, 245, 0.98)");
    grad.addColorStop(0.5, "rgba(220, 225, 235, 0.96)");
    grad.addColorStop(1, "rgba(195, 205, 215, 0.95)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some stylized cloud patterns on top
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        80 + Math.random() * 100,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Add some guiding text
    ctx.globalCompositeOperation = "source-over";
    ctx.font = "italic 500 16px Inter, sans-serif";
    ctx.fillStyle = "rgba(47, 62, 70, 0.75)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Swipe your cursor or finger to wipe away the morning mist...",
      canvas.width / 2,
      canvas.height / 2
    );

    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "rgba(22, 101, 52, 0.6)";
    ctx.fillText(
      "🌫️ KHANDALA MONSOON FOG LAYER active",
      canvas.width / 2,
      canvas.height / 2 + 30
    );

    setClearedPercent(0);
    setIsAutoClearing(false);
  };

  useEffect(() => {
    initFog();
    
    // Handle resize
    const handleResize = () => {
      // Re-init keeps fog but scales
      initFog();
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Wind simulator effect (slowly auto-clears if wind is high)
  useEffect(() => {
    if (windSpeed > 30) {
      setIsAutoClearing(true);
      const interval = setInterval(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw multiple transparent erasures
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        
        // Horizontal wind streaks
        for (let i = 0; i < 5; i++) {
          const y = Math.random() * canvas.height;
          const x = Math.random() * canvas.width;
          const r = 50 + Math.random() * 80;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Periodically check clearing percentage
        checkCleared();
      }, 200);

      return () => clearInterval(interval);
    } else {
      setIsAutoClearing(false);
    }
  }, [windSpeed]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Client coord
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    checkCleared();
  };

  const checkCleared = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let transparentCount = 0;
      
      // Sample 1 in 10 pixels for performance
      for (let i = 3; i < pixels.length; i += 40) {
        if (pixels[i] === 0) {
          transparentCount++;
        }
      }
      
      const totalSampled = pixels.length / 40;
      const percent = Math.round((transparentCount / totalSampled) * 100);
      setClearedPercent(percent);
    } catch (e) {
      // Ignore security errors in dev if images taint canvas (we are safe here)
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-950 shadow-xl border border-emerald-900/40">
      {/* Background Image of beautiful valley sunset */}
      <div className="absolute inset-0 select-none">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200"
          alt="Sahyadri Valley Sunset at Khandala"
          className="h-full w-full object-cover brightness-105 contrast-110"
          referrerPolicy="no-referrer"
        />
        {/* Glowing warm overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-amber-900/10" />
        
        {/* Floating details that appear when fog clears */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between bg-black/45 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white pointer-events-none">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">LIVESTREAM VIEW</span>
            <h4 className="text-lg font-serif tracking-tight text-white flex items-center gap-2">
              Sahyadri Mountain Sunset
              <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" />
            </h4>
            <p className="text-xs text-neutral-300">Nestled 550 meters above sea level. Mist clears to unveil majestic rock facades.</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400 font-mono">VALLEY INCLINE</span>
            <p className="text-sm font-bold text-emerald-400">45° Cliff Drop</p>
          </div>
        </div>
      </div>

      {/* Interactive Fog Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="relative z-10 block h-[320px] w-full cursor-crosshair touch-none transition-opacity duration-300"
        onMouseDown={() => setIsDrawing(true)}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
        onMouseMove={draw}
        onTouchStart={() => setIsDrawing(true)}
        onTouchEnd={() => setIsDrawing(false)}
        onTouchMove={draw}
      />

      {/* Control bar above the image (overlay top) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-emerald-950/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 text-white shadow-lg">
          <Wind className={`h-4 w-4 text-emerald-400 ${windSpeed > 30 ? "animate-spin" : "animate-pulse"}`} />
          <span className="text-xs font-medium font-mono">
            Wind: {windSpeed} km/h {windSpeed > 30 ? "(Blowing Mist Away!)" : ""}
          </span>
        </div>

        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider font-mono">Wind Dial</span>
            <input
              type="range"
              min="5"
              max="65"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="h-1.5 w-24 accent-emerald-700 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="h-4 w-px bg-neutral-300" />

          <button
            onClick={initFog}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 hover:text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-lg transition-colors"
          >
            <RefreshCw className="h-3 w-3 animate-spin-slow" />
            Reset Mist
          </button>
        </div>
      </div>

      {/* Visual meter indicating clear percent */}
      {clearedPercent < 90 && (
        <div className="absolute right-4 bottom-20 z-20 bg-emerald-950/95 text-emerald-300 text-[10px] font-mono px-2 py-1 rounded border border-emerald-500/30">
          DEW CLEARANCE: {clearedPercent}%
        </div>
      )}
    </div>
  );
}
