import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Utensils, 
  Calendar, 
  Users, 
  ChevronRight, 
  Wifi, 
  Tv, 
  Maximize, 
  Coffee, 
  Send, 
  Bot, 
  User, 
  CheckCircle, 
  Clock, 
  Map, 
  Phone, 
  Sliders,
  AlertCircle,
  ShieldCheck,
  Star,
  MessageSquare,
  Mail,
  Compass,
  Heart,
  Trash2,
  LogOut,
  Lock,
  Unlock,
  FileText,
  LayoutDashboard
} from "lucide-react";
import FogCanvas from "./components/FogCanvas";
import ValleyMap from "./components/ValleyMap";
import HotelGallery from "./components/HotelGallery";
import { Room, Booking, MenuItem, MenuCategory, Message } from "./types";

export default function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [menu, setMenu] = useState<any>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("valley-deluxe");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    guestName: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: 2
  });
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // New States for requested sections
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // Review Form state
  const [reviewForm, setReviewForm] = useState({
    author: "",
    rating: 5,
    comment: "",
    room: "Deluxe Valley View Suite"
  });
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Contact Form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Admin Portal states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAdminSignupModalOpen, setIsAdminSignupModalOpen] = useState(false);
  const [adminIsSetup, setAdminIsSetup] = useState(true);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("adminToken") || null);
  const [adminContacts, setAdminContacts] = useState<any[]>([]);
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminTab, setAdminTab] = useState<"bookings" | "contacts" | "reviews">("bookings");

  useEffect(() => {
    fetch("/api/admin/status")
      .then(res => res.json())
      .then(data => setAdminIsSetup(data.isSetup))
      .catch(console.error);
  }, []);

  const fetchAdminData = () => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Error fetching bookings:", err));

    fetch("/api/contacts")
      .then((res) => res.json())
      .then((data) => setAdminContacts(data))
      .catch((err) => console.error("Error fetching contacts:", err));
  };

  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
    }
  }, [adminToken]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminToken(data.token);
        localStorage.setItem("adminToken", data.token);
        setIsAdminLoginModalOpen(false);
        setIsAdminMode(true);
        setAdminUsername("");
        setAdminPassword("");
      } else {
        setAdminLoginError(data.error || "Login failed");
      }
    } catch (err) {
      setAdminLoginError("Server communication error");
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem("adminToken");
    setIsAdminMode(false);
  };

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    try {
      const response = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminToken(data.token);
        localStorage.setItem("adminToken", data.token);
        setIsAdminSignupModalOpen(false);
        setIsAdminMode(true);
        setAdminUsername("");
        setAdminPassword("");
        setAdminIsSetup(true);
      } else {
        setAdminLoginError(data.error || "Signup failed");
      }
    } catch (err) {
      setAdminLoginError("Server communication error");
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Namaste & Welcome! 🏔️ I am your elite **Virtual Concierge** at the **Khandala Valley Retreat**. Nestled right on the cliff's edge, we offer 13 private, ultra-spacious sanctuaries with floor-to-ceiling glass balconies looking into the raw beauty of the Sahyadri peaks.\n\nHow can I help you customize your dream escape today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch initial room & menu data
  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
        if (data.length > 0) setSelectedRoomId(data[0].id);
      })
      .catch((err) => console.error("Error fetching rooms:", err));

    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => setMenu(data))
      .catch((err) => console.error("Error fetching menu:", err));

    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Error fetching bookings:", err));

    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error("Error fetching services:", err));

    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // Handle send message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages
        })
      });
      const data = await response.json();
      
      const botMsg: Message = {
        id: "msg-" + (Date.now() + 1),
        sender: "bot",
        text: data.reply || "I am here to guide you directly. Let's arrange your premium stay!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: "msg-err",
        sender: "bot",
        text: "The misty valley winds interrupted my connection temporarily! However, I am still ready to assist. You can directly browse our room catalog and place a secure booking below.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Pre-configured chips
  const chatSuggestions = [
    "Tell me about the boutique room features",
    "Show me local sights & weekend itinerary",
    "What are today's chef specials at The Valley Kitchen?",
    "How do I book a room?"
  ];

  // Submit Booking Form
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess(null);
    setIsSubmittingBooking(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingForm,
          roomId: selectedRoomId
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to finalize booking");
      }
      setBookingSuccess(data);
      // Re-fetch booking history
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((d) => setBookings(d));
      
      // Reset form
      setBookingForm({
        guestName: "",
        email: "",
        checkIn: "",
        checkOut: "",
        guests: 2
      });
    } catch (err: any) {
      setBookingError(err.message || "Something went wrong.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Submit Review Form
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess(false);
    setIsSubmittingReview(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit review");
      }
      const newReview = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setReviewSuccess(true);
      setReviewForm({
        author: "",
        rating: 5,
        comment: "",
        room: "Deluxe Valley View Suite"
      });
    } catch (err: any) {
      setReviewError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Submit Contact Form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError("");
    setContactSuccess(false);
    setIsSubmittingContact(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit message");
      }
      setContactSuccess(true);
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (err: any) {
      setContactError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleInquireGallery = (subject: string) => {
    handleSendMessage(`Namaste, can you tell me more about the "${subject}" at Khandala Valley Retreat? I saw it on the 3D gallery.`);
    const element = document.getElementById("concierge-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-amber-100 selection:text-emerald-950 font-sans">
      {/* Top Energetic Announcement Bar */}
      <div className="bg-emerald-950 text-amber-400 py-2.5 px-4 text-center text-xs font-mono tracking-widest border-b border-emerald-900 uppercase font-semibold flex items-center justify-center gap-2">
        <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
        <span>Monsoon Bliss Escape: Experience Mystical Morning Fog Rolling Directly Into Your Private Viewing Deck!</span>
        <span className="hidden md:inline">| Secure Gated Sanctuary</span>
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 py-4 px-6 md:px-12 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-900 text-white p-2.5 rounded-xl shadow-md">
            <Building2 className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold tracking-tight text-emerald-950">
              KHANDALA VALLEY <span className="text-amber-600 font-sans font-light tracking-wide">RETREAT</span>
            </h1>
            <p className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-emerald-700" /> Kune Village, Khandala, Maharashtra, India
            </p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wider text-neutral-700 uppercase animate-fade-in">
          <a href="#hero" className="hover:text-emerald-800 transition-colors">Home</a>
          <a href="#about" className="hover:text-emerald-800 transition-colors">About</a>
          <a href="#services" className="hover:text-emerald-800 transition-colors">Services</a>
          <a href="#dining" className="hover:text-emerald-800 transition-colors">Menu</a>
          <a href="#reviews" className="hover:text-emerald-800 transition-colors">Reviews</a>
          <a href="#contact" className="hover:text-emerald-805 transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              const element = document.getElementById("dining");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
            id="The Valley Kitchen"
            className="hidden md:flex items-center gap-2 text-xs font-bold text-emerald-900 border border-emerald-900/30 px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition-all uppercase tracking-wider"
          >
            <Utensils className="h-4 w-4" />
            The Valley Kitchen Menu
          </button>
          
          <a 
            href="#booking-engine"
            className="bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs px-5 py-3 rounded-xl tracking-wider uppercase transition-all shadow-md shadow-emerald-900/10 active:scale-[0.98] cursor-pointer"
          >
            Book Stay
          </a>
        </div>
      </header>

      {isAdminMode ? (
        <main className="bg-neutral-100 min-h-[calc(100vh-80px)] py-10 px-4 md:px-12">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Upper Action/Header Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    🔐 COORDINATOR MODE ACTIVE
                  </span>
                  <span className="bg-neutral-100 text-neutral-600 font-mono text-[10px] font-medium px-2.5 py-1 rounded-full uppercase">
                    Khandala Valley Retreat
                  </span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-emerald-950">
                  Khandala Valley Retreat Controller
                </h2>
                <p className="text-xs text-neutral-500">
                  Manage digital room reservations, incoming traveler enquiries, and public traveler guestbook stories.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAdminMode(false)}
                  className="bg-neutral-100 text-neutral-850 hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl border border-neutral-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="h-4 w-4 text-emerald-800" />
                  View Guest Site
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1 */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4 text-left">
                <div className="bg-emerald-900/5 text-emerald-800 p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-emerald-850" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase block">Total Bookings</span>
                  <span className="text-2xl font-bold font-serif text-emerald-950">{bookings.length}</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4 text-left">
                <div className="bg-amber-500/10 text-amber-600 p-3 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase block">Total Guests</span>
                  <span className="text-2xl font-bold font-serif text-emerald-950">
                    {bookings.reduce((sum, b) => sum + (b.guests || 2), 0)}
                  </span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4 text-left">
                <div className="bg-blue-50 text-blue-700 p-3 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase block">Direct Inquiries</span>
                  <span className="text-2xl font-bold font-serif text-emerald-950">{adminContacts.length}</span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4 text-left">
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
                  <Sparkles className="h-6 w-6 text-emerald-855" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase block">Est. Booked Value</span>
                  <span className="text-xl font-bold font-serif text-emerald-950">
                    ₹{bookings.reduce((sum, b) => {
                      const priceStr = b.roomId === "royal-duplex" ? "19500" : b.roomId === "garden-premium" ? "14000" : "12500";
                      return sum + parseInt(priceStr);
                    }, 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Navigation Tabs */}
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setAdminTab("bookings")}
                className={`py-3.5 px-6 font-serif text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === "bookings"
                    ? "border-emerald-800 text-emerald-950 bg-white rounded-t-xl"
                    : "border-transparent text-neutral-500 hover:text-emerald-805"
                }`}
              >
                <Calendar className="h-4 w-4" />
                Reservations ({bookings.length})
              </button>
              <button
                onClick={() => setAdminTab("contacts")}
                className={`py-3.5 px-6 font-serif text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === "contacts"
                    ? "border-emerald-800 text-emerald-950 bg-white rounded-t-xl"
                    : "border-transparent text-neutral-500 hover:text-emerald-805"
                }`}
              >
                <FileText className="h-4 w-4" />
                Inquiries & Contacts ({adminContacts.length})
              </button>
              <button
                onClick={() => setAdminTab("reviews")}
                className={`py-3.5 px-6 font-serif text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  adminTab === "reviews"
                    ? "border-emerald-800 text-emerald-950 bg-white rounded-t-xl"
                    : "border-transparent text-neutral-500 hover:text-emerald-805"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Traveler Guestbook ({reviews.length})
              </button>
            </div>

            {/* Tab content area */}
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 md:p-8">
              {adminTab === "bookings" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-100 text-left">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-emerald-950">Active Stay Reservations</h3>
                      <p className="text-xs text-neutral-500">Live booking logs fetched from Khandala Valley Retreat databases.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                          <th className="py-3 px-4">Booking ID</th>
                          <th className="py-3 px-4">Guest Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Suite / Villa Type</th>
                          <th className="py-3 px-4 text-center">Dates</th>
                          <th className="py-3 px-4 text-center">Guests</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length > 0 ? (
                          bookings.map((b) => (
                            <tr key={b.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors text-xs text-neutral-700">
                              <td className="py-4 px-4 font-mono font-bold text-emerald-900">{b.id}</td>
                              <td className="py-4 px-4 font-serif font-bold text-neutral-900">{b.guestName}</td>
                              <td className="py-4 px-4">{b.email}</td>
                              <td className="py-4 px-4 font-semibold">
                                <span className="bg-emerald-50 text-emerald-800 font-mono text-[10px] px-2 py-0.5 rounded-md">
                                  🏨 {b.roomName}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center font-mono">
                                <span className="text-emerald-800 font-bold">{b.checkIn}</span>
                                <span className="text-neutral-400 mx-1.5">to</span>
                                <span className="text-emerald-800 font-bold">{b.checkOut}</span>
                              </td>
                              <td className="py-4 px-4 text-center font-mono font-bold">{b.guests}</td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-block text-[9px] font-mono font-bold px-2.5 py-1 rounded-md uppercase ${
                                  b.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" :
                                  b.status === "Checked In" ? "bg-amber-105 text-amber-800 bg-amber-50" :
                                  b.status === "Completed" ? "bg-blue-100 text-blue-800" :
                                  "bg-neutral-100 text-neutral-500"
                                }`}>
                                  ● {b.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {b.status === "Confirmed" && (
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, "Checked In")}
                                      className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg uppercase tracking-wider cursor-pointer"
                                    >
                                      Check In
                                    </button>
                                  )}
                                  {b.status === "Checked In" && (
                                    <button
                                      onClick={() => handleUpdateBookingStatus(b.id, "Completed")}
                                      className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg uppercase tracking-wider cursor-pointer"
                                    >
                                      Complete Stay
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleCancelBooking(b.id)}
                                    className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 p-1.5 rounded-lg cursor-pointer"
                                    title="Cancel booking record"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-xs text-neutral-400 font-mono">
                              No active bookings found. Direct portals are live for stay booking.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === "contacts" && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-emerald-950">Direct Stay Inquiries</h3>
                    <p className="text-xs text-neutral-500 font-mono">Incoming booking requests, special events, or catering requirements.</p>
                  </div>

                  <div className="space-y-4">
                    {adminContacts.length > 0 ? (
                      adminContacts.map((c) => (
                        <div key={c.id} className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 hover:border-emerald-300 transition-colors flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                          <div className="space-y-2 max-w-3xl text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-bold text-neutral-900 text-sm">{c.name}</span>
                              <span className="text-neutral-300">|</span>
                              <span className="text-xs text-neutral-500 font-mono">{c.email}</span>
                              <span className="text-neutral-300">|</span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Just Now"}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-emerald-900 text-sm">Subject: {c.subject}</h4>
                            <p className="text-xs text-neutral-600 leading-relaxed italic">
                              "{c.message}"
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            <a
                              href={`mailto:${c.email}?subject=Reply: ${c.subject}`}
                              className="text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer flex items-center gap-1"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Reply Email
                            </a>
                            <button
                              onClick={() => handleDeleteContact(c.id)}
                              className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 p-2 rounded-lg cursor-pointer"
                              title="Delete inquiry message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 border border-dashed border-neutral-300 rounded-2xl text-xs text-neutral-400 font-mono">
                        No contact messages or inquiries have been received yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {adminTab === "reviews" && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-emerald-950">Verified Stays Feedback Board</h3>
                    <p className="text-xs text-neutral-500 font-mono">Live Customer Testimonials currently published on the public guest site.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div key={rev.id} className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-3 text-left">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-serif font-bold text-sm text-neutral-900">{rev.author}</h4>
                              <span className="bg-emerald-100 text-emerald-900 font-mono text-[9px] font-bold px-2 py-0.5 rounded-md uppercase block mt-1 w-max">
                                🏨 {rev.room}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="flex gap-0.5 justify-end text-amber-500">
                                {Array.from({ length: rev.rating }).map((_, starIdx) => (
                                  <Star key={starIdx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                              <span className="text-[9px] font-mono text-neutral-400 block mt-1">{rev.date}</span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed italic">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12 text-xs text-neutral-400 font-mono">
                        No reviews submitted yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <>
          {/* Hero Section with Interactive Fog Clearing */}
          <section className="relative bg-emerald-950 text-white py-12 md:py-20 px-4 md:px-12 overflow-hidden border-b border-emerald-900" id="hero">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="bg-amber-400/20 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-amber-400/30 inline-block">
              Escape to the Extraordinary
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              SURRENDER <br className="hidden md:inline" />
              TO THE <br />
              <span className="text-amber-400 font-sans italic font-light tracking-wide">MOUNTAIN MIST</span>
            </h2>
            <p className="text-sm md:text-base text-neutral-300 leading-relaxed max-w-lg">
              Nestled on a shear cliff in Khandala. Witness 13 luxurious, ultra-spacious boutique rooms, pristine valley waters, and authentic Maharashtrian hospitality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a 
                href="#booking-engine"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 text-center font-bold text-xs tracking-widest uppercase py-4 px-8 rounded-xl transition-all shadow-xl shadow-amber-500/10"
              >
                Secure Booking Now
              </a>
              <a 
                href="#concierge-section"
                className="bg-white/10 hover:bg-white/15 text-white text-center font-bold text-xs tracking-widest uppercase py-4 px-8 rounded-xl border border-white/20 transition-all"
              >
                Chat with Concierge
              </a>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-900/60 max-w-md">
              <div>
                <span className="block font-serif text-2xl font-bold text-amber-400">13 Only</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Boutique Rooms</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-amber-400">37.2m²</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Room Space</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-bold text-amber-400">50+ Mbps</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Wi-Fi Speed</span>
              </div>
            </div>
          </div>

          {/* Interactive Fog Wipe component container */}
          <div className="lg:col-span-7">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-amber-400 font-mono flex items-center gap-1.5 uppercase font-bold">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Interactive Fog Sensor Active
                </span>
                <span className="text-[11px] text-neutral-400">Drag to wipe away morning fog</span>
              </div>
              <FogCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* Split Interactive Dashboard Panel: 3D Valley Map & AI Virtual Concierge */}
      <section className="py-12 px-4 md:px-12 max-w-7xl mx-auto" id="concierge-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Block: 3D Valley Map */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full" id="valley-map">
            <ValleyMap />
          </div>

          {/* Right Block: Live AI Virtual Concierge Panel */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col justify-between min-h-[550px]">
            {/* Concierge Header */}
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-900">
              <div className="flex items-center gap-3">
                <div className="bg-amber-400 text-emerald-950 p-2.5 rounded-xl shadow-inner relative">
                  <Bot className="h-5 w-5 animate-pulse" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-emerald-950" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white flex items-center gap-1.5">
                    Elite Virtual Concierge
                  </h3>
                  <p className="text-[10px] text-amber-300 font-mono tracking-wider uppercase font-semibold">
                    Khandala Local Guide & Booking Assistant
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-mono text-neutral-400 block uppercase">SYSTEM STATUS</span>
                <span className="text-xs text-emerald-400 font-mono font-bold">● ONLINE / RESPONSIBLE</span>
              </div>
            </div>

            {/* Chat message space */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[380px] bg-neutral-50/50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      msg.sender === "user" 
                        ? "bg-amber-500 text-neutral-900 font-bold" 
                        : "bg-emerald-900 text-amber-300"
                    }`}
                  >
                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`text-xs p-3.5 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-amber-500 text-neutral-950 rounded-tr-none font-medium"
                          : "bg-white text-neutral-800 border border-neutral-200 rounded-tl-none font-sans"
                      }`}
                    >
                      {/* Very simple markdown parser for bold headers */}
                      {msg.text.split("\n").map((line, i) => {
                        let parsedLine: React.ReactNode = line;
                        // Bold checks **text**
                        if (line.includes("**")) {
                          const parts = line.split("**");
                          parsedLine = parts.map((part, index) => 
                            index % 2 === 1 ? <strong key={index} className="text-emerald-950 font-bold">{part}</strong> : part
                          );
                        }
                        return <p key={i} className="mb-1.5 last:mb-0">{parsedLine}</p>;
                      })}
                    </div>
                    <span className="text-[9px] font-mono text-neutral-400 block px-1 text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 max-w-[50%] mr-auto items-center">
                  <div className="h-8 w-8 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center text-xs shrink-0">
                    <Bot className="h-4 w-4 animate-bounce" />
                  </div>
                  <div className="bg-white border border-neutral-200 px-4 py-2 rounded-2xl rounded-tl-none text-xs text-neutral-500 flex items-center gap-1.5">
                    <span>Virtual Concierge is writing</span>
                    <span className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick suggest prompts */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50/70">
              <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mb-2 px-1 font-bold">
                ASK ABOUT PORTAL FEATURES:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {chatSuggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(item)}
                    className="text-[11px] bg-white hover:bg-emerald-50 text-emerald-900 hover:text-emerald-950 font-semibold border border-neutral-200 hover:border-emerald-500/40 px-3 py-1.5 rounded-full transition-all text-left shadow-sm cursor-pointer"
                  >
                    💡 {item}
                  </button>
                ))}
              </div>
            </div>

            {/* User Input field */}
            <div className="p-4 border-t border-neutral-200 flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Ask about pool access, customized trip itineraries, or room features..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage(userInput);
                }}
                className="flex-1 border border-neutral-300 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none text-neutral-800"
              />
              <button
                onClick={() => handleSendMessage(userInput)}
                className="bg-emerald-900 hover:bg-emerald-850 text-white rounded-xl px-5 py-3 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-emerald-900/5 border-t border-b border-emerald-950/10" id="about">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-widest">
              <Compass className="h-4 w-4 text-emerald-700 animate-spin-slow" />
              <span>THE LEGEND OF KHANDALA VALLEY RETREAT</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-emerald-950 leading-tight">
              Savor Pure Mountain Seclusion <br className="hidden md:inline" />
              Inside Our Gated Sanctuary
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Khandala Valley Retreat is not just a resort; it is a meticulously preserved private sanctuary nestled securely overlooking the vast canyons of Khandala. 
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Originally founded as a secluded haven away from the bustling tourist corridors of Lonavala, our estate sits at the edge of a sheer cliff, directly overlooking a deep valley with dramatic waterfalls during monsoon showers. With only 13 ultra-exclusive boutique suites, guests can experience the absolute silence of the mountain winds, broken only by the chirping of local birds and the rustling of native teakwood leaves.
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed font-semibold text-emerald-900">
              Enjoy zero highway noise, absolute crowd privacy, and genuine high-altitude relaxation just 2 hours from Mumbai and Pune.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-neutral-700">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-full shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span>24/7 Gated Access Control</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-full shadow-sm">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>Private Ownership Heritage</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/20 to-transparent rounded-3xl animate-pulse" style={{ animationDuration: '3s' }} />
            <img 
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200" 
              alt="Khandala Valley View Scenic" 
              className="w-full h-96 object-cover rounded-3xl shadow-xl border border-neutral-200"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -right-6 bg-emerald-900 text-white p-6 rounded-2xl shadow-xl max-w-xs border border-emerald-800 hidden sm:block">
              <p className="font-serif text-lg font-bold text-amber-300">"Absolute Silence"</p>
              <p className="text-[11px] text-neutral-300 mt-1">Our guests enjoy a rare mountain silence, free from any highway horns or tourist bustle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Signature Amenities Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto" id="services">
        <div className="space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-emerald-850 font-mono text-xs font-bold uppercase tracking-widest bg-emerald-100 px-4 py-1.5 rounded-full inline-block">
              Guest Experiences
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-emerald-950">
              Signature Resort Services & Amenities
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Every detail is tailored to provide premium comfort, continuous connectivity, and immersive valley encounters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length > 0 ? (
              services.map((serv: any) => {
                // Map icons dynamically
                const getIcon = (id: string) => {
                  switch (id) {
                    case "serv-pool": return <Sparkles className="h-6 w-6 text-amber-400" />;
                    case "serv-dining": return <Utensils className="h-6 w-6 text-amber-400" />;
                    case "serv-wifi": return <Wifi className="h-6 w-6 text-amber-400" />;
                    case "serv-gated": return <ShieldCheck className="h-6 w-6 text-amber-400" />;
                    case "serv-kettle": return <Coffee className="h-6 w-6 text-amber-400" />;
                    case "serv-deck": return <Maximize className="h-6 w-6 text-amber-400" />;
                    default: return <Sparkles className="h-6 w-6 text-amber-400" />;
                  }
                };

                return (
                  <div key={serv.id} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-emerald-500/20">
                    <div className="bg-emerald-950 p-3 rounded-xl inline-block mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      {getIcon(serv.id)}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-emerald-950 mb-2">{serv.title}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">{serv.description}</p>
                  </div>
                );
              })
            ) : (
              // Fallback local services if API still loading
              [
                { id: "serv-pool", title: "Heated Cliffside Infinity Pool", description: "Swim right up to the edge of the sheer cliff looking directly into the lush Sahyadri peaks." },
                { id: "serv-dining", title: "The Valley Kitchen Restaurant", description: "Authentic multi-cuisine dining featuring hot hand-pressed Maharashtrian specialties." },
                { id: "serv-wifi", title: "High-Speed Remote Work Wi-Fi", description: "Seamless 50+ Mbps fiber-optic connectivity covering every suite, balcony, and garden deck." }
              ].map((serv) => (
                <div key={serv.id} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-emerald-950 mb-2">{serv.title}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{serv.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Khandala Retreat Visual Showcase Gallery */}
      <HotelGallery onInquire={handleInquireGallery} />

      {/* The Valley Kitchen Dining Section */}
      <section className="py-16 px-4 md:px-12 max-w-7xl mx-auto" id="dining">
        <div className="bg-emerald-900/10 border border-emerald-950/20 rounded-2xl p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-emerald-700" />
              <span className="text-xs text-emerald-800 font-mono tracking-widest uppercase font-bold">
                DINING AT THE RETREAT
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-emerald-950">
              The Valley Kitchen
            </h2>
            <p className="text-xs md:text-sm text-neutral-700 leading-relaxed">
              Savor authentic culinary traditions of Maharashtra’s western ghats on-site. Our chefs handcraft iconic local specials using organic mountain-grown spices, alongside excellent continental dishes.
            </p>

            <div className="p-4 bg-emerald-900 text-amber-300 rounded-xl border border-emerald-950/10 space-y-2 shadow-sm">
              <span className="text-[10px] font-mono tracking-widest text-emerald-300 uppercase block font-bold">
                TODAY'S SPECIAL ACCENT
              </span>
              <p className="text-sm font-serif font-bold text-white">Authentic Misal Pav & Organic Puran Poli</p>
              <p className="text-xs text-neutral-300">Served fresh during high-mist mornings with hot, cardamom ginger tea on your viewing deck.</p>
            </div>

            <button
              onClick={() => {
                handleSendMessage("What can I order at The Valley Kitchen? Tell me about vegetarian choices.");
                const section = document.getElementById("concierge-section");
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-xl transition-all"
            >
              Ask Chef specials
            </button>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-lg space-y-6">
            <h3 className="font-serif text-lg font-bold text-emerald-950 border-b border-neutral-100 pb-3 flex items-center justify-between">
              <span>Digital Menu</span>
              <span className="text-xs font-mono font-medium text-neutral-500">100% Vegetarian options available</span>
            </h3>

            {menu ? (
              <div className="space-y-6">
                {menu.categories.map((cat: MenuCategory, idx: number) => (
                  <div key={idx} className="space-y-4">
                    <h4 className="text-xs font-mono font-bold tracking-wider text-amber-600 uppercase">
                      {cat.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.items.map((item: MenuItem, i: number) => (
                        <div key={i} className="space-y-1 p-2 hover:bg-neutral-50 rounded-lg transition-colors">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="text-xs font-bold text-neutral-900">{item.name}</span>
                            <span className="text-xs font-mono font-semibold text-emerald-800">{item.price}</span>
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-neutral-500">
                Opening kitchen catalogs...
              </div>
            )}
          </div>

        </div>
      </section>
      {/* Interactive Direct Booking Engine */}
      <section className="bg-neutral-900 text-white py-16 px-4 md:px-12 border-t border-neutral-850" id="booking-engine">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Form details */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div>
              <span className="text-xs text-amber-400 font-mono tracking-widest uppercase font-bold block mb-1">
                INSTANT DIRECT BOOKING
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white">
                Book Your Valley Escape
              </h2>
              <p className="text-xs md:text-sm text-neutral-300 leading-relaxed mt-3">
                Guarantee the lowest rates with absolute privacy. Check in securely, coordinate your arrival with our Elite Virtual Concierge, and unlock complimentary hot beverage pairings upon checking in.
              </p>
            </div>

            {/* In-Memory Booking logs */}
            <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800/80 space-y-4">
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                ACTIVE PORTAL RESERVATIONS
              </h4>
              
              {bookings.length === 0 ? (
                <p className="text-[11px] text-neutral-500">No active bookings for today yet. Place yours below to see reservation statuses live.</p>
              ) : (
                <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {bookings.map((b) => (
                    <div key={b.id} className="text-[11px] bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="block font-bold text-neutral-200">{b.guestName}</span>
                        <span className="text-[9px] font-mono text-neutral-400">{b.roomName}</span>
                      </div>
                      <div className="text-right">
                        <span className="bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded text-[9px] font-mono font-bold block mb-1">
                          {b.id}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-mono">Conf: {b.checkIn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form container */}
          <div className="lg:col-span-7 bg-white text-neutral-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-neutral-200 relative">
            <h3 className="font-serif text-lg font-bold text-emerald-950 border-b border-neutral-100 pb-3 mb-6">
              Online Check-In & Booking Form
            </h3>

            {bookingSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-serif font-bold text-emerald-950">Escape Confirmed!</h4>
                  <p className="text-xs text-neutral-600">Your reservation has been locked into Khandala Valley Retreat databases.</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-emerald-100 max-w-sm mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-neutral-500">Booking Reference:</span> <strong className="font-mono text-emerald-900 font-bold">{bookingSuccess.id}</strong></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Lead Guest Name:</span> <strong>{bookingSuccess.guestName}</strong></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Boutique Suite:</span> <strong>{bookingSuccess.roomName}</strong></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Check-in:</span> <strong>{bookingSuccess.checkIn}</strong></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Total Guests:</span> <strong>{bookingSuccess.guests}</strong></div>
                </div>

                <button
                  onClick={() => setBookingSuccess(null)}
                  className="bg-emerald-900 text-white font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded-lg hover:bg-emerald-850"
                >
                  Create Another Booking
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gayatri Nikam"
                      value={bookingForm.guestName}
                      onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Choose Room View
                    </label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-850 font-medium"
                    >
                      <option value="valley-deluxe">Deluxe Valley View Suite (₹12,500/N)</option>
                      <option value="garden-premium">Premium Cliffside Villa (₹14,000/N)</option>
                      <option value="royal-duplex">Royal Duplex Family Villa (₹19,500/N)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.checkIn}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.checkOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Total Occupants
                    </label>
                    <select
                      value={bookingForm.guests}
                      onChange={(e) => setBookingForm({ ...bookingForm, guests: Number(e.target.value) })}
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-850"
                    >
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests (Recommended)</option>
                      <option value={3}>3 Guests (Includes extra mattress)</option>
                      <option value={4}>4 Guests (Suite Max)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="w-full bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs tracking-wider uppercase py-3 px-6 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {isSubmittingBooking ? "Locking Booking..." : "Request Direct Booking Spot"}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-400 text-center font-mono">
                  🔒 Securely processed. No cancellation fees apply up to 72 hours before arrival.
                </p>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Local Exploration Guide Section */}
      <section className="py-16 px-4 md:px-12 max-w-7xl mx-auto border-t border-neutral-200" id="itinerary">
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs text-emerald-800 font-mono tracking-widest uppercase font-bold block">
                LOCAL ATTRACTIONS & EXPEDITIONS
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-emerald-950">
                Khandala Sights & Curated Itinerary
              </h2>
            </div>
            <p className="text-xs md:text-sm text-neutral-500 max-w-md">
              Our central retreat places you within minutes of spectacular peaks and historical sweet shops. Savor the majestic Sahyadris.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sight 1 */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative h-48">
                  <img
                    src="https://images.unsplash.com/photo-1769670172719-8ee9611450e5?auto=format&fit=crop&q=80&w=800"
                    alt="Kune Falls Khandala"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 right-3 bg-emerald-900 text-white font-mono text-[9px] px-2 py-1 rounded">
                    1.4 KM AWAY
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="font-serif text-lg font-bold text-emerald-950">Kune Waterfalls</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    A gorgeous three-tiered waterfall crashing from a height of 200 meters. Extremely majestic and lush during the heavy monsoon shower season.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    handleSendMessage("Can you tell me how to reach Kune Falls from the resort? Provide a short itinerary.");
                    const section = document.getElementById("concierge-section");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full bg-neutral-100 hover:bg-emerald-50 text-emerald-900 font-bold text-xs py-2.5 rounded-lg transition-colors"
                >
                  Ask Route Guidance
                </button>
              </div>
            </div>

            {/* Sight 2 */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative h-48">
                  <img
                    src="https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&q=80&w=800"
                    alt="Gagangiri Ashram"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 right-3 bg-emerald-900 text-white font-mono text-[9px] px-2 py-1 rounded">
                    NORTHWEST OF RETREAT
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="font-serif text-lg font-bold text-emerald-950">Gagangiri Ashram</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    A peaceful, spiritual sanctuary nestled in a dense grove of native Maharashtrian trees. Ideal for quiet morning meditations, yoga, and inner reflection.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    handleSendMessage("What is the best time to visit Gagangiri Ashram? What are the rules?");
                    const section = document.getElementById("concierge-section");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full bg-neutral-100 hover:bg-emerald-50 text-emerald-900 font-bold text-xs py-2.5 rounded-lg transition-colors"
                >
                  Get Ashram Details
                </button>
              </div>
            </div>

            {/* Sight 3 */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative h-48">
                  <img
                    src="https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=600"
                    alt="Cooper's Fudge"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 right-3 bg-emerald-900 text-white font-mono text-[9px] px-2 py-1 rounded">
                    TOWN CENTER
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="font-serif text-lg font-bold text-emerald-950">Cooper's Fudge & Chikkis</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    The legendary local confectioner famous for its walnut fudge, rich chikkis, and local sweets. A absolute must-visit sweet shop for visitors.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    handleSendMessage("Where is Cooper's Fudge situated? Can you recommend what fudge flavors to buy?");
                    const section = document.getElementById("concierge-section");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full bg-neutral-100 hover:bg-emerald-50 text-emerald-900 font-bold text-xs py-2.5 rounded-lg transition-colors"
                >
                  Buy Guide & Sights
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Guest Reviews & Testimonials Section */}
      <section className="py-20 bg-neutral-100 border-t border-b border-neutral-200" id="reviews">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Review Stats & Leave Review Form */}
          <div className="lg:col-span-5 space-y-6 bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 shadow-sm">
            <div className="space-y-2">
              <span className="text-emerald-805 font-mono text-xs font-bold uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full inline-block">
                Guestbook
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-emerald-950">
                Share Your Retreat Memories
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Our peaceful corner is built on authentic hospitality. Let future travelers know about your mist-covered balcony experiences.
              </p>
            </div>

            {/* Quick Average Score Card */}
            <div className="flex items-center gap-4 p-4 bg-emerald-900/5 rounded-2xl border border-emerald-950/5">
              <div className="text-center bg-emerald-950 text-white px-4 py-3 rounded-xl">
                <span className="block text-2xl font-bold font-serif text-amber-300">4.9</span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-300">Out of 5</span>
              </div>
              <div>
                <div className="flex gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-950 block mt-1">98% Positive Feedback</span>
                <span className="text-[10px] text-neutral-500 block">Based on verified guest stays</span>
              </div>
            </div>

            {/* Write Review Form */}
            {reviewSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <h4 className="font-serif text-base font-bold text-emerald-950">Memory Logged!</h4>
                <p className="text-xs text-neutral-600">Your authentic experience has been appended to the retreat’s public guestbook. Thank you!</p>
                <button
                  onClick={() => setReviewSuccess(false)}
                  className="bg-emerald-900 text-white font-bold text-xs tracking-wider uppercase px-4 py-2 rounded-lg hover:bg-emerald-850"
                >
                  Write Another Review
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
                {reviewError && (
                  <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gayatri Nikam"
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Retreat Rating
                    </label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-800 font-medium"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                      <option value={4}>⭐⭐⭐⭐ (Very Good)</option>
                      <option value={3}>⭐⭐⭐ (Satisfactory)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Suite Stayed In
                    </label>
                    <select
                      value={reviewForm.room}
                      onChange={(e) => setReviewForm({ ...reviewForm, room: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-800"
                    >
                      <option value="Deluxe Valley View Suite">Deluxe Valley View Suite</option>
                      <option value="Premium Cliffside Villa">Premium Cliffside Villa</option>
                      <option value="Royal Duplex Family Villa">Royal Duplex Family Villa</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Your Balcony Story & Comments
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the morning mist, room vibes, or food experiences at The Valley Kitchen..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs tracking-wider uppercase py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer text-center"
                >
                  {isSubmittingReview ? "Submitting Memory..." : "Publish to Public Guestbook"}
                </button>
              </form>
            )}
          </div>

          {/* Active Guest Reviews Board */}
          <div className="lg:col-span-7 space-y-4">
            <div className="border-b border-neutral-200 pb-3 flex justify-between items-baseline">
              <h3 className="font-serif text-lg font-bold text-emerald-950">Verified Guest Stay Feedback</h3>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Live Database Logs</span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {reviews.length > 0 ? (
                reviews.map((rev: any) => (
                  <div key={rev.id} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-3 hover:border-emerald-500/10 transition-colors animate-fade-in">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-neutral-900">{rev.author}</h4>
                        <span className="bg-emerald-50 text-emerald-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded-md uppercase block mt-1 w-max">
                          🏨 {rev.room}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-0.5 justify-end text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, starIdx) => (
                            <Star key={starIdx} className="h-3.5 w-3.5 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[9px] font-mono text-neutral-400 block mt-1">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-500">
                  Retrieving past traveler stories...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Direct Contact & Inquiry Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto" id="contact">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Authentic Info & Map Guidance */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <span className="text-emerald-850 font-mono text-xs font-bold uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full inline-block">
                Secure Stay Desk
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-emerald-950">
                Contact Our Stay Desk
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Because we are an exclusive private retreat, all guest arrivals are registered in advance for seamless checkpoint clearance. Reach out to our 24/7 stay desk.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="bg-emerald-950 text-white p-3 rounded-xl shrink-0 h-max">
                  <MapPin className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-emerald-950">Physical Address</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                    Khandala Valley Retreat, Kune Village, Near Kune Falls Lookout, Khandala, Lonavala, Maharashtra 410301, India.
                  </p>
                  <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold font-mono uppercase tracking-wider block mt-1.5 underline"
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-emerald-950 text-white p-3 rounded-xl shrink-0 h-max">
                  <Phone className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-emerald-950">24/7 Phone Desk & WhatsApp</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                    Desk Direct Dial: <span className="font-mono font-bold">+91 2114 274000</span> <br />
                    Stay Coordinator Mobile/WhatsApp: <span className="font-mono font-bold">+91 98234 56789</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-emerald-950 text-white p-3 rounded-xl shrink-0 h-max">
                  <Mail className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-emerald-950">Secure Email Inquiries</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                    General stays: <span className="font-mono font-bold text-emerald-800">stays@khandalavalleyretreat.com</span> <br />
                    Group bookings & events: <span className="font-mono font-bold text-emerald-800">events@khandalavalleyretreat.com</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Crucial Gated Notice */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1">
              <span className="text-[9px] font-mono font-bold text-amber-700 tracking-wider uppercase block">
                🚨 IMPORTANT ACCESS PROTOCOL:
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed">
                For guest privacy reasons, walk-in inquiries cannot be entertained. Please book online or register with our stay coordinators via telephone before arriving.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Send Message Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 shadow-sm relative">
            <h3 className="font-serif text-xl font-bold text-emerald-950 border-b border-neutral-100 pb-3 mb-6 flex justify-between items-center">
              <span>Send Us a Direct Message</span>
              <span className="text-xs font-mono font-medium text-neutral-400">Response within 3 hours</span>
            </h3>

            {contactSuccess ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 shadow-sm animate-fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="h-6 w-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-serif font-bold text-emerald-950">Inquiry Received Successfully!</h4>
                  <p className="text-xs text-neutral-600">Your message has been securely routed directly to our administrative office.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-100 max-w-md mx-auto text-xs text-left">
                  Our stay coordinators will review your questions and contact you via the email address you provided.
                </div>
                <button
                  onClick={() => setContactSuccess(false)}
                  className="bg-emerald-900 text-white font-bold text-xs tracking-wider uppercase px-5 py-2.5 rounded-lg hover:bg-emerald-850"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {contactError && (
                  <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{contactError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Gayatri Nikam"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-850"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-850"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Subject of Inquiry
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Booking inquiry, Special requests, Monsoon packages"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-850"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your questions or special requests in detail..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-850"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 cursor-pointer text-center animate-pulse"
                  >
                    {isSubmittingContact ? "Routing Inquiry..." : "Submit Inquiry to Office"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
        </>
      )}

      {/* Admin Login Modal */}
      {isAdminLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-neutral-200 shadow-2xl relative space-y-6">
            <button 
              onClick={() => {
                setIsAdminLoginModalOpen(false);
                setAdminLoginError("");
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 font-mono text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="text-center space-y-2">
              <div className="bg-emerald-950 text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Lock className="h-6 w-6 text-amber-300 animate-pulse" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-emerald-950">Administrative Sign-In</h3>
              <p className="text-xs text-neutral-500">Access stays coordinator dashboard & verified visitor records.</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {adminLoginError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{adminLoginError}</span>
                </div>
              )}
              <div className="text-left">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Username</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-850"
                />
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Security Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-850"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs tracking-wider uppercase py-3 rounded-xl transition-all text-center cursor-pointer mt-4"
              >
                Sign In to Dashboard
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Signup Modal */}
      {isAdminSignupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-neutral-200 shadow-2xl relative space-y-6">
            <button 
              onClick={() => {
                setIsAdminSignupModalOpen(false);
                setAdminLoginError("");
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 font-mono text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
            <div className="text-center space-y-2">
              <div className="bg-emerald-950 text-white w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-emerald-950">Setup Admin Account</h3>
              <p className="text-xs text-neutral-500">One-Time Administrator Setup</p>
            </div>
            
            <form onSubmit={handleAdminSignup} className="space-y-4">
              {adminLoginError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{adminLoginError}</span>
                </div>
              )}
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-800 font-mono flex items-start gap-1.5 leading-normal text-left">
                <span>💡</span>
                <span><strong>Setup Notice:</strong> This single slot creates the master admin account. Once created, no further accounts can be registered.</span>
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">New Username</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-850"
                />
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">New Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-700 outline-none text-neutral-850"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-900 hover:bg-emerald-850 text-white font-bold text-xs tracking-wider uppercase py-3 rounded-xl transition-all text-center cursor-pointer mt-4"
              >
                Create Admin Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-emerald-950 text-white py-12 px-6 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-white tracking-wide">Khandala Valley Retreat</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Nestled securely overlooking the Khandala Valley, away from highway sounds. An authentic 13-room boutique sanctuary offering direct views of the stunning Sahyadri peaks.
            </p>
            <p className="text-xs text-amber-400 font-mono">
              📍 Kune Village, Khandala, MH, India
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-amber-400">Quick Portal Actions</h4>
            <div className="flex flex-col gap-2 text-xs text-neutral-300">
              <a href="#hotel-gallery" className="hover:text-amber-300 transition-colors">Authentic Photo Gallery</a>
              <a href="#valley-map" className="hover:text-amber-300 transition-colors">Rotate 3D Valley Map View</a>
              <a href="#dining" className="hover:text-amber-300 transition-colors">Open Digital Menu of 'The Valley Kitchen'</a>
              <a href="#booking-engine" className="hover:text-amber-300 transition-colors">Direct Portal Check-In Form</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-amber-400">Emergency & Desk Support</h4>
            <div className="space-y-1 text-xs text-neutral-300">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>24/7 Gated Security Desk</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>In-Suite Dial: 101 (Hospitality Desk)</span>
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-block bg-amber-400 text-emerald-950 font-mono text-[9px] font-bold px-2 py-1 rounded">
                AI PORTAL INTERACTIVE v3.5
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-emerald-900 text-center text-[10px] text-neutral-400 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Khandala Valley Retreat. All rights reserved.</p>
          <button 
            onClick={() => {
              if (adminToken) {
                setIsAdminMode(true);
              } else if (adminIsSetup) {
                setIsAdminLoginModalOpen(true);
              } else {
                setIsAdminSignupModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ShieldCheck className="h-3 w-3" />
            <span>{adminToken ? "Admin Dashboard" : (adminIsSetup ? "Admin Login" : "Admin Setup")}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
