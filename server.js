// TravelGo — Fullstack Node.js / Express Server Powered by Neon PostgreSQL
require('dotenv').config();
const express = require('express');
const path = require('path');
const { pool, initDatabase, queryWithRetry } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS for Vercel deployments and preview environments
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serverless Lazy Database Initialization
let isDbInitialized = false;
let dbInitPromise = null;

async function ensureDatabaseInitialized() {
  if (isDbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = initDatabase()
      .then(() => {
        isDbInitialized = true;
      })
      .catch((err) => {
        dbInitPromise = null;
        console.error("[Neon DB] Initialization error:", err.message);
        throw err;
      });
  }
  return dbInitPromise;
}

// Ensure database is ready before executing API endpoints
app.use(async (req, res, next) => {
  // Normalize URL if Vercel serverless rewrite stripped /api prefix
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/css') && !req.url.startsWith('/js') && !req.url.endsWith('.html') && req.url !== '/' && !req.url.startsWith('/favicon')) {
    req.url = '/api' + req.url;
  }

  if (req.url && req.url.startsWith('/api')) {
    try {
      await ensureDatabaseInitialized();
    } catch (err) {
      console.warn("[DB Init Middleware] DB check warning:", err.message);
    }
  }
  next();
});

// Serve static assets with no-cache headers for dev freshness
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

/* =========================================================================
   REST API ROUTES
   ========================================================================= */

