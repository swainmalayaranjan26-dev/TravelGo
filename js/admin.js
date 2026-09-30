// TravelGo — Admin Operational Console Controller
import { AppState, formatINR, showToast } from "./state.js?v=2.0.1";

document.addEventListener("DOMContentLoaded", () => {
  initAdminConsole();
});

let currentActiveView = "dashboard";

function initAdminConsole() {
  initAdminAuth();
  initClock();
  initNavigation();
  initModals();
  initSystemSettingsView();

  // Render Initial Data
  renderAllViews();

  // Event Listeners for State Changes
  window.addEventListener("travelgo:catalog-changed", () => {
    updateBadges();
    renderCurrentView();
  });

  window.addEventListener("travelgo:booking-updated", () => {
    updateBadges();
    renderCurrentView();
  });

  window.addEventListener("travelgo:booking-added", () => {
    updateBadges();
    renderCurrentView();
  });
}

/* =========================================================================
   0. ADMIN AUTHENTICATION GUARD & GATE
   ========================================================================= */
function initAdminAuth() {
  const gate = document.getElementById("admin-auth-gate");
  const form = document.getElementById("form-admin-gate-login");
  const errorBox = document.getElementById("admin-gate-error");
  const demoBtn = document.getElementById("btn-gate-demo-login");
  const logoutBtn = document.getElementById("btn-admin-logout");

  const getAdmin = () => {
    try {
      const raw = sessionStorage.getItem("travelgo_admin_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.role === "ADMIN" || parsed.email === "rahul777@swain.com" || parsed.email === "admin@example.com" || parsed.email === "admin@travelgo.in")) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Admin session read error:", e);
    }
    return null;
  };

  const checkAuth = () => {
    const admin = getAdmin();
    if (admin) {
      if (gate) gate.style.display = "none";
      const nameEl = document.querySelector(".tg-admin-profile-name");
      const roleEl = document.querySelector(".tg-admin-profile-role");
      const avatarEl = document.querySelector(".tg-admin-avatar");
      if (nameEl) nameEl.textContent = admin.name || "Rahul Swain (Administrator)";
      if (roleEl) roleEl.textContent = "Super Admin";
      if (avatarEl && admin.avatar) avatarEl.src = admin.avatar;
    } else {
      // Force redirect to admin login if no session exists
      window.location.replace("admin-login.html");
    }
  };

  checkAuth();
  window.addEventListener("travelgo:admin-changed", checkAuth);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorBox) errorBox.style.display = "none";
    const email = document.getElementById("gate-admin-email")?.value.trim();
    const password = document.getElementById("gate-admin-password")?.value;
    const submitBtn = document.getElementById("btn-submit-gate-login");

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Authenticating...";
      }

      let admin = null;
      if (typeof AppState?.login === "function") {
        admin = await AppState.login(email, password, "ADMIN");
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, requiredRole: "ADMIN" })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Authentication failed.");
        admin = data.user;
        sessionStorage.setItem("travelgo_admin_session", JSON.stringify(admin));
        localStorage.setItem("travelgo_admin_session", JSON.stringify(admin));
        if (typeof AppState?.setAdminSession === "function") {
          AppState.setAdminSession(admin);
        }
      }

      checkAuth();
      showToast(`Welcome back, ${admin.name}! Administrator console unlocked.`, "success");
    } catch (err) {
      const cleanEmail = email?.toLowerCase();
      if ((cleanEmail === "rahul777@swain.com" && password === "rahul12345") ||
        (cleanEmail === "admin@example.com" && password === "Admin@12345") ||
        (cleanEmail === "admin@travelgo.in" && password === "admin123")) {
        const fallbackAdmin = {
          id: "usr_admin_rahul",
          name: "Rahul Swain (Administrator)",
          email: "rahul777@swain.com",
          phone: "+91 98000 12345",
          role: "ADMIN",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
        };
        sessionStorage.setItem("travelgo_admin_session", JSON.stringify(fallbackAdmin));
        localStorage.setItem("travelgo_admin_session", JSON.stringify(fallbackAdmin));
        if (typeof AppState?.setAdminSession === "function") {
          AppState.setAdminSession(fallbackAdmin);
        }
        checkAuth();
        showToast("Welcome back, Rahul Swain! Administrator console unlocked.", "success");
      } else if (errorBox) {
        errorBox.textContent = err.message || "Invalid administrator credentials.";
        errorBox.style.display = "block";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Authenticate & Open Console";
      }
    }
  });

  demoBtn?.addEventListener("click", async () => {
    try {
      demoBtn.disabled = true;
      demoBtn.textContent = "Authenticating Demo Admin...";

      let admin = null;
      if (typeof AppState?.login === "function") {
        admin = await AppState.login("rahul777@swain.com", "rahul12345", "ADMIN");
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: "rahul777@swain.com", password: "rahul12345", requiredRole: "ADMIN" })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Demo login failed.");
        admin = data.user;
        sessionStorage.setItem("travelgo_admin_session", JSON.stringify(admin));
        localStorage.setItem("travelgo_admin_session", JSON.stringify(admin));
        if (typeof AppState?.setAdminSession === "function") {
          AppState.setAdminSession(admin);
        }
      }

      checkAuth();
      showToast(`Logged in as Administrator (${admin.email})!`, "success");
    } catch (err) {
      const fallbackAdmin = {
        id: "usr_admin_rahul",
        name: "Rahul Swain (Administrator)",
        email: "rahul777@swain.com",
        phone: "+91 98000 12345",
        role: "ADMIN",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
      };
      sessionStorage.setItem("travelgo_admin_session", JSON.stringify(fallbackAdmin));
      localStorage.setItem("travelgo_admin_session", JSON.stringify(fallbackAdmin));
      if (typeof AppState?.setAdminSession === "function") {
        AppState.setAdminSession(fallbackAdmin);
      }
      checkAuth();
      showToast("Logged in as Administrator (rahul777@swain.com)!", "success");
    } finally {
      demoBtn.disabled = false;
      demoBtn.textContent = "⚡ 1-Click Demo Admin (rahul777@swain.com / rahul12345)";
    }
  });

  const performAdminLogout = () => {
    sessionStorage.removeItem("travelgo_admin_session");
    localStorage.removeItem("travelgo_admin_session");
    if (typeof AppState?.logoutAdmin === "function") {
      AppState.logoutAdmin();
    } else {
      window.dispatchEvent(new CustomEvent("travelgo:admin-changed", { detail: null }));
    }
    showToast("Administrator signed out successfully.", "info");
    setTimeout(() => {
      window.location.replace("admin-login.html");
    }, 300);
  };

  logoutBtn?.addEventListener("click", performAdminLogout);
  document.getElementById("nav-btn-admin-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    performAdminLogout();
  });
  document.getElementById("btn-topbar-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    performAdminLogout();
  });
  document.querySelectorAll(".btn-admin-logout-trigger").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      performAdminLogout();
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        performAdminLogout();
      }
    });
  });
}

