import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase Client
let supabase: any = null;
const supabaseUrl = process.env.SUPABASE_URL || "https://cbnnhrmfsyczbrqzbmcm.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_d63W3lYrwD-xCAiAtarjrg_YPVomK1_";

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase Client initialized with URL:", supabaseUrl);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
}

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY is not defined in environment variables. Live AI will fail back gracefully.");
}

// In-memory bookings, reviews and contacts for simulation
const bookings: any[] = [
  {
    id: "BK-8021",
    guestName: "Gayatri Nikam",
    email: "gayatrinikam9999@gmail.com",
    roomId: "valley-deluxe",
    roomName: "Deluxe Valley View Suite",
    checkIn: "2026-07-10",
    checkOut: "2026-07-13",
    guests: 2,
    status: "Confirmed",
    createdAt: "2026-06-29T10:15:30.000Z"
  },
  {
    id: "BK-3490",
    guestName: "Rohan Mehta",
    email: "rohan.mehta@gmail.com",
    roomId: "royal-duplex",
    roomName: "Royal Duplex Family Villa",
    checkIn: "2026-07-15",
    checkOut: "2026-07-18",
    guests: 4,
    status: "Confirmed",
    createdAt: "2026-06-30T14:22:11.000Z"
  }
];
const contacts: any[] = [
  {
    id: "CON-781",
    name: "Sunil Deshmukh",
    email: "sunil.desh@outlook.com",
    subject: "Monsoon Corporate Retreat Group Rates",
    message: "Hi Team, we are planning a 15-person leadership offsite in mid-August. Can we reserve all 3 villa styles and get custom Maharashtrian catering? Looking forward to your quote.",
    createdAt: "2026-06-30T09:12:00.000Z"
  },
  {
    id: "CON-452",
    name: "Anjali Sen",
    email: "anjali.sen@gmail.com",
    subject: "Private Candlelight Balcony Dinner Setup",
    message: "Hello! I have booked a stay for our anniversary. Is it possible to arrange a private candlelight setup on our balcony with Sol Kadhi and some Basundi? Thanks!",
    createdAt: "2026-07-01T05:45:00.000Z"
  }
];
const reviews = [
  {
    id: "REV-101",
    author: "Rohan Mehta",
    rating: 5,
    date: "June 25, 2026",
    comment: "An absolute slice of heaven! The viewing balcony in the Deluxe Valley View Suite was breathtaking. Drinking hot cardamom tea with clouds rolling right into the balcony was unforgettable.",
    room: "Deluxe Valley View Suite"
  },
  {
    id: "REV-102",
    author: "Ananya Deshmukh",
    rating: 5,
    date: "June 18, 2026",
    comment: "Extremely secluded and peaceful, unlike commercial hotels in Lonavala. Being inside this private gated estate made us feel extremely safe. The pool looking into the Sahyadri peaks is majestic.",
    room: "Premium Cliffside Villa"
  },
  {
    id: "REV-103",
    author: "Vikram Malhotra",
    rating: 4,
    date: "May 30, 2026",
    comment: "The multi-cuisine dining at The Valley Kitchen was top notch. Authentic Misal Pav and Puran Poli were outstanding. Service was incredibly responsive.",
    room: "Deluxe Valley View Suite"
  }
];

// --- Supabase Synchronization Helpers ---

