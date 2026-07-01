import React, { useState } from "react";
import { Camera, Eye, MapPin, Sparkles, Star, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HotelPhoto {
  id: string;
  title: string;
  category: "Exterior" | "Lounge & Dining" | "Suites" | "Amenities";
  description: string;
  imageUrl: string;
  tag: string;
}

export default function HotelGallery({ onInquire }: { onInquire: (subject: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activePhoto, setActivePhoto] = useState<HotelPhoto | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // High-fidelity photos representing the actual spaces of Khandala Valley Retreat 
  // (E.g. glowing warm lights at dusk, deep green leather lounge seating, cliffside pool views)
  const photos: HotelPhoto[] = [
    {
      id: "exterior-dusk",
      title: "Resort Exterior at Dusk",
      category: "Exterior",
      description: "Our signature multi-level mountain lodge illuminated by golden fairy lights, nesting peacefully below the Sahyadri peaks in the serene valley.",
      imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
      tag: "⭐ Guest Favorite"
    },
    {
      id: "lobby-lounge",
      title: "The Valley Kitchen Lounge",
      category: "Lounge & Dining",
      description: "Our sophisticated indoor pavilion with premium deep-green leather sofas, dark-wood dining counters, and romantic ambient lighting.",
      imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
      tag: "🍲 Authentic Vibe"
    },
    {
      id: "cliffside-pool-view",
      title: "Monsoon View Infinity Pool",
      category: "Amenities",
      description: "Our pristine cliffside outdoor swimming pool built directly on the ridge edge, looking straight down into the mystical green valley.",
      imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200",
      tag: "🏊 45° Cliff Edge"
    },
    {
      id: "deluxe-glass-suite",
      title: "Floor-to-Ceiling Glass Suite",
      category: "Suites",
      description: "Elegant suites featuring full private glass sliding doors that welcome rolling clouds and cold morning mist straight onto your premium teakwood viewing deck.",
      imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200",
      tag: "🛌 Absolute Privacy"
    },
    {
      id: "outdoor-sitting",
      title: "Gated Courtyard Sitting Area",
      category: "Exterior",
      description: "Charming stone courtyard and landscaped garden lawns surrounded by tropical Sahyadri flora, perfect for hot cardamom ginger tea.",
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
      tag: "🌳 Cozy & Quiet"
    },
    {
      id: "swing-corner",
      title: "Indoor Swing & Lounge Deck",
      category: "Lounge & Dining",
      description: "Our legendary indoor recreational area featuring traditional carved swings and warm family-style dining arrangements.",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
      tag: "✨ Local Heritage"
    }
  ];

  const categories = ["All", "Exterior", "Lounge & Dining", "Suites", "Amenities"];

  const filteredPhotos = selectedCategory === "All" 
    ? photos 
    : photos.filter(p => p.category === selectedCategory);

  const openLightbox = (photo: HotelPhoto) => {
    setActivePhoto(photo);
    const index = photos.findIndex(p => p.id === photo.id);
    setActiveIndex(index);
  };

  const navigateLightbox = (direction: "next" | "prev") => {
    let nextIndex = activeIndex;
    if (direction === "next") {
      nextIndex = (activeIndex + 1) % photos.length;
    } else {
      nextIndex = (activeIndex - 1 + photos.length) % photos.length;
    }
    setActivePhoto(photos[nextIndex]);
    setActiveIndex(nextIndex);
  };

  return (
    <section className="bg-emerald-950 text-white py-16 px-4 md:px-12 border-t border-emerald-900 relative" id="hotel-gallery">
      {/* Background decoration elements */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Header content */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-emerald-900/60 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest font-bold">
              <Camera className="h-4 w-4 text-amber-400 animate-pulse" />
              AUTHENTIC RESORT GALLERY
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Visions of the <span className="text-amber-400 italic font-light">Valley Retreat</span>
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 max-w-xl">
              Step inside our private sanctuary. Browse real images of our warm, illuminated teakwood facade, luxury leather dining halls, and high-cliff swimming pool pools.
            </p>
          </div>

          {/* Category tabs selection */}
          <div className="flex flex-wrap gap-1.5 bg-emerald-900/40 p-1 rounded-xl border border-emerald-800/40">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? "bg-amber-400 text-neutral-950 shadow-md" 
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo) => (
              <motion.div
                layout
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="bg-emerald-900/20 rounded-2xl border border-emerald-850/60 overflow-hidden shadow-xl hover:shadow-2xl hover:border-emerald-700/50 transition-all flex flex-col justify-between group"
              >
                {/* Image and badges */}
                <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => openLightbox(photo)}>
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-black/10" />
                  
                  {/* Category Tag */}
                  <span className="absolute top-3 left-3 bg-emerald-950/90 text-amber-300 font-mono text-[9px] px-2.5 py-1 rounded border border-emerald-800/60 uppercase tracking-widest">
                    {photo.category}
                  </span>

                  {/* Rating Tag / Accent Tag */}
                  <span className="absolute top-3 right-3 bg-amber-400 text-emerald-950 font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md">
                    {photo.tag}
                  </span>

                  {/* Hover visual eye icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-emerald-950/45 transition-all">
                    <div className="bg-white/90 text-emerald-950 rounded-full p-3.5 shadow-xl transform scale-75 group-hover:scale-100 transition-all">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Details and interactive footer */}
                <div className="p-5 space-y-3">
                  <h3 className="font-serif text-lg font-bold text-white tracking-tight flex items-center justify-between">
                    {photo.title}
                    <span className="text-amber-400 flex items-center gap-0.5 text-xs">
                      <Star className="h-3 w-3 fill-amber-400" />
                      5.0
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {photo.description}
                  </p>
                  
                  <div className="pt-3 border-t border-emerald-900/40 flex gap-2">
                    <button
                      onClick={() => openLightbox(photo)}
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer text-center"
                    >
                      View Larger Photo
                    </button>
                    <button
                      onClick={() => onInquire(photo.title)}
                      className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                      title="Ask digital guide about this space"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Interactive Lightbox Slider */}
        <AnimatePresence>
          {activePhoto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-900 border border-emerald-800 text-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
              >
                {/* Image panel */}
                <div className="md:w-3/5 h-80 md:h-[480px] relative">
                  <img
                    src={activePhoto.imageUrl}
                    alt={activePhoto.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-emerald-950" />
                  
                  {/* Left / Right slider controls */}
                  <button
                    onClick={() => navigateLightbox("prev")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-emerald-950/80 text-white p-3 rounded-full border border-white/10 cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => navigateLightbox("next")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-emerald-950/80 text-white p-3 rounded-full border border-white/10 cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Content Details Panel */}
                <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                        {activePhoto.category} Spec
                      </span>
                      <button
                        onClick={() => setActivePhoto(null)}
                        className="text-neutral-400 hover:text-white text-xs bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
                      {activePhoto.title}
                    </h3>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {activePhoto.description}
                    </p>

                    <div className="bg-emerald-950/80 p-3.5 rounded-xl border border-emerald-800/40 space-y-1">
                      <span className="text-[9px] font-mono text-neutral-400 block uppercase">GROUNDING COORDINATES</span>
                      <p className="text-xs text-amber-300 font-serif flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-amber-400" />
                        Khandala Valley Retreat, Maharashtra
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-emerald-800/40">
                    <button
                      onClick={() => {
                        onInquire(activePhoto.title);
                        setActivePhoto(null);
                      }}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Inquire with Virtual Concierge
                    </button>
                    <a
                      href="#booking-engine"
                      onClick={() => setActivePhoto(null)}
                      className="w-full text-center bg-white/10 hover:bg-white/15 border border-white/20 font-bold text-xs tracking-wider uppercase py-3 rounded-xl transition-all"
                    >
                      Check Room Rates
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
