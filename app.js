// === 5Spice Mira Road – Category-based Menu App ===

let cart = {};
let allProducts = [];

// ✅ Final 5Spice Mira Road categories with round icon images
const categories = [
  { name: "5 Spice Special", icon: "5spice-special.png" },
  { name: "Veg Noodles", icon: "veg-noodles.png" },
  { name: "Chicken Noodles", icon: "chicken-noodles.png" },
  { name: "Chicken Starters", icon: "chicken-starters.png" },
  { name: "Veg Starters", icon: "veg-starters.png" },
  { name: "Paneer Starters", icon: "paneer-starters.png" },
  { name: "Fish Starters", icon: "fish-starters.png" },
  { name: "Prawns Starters", icon: "prawns-starters.png" }, // 🦐 New placeholder
  { name: "Veg Fried Rice", icon: "veg-fried-rice.png" },
  { name: "Chicken Fried Rice", icon: "chicken-fried-rice.png" },
  { name: "Veg Main Course Gravy", icon: "veg-gravy.png" },
  { name: "Chicken Main Course Gravy", icon: "chicken-gravy.png" },
  { name: "Fish Main Course Gravy", icon: "fish-gravy.png" },
  { name: "Prawns Main Course Gravy", icon: "prawns-gravy.png" }, // 🦐 New placeholder
  { name: "Veg Soups", icon: "veg-soup.png" },
  { name: "Chicken Soups", icon: "chicken-soup.png" }
];

// === 5Spice Mira Road – Discount + GST Setup ===

// GST % (change here anytime)
const GST_RATE = 5;

// Category-wise discounts (%)
const categoryDiscounts = {
  "5 Spice Special": 0,
  "Veg Noodles": 10,
  "Chicken Noodles": 15,
  "Veg Starters": 10,
  "Paneer Starters": 5,
  "Chicken Starters": 15,
  "Fish Starters": 20,
  "Prawns Starters": 20,
  "Veg Fried Rice": 10,
  "Chicken Fried Rice": 15,
  "Veg Main Course Gravy": 10,
  "Chicken Main Course Gravy": 15,
  "Fish Main Course Gravy": 20,
  "Prawns Main Course Gravy": 20,
  "Veg Soups": 10,
  "Chicken Soups": 15
};

// === Get discounted price per item ===
function getDiscountedPrice(item) {
  const categoryDiscount = categoryDiscounts[item.category] || 0;
  const discountAmount = item.price * categoryDiscount / 100;
  return Math.round(item.price - discountAmount);
}

function calculateCartTotals(cart) {
  let subtotal = 0;          // after discount
  let totalDiscount = 0;     // total discount
  let originalTotal = 0;     // original price before discount

  for (const itemName in cart) {
    const item = cart[itemName];
    const discountRate = categoryDiscounts[item.category] || 0;
    const discountAmount = item.price * discountRate / 100;
    const discountedPrice = item.price - discountAmount;

    originalTotal += item.price * item.qty;
    subtotal += discountedPrice * item.qty;
    totalDiscount += discountAmount * item.qty;
  }

  const gstAmount = Math.round(subtotal * GST_RATE / 100);
  const grandTotal = subtotal + gstAmount;

  return { originalTotal, subtotal, totalDiscount, gstAmount, grandTotal };
}

// === 5Spice Mira Road – Update Slide Cart Totals ===
function updateCartSummary(cart) {
  const totals = calculateCartTotals(cart);
  const itemCount = Object.values(cart).reduce((n, i) => n + i.qty, 0);

  // ✅ Safely update all fields in slide cart
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  };

  setText("cart-subtotal", totals.originalTotal);
  setText("cart-discount", totals.totalDiscount);
  setText("cart-gst", totals.gstAmount);
  setText("cart-total", totals.grandTotal);
  setText("cart-count-text", itemCount);

  // ✅ Optional: Update top header cart icon badge (if exists)
  const cartBadge = document.getElementById("cart-count-desktop");
  if (cartBadge) cartBadge.innerText = itemCount;
}

// ------------- View Helpers (your existing code continues) -------------
function showCategoriesView() {
  document.getElementById("menu-section").classList.add("hidden");
  document.getElementById("category-section").classList.remove("hidden");
}

/* ---------- View Helpers (FIXED) ---------- */
function showCategoriesView() {
  document.getElementById("menu-section").classList.add("hidden");
  document.getElementById("category-section").classList.remove("hidden");

  const homeBtn = document.getElementById("home-floating-btn");
  if (homeBtn) homeBtn.classList.add("hidden"); // ✅ safe null check
}

