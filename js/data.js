// TravelGo - Comprehensive Travel Catalog Data (India Focus)

export const DESTINATIONS = [
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
    activities: ["Scuba Diving & Parasailing", "Sunset Catamaran Cruise", "Nightlife at Tito's Lane", "Kayaking in Backwaters"],
    popularFrom: ["Mumbai", "Delhi", "Bangalore", "Pune"]
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
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Nestled in the Beas River Valley at 2,050 meters altitude, Manali is India's premier mountain paradise. Marvel at the Solang snow slopes, cross the iconic Atal Tunnel to Lahaul, and wander along Old Manali's pine-fringed cafes.",
    highlights: ["Solang Valley Snow Point", "Atal Tunnel & Sissu", "Hadimba Temple", "Old Manali Cafe Street", "Jogini Waterfalls Trek"],
    activities: ["Paragliding in Solang", "River Rafting in Kullu", "Skiing & Snowboarding", "Hot Spring Bath at Vashisht"],
    popularFrom: ["Delhi", "Chandigarh", "Jaipur", "Amritsar"]
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
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Step into a fairy tale of royal Maharaja palaces, impregnable hilltop forts, and vibrant bazaars loaded with handicrafts, gems, and blue pottery. Jaipur blends deep Rajput history with luxurious desert hospitality.",
    highlights: ["Amber Palace & Elephant Pathway", "Hawa Mahal (Palace of Winds)", "City Palace & Jantar Mantar", "Nahargarh Sunset Point", "Chokhi Dhani Cultural Village"],
    activities: ["Hot Air Balloon Ride", "Heritage Walking Tour", "Traditional Rajasthani Thali Dining", "Jewelry & Textile Shopping"],
    popularFrom: ["Delhi", "Agra", "Mumbai", "Ahmedabad"]
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
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Cruise slowly through tranquil emerald backwaters fringed with coconut palms in an authentic thatched kettuvallam houseboat. Wake up to bird songs, taste Karimeen Pollichathu, and rejuvenate with authentic Ayurvedic therapies.",
    highlights: ["Alleppey Houseboat Stay", "Kumarakom Bird Sanctuary", "Vembanad Lake Cruise", "Marari Beach Serenity", "Munnar Tea Gardens Day Excursion"],
    activities: ["Overnight Houseboat Cruise", "Ayurvedic Spa & Panchakarma", "Village Canoe Ride", "Kathakali Classical Dance Show"],
    popularFrom: ["Kochi", "Bangalore", "Chennai", "Mumbai"]
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
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80"
    ],
    description: "One of the world's oldest continuously inhabited cities. Witness the hypnotic evening Ganga Aarti at Dashashwamedh Ghat, take a dawn boat ride past misty ancient ghats, and explore mystical silk-weaving alleyways.",
    highlights: ["Grand Evening Ganga Aarti", "Dawn Boat Ride on River Ganga", "Kashi Vishwanath Corridor", "Sarnath Buddhist Stupa", "Assi Ghat Morning Yoga"],
    activities: ["Subah-e-Banaras Boat Ride", "Banarasi Silk Saree Walk", "Street Food Safari (Kachori & Malaiyo)", "Heritage Ghat Trail"],
    popularFrom: ["Delhi", "Kolkata", "Patna", "Lucknow"]
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
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Dramatic barren mountains, crystal-blue high-altitude lakes that change color by the hour, ancient cliff-hanging Buddhist monasteries, and the world's highest motorable roads. An awe-inspiring adventure of a lifetime.",
    highlights: ["Pangong Tso Blue Lake", "Nubra Valley & Double-Humped Camels", "Khardung La Pass (17,982 ft)", "Thiksey & Hemis Monasteries", "Magnetic Hill"],
    activities: ["Bactrian Camel Safari in Hunder Sand Dunes", "Stargazing at Pangong", "River Rafting in Zanskar", "Mountain Biking down Khardung La"],
    popularFrom: ["Delhi", "Chandigarh", "Srinagar", "Manali"]
  },
  {
    id: "dest-udaipur",
    name: "Udaipur",
    state: "Rajasthan",
    tagline: "City of Lakes & Venetian Romance",
    category: "heritage",
    rating: 4.9,
    reviewsCount: 1620,
    startPrice: 5899,
    duration: "4 Days / 3 Nights",
    bestTimeToVisit: "September to March",
    weather: "25°C Warm Sun",
    badge: "Romantic",
    heroImage: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Known as the Venice of the East, Udaipur is built around tranquil blue lakes overlooked by grandiose white marble palaces. Indulge in sunset boat rides on Lake Pichola and luxury dining under star-lit royal courtyards.",
    highlights: ["Grand City Palace Complex", "Lake Pichola Sunset Boat Ride", "Jag Mandir Island Palace", "Saheliyon-ki-Bari Gardens", "Monsoon Palace (Sajjangarh)"],
    activities: ["Private Lake Boat Cruise", "Dharohar Folk Dance Show", "Heritage Walk in Old City", "Rooftop Candlelight Dinner"],
    popularFrom: ["Ahmedabad", "Jaipur", "Mumbai", "Delhi"]
  },
  {
    id: "dest-rishikesh",
    name: "Rishikesh",
    state: "Uttarakhand",
    tagline: "Yoga Capital of the World & Ganga Rapids",
    category: "nature",
    rating: 4.8,
    reviewsCount: 2240,
    startPrice: 3999,
    duration: "3 Days / 2 Nights",
    bestTimeToVisit: "September to June",
    weather: "21°C Fresh",
    badge: "Popular",
    heroImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Where the pristine emerald Ganges surges out from the Himalayan foothills. Famous for white-water rafting, cliff jumping, peaceful ashrams, world-renowned yoga retreats, and the sacred Parmarth Niketan Ganga Aarti.",
    highlights: ["Laxman Jhula & Ram Jhula", "White Water Rafting Rapids (Grade III & IV)", "Beatles Ashram (Chaurasi Kutia)", "Triveni Ghat Evening Aarti", "Neer Garh Waterfall Trek"],
    activities: ["White Water Rafting (16km / 24km)", "Bungee Jumping at Mohan Chatti (83m)", "Sunrise Yoga by the River", "Riverside Beach Camping & Bonfire"],
    popularFrom: ["Delhi", "Dehradun", "Chandigarh", "Haridwar"]
  }
];

