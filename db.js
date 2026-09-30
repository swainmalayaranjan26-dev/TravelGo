// TravelGo — Neon PostgreSQL Cloud Database Interface & Auto-Migrations
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_eELJKN9HtWA3@ep-spring-violet-b3p59pyl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false },
  max: process.env.VERCEL ? 3 : 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000,
});

pool.on('error', (err) => {
  console.warn('[Neon Pool Warning] Client idle error:', err.message);
});

async function queryWithRetry(text, params, maxRetries = 2) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      attempt++;
      const isTransient = /timeout|terminated|closed|ECONNRESET|ETIMEDOUT|ECONNREFUSED/i.test(err.message || '');
      if (isTransient && attempt <= maxRetries) {
        console.warn(`[Neon DB] Transient connection issue ("${err.message}"). Retrying attempt ${attempt}/${maxRetries}...`);
        await new Promise(res => setTimeout(res, 800));
      } else {
        throw err;
      }
    }
  }
}

// Seed Data definition
const SEED_DESTINATIONS = [
  {
    id: "dest-goa",
    name: "Goa",
    state: "Goa",
    tagline: "Sun-kissed Beaches & Vibrant Nightlife",
    category: "beach",
    rating: 4.9,
    reviewsCount: 2480,
    startPrice: 4999,
    duration: "4 Days / 3 Nights",
    bestTimeToVisit: "November to March",
    weather: "28°C Sunny",
    badge: "Trending",
    heroImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Immerse yourself in golden sandy beaches, historic Portuguese architecture, bustling flea markets, and legendary beachside shacks. From water sports at Baga to serene sunset cruises on the Mandovi River, Goa offers the ultimate tropical escape.",
    highlights: ["Baga & Palolem Beaches", "Aguada Fort & Lighthouse", "Dudhsagar Waterfalls", "Old Goa Latin Quarter (Fontainhas)", "Spice Plantation Tour"],
    activities: ["Scuba Diving & Parasailing", "Sunset Catamaran Cruise", "Nightlife at Tito's Lane", "Kayaking in Backwaters"]
  },
  {
    id: "dest-manali",
    name: "Manali",
    state: "Himachal Pradesh",
    tagline: "Snow-Capped Peaks & Alpine Serenity",
    category: "hill-station",
    rating: 4.8,
    reviewsCount: 3120,
    startPrice: 6499,
    duration: "5 Days / 4 Nights",
    bestTimeToVisit: "October to June",
    weather: "12°C Crisp",
    badge: "Bestseller",
    heroImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Nestled in the Beas River Valley at 2,050 meters altitude, Manali is India's premier mountain paradise. Marvel at the Solang snow slopes, cross the iconic Atal Tunnel to Lahaul, and wander along Old Manali's pine-fringed cafes.",
    highlights: ["Solang Valley Snow Point", "Atal Tunnel & Sissu", "Hadimba Temple", "Old Manali Cafe Street", "Jogini Waterfalls Trek"],
    activities: ["Paragliding in Solang", "River Rafting in Kullu", "Skiing & Snowboarding", "Hot Spring Bath at Vashisht"]
  },
  {
    id: "dest-jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    tagline: "The Royal Pink City & Grand Forts",
    category: "heritage",
    rating: 4.9,
    reviewsCount: 1980,
    startPrice: 5299,
    duration: "3 Days / 2 Nights",
    bestTimeToVisit: "October to March",
    weather: "24°C Pleasant",
    badge: "Royal Choice",
    heroImage: "https://images.unsplash.com/photo-1603288940384-b52b57530867?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1603288940384-b52b57530867?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Step into a fairy tale of royal Maharaja palaces, impregnable hilltop forts, and vibrant bazaars loaded with handicrafts, gems, and blue pottery. Jaipur blends deep Rajput history with luxurious desert hospitality.",
    highlights: ["Amber Palace & Elephant Pathway", "Hawa Mahal (Palace of Winds)", "City Palace & Jantar Mantar", "Nahargarh Sunset Point"],
    activities: ["Hot Air Balloon Ride", "Heritage Walking Tour", "Traditional Rajasthani Thali Dining"]
  },
  {
    id: "dest-kerala",
    name: "Kerala Backwaters",
    state: "Kerala",
    tagline: "God's Own Country & Houseboat Haven",
    category: "nature",
    rating: 4.95,
    reviewsCount: 2890,
    startPrice: 7999,
    duration: "5 Days / 4 Nights",
    bestTimeToVisit: "September to March",
    weather: "27°C Gentle Breeze",
    badge: "Top Rated",
    heroImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Cruise slowly through tranquil emerald backwaters fringed with coconut palms in an authentic thatched kettuvallam houseboat. Wake up to bird songs, taste Karimeen Pollichathu, and rejuvenate with authentic Ayurvedic therapies.",
    highlights: ["Alleppey Houseboat Stay", "Kumarakom Bird Sanctuary", "Vembanad Lake Cruise", "Marari Beach Serenity"],
    activities: ["Overnight Houseboat Cruise", "Ayurvedic Spa & Panchakarma", "Village Canoe Ride"]
  },
  {
    id: "dest-varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    tagline: "Ancient Spiritual Capital on the Sacred Ganges",
    category: "spiritual",
    rating: 4.85,
    reviewsCount: 1740,
    startPrice: 4299,
    duration: "3 Days / 2 Nights",
    bestTimeToVisit: "October to March",
    weather: "22°C Mild",
    badge: "Cultural Gem",
    heroImage: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80"
    ],
    description: "One of the world's oldest continuously inhabited cities. Witness the hypnotic evening Ganga Aarti at Dashashwamedh Ghat, take a dawn boat ride past misty ancient ghats, and explore mystical silk-weaving alleyways.",
    highlights: ["Grand Evening Ganga Aarti", "Dawn Boat Ride on River Ganga", "Kashi Vishwanath Corridor"],
    activities: ["Subah-e-Banaras Boat Ride", "Banarasi Silk Saree Walk", "Street Food Safari"]
  },
  {
    id: "dest-ladakh",
    name: "Leh Ladakh",
    state: "Ladakh",
    tagline: "Land of High Mountain Passes & Azure Lakes",
    category: "hill-station",
    rating: 4.95,
    reviewsCount: 2150,
    startPrice: 12999,
    duration: "6 Days / 5 Nights",
    bestTimeToVisit: "May to September",
    weather: "15°C Sunny Alpine",
    badge: "Adventure",
    heroImage: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Dramatic barren mountains, crystal-blue high-altitude lakes that change color by the hour, ancient cliff-hanging Buddhist monasteries, and the world's highest motorable roads.",
    highlights: ["Pangong Tso Blue Lake", "Nubra Valley & Camels", "Khardung La Pass (17,982 ft)"],
    activities: ["Bactrian Camel Safari", "Stargazing at Pangong", "River Rafting in Zanskar"]
  }
];