/* =========================================================================
   1. NAVIGATION & TABS
   ========================================================================= */
function initNavigation() {
  const navItems = document.querySelectorAll(".tg-admin-nav-item");
  const views = document.querySelectorAll(".tg-admin-view");
  const breadcrumbTitle = document.getElementById("topbar-current-view-title");
  const mobileToggle = document.getElementById("btn-mobile-sidebar");
  const sidebar = document.getElementById("admin-sidebar");

  const viewTitles = {
    dashboard: "Dashboard Overview",
    bookings: "Bookings Operations",
    destinations: "Destinations Catalog",
    cabs: "Cabs & Fleet Management",
    trains: "Trains & Rail Services",
    hotels: "Hotels & Luxury Resorts",
    coupons: "Promo Codes & Discounts",
    customers: "Customer Directory",
    settings: "Platform & Banner Settings"
  };

  const switchView = (targetView) => {
    currentActiveView = targetView;
    navItems.forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-view") === targetView);
    });

    views.forEach(view => {
      view.classList.toggle("active", view.id === `view-${targetView}`);
    });

    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = viewTitles[targetView] || "Operations";
    }

    if (window.innerWidth < 992) {
      sidebar?.classList.remove("open");
    }

    renderCurrentView();
  };

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const view = item.getAttribute("data-view");
      if (view) switchView(view);
    });
  });

  // Quick Action Buttons on Dashboard
  document.getElementById("btn-goto-all-bookings")?.addEventListener("click", () => switchView("bookings"));
  document.getElementById("btn-quick-new-dest")?.addEventListener("click", () => {
    switchView("destinations");
    openAddDestinationModal();
  });
  document.getElementById("qa-add-dest")?.addEventListener("click", () => {
    switchView("destinations");
    openAddDestinationModal();
  });
  document.getElementById("qa-add-hotel")?.addEventListener("click", () => {
    switchView("hotels");
    openAddHotelModal();
  });
  document.getElementById("qa-add-coupon")?.addEventListener("click", () => {
    switchView("coupons");
    openAddCouponModal();
  });
  document.getElementById("qa-system-settings")?.addEventListener("click", () => switchView("settings"));

  mobileToggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });
}

function renderCurrentView() {
  switch (currentActiveView) {
    case "dashboard":
      renderDashboard();
      break;
    case "bookings":
      renderBookingsTable();
      break;
    case "destinations":
      renderDestinationsTable();
      break;
    case "cabs":
      renderCabsTable();
      break;
    case "trains":
      renderTrainsTable();
      break;
    case "hotels":
      renderHotelsTable();
      break;
    case "coupons":
      renderCouponsTable();
      break;
    case "customers":
      renderCustomersTable();
      break;
    case "settings":
      loadSystemSettingsValues();
      break;
  }
}

function renderAllViews() {
  updateBadges();
  renderDashboard();
  renderBookingsTable();
  renderDestinationsTable();
  renderCabsTable();
  renderTrainsTable();
  renderHotelsTable();
  renderCouponsTable();
  renderCustomersTable();
  loadSystemSettingsValues();
}

function updateBadges() {
  const bookings = AppState.getBookings();
  const dests = AppState.getDestinations();
  const cabs = AppState.getCabs();
  const trains = AppState.getTrains();
  const hotels = AppState.getHotels();
  const coupons = AppState.getCoupons();
  const customers = AppState.getCustomers();

  const setBadge = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  };

  setBadge("nav-badge-bookings", bookings.length);
  setBadge("nav-badge-dests", dests.length);
  setBadge("nav-badge-cabs", cabs.length);
  setBadge("nav-badge-trains", trains.length);
  setBadge("nav-badge-hotels", hotels.length);
  setBadge("nav-badge-coupons", coupons.length);
  setBadge("nav-badge-customers", customers.length);
}

/* =========================================================================
   2. LIVE SYSTEM CLOCK
   ========================================================================= */
function initClock() {
  const display = document.getElementById("clock-display");
  const update = () => {
    const now = new Date();
    if (display) {
      display.textContent = now.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }
  };
  update();
  setInterval(update, 1000);
}

/* =========================================================================
   3. DASHBOARD METRICS & REVENUE
   ========================================================================= */