// 1. Bookings Sync
async function fetchBookings() {
  if (!supabase) return bookings;
  try {
    const { data, error } = await supabase.from("bookings").select("*").order("createdAt", { ascending: false });
    if (error) {
      // Fallback try with snake_case key "created_at"
      const { data: dataSnake, error: errorSnake } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (errorSnake) {
        console.warn("Could not fetch 'bookings' from Supabase (tables may not exist yet). Using memory.");
        return bookings;
      }
      
      const parsedSnake = (dataSnake || []).map((b: any) => ({
        id: b.id,
        guestName: b.guest_name || b.guestName,
        email: b.email,
        roomId: b.room_id || b.roomId,
        roomName: b.room_name || b.roomName,
        checkIn: b.check_in || b.checkIn,
        checkOut: b.check_out || b.checkOut,
        guests: b.guests || 2,
        status: b.status || "Confirmed",
        createdAt: b.created_at || b.createdAt
      }));
      // Merge memory bookings not found in supabase for a graceful fallback
      const missingBookings = bookings.filter(mb => !parsedSnake.find((sb: any) => sb.id === mb.id));
      return [...parsedSnake, ...missingBookings];
    }
    // Map data just in case it returns camelCase keys as is
    const parsedCamel = (data || []).map((b: any) => ({
      id: b.id,
      guestName: b.guestName || b.guest_name,
      email: b.email,
      roomId: b.roomId || b.room_id,
      roomName: b.roomName || b.room_name,
      checkIn: b.checkIn || b.check_in,
      checkOut: b.checkOut || b.check_out,
      guests: b.guests || 2,
      status: b.status || "Confirmed",
      createdAt: b.createdAt || b.created_at
    }));
    const missingBookings = bookings.filter(mb => !parsedCamel.find((sb: any) => sb.id === mb.id));
    return [...parsedCamel, ...missingBookings];
  } catch (err) {
    console.error("Error fetching bookings from Supabase:", err);
    return bookings;
  }
}

async function saveBookingToSupabase(booking: any) {
  if (!supabase) return false;
  try {
    // Attempt 1: camelCase insert
    const { error: errorCamel } = await supabase.from("bookings").insert([booking]);
    if (!errorCamel) {
      console.log("Booking successfully saved to Supabase (camelCase)!");
      return true;
    }
    
    // Attempt 2: snake_case insert
    const snakeBooking = {
      id: booking.id,
      guest_name: booking.guestName,
      email: booking.email,
      room_id: booking.roomId,
      room_name: booking.roomName,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      guests: booking.guests,
      status: booking.status,
      created_at: booking.createdAt
    };
    const { error: errorSnake } = await supabase.from("bookings").insert([snakeBooking]);
    if (!errorSnake) {
      console.log("Booking successfully saved to Supabase (snake_case)!");
      return true;
    }
    
    console.error("Failed to insert booking into Supabase. Error camel:", errorCamel.message, "Error snake:", errorSnake.message);
    return false;
  } catch (err) {
    console.error("Failed to save booking to Supabase:", err);
    return false;
  }
}

async function updateBookingStatusInSupabase(id: string, status: string) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      // Try snake_case update
      const { error: errSnake } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (errSnake) {
        console.error("Failed to update booking status in Supabase:", error.message);
      }
    }
  } catch (err) {
    console.error("Failed to update booking status in Supabase:", err);
  }
}

async function deleteBookingFromSupabase(id: string) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete booking from Supabase:", error.message);
    }
  } catch (err) {
    console.error("Failed to delete booking from Supabase:", err);
  }
}

// 2. Contacts Sync
async function fetchContacts() {
  if (!supabase) return contacts;
  try {
    const { data, error } = await supabase.from("contacts").select("*").order("createdAt", { ascending: false });
    if (error) {
      const { data: dataSnake, error: errorSnake } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
      if (errorSnake) {
        console.warn("Could not fetch 'contacts' from Supabase (tables may not exist yet). Using memory.");
        return contacts;
      }
      return (dataSnake || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        subject: c.subject,
        message: c.message,
        createdAt: c.created_at || c.createdAt
      }));
    }
    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      subject: c.subject,
      message: c.message,
      createdAt: c.createdAt || c.created_at
    }));
  } catch (err) {
    console.error("Error fetching contacts from Supabase:", err);
    return contacts;
  }
}