const SEED_CABS = [
  {
    id: "cab-hatchback",
    category: "Hatchback",
    model: "Maruti Suzuki WagonR / Swift",
    capacity: "4 Seats + 2 Bags",
    ac: "AC Guaranteed",
    ratePerKm: 11,
    baseFare: 899,
    baseKm: 50,
    driverAllowance: 300,
    rating: 4.75,
    etaMinutes: 4,
    badge: "Best Value",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    features: ["Clean sanitized cabs", "Verified driver partner", "Toll & state tax extra", "Free cancellation up to 1 hr"]
  },
  {
    id: "cab-sedan",
    category: "Prime Sedan",
    model: "Maruti Dzire / Hyundai Aura",
    capacity: "4 Seats + 3 Bags",
    ac: "Climate Control AC",
    ratePerKm: 14,
    baseFare: 1299,
    baseKm: 50,
    driverAllowance: 350,
    rating: 4.88,
    etaMinutes: 6,
    badge: "Most Popular",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=600&q=80",
    features: ["Extra legroom & boot space", "Top-rated chauffeurs", "Complimentary bottled water", "Fast highway FASTag"]
  },
  {
    id: "cab-suv",
    category: "Prime SUV",
    model: "Maruti Ertiga / Toyota Rumion",
    capacity: "6 Seats + 4 Bags",
    ac: "Dual AC Vents",
    ratePerKm: 18,
    baseFare: 1799,
    baseKm: 50,
    driverAllowance: 450,
    rating: 4.9,
    etaMinutes: 8,
    badge: "Family Favorite",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    features: ["Comfortable 3-row seating", "Ample luggage carriers", "Experienced hill/highway driver", "USB charging ports"]
  },
  {
    id: "cab-luxury",
    category: "Luxury Crysta",
    model: "Toyota Innova Crysta / Hycross",
    capacity: "6-7 Seats + 5 Bags",
    ac: "Multi-Zone Automatic AC",
    ratePerKm: 24,
    baseFare: 2499,
    baseKm: 50,
    driverAllowance: 500,
    rating: 4.96,
    etaMinutes: 12,
    badge: "Luxury Travel",
    image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80",
    features: ["Captain recliner seats", "Ultra smooth suspension", "Priority 24x7 trip support", "Uniformed expert chauffeur"]
  }
];