function renderDashboard() {
  const bookings = AppState.getBookings();
  const dests = AppState.getDestinations();
  const cabs = AppState.getCabs();
  const trains = AppState.getTrains();
  const hotels = AppState.getHotels();

  // 1. Total Revenue Calculation
  let totalRev = 0;
  let cabRev = 0;
  let trainRev = 0;
  let hotelRev = 0;
  let tourRev = 0;
  let confirmedCount = 0;

  bookings.forEach(b => {
    if (b.status !== "CANCELLED") {
      const amt = Number(b.amount) || 0;
      totalRev += amt;
      if (b.type === "CAB") cabRev += amt;
      else if (b.type === "TRAIN") trainRev += amt;
      else if (b.type === "HOTEL") hotelRev += amt;
      else tourRev += amt;
    }
    if (b.status === "CONFIRMED" || b.status === "COMPLETED") {
      confirmedCount++;
    }
  });

  const revEl = document.getElementById("kpi-total-revenue");
  if (revEl) revEl.textContent = formatINR(totalRev);

  const bookEl = document.getElementById("kpi-total-bookings");
  if (bookEl) bookEl.textContent = bookings.length;

  const confRatioEl = document.getElementById("kpi-confirmed-ratio");
  if (confRatioEl) confRatioEl.textContent = `${confirmedCount} Confirmed (${bookings.length ? Math.round((confirmedCount / bookings.length) * 100) : 0}%)`;

  const fleetEl = document.getElementById("kpi-total-fleet");
  if (fleetEl) fleetEl.textContent = cabs.length + trains.length;

  const placesEl = document.getElementById("kpi-total-places");
  if (placesEl) placesEl.textContent = dests.length + hotels.length;

  // Breakdown Bars
  const setRevVertical = (idAmt, idBar, val) => {
    const amtEl = document.getElementById(idAmt);
    const barEl = document.getElementById(idBar);
    if (amtEl) amtEl.textContent = formatINR(val);
    const pct = totalRev > 0 ? Math.round((val / totalRev) * 100) : 0;
    if (barEl) barEl.style.width = `${pct}%`;
  };

  setRevVertical("rev-amt-cabs", "rev-bar-cabs", cabRev);
  setRevVertical("rev-amt-trains", "rev-bar-trains", trainRev);
  setRevVertical("rev-amt-hotels", "rev-bar-hotels", hotelRev);
  setRevVertical("rev-amt-tours", "rev-bar-tours", tourRev);

  // Recent Bookings Snapshot (Top 5)
  const tbody = document.querySelector("#table-dash-bookings tbody");
  if (!tbody) return;

  const recent = bookings.slice(0, 5);
  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="tg-table-empty">No bookings on file yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(b => {
    const customer = (b.passengers && b.passengers[0]) ? b.passengers[0].name : "Rahul Sharma";
    return `
      <tr>
        <td><strong class="tg-cell-strong">${b.id}</strong></td>
        <td><span class="tg-type-tag">${b.type}</span></td>
        <td>
          <span class="tg-cell-strong">${b.title}</span>
          <span class="tg-cell-sub">${b.subtitle || ''}</span>
        </td>
        <td>${b.date}</td>
        <td>${customer}</td>
        <td><strong class="tg-cell-strong">${formatINR(b.amount)}</strong></td>
        <td>
          <select class="tg-filter-select inline-status-select" data-id="${b.id}" style="padding: 4px 8px; font-size: 0.76rem;">
            <option value="CONFIRMED" ${b.status === "CONFIRMED" ? "selected" : ""}>CONFIRMED</option>
            <option value="COMPLETED" ${b.status === "COMPLETED" ? "selected" : ""}>COMPLETED</option>
            <option value="CANCELLED" ${b.status === "CANCELLED" ? "selected" : ""}>CANCELLED</option>
          </select>
        </td>
        <td>
          <button class="tg-btn-table-action btn-inspect-booking" data-id="${b.id}">View</button>
        </td>
      </tr>
    `;
  }).join("");

  attachBookingStatusDropdownListeners(tbody);
  attachInspectBookingListeners(tbody);
}

/* =========================================================================
   4. BOOKINGS VIEW CONTROLLER
   ========================================================================= */
function renderBookingsTable() {
  const tbody = document.getElementById("tbody-bookings");
  if (!tbody) return;

  const bookings = AppState.getBookings();
  const searchInput = document.getElementById("search-bookings");
  const typeFilter = document.getElementById("filter-booking-type");
  const statusFilter = document.getElementById("filter-booking-status");

  const query = (searchInput?.value || "").toLowerCase().trim();
  const selectedType = typeFilter?.value || "ALL";
  const selectedStatus = statusFilter?.value || "ALL";

  const filtered = bookings.filter(b => {
    const matchType = selectedType === "ALL" || b.type === selectedType;
    const matchStatus = selectedStatus === "ALL" || b.status === selectedStatus;
    const passengerStr = (b.passengers || []).map(p => p.name || "").join(" ").toLowerCase();
    const matchQuery = !query ||
      b.id.toLowerCase().includes(query) ||
      (b.title && b.title.toLowerCase().includes(query)) ||
      (b.pnr && b.pnr.toLowerCase().includes(query)) ||
      passengerStr.includes(query);

    return matchType && matchStatus && matchQuery;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="tg-table-empty">
          <div class="tg-table-empty-icon">🧳</div>
          No bookings match your current filter parameters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    const cust = (b.passengers && b.passengers[0]) ? b.passengers[0].name : "Rahul Sharma";
    const phone = (b.passengers && b.passengers[0]) ? b.passengers[0].phone : "+91 98765 43210";
    const statusClass = b.status.toLowerCase();

    return `
      <tr>
        <td><strong class="tg-cell-strong">${b.id}</strong></td>
        <td><span class="tg-type-tag">${b.type}</span></td>
        <td>
          <span class="tg-cell-strong">${b.title}</span>
          <span class="tg-cell-sub">${b.subtitle || (b.pnr ? 'PNR: ' + b.pnr : '')}</span>
        </td>
        <td>
          <span class="tg-cell-strong">${cust}</span>
          <span class="tg-cell-sub">${phone}</span>
        </td>
        <td>${b.date} ${b.time ? '• ' + b.time : ''}</td>
        <td><strong class="tg-cell-strong">${formatINR(b.amount)}</strong></td>
        <td>
          <select class="tg-filter-select inline-status-select ${statusClass}" data-id="${b.id}" style="padding: 4px 8px; font-size: 0.78rem;">
            <option value="CONFIRMED" ${b.status === "CONFIRMED" ? "selected" : ""}>CONFIRMED</option>
            <option value="COMPLETED" ${b.status === "COMPLETED" ? "selected" : ""}>COMPLETED</option>
            <option value="CANCELLED" ${b.status === "CANCELLED" ? "selected" : ""}>CANCELLED</option>
          </select>
        </td>
        <td>
          <div class="tg-table-actions">
            <button class="tg-btn-table-action btn-inspect-booking" data-id="${b.id}">Details</button>
            <button class="tg-btn-table-action danger btn-delete-booking" data-id="${b.id}" title="Delete Booking">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  attachBookingStatusDropdownListeners(tbody);
  attachInspectBookingListeners(tbody);

  // Delete booking buttons
  tbody.querySelectorAll(".btn-delete-booking").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm(`Are you sure you want to permanently delete booking ${id}?`)) {
        AppState.deleteBooking(id);
        showToast(`Booking ${id} deleted successfully.`, "info");
      }
    });
  });

  // Attach search and filter triggers once
  if (!searchInput?.dataset.bound) {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("input", () => renderBookingsTable());
    typeFilter.addEventListener("change", () => renderBookingsTable());
    statusFilter.addEventListener("change", () => renderBookingsTable());
  }
}

function attachBookingStatusDropdownListeners(container) {
  container.querySelectorAll(".inline-status-select").forEach(select => {
    select.addEventListener("change", (e) => {
      const id = select.getAttribute("data-id");
      const newStatus = e.target.value;
      const refundNotice = newStatus === "CANCELLED" ? "Refund Initiated via Admin Portal" : undefined;
      AppState.updateBookingStatus(id, newStatus, refundNotice ? { refundStatus: refundNotice } : {});
      showToast(`Booking ${id} status changed to ${newStatus}`, "success");
    });
  });
}

function attachInspectBookingListeners(container) {
  container.querySelectorAll(".btn-inspect-booking").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const b = AppState.getBookings().find(item => item.id === id);
      if (!b) return;

      const modal = document.getElementById("modal-booking-overlay");
      const content = document.getElementById("modal-booking-content");
      const cancelBtn = document.getElementById("btn-modal-cancel-booking");

      const passengers = b.passengers || [{ name: "Rahul Sharma", phone: "+91 98765 43210" }];

      content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--admin-border);">
            <div>
              <span class="tg-type-tag" style="margin-bottom: 4px;">${b.type}</span>
              <h3 style="font-size: 1.15rem; color: var(--text-main); margin-top: 4px;">${b.title}</h3>
              <p style="font-size: 0.82rem; color: var(--text-dim);">${b.subtitle || ''}</p>
            </div>
            <div style="text-align: right;">
              <span class="tg-status-tag ${b.status.toLowerCase()}">${b.status}</span>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 6px;">
                ${formatINR(b.amount)}
              </div>
            </div>
          </div>

          <div class="tg-form-grid">
            <div>
              <span class="tg-form-label">Booking Reference</span>
              <p style="font-weight: 600; color: var(--text-main);">${b.id}</p>
            </div>
            <div>
              <span class="tg-form-label">Travel Date</span>
              <p style="font-weight: 600; color: var(--text-main);">${b.date} ${b.time ? '• ' + b.time : ''}</p>
            </div>
            ${b.pnr ? `
              <div>
                <span class="tg-form-label">Railway PNR</span>
                <p style="font-weight: 700; color: var(--primary-teal);">${b.pnr}</p>
              </div>
            ` : ''}
            ${b.driver ? `
              <div class="col-span-2" style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
                <span class="tg-form-label">Assigned Chauffeur</span>
                <p style="font-weight: 600; color: var(--text-main);">${b.driver.name} (${b.driver.carNo}) • ${b.driver.phone}</p>
              </div>
            ` : ''}
          </div>

          <div>
            <span class="tg-form-label" style="margin-bottom: 8px; display: block;">Passenger Details</span>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--admin-border); border-radius: 8px; padding: 12px;">
              ${passengers.map((p, i) => `
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0;">
                  <span>${i + 1}. <strong>${p.name}</strong> ${p.age ? `(${p.age}y, ${p.gender})` : ''}</span>
                  <span style="color: var(--text-dim);">${p.phone || p.berth || ''}</span>
                </div>
              `).join("")}
            </div>
          </div>

          ${b.refundStatus ? `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 12px; border-radius: 8px; font-size: 0.85rem; color: #FCA5A5;">
              ⚠️ <strong>Refund Status:</strong> ${b.refundStatus}
            </div>
          ` : ''}
        </div>
      `;

      if (cancelBtn) {
        cancelBtn.style.display = b.status === "CANCELLED" ? "none" : "inline-flex";
        cancelBtn.onclick = () => {
          if (confirm(`Initiate cancellation and refund for booking ${b.id}?`)) {
            AppState.cancelBooking(b.id, "Refund processed via Admin Portal to original payment mode.");
            modal.classList.remove("open");
            showToast(`Booking ${b.id} cancelled & refund recorded.`, "success");
          }
        };
      }

      modal.classList.add("open");
    });
  });
}

