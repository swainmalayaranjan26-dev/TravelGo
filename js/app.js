// TravelGo - Main Application Bootstrap & Controller
import { AppState, showToast, formatINR } from "./state.js";
import { DESTINATIONS, TESTIMONIALS } from "./data.js";
import { initSearchSystem } from "./search.js";
import { initBookingEngines, openDestinationModal } from "./booking.js";
import { openVoucherModal } from "./payment.js";

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  initAnnouncementBar();
  initSearchSystem();
  initBookingEngines();
  initNavbarBehavior();
  initAuthModal();
  initMyTripsDrawer();
  initWishlistDrawer();
  initStatsCounter();
  initTestimonialsMarquee();
  initNewsletterForm();
  updateHeaderUserUI();
  updateWishlistCountBadge();

  // Custom Event Listeners
  window.addEventListener("travelgo:wishlist-changed", updateWishlistCountBadge);
  window.addEventListener("travelgo:user-changed", updateHeaderUserUI);
  window.addEventListener("travelgo:open-trips-drawer", openTripsDrawer);
}

function initAnnouncementBar() {
  const updateBar = () => {
    const settings = AppState.getSystemSettings();
    const bar = document.getElementById("tg-announcement-bar");
    const textEl = document.getElementById("tg-announcement-text");
    const linkEl = document.getElementById("tg-announcement-link");

    if (!bar) return;
    if (settings && settings.bannerEnabled && settings.bannerText) {
      if (textEl) textEl.textContent = settings.bannerText;
      if (linkEl && settings.bannerLink) linkEl.href = settings.bannerLink;
      bar.style.display = "block";
    } else {
      bar.style.display = "none";
    }
  };

  updateBar();
  window.addEventListener("travelgo:settings-changed", updateBar);
}

/* =========================================================================
   1. NAVBAR BEHAVIOR & STICKY GLASS
   ========================================================================= */
function initNavbarBehavior() {
  const header = document.querySelector(".tg-header");
  const wrapper = document.getElementById("top-nav-wrapper");
  const mobileToggle = document.getElementById("tg-mobile-menu-toggle");
  const navLinks = document.querySelector(".tg-nav-links");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      header?.classList.add("scrolled");
      wrapper?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
      wrapper?.classList.remove("scrolled");
    }
  });

  mobileToggle?.addEventListener("click", () => {
    navLinks?.classList.toggle("open");
  });

  // Smooth scroll for nav anchor links
  document.querySelectorAll(".tg-nav-link[href^='#']").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        navLinks?.classList.remove("open");
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

/* =========================================================================
   2. AUTHENTICATION MODAL & USER PROFILE (LOGIN & REGISTER)
   ========================================================================= */
