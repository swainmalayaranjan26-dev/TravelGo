// TravelGo - Payment Checkout & Digital E-Ticket Generator
import { AppState, formatINR, showToast } from "./state.js";

let activeOrder = null;
let appliedDiscount = 0;

export function openPaymentCheckout(order) {
  activeOrder = order;
  appliedDiscount = 0;

  const modal = document.getElementById("checkout-modal");
  const modalContent = document.getElementById("checkout-modal-content");
  if (!modal || !modalContent) return;

  const user = AppState.getUser();

  renderCheckoutUI(modalContent, user);
  modal.classList.add("show");
}

function renderCheckoutUI(container, user) {
  const baseAmount = activeOrder.amount;
  const gst = Math.round(baseAmount * 0.05);
  const discountAmount = Math.round(baseAmount * appliedDiscount);
  const finalPayable = Math.max(0, baseAmount + gst - discountAmount);

  container.innerHTML = `
    <div class="tg-checkout-layout">
      <!-- Left Column: Passenger & Payment Options -->
      <div class="tg-checkout-main">
        <div class="tg-checkout-section-title">
          <span>1. Passenger / Lead Traveler Details</span>
        </div>
        <form id="tg-checkout-guest-form" class="tg-form-grid">
          <div class="tg-form-group">
            <label>Full Name</label>
            <input type="text" id="traveler-name" class="tg-input" required value="${user?.name || ''}" placeholder="e.g. Rahul Sharma" />
          </div>
          <div class="tg-form-group">
            <label>Email Address</label>
            <input type="email" id="traveler-email" class="tg-input" required value="${user?.email || ''}" placeholder="e.g. yourname@example.com" />
          </div>
          <div class="tg-form-group">
            <label>Phone Number (WhatsApp updates) *</label>
            <input type="tel" id="traveler-phone" class="tg-input" required value="${user?.phone || ''}" placeholder="e.g. +91 98765 43210" />
          </div>
          <div class="tg-form-group">
            <label>Special Note / Pickup Landmark</label>
            <input type="text" id="traveler-note" class="tg-input" placeholder="e.g. Near Terminal 3 Gate 4" />
          </div>
        </form>

        <div class="tg-checkout-section-title" style="margin-top: 24px;">
          <span>2. Select Payment Method</span>
          <span class="tg-secure-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 256-Bit SSL Encrypted</span>
        </div>

        <div class="tg-payment-methods">
          <div class="tg-payment-tab active" data-method="upi">
            <span class="tg-pay-radio"></span>
            <div class="tg-pay-info">
              <strong>UPI (Instant 0% Fee)</strong>
              <span>Google Pay, PhonePe, Paytm, BHIM QR</span>
            </div>
          </div>
          <div class="tg-payment-tab" data-method="card">
            <span class="tg-pay-radio"></span>
            <div class="tg-pay-info">
              <strong>Credit / Debit Card</strong>
              <span>Visa, Mastercard, RuPay, Amex</span>
            </div>
          </div>
          <div class="tg-payment-tab" data-method="netbanking">
            <span class="tg-pay-radio"></span>
            <div class="tg-pay-info">
              <strong>Net Banking</strong>
              <span>All major Indian Banks supported</span>
            </div>
          </div>
        </div>

        <!-- Dynamic Payment Forms -->
        <div id="payment-panel-upi" class="tg-payment-panel active">
          <div class="tg-upi-container">
            <div class="tg-qr-box">
              <div class="tg-qr-code">
                <!-- SVG simulated high-precision QR Code -->
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <rect width="120" height="120" fill="#ffffff" rx="8"/>
                  <rect x="10" y="10" width="30" height="30" fill="#0B132B" rx="4"/>
                  <rect x="15" y="15" width="20" height="20" fill="#ffffff"/>
                  <rect x="19" y="19" width="12" height="12" fill="#0D9488"/>
                  
                  <rect x="80" y="10" width="30" height="30" fill="#0B132B" rx="4"/>
                  <rect x="85" y="15" width="20" height="20" fill="#ffffff"/>
                  <rect x="89" y="19" width="12" height="12" fill="#0D9488"/>

                  <rect x="10" y="80" width="30" height="30" fill="#0B132B" rx="4"/>
                  <rect x="15" y="85" width="20" height="20" fill="#ffffff"/>
                  <rect x="19" y="89" width="12" height="12" fill="#0D9488"/>

                  <!-- Data dots -->
                  <circle cx="55" cy="25" r="4" fill="#0B132B"/>
                  <circle cx="65" cy="25" r="4" fill="#0B132B"/>
                  <circle cx="50" cy="55" r="5" fill="#0D9488"/>
                  <circle cx="70" cy="55" r="4" fill="#0B132B"/>
                  <circle cx="55" cy="75" r="4" fill="#0B132B"/>
                  <circle cx="65" cy="95" r="5" fill="#0D9488"/>
                  <circle cx="95" cy="75" r="4" fill="#0B132B"/>
                  <circle cx="95" cy="95" r="4" fill="#0B132B"/>
                </svg>
              </div>
              <div class="tg-qr-desc">
                <strong>Scan & Pay via any UPI App</strong>
                <p>Scan with GPay, PhonePe, or Paytm for 1-tap instant approval.</p>
                <div class="tg-upi-id-badge">travelgo@icici</div>
              </div>
            </div>
            <div class="tg-divider-text">OR ENTER UPI ID</div>
            <div class="tg-input-action-group">
              <input type="text" id="upi-vpa-input" class="tg-input" placeholder="mobile@upi or user@okhdfcbank" />
              <button type="button" id="btn-verify-upi" class="tg-btn tg-btn-secondary">Verify</button>
            </div>
          </div>
        </div>

        <div id="payment-panel-card" class="tg-payment-panel">
          <div class="tg-form-grid">
            <div class="tg-form-group span-2">
              <label>Card Number</label>
              <input type="text" id="card-number" class="tg-input" placeholder="4111 2222 3333 4444" maxlength="19" />
            </div>
            <div class="tg-form-group">
              <label>Expiry Date (MM/YY)</label>
              <input type="text" id="card-expiry" class="tg-input" placeholder="12/28" maxlength="5" />
            </div>
            <div class="tg-form-group">
              <label>CVV / CVC</label>
              <input type="password" id="card-cvv" class="tg-input" placeholder="•••" maxlength="4" />
            </div>
            <div class="tg-form-group span-2">
              <label>Cardholder Name</label>
              <input type="text" id="card-name" class="tg-input" placeholder="e.g. RAHUL SHARMA" />
            </div>
          </div>
        </div>

        <div id="payment-panel-netbanking" class="tg-payment-panel">
          <p class="tg-small-muted" style="margin-bottom: 12px;">Select your bank to proceed with secure NetBanking login:</p>
          <div class="tg-banks-grid">
            <label class="tg-bank-item active"><input type="radio" name="bank" checked /> HDFC Bank</label>
            <label class="tg-bank-item"><input type="radio" name="bank" /> State Bank of India</label>
            <label class="tg-bank-item"><input type="radio" name="bank" /> ICICI Bank</label>
            <label class="tg-bank-item"><input type="radio" name="bank" /> Axis Bank</label>
            <label class="tg-bank-item"><input type="radio" name="bank" /> Kotak Mahindra</label>
            <label class="tg-bank-item"><input type="radio" name="bank" /> Punjab National Bank</label>
          </div>
        </div>
      </div>

      <!-- Right Column: Order Summary & Pay Action -->
      <div class="tg-checkout-summary">
        <div class="tg-summary-card">
          <div class="tg-summary-header">
            <span class="tg-summary-tag">${activeOrder.type}</span>
            <h4>${activeOrder.title}</h4>
            <p class="tg-summary-subtitle">${activeOrder.subtitle || ''}</p>
          </div>

          <div class="tg-summary-details">
            ${activeOrder.from && activeOrder.to ? `
              <div class="tg-sum-row">
                <span class="tg-sum-label">Route</span>
                <span class="tg-sum-val">${activeOrder.from} → ${activeOrder.to}</span>
              </div>
            ` : ''}
            ${activeOrder.pickup && activeOrder.drop ? `
              <div class="tg-sum-row">
                <span class="tg-sum-label">Pickup & Drop</span>
                <span class="tg-sum-val">${activeOrder.pickup} to ${activeOrder.drop}</span>
              </div>
            ` : ''}
            ${activeOrder.date ? `
              <div class="tg-sum-row">
                <span class="tg-sum-label">Date & Time</span>
                <span class="tg-sum-val">${activeOrder.date} ${activeOrder.time || ''}</span>
              </div>
            ` : ''}
            ${activeOrder.duration ? `
              <div class="tg-sum-row">
                <span class="tg-sum-label">Duration</span>
                <span class="tg-sum-val">${activeOrder.duration}</span>
              </div>
            ` : ''}
          </div>

          <!-- Promo Code Box -->
          <div class="tg-promo-section">
            <label>Have a Promo Code?</label>
            <div class="tg-promo-input-row">
              <input type="text" id="promo-code-input" placeholder="e.g. EXPLOREINDIA" />
              <button type="button" id="btn-apply-promo" class="tg-btn tg-btn-sm tg-btn-secondary">Apply</button>
            </div>
            <div class="tg-promo-hints">
              <span class="tg-promo-badge-pill" data-code="EXPLOREINDIA">EXPLOREINDIA (15% OFF)</span>
              <span class="tg-promo-badge-pill" data-code="FIRSTTRIP">FIRSTTRIP (10% OFF)</span>
            </div>
            <div id="promo-status-msg" class="tg-promo-msg"></div>
          </div>

          <!-- Fare Breakdown -->
          <div class="tg-fare-breakdown">
            <div class="tg-fare-row">
              <span>Base Fare</span>
              <span id="fare-base">${formatINR(baseAmount)}</span>
            </div>
            <div class="tg-fare-row">
              <span>GST & Tourism Taxes (5%)</span>
              <span id="fare-gst">${formatINR(gst)}</span>
            </div>
            <div class="tg-fare-row tg-fare-discount" id="fare-discount-row" style="${appliedDiscount > 0 ? '' : 'display:none;'}">
              <span>Special Promo Discount</span>
              <span id="fare-discount">-${formatINR(discountAmount)}</span>
            </div>
            <div class="tg-fare-divider"></div>
            <div class="tg-fare-total-row">
              <span>Total Payable</span>
              <strong id="fare-total">${formatINR(finalPayable)}</strong>
            </div>
          </div>

          <button type="button" id="btn-confirm-pay" class="tg-btn tg-btn-primary tg-btn-block tg-btn-pay">
            <span class="tg-pay-btn-text">Pay ${formatINR(finalPayable)} & Confirm</span>
            <span class="tg-pay-btn-spinner" style="display: none;">
              <svg class="tg-spinner" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg> Processing...
            </span>
          </button>

          <p class="tg-cancellation-notice">
            🛡️ <strong>Free Cancellation</strong> up to 6 hours before departure. 100% money back guaranteed.
          </p>
        </div>
      </div>
    </div>
  `;

  setupCheckoutEvents(finalPayable);
}

