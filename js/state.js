// TravelGo - Global State & Storage Management with Neon PostgreSQL Cloud Sync
import { DESTINATIONS as DEFAULT_DESTS, CABS_DATA as DEFAULT_CABS, TRAINS_DATA as DEFAULT_TRAINS, HOTELS_DATA as DEFAULT_HOTELS } from "./data.js";

export const STORAGE_KEYS = {
  USER: "travelgo_user",
  ADMIN_SESSION: "travelgo_admin_session",
  WISHLIST: "travelgo_wishlist",
  BOOKINGS: "travelgo_bookings",
  DESTINATIONS: "travelgo_destinations",
  CABS: "travelgo_cabs",
  TRAINS: "travelgo_trains",
  HOTELS: "travelgo_hotels",
  COUPONS: "travelgo_coupons",
  SETTINGS: "travelgo_settings",
  CUSTOMERS: "travelgo_customers"
};

const DEFAULT_SETTINGS = {
  bannerEnabled: true,
  bannerText: "🎉 Festive Travel Festival: Enjoy up to 20% OFF on Outstation Cabs, Vande Bharat & Heritage Resorts with code FESTIVE20!",
  bannerLink: "#destinations-section",
  platformName: "TravelGo India",
  supportEmail: "support@travelgo.in",
  supportPhone: "+91 1800-419-8900",
  currencySymbol: "₹",
  convenienceGstPercent: 5
};