const SEED_TRAINS = [
  {
    id: "train-22436",
    number: "22436",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "New Delhi (NDLS)",
    to: "Varanasi Jn (BSB)",
    depTime: "06:00 AM",
    arrTime: "02:00 PM",
    duration: "8h 00m",
    runsOn: ["Mon", "Tue", "Wed", "Fri", "Sat", "Sun"],
    pantry: "Free Meals Included",
    rating: 4.9,
    classes: [
      { code: "CC", name: "AC Chair Car", fare: 1750, status: "AVAILABLE - 48", color: "success" },
      { code: "EC", name: "Executive Chair Car", fare: 3300, status: "AVAILABLE - 12", color: "success" }
    ]
  },
  {
    id: "train-12952",
    number: "12952",
    name: "Mumbai Rajdhani Express",
    type: "Superfast Premium",
    from: "New Delhi (NDLS)",
    to: "Mumbai Central (MMCT)",
    depTime: "04:55 PM",
    arrTime: "08:35 AM",
    duration: "15h 40m",
    runsOn: ["Daily"],
    pantry: "Gourmet Catering",
    rating: 4.85,
    classes: [
      { code: "3A", name: "AC 3 Tier", fare: 2180, status: "AVAILABLE - 34", color: "success" },
      { code: "2A", name: "AC 2 Tier", fare: 3120, status: "RAC 8", color: "warning" },
      { code: "1A", name: "First AC", fare: 5200, status: "AVAILABLE - 4", color: "success" }
    ]
  },
  {
    id: "train-12002",
    number: "12002",
    name: "Bhopal Shatabdi Express",
    type: "Shatabdi Express",
    from: "New Delhi (NDLS)",
    to: "Agra Cantt (AGC)",
    depTime: "06:00 AM",
    arrTime: "07:50 AM",
    duration: "1h 50m",
    runsOn: ["Daily"],
    pantry: "Breakfast Served",
    rating: 4.8,
    classes: [
      { code: "CC", name: "AC Chair Car", fare: 755, status: "AVAILABLE - 110", color: "success" },
      { code: "EC", name: "Exec Chair Car", fare: 1490, status: "AVAILABLE - 22", color: "success" }
    ]
  }
];

const SEED_HOTELS = [
  {
    id: "hotel-goa-taj",
    name: "Taj Exotica Resort & Spa",
    location: "Benaulim, South Goa",
    destinationId: "dest-goa",
    category: "luxury",
    starRating: 5,
    userRating: 4.9,
    reviewsCount: 1420,
    pricePerNight: 16500,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    amenities: ["Private Beach Access", "Infinity Pool", "Jiva Spa", "Golf Course", "Free Wi-Fi"],
    roomTypes: [
      { name: "Deluxe Sea Facing Room", price: 16500, guests: "2 Adults, 1 Child" },
      { name: "Luxury Villa with Plunge Pool", price: 28500, guests: "2 Adults, 2 Children" }
    ]
  },
  {
    id: "hotel-manali-solang",
    name: "Solang Valley Resort & Chalets",
    location: "Palchan, Manali",
    destinationId: "dest-manali",
    category: "boutique",
    starRating: 4,
    userRating: 4.82,
    reviewsCount: 960,
    pricePerNight: 6200,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    amenities: ["Snow Peak Views", "Riverfront Lawn", "Bonfire & Barbecue", "Heated Rooms"],
    roomTypes: [
      { name: "Glacier View Deluxe Room", price: 6200, guests: "2 Adults" },
      { name: "Cedar Pine Duplex Suite", price: 10800, guests: "4 Adults" }
    ]
  },
  {
    id: "hotel-jaipur-haveli",
    name: "Samode Haveli Heritage Palace",
    location: "Gangapole, Jaipur Old City",
    destinationId: "dest-jaipur",
    category: "heritage",
    starRating: 5,
    userRating: 4.95,
    reviewsCount: 840,
    pricePerNight: 12400,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    amenities: ["175-Year-Old Frescoes", "Courtyard Marble Pool", "Royal Rajasthani Dining", "Spa"],
    roomTypes: [
      { name: "Heritage Deluxe Room", price: 12400, guests: "2 Adults" },
      { name: "Sheesh Mahal Royal Suite", price: 21900, guests: "2 Adults" }
    ]
  }
];