export const CABS_DATA = [
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

export const POPULAR_CAB_ROUTES = [
  { from: "Delhi", to: "Agra (Taj Mahal)", distanceKm: 230, estHours: "3.5 hrs", priceSedan: 2999, highway: "Yamuna Expressway" },
  { from: "Mumbai", to: "Pune", distanceKm: 155, estHours: "3 hrs", priceSedan: 2299, highway: "Mumbai-Pune Expressway" },
  { from: "Bangalore", to: "Mysuru", distanceKm: 145, estHours: "2.5 hrs", priceSedan: 2199, highway: "Bengaluru-Mysuru Access Highway" },
  { from: "Jaipur", to: "Delhi NCR", distanceKm: 275, estHours: "4.5 hrs", priceSedan: 3499, highway: "Delhi-Jaipur Highway" },
  { from: "Chandigarh", to: "Manali", distanceKm: 290, estHours: "7 hrs", priceSedan: 5499, highway: "Kiratpur-Manali 4-Lane" },
  { from: "Goa Airport (GOX)", to: "North Goa (Calangute/Baga)", distanceKm: 32, estHours: "45 mins", priceSedan: 1499, highway: "NH 66 Express" }
];

export const TRAINS_DATA = [
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
  },
  {
    id: "train-10103",
    number: "10103",
    name: "Mandovi Express",
    type: "Scenic Konkan Railway",
    from: "Mumbai CSMT (CSMT)",
    to: "Madgaon Goa (MAO)",
    depTime: "07:10 AM",
    arrTime: "07:10 PM",
    duration: "12h 00m",
    runsOn: ["Daily"],
    pantry: "Konkan Local Delicacies",
    rating: 4.75,
    classes: [
      { code: "SL", name: "Sleeper Class", fare: 485, status: "AVAILABLE - 85", color: "success" },
      { code: "3A", name: "AC 3 Tier", fare: 1315, status: "AVAILABLE - 24", color: "success" },
      { code: "2A", name: "AC 2 Tier", fare: 1890, status: "WL 4", color: "danger" }
    ]
  },
  {
    id: "train-20608",
    number: "20608",
    name: "Mysuru - Chennai Vande Bharat",
    type: "Semi-High Speed",
    from: "Bengaluru City (SBC)",
    to: "Chennai Central (MAS)",
    depTime: "02:50 PM",
    arrTime: "07:30 PM",
    duration: "4h 40m",
    runsOn: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon"],
    pantry: "Hot Snacks & Tea Included",
    rating: 4.92,
    classes: [
      { code: "CC", name: "AC Chair Car", fare: 995, status: "AVAILABLE - 62", color: "success" },
      { code: "EC", name: "Exec Chair Car", fare: 1885, status: "AVAILABLE - 16", color: "success" }
    ]
  }
];