export function openAuthModal(mode = 'login') {
  const modal = document.getElementById("auth-modal");
  const authTabs = document.querySelectorAll(".tg-auth-tab");
  const nameGroup = document.getElementById("auth-group-name");
  const phoneGroup = document.getElementById("auth-group-phone");
  const submitBtn = document.getElementById("btn-submit-auth");
  const title = document.getElementById("auth-modal-title");
  const subtitle = document.getElementById("auth-modal-subtitle");
  const errorBox = document.getElementById("auth-error-msg");
  const emailInput = document.getElementById("auth-email-input");
  const passInput = document.getElementById("auth-password-input");
  const nameInput = document.getElementById("auth-name-input");

  if (errorBox) errorBox.style.display = "none";

  authTabs.forEach(tab => {
    if (tab.getAttribute("data-mode") === mode) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  if (mode === "signup") {
    if (title) title.textContent = "Create your TravelGo Account";
    if (subtitle) subtitle.textContent = "Sign up to unlock flat ₹500 travel credits, member fares & priority booking";
    if (submitBtn) submitBtn.textContent = "Create Account & Get ₹500";
    if (nameGroup) nameGroup.style.display = "flex";
    if (phoneGroup) phoneGroup.style.display = "flex";
    if (nameInput) nameInput.required = true;
    if (emailInput && emailInput.value === "user@travelgo.in") emailInput.value = "";
    if (passInput && passInput.value === "user123") passInput.value = "";
  } else {
    if (title) title.textContent = "Log In to TravelGo";
    if (subtitle) subtitle.textContent = "Access your saved trips, member fares, and verified booking tickets";
    if (submitBtn) submitBtn.textContent = "Log In with Password";
    if (nameGroup) nameGroup.style.display = "none";
    if (phoneGroup) phoneGroup.style.display = "none";
    if (nameInput) nameInput.required = false;
    if (emailInput && !emailInput.value) emailInput.value = "user@travelgo.in";
    if (passInput && !passInput.value) passInput.value = "user123";
  }

  modal?.classList.add("show");
}
window.openAuthModal = openAuthModal;

function initAuthModal() {
  const modal = document.getElementById("auth-modal");
  const closeBtn = document.getElementById("btn-close-auth-modal");
  const errorBox = document.getElementById("auth-error-msg");
  const form = document.getElementById("tg-auth-form");
  const demoBtn = document.getElementById("btn-demo-user-login");

  closeBtn?.addEventListener("click", () => {
    modal?.classList.remove("show");
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("show");
  });

  // Auth Tabs (Login vs Sign Up)
  const authTabs = document.querySelectorAll(".tg-auth-tab");
  authTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const mode = tab.getAttribute("data-mode");
      openAuthModal(mode);
    });
  });

  // Form Submit Handler
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorBox) errorBox.style.display = "none";

    const activeTab = document.querySelector(".tg-auth-tab.active");
    const mode = activeTab ? activeTab.getAttribute("data-mode") : "login";

    const email = document.getElementById("auth-email-input")?.value.trim();
    const password = document.getElementById("auth-password-input")?.value;
    const name = document.getElementById("auth-name-input")?.value.trim();
    const phone = document.getElementById("auth-phone-input")?.value.trim();
    const submitBtn = document.getElementById("btn-submit-auth");

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = mode === "signup" ? "Creating your account..." : "Verifying credentials...";
      }

      if (mode === "signup") {
        const newUser = await AppState.register(name || "Traveler", email, phone, password);
        modal?.classList.remove("show");
        showToast(`Account created! Welcome to TravelGo, ${newUser.name}. ₹500 credits applied!`, "success");
      } else {
        const user = await AppState.login(email, password);
        modal?.classList.remove("show");
        showToast(`Welcome back, ${user.name}!`, "success");
      }
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || "Authentication error.";
        errorBox.style.display = "block";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = mode === "signup" ? "Create Account & Get ₹500" : "Log In with Password";
      }
    }
  });

  // 1-Click Demo Traveler Login
  demoBtn?.addEventListener("click", async () => {
    try {
      demoBtn.disabled = true;
      demoBtn.textContent = "Logging in as Demo Traveler...";
      const user = await AppState.login("user@travelgo.in", "user123");
      modal?.classList.remove("show");
      showToast(`Signed in as ${user.name} (user@travelgo.in)!`, "success");
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || "Demo login failed.";
        errorBox.style.display = "block";
      }
    } finally {
      demoBtn.disabled = false;
      demoBtn.textContent = "⚡ Quick Demo Login (Traveler: user@travelgo.in)";
    }
  });
}