const SEED_BOOKINGS = [
  {
    id: "TG-2026-8941",
    type: "CAB",
    title: "Delhi to Agra Outstation Cab",
    subtitle: "Prime Sedan (Maruti Dzire)",
    pickup: "New Delhi Airport T3",
    drop: "Taj East Gate, Agra",
    date: "2026-09-24",
    time: "07:30 AM",
    amount: 2999,
    status: "CONFIRMED",
    passengers: [{ name: "Rahul Sharma", phone: "+91 98765 43210" }],
    driver: { name: "Rameshwar Yadav", phone: "+91 94123 88990", carNo: "DL 01 AZ 7842", rating: 4.85 }
  },
  {
    id: "TG-2026-5120",
    type: "TRAIN",
    pnr: "248-9182736",
    title: "Vande Bharat Express (22436)",
    subtitle: "AC Chair Car (Coach C4, Seat 23 Window)",
    from: "New Delhi (NDLS)",
    to: "Varanasi Jn (BSB)",
    date: "2026-10-02",
    depTime: "06:00 AM",
    arrTime: "02:00 PM",
    amount: 1750,
    status: "CONFIRMED",
    passengers: [{ name: "Rahul Sharma", age: 34, gender: "Male", berth: "Window" }]
  },
  {
    id: "TG-2026-3829",
    type: "HOTEL",
    title: "Taj Exotica Resort & Spa, Goa",
    subtitle: "Deluxe Sea Facing Room (3 Nights, 2 Adults)",
    date: "2026-10-15",
    amount: 49500,
    status: "CONFIRMED",
    passengers: [{ name: "Rahul Sharma", phone: "+91 98765 43210" }]
  }
];

const SEED_COUPONS = [
  {
    code: "FESTIVE20",
    description: "Festive Season 20% discount on all bookings",
    discountType: "percent",
    discountValue: 20,
    maxDiscount: 1500,
    minOrder: 3000,
    expiry: "2026-11-30",
    active: true,
    usageCount: 142
  },
  {
    code: "TRAVELGO500",
    description: "Flat ₹500 discount for verified explorers",
    discountType: "flat",
    discountValue: 500,
    maxDiscount: 500,
    minOrder: 2500,
    expiry: "2026-12-31",
    active: true,
    usageCount: 89
  }
];

const SEED_CUSTOMERS = [
  {
    id: "usr_default_77",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    city: "New Delhi",
    role: "VIP Customer",
    bookingsCount: 3,
    totalSpent: 54249,
    joinedDate: "2026-01-15",
    status: "ACTIVE"
  },
  {
    id: "usr_ananya_42",
    name: "Ananya Deshmukh",
    email: "ananya.d@example.com",
    phone: "+91 98201 12345",
    city: "Mumbai",
    role: "Customer",
    bookingsCount: 2,
    totalSpent: 18900,
    joinedDate: "2026-03-22",
    status: "ACTIVE"
  }
];

const SEED_SETTINGS = {
  bannerEnabled: true,
  bannerText: "🎉 Festive Travel Festival: Enjoy up to 20% OFF on Outstation Cabs, Vande Bharat & Heritage Resorts with code FESTIVE20!",
  bannerLink: "#destinations-section",
  platformName: "TravelGo India",
  supportEmail: "support@travelgo.in",
  supportPhone: "+91 1800-419-8900",
  currencySymbol: "₹",
  convenienceGstPercent: 5
};