export const HOTELS_DATA = [
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
    amenities: ["Private Beach Access", "Infinity Pool", "Jiva Spa", "Golf Course", "Free High-Speed Wi-Fi", "Ocean-View Balcony"],
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
    amenities: ["Snow Peak Views", "Riverfront Lawn", "Bonfire & Barbecue", "Heated Rooms", "In-house Trout Dining"],
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
    amenities: ["175-Year-Old Frescoes", "Courtyard Marble Pool", "Royal Rajasthani Dining", "Spa & Jacuzzi", "Puppet Shows"],
    roomTypes: [
      { name: "Heritage Deluxe Room", price: 12400, guests: "2 Adults" },
      { name: "Sheesh Mahal Royal Suite", price: 21900, guests: "2 Adults" }
    ]
  },
  {
    id: "hotel-kerala-houseboat",
    name: "Kumarakom Lake Luxury Retreat",
    location: "Vembanad Lake, Kumarakom, Kerala",
    destinationId: "dest-kerala",
    category: "luxury",
    starRating: 5,
    userRating: 4.96,
    reviewsCount: 1180,
    pricePerNight: 14800,
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
    amenities: ["Meandering Pool Villa", "Ayurvedic Healing Center", "Backwater Sunset Cruise", "Seafood Specialty Bar", "Yoga Pavilion"],
    roomTypes: [
      { name: "Heritage Meandering Pool Villa", price: 14800, guests: "2 Adults" },
      { name: "Presidential Backwater Houseboat", price: 24000, guests: "2 Adults" }
    ]
  },
  {
    id: "hotel-rishikesh-aloha",
    name: "Aloha On The Ganges Riverside Resort",
    location: "Tapovan, Rishikesh",
    destinationId: "dest-rishikesh",
    category: "boutique",
    starRating: 4,
    userRating: 4.78,
    reviewsCount: 1350,
    pricePerNight: 5400,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    amenities: ["Panoramic Ganges Infinity Pool", "Daily Morning Yoga", "Ayurveda Spa", "Pure Vegetarian Restaurant", "Riverfront Lawn"],
    roomTypes: [
      { name: "Standard Mountain Facing", price: 5400, guests: "2 Adults" },
      { name: "Two Bedroom Ganges Luxury Apartment", price: 11900, guests: "4 Adults" }
    ]
  }
];

export const TESTIMONIALS = [
  {
    name: "Ananya Deshmukh",
    city: "Mumbai",
    trip: "Mumbai to Goa Outstation Cab & Taj Exotica",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    text: "TravelGo transformed our anniversary trip! The cab arrived 10 minutes early at Bandra, driver was super polite, and our hotel check-in was totally seamless with the digital voucher. Will never book separately again!"
  },
  {
    name: "Rohan & Priya Sengupta",
    city: "Delhi NCR",
    trip: "Delhi to Varanasi Vande Bharat + Heritage Stay",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    text: "Booking the Vande Bharat tickets plus the dawn boat tour in one checkout was like magic. Instant PNR confirmation and the transparent GST breakdown was so refreshing."
  },
  {
    name: "Vikram Malhotra",
    city: "Bengaluru",
    trip: "Bangalore to Coorg & Manali Family Tour",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    text: "The UI is breathtaking, smoother than any Indian travel portal out there. The instant booking PDF receipt with QR codes made checking in effortless."
  }
];

export const INDIAN_STATIONS = [
  { code: "NDLS", name: "New Delhi", city: "Delhi NCR" },
  { code: "MMCT", name: "Mumbai Central", city: "Mumbai" },
  { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus", city: "Mumbai" },
  { code: "SBC", name: "KSR Bengaluru City", city: "Bengaluru" },
  { code: "MAS", name: "Chennai Central", city: "Chennai" },
  { code: "HWH", name: "Howrah Jn", city: "Kolkata" },
  { code: "BSB", name: "Varanasi Jn", city: "Varanasi" },
  { code: "AGC", name: "Agra Cantt", city: "Agra" },
  { code: "JP", name: "Jaipur Jn", city: "Jaipur" },
  { code: "MAO", name: "Madgaon Jn", city: "Goa" },
  { code: "LKO", name: "Lucknow Charbagh", city: "Lucknow" },
  { code: "CDG", name: "Chandigarh Jn", city: "Chandigarh" },
  { code: "PNBE", name: "Patna Jn", city: "Patna" },
  { code: "UDZ", name: "Udaipur City", city: "Udaipur" }
];