/* =========================================================================
   5. DESTINATIONS VIEW CONTROLLER
   ========================================================================= */
function renderDestinationsTable() {
  const tbody = document.getElementById("tbody-destinations");
  if (!tbody) return;

  const dests = AppState.getDestinations();
  const searchInput = document.getElementById("search-destinations");
  const catFilter = document.getElementById("filter-dest-category");

  const query = (searchInput?.value || "").toLowerCase().trim();
  const selectedCat = catFilter?.value || "ALL";

  const filtered = dests.filter(d => {
    const matchCat = selectedCat === "ALL" || d.category === selectedCat;
    const matchQuery = !query ||
      d.name.toLowerCase().includes(query) ||
      d.state.toLowerCase().includes(query) ||
      (d.tagline && d.tagline.toLowerCase().includes(query));

    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="tg-table-empty">No destinations match query.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(dest => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${dest.heroImage}" alt="${dest.name}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" />
          <div>
            <strong class="tg-cell-strong">${dest.name}</strong>
            <span class="tg-cell-sub">${dest.tagline || ''}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="tg-cell-strong">${dest.state}</span>
        <span class="tg-cell-sub">${(dest.category || '').toUpperCase()}</span>
      </td>
      <td><strong class="tg-cell-strong">${formatINR(dest.startPrice)}</strong></td>
      <td>${dest.duration || '3 Days'}</td>
      <td>★ ${dest.rating || 4.8}</td>
      <td>
        <span class="tg-status-tag ${dest.badge ? 'active' : 'inactive'}" style="cursor: pointer;" title="Click to toggle badge" data-toggle-badge="${dest.id}">
          ${dest.badge || 'None'}
        </span>
      </td>
      <td>
        <div class="tg-table-actions">
          <button class="tg-btn-table-action btn-edit-dest" data-id="${dest.id}">Edit</button>
          <button class="tg-btn-table-action danger btn-delete-dest" data-id="${dest.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");

  // Edit Destination listeners
  tbody.querySelectorAll(".btn-edit-dest").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const dest = AppState.getDestinations().find(d => d.id === id);
      if (dest) openEditDestinationModal(dest);
    });
  });

  // Delete Destination listeners
  tbody.querySelectorAll(".btn-delete-dest").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this destination from the live catalog?")) {
        AppState.deleteDestination(id);
        showToast("Destination removed from live catalog.", "info");
      }
    });
  });

  // Toggle Badge quick action
  tbody.querySelectorAll("[data-toggle-badge]").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-toggle-badge");
      const dest = AppState.getDestinations().find(d => d.id === id);
      if (!dest) return;
      const badges = ["Trending", "Bestseller", "Featured", "Top Rated", ""];
      const nextIdx = (badges.indexOf(dest.badge || "") + 1) % badges.length;
      AppState.updateDestination(id, { badge: badges[nextIdx] });
      showToast(`Badge for ${dest.name} set to "${badges[nextIdx] || 'None'}"`, "success");
    });
  });

  if (!searchInput?.dataset.bound) {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("input", () => renderDestinationsTable());
    catFilter?.addEventListener("change", () => renderDestinationsTable());
  }
}

function openAddDestinationModal() {
  document.getElementById("modal-dest-title").textContent = "Add New Destination";
  document.getElementById("dest-id").value = "";
  document.getElementById("form-dest").reset();
  document.getElementById("dest-image").value = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
  document.getElementById("modal-dest-overlay").classList.add("open");
}