async function saveContactToSupabase(contact: any) {
  if (!supabase) return false;
  try {
    const { error: errorCamel } = await supabase.from("contacts").insert([contact]);
    if (!errorCamel) {
      console.log("Contact successfully saved to Supabase (camelCase)!");
      return true;
    }
    
    const snakeContact = {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      created_at: contact.createdAt
    };
    const { error: errorSnake } = await supabase.from("contacts").insert([snakeContact]);
    if (!errorSnake) {
      console.log("Contact successfully saved to Supabase (snake_case)!");
      return true;
    }
    
    console.error("Failed to insert contact into Supabase. Error:", errorCamel.message);
    return false;
  } catch (err) {
    console.error("Failed to save contact to Supabase:", err);
    return false;
  }
}

async function deleteContactFromSupabase(id: string) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete contact from Supabase:", error.message);
    }
  } catch (err) {
    console.error("Failed to delete contact from Supabase:", err);
  }
}

// 3. Reviews Sync
async function fetchReviews() {
  if (!supabase) return reviews;
  try {
    const { data, error } = await supabase.from("reviews").select("*").order("id", { ascending: false });
    if (error) {
      console.warn("Could not fetch 'reviews' from Supabase. Using memory.");
      return reviews;
    }
    return data && data.length > 0 ? data : reviews;
  } catch (err) {
    console.error("Error fetching reviews from Supabase:", err);
    return reviews;
  }
}

async function saveReviewToSupabase(review: any) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("reviews").insert([review]);
    if (!error) {
      console.log("Review successfully saved to Supabase!");
      return true;
    }
    console.error("Failed to insert review into Supabase. Error:", error.message);
    return false;
  } catch (err) {
    console.error("Failed to save review to Supabase:", err);
    return false;
  }
}

const services = [
  {
    id: "serv-pool",
    title: "Heated Cliffside Infinity Pool",
    description: "Swim right up to the edge of the shear cliff looking directly into the lush Sahyadri peaks and seasonal mountain waterfalls."
  },
  {
    id: "serv-dining",
    title: "The Valley Kitchen Restaurant",
    description: "Authentic multi-cuisine dining featuring hot hand-pressed Maharashtrian specialties and chef-curated continental recipes."
  },
  {
    id: "serv-wifi",
    title: "High-Speed Remote Work Wi-Fi",
    description: "Seamless 50+ Mbps fiber-optic connectivity covering every suite, balcony, and garden deck, perfect for work-from-nature retreats."
  },
  {
    id: "serv-gated",
    title: "Khandala Valley Retreat Security Gate",
    description: "Peace of mind within an ultra-high-end private gated retreat with 24/7 manned security checkpoints and strict visitor access."
  },
  {
    id: "serv-kettle",
    title: "In-Suite Coffee & Tea Station",
    description: "Premium coffee maker, electric tea kettle, and direct microwave setups in all suites for self-service hot beverages."
  },
  {
    id: "serv-deck",
    title: "Furnished Panoramic Viewing Decks",
    description: "Generous private glass viewing balconies with cozy outdoor armchairs and direct valley sunset vantage points."
  }
];