function updateHeaderUserUI() {
  const user = AppState.getUser();
  const authContainer = document.getElementById("header-user-container");
  const heroAuthBanner = document.getElementById("hero-auth-banner");
  const mobileAuthWrapper = document.getElementById("mobile-auth-wrapper");

  // Update Hero auth prompt banner if present
  if (heroAuthBanner) {
    if (user) {
      heroAuthBanner.innerHTML = `
        <div class="tg-hero-auth-inner">
          <div class="tg-hero-auth-text">
            <span class="tg-hero-auth-tag">🌟 VIP MEMBER</span>
            <span>Welcome back, <strong>${user.name}</strong>! Your member fares and ₹500 festival credits are unlocked.</span>
          </div>
          <div class="tg-hero-auth-cta">
            <button type="button" class="tg-btn tg-btn-xs tg-btn-outline" id="btn-hero-my-trips">
              🧳 My Bookings
            </button>
          </div>
        </div>
      `;
      document.getElementById("btn-hero-my-trips")?.addEventListener("click", () => {
        openTripsDrawer();
      });
    } else {
      heroAuthBanner.innerHTML = `
        <div class="tg-hero-auth-inner">
          <div class="tg-hero-auth-text">
            <span class="tg-hero-auth-tag">🎉 MEMBER BENEFIT</span>
            <span>Join 50,000+ happy travelers! <strong>Register</strong> to get flat ₹500 off + member-only fares.</span>
          </div>
          <div class="tg-hero-auth-cta">
            <button type="button" class="tg-btn tg-btn-xs tg-btn-outline" id="btn-hero-login">
              Log In
            </button>
            <button type="button" class="tg-btn tg-btn-xs tg-btn-primary" id="btn-hero-register">
              Register ✨
            </button>
          </div>
        </div>
      `;
      document.getElementById("btn-hero-login")?.addEventListener("click", () => openAuthModal("login"));
      document.getElementById("btn-hero-register")?.addEventListener("click", () => openAuthModal("signup"));
    }
  }

  // Update Mobile Navigation Menu Auth item
  if (mobileAuthWrapper) {
    if (user) {
      mobileAuthWrapper.innerHTML = `
        <div class="tg-mobile-auth-actions">
          <div style="padding: 10px 14px; background: rgba(20,184,166,0.1); border: 1px solid rgba(20,184,166,0.25); border-radius: 8px;">
            <div style="font-weight: 700; color: var(--teal-300);">${user.name}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${user.email}</div>
          </div>
          <button type="button" class="tg-btn tg-btn-sm tg-btn-outline tg-btn-block" id="btn-mobile-trips">
            🧳 My Booked Trips
          </button>
          <button type="button" class="tg-btn tg-btn-sm tg-btn-block" id="btn-mobile-logout" style="background: rgba(239,68,68,0.15); color: #EF4444; border: 1px solid rgba(239,68,68,0.3);">
            🚪 Sign Out
          </button>
        </div>
      `;
      document.getElementById("btn-mobile-trips")?.addEventListener("click", () => {
        document.querySelector(".tg-nav-links")?.classList.remove("open");
        openTripsDrawer();
      });
      document.getElementById("btn-mobile-logout")?.addEventListener("click", () => {
        document.querySelector(".tg-nav-links")?.classList.remove("open");
        AppState.logout();
        showToast("Signed out successfully.", "info");
      });
    } else {
      mobileAuthWrapper.innerHTML = `
        <div class="tg-mobile-auth-actions">
          <button type="button" class="tg-btn tg-btn-sm tg-btn-outline tg-btn-block" id="btn-mobile-login">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            Log In
          </button>
          <button type="button" class="tg-btn tg-btn-sm tg-btn-primary tg-btn-block" id="btn-mobile-register">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            Register & Get ₹500
          </button>
        </div>
      `;
      document.getElementById("btn-mobile-login")?.addEventListener("click", () => {
        document.querySelector(".tg-nav-links")?.classList.remove("open");
        openAuthModal("login");
      });
      document.getElementById("btn-mobile-register")?.addEventListener("click", () => {
        document.querySelector(".tg-nav-links")?.classList.remove("open");
        openAuthModal("signup");
      });
    }
  }

  // Update Header Auth Container
  if (!authContainer) return;

  if (user) {
    authContainer.innerHTML = `
      <div style="position: relative;">
        <div class="tg-user-pill" id="btn-open-user-menu" title="Account & Bookings" style="cursor: pointer;">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" alt="${user.name}" class="tg-user-avatar" />
          <span class="tg-user-name">${user.name.split(" ")[0]}</span>
          <span style="font-size: 0.7rem; color: var(--teal-300);">▼</span>
        </div>
        <div id="tg-user-dropdown" class="tg-user-dropdown-menu" style="display: none; position: absolute; right: 0; top: calc(100% + 8px); background: #0D162D; border: 1px solid rgba(20,184,166,0.3); border-radius: 12px; box-shadow: 0 16px 36px rgba(0,0,0,0.6); padding: 12px; width: 220px; z-index: 1100;">
          <div style="padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <strong style="display: block; font-size: 0.88rem; color: var(--text-primary);">${user.name}</strong>
            <small style="font-size: 0.75rem; color: var(--text-muted);">${user.email}</small>
          </div>
          <button type="button" id="btn-dropdown-trips" class="tg-btn tg-btn-xs tg-btn-outline tg-btn-block" style="margin-bottom: 6px; justify-content: flex-start;">
            🧳 My Booked Trips
          </button>
          <button type="button" id="btn-dropdown-logout" class="tg-btn tg-btn-xs tg-btn-block" style="background: rgba(239,68,68,0.15); color: #EF4444; border: 1px solid rgba(239,68,68,0.3); justify-content: flex-start;">
            🚪 Sign Out
          </button>
        </div>
      </div>
    `;

    const pill = document.getElementById("btn-open-user-menu");
    const dropdown = document.getElementById("tg-user-dropdown");
    const tripsBtn = document.getElementById("btn-dropdown-trips");
    const logoutBtn = document.getElementById("btn-dropdown-logout");

    pill?.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    });

    document.addEventListener("click", () => {
      if (dropdown) dropdown.style.display = "none";
    });

    tripsBtn?.addEventListener("click", () => {
      if (dropdown) dropdown.style.display = "none";
      openTripsDrawer();
    });

    logoutBtn?.addEventListener("click", () => {
      AppState.logout();
      showToast("Signed out successfully.", "info");
    });
  } else {
    authContainer.innerHTML = `
      <div class="tg-header-auth-group">
        <button type="button" id="btn-header-login" class="tg-btn tg-btn-sm tg-btn-outline tg-auth-nav-btn" title="Log In to your account">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          Log In
        </button>
        <button type="button" id="btn-header-register" class="tg-btn tg-btn-sm tg-btn-primary tg-auth-nav-btn" title="Create a new account">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          Register
        </button>
      </div>
    `;

    document.getElementById("btn-header-login")?.addEventListener("click", () => {
      openAuthModal("login");
    });
    document.getElementById("btn-header-register")?.addEventListener("click", () => {
      openAuthModal("signup");
    });
  }
}