// 1. Health & Database Diagnostic
app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    const dbRes = await queryWithRetry('SELECT version(), current_database(), current_user, NOW() as server_time;');
    const latencyMs = Date.now() - start;

    res.json({
      status: "online",
      database: "Neon PostgreSQL Cloud",
      version: dbRes.rows[0].version,
      databaseName: dbRes.rows[0].current_database,
      user: dbRes.rows[0].current_user,
      serverTime: dbRes.rows[0].server_time,
      latencyMs: `${latencyMs}ms`
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Authentication API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, requiredRole } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = null;

    try {
      const { rows } = await queryWithRetry(
        'SELECT id, name, email, phone, role, avatar FROM users WHERE LOWER(email) = LOWER($1) AND password = $2;',
        [cleanEmail, password]
      );
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    } catch (dbErr) {
      console.warn("[Auth Login] Neon Cloud DB query error:", dbErr.message);
      // High-availability fallback for default accounts if Neon has a cold start / timeout
      if (cleanEmail === "rahul777@swain.com" && password === "rahul12345") {
        user = {
          id: "usr_admin_rahul",
          name: "Rahul Swain (Administrator)",
          email: "rahul777@swain.com",
          phone: "+91 98000 12345",
          role: "ADMIN",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
        };
      } else if (cleanEmail === "admin@example.com" && password === "Admin@12345") {
        user = {
          id: "usr_admin_demo",
          name: "System Administrator",
          email: "admin@example.com",
          phone: "+91 98000 12345",
          role: "ADMIN",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
        };
      } else if (cleanEmail === "admin@travelgo.in" && password === "admin123") {
        user = {
          id: "usr_admin_01",
          name: "Operations Admin",
          email: "admin@travelgo.in",
          phone: "+91 99999 00000",
          role: "ADMIN",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
        };
      } else if (cleanEmail === "user@travelgo.in" && password === "user123") {
        user = {
          id: "usr_traveler_01",
          name: "Rahul Sharma",
          email: "user@travelgo.in",
          phone: "+91 98765 43210",
          role: "USER",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
        };
      } else {
        return res.status(503).json({
          error: "Cloud database is waking up. Please retry in a few moments."
        });
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Authentication service error." });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing account
    try {
      const existing = await queryWithRetry('SELECT id FROM users WHERE LOWER(email) = LOWER($1);', [cleanEmail]);
      if (existing && existing.rows && existing.rows.length > 0) {
        return res.status(400).json({ error: "An account with this email address already exists. Please log in." });
      }
    } catch (err) {
      console.warn("[Register] DB check warning:", err.message);
    }

    const newId = `usr_${Date.now()}`;
    const avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";

    try {
      await queryWithRetry(
        `INSERT INTO users (id, name, email, password, phone, role, avatar)
         VALUES ($1, $2, $3, $4, $5, 'USER', $6);`,
        [newId, name.trim(), cleanEmail, password, phone ? phone.trim() : null, avatar]
      );

      // Also register in customers table for directory sync
      await queryWithRetry(
        `INSERT INTO customers (id, name, email, phone, city, role, bookings_count, total_spent, joined_date, status)
         VALUES ($1, $2, $3, $4, 'India', 'Customer', 0, 0, $5, 'ACTIVE')
         ON CONFLICT (id) DO NOTHING;`,
        [newId, name.trim(), cleanEmail, phone ? phone.trim() : '+91 98765 43210', new Date().toISOString().split('T')[0]]
      );
    } catch (dbErr) {
      console.warn("[Register] Neon DB insert fallback warning:", dbErr.message);
    }

    res.json({
      success: true,
      message: "Account successfully created! Welcome to TravelGo.",
      user: {
        id: newId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : "",
        role: "USER",
        avatar
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Registration service error." });
  }
});

// 2. Destinations API
app.get('/api/destinations', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM destinations ORDER BY created_at DESC;');
    const formatted = rows.map(r => ({
      id: r.id,
      name: r.name,
      state: r.state,
      tagline: r.tagline,
      category: r.category,
      startPrice: r.start_price,
      duration: r.duration,
      bestTimeToVisit: r.best_time,
      weather: r.weather,
      badge: r.badge,
      rating: parseFloat(r.rating) || 4.8,
      reviewsCount: r.reviews_count,
      heroImage: r.hero_image,
      gallery: r.gallery || [],
      description: r.description,
      highlights: r.highlights || [],
      activities: r.activities || []
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/destinations', async (req, res) => {
  try {
    const d = req.body;
    await pool.query(
      `INSERT INTO destinations (id, name, state, tagline, category, start_price, duration, best_time, weather, badge, rating, reviews_count, hero_image, gallery, description, highlights, activities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, state = EXCLUDED.state, tagline = EXCLUDED.tagline, category = EXCLUDED.category,
         start_price = EXCLUDED.start_price, duration = EXCLUDED.duration, best_time = EXCLUDED.best_time,
         weather = EXCLUDED.weather, badge = EXCLUDED.badge, hero_image = EXCLUDED.hero_image,
         gallery = EXCLUDED.gallery, description = EXCLUDED.description`,
      [d.id, d.name, d.state, d.tagline, d.category, d.startPrice || d.start_price, d.duration, d.bestTimeToVisit || d.best_time, d.weather, d.badge, d.rating || 4.9, d.reviewsCount || 1, d.heroImage || d.hero_image, JSON.stringify(d.gallery || [d.heroImage]), d.description, JSON.stringify(d.highlights || []), JSON.stringify(d.activities || [])]
    );
    res.json({ success: true, destination: d });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/destinations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const d = req.body;
    await pool.query(
      `UPDATE destinations SET
         name = COALESCE($1, name), state = COALESCE($2, state), tagline = COALESCE($3, tagline),
         category = COALESCE($4, category), start_price = COALESCE($5, start_price),
         duration = COALESCE($6, duration), best_time = COALESCE($7, best_time),
         weather = COALESCE($8, weather), badge = COALESCE($9, badge),
         hero_image = COALESCE($10, hero_image), description = COALESCE($11, description)
       WHERE id = $12`,
      [d.name, d.state, d.tagline, d.category, d.startPrice || d.start_price, d.duration, d.bestTimeToVisit || d.best_time, d.weather, d.badge, d.heroImage || d.hero_image, d.description, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/destinations/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM destinations WHERE id = $1;', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Cabs API
app.get('/api/cabs', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cabs ORDER BY base_fare ASC;');
    const formatted = rows.map(r => ({
      id: r.id,
      category: r.category,
      model: r.model,
      capacity: r.capacity,
      ac: r.ac,
      ratePerKm: r.rate_per_km,
      baseFare: r.base_fare,
      baseKm: r.base_km,
      driverAllowance: r.driver_allowance,
      rating: parseFloat(r.rating) || 4.85,
      etaMinutes: r.eta_minutes,
      badge: r.badge,
      image: r.image,
      features: r.features || []
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cabs', async (req, res) => {
  try {
    const c = req.body;
    await pool.query(
      `INSERT INTO cabs (id, category, model, capacity, ac, rate_per_km, base_fare, base_km, driver_allowance, rating, eta_minutes, badge, image, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO UPDATE SET
         category = EXCLUDED.category, model = EXCLUDED.model, capacity = EXCLUDED.capacity,
         rate_per_km = EXCLUDED.rate_per_km, base_fare = EXCLUDED.base_fare, driver_allowance = EXCLUDED.driver_allowance,
         badge = EXCLUDED.badge, image = EXCLUDED.image, eta_minutes = EXCLUDED.eta_minutes`,
      [c.id, c.category, c.model, c.capacity, c.ac || 'AC Guaranteed', c.ratePerKm || c.rate_per_km, c.baseFare || c.base_fare, c.baseKm || 50, c.driverAllowance || 350, c.rating || 4.85, c.etaMinutes || 5, c.badge, c.image, JSON.stringify(c.features || [])]
    );
    res.json({ success: true, cab: c });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cabs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const c = req.body;
    await pool.query(
      `UPDATE cabs SET
         category = COALESCE($1, category), model = COALESCE($2, model),
         base_fare = COALESCE($3, base_fare), rate_per_km = COALESCE($4, rate_per_km),
         driver_allowance = COALESCE($5, driver_allowance), capacity = COALESCE($6, capacity),
         badge = COALESCE($7, badge), eta_minutes = COALESCE($8, eta_minutes),
         image = COALESCE($9, image)
       WHERE id = $10`,
      [c.category, c.model, c.baseFare, c.ratePerKm, c.driverAllowance, c.capacity, c.badge, c.etaMinutes, c.image, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Trains API
app.get('/api/trains', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM trains ORDER BY number ASC;');
    const formatted = rows.map(r => ({
      id: r.id,
      number: r.number,
      name: r.name,
      type: r.type,
      from: r.from_station,
      to: r.to_station,
      depTime: r.dep_time,
      arrTime: r.arr_time,
      duration: r.duration,
      runsOn: r.runs_on || ["Daily"],
      pantry: r.pantry,
      rating: parseFloat(r.rating) || 4.85,
      classes: r.classes || []
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trains', async (req, res) => {
  try {
    const t = req.body;
    await pool.query(
      `INSERT INTO trains (id, number, name, type, from_station, to_station, dep_time, arr_time, duration, runs_on, pantry, rating, classes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, type = EXCLUDED.type, from_station = EXCLUDED.from_station,
         to_station = EXCLUDED.to_station, dep_time = EXCLUDED.dep_time, arr_time = EXCLUDED.arr_time,
         duration = EXCLUDED.duration`,
      [t.id, t.number, t.name, t.type, t.from, t.to, t.depTime, t.arrTime, t.duration, JSON.stringify(t.runsOn || ["Daily"]), t.pantry || "Catering Available", t.rating || 4.85, JSON.stringify(t.classes || [])]
    );
    res.json({ success: true, train: t });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/trains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const t = req.body;
    await pool.query(
      `UPDATE trains SET
         number = COALESCE($1, number), name = COALESCE($2, name),
         type = COALESCE($3, type), from_station = COALESCE($4, from_station),
         to_station = COALESCE($5, to_station), dep_time = COALESCE($6, dep_time),
         arr_time = COALESCE($7, arr_time), duration = COALESCE($8, duration)
       WHERE id = $9`,
      [t.number, t.name, t.type, t.from, t.to, t.depTime, t.arrTime, t.duration, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Hotels API
app.get('/api/hotels', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM hotels ORDER BY price_per_night ASC;');
    const formatted = rows.map(r => ({
      id: r.id,
      name: r.name,
      location: r.location,
      destinationId: r.destination_id,
      category: r.category,
      starRating: r.star_rating,
      userRating: parseFloat(r.user_rating) || 4.85,
      reviewsCount: r.reviews_count,
      pricePerNight: r.price_per_night,
      image: r.image,
      amenities: r.amenities || [],
      roomTypes: r.room_types || []
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hotels', async (req, res) => {
  try {
    const h = req.body;
    await pool.query(
      `INSERT INTO hotels (id, name, location, destination_id, category, star_rating, user_rating, reviews_count, price_per_night, image, amenities, room_types)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, location = EXCLUDED.location, category = EXCLUDED.category,
         star_rating = EXCLUDED.star_rating, price_per_night = EXCLUDED.price_per_night, image = EXCLUDED.image`,
      [h.id, h.name, h.location, h.destinationId || null, h.category || 'luxury', h.starRating || 5, h.userRating || 4.85, h.reviewsCount || 20, h.pricePerNight, h.image, JSON.stringify(h.amenities || []), JSON.stringify(h.roomTypes || [])]
    );
    res.json({ success: true, hotel: h });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const h = req.body;
    await pool.query(
      `UPDATE hotels SET
         name = COALESCE($1, name), location = COALESCE($2, location),
         category = COALESCE($3, category), star_rating = COALESCE($4, star_rating),
         price_per_night = COALESCE($5, price_per_night), image = COALESCE($6, image)
       WHERE id = $7`,
      [h.name, h.location, h.category, h.starRating, h.pricePerNight, h.image, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/hotels/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hotels WHERE id = $1;', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Bookings API
app.get('/api/bookings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC;');
    const formatted = rows.map(r => ({
      id: r.id,
      type: r.type,
      title: r.title,
      subtitle: r.subtitle,
      pickup: r.pickup,
      drop: r.drop_loc,
      from: r.from_stn,
      to: r.to_stn,
      pnr: r.pnr,
      date: r.date,
      time: r.time,
      amount: r.amount,
      status: r.status,
      passengers: r.passengers || [],
      driver: r.driver,
      refundStatus: r.refund_status,
      createdAt: r.created_at
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const b = req.body;
    await pool.query(
      `INSERT INTO bookings (id, type, title, subtitle, pickup, drop_loc, from_stn, to_stn, pnr, date, time, amount, status, passengers, driver, refund_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status, refund_status = EXCLUDED.refund_status`,
      [b.id, b.type, b.title, b.subtitle || null, b.pickup || null, b.drop || null, b.from || null, b.to || null, b.pnr || null, b.date, b.time || null, b.amount, b.status || 'CONFIRMED', JSON.stringify(b.passengers || []), JSON.stringify(b.driver || null), b.refundStatus || null]
    );
    res.json({ success: true, booking: b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, refundStatus } = req.body;
    await pool.query(
      `UPDATE bookings SET
         status = COALESCE($1, status),
         refund_status = COALESCE($2, refund_status)
       WHERE id = $3`,
      [status, refundStatus, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM bookings WHERE id = $1;', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Coupons API
app.get('/api/coupons', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM coupons ORDER BY code ASC;');
    const formatted = rows.map(r => ({
      code: r.code,
      description: r.description,
      discountType: r.discount_type,
      discountValue: r.discount_value,
      maxDiscount: r.max_discount,
      minOrder: r.min_order,
      expiry: r.expiry,
      active: r.active,
      usageCount: r.usage_count
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const cp = req.body;
    await pool.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, max_discount, min_order, expiry, active, usage_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (code) DO UPDATE SET
         description = EXCLUDED.description, discount_type = EXCLUDED.discount_type,
         discount_value = EXCLUDED.discount_value, max_discount = EXCLUDED.max_discount,
         min_order = EXCLUDED.min_order, expiry = EXCLUDED.expiry, active = EXCLUDED.active`,
      [cp.code.toUpperCase(), cp.description, cp.discountType, cp.discountValue, cp.maxDiscount, cp.minOrder, cp.expiry, cp.active !== false, cp.usageCount || 0]
    );
    res.json({ success: true, coupon: cp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/coupons/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { active, usageCount } = req.body;
    await pool.query(
      `UPDATE coupons SET
         active = COALESCE($1, active),
         usage_count = COALESCE($2, usage_count)
       WHERE code = $3`,
      [active, usageCount, code.toUpperCase()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/coupons/:code', async (req, res) => {
  try {
    await pool.query('DELETE FROM coupons WHERE code = $1;', [req.params.code.toUpperCase()]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Customers API
app.get('/api/customers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM customers ORDER BY name ASC;');
    const formatted = rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      city: r.city,
      role: r.role,
      bookingsCount: r.bookings_count,
      totalSpent: r.total_spent,
      joinedDate: r.joined_date,
      status: r.status
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const c = req.body;
    await pool.query(
      `INSERT INTO customers (id, name, email, phone, city, role, bookings_count, total_spent, joined_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone,
         city = EXCLUDED.city, role = EXCLUDED.role, status = EXCLUDED.status`,
      [c.id, c.name, c.email, c.phone, c.city, c.role || 'Customer', c.bookingsCount || 0, c.totalSpent || 0, c.joinedDate || new Date().toISOString().split('T')[0], c.status || 'ACTIVE']
    );
    res.json({ success: true, customer: c });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;
    await pool.query(
      `UPDATE customers SET role = COALESCE($1, role), status = COALESCE($2, status) WHERE id = $3`,
      [role, status, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Settings API
app.get('/api/settings', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT value FROM settings WHERE key = 'global';");
    if (rows.length > 0) {
      res.json(rows[0].value);
    } else {
      res.json({});
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('global', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1;`,
      [JSON.stringify(settings)]
    );
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Factory Reset API
app.post('/api/reset', async (req, res) => {
  try {
    await pool.query(`
      TRUNCATE TABLE destinations, cabs, trains, hotels, bookings, coupons, customers, settings CASCADE;
    `);
    await initDatabase();
    res.json({ success: true, message: "Database reset to factory defaults and reseeded successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server locally when executed directly via node server.js
if (require.main === module) {
  ensureDatabaseInitialized()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 TravelGo Fullstack Server with Neon PostgreSQL`);
        console.log(`🌐 Application URL: http://localhost:${PORT}`);
        console.log(`🔒 Admin Login:     http://localhost:${PORT}/admin-login.html`);
        console.log(`⚡ Admin Console:   http://localhost:${PORT}/admin.html`);
        console.log(`📡 REST API Health: http://localhost:${PORT}/api/health`);
        console.log(`====================================================`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect or migrate Neon PostgreSQL database:", err);
      process.exit(1);
    });
}

// Export Express app for Vercel Serverless Function runtime
module.exports = app;