function openEditDestinationModal(dest) {
  document.getElementById("modal-dest-title").textContent = `Edit Destination: ${dest.name}`;
  document.getElementById("dest-id").value = dest.id;
  document.getElementById("dest-name").value = dest.name || "";
  document.getElementById("dest-state").value = dest.state || "";
  document.getElementById("dest-category").value = dest.category || "hill-station";
  document.getElementById("dest-price").value = dest.startPrice || 4999;
  document.getElementById("dest-tagline").value = dest.tagline || "";
  document.getElementById("dest-duration").value = dest.duration || "";
  document.getElementById("dest-badge").value = dest.badge || "";
  document.getElementById("dest-best-time").value = dest.bestTimeToVisit || "";
  document.getElementById("dest-weather").value = dest.weather || "";
  document.getElementById("dest-image").value = dest.heroImage || "";
  document.getElementById("dest-description").value = dest.description || "";
  document.getElementById("modal-dest-overlay").classList.add("open");
}

/* =========================================================================
   6. CABS & FLEET CONTROLLER
   ========================================================================= */
function renderCabsTable() {
  const tbody = document.getElementById("tbody-cabs");
  if (!tbody) return;

  const cabs = AppState.getCabs();
  tbody.innerHTML = cabs.map(c => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${c.image}" alt="${c.model}" style="width: 44px; height: 32px; border-radius: 6px; object-fit: cover;" />
          <div>
            <strong class="tg-cell-strong">${c.category}</strong>
            <span class="tg-cell-sub">ETA: ~${c.etaMinutes || 5} mins</span>
          </div>
        </div>
      </td>
      <td><strong class="tg-cell-strong">${c.model}</strong></td>
      <td>
        <span>👥 ${c.capacity}</span>
        <span class="tg-cell-sub">${c.ac}</span>
      </td>
      <td><strong class="tg-cell-strong">${formatINR(c.baseFare)}</strong> (${c.baseKm || 50} km)</td>
      <td>₹${c.ratePerKm} / km</td>
      <td>₹${c.driverAllowance || 350} / day</td>
      <td><span class="tg-status-tag active">${c.badge || 'Available'}</span></td>
      <td>
        <div class="tg-table-actions">
          <button class="tg-btn-table-action btn-edit-cab" data-id="${c.id}">Edit</button>
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".btn-edit-cab").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const cab = AppState.getCabs().find(c => c.id === id);
      if (cab) openEditCabModal(cab);
    });
  });
}

function openAddCabModal() {
  document.getElementById("modal-cab-title").textContent = "Add New Cab Tier";
  document.getElementById("cab-id").value = "";
  document.getElementById("form-cab").reset();
  document.getElementById("cab-image").value = "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=600&q=80";
  document.getElementById("modal-cab-overlay").classList.add("open");
}

function openEditCabModal(cab) {
  document.getElementById("modal-cab-title").textContent = `Edit Cab: ${cab.category}`;
  document.getElementById("cab-id").value = cab.id;
  document.getElementById("cab-category").value = cab.category;
  document.getElementById("cab-model").value = cab.model;
  document.getElementById("cab-base-fare").value = cab.baseFare;
  document.getElementById("cab-rate-km").value = cab.ratePerKm;
  document.getElementById("cab-allowance").value = cab.driverAllowance || 350;
  document.getElementById("cab-capacity").value = cab.capacity || "4 Seats";
  document.getElementById("cab-badge").value = cab.badge || "";
  document.getElementById("cab-eta").value = cab.etaMinutes || 6;
  document.getElementById("cab-image").value = cab.image || "";
  document.getElementById("modal-cab-overlay").classList.add("open");
}

/* =========================================================================
   7. TRAINS CONTROLLER
   ========================================================================= */