function showProductsView() {
  document.getElementById("category-section").classList.add("hidden");
  document.getElementById("menu-section").classList.remove("hidden");

  const homeBtn = document.getElementById("home-floating-btn");
  if (homeBtn) homeBtn.classList.remove("hidden"); // ✅ safe null check
}

/* ---------- Fetch Products (FIXED) ---------- */
function renderForCategory(categoryName) {
  // ✅ Use helper instead of manual display toggle
  showProductsView();

  // update heading
  document.getElementById("menu-heading").textContent = categoryName;

  // fetch and render products
  fetch("menu.json")
    .then(res => res.json())
    .then(data => {
      allProducts = data.filter(item => item.category === categoryName);
      renderProducts();
    });
}

/* ---------- App Init with Cinematic Splash ---------- */
window.addEventListener("DOMContentLoaded", async () => {
  // ===== Load Menu Data =====
  try {
    const prodRes = await fetch("menu.json");
    const prodData = await prodRes.json();
    allProducts = prodData;
  } catch (e) {
    console.error("menu.json load error", e);
  }

  // ===== 🎬 Cinematic Splash =====
  const splash = document.getElementById("splash");
  const splashDuration = 2000; // 2 seconds

  if (splash) {
    setTimeout(() => {
      splash.style.transition = "opacity 0.8s ease-out";
      splash.style.opacity = "0";
      setTimeout(() => {
        splash.style.display = "none";
        splash.remove(); // Cleanly remove from DOM after fade
      }, 800);
    }, splashDuration);
  }

  // ===== Initialize App =====
  displayCategories();

  // Restore saved cart
  const savedCart = localStorage.getItem("5spiceCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCart();
  }

  // Setup cart & buttons
  setupCartButtons();

  // Manage browser history
  if (!history.state) {
    history.replaceState({ view: "categories" }, "", location.pathname);
  }

  // Check URL hash for category
  const hashCat = decodeURIComponent(location.hash.replace("#", ""));
  if (hashCat) {
    openCategory(hashCat);
  } else {
    showCategoriesView();
  }
});

// ===== Floating Home Button (unchanged) =====
document.getElementById("home-floating-btn").onclick = () => history.back();

/* ---------- Categories Grid ---------- */
function displayCategories() {
  const section = document.getElementById("category-section");
  section.innerHTML = "";
  categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "category-card";
    div.innerHTML = `
      <img src="images/${cat.icon}" class="category-icon" alt="${cat.name}">
      <p class="category-label">${cat.name}</p>
    `;
    div.onclick = () => openCategory(cat.name);
    section.appendChild(div);
  });
}

/* ---------- Category Open ---------- */
function openCategory(categoryName) {
  history.pushState({ view: "products", cat: categoryName }, "", `#${encodeURIComponent(categoryName)}`);
  showProductsView();
  renderForCategory(categoryName);
}

/* ---------- Product Render ---------- */
function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  allProducts.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-details">
        <h3>${product.name}</h3>
        <p>${product.description || ""}</p>
        <p>₹${product.price}</p>
      </div>
      <div>
       <img src="images/${product.image || 'coming-soon.png'}" 
     alt="${product.name}" 
     class="product-img"
     onclick="openPreview('${product.name.replace(/'/g, "\\'")}')" 
     onerror="this.src='images/coming-soon.png'">
<div class="quantity-buttons">
  <button onclick="changeQty('${product.name.replace(/'/g, "\\'")}', -1)">➖</button>
  <span>${cart[product.name]?.qty || 0}</span>
  <button onclick="changeQty('${product.name.replace(/'/g, "\\'")}', 1)">➕</button>
