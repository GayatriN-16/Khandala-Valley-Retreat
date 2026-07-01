export interface Room {
  id: string;
  name: string;
  type: string;
  size: string;
  price: string;
  description: string;
  amenities: string[];
  image: string;
  balconyView: string;
}

export interface MenuItem {
  name: string;
  price: string;
  description: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuData {
  restaurant: string;
  description: string;
  categories: MenuCategory[];
}

export interface Booking {
  id?: string;
  guestName: string;
  email: string;
  roomId: string;
  roomName?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status?: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}
