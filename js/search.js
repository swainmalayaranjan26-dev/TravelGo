// TravelGo - Search Tab Switcher & Autocomplete System
import { INDIAN_STATIONS } from "./data.js";
import { AppState, showToast } from "./state.js";

const POPULAR_SEARCH_SUGGESTIONS = [
  { label: "Goa", state: "Goa", type: "Beach & Nightlife", category: "beach" },
  { label: "Manali", state: "Himachal Pradesh", type: "Snow & Mountains", category: "hill-station" },
  { label: "Jaipur", state: "Rajasthan", type: "Palaces & Heritage", category: "heritage" },
  { label: "Kerala Backwaters", state: "Kerala", type: "Houseboats & Nature", category: "nature" },
  { label: "Varanasi", state: "Uttar Pradesh", type: "Spiritual Ghats", category: "spiritual" },
  { label: "Agra (Taj Mahal)", state: "Uttar Pradesh", type: "World Heritage", category: "heritage" },
  { label: "Leh Ladakh", state: "Ladakh", type: "High Altitude Passes", category: "hill-station" },
  { label: "Udaipur", state: "Rajasthan", type: "City of Lakes", category: "heritage" },
  { label: "Rishikesh", state: "Uttarakhand", type: "Yoga & Rafting", category: "nature" },
  { label: "New Delhi", state: "Delhi NCR", type: "Hub & Metro", category: "city" },
  { label: "Mumbai", state: "Maharashtra", type: "Financial Capital & Coast", category: "city" },
  { label: "Bengaluru", state: "Karnataka", type: "Silicon Valley & Gardens", category: "city" }
];

export function initSearchSystem() {
  const tabBtns = document.querySelectorAll(".tg-search-tab-btn");
  const tabPanels = document.querySelectorAll(".tg-search-panel");
  const searchInputs = document.querySelectorAll(".tg-autocomplete-input");

  // Tab switching with sliding active indicator
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById(`panel-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });

  // Autocomplete setup for inputs
  searchInputs.forEach(input => {
    setupAutocomplete(input);
  });

  // Populate default dates (tomorrow and 3 days later)
  setupDefaultDates();

  // Search Submit Actions
  setupSearchSubmissions();
}

function setupAutocomplete(input) {
  const dropdown = document.createElement("div");
  dropdown.className = "tg-autocomplete-dropdown";
  input.parentElement.style.position = "relative";
  input.parentElement.appendChild(dropdown);

  const isStationInput = input.classList.contains("station-input");

  const renderDropdown = (query = "") => {
    let items = [];
    if (isStationInput) {
      items = INDIAN_STATIONS.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) || 
        s.code.toLowerCase().includes(query.toLowerCase()) ||
        s.city.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      const dynamicDests = AppState.getDestinations().map(d => ({
        label: d.name,
        state: d.state,
        type: d.category ? d.category.toUpperCase() : "Destination",
        category: d.category
      }));
      const merged = [...dynamicDests, ...POPULAR_SEARCH_SUGGESTIONS];
      const seen = new Set();
      const unique = [];
      for (const item of merged) {
        const key = item.label.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      }
      items = unique.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.state.toLowerCase().includes(query.toLowerCase()) ||
        (item.type && item.type.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (items.length === 0) {
      dropdown.innerHTML = `<div class="tg-dropdown-empty">No matching places found</div>`;
      dropdown.classList.add("show");
      return;
    }

    dropdown.innerHTML = items.map(item => {
      if (isStationInput) {
        return `
          <div class="tg-dropdown-item" data-value="${item.name} (${item.code})">
            <span class="tg-dropdown-icon">🚆</span>
            <div class="tg-dropdown-text">
              <span class="tg-dropdown-title">${item.name} <strong class="station-code">(${item.code})</strong></span>
              <span class="tg-dropdown-sub">${item.city}</span>
            </div>
          </div>
        `;
      }
      return `
        <div class="tg-dropdown-item" data-value="${item.label}">
          <span class="tg-dropdown-icon">📍</span>
          <div class="tg-dropdown-text">
            <span class="tg-dropdown-title">${item.label}</span>
            <span class="tg-dropdown-sub">${item.state} • ${item.type}</span>
          </div>
        </div>
      `;
    }).join("");

    dropdown.classList.add("show");

    // Click handler for suggestion items
    dropdown.querySelectorAll(".tg-dropdown-item").forEach(el => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = el.getAttribute("data-value");
        dropdown.classList.remove("show");
      });
    });
  };

  input.addEventListener("focus", () => {
    renderDropdown(input.value.trim());
  });

  input.addEventListener("input", () => {
    renderDropdown(input.value.trim());
  });

  input.addEventListener("blur", () => {
    setTimeout(() => dropdown.classList.remove("show"), 200);
  });
}

function setupDefaultDates() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkout = new Date();
  checkout.setDate(checkout.getDate() + 4);

  const formatDate = (d) => d.toISOString().split("T")[0];

  document.querySelectorAll("input[type='date'].default-tomorrow").forEach(input => {
    input.value = formatDate(tomorrow);
    input.min = formatDate(new Date());
  });

  document.querySelectorAll("input[type='date'].default-checkout").forEach(input => {
    input.value = formatDate(checkout);
    input.min = formatDate(tomorrow);
  });
}

function setupSearchSubmissions() {
  // Hotel Search
  document.getElementById("btn-search-hotels")?.addEventListener("click", () => {
    const city = document.getElementById("hotel-search-dest")?.value.trim() || "India";
    showToast(`Searching premier hotels in ${city}...`, "info");
    const section = document.getElementById("hotels-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Cab Search
  document.getElementById("btn-search-cabs")?.addEventListener("click", () => {
    const pickup = document.getElementById("cab-search-pickup")?.value.trim() || "Pickup Location";
    const drop = document.getElementById("cab-search-drop")?.value.trim() || "Drop Location";
    showToast(`Finding available cabs from ${pickup} to ${drop}...`, "success");
    const section = document.getElementById("cabs-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Train Search
  document.getElementById("btn-search-trains")?.addEventListener("click", () => {
    const from = document.getElementById("train-search-from")?.value.trim() || "NDLS";
    const to = document.getElementById("train-search-to")?.value.trim() || "BSB";
    showToast(`Checking live Vande Bharat & Express trains from ${from} to ${to}...`, "info");
    const section = document.getElementById("trains-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Tour Search
  document.getElementById("btn-search-tours")?.addEventListener("click", () => {
    const dest = document.getElementById("tour-search-dest")?.value.trim() || "All India";
    showToast(`Curating customized holiday itineraries for ${dest}...`, "success");
    const section = document.getElementById("destinations-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  });
}