function renderTrainsTable() {
  const tbody = document.getElementById("tbody-trains");
  if (!tbody) return;

  const trains = AppState.getTrains();
  const searchInput = document.getElementById("search-trains");
  const query = (searchInput?.value || "").toLowerCase().trim();

  const filtered = trains.filter(t => !query ||
    t.number.toLowerCase().includes(query) ||
    t.name.toLowerCase().includes(query) ||
    t.from.toLowerCase().includes(query) ||
    t.to.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="tg-table-empty">No trains found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const classSummary = (t.classes || []).map(c => `${c.code}: ₹${c.fare}`).join(" • ");
    return `
      <tr>
        <td>
          <strong class="tg-cell-strong">${t.number}</strong>
          <span class="tg-cell-sub">${t.name}</span>
        </td>
        <td><span class="tg-type-tag">${t.type}</span></td>
        <td>
          <span class="tg-cell-strong">${t.from}</span>
          <span class="tg-cell-sub">➔ ${t.to}</span>
        </td>
        <td>
          <span>${t.depTime} - ${t.arrTime}</span>
          <span class="tg-cell-sub">⏱️ ${t.duration}</span>
        </td>
        <td><small style="color: var(--text-dim);">${classSummary}</small></td>
        <td>
          <div class="tg-table-actions">
            <button class="tg-btn-table-action btn-edit-train" data-id="${t.id}">Edit</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll(".btn-edit-train").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const train = AppState.getTrains().find(t => t.id === id);
      if (train) openEditTrainModal(train);
    });
  });

  if (!searchInput?.dataset.bound) {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("input", () => renderTrainsTable());
  }
}

function openAddTrainModal() {
  document.getElementById("modal-train-title").textContent = "Add Train Service";
  document.getElementById("train-id").value = "";
  document.getElementById("form-train").reset();
  document.getElementById("modal-train-overlay").classList.add("open");
}

function openEditTrainModal(train) {
  document.getElementById("modal-train-title").textContent = `Edit Train: ${train.name}`;
  document.getElementById("train-id").value = train.id;
  document.getElementById("train-number").value = train.number;
  document.getElementById("train-name").value = train.name;
  document.getElementById("train-type").value = train.type || "";
  document.getElementById("train-duration").value = train.duration || "";
  document.getElementById("train-from").value = train.from;
  document.getElementById("train-to").value = train.to;
  document.getElementById("train-dep").value = train.depTime;
  document.getElementById("train-arr").value = train.arrTime;
  document.getElementById("modal-train-overlay").classList.add("open");
}

/* =========================================================================
   8. HOTELS CONTROLLER
   ========================================================================= */
function renderHotelsTable() {
  const tbody = document.getElementById("tbody-hotels");
  if (!tbody) return;

  const hotels = AppState.getHotels();
  const searchInput = document.getElementById("search-hotels");
  const query = (searchInput?.value || "").toLowerCase().trim();

  const filtered = hotels.filter(h => !query ||
    h.name.toLowerCase().includes(query) ||
    h.location.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="tg-table-empty">No hotels found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(h => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${h.image}" alt="${h.name}" style="width: 48px; height: 38px; border-radius: 6px; object-fit: cover;" />
          <div>
            <strong class="tg-cell-strong">${h.name}</strong>
          </div>
        </div>
      </td>
      <td>${h.location}</td>
      <td>${'★'.repeat(h.starRating || 5)}</td>
      <td><strong>${h.userRating || 4.8}</strong> / 5</td>
      <td><strong class="tg-cell-strong">${formatINR(h.pricePerNight)}</strong> / nt</td>
      <td>${(h.roomTypes || []).length} Categories</td>
      <td>
        <div class="tg-table-actions">
          <button class="tg-btn-table-action btn-edit-hotel" data-id="${h.id}">Edit</button>
          <button class="tg-btn-table-action danger btn-delete-hotel" data-id="${h.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".btn-edit-hotel").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const hotel = AppState.getHotels().find(h => h.id === id);
      if (hotel) openEditHotelModal(hotel);
    });
  });

  tbody.querySelectorAll(".btn-delete-hotel").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Delete this hotel from the catalog?")) {
        AppState.deleteHotel(id);
        showToast("Hotel removed from catalog.", "info");
      }
    });
  });

  if (!searchInput?.dataset.bound) {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("input", () => renderHotelsTable());
  }
}

function openAddHotelModal() {
  document.getElementById("modal-hotel-title").textContent = "Add Hotel / Resort";
  document.getElementById("hotel-id").value = "";
  document.getElementById("form-hotel").reset();
  document.getElementById("hotel-image").value = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
  document.getElementById("modal-hotel-overlay").classList.add("open");
}

function openEditHotelModal(h) {
  document.getElementById("modal-hotel-title").textContent = `Edit Hotel: ${h.name}`;
  document.getElementById("hotel-id").value = h.id;
  document.getElementById("hotel-name").value = h.name;
  document.getElementById("hotel-loc").value = h.location;
  document.getElementById("hotel-category").value = h.category || "luxury";
  document.getElementById("hotel-stars").value = h.starRating || 5;
  document.getElementById("hotel-price").value = h.pricePerNight;
  document.getElementById("hotel-image").value = h.image;
  document.getElementById("modal-hotel-overlay").classList.add("open");
}

/* =========================================================================
   9. COUPONS & PROMO CONTROLLER
   ========================================================================= */
function renderCouponsTable() {
  const tbody = document.getElementById("tbody-coupons");
  if (!tbody) return;

  const coupons = AppState.getCoupons();
  if (coupons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="tg-table-empty">No promo coupons configured yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = coupons.map(c => `
    <tr>
      <td><strong class="tg-cell-strong" style="color: var(--primary-teal); font-family: monospace; font-size: 0.95rem;">${c.code}</strong></td>
      <td>${c.description || ''}</td>
      <td><strong>${c.discountType === 'percent' ? `${c.discountValue}% (Up to ${formatINR(c.maxDiscount)})` : formatINR(c.discountValue)}</strong></td>
      <td>${formatINR(c.minOrder || 0)}</td>
      <td>${c.expiry || 'No Expiry'}</td>
      <td>${c.usageCount || 0} times</td>
      <td>
        <span class="tg-status-tag ${c.active ? 'active' : 'inactive'}" style="cursor: pointer;" data-toggle-coupon="${c.code}">
          ${c.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </td>
      <td>
        <div class="tg-table-actions">
          <button class="tg-btn-table-action danger btn-delete-coupon" data-code="${c.code}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-toggle-coupon]").forEach(el => {
    el.addEventListener("click", () => {
      const code = el.getAttribute("data-toggle-coupon");
      const coupon = AppState.getCoupons().find(c => c.code === code);
      if (coupon) {
        AppState.updateCoupon(code, { active: !coupon.active });
        showToast(`Promo ${code} is now ${!coupon.active ? 'ACTIVE' : 'INACTIVE'}.`, "info");
      }
    });
  });

  tbody.querySelectorAll(".btn-delete-coupon").forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-code");
      if (confirm(`Delete coupon code ${code}?`)) {
        AppState.deleteCoupon(code);
        showToast(`Coupon ${code} removed.`, "info");
      }
    });
  });
}

function openAddCouponModal() {
  document.getElementById("form-coupon").reset();
  document.getElementById("modal-coupon-overlay").classList.add("open");
}

/* =========================================================================
   10. CUSTOMERS CONTROLLER
   ========================================================================= */
function renderCustomersTable() {
  const tbody = document.getElementById("tbody-customers");
  if (!tbody) return;

  const customers = AppState.getCustomers();
  const searchInput = document.getElementById("search-customers");
  const query = (searchInput?.value || "").toLowerCase().trim();

  const filtered = customers.filter(c => !query ||
    c.name.toLowerCase().includes(query) ||
    c.email.toLowerCase().includes(query) ||
    c.city.toLowerCase().includes(query)
  );

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td>
        <strong class="tg-cell-strong">${c.name}</strong>
      </td>
      <td>
        <span>${c.email}</span>
        <span class="tg-cell-sub">${c.phone || ''}</span>
      </td>
      <td>${c.city || 'India'}</td>
      <td><span class="tg-status-tag ${c.role.includes('VIP') ? 'active' : 'info'}">${c.role}</span></td>
      <td>${c.bookingsCount || 0} Bookings</td>
      <td><strong class="tg-cell-strong">${formatINR(c.totalSpent || 0)}</strong></td>
      <td>
        <div class="tg-table-actions">
          <button class="tg-btn-table-action btn-toggle-vip" data-id="${c.id}">
            ${c.role.includes('VIP') ? 'Set Standard' : 'Promote VIP'}
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".btn-toggle-vip").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const customer = AppState.getCustomers().find(c => c.id === id);
      if (customer) {
        const nextRole = customer.role.includes('VIP') ? 'Customer' : 'VIP Customer';
        AppState.updateCustomer(id, { role: nextRole });
        showToast(`${customer.name} role changed to ${nextRole}.`, "success");
      }
    });
  });

  if (!searchInput?.dataset.bound) {
    searchInput.dataset.bound = "true";
    searchInput.addEventListener("input", () => renderCustomersTable());
  }
}