/* =========================================================================
   3. "MY TRIPS" SLIDE-OUT DRAWER
   ========================================================================= */
function initMyTripsDrawer() {
  const drawer = document.getElementById("trips-drawer");
  const overlay = document.getElementById("trips-drawer-overlay");
  const closeBtn = document.getElementById("btn-close-trips-drawer");
  const triggerBtn = document.getElementById("btn-nav-trips");

  triggerBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    openTripsDrawer();
  });

  closeBtn?.addEventListener("click", () => closeTripsDrawer());
  overlay?.addEventListener("click", () => closeTripsDrawer());

  // Listen to bookings update
  window.addEventListener("travelgo:booking-updated", () => renderTripsList());
  window.addEventListener("travelgo:booking-added", () => renderTripsList());
}

export function openTripsDrawer() {
  const drawer = document.getElementById("trips-drawer");
  const overlay = document.getElementById("trips-drawer-overlay");
  if (!drawer || !overlay) return;

  renderTripsList();
  drawer.classList.add("open");
  overlay.classList.add("open");
}

function closeTripsDrawer() {
  document.getElementById("trips-drawer")?.classList.remove("open");
  document.getElementById("trips-drawer-overlay")?.classList.remove("open");
}

function renderTripsList() {
  const container = document.getElementById("trips-drawer-content");
  if (!container) return;

  const bookings = AppState.getBookings();

  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="tg-empty-state">
        <span class="tg-empty-icon">🧳</span>
        <h4>No Trips Booked Yet</h4>
        <p>Explore breathtaking Indian destinations or book a fast cab / train ticket.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = bookings.map(b => {
    const isCancelled = b.status === "CANCELLED";
    return `
      <div class="tg-trip-card ${isCancelled ? 'cancelled' : ''}">
        <div class="tg-trip-card-top">
          <span class="tg-trip-type-badge">${b.type}</span>
          <span class="tg-trip-status ${isCancelled ? 'danger' : 'success'}">${b.status}</span>
        </div>
        <h4 class="tg-trip-title">${b.title}</h4>
        <p class="tg-trip-subtitle">${b.subtitle || ''}</p>
        
        <div class="tg-trip-meta">
          <span>📅 ${b.date} ${b.time ? '• ' + b.time : ''}</span>
          <span>💰 ${formatINR(b.amount)}</span>
          ${b.pnr ? `<span>🚆 PNR: <strong>${b.pnr}</strong></span>` : ''}
        </div>

        ${isCancelled ? `
          <div class="tg-refund-notice">
            ⚠️ <strong>Booking Cancelled</strong>. ${b.refundStatus || 'Refund processing.'}
          </div>
        ` : `
          <div class="tg-trip-actions">
            <button type="button" class="tg-btn tg-btn-xs tg-btn-secondary btn-view-trip-voucher" data-id="${b.id}">
              View E-Ticket
            </button>
            <button type="button" class="tg-btn tg-btn-xs tg-btn-outline btn-cancel-trip" data-id="${b.id}">
              Cancel Trip
            </button>
          </div>
        `}
      </div>
    `;
  }).join("");

  // Attach voucher views
  container.querySelectorAll(".btn-view-trip-voucher").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const b = bookings.find(item => item.id === id);
      if (b) {
        closeTripsDrawer();
        openVoucherModal(b);
      }
    });
  });

  // Attach cancellation
  container.querySelectorAll(".btn-cancel-trip").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to cancel this booking? Free 100% refund will be processed back to your payment source.")) {
        AppState.cancelBooking(id);
        showToast("Booking cancelled. 100% refund initiated to source.", "info");
      }
    });
  });
}

/* =========================================================================
   4. "WISHLIST" DRAWER
   ========================================================================= */