function setupCheckoutEvents() {
  // Method switching
  const tabs = document.querySelectorAll(".tg-payment-tab");
  const panels = document.querySelectorAll(".tg-payment-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const method = tab.getAttribute("data-method");
      document.getElementById(`payment-panel-${method}`)?.classList.add("active");
    });
  });

  // Promo code pills quick fill
  document.querySelectorAll(".tg-promo-badge-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const codeInput = document.getElementById("promo-code-input");
      if (codeInput) {
        codeInput.value = pill.getAttribute("data-code");
        document.getElementById("btn-apply-promo")?.click();
      }
    });
  });

  // Apply promo code logic
  document.getElementById("btn-apply-promo")?.addEventListener("click", () => {
    const code = document.getElementById("promo-code-input")?.value.trim().toUpperCase();
    const statusMsg = document.getElementById("promo-status-msg");
    if (!code) return;

    if (code === "EXPLOREINDIA") {
      appliedDiscount = 0.15;
      statusMsg.className = "tg-promo-msg success";
      statusMsg.textContent = "🎉 'EXPLOREINDIA' applied! 15% discount deducted.";
    } else if (code === "FIRSTTRIP") {
      appliedDiscount = 0.10;
      statusMsg.className = "tg-promo-msg success";
      statusMsg.textContent = "🎉 'FIRSTTRIP' applied! 10% discount deducted.";
    } else if (code === "VANDEBHARAT") {
      appliedDiscount = 0.12;
      statusMsg.className = "tg-promo-msg success";
      statusMsg.textContent = "🚆 'VANDEBHARAT' applied! 12% discount deducted.";
    } else {
      appliedDiscount = 0;
      statusMsg.className = "tg-promo-msg error";
      statusMsg.textContent = "❌ Invalid coupon code. Try EXPLOREINDIA or FIRSTTRIP.";
    }

    updateFareBreakdown();
  });

  // Verify UPI input
  document.getElementById("btn-verify-upi")?.addEventListener("click", () => {
    const vpa = document.getElementById("upi-vpa-input")?.value.trim();
    if (!vpa || !vpa.includes("@")) {
      showToast("Please enter a valid UPI ID (e.g. yourname@oksbi)", "error");
      return;
    }
    showToast(`UPI ID ${vpa} verified successfully! Click Pay to approve.`, "success");
  });

  // Card formatting
  const cardInput = document.getElementById("card-number");
  cardInput?.addEventListener("input", (e) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val.replace(/(.{4})/g, "$1 ").trim();
    e.target.value = val.substring(0, 19);
  });

  // Confirm Pay button action
  document.getElementById("btn-confirm-pay")?.addEventListener("click", () => {
    executePaymentProcess();
  });
}

