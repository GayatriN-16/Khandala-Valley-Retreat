import React, { useState } from "react";
import { Rotate3d, MapPin, Compass, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Hotspot {
  id: string;
  name: string;
  description: string;
  x: number; // percentage coordinates
  y: number;
  icon: string;
}

export default function ValleyMap() {
  const [rotation, setRotation] = useState(0); // 3D rotation steps: 0, 90, 180, 270
  const [selectedSpot, setSelectedSpot] = useState<Hotspot | null>(null);

  const hotspots: Hotspot[] = [
    {
      id: "villas",
      name: "13 Premium Boutique Rooms",
      description: "Ultra-spacious (37.2 sq.m) private sanctuaries featuring floor-to-ceiling glass and private balconies looking straight into the canyon.",
      x: 35,
      y: 45,
      icon: "🏨"
    },
    {
      id: "pool",
      name: "Cliffside Outdoor Pool",
      description: "Our pristine infinity-style swimming pool built right on the gorge edge, looking directly out over the Sahyadri peaks.",
      x: 65,
      y: 35,
      icon: "🏊"
    },
    {
      id: "kitchen",
      name: "The Valley Kitchen",
      description: "Authentic multi-cuisine dining serving legendary local Maharashtrian specialties and excellent continental dishes.",
      x: 50,
      y: 65,
      icon: "🍲"
    },
    {
      id: "gated",
      name: "Main Secure Entrance",
      description: "Our secure, high-end private entrance, keeping out commercial traffic and public noise.",
      x: 15,
      y: 75,
      icon: "🚧"
    }
  ];

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="bg-emerald-950 text-white rounded-2xl p-5 border border-emerald-900/50 shadow-xl flex flex-col justify-between h-full min-h-[480px]">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-amber-400 animate-spin-slow" />
            <h3 className="font-serif text-lg font-medium tracking-tight">3D Valley Map</h3>
          </div>
          <span className="text-[10px] font-mono bg-emerald-900/80 px-2 py-0.5 rounded text-amber-400 font-bold">
            DUKES DEN COLONY
          </span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed mb-4">
          Witness our precise geographic coordinates. We sit nestled away from Khandala’s main roads, overlooking a shear 45° cliff face.
        </p>
      </div>

      {/* Stylized 3D Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4 bg-emerald-900/25 rounded-xl border border-emerald-800/40 py-8">
        
        {/* Isometric Grid & Cliffs container */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 70, damping: 15 }}
          className="relative w-72 h-72 origin-center transform"
          style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
        >
          {/* Main Landscape Island */}
          <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
            {/* The Deep Cliff Shadow & Gorge (Left bottom) */}
            <path
              d="M 50,220 L 200,320 L 350,200 L 200,100 Z"
              fill="#064e3b"
              opacity="0.6"
            />
            {/* 3D Sides of the Cliff Island */}
            <path
              d="M 200,320 L 350,200 L 350,250 L 200,370 Z"
              fill="#022c22"
            />
            <path
              d="M 50,220 L 200,320 L 200,370 L 50,270 Z"
              fill="#047857"
            />

            {/* Cliff Island Top Surface (Lush Green Grasslands) */}
            <polygon
              points="50,220 200,320 350,200 200,100"
              fill="#059669"
              stroke="#047857"
              strokeWidth="2"
            />

            {/* Stylized Gorge Depth lines on right */}
            <path
              d="M 350,200 Q 380,240 390,290"
              stroke="rgba(245, 158, 11, 0.2)"
              strokeWidth="3"
              fill="none"
            />

            {/* Gated community fence lines */}
            <path
              d="M 120,266 L 80,240 L 140,200"
              stroke="#064e3b"
              strokeWidth="4"
              fill="none"
              opacity="0.4"
            />

            {/* Turquoise Cliffside Infinity Pool right on the edge */}
            <polygon
              points="240,210 290,215 310,185 260,180"
              fill="#06b6d4"
              stroke="#22d3ee"
              strokeWidth="1.5"
            />
            
            {/* Sparkling Pool Highlights */}
            <polygon
              points="250,205 285,210 295,195 260,190"
              fill="rgba(255, 255, 255, 0.4)"
            />

            {/* 13 Boutique Rooms (Drawn as stylized luxurious cubic cabins) */}
            {/* Cabin 1 (Valley facing) */}
            <g transform="translate(130, 160)">
              <polygon points="0,15 20,5 40,15 20,25" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
              <polygon points="0,15 20,25 20,40 0,30" fill="#fef08a" opacity="0.8" />
              <polygon points="40,15 20,25 20,40 40,30" fill="#eab308" />
              {/* Glass Patio highlight */}
              <line x1="5" y1="21" x2="15" y2="26" stroke="#22d3ee" strokeWidth="2" />
            </g>

            {/* Cabin 2 (Garden Facing) */}
            <g transform="translate(180, 120)">
              <polygon points="0,15 20,5 40,15 20,25" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
              <polygon points="0,15 20,25 20,40 0,30" fill="#fef08a" opacity="0.8" />
              <polygon points="40,15 20,25 20,40 40,30" fill="#eab308" />
            </g>

            {/* Cabin 3 (The Suite) */}
            <g transform="translate(160, 210)">
              <polygon points="0,18 25,6 50,18 25,30" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
              <polygon points="0,18 25,30 25,48 0,36" fill="#fde047" opacity="0.8" />
              <polygon points="50,18 25,30 25,48 50,36" fill="#ca8a04" />
            </g>

            {/* The Valley Kitchen restaurant building */}
            <g transform="translate(210, 240)">
              <polygon points="0,15 30,5 60,15 30,25" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
              <polygon points="0,15 30,25 30,45 0,35" fill="#f97316" opacity="0.8" />
              <polygon points="60,15 30,25 30,45 60,35" fill="#ea580c" />
            </g>

            {/* Landscaped garden palm trees (Green circles with brown trunk) */}
            <g transform="translate(100, 180)">
              <line x1="10" y1="10" x2="10" y2="30" stroke="#78350f" strokeWidth="3" />
              <circle cx="10" cy="8" r="12" fill="#047857" opacity="0.9" />
              <circle cx="10" cy="8" r="8" fill="#10b981" />
            </g>
            <g transform="translate(280, 140)">
              <line x1="10" y1="10" x2="10" y2="30" stroke="#78350f" strokeWidth="3" />
              <circle cx="10" cy="8" r="10" fill="#047857" opacity="0.9" />
              <circle cx="10" cy="8" r="6" fill="#10b981" />
            </g>
          </svg>

          {/* Interactive Absolute Hotspots (Compensate reverse rotation to stay upright) */}
          {hotspots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => setSelectedSpot(spot)}
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
              }}
              className="absolute z-30 flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-900 border-2 border-white shadow-lg cursor-pointer transform hover:scale-125 active:scale-95 transition-all"
            >
              <span className="text-sm leading-none">{spot.icon}</span>
            </button>
          ))}
        </motion.div>

        {/* Scenic mountain compass needle */}
        <div className="absolute top-3 right-3 text-emerald-400/50 flex flex-col items-center gap-1">
          <span className="text-[10px] font-mono tracking-widest font-bold">NORTH</span>
          <Compass className="h-6 w-6 animate-pulse" />
        </div>
      </div>

      {/* Details Box */}
      <div className="mt-2 min-h-[96px] bg-emerald-900/50 rounded-xl p-3 border border-emerald-800/40 relative">
        <AnimatePresence mode="wait">
          {selectedSpot ? (
            <motion.div
              key={selectedSpot.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs"
            >
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                <span>{selectedSpot.icon}</span>
                {selectedSpot.name}
              </h4>
              <p className="text-neutral-200 leading-relaxed text-[11px]">{selectedSpot.description}</p>
              <button
                onClick={() => setSelectedSpot(null)}
                className="absolute top-2 right-2 text-neutral-400 hover:text-white font-mono text-[9px] uppercase font-bold tracking-wider"
              >
                Clear
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center py-2 h-full"
            >
              <Info className="h-4 w-4 text-amber-400/70 mb-1" />
              <p className="text-[11px] text-emerald-200">
                Tap on any <span className="text-amber-400 font-bold">hotspot icon</span> in the 3D map to view amenities and private resort features.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trigger Button explicitly called out in Virtual Concierge prompting guidelines */}
      <button
        onClick={handleRotate}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold py-2.5 px-4 rounded-xl shadow-lg cursor-pointer hover:shadow-amber-500/10 active:scale-[0.98] transition-all"
      >
        <Rotate3d className="h-4 w-4 animate-spin-slow text-emerald-950" />
        <span className="font-sans text-xs tracking-wider uppercase">Rotate 3D Valley Map</span>
      </button>
    </div>
  );
}