function initWishlistDrawer() {
  const drawer = document.getElementById("wishlist-drawer");
  const overlay = document.getElementById("wishlist-drawer-overlay");
  const closeBtn = document.getElementById("btn-close-wishlist-drawer");
  const triggerBtn = document.getElementById("btn-header-wishlist");

  triggerBtn?.addEventListener("click", () => {
    renderWishlistItems();
    drawer?.classList.add("open");
    overlay?.classList.add("open");
  });

  closeBtn?.addEventListener("click", () => {
    drawer?.classList.remove("open");
    overlay?.classList.remove("open");
  });

  overlay?.addEventListener("click", () => {
    drawer?.classList.remove("open");
    overlay?.classList.remove("open");
  });
}

function updateWishlistCountBadge() {
  const count = AppState.getWishlist().length;
  const badge = document.getElementById("wishlist-counter-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  }
}

function renderWishlistItems() {
  const container = document.getElementById("wishlist-drawer-content");
  if (!container) return;

  const wishIds = AppState.getWishlist();
  const items = AppState.getDestinations().filter(d => wishIds.includes(d.id));

  if (items.length === 0) {
    container.innerHTML = `
      <div class="tg-empty-state">
        <span class="tg-empty-icon">❤️</span>
        <h4>Your Wishlist is Empty</h4>
        <p>Save your favorite Indian getaways and track special discounted fares.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(dest => `
    <div class="tg-wish-item-card">
      <img src="${dest.heroImage}" alt="${dest.name}" />
      <div class="tg-wish-item-info">
        <h5>${dest.name} <small>(${dest.state})</small></h5>
        <p class="tg-wish-price">Starting from ${formatINR(dest.startPrice)}</p>
        <div class="tg-wish-actions">
          <button class="tg-btn tg-btn-xs tg-btn-primary btn-wish-book" data-id="${dest.id}">Explore & Book</button>
          <button class="tg-btn tg-btn-xs tg-btn-outline btn-wish-remove" data-id="${dest.id}">Remove</button>
        </div>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".btn-wish-book").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("wishlist-drawer")?.classList.remove("open");
      document.getElementById("wishlist-drawer-overlay")?.classList.remove("open");
      const id = btn.getAttribute("data-id");
      openDestinationModal(id);
    });
  });

  container.querySelectorAll(".btn-wish-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      AppState.toggleWishlist(id);
      renderWishlistItems();
      // Also update heart on grid
      const gridHeart = document.querySelector(`.tg-wish-btn[data-wish-id='${id}']`);
      if (gridHeart) {
        gridHeart.classList.remove("active");
        gridHeart.querySelector("svg").setAttribute("fill", "none");
        gridHeart.querySelector("svg").setAttribute("stroke", "#FFFFFF");
      }
    });
  });
}

/* =========================================================================
   5. STATS COUNT-UP ANIMATION
   ========================================================================= */
function initStatsCounter() {
  const statElements = document.querySelectorAll(".tg-stat-number");
  if (statElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute("data-target"));
        const suffix = el.getAttribute("data-suffix") || "";
        const decimals = parseInt(el.getAttribute("data-decimals")) || 0;
        animateNumber(el, target, suffix, decimals);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statElements.forEach(el => observer.observe(el));
}

function animateNumber(el, target, suffix, decimals) {
  let start = 0;
  const duration = 1800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * easeOut;

    el.textContent = current.toFixed(decimals) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toFixed(decimals) + suffix;
    }
  }

  requestAnimationFrame(update);
}

/* =========================================================================
   6. TESTIMONIALS MARQUEE
   ========================================================================= */
function initTestimonialsMarquee() {
  const container = document.getElementById("testimonials-track");
  if (!container) return;

  // Duplicate for seamless infinite scroll
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  container.innerHTML = doubled.map(t => `
    <div class="tg-testimonial-card">
      <div class="tg-t-rating">${'★'.repeat(t.rating)}</div>
      <p class="tg-t-text">"${t.text}"</p>
      <div class="tg-t-user">
        <img src="${t.avatar}" alt="${t.name}" />
        <div>
          <strong>${t.name}</strong>
          <span>${t.city} • <em>${t.trip}</em></span>
        </div>
      </div>
    </div>
  `).join("");
}

/* =========================================================================
   7. NEWSLETTER FORM
   ========================================================================= */
function initNewsletterForm() {
  document.getElementById("tg-newsletter-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletter-email")?.value.trim();
    if (email) {
      showToast(`Thank you! Exclusive travel offers sent to ${email}`, "success");
      e.target.reset();
    }
  });
}