function updateFareBreakdown() {
  const baseAmount = activeOrder.amount;
  const gst = Math.round(baseAmount * 0.05);
  const discountAmount = Math.round(baseAmount * appliedDiscount);
  const finalPayable = Math.max(0, baseAmount + gst - discountAmount);

  const discountRow = document.getElementById("fare-discount-row");
  const discountEl = document.getElementById("fare-discount");
  const totalEl = document.getElementById("fare-total");
  const payBtnText = document.querySelector(".tg-pay-btn-text");

  if (discountRow && discountEl) {
    if (appliedDiscount > 0) {
      discountRow.style.display = "flex";
      discountEl.textContent = `-${formatINR(discountAmount)}`;
    } else {
      discountRow.style.display = "none";
    }
  }

  if (totalEl) totalEl.textContent = formatINR(finalPayable);
  if (payBtnText) payBtnText.textContent = `Pay ${formatINR(finalPayable)} & Confirm`;
}

function executePaymentProcess() {
  const guestName = document.getElementById("traveler-name")?.value.trim() || "Traveler";
  const guestEmail = document.getElementById("traveler-email")?.value.trim() || "traveler@example.com";
  const guestPhone = document.getElementById("traveler-phone")?.value.trim() || "+91 98765 43210";

  const btn = document.getElementById("btn-confirm-pay");
  const btnText = btn?.querySelector(".tg-pay-btn-text");
  const btnSpinner = btn?.querySelector(".tg-pay-btn-spinner");

  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = "none";
  if (btnSpinner) btnSpinner.style.display = "inline-flex";

  // Simulate payment gateway handshake (Razorpay / UPI Intent)
  setTimeout(() => {
    const baseAmount = activeOrder.amount;
    const gst = Math.round(baseAmount * 0.05);
    const discountAmount = Math.round(baseAmount * appliedDiscount);
    const finalPaid = Math.max(0, baseAmount + gst - discountAmount);

    const bookingId = `TG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const pnr = activeOrder.type === "TRAIN" ? `${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000000 + Math.random() * 9000000)}` : null;

    const confirmedBooking = {
      id: bookingId,
      pnr: pnr,
      type: activeOrder.type,
      title: activeOrder.title,
      subtitle: activeOrder.subtitle || "",
      from: activeOrder.from || activeOrder.pickup || "",
      to: activeOrder.to || activeOrder.drop || "",
      pickup: activeOrder.pickup,
      drop: activeOrder.drop,
      date: activeOrder.date || new Date().toISOString().split("T")[0],
      time: activeOrder.time || "10:00 AM",
      duration: activeOrder.duration || "",
      amount: finalPaid,
      status: "CONFIRMED",
      passengers: [{ name: guestName, email: guestEmail, phone: guestPhone }],
      driver: activeOrder.type === "CAB" ? {
        name: "Mukesh Kumar",
        phone: "+91 98112 34567",
        carNo: "DL 03 CA 5129",
        model: activeOrder.subtitle,
        rating: 4.92
      } : null,
      hotelDetails: activeOrder.type === "HOTEL" ? {
        room: activeOrder.subtitle,
        checkInTime: "02:00 PM",
        checkOutTime: "11:00 AM"
      } : null,
      createdAt: new Date().toISOString()
    };

    // Save to global state & local storage
    AppState.addBooking(confirmedBooking);

    // Close checkout modal
    document.getElementById("checkout-modal")?.classList.remove("show");

    // Reset button
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = "inline";
    if (btnSpinner) btnSpinner.style.display = "none";

    showToast(`Booking Successful! Your ID: ${bookingId}`, "success");

    // Show Printable E-Ticket Voucher Modal
    openVoucherModal(confirmedBooking);
  }, 1600);
}

export function openVoucherModal(booking) {
  const modal = document.getElementById("voucher-modal");
  const modalContent = document.getElementById("voucher-modal-content");
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="tg-voucher-card" id="printable-voucher">
      <div class="tg-voucher-header">
        <div class="tg-voucher-brand">
          <div class="tg-logo-mark">TG</div>
          <div>
            <h3>TravelGo E-Ticket & Confirmation Voucher</h3>
            <p>Official Travel Partner • Govt. Verified IRCTC & Tourism Aggregator</p>
          </div>
        </div>
        <div class="tg-voucher-status-pill">CONFIRMED</div>
      </div>

      <div class="tg-voucher-body">
        <div class="tg-voucher-meta-grid">
          <div class="tg-vmeta-item">
            <label>Booking Reference ID</label>
            <strong>${booking.id}</strong>
          </div>
          ${booking.pnr ? `
            <div class="tg-vmeta-item highlight">
              <label>IRCTC PNR Number</label>
              <strong>${booking.pnr}</strong>
            </div>
          ` : ''}
          <div class="tg-vmeta-item">
            <label>Booking Date</label>
            <strong>${new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
          </div>
          <div class="tg-vmeta-item">
            <label>Total Fare Paid</label>
            <strong>${formatINR(booking.amount)} (All Taxes Incl.)</strong>
          </div>
        </div>

        <div class="tg-voucher-service-block">
          <div class="tg-vs-icon">
            ${booking.type === 'CAB' ? '🚗' : booking.type === 'TRAIN' ? '🚆' : booking.type === 'HOTEL' ? '🏨' : '🗺️'}
          </div>
          <div class="tg-vs-info">
            <h4>${booking.title}</h4>
            <p class="tg-vs-sub">${booking.subtitle}</p>
            ${booking.from && booking.to ? `<p class="tg-vs-route"><strong>Route:</strong> ${booking.from} ➔ ${booking.to}</p>` : ''}
            <p class="tg-vs-time"><strong>Departure / Check-in:</strong> ${booking.date} at ${booking.time}</p>
          </div>
        </div>

        <!-- Passenger & Driver/Hotel Grid -->
        <div class="tg-voucher-split-grid">
          <div class="tg-vsplit-col">
            <h5>Lead Passenger</h5>
            <div class="tg-vdetail-box">
              <p><strong>Name:</strong> ${booking.passengers?.[0]?.name || 'Traveler'}</p>
              <p><strong>Phone:</strong> ${booking.passengers?.[0]?.phone || 'N/A'}</p>
              <p><strong>Email:</strong> ${booking.passengers?.[0]?.email || 'N/A'}</p>
            </div>
          </div>

          <div class="tg-vsplit-col">
            <h5>${booking.type === 'CAB' ? 'Assigned Driver & Vehicle' : booking.type === 'TRAIN' ? 'Train Coach Info' : 'Stay Guidelines'}</h5>
            <div class="tg-vdetail-box">
              ${booking.driver ? `
                <p><strong>Driver:</strong> ${booking.driver.name} (★ ${booking.driver.rating})</p>
                <p><strong>Vehicle No:</strong> ${booking.driver.carNo}</p>
                <p><strong>Contact:</strong> ${booking.driver.phone}</p>
              ` : booking.type === 'TRAIN' ? `
                <p><strong>Class:</strong> AC Chair / Sleeper</p>
                <p><strong>Status:</strong> Confirmed Berth</p>
                <p><strong>Platform Info:</strong> Sent via SMS 2 hrs prior</p>
              ` : `
                <p><strong>Check-in:</strong> 02:00 PM</p>
                <p><strong>ID Required:</strong> Aadhaar / Passport</p>
                <p><strong>Breakfast:</strong> Complimentary Buffet</p>
              `}
            </div>
          </div>
        </div>

        <!-- Barcode & QR Stamp -->
        <div class="tg-voucher-barcode-row">
          <div class="tg-voucher-qr">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <rect width="80" height="80" fill="#ffffff"/>
              <rect x="5" y="5" width="22" height="22" fill="#0B132B"/>
              <rect x="8" y="8" width="16" height="16" fill="#ffffff"/>
              <rect x="11" y="11" width="10" height="10" fill="#0D9488"/>
              <rect x="53" y="5" width="22" height="22" fill="#0B132B"/>
              <rect x="56" y="8" width="16" height="16" fill="#ffffff"/>
              <rect x="59" y="11" width="10" height="10" fill="#0D9488"/>
              <rect x="5" y="53" width="22" height="22" fill="#0B132B"/>
              <rect x="8" y="56" width="16" height="16" fill="#ffffff"/>
              <rect x="11" y="59" width="10" height="10" fill="#0D9488"/>
              <circle cx="40" cy="40" r="6" fill="#F97316"/>
            </svg>
            <span>Scan to Verify on TravelGo</span>
          </div>
          <div class="tg-voucher-notes">
            <h6>Important Journey Instructions:</h6>
            <ul>
              <li>Please carry a valid government-issued photo ID (Aadhaar / Passport / Voter ID).</li>
              <li>For cabs, complimentary waiting time is 20 minutes at pickup location.</li>
              <li>24x7 Traveler Helpline: <strong>+91 1800-266-9090</strong> (Toll Free)</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="tg-voucher-actions">
        <button type="button" class="tg-btn tg-btn-secondary" onclick="window.print()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print / Save PDF
        </button>
        <button type="button" id="btn-voucher-view-trips" class="tg-btn tg-btn-primary">
          View in My Trips
        </button>
      </div>
    </div>
  `;

  document.getElementById("btn-voucher-view-trips")?.addEventListener("click", () => {
    modal.classList.remove("show");
    window.dispatchEvent(new CustomEvent("travelgo:open-trips-drawer"));
  });

  modal.classList.add("show");
}