function openAddCustomerModal() {
  document.getElementById("cust-id").value = "";
  document.getElementById("form-customer").reset();
  document.getElementById("modal-customer-overlay").classList.add("open");
}

/* =========================================================================
   11. SYSTEM SETTINGS CONTROLLER & DATA SAFETY
   ========================================================================= */
function initSystemSettingsView() {
  const saveBannerBtn = document.getElementById("btn-save-banner-settings");
  const savePlatformBtn = document.getElementById("btn-save-platform-settings");
  const exportBtn = document.getElementById("btn-export-full-db");
  const importInput = document.getElementById("input-import-db");
  const resetBtn = document.getElementById("btn-reset-factory-defaults");
  const topExportBtn = document.getElementById("btn-quick-export-top");

  saveBannerBtn?.addEventListener("click", () => {
    const enabled = document.getElementById("setting-banner-enabled")?.checked;
    const text = document.getElementById("setting-banner-text")?.value.trim();
    const link = document.getElementById("setting-banner-link")?.value.trim() || "#destinations-section";

    const current = AppState.getSystemSettings();
    AppState.saveSystemSettings({
      ...current,
      bannerEnabled: enabled,
      bannerText: text,
      bannerLink: link
    });

    showToast("Announcement banner saved! Live site updated in real-time.", "success");
  });

  savePlatformBtn?.addEventListener("click", () => {
    const platformName = document.getElementById("setting-platform-name")?.value.trim();
    const supportEmail = document.getElementById("setting-support-email")?.value.trim();
    const supportPhone = document.getElementById("setting-support-phone")?.value.trim();
    const gstRate = parseFloat(document.getElementById("setting-gst-rate")?.value) || 5;

    const current = AppState.getSystemSettings();
    AppState.saveSystemSettings({
      ...current,
      platformName,
      supportEmail,
      supportPhone,
      convenienceGstPercent: gstRate
    });

    showToast("Platform configurations updated successfully.", "success");
  });

  const handleExport = () => {
    const data = AppState.exportFullDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `travelgo-database-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Full catalog & bookings backup downloaded (JSON).", "success");
  };

  exportBtn?.addEventListener("click", handleExport);
  topExportBtn?.addEventListener("click", handleExport);

  importInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        AppState.importFullDatabase(json);
        renderAllViews();
        showToast("Database successfully restored from JSON backup!", "success");
      } catch {
        showToast("Failed to parse JSON backup file.", "error");
      }
    };
    reader.readAsText(file);
  });

  resetBtn?.addEventListener("click", () => {
    if (confirm("⚠️ DANGER: Reset all destinations, cabs, trains, hotels, bookings, and coupons back to factory defaults? Any custom additions will be lost!")) {
      AppState.resetToFactoryDefaults();
      renderAllViews();
      showToast("System reset to original factory defaults.", "info");
    }
  });
}

function loadSystemSettingsValues() {
  const s = AppState.getSystemSettings();
  const bannerEnabled = document.getElementById("setting-banner-enabled");
  const bannerText = document.getElementById("setting-banner-text");
  const bannerLink = document.getElementById("setting-banner-link");
  const platformName = document.getElementById("setting-platform-name");
  const supportEmail = document.getElementById("setting-support-email");
  const supportPhone = document.getElementById("setting-support-phone");
  const gstRate = document.getElementById("setting-gst-rate");

  if (bannerEnabled) bannerEnabled.checked = !!s.bannerEnabled;
  if (bannerText) bannerText.value = s.bannerText || "";
  if (bannerLink) bannerLink.value = s.bannerLink || "#destinations-section";
  if (platformName) platformName.value = s.platformName || "TravelGo India";
  if (supportEmail) supportEmail.value = s.supportEmail || "support@travelgo.in";
  if (supportPhone) supportPhone.value = s.supportPhone || "+91 1800-419-8900";
  if (gstRate) gstRate.value = s.convenienceGstPercent || 5;
}

/* =========================================================================
   12. MODAL FORM HANDLERS (SUBMITS)
   ========================================================================= */
function initModals() {
  // Close Modals buttons
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tg-admin-modal-overlay").forEach(m => m.classList.remove("open"));
    });
  });

  // Close on backdrop click
  document.querySelectorAll(".tg-admin-modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });

  // Open triggers
  document.getElementById("btn-open-add-dest-modal")?.addEventListener("click", openAddDestinationModal);
  document.getElementById("btn-open-add-cab-modal")?.addEventListener("click", openAddCabModal);
  document.getElementById("btn-open-add-train-modal")?.addEventListener("click", openAddTrainModal);
  document.getElementById("btn-open-add-hotel-modal")?.addEventListener("click", openAddHotelModal);
  document.getElementById("btn-open-add-coupon-modal")?.addEventListener("click", openAddCouponModal);
  document.getElementById("btn-open-add-customer-modal")?.addEventListener("click", openAddCustomerModal);

  // Form: Destination Submit
  document.getElementById("form-dest")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("dest-id").value;
    const name = document.getElementById("dest-name").value.trim();
    const state = document.getElementById("dest-state").value.trim();
    const category = document.getElementById("dest-category").value;
    const startPrice = parseInt(document.getElementById("dest-price").value) || 4999;
    const tagline = document.getElementById("dest-tagline").value.trim();
    const duration = document.getElementById("dest-duration").value.trim() || "4 Days / 3 Nights";
    const badge = document.getElementById("dest-badge").value.trim();
    const bestTimeToVisit = document.getElementById("dest-best-time").value.trim() || "October to March";
    const weather = document.getElementById("dest-weather").value.trim() || "24°C Pleasant";
    const heroImage = document.getElementById("dest-image").value.trim();
    const description = document.getElementById("dest-description").value.trim();

    if (id) {
      AppState.updateDestination(id, {
        name, state, category, startPrice, tagline, duration, badge, bestTimeToVisit, weather, heroImage, description
      });
      showToast(`Destination ${name} updated!`, "success");
    } else {
      const newDest = {
        id: `dest-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
        name, state, category, startPrice, tagline, duration, badge: badge || "New",
        bestTimeToVisit, weather, heroImage, description,
        rating: 4.9, reviewsCount: 1, gallery: [heroImage]
      };
      AppState.addDestination(newDest);
      showToast(`Destination ${name} published to catalog!`, "success");
    }

    document.getElementById("modal-dest-overlay").classList.remove("open");
  });

  // Form: Cab Submit
  document.getElementById("form-cab")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("cab-id").value;
    const category = document.getElementById("cab-category").value.trim();
    const model = document.getElementById("cab-model").value.trim();
    const baseFare = parseInt(document.getElementById("cab-base-fare").value) || 999;
    const ratePerKm = parseInt(document.getElementById("cab-rate-km").value) || 12;
    const driverAllowance = parseInt(document.getElementById("cab-allowance").value) || 350;
    const capacity = document.getElementById("cab-capacity").value.trim() || "4 Seats";
    const badge = document.getElementById("cab-badge").value.trim();
    const etaMinutes = parseInt(document.getElementById("cab-eta").value) || 5;
    const image = document.getElementById("cab-image").value.trim() || "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=600&q=80";

    if (id) {
      AppState.updateCab(id, { category, model, baseFare, ratePerKm, driverAllowance, capacity, badge, etaMinutes, image });
      showToast(`Cab tier ${category} updated.`, "success");
    } else {
      const newCab = {
        id: `cab-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        category, model, baseFare, ratePerKm, driverAllowance, capacity,
        ac: "AC Guaranteed", rating: 4.85, etaMinutes, badge: badge || "Available",
        baseKm: 50, image, features: ["Sanitized cab", "Verified chauffeur partner"]
      };
      AppState.addCab(newCab);
      showToast(`Cab tier ${category} added to fleet!`, "success");
    }

    document.getElementById("modal-cab-overlay").classList.remove("open");
  });

  // Form: Train Submit
  document.getElementById("form-train")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("train-id").value;
    const number = document.getElementById("train-number").value.trim();
    const name = document.getElementById("train-name").value.trim();
    const type = document.getElementById("train-type").value.trim() || "Express";
    const duration = document.getElementById("train-duration").value.trim() || "6h 00m";
    const from = document.getElementById("train-from").value.trim();
    const to = document.getElementById("train-to").value.trim();
    const depTime = document.getElementById("train-dep").value.trim();
    const arrTime = document.getElementById("train-arr").value.trim();

    if (id) {
      AppState.updateTrain(id, { number, name, type, duration, from, to, depTime, arrTime });
      showToast(`Train ${number} updated.`, "success");
    } else {
      const newTrain = {
        id: `train-${number}`,
        number, name, type, duration, from, to, depTime, arrTime,
        runsOn: ["Daily"], pantry: "Catering Available", rating: 4.85,
        classes: [
          { code: "CC", name: "AC Chair Car", fare: 1250, status: "AVAILABLE - 50", color: "success" },
          { code: "EC", name: "Exec Chair Car", fare: 2400, status: "AVAILABLE - 16", color: "success" }
        ]
      };
      AppState.addTrain(newTrain);
      showToast(`Train ${number} added to schedule!`, "success");
    }

    document.getElementById("modal-train-overlay").classList.remove("open");
  });

  // Form: Hotel Submit
  document.getElementById("form-hotel")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("hotel-id").value;
    const name = document.getElementById("hotel-name").value.trim();
    const location = document.getElementById("hotel-loc").value.trim();
    const category = document.getElementById("hotel-category").value;
    const starRating = parseInt(document.getElementById("hotel-stars").value) || 5;
    const pricePerNight = parseInt(document.getElementById("hotel-price").value) || 7500;
    const image = document.getElementById("hotel-image").value.trim();

    if (id) {
      AppState.updateHotel(id, { name, location, category, starRating, pricePerNight, image });
      showToast(`Hotel ${name} updated.`, "success");
    } else {
      const newHotel = {
        id: `hotel-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name, location, category, starRating, pricePerNight, image,
        userRating: 4.9, reviewsCount: 12,
        amenities: ["Free High-Speed Wi-Fi", "Swimming Pool", "Complimentary Breakfast", "24x7 Room Dining"],
        roomTypes: [
          { name: "Deluxe Premium Room", price: pricePerNight, guests: "2 Adults" },
          { name: "Executive Luxury Suite", price: Math.round(pricePerNight * 1.6), guests: "2 Adults, 2 Children" }
        ]
      };
      AppState.addHotel(newHotel);
      showToast(`Hotel ${name} listed!`, "success");
    }

    document.getElementById("modal-hotel-overlay").classList.remove("open");
  });

  // Form: Coupon Submit
  document.getElementById("form-coupon")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("coupon-code").value.trim().toUpperCase();
    const discountType = document.getElementById("coupon-type").value;
    const discountValue = parseInt(document.getElementById("coupon-value").value) || 10;
    const maxDiscount = parseInt(document.getElementById("coupon-max").value) || 1000;
    const minOrder = parseInt(document.getElementById("coupon-min-order").value) || 1000;
    const expiry = document.getElementById("coupon-expiry").value || "2026-12-31";
    const description = document.getElementById("coupon-desc").value.trim();

    const newCoupon = {
      code, discountType, discountValue, maxDiscount, minOrder, expiry, description,
      active: true, usageCount: 0
    };

    AppState.addCoupon(newCoupon);
    showToast(`Coupon code ${code} created and activated!`, "success");
    document.getElementById("modal-coupon-overlay").classList.remove("open");
  });

  // Form: Customer Submit
  document.getElementById("form-customer")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("cust-name").value.trim();
    const email = document.getElementById("cust-email").value.trim();
    const phone = document.getElementById("cust-phone").value.trim() || "+91 98765 43210";
    const city = document.getElementById("cust-city").value.trim() || "India";
    const role = document.getElementById("cust-role").value;

    const newCustomer = {
      id: `usr_${Date.now()}`,
      name, email, phone, city, role,
      bookingsCount: 0, totalSpent: 0,
      joinedDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE"
    };

    AppState.addCustomer(newCustomer);
    showToast(`Customer ${name} profile saved!`, "success");
    document.getElementById("modal-customer-overlay").classList.remove("open");
  });

  // Manual Booking creation quick trigger
  document.getElementById("btn-new-custom-booking")?.addEventListener("click", () => {
    const bId = `TG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const manualBooking = {
      id: bId,
      type: "CAB",
      title: "Delhi NCR to Jaipur City Cab",
      subtitle: "Prime Sedan (Maruti Dzire)",
      pickup: "Connaught Place, New Delhi",
      drop: "Hawa Mahal, Jaipur",
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      time: "08:00 AM",
      amount: 3499,
      status: "CONFIRMED",
      passengers: [{ name: "Priya Nair", phone: "+91 98201 12345" }],
      driver: { name: "Satnam Singh", phone: "+91 98112 77443", carNo: "DL 02 B 9021", rating: 4.9 },
      createdAt: new Date().toISOString()
    };
    AppState.addBooking(manualBooking);
    showToast(`Manual booking ${bId} created!`, "success");
  });
}