// Static data
const rooms = [
  {
    id: "valley-deluxe",
    name: "Deluxe Valley View Suite",
    type: "Lodge Suite",
    size: "37.2 sq. meters",
    price: "₹12,500",
    description: "Our signature multi-level teakwood sanctuary beautifully illuminated with warm fairy lights and Edison bulbs. Offers floor-to-ceiling glass sliding doors that open to your private viewing deck.",
    amenities: ["King Bed", "Ergonomic Desk", "50+ Mbps Wi-Fi", "Smart TV", "Microwave & Kettle", "Furnished Private Deck"],
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200",
    balconyView: "Sunset Valley View"
  },
  {
    id: "garden-premium",
    name: "Premium Cliffside Villa",
    type: "Private Villa",
    size: "37.2 sq. meters",
    price: "₹14,000",
    description: "A majestic cliffside modern sanctuary nestled directly in the lush mountain flora of Khandala Valley. Features immediate access to the cliffside heated infinity pool, private glass viewing balcony, and premium amenities.",
    amenities: ["King Bed", "Ergonomic Desk", "50+ Mbps Wi-Fi", "Smart TV", "Mini-Kitchen", "Pool-facing Balcony"],
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200",
    balconyView: "Infinity Pool & Valley View"
  },
  {
    id: "royal-duplex",
    name: "Royal Duplex Family Villa",
    type: "Duplex Villa",
    size: "74.4 sq. meters",
    price: "₹19,500",
    description: "An ultra-luxury double-height loft villa designed for groups and families. Elevated bedroom level with an expansive balcony, double glass walls, separate cozy living area, and customized butler services.",
    amenities: ["2 King Beds", "Luxury Lounge", "50+ Mbps Wi-Fi", "Double Smart TVs", "Kitchenette with Microwave", "Panoramic Double-height Balcony"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200",
    balconyView: "Full Valley & Mist Horizon View"
  }
];

const menu = {
  restaurant: "The Valley Kitchen",
  description: "On-site multi-cuisine restaurant serving authentic local Maharashtrian specialties, North/South Indian dishes, and a curated continental menu.",
  categories: [
    {
      name: "Maharashtrian Specials",
      items: [
        { name: "Puran Poli", price: "₹250", description: "Sweet flatbread stuffed with sweet lentil filling, served with warm ghee." },
        { name: "Misal Pav", price: "₹180", description: "Spicy moth bean curry topped with farsan, onions, lemon, served with soft pav." },
        { name: "Pitla Bhakri", price: "₹220", description: "Traditional gram flour curry served with hot, rustic bajra bread." },
        { name: "Kothimbir Vadi", price: "₹160", description: "Crisp-fried savory coriander and chickpea cakes served with mint chutney." }
      ]
    },
    {
      name: "Continental & Curated Veg",
      items: [
        { name: "Sahyadri Wild Mushroom Risotto", price: "₹450", description: "Creamy arborio rice tossed with local forest mushrooms and fresh parmesan." },
        { name: "Paneer Tikka Masala", price: "₹380", description: "Char-grilled cottage cheese cubes folded into a rich tomato gravy." },
        { name: "Classic Garden Bruschetta", price: "₹240", description: "Toasted baguette topped with diced tomatoes, garlic, basil, and olive oil." }
      ]
    },
    {
      name: "Desserts & Hot Brews",
      items: [
        { name: "Sol Kadhi", price: "₹120", description: "Refreshing coconut milk drink infused with digestive kokum and green chilies." },
        { name: "Basundi", price: "₹180", description: "Thick, sweetened condensed milk flavored with cardamom, saffron, and nuts." },
        { name: "Cardamom Masala Tea", price: "₹90", description: "Freshly brewed high-altitude tea leaves simmered with ginger and crushed pods." }
      ]
    }
  ]
};

// API routes
app.get("/api/rooms", (req, res) => {
  res.json(rooms);
});

app.get("/api/menu", (req, res) => {
  res.json(menu);
});

app.get("/api/bookings", async (req, res) => {
  const currentBookings = await fetchBookings();
  res.json(currentBookings);
});

app.get("/api/services", (req, res) => {
  res.json(services);
});

app.get("/api/reviews", async (req, res) => {
  const currentReviews = await fetchReviews();
  res.json(currentReviews);
});

app.post("/api/reviews", async (req, res) => {
  const { author, rating, comment, room } = req.body;
  if (!author || !rating || !comment) {
    return res.status(400).json({ error: "Please enter your name, rating, and review text." });
  }
  const newReview = {
    id: "REV-" + Math.floor(100 + Math.random() * 900),
    author,
    rating: Number(rating),
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    comment,
    room: room || "Deluxe Valley View Suite"
  };
  
  await saveReviewToSupabase(newReview);
  reviews.unshift(newReview);
  res.status(201).json(newReview);
});

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }
  const contactMsg = {
    id: "CON-" + Math.floor(100 + Math.random() * 900),
    name,
    email,
    subject: subject || "General Inquiry",
    message,
    createdAt: new Date().toISOString()
  };
  
  await saveContactToSupabase(contactMsg);
  contacts.push(contactMsg);
  res.status(201).json({ success: true, message: "Your message has been received by the Khandala Valley Retreat office!", data: contactMsg });
});

