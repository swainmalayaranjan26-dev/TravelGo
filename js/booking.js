// TravelGo - Interactive Booking Engines (Cabs, Trains, Hotels, Destinations)
import { POPULAR_CAB_ROUTES } from "./data.js";
import { AppState, formatINR, showToast } from "./state.js";
import { openPaymentCheckout } from "./payment.js";

export function initBookingEngines() {
  renderDestinations("all");
  renderCabs();
  renderPopularRoutes();
  renderTrains();
  renderHotels();
  setupFilterPills();
  setupDestinationModal();
  setupCabCustomCalculator();

  // Listen for catalog changes triggered by Admin Panel
  window.addEventListener("travelgo:catalog-changed", () => {
    const activeDestPill = document.querySelector(".tg-category-pill.active");
    const destCat = activeDestPill ? activeDestPill.getAttribute("data-category") : "all";
    renderDestinations(destCat);
    renderCabs();
    renderTrains();

    const activeHotelPill = document.querySelector(".tg-hotel-filter-pill.active");
    const hotelCat = activeHotelPill ? activeHotelPill.getAttribute("data-filter") : "all";
    renderHotels(hotelCat);
  });
}

/* =========================================================================
   1. DESTINATIONS DISCOVERY & FILTERING
   ========================================================================= */