export class AppState {
  /* ================= Cloud Sync Engine ================= */
  static async syncFromCloud() {
    try {
      const [destsRes, cabsRes, trainsRes, hotelsRes, bookingsRes, couponsRes, customersRes, settingsRes] = await Promise.allSettled([
        fetch('/api/destinations').then(r => r.ok ? r.json() : null),
        fetch('/api/cabs').then(r => r.ok ? r.json() : null),
        fetch('/api/trains').then(r => r.ok ? r.json() : null),
        fetch('/api/hotels').then(r => r.ok ? r.json() : null),
        fetch('/api/bookings').then(r => r.ok ? r.json() : null),
        fetch('/api/coupons').then(r => r.ok ? r.json() : null),
        fetch('/api/customers').then(r => r.ok ? r.json() : null),
        fetch('/api/settings').then(r => r.ok ? r.json() : null)
      ]);

      if (destsRes.status === "fulfilled" && destsRes.value) {
        localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(destsRes.value));
      }
      if (cabsRes.status === "fulfilled" && cabsRes.value) {
        localStorage.setItem(STORAGE_KEYS.CABS, JSON.stringify(cabsRes.value));
      }
      if (trainsRes.status === "fulfilled" && trainsRes.value) {
        localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(trainsRes.value));
      }
      if (hotelsRes.status === "fulfilled" && hotelsRes.value) {
        localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotelsRes.value));
      }
      if (bookingsRes.status === "fulfilled" && bookingsRes.value) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookingsRes.value));
      }
      if (couponsRes.status === "fulfilled" && couponsRes.value) {
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(couponsRes.value));
      }
      if (customersRes.status === "fulfilled" && customersRes.value) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customersRes.value));
      }
      if (settingsRes.status === "fulfilled" && settingsRes.value && Object.keys(settingsRes.value).length > 0) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsRes.value));
      }

      window.dispatchEvent(new CustomEvent("travelgo:catalog-changed", { detail: { type: "all", cloud: true } }));
      window.dispatchEvent(new CustomEvent("travelgo:booking-updated", { detail: { cloud: true } }));
      window.dispatchEvent(new CustomEvent("travelgo:settings-changed", { detail: this.getSystemSettings() }));
    } catch (e) {
      console.warn("Neon Cloud sync error (falling back to local cache):", e);
    }
  }

  /* ================= User Session & Authentication ================= */
  static getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.email) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  static setUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    window.dispatchEvent(new CustomEvent("travelgo:user-changed", { detail: user }));
  }

  static async login(email, password, requiredRole = null) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, requiredRole })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Authentication failed.");
    }
    if (requiredRole === "ADMIN" || data.user.role === "ADMIN") {
      this.setAdminSession(data.user);
    }
    if (!requiredRole || requiredRole === "USER") {
      this.setUser(data.user);
    }
    return data.user;
  }

  static async register(name, email, phone, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed.");
    }
    this.setUser(data.user);
    return data.user;
  }

  static logout() {
    this.setUser(null);
  }

  /* ================= Admin Session ================= */
  static getAdminSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.role === "ADMIN") return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  static setAdminSession(adminUser) {
    if (adminUser) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(adminUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
    window.dispatchEvent(new CustomEvent("travelgo:admin-changed", { detail: adminUser }));
  }

  static logoutAdmin() {
    this.setAdminSession(null);
  }

  /* ================= Wishlist ================= */
  static getWishlist() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : ["dest-goa", "dest-kerala"];
    } catch {
      return [];
    }
  }

  static toggleWishlist(destId) {
    const list = this.getWishlist();
    const index = list.indexOf(destId);
    let added = false;
    if (index > -1) {
      list.splice(index, 1);
      added = false;
    } else {
      list.push(destId);
      added = true;
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("travelgo:wishlist-changed", { detail: { list, added, destId } }));
    return added;
  }

  static isWishlisted(destId) {
    return this.getWishlist().includes(destId);
  }

  /* ================= Bookings ================= */
  static getBookings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addBooking(booking) {
    const bookings = this.getBookings();
    bookings.unshift(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    window.dispatchEvent(new CustomEvent("travelgo:booking-added", { detail: booking }));

    // Sync with Neon Cloud
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    }).catch(err => console.error("Failed to persist booking to Neon DB", err));

    return booking;
  }

  static cancelBooking(bookingId, refundNote = "Initiated (Refund in 3-5 days to source)") {
    return this.updateBookingStatus(bookingId, "CANCELLED", { refundStatus: refundNote });
  }

  static updateBookingStatus(bookingId, newStatus, extra = {}) {
    const bookings = this.getBookings().map(b => {
      if (b.id === bookingId) {
        return { ...b, status: newStatus, ...extra };
      }
      return b;
    });
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    window.dispatchEvent(new CustomEvent("travelgo:booking-updated", { detail: { bookingId, newStatus } }));

    // Sync with Neon Cloud
    fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, refundStatus: extra.refundStatus })
    }).catch(err => console.error("Failed to update booking in Neon DB", err));

    return true;
  }

  static deleteBooking(bookingId) {
    const bookings = this.getBookings().filter(b => b.id !== bookingId);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    window.dispatchEvent(new CustomEvent("travelgo:booking-updated", { detail: { bookingId, deleted: true } }));

    // Sync with Neon Cloud
    fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'DELETE'
    }).catch(err => console.error("Failed to delete booking in Neon DB", err));

    return true;
  }

  /* ================= Destinations Catalog ================= */
  static getDestinations() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DESTINATIONS);
      return data ? JSON.parse(data) : DEFAULT_DESTS;
    } catch {
      return DEFAULT_DESTS;
    }
  }

  static saveDestinations(destinations) {
    localStorage.setItem(STORAGE_KEYS.DESTINATIONS, JSON.stringify(destinations));
    window.dispatchEvent(new CustomEvent("travelgo:catalog-changed", { detail: { type: "destinations" } }));
  }

  static addDestination(dest) {
    const list = this.getDestinations();
    list.unshift(dest);
    this.saveDestinations(list);

    // Sync with Neon Cloud
    fetch('/api/destinations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dest)
    }).catch(err => console.error("Failed to save destination to Neon DB", err));

    return dest;
  }

  static updateDestination(id, patch) {
    const list = this.getDestinations().map(d => d.id === id ? { ...d, ...patch } : d);
    this.saveDestinations(list);

    // Sync with Neon Cloud
    fetch(`/api/destinations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch(err => console.error("Failed to update destination in Neon DB", err));
  }

  static deleteDestination(id) {
    const list = this.getDestinations().filter(d => d.id !== id);
    this.saveDestinations(list);

    // Sync with Neon Cloud
    fetch(`/api/destinations/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(err => console.error("Failed to delete destination from Neon DB", err));
  }

  /* ================= Cabs Fleet ================= */
  static getCabs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CABS);
      return data ? JSON.parse(data) : DEFAULT_CABS;
    } catch {
      return DEFAULT_CABS;
    }
  }

  static saveCabs(cabs) {
    localStorage.setItem(STORAGE_KEYS.CABS, JSON.stringify(cabs));
    window.dispatchEvent(new CustomEvent("travelgo:catalog-changed", { detail: { type: "cabs" } }));
  }

  static updateCab(id, patch) {
    const list = this.getCabs().map(c => c.id === id ? { ...c, ...patch } : c);
    this.saveCabs(list);

    // Sync with Neon Cloud
    fetch(`/api/cabs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch(err => console.error("Failed to update cab in Neon DB", err));
  }

  static addCab(cab) {
    const list = this.getCabs();
    list.push(cab);
    this.saveCabs(list);

    // Sync with Neon Cloud
    fetch('/api/cabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cab)
    }).catch(err => console.error("Failed to add cab to Neon DB", err));
  }

  /* ================= Trains Schedule ================= */
  static getTrains() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRAINS);
      return data ? JSON.parse(data) : DEFAULT_TRAINS;
    } catch {
      return DEFAULT_TRAINS;
    }
  }

  static saveTrains(trains) {
    localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(trains));
    window.dispatchEvent(new CustomEvent("travelgo:catalog-changed", { detail: { type: "trains" } }));
  }

  static updateTrain(id, patch) {
    const list = this.getTrains().map(t => t.id === id ? { ...t, ...patch } : t);
    this.saveTrains(list);

    // Sync with Neon Cloud
    fetch(`/api/trains/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch(err => console.error("Failed to update train in Neon DB", err));
  }

  static addTrain(train) {
    const list = this.getTrains();
    list.push(train);
    this.saveTrains(list);

    // Sync with Neon Cloud
    fetch('/api/trains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(train)
    }).catch(err => console.error("Failed to add train to Neon DB", err));
  }

  /* ================= Hotels & Resorts ================= */
  static getHotels() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOTELS);
      return data ? JSON.parse(data) : DEFAULT_HOTELS;
    } catch {
      return DEFAULT_HOTELS;
    }
  }

  static saveHotels(hotels) {
    localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
    window.dispatchEvent(new CustomEvent("travelgo:catalog-changed", { detail: { type: "hotels" } }));
  }

  static updateHotel(id, patch) {
    const list = this.getHotels().map(h => h.id === id ? { ...h, ...patch } : h);
    this.saveHotels(list);

    // Sync with Neon Cloud
    fetch(`/api/hotels/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch(err => console.error("Failed to update hotel in Neon DB", err));
  }

  static addHotel(hotel) {
    const list = this.getHotels();
    list.unshift(hotel);
    this.saveHotels(list);

    // Sync with Neon Cloud
    fetch('/api/hotels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotel)
    }).catch(err => console.error("Failed to add hotel to Neon DB", err));
  }

  static deleteHotel(id) {
    const list = this.getHotels().filter(h => h.id !== id);
    this.saveHotels(list);

    // Sync with Neon Cloud
    fetch(`/api/hotels/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }).catch(err => console.error("Failed to delete hotel in Neon DB", err));
  }

  /* ================= Coupons & Promo Codes ================= */
  static getCoupons() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveCoupons(coupons) {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
    window.dispatchEvent(new CustomEvent("travelgo:coupons-changed", { detail: { coupons } }));
  }

  static addCoupon(coupon) {
    const list = this.getCoupons();
    list.unshift(coupon);
    this.saveCoupons(list);

    // Sync with Neon Cloud
    fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    }).catch(err => console.error("Failed to add coupon to Neon DB", err));
  }

  static updateCoupon(code, patch) {
    const list = this.getCoupons().map(c => c.code.toUpperCase() === code.toUpperCase() ? { ...c, ...patch } : c);
    this.saveCoupons(list);

    // Sync with Neon Cloud
    fetch(`/api/coupons/${encodeURIComponent(code)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch(err => console.error("Failed to update coupon in Neon DB", err));
  }

  static deleteCoupon(code) {
    const list = this.getCoupons().filter(c => c.code.toUpperCase() !== code.toUpperCase());
    this.saveCoupons(list);

    // Sync with Neon Cloud
    fetch(`/api/coupons/${encodeURIComponent(code)}`, {
      method: 'DELETE'
    }).catch(err => console.error("Failed to delete coupon in Neon DB", err));
  }

  /* ================= Customers / Users ================= */
  static getCustomers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveCustomers(customers) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  static updateCustomer(id, patch) {
    const list = this.getCustomers().map(c => c.id === id ? { ...c, ...patch } : c);
    this.saveCustomers(list);

    // Sync with Neon Cloud
    fetch(`/api/customers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).catch(err => console.error("Failed to update customer in Neon DB", err));
  }

  static addCustomer(customer) {
    const list = this.getCustomers();
    list.unshift(customer);
    this.saveCustomers(list);

    // Sync with Neon Cloud
    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    }).catch(err => console.error("Failed to add customer in Neon DB", err));
  }

  /* ================= System Settings & Announcement Banner ================= */
  static getSystemSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSystemSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("travelgo:settings-changed", { detail: settings }));

    // Sync with Neon Cloud
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(err => console.error("Failed to save settings to Neon DB", err));
  }

  /* ================= Backup / Export / Import / Reset ================= */
  static exportFullDatabase() {
    return {
      version: "1.0",
      database: "Neon PostgreSQL Cloud",
      exportedAt: new Date().toISOString(),
      destinations: this.getDestinations(),
      cabs: this.getCabs(),
      trains: this.getTrains(),
      hotels: this.getHotels(),
      bookings: this.getBookings(),
      coupons: this.getCoupons(),
      settings: this.getSystemSettings(),
      customers: this.getCustomers()
    };
  }

  static async resetToFactoryDefaults() {
    try {
      await fetch('/api/reset', { method: 'POST' });
      await this.syncFromCloud();
      showToast("Neon Cloud database reset to factory defaults!", "info");
    } catch (e) {
      console.error(e);
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      window.dispatchEvent(new CustomEvent("travelgo:catalog-changed", { detail: { type: "all" } }));
      window.dispatchEvent(new CustomEvent("travelgo:booking-updated", { detail: {} }));
      window.dispatchEvent(new CustomEvent("travelgo:settings-changed", { detail: DEFAULT_SETTINGS }));
    }
  }
}

// Auto-trigger cloud sync on script load
AppState.syncFromCloud();

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function showToast(message, type = "info", duration = 3500) {
  let container = document.getElementById("tg-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "tg-toast-container";
    container.className = "tg-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `tg-toast tg-toast-${type}`;

  const iconMap = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  };

  toast.innerHTML = `
    <div class="tg-toast-icon">${iconMap[type] || iconMap.info}</div>
    <div class="tg-toast-content">${message}</div>
    <button class="tg-toast-close" aria-label="Close">&times;</button>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("visible"));

  const closeToast = () => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector(".tg-toast-close").addEventListener("click", closeToast);
  setTimeout(closeToast, duration);
}

if (typeof window !== "undefined") {
  window.AppState = AppState;
}