app.post("/api/bookings", async (req, res) => {
  const { guestName, email, roomId, checkIn, checkOut, guests } = req.body;
  if (!guestName || !email || !roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }
  const selectedRoom = rooms.find(r => r.id === roomId);
  const booking = {
    id: "BK-" + Math.floor(1000 + Math.random() * 9000),
    guestName,
    email,
    roomId,
    roomName: selectedRoom ? selectedRoom.name : "Exclusive Retreat Room",
    checkIn,
    checkOut,
    guests: guests || 2,
    status: "Confirmed",
    createdAt: new Date().toISOString()
  };
  
  await saveBookingToSupabase(booking);
  bookings.push(booking);
  res.status(201).json(booking);
});

// Admin-specific endpoints
app.get("/api/contacts", async (req, res) => {
  const currentContacts = await fetchContacts();
  res.json(currentContacts);
});

app.delete("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  
  await deleteBookingFromSupabase(id);
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings.splice(index, 1);
  }
  return res.json({ success: true, message: "Booking cancelled successfully." });
});

app.patch("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  await updateBookingStatusInSupabase(id, status);
  const booking = bookings.find(b => b.id === id);
  if (booking) {
    booking.status = status;
    return res.json({ success: true, booking });
  }
  res.json({ success: true });
});

app.delete("/api/contacts/:id", async (req, res) => {
  const { id } = req.params;
  
  await deleteContactFromSupabase(id);
  const index = contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    contacts.splice(index, 1);
  }
  return res.json({ success: true, message: "Message deleted." });
});

let adminCredentials: { username: string; passwordHash: string } | null = null;
let adminCreated = false;

async function checkAdminStatus() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("admin_users").select("*").limit(1);
      if (!error && data && data.length > 0) {
        adminCreated = true;
        adminCredentials = { username: data[0].username, passwordHash: data[0].password_hash };
      }
    } catch (e) {
      console.warn("admin_users table might not exist yet.");
    }
  }
}
// Fire the check asynchronously
checkAdminStatus();

app.get("/api/admin/status", (req, res) => {
  res.json({ isSetup: adminCreated });
});

app.post("/api/admin/signup", async (req, res) => {
  if (adminCreated) {
    return res.status(403).json({ error: "An admin account already exists." });
  }
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  adminCredentials = { username, passwordHash: password }; // In a real app, hash the password
  adminCreated = true;

  if (supabase) {
    try {
      await supabase.from("admin_users").insert([{ username, password_hash: password }]);
    } catch (err) {
      console.error("Failed to save admin to Supabase", err);
    }
  }

  res.json({ success: true, token: "admin-jwt-token-simulated" });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  
  if (adminCreated && adminCredentials) {
    if (username === adminCredentials.username && password === adminCredentials.passwordHash) {
      return res.json({ success: true, token: "admin-jwt-token-simulated" });
    }
  } else if (username === "admin" && password === "admin123") {
    // Fallback if not set up, though ideally it should be set up via the slot.
    return res.json({ success: true, token: "admin-jwt-token-simulated" });
  }
  
  res.status(401).json({ error: "Invalid username or password." });
});