export function renderDestinations(category = "all") {
  const container = document.getElementById("destinations-grid");
  if (!container) return;

  const allDestinations = AppState.getDestinations();
  const filtered = category === "all" 
    ? allDestinations 
    : allDestinations.filter(d => d.category === category);

  container.innerHTML = filtered.map(dest => {
    const isWish = AppState.isWishlisted(dest.id);
    return `
      <div class="tg-card tg-dest-card" data-id="${dest.id}">
        <div class="tg-card-media">
          <img src="${dest.heroImage}" alt="${dest.name}" loading="lazy" />
          <span class="tg-card-badge">${dest.badge || "Featured"}</span>
          <button class="tg-wish-btn ${isWish ? 'active' : ''}" data-wish-id="${dest.id}" title="Save to Wishlist" aria-label="Save to Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWish ? '#EF4444' : 'none'}" stroke="${isWish ? '#EF4444' : '#FFFFFF'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <div class="tg-card-weather-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line></svg>
            ${dest.weather || "24°C Pleasant"}
          </div>
        </div>
        <div class="tg-card-content">
          <div class="tg-card-header">
            <div>
              <span class="tg-card-state">${dest.state}</span>
              <h3 class="tg-card-title">${dest.name}</h3>
            </div>
            <div class="tg-card-rating">
              <span class="tg-star">★</span>
              <strong>${dest.rating || 4.8}</strong>
              <span class="tg-reviews">(${dest.reviewsCount || 120})</span>
            </div>
          </div>
          <p class="tg-card-tagline">${dest.tagline || ''}</p>
          <div class="tg-card-footer">
            <div class="tg-card-price">
              <span class="tg-price-label">Starting from</span>
              <strong>${formatINR(dest.startPrice)}</strong>
              <span class="tg-duration">/ ${dest.duration || '3 Days'}</span>
            </div>
            <button class="tg-btn tg-btn-sm tg-btn-outline btn-explore-dest" data-id="${dest.id}">Explore</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Attach Wishlist toggle listeners
  container.querySelectorAll(".tg-wish-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-wish-id");
      const added = AppState.toggleWishlist(id);
      btn.classList.toggle("active", added);
      const svg = btn.querySelector("svg");
      if (added) {
        svg.setAttribute("fill", "#EF4444");
        svg.setAttribute("stroke", "#EF4444");
        showToast("Saved to your Wishlist ❤️", "success");
      } else {
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "#FFFFFF");
        showToast("Removed from Wishlist", "info");
      }
    });
  });

  // Attach Card Click to open Details Modal
  container.querySelectorAll(".tg-dest-card, .btn-explore-dest").forEach(el => {
    el.addEventListener("click", (e) => {
      if (e.target.closest(".tg-wish-btn")) return;
      const id = el.getAttribute("data-id") || el.closest(".tg-dest-card").getAttribute("data-id");
      openDestinationModal(id);
    });
  });
}

function setupFilterPills() {
  const pills = document.querySelectorAll(".tg-category-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const cat = pill.getAttribute("data-category");
      renderDestinations(cat);
    });
  });
}

export function openDestinationModal(destId) {
  const dest = AppState.getDestinations().find(d => d.id === destId);
  if (!dest) return;

  const modal = document.getElementById("destination-modal");
  const modalBody = document.getElementById("destination-modal-body");
  if (!modal || !modalBody) return;

  const gallery = dest.gallery && dest.gallery.length > 0 ? dest.gallery : [dest.heroImage];
  const highlights = dest.highlights || ["Scenic Views", "Local Culture", "Heritage Architecture"];
  const activities = dest.activities || ["Sightseeing", "Photography", "Local Dining"];

  modalBody.innerHTML = `
    <div class="tg-dest-modal-layout">
      <div class="tg-dest-modal-gallery">
        <img class="tg-dest-modal-main-img" id="dest-main-preview" src="${dest.heroImage}" alt="${dest.name}" />
        <div class="tg-dest-modal-thumbs">
          ${gallery.map((img, idx) => `
            <img src="${img}" class="tg-thumb-img ${idx === 0 ? 'active' : ''}" alt="${dest.name}" />
          `).join("")}
        </div>
      </div>

      <div class="tg-dest-modal-details">
        <div class="tg-dest-header">
          <div>
            <span class="tg-badge-soft">${dest.state} • ${(dest.category || 'DESTINATION').toUpperCase()}</span>
            <h2>${dest.name}</h2>
            <p class="tg-dest-sub">${dest.tagline}</p>
          </div>
          <div class="tg-dest-modal-score">
            <span class="tg-score-num">★ ${dest.rating || 4.8}</span>
            <span class="tg-score-sub">${dest.reviewsCount || 100}+ verified traveler reviews</span>
          </div>
        </div>

        <p class="tg-dest-body-desc">${dest.description || ''}</p>

        <div class="tg-dest-info-grid">
          <div class="tg-info-item">
            <span class="tg-info-label">Best Time To Visit</span>
            <strong>${dest.bestTimeToVisit || "October - March"}</strong>
          </div>
          <div class="tg-info-item">
            <span class="tg-info-label">Typical Weather</span>
            <strong>${dest.weather || "24°C Pleasant"}</strong>
          </div>
          <div class="tg-info-item">
            <span class="tg-info-label">Recommended Duration</span>
            <strong>${dest.duration || "4 Days / 3 Nights"}</strong>
          </div>
        </div>

        <div class="tg-dest-section">
          <h4>Top Highlights</h4>
          <ul class="tg-tag-list">
            ${highlights.map(h => `<li>${h}</li>`).join("")}
          </ul>
        </div>

        <div class="tg-dest-section">
          <h4>Must-Do Activities</h4>
          <ul class="tg-activity-list">
            ${activities.map(a => `<li>🏄 ${a}</li>`).join("")}
          </ul>
        </div>

        <div class="tg-dest-booking-box">
          <div>
            <span class="tg-price-label">All-Inclusive Tour Package</span>
            <strong class="tg-price-val">${formatINR(dest.startPrice)}</strong>
            <small>per person (includes cab & stay)</small>
          </div>
          <button class="tg-btn tg-btn-primary tg-btn-lg" id="btn-dest-book-now">
            Book Complete Tour
          </button>
        </div>
      </div>
    </div>
  `;

  // Gallery thumb clicking
  modalBody.querySelectorAll(".tg-thumb-img").forEach(thumb => {
    thumb.addEventListener("click", () => {
      modalBody.querySelectorAll(".tg-thumb-img").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
      const main = modalBody.querySelector("#dest-main-preview");
      if (main) main.src = thumb.src;
    });
  });

  // Tour Booking trigger
  modalBody.querySelector("#btn-dest-book-now")?.addEventListener("click", () => {
    modal.classList.remove("show");
    openPaymentCheckout({
      type: "TOUR",
      title: `${dest.name} Tour Package`,
      subtitle: `${dest.duration || '4D/3N'} • All-Inclusive Stay & Transit`,
      destination: dest.name,
      amount: dest.startPrice,
      date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]
    });
  });

  modal.classList.add("show");
}

function setupDestinationModal() {
  const modal = document.getElementById("destination-modal");
  const closeBtn = document.getElementById("btn-close-dest-modal");
  closeBtn?.addEventListener("click", () => {
    modal?.classList.remove("show");
  });
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("show");
  });
}

/* =========================================================================
   2. CABS BOOKING ENGINE & ROUTE CALCULATOR
   ========================================================================= */
export function renderCabs() {
  const container = document.getElementById("cabs-cards-grid");
  if (!container) return;

  const cabs = AppState.getCabs();
  container.innerHTML = cabs.map(cab => `
    <div class="tg-card tg-cab-card" data-cab-id="${cab.id}">
      <div class="tg-cab-media">
        <img src="${cab.image}" alt="${cab.model}" loading="lazy" />
        <span class="tg-cab-badge">${cab.badge}</span>
        <span class="tg-cab-eta">⚡ ${cab.etaMinutes || 5} mins away</span>
      </div>
      <div class="tg-cab-content">
        <div class="tg-cab-header">
          <div>
            <h3 class="tg-cab-title">${cab.category}</h3>
            <p class="tg-cab-model">${cab.model}</p>
          </div>
          <div class="tg-cab-rating">★ ${cab.rating}</div>
        </div>

        <div class="tg-cab-specs">
          <span>👥 ${cab.capacity}</span>
          <span>❄️ ${cab.ac}</span>
          <span>💰 ₹${cab.ratePerKm}/km</span>
        </div>

        <ul class="tg-cab-features">
          ${(cab.features || ["Clean sanitized cabs", "Verified chauffeur"]).map(f => `<li>✓ ${f}</li>`).join("")}
        </ul>

        <div class="tg-cab-footer">
          <div>
            <span class="tg-price-label">Base Rate (${cab.baseKm || 50} km incl.)</span>
            <strong class="tg-cab-fare">${formatINR(cab.baseFare)}</strong>
          </div>
          <button class="tg-btn tg-btn-primary tg-btn-sm btn-book-cab" data-id="${cab.id}">Book Cab</button>
        </div>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".btn-book-cab").forEach(btn => {
    btn.addEventListener("click", () => {
      const cabId = btn.getAttribute("data-id");
      const cab = AppState.getCabs().find(c => c.id === cabId);
      if (!cab) return;

      const pickup = document.getElementById("cab-calc-pickup")?.value.trim() || "New Delhi Airport T3";
      const drop = document.getElementById("cab-calc-drop")?.value.trim() || "Agra Taj East Gate";
      const km = parseInt(document.getElementById("cab-calc-distance")?.value) || 210;
      const estimatedTotal = cab.baseFare + Math.max(0, km - (cab.baseKm || 50)) * cab.ratePerKm;

      openPaymentCheckout({
        type: "CAB",
        title: `${pickup} to ${drop}`,
        subtitle: `${cab.category} • ${cab.model}`,
        pickup: pickup,
        drop: drop,
        amount: estimatedTotal,
        date: new Date().toISOString().split("T")[0],
        time: "Today / Immediate"
      });
    });
  });
}

export function renderPopularRoutes() {
  const container = document.getElementById("popular-cab-routes-grid");
  if (!container) return;

  container.innerHTML = POPULAR_CAB_ROUTES.map(route => `
    <div class="tg-route-card">
      <div class="tg-route-header">
        <div class="tg-route-cities">
          <strong>${route.from}</strong>
          <span class="tg-arrow">➔</span>
          <strong>${route.to}</strong>
        </div>
        <span class="tg-route-highway">${route.highway}</span>
      </div>
      <div class="tg-route-meta">
        <span>📏 ${route.distanceKm} km</span>
        <span>⏱️ ~${route.estHours}</span>
      </div>
      <div class="tg-route-action">
        <div class="tg-route-price">
          <small>Sedan all-inclusive</small>
          <strong>${formatINR(route.priceSedan)}</strong>
        </div>
        <button class="tg-btn tg-btn-sm tg-btn-secondary btn-quick-route" 
          data-from="${route.from}" 
          data-to="${route.to}" 
          data-price="${route.priceSedan}">
          Instant Book
        </button>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".btn-quick-route").forEach(btn => {
    btn.addEventListener("click", () => {
      const from = btn.getAttribute("data-from");
      const to = btn.getAttribute("data-to");
      const price = parseInt(btn.getAttribute("data-price"));

      openPaymentCheckout({
        type: "CAB",
        title: `${from} to ${to} Outstation Cab`,
        subtitle: `Dedicated Chauffeur • AC Sedan`,
        pickup: `${from} City Center / Airport`,
        drop: `${to} Drop Point`,
        amount: price,
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        time: "07:00 AM"
      });
    });
  });
}

function setupCabCustomCalculator() {
  const distanceRange = document.getElementById("cab-calc-distance");
  const distanceVal = document.getElementById("cab-distance-val");
  const pickupInput = document.getElementById("cab-calc-pickup");
  const dropInput = document.getElementById("cab-calc-drop");

  if (!distanceRange || !distanceVal) return;

  distanceRange.addEventListener("input", (e) => {
    const km = e.target.value;
    distanceVal.textContent = `${km} km`;
    updateCabFareEstimates(parseInt(km));
  });

  const triggerUpdate = () => {
    const km = parseInt(distanceRange.value) || 200;
    updateCabFareEstimates(km);
  };

  pickupInput?.addEventListener("input", triggerUpdate);
  dropInput?.addEventListener("input", triggerUpdate);
}

function updateCabFareEstimates(km) {
  const cabs = AppState.getCabs();
  document.querySelectorAll(".tg-cab-card").forEach(card => {
    const id = card.getAttribute("data-cab-id");
    const cab = cabs.find(c => c.id === id);
    if (!cab) return;

    const total = cab.baseFare + Math.max(0, km - (cab.baseKm || 50)) * cab.ratePerKm;
    const fareEl = card.querySelector(".tg-cab-fare");
    if (fareEl) fareEl.textContent = formatINR(total);
  });
}

/* =========================================================================
   3. TRAINS BOOKING ENGINE
   ========================================================================= */
export function renderTrains() {
  const container = document.getElementById("trains-cards-grid");
  if (!container) return;

  const trains = AppState.getTrains();
  container.innerHTML = trains.map(train => `
    <div class="tg-card tg-train-card" data-train-id="${train.id}">
      <div class="tg-train-header">
        <div>
          <div class="tg-train-num-badge">${train.number} • ${train.type}</div>
          <h3 class="tg-train-name">${train.name}</h3>
          <span class="tg-train-runs">Runs on: <strong>${(train.runsOn || []).join(", ")}</strong></span>
        </div>
        <div class="tg-train-pantry">
          <span>🍴 ${train.pantry || "Catering Available"}</span>
          <span class="tg-star-rating">★ ${train.rating || 4.8}</span>
        </div>
      </div>

      <!-- Train Schedule Bar -->
      <div class="tg-train-schedule">
        <div class="tg-ts-stop left">
          <strong>${train.depTime}</strong>
          <span>${train.from}</span>
        </div>
        <div class="tg-ts-middle">
          <span class="tg-ts-duration">⏱️ ${train.duration}</span>
          <div class="tg-ts-line">
            <span class="tg-ts-dot start"></span>
            <span class="tg-ts-dot end"></span>
          </div>
          <span class="tg-ts-direct">Direct Non-Stop</span>
        </div>
        <div class="tg-ts-stop right">
          <strong>${train.arrTime}</strong>
          <span>${train.to}</span>
        </div>
      </div>

      <!-- Train Coach Classes -->
      <div class="tg-train-classes">
        ${(train.classes || []).map(cls => `
          <div class="tg-train-class-card" data-class="${cls.code}" data-fare="${cls.fare}">
            <div class="tg-tclass-header">
              <span class="tg-tcode">${cls.code}</span>
              <strong class="tg-tfare">${formatINR(cls.fare)}</strong>
            </div>
            <div class="tg-tclass-name">${cls.name}</div>
            <div class="tg-tclass-status ${cls.color || 'success'}">${cls.status}</div>
            <button class="tg-btn tg-btn-xs tg-btn-outline btn-select-train-class" 
              data-train="${train.name} (${train.number})"
              data-route="${train.from} to ${train.to}"
              data-dep="${train.depTime}"
              data-class="${cls.name} (${cls.code})"
              data-fare="${cls.fare}">
              Select
            </button>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".btn-select-train-class").forEach(btn => {
    btn.addEventListener("click", () => {
      const trainName = btn.getAttribute("data-train");
      const route = btn.getAttribute("data-route");
      const depTime = btn.getAttribute("data-dep");
      const className = btn.getAttribute("data-class");
      const fare = parseInt(btn.getAttribute("data-fare"));

      openPaymentCheckout({
        type: "TRAIN",
        title: trainName,
        subtitle: className,
        from: route.split(" to ")[0],
        to: route.split(" to ")[1],
        amount: fare,
        date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        time: depTime
      });
    });
  });
}

/* =========================================================================
   4. HOTELS BOOKING ENGINE
   ========================================================================= */
export function renderHotels(filterCategory = "all") {
  const container = document.getElementById("hotels-cards-grid");
  if (!container) return;

  const hotels = AppState.getHotels();
  const filtered = filterCategory === "all"
    ? hotels
    : hotels.filter(h => h.category === filterCategory);

  container.innerHTML = filtered.map(hotel => `
    <div class="tg-card tg-hotel-card" data-hotel-id="${hotel.id}">
      <div class="tg-hotel-media">
        <img src="${hotel.image}" alt="${hotel.name}" loading="lazy" />
        <span class="tg-hotel-stars">${'★'.repeat(hotel.starRating || 5)}</span>
        <span class="tg-hotel-badge">${(hotel.category || 'HOTEL').toUpperCase()}</span>
      </div>
      <div class="tg-hotel-content">
        <div class="tg-hotel-header">
          <div>
            <span class="tg-hotel-loc">📍 ${hotel.location}</span>
            <h3 class="tg-hotel-name">${hotel.name}</h3>
          </div>
          <div class="tg-hotel-rating">
            <strong>${hotel.userRating || 4.8}</strong>
            <small>/ 5</small>
          </div>
        </div>

        <div class="tg-hotel-amenities">
          ${(hotel.amenities || []).slice(0, 4).map(a => `<span class="tg-amenity-tag">✓ ${a}</span>`).join("")}
        </div>

        <div class="tg-hotel-rooms-preview">
          <label>Selected Room Category:</label>
          <select class="tg-select tg-room-selector" data-hotel-id="${hotel.id}">
            ${(hotel.roomTypes || [{ name: "Standard Luxury Room", price: hotel.pricePerNight, guests: "2 Adults" }]).map(r => `
              <option value="${r.price}" data-room-name="${r.name}">${r.name} (${r.guests || '2 Guests'}) - ${formatINR(r.price)}/nt</option>
            `).join("")}
          </select>
        </div>

        <div class="tg-hotel-footer">
          <div>
            <span class="tg-price-label">Per Night + Taxes</span>
            <strong class="tg-hotel-active-price">${formatINR(hotel.pricePerNight)}</strong>
          </div>
          <button class="tg-btn tg-btn-primary tg-btn-sm btn-book-hotel" data-id="${hotel.id}">
            Book Room
          </button>
        </div>
      </div>
    </div>
  `).join("");

  // Room select change price updater
  container.querySelectorAll(".tg-room-selector").forEach(select => {
    select.addEventListener("change", (e) => {
      const card = select.closest(".tg-hotel-card");
      const price = parseInt(e.target.value);
      card.querySelector(".tg-hotel-active-price").textContent = formatINR(price);
    });
  });

  // Book Hotel trigger
  container.querySelectorAll(".btn-book-hotel").forEach(btn => {
    btn.addEventListener("click", () => {
      const hotelId = btn.getAttribute("data-id");
      const hotel = AppState.getHotels().find(h => h.id === hotelId);
      if (!hotel) return;

      const card = btn.closest(".tg-hotel-card");
      const roomSelect = card.querySelector(".tg-room-selector");
      const roomPrice = parseInt(roomSelect.value);
      const roomName = roomSelect.options[roomSelect.selectedIndex].getAttribute("data-room-name");

      openPaymentCheckout({
        type: "HOTEL",
        title: hotel.name,
        subtitle: `${roomName} • ${hotel.location}`,
        amount: roomPrice,
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        duration: "1 Night (Check-in 2:00 PM)"
      });
    });
  });

  // Setup hotel filter buttons
  document.querySelectorAll(".tg-hotel-filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".tg-hotel-filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const cat = pill.getAttribute("data-filter");
      renderHotels(cat);
    });
  });
}