</div>
</div>`;
    list.appendChild(card);
  });
}

/* ---------- Cart Functions ---------- */
function changeQty(name, delta) {
  const item = allProducts.find(p => p.name === name) || Object.values(cart).find(p => p.name === name);
  if (!item) return;

  if (!cart[name]) cart[name] = { ...item, qty: 0 };
  cart[name].qty += delta;
  if (cart[name].qty <= 0) delete cart[name];

  updateCart();
  localStorage.setItem("5spiceCart", JSON.stringify(cart));

  if (!document.getElementById("menu-section").classList.contains("hidden")) renderProducts();
}

function updateCart() {
  const itemsDiv = document.getElementById("cart-items");
  const totalSpan = document.getElementById("cart-total");
  const cartBar = document.getElementById("view-cart-bar");
  const cartText = document.getElementById("cart-bar-text");
  const desktopCount = document.getElementById("cart-count-desktop");
  const itemCountText = document.getElementById("cart-count-text");

  let total = 0, count = 0;
  itemsDiv.innerHTML = "";

  // === Loop through cart items ===
  for (let key in cart) {
    const item = cart[key];
    count += item.qty;

    // ✅ Show actual menu price (no discount on item line)
    const lineTotal = item.price * item.qty;
    total += lineTotal;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-text">
        ${item.name} × ${item.qty} = ₹${lineTotal}
      </div>
      <button class="remove-btn" onclick="changeQty('${item.name.replace(/'/g, "\\'")}', -1)">❌</button>
    `;
    itemsDiv.appendChild(div);
  }

  // === Apply GST and Discount calculations ===
  const totals = calculateCartTotals(cart);

  // ✅ Update totals in slide cart
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  };

  // ✅ Show original total before discount (not subtotal)
  setText("cart-subtotal", totals.originalTotal);

  // ✅ Discount, GST, and final grand total remain same
  setText("cart-discount", totals.totalDiscount);
  setText("cart-gst", totals.gstAmount);
  setText("cart-total", totals.grandTotal);
  setText("cart-count-text", count);

  // ✅ Update cart bar & header counter
  totalSpan.textContent = totals.grandTotal;
  cartText.textContent = `${count} item${count !== 1 ? "s" : ""} added`;
  desktopCount.textContent = count;

  // ✅ Show or hide cart bar based on count
  cartBar.classList.toggle("active", count > 0);
}

/* ---------- Buttons & Checkout ---------- */
function setupCartButtons() {
  document.getElementById("desktop-cart-btn").onclick = () => document.getElementById("cart-panel").classList.add("active");
  document.getElementById("view-cart-btn").onclick = () => document.getElementById("cart-panel").classList.add("active");
  document.getElementById("close-cart").onclick = () => document.getElementById("cart-panel").classList.remove("active");
  document.getElementById("clear-cart").onclick = () => {
    cart = {}; localStorage.removeItem("5spiceCart"); updateCart(); renderProducts();
  };
  document.getElementById("back-to-categories").onclick = () => history.back();

  document.getElementById("whatsapp-order").onclick = () => {
    const name = document.getElementById("name-and-phone-number").value.trim();
    const address = document.getElementById("table-number-or-address").value.trim();
    if (!name || !address) { alert("Please fill in your name and address."); return; }
    let message = `Order from 5Spice Mira Road\n`;
    let total = 0;
    for (let key in cart) {
      const item = cart[key];
      message += `\n${item.qty}× ${item.name} – ₹${item.qty * item.price}`;
      total += item.qty * item.price;
    }
    message += `\n\nTotal: ₹${total}\nName: ${name}\nAddress: ${address}`;
    const inst = document.getElementById("cooking-instructions").value.trim();
    if (inst) message += `\nInstructions: ${inst}`;
    const encoded = encodeURIComponent(message);
    document.getElementById("whatsapp-order").href = `https://wa.me/919867378209?text=${encoded}`;
  };
}

/* ---------- Preview Modal ---------- */
function openPreview(name) {
  const item = allProducts.find(p => p.name === name);
  if (!item) return;
  document.getElementById("modal-image").src = `images/${item.image}`;
  document.getElementById("modal-name").textContent = item.name;
  document.getElementById("modal-description").textContent = item.description || "";
  document.getElementById("modal-price").textContent = `₹${item.price}`;
  document.getElementById("preview-modal").classList.remove("hidden");
  document.getElementById("modal-add-to-cart").onclick = () => { changeQty(name, 1); document.getElementById("preview-modal").classList.add("hidden"); };
  document.getElementById("close-modal").onclick = () => document.getElementById("preview-modal").classList.add("hidden");
  document.getElementById("back-to-menu").onclick = e => { e.preventDefault(); document.getElementById("preview-modal").classList.add("hidden"); };
}

/* ---------- Browser Back ---------- */
window.addEventListener("popstate", (event) => {
  const st = event.state;
  if (st && st.view === "products" && st.cat) {
    showProductsView(); renderForCategory(st.cat);
  } else {
    showCategoriesView(); if (location.hash) history.replaceState({ view: "categories" }, "", location.pathname);
  }
});