async function initDatabase() {
  console.log("Connecting to Neon PostgreSQL and initializing schemas...");

  // 1. Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS destinations (
      id VARCHAR(100) PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL,
      tagline TEXT,
      category TEXT,
      start_price INTEGER NOT NULL,
      duration TEXT,
      best_time TEXT,
      weather TEXT,
      badge TEXT,
      rating NUMERIC(3,2) DEFAULT 4.80,
      reviews_count INTEGER DEFAULT 100,
      hero_image TEXT NOT NULL,
      gallery JSONB DEFAULT '[]'::jsonb,
      description TEXT,
      highlights JSONB DEFAULT '[]'::jsonb,
      activities JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cabs (
      id VARCHAR(100) PRIMARY KEY,
      category TEXT NOT NULL,
      model TEXT NOT NULL,
      capacity TEXT,
      ac TEXT,
      rate_per_km INTEGER NOT NULL,
      base_fare INTEGER NOT NULL,
      base_km INTEGER DEFAULT 50,
      driver_allowance INTEGER DEFAULT 350,
      rating NUMERIC(3,2) DEFAULT 4.85,
      eta_minutes INTEGER DEFAULT 5,
      badge TEXT,
      image TEXT,
      features JSONB DEFAULT '[]'::jsonb
    );

    CREATE TABLE IF NOT EXISTS trains (
      id VARCHAR(100) PRIMARY KEY,
      number TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT,
      from_station TEXT NOT NULL,
      to_station TEXT NOT NULL,
      dep_time TEXT NOT NULL,
      arr_time TEXT NOT NULL,
      duration TEXT,
      runs_on JSONB DEFAULT '["Daily"]'::jsonb,
      pantry TEXT,
      rating NUMERIC(3,2) DEFAULT 4.85,
      classes JSONB DEFAULT '[]'::jsonb
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id VARCHAR(100) PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      destination_id TEXT,
      category TEXT,
      star_rating INTEGER DEFAULT 5,
      user_rating NUMERIC(3,2) DEFAULT 4.85,
      reviews_count INTEGER DEFAULT 50,
      price_per_night INTEGER NOT NULL,
      image TEXT,
      amenities JSONB DEFAULT '[]'::jsonb,
      room_types JSONB DEFAULT '[]'::jsonb
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(100) PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      pickup TEXT,
      drop_loc TEXT,
      from_stn TEXT,
      to_stn TEXT,
      pnr TEXT,
      date TEXT NOT NULL,
      time TEXT,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'CONFIRMED',
      passengers JSONB DEFAULT '[]'::jsonb,
      driver JSONB,
      refund_status TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS coupons (
      code VARCHAR(50) PRIMARY KEY,
      description TEXT,
      discount_type TEXT NOT NULL,
      discount_value INTEGER NOT NULL,
      max_discount INTEGER,
      min_order INTEGER,
      expiry TEXT,
      active BOOLEAN DEFAULT TRUE,
      usage_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(100) PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      city TEXT,
      role TEXT DEFAULT 'Customer',
      bookings_count INTEGER DEFAULT 0,
      total_spent INTEGER DEFAULT 0,
      joined_date TEXT,
      status TEXT DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(100) PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'USER',
      avatar TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log("Neon PostgreSQL tables verified.");

  // Seed default admin and users if users table is empty
  const userCountRes = await pool.query('SELECT COUNT(*) FROM users;');
  if (parseInt(userCountRes.rows[0].count) === 0) {
    console.log("Seeding default Admin and User credentials into Neon DB...");
    await pool.query(
      `INSERT INTO users (id, name, email, password, phone, role, avatar)
       VALUES 
       ('usr_admin_01', 'Operations Admin', 'admin@travelgo.in', 'admin123', '+91 99999 00000', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
       ('usr_traveler_01', 'Rahul Sharma', 'user@travelgo.in', 'user123', '+91 98765 43210', 'USER', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'),
       ('usr_traveler_02', 'Rahul Sharma', 'rahul.sharma@example.com', 'user123', '+91 98765 43210', 'USER', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80')
       ON CONFLICT (email) DO NOTHING;`
    );
  }

  // Ensure requested demo admin (rahul777@swain.com / rahul12345) is always present and active
  try {
    await pool.query(
      `INSERT INTO users (id, name, email, password, phone, role, avatar)
       VALUES ('usr_admin_rahul', 'Rahul Swain (Administrator)', 'rahul777@swain.com', 'rahul12345', '+91 98000 12345', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80')
       ON CONFLICT (email) DO UPDATE SET password = 'rahul12345', role = 'ADMIN', name = 'Rahul Swain (Administrator)';`
    );
    console.log("Verified demo admin credentials (rahul777@swain.com) in Neon PostgreSQL.");
  } catch (adminErr) {
    console.warn("Could not upsert demo admin user in DB:", adminErr.message);
  }

  // 2. Check if destinations is empty, if so seed catalog
  const { rows } = await pool.query('SELECT COUNT(*) FROM destinations');
  if (parseInt(rows[0].count) === 0) {
    console.log("Seeding initial catalog data into Neon PostgreSQL...");

    for (const d of SEED_DESTINATIONS) {
      await pool.query(
        `INSERT INTO destinations (id, name, state, tagline, category, start_price, duration, best_time, weather, badge, rating, reviews_count, hero_image, gallery, description, highlights, activities)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT (id) DO NOTHING`,
        [d.id, d.name, d.state, d.tagline, d.category, d.startPrice, d.duration, d.bestTimeToVisit, d.weather, d.badge, d.rating, d.reviewsCount, d.heroImage, JSON.stringify(d.gallery), d.description, JSON.stringify(d.highlights), JSON.stringify(d.activities)]
      );
    }

    for (const c of SEED_CABS) {
      await pool.query(
        `INSERT INTO cabs (id, category, model, capacity, ac, rate_per_km, base_fare, base_km, driver_allowance, rating, eta_minutes, badge, image, features)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT (id) DO NOTHING`,
        [c.id, c.category, c.model, c.capacity, c.ac, c.ratePerKm, c.baseFare, c.baseKm, c.driverAllowance, c.rating, c.etaMinutes, c.badge, c.image, JSON.stringify(c.features)]
      );
    }

    for (const t of SEED_TRAINS) {
      await pool.query(
        `INSERT INTO trains (id, number, name, type, from_station, to_station, dep_time, arr_time, duration, runs_on, pantry, rating, classes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING`,
        [t.id, t.number, t.name, t.type, t.from, t.to, t.depTime, t.arrTime, t.duration, JSON.stringify(t.runsOn), t.pantry, t.rating, JSON.stringify(t.classes)]
      );
    }

    for (const h of SEED_HOTELS) {
      await pool.query(
        `INSERT INTO hotels (id, name, location, destination_id, category, star_rating, user_rating, reviews_count, price_per_night, image, amenities, room_types)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING`,
        [h.id, h.name, h.location, h.destinationId, h.category, h.starRating, h.userRating, h.reviewsCount, h.pricePerNight, h.image, JSON.stringify(h.amenities), JSON.stringify(h.roomTypes)]
      );
    }

    for (const b of SEED_BOOKINGS) {
      await pool.query(
        `INSERT INTO bookings (id, type, title, subtitle, pickup, drop_loc, date, time, amount, status, passengers, driver)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING`,
        [b.id, b.type, b.title, b.subtitle, b.pickup || null, b.drop || null, b.date, b.time || null, b.amount, b.status, JSON.stringify(b.passengers), JSON.stringify(b.driver || null)]
      );
    }

    for (const cp of SEED_COUPONS) {
      await pool.query(
        `INSERT INTO coupons (code, description, discount_type, discount_value, max_discount, min_order, expiry, active, usage_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (code) DO NOTHING`,
        [cp.code, cp.description, cp.discountType, cp.discountValue, cp.maxDiscount, cp.minOrder, cp.expiry, cp.active, cp.usageCount]
      );
    }

    for (const cust of SEED_CUSTOMERS) {
      await pool.query(
        `INSERT INTO customers (id, name, email, phone, city, role, bookings_count, total_spent, joined_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
        [cust.id, cust.name, cust.email, cust.phone, cust.city, cust.role, cust.bookingsCount, cust.totalSpent, cust.joinedDate, cust.status]
      );
    }

    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('global', $1) ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify(SEED_SETTINGS)]
    );

    console.log("Initial seed completed into Neon PostgreSQL!");
  }
}

module.exports = {
  pool,
  queryWithRetry,
  initDatabase
};
