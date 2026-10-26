# 🏔️ Khandala Valley Retreat

An interactive website and **AI-powered Virtual Concierge** for *Khandala Valley Retreat*, a luxury cliffside stay in Kune Village, Khandala, Maharashtra. Guests can explore rooms, browse the gallery and menu, chat with an AI concierge, and book a stay, while the hotel team manages everything from an admin dashboard.

---

## ✨ Features

### For guests
- **AI Virtual Concierge** – a Gemini-powered chat assistant that answers questions about rooms, dining, services and the retreat.
- **Room booking** – reserve a stay by choosing a room, dates and number of guests.
  - Deluxe Valley View Suite
  - Premium Cliffside Villa
  - Royal Duplex Family Villa
- **Interactive 3D Valley Map** – rotate the map and tap hotspots to learn about the rooms, viewpoints and facilities.
- **Fog Canvas** – a fun, interactive fog effect you can wipe away to reveal the valley view.
- **Hotel Gallery** – browse photos by category (Exterior, Lounge & Dining, Suites, Amenities) and send an inquiry straight from a photo.
- **The Valley Kitchen menu** – Maharashtrian specials, continental veg dishes, desserts and hot brews.
- **Reviews and contact form** – read guest reviews, post your own, or send an inquiry.

### For the hotel team (Admin portal)
- Admin sign-up and login.
- Dashboard with total bookings and active reservations.
- Update booking status (Confirmed → Checked In → Completed) or cancel a booking.
- View and delete guest inquiries.
- Manage the guest feedback board.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Lucide React
- **Backend:** Node.js, Express (TypeScript, run with `tsx`)
- **AI:** Google Gemini via `@google/genai`
- **Database:** Supabase (PostgreSQL). If Supabase is not set up, the server falls back to in-memory sample data.

---

## 📁 Project Structure

```
├── server.ts               # Express API, Gemini chat, Supabase sync
├── supabase-setup.sql      # Table creation + Row Level Security policies
├── index.html
├── src/
│   ├── App.tsx             # Main page, booking, concierge, admin dashboard
│   ├── types.ts
│   └── components/
│       ├── ValleyMap.tsx
│       ├── FogCanvas.tsx
│       └── HotelGallery.tsx
└── .env.example
```

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18+, a [Gemini API key](https://aistudio.google.com/apikey), and (optionally) a free [Supabase](https://supabase.com) project.

```bash
# 1. Clone the repository
git clone https://github.com/GayatriN-16/Khandala-Valley-Retreat.git
cd Khandala-Valley-Retreat

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# then fill in GEMINI_API_KEY (and your Supabase values)

# 4. (Optional) Set up the database
# Run supabase-setup.sql in the Supabase SQL Editor

# 5. Start the app
npm run dev
```

Open **http://localhost:3000**.

### Production build

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (powers the Virtual Concierge) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase publishable (anon) key |
| `APP_URL` | URL where the app is hosted (optional) |

Never commit a real `.env` file.

---

## 🔌 API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/rooms`, `/api/menu`, `/api/services`, `/api/reviews` | Retreat information |
| GET / POST | `/api/bookings` | List or create bookings |
| PATCH / DELETE | `/api/bookings/:id` | Update status or cancel |
| GET / POST | `/api/contacts`, `/api/contact` | Guest inquiries |
| POST | `/api/reviews` | Submit a review |
| POST | `/api/chat` | Talk to the AI Virtual Concierge |
| POST | `/api/admin/login`, `/api/admin/signup` | Admin access |

---

## ⚠️ Prototype Notes & Roadmap

This is a prototype built for learning and demonstration.

- Admin passwords should be **hashed** (for example with bcrypt) and sessions secured with proper tokens.
- Tighten the Supabase Row Level Security policies, which currently allow anonymous access.
- Add online payments and email confirmations.

---

## 👩‍💻 Author

**Gayatri Nikam** – Final-year B.E. Computer Engineering student, aspiring Data Scientist
GitHub: [@GayatriN-16](https://github.com/GayatriN-16)