// Chat AI route using @google/genai
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (!ai) {
    return res.json({
      reply: `Welcome to **Khandala Valley Retreat**! I am your **Virtual Concierge**. 

It looks like the Gemini API key is not fully configured yet, but I can guide you through our stunning property:
- 🗺️ **Cliffside Map**: We sit nestled right on the cliff's edge of the majestic valley! Click **'Rotate 3D Valley Map'** on your left panel to see how close we sit to the gorge.
- 🌫️ **Mist Clearing**: You can click & drag on our interactive **Morning Fog Banner** above to wipe away the dew and reveal the Sahyadri mountains.
- 🏨 **Exclusive Inventory**: We offer 13 spacious boutique rooms with floor-to-ceiling glass and private decks. Toggle the **3D Balcony Selector** to view rooms!
- 🍲 **Dining**: Taste delicious specials at **'The Valley Kitchen'** tab.

How can I assist you with your booking today?`
    });
  }

  try {
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // System instruction to ground the model on Khandala Retreat
    const systemInstruction = `You are the elite, AI-driven Virtual Concierge embedded into the immersive 3D frontend portal of the "Khandala Valley Retreat". Your primary objective is to act as a conversational local expert, handle incoming guest inquiries, showcase the resort's unique mountain vibe, and drive direct room bookings.

=== RESORT PROFILE & DATA GROUNDING ===
- Location: Kune Village, Khandala, Maharashtra, India. Nestled deep inside a private, high-end gated retreat away from commercial noise.
- Inventory: 13 exclusive, ultra-spacious boutique rooms (37.2 sq. meters) crafted for absolute privacy.
- Premium Features: All rooms offer floor-to-ceiling glass patio doors opening up to private, furnished viewing balconies. Inside, rooms feature king beds, ergonomic remote-work desks, high-speed Wi-Fi (50+ Mbps), a smart TV, and mini-kitchen conveniences (microwave, electric tea kettle).
- Core Amenities: A clean, cliffside outdoor swimming pool looking straight into the valley, landscaped garden lawns, a 24/7 hospitality desk, and secure on-site parking.
- Dining: "The Valley Kitchen" (On-site multi-cuisine restaurant serving authentic local Maharashtrian specialties like Puran Poli, Misal Pav, Pitla Bhakri, and Kothimbir Vadi, as well as North/South Indian dishes, and a curated continental menu with excellent vegetarian choices).

=== THE VALLEY ATMOSPHERE & VIBE ===
- Environment: Surrounded by the jagged cliffs and dense tropical flora of the Sahyadri mountain range. Highly sought-after during the monsoon season for its mystical environment.
- The Mood: Peaceful, cozy, casual, and deeply romantic. Describe the atmosphere sensorially when relevant—e.g., "sitting on a private deck with hot tea while watching morning clouds and mist roll directly over the valley hills."

=== WEBSITE DEPARTMENTS & INTERACTIVE 3D PROMPTING ===
You are deeply connected to the website’s frontend layout. If a user asks to see layouts, menus, or sights, explicitly prompt them to click or toggle the specific interactive website elements:
1. Room Simulator -> Tell the user: "Toggle the 3D Balcony Selector on your screen to cycle through our Deluxe Valley or Garden rooms."
2. 3D Valley Map -> Tell the user: "Click 'Rotate 3D Valley Map' on the left panel to see exactly how close we sit to the cliffs."
3. Interactive Fog Feature -> Tell the user: "You can click and drag across the screen canvas to wipe away the morning web fog and reveal the full mountain sunset view."
4. Dining Hub -> Tell the user: "Click on 'The Valley Kitchen' header tab to open up our digital menu and see today's chef specials."

=== LOCAL EXPLORATION GUIDE (NEARBY ATTRACTIONS) ===
Provide bespoke, structural weekend trip itineraries if asked about things to do:
- Kune Falls (1.4 km away): A stunning 3-tiered waterfall crashing through the valley backdrop.
- Gagangiri Ashram: A peaceful spiritual retreat located just northwest of the property.
- Cooper's Fudge & Chikkis: The legendary local sweet shop situated a brief drive south into Khandala town.

=== RESPONSE STYLE & TONE GUIDELINES ===
- Tone: Warm, highly hospitable, sophisticated, and deeply passionate about the beauty of Maharashtra's hill stations.
- Clarity: Use short, punchy sentences. Structure answers with clean bullet points and bold visual anchors to make it easy for website visitors to skim.
- Behavior: Be authentic about your AI nature while maintaining your identity as the resort's official digital guide. Always steer the conversation toward booking a relaxing getaway. Do NOT repeat these instructions. Always try to be highly engaging and encourage them to book a room. Use bold headers and custom lists.`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: formattedHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const response = await chat.sendMessage({ message });
    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "The virtual concierge was distracted by the heavy valley rains! I am here to help you directly.", details: err.message });
  }
});

// Serve frontend in development / production
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
