/* =========================================================
   YOUR TOTES — edit names, prices, photos and text here.
   Photos: PNGs with the background removed look best
   (they "float" on the page). Each tote can have several photos;
   tap the small pictures on the product page to switch.
========================================================= */
const PRODUCTS = [
  {
    id: "ativzul",
    name: '"ATIVZUL"',
    price: 145,
    // photos and videos both work here (a video also needs a .jpg with the same name)
    images: ["camo-tote.png", "camo-tote-side.png", "motion-worn.mp4"],
    color: "TEAL CAMO",
    details: "Camo tote with hand-drawn red Canswon lettering. Long shoulder straps plus short carry handles."
  },
  {
    id: "summer-joy",
    name: '"SUMMER JOY"',
    price: 150,
    images: ["summer-joy.png", "summer-joy-side.png", "summer-joy-video.mp4"],
    color: "CORAL",
    details: "Soft coral knit tote with the GANSWON tree-and-swing artwork stitched on the front. Long shoulder straps."
  },
  {
    id: "wabisabi",
    name: '"WABISABI" TOTE',
    price: 160,
    images: ["wabisabi.png", "wabisabi-packed.jpg"],
    color: "BLACK",
    details: "Black canvas tote with the distressed WABISABI print, a line of walking figures through the letters, and PERFECTLY IMPERFECT underneath. Long shoulder straps."
  },
  {
    id: "eagl-tote",
    name: '"EAGL" TOTE',
    price: 150,
    images: ["eagl.png", "eagl-packed.jpg"],
    color: "TEAL",
    details: "Teal canvas tote with the distressed red 간손원 seal and GANSWON printed underneath. Black carry handles."
  }
];

const FREE_SHIPPING_OVER = 200;
const SHIPPING_COST = 8;

/* small helpers */
const $ = id => document.getElementById(id);
const money = n => "$" + n.toFixed(2);
const findProduct = id => PRODUCTS.find(p => p.id === id);

/* =========================
   OPENING SCREEN
========================= */
const hero = $("hero");

function endIntro() {
  if (document.body.classList.contains("loaded")) return;
  document.body.classList.remove("intro-playing");
  document.body.classList.add("loaded");
}
setTimeout(endIntro, 2200);
hero.addEventListener("click", endIntro);

/* =========================
   SHOP GRID (built from PRODUCTS)
========================= */
const grid = $("productGrid");

grid.innerHTML = PRODUCTS.map(p => `
  <a href="#${p.id}" class="product" data-name="${p.name.replace(/"/g, "")}">
    <div class="product-img"><img src="${p.images[0]}" alt="${p.name.replace(/"/g, "")}"></div>
    <div class="product-info">
      <p class="product-name">${p.name}</p>
      <p class="product-price">${p.soldOut ? "SOLD OUT" : money(p.price)}</p>
    </div>
  </a>
`).join("");


/* =========================
   PAGES — the address bar decides what shows:
   #shop (or nothing) = shop, #seal-tote = that tote,
   #checkout = checkout, #thanks = order confirmed
========================= */
function showView(name) {
  document.body.dataset.view = name;
}

// jump straight to the top (no smooth scroll), now and after the page settles
function toTop() {
  const html = document.documentElement;
  const old = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.scrollTop = 0; document.body.scrollTop = 0;
  requestAnimationFrame(() => { window.scrollTo(0, 0); html.style.scrollBehavior = old; });
}

// jump (no glide) so `el` sits exactly at the top of the screen
function snapTo(el) {
  const html = document.documentElement;
  const old = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  html.style.scrollBehavior = old;
}

let lastView = null;
function route() {
  const prevView = document.body.dataset.view;
  if (typeof pvVid !== "undefined") pvVid.pause();
  const hash = location.hash.replace("#", "");
  const product = findProduct(hash);

  if (product) {
    endIntro();
    openProduct(product);
    showView("product");
    toTop();
  } else if (hash === "checkout") {
    endIntro();
    if (cart.length === 0) { location.hash = "shop"; return; }
    fillCheckout();
    showView("checkout");
    toTop();
  } else if (hash === "thanks") {
    endIntro();
    showView("thanks");
    toTop();
  } else {
    showView("shop");
    // #shop or #contact: scroll to that part of the page.
    // Coming back from another page jumps straight there so it lines up exactly;
    // SHOP NOW on the opening screen still glides down.
    const target = hash && document.getElementById(hash);
    const cameFromOtherPage = prevView && prevView !== "shop";
    if (target) setTimeout(() => {
      fitBottom();
      if (cameFromOtherPage) {
        // coming back from a bag / checkout: snap so the shop fills the screen exactly,
        // then check again once the photos and the phone's browser bar have settled
        snapTo(target);
        setTimeout(() => { fitBottom(); snapTo(target); }, 150);
        setTimeout(() => { fitBottom(); snapTo(target); }, 450);
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }, 30);
  }
  closeBag();
  lastView = prevView;
}
window.addEventListener("hashchange", route);

/* =========================
   PRODUCT PAGE
========================= */
let current = null;   // tote being viewed
let photo = 0;        // which photo / video is showing

const pvImg = $("pvImg");
const pvVid = $("pvVid");
const isVideo = src => /\.mp4$/i.test(src);
const posterOf = src => src.replace(/\.mp4$/i, ".jpg");   // video thumbnail picture

// put a photo or a video on the stage
function showMedia(src) {
  if (isVideo(src)) {
    pvImg.hidden = true;
    pvVid.hidden = false;
    pvVid.src = src;
    pvVid.poster = posterOf(src);
    pvVid.play().catch(() => {});
  } else {
    pvVid.pause();
    pvVid.hidden = true;
    pvImg.hidden = false;
    pvImg.src = src;
    // cut-out PNGs float; full photos (like the flower shot) stay still
    pvImg.classList.toggle("still", /\.jpe?g$/i.test(src));
  }
}

function openProduct(p) {
  current = p;
  photo = 0;
  const plain = p.name.replace(/"/g, "");

  $("pvName").textContent = p.name;
  $("pvNameTop").textContent = p.name;
  $("pvColor").textContent = p.color;
  showPrice();   // uses the chosen currency (see CURRENCY SWITCHER below)
  $("pvDetails").textContent = p.details;
  pvImg.alt = plain;
  showMedia(p.images[0]);

  // grey SOLD OUT bar sits above BUY NOW + ADD TO CART (for the look)
  $("addToCart").textContent = "ADD TO CART";

  // thumbnails
  $("pvThumbs").innerHTML = p.images.map((src, i) => isVideo(src)
    ? `<button type="button" class="thumb-vid ${i === 0 ? "on" : ""}" data-i="${i}" aria-label="Play video">
         <img src="${posterOf(src)}" alt=""><span class="play">&#9654;</span></button>`
    : `<button type="button" class="${i === 0 ? "on" : ""}" data-i="${i}" aria-label="Photo ${i + 1}">
         <img src="${src}" alt=""></button>`
  ).join("");
}

function goToPhoto(i) {
  const list = current.images;
  photo = (i + list.length) % list.length;
  pvImg.classList.add("swap"); pvVid.classList.add("swap");
  setTimeout(() => {
    showMedia(list[photo]);
    pvImg.classList.remove("swap"); pvVid.classList.remove("swap");
  }, 180);
  $("pvThumbs").querySelectorAll("button").forEach(b =>
    b.classList.toggle("on", Number(b.dataset.i) === photo));
}

$("pvThumbs").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b) goToPhoto(Number(b.dataset.i));
});

// swipe the big picture on phones
let touchX = 0;
[pvImg, pvVid].forEach(el => {
  el.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - touchX;
    if (Math.abs(diff) > 40) goToPhoto(photo + (diff < 0 ? 1 : -1));
  });
});

$("addToCart").addEventListener("click", () => {
  if (current.soldOut) return;
  addToCart(current.id, current.color);
  const btn = $("addToCart");
  btn.textContent = "ADDED ✓";
  setTimeout(() => { btn.textContent = "ADD TO CART"; }, 1200);
  openBag();
});

$("buyNow").addEventListener("click", () => {
  if (current.soldOut) return;
  addToCart(current.id, current.color);
  location.hash = "checkout";
});

/* =========================
   API 2: CURRENCY SWITCHER  —  Frankfurter (https://www.frankfurter.app)
   Free, no key. We ask for today's rate from USD to the chosen currency,
   then show the bag's price converted. Cart and checkout stay in USD.
========================= */
let currency = "USD";
let rate = 1;

function showPrice() {
  const amount = current.price * rate;
  $("pvPrice").textContent = new Intl.NumberFormat(undefined, {
    style: "currency", currency: currency
  }).format(amount);
}

// backup rates, used only if the live API can't be reached
// (for example inside a preview that blocks outside websites)
const BACKUP_RATES = { EUR: 0.92, GBP: 0.79, JPY: 151.3, KRW: 1380, CAD: 1.39 };

$("currency").addEventListener("change", async () => {
  currency = $("currency").value;
  if (currency === "USD") {
    rate = 1;
    $("rateNote").textContent = "";
    showPrice();
    return;
  }
  $("rateNote").textContent = "Getting today's rate…";
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=" + currency);
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();          // e.g. { rates: { EUR: 0.92 }, date: "2026-11-24" }
    rate = data.rates[currency];
    $("rateNote").textContent = "1 USD = " + rate + " " + currency + " · live rate from " + data.date + " · you pay in USD";
  } catch (err) {
    // no internet / blocked: fall back to the saved rate instead of failing
    rate = BACKUP_RATES[currency];
    $("rateNote").textContent = "1 USD ≈ " + rate + " " + currency + " · saved rate (live rates offline) · you pay in USD";
  }
  showPrice();
});

/* =========================
   CART (saved in this browser)
========================= */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("ganswon-cart")) || []; } catch (e) { cart = []; }
cart = cart.filter(item => findProduct(item.id));   // drop totes that no longer exist

function saveCart() {
  try { localStorage.setItem("ganswon-cart", JSON.stringify(cart)); } catch (e) {}
}

function addToCart(id, opt) {
  const line = cart.find(i => i.id === id && i.opt === opt);
  if (line) line.qty++;
  else cart.push({ id, opt, qty: 1 });
  saveCart();
  drawBag();
  const btn = $("bagButton");
  btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
}

function subtotal() {
  return cart.reduce((sum, i) => sum + findProduct(i.id).price * i.qty, 0);
}

function drawBag() {
  const count = cart.reduce((n, i) => n + i.qty, 0);
  $("bagCount").textContent = count;
  $("bagCount").classList.toggle("zero", count === 0);

  $("bagItems").innerHTML = cart.map((i, idx) => {
    const p = findProduct(i.id);
    return `
      <li class="bag-item">
        <img src="${p.images[0]}" alt="">
        <div>
          <p class="bi-name">${p.name}</p>
          <p class="bi-opt">${i.opt}</p>
          <div class="qty">
            <button type="button" data-act="minus" data-idx="${idx}" aria-label="One less">−</button>
            <span>${i.qty}</span>
            <button type="button" data-act="plus" data-idx="${idx}" aria-label="One more">+</button>
          </div>
        </div>
        <div class="bi-price">
          <p>${money(p.price * i.qty)}</p>
          <button type="button" class="bi-remove" data-act="remove" data-idx="${idx}">REMOVE</button>
        </div>
      </li>`;
  }).join("");

  $("bagEmpty").hidden = cart.length > 0;
  $("bagBottom").hidden = cart.length === 0;
  $("bagSubtotal").textContent = money(subtotal());
}

$("bagItems").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  if (btn.dataset.act === "plus") cart[idx].qty++;
  if (btn.dataset.act === "minus") cart[idx].qty--;
  if (btn.dataset.act === "remove" || cart[idx].qty < 1) cart.splice(idx, 1);
  saveCart();
  drawBag();
});

function openBag() { document.body.classList.add("bag-open"); }
function closeBag() { document.body.classList.remove("bag-open"); }
$("bagButton").addEventListener("click", openBag);
$("bagClose").addEventListener("click", closeBag);
$("bagBackdrop").addEventListener("click", closeBag);

/* =========================
   CHECKOUT + PAYMENT (demo)
   Nothing is charged. Card details are only checked for format;
   they are never saved or sent anywhere.
========================= */
/* 7% off with the code from the text sign-up */
const DISCOUNT_CODE = "GANSWON7";
const DISCOUNT_RATE = 0.07;
let codeApplied = false;
function discountAmount() {
  return codeApplied ? Math.round(subtotal() * DISCOUNT_RATE * 100) / 100 : 0;
}
function orderTotal() {
  return subtotal() - discountAmount() + shippingCost();
}

function shippingCost() {
  return subtotal() >= FREE_SHIPPING_OVER ? 0 : SHIPPING_COST;
}

function fillCheckout() {
  $("summaryItems").innerHTML = cart.map(i => {
    const p = findProduct(i.id);
    return `<li>
      <img src="${p.images[0]}" alt="">
      <div>${p.name}<small>${i.opt} · QTY ${i.qty}</small></div>
      <span>${money(p.price * i.qty)}</span>
    </li>`;
  }).join("");

  const ship = shippingCost();
  $("sumSubtotal").textContent = money(subtotal());
  $("sumShipping").textContent = ship === 0 ? "FREE" : money(ship);
  $("sumDiscountRow").hidden = !codeApplied;
  $("sumDiscount").textContent = "−" + money(discountAmount());
  $("sumTotal").textContent = money(orderTotal());
  // fill in the code automatically if they signed up for texts
  let saved = null;
  try { saved = localStorage.getItem("ganswon-code"); } catch (e) {}
  if (saved && !$("promoInput").value) $("promoInput").value = saved;
  updatePayButton();
}

// payment method switch
const payInputs = document.querySelectorAll('input[name="pay"]');
function payMethod() { return document.querySelector('input[name="pay"]:checked').value; }

function updatePayButton() {
  const total = money(orderTotal());
  const m = payMethod();
  $("cardFields").hidden = m !== "card";
  $("payOther").hidden = m === "card";
  if (m === "paypal") {
    $("payOther").textContent = "You'd be sent to PayPal to finish paying, then brought back here.";
    $("payButton").textContent = "CONTINUE WITH PAYPAL — " + total;
  } else if (m === "apple") {
    $("payOther").textContent = "You'd confirm the payment with Face ID or Touch ID.";
    $("payButton").textContent = "PAY WITH APPLE PAY — " + total;
  } else {
    $("payButton").textContent = "PAY " + total;
  }
}
payInputs.forEach(r => r.addEventListener("change", updatePayButton));

// auto-format card number "4242 4242 4242 4242" and expiry "MM / YY"
$("cardNumber").addEventListener("input", e => {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
  e.target.value = digits.replace(/(.{4})/g, "$1 ").trim();
});
$("cardExp").addEventListener("input", e => {
  const d = e.target.value.replace(/\D/g, "").slice(0, 4);
  e.target.value = d.length > 2 ? d.slice(0, 2) + " / " + d.slice(2) : d;
});
$("cardCvc").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
});

function checkField(id, ok) {
  $(id).classList.toggle("bad", !ok);
  return ok;
}

$("checkoutForm").addEventListener("submit", e => {
  e.preventDefault();
  let ok = true;

  ok = checkField("coEmail", /^\S+@\S+\.\S+$/.test($("coEmail").value)) && ok;
  ["coName", "coAddress", "coCity", "coState"].forEach(id => {
    ok = checkField(id, $(id).value.trim() !== "") && ok;
  });
  ok = checkField("coZip", /^\d{5}$/.test($("coZip").value.trim())) && ok;

  if (payMethod() === "card") {
    const num = $("cardNumber").value.replace(/\s/g, "");
    const exp = $("cardExp").value.replace(/\s/g, "");
    const mm = Number(exp.slice(0, 2));
    ok = checkField("cardNumber", num.length >= 15) && ok;
    ok = checkField("cardExp", /^\d{2}\/\d{2}$/.test(exp) && mm >= 1 && mm <= 12) && ok;
    ok = checkField("cardCvc", /^\d{3,4}$/.test($("cardCvc").value)) && ok;
    ok = checkField("cardName", $("cardName").value.trim() !== "") && ok;
  }

  if (!ok) {
    $("coError").textContent = "Please fix the boxes outlined in red.";
    return;
  }
  $("coError").textContent = "";

  // pretend to process the payment
  const btn = $("payButton");
  btn.disabled = true;
  btn.textContent = "PROCESSING…";

  setTimeout(() => {
    $("orderNumber").textContent = "#GW-" + Math.floor(100000 + Math.random() * 900000);
    $("orderEmail").textContent = $("coEmail").value;

    // clear the card boxes and the bag
    ["cardNumber", "cardExp", "cardCvc", "cardName"].forEach(id => { $(id).value = ""; });
    cart = [];
    saveCart();
    drawBag();
    btn.disabled = false;
    location.hash = "thanks";
  }, 1500);
});

// discount code box
$("promoApply").addEventListener("click", () => {
  const code = $("promoInput").value.trim().toUpperCase();
  if (code === DISCOUNT_CODE) {
    codeApplied = true;
    $("promoMsg").textContent = "7% OFF APPLIED";
  } else {
    codeApplied = false;
    $("promoMsg").textContent = code ? "THAT CODE DOESN'T WORK" : "";
  }
  fillCheckout();
});

/* =========================
   SMS SIGN-UP POP-UP
   Shows once, a few seconds after someone reaches the shop.
   Tapping the red 간손원 band opens it again.
   LATER: send the phone number to your texting service here
   (see the comment in the submit handler).
========================= */
const smsPop = $("smsPop");
let smsSeen = false;
try { smsSeen = localStorage.getItem("ganswon-sms-seen") === "1"; } catch (e) {}

function openSms() {
  smsPop.classList.add("open");
  smsPop.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
}
function closeSms() {
  smsPop.classList.remove("open");
  smsPop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
  try { localStorage.setItem("ganswon-sms-seen", "1"); } catch (e) {}
  smsSeen = true;
}

// pop up 5 seconds after the opening screen, only on the shop
setTimeout(function autoSms() {
  if (smsSeen || smsPop.classList.contains("open")) return;
  if (document.body.dataset.view !== "shop" || !document.body.classList.contains("loaded")) {
    setTimeout(autoSms, 3000);       // try again a bit later
    return;
  }
  openSms();
}, 7000);

$("smsBand").addEventListener("click", openSms);
$("smsBand").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSms(); } });
$("smsClose").addEventListener("click", closeSms);
$("smsNo").addEventListener("click", closeSms);
smsPop.addEventListener("click", e => { if (e.target === smsPop) closeSms(); });

// format the phone number as (555) 123-4567
$("smsPhone").addEventListener("input", e => {
  const d = e.target.value.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  let out = d;
  if (d.length > 6) out = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  else if (d.length > 3) out = "(" + d.slice(0, 3) + ") " + d.slice(3);
  e.target.value = out;
});

$("smsForm").addEventListener("submit", e => {
  e.preventDefault();
  const digits = $("smsPhone").value.replace(/\D/g, "");
  if (digits.length !== 10) {
    $("smsPhone").classList.add("bad");
    $("smsError").textContent = "Enter a 10-digit phone number.";
    return;
  }
  $("smsPhone").classList.remove("bad");
  $("smsError").textContent = "";

  // LATER: send `digits` to your texting service (the "sms link") here.
  // For now nothing is saved or sent.

  try { localStorage.setItem("ganswon-code", DISCOUNT_CODE); } catch (e) {}
  $("smsPhone").value = "";
  $("smsStep1").hidden = true;
  $("smsStep2").hidden = false;
});

$("smsCode").addEventListener("click", () => {
  navigator.clipboard.writeText(DISCOUNT_CODE)
    .then(() => { $("smsCopied").textContent = "COPIED ✓"; })
    .catch(() => { $("smsCopied").textContent = "Code: " + DISCOUNT_CODE; });
});
$("smsShop").addEventListener("click", () => {
  closeSms();
  location.hash = "shop";
});

/* =========================
   API 1: ZIP AUTO-FILL  —  Zippopotam.us (https://www.zippopotam.us)
   Free, no key. When 5 digits are typed, we look up the ZIP
   and fill in the City and State boxes.
========================= */
// backup ZIPs, used only if the live API can't be reached
const BACKUP_ZIPS = {
  "19114": ["Philadelphia", "PA"], "19103": ["Philadelphia", "PA"],
  "28202": ["Charlotte", "NC"],    "10001": ["New York", "NY"],
  "30303": ["Atlanta", "GA"],      "90210": ["Beverly Hills", "CA"],
  "60601": ["Chicago", "IL"],      "20001": ["Washington", "DC"]
};

function fillPlace(city, state, note) {
  $("coCity").value = city;
  $("coState").value = state;
  $("coCity").classList.remove("bad");
  $("coState").classList.remove("bad");
  $("zipNote").textContent = note;
}

$("coZip").addEventListener("input", async () => {
  const zip = $("coZip").value.replace(/\D/g, "").slice(0, 5);
  $("coZip").value = zip;
  if (zip.length !== 5) {
    $("zipNote").textContent = "Enter your ZIP and we'll fill in your city and state.";
    return;
  }
  $("zipNote").textContent = "Looking up " + zip + "…";

  let res;
  try {
    res = await fetch("https://api.zippopotam.us/us/" + zip);
  } catch (err) {
    // the API couldn't be reached at all (offline / blocked)
    const b = BACKUP_ZIPS[zip];
    if (b) fillPlace(b[0], b[1], "Found: " + b[0] + ", " + b[1] + " (saved list, live lookup offline)");
    else $("zipNote").textContent = "ZIP lookup is offline right now. Please type your city and state.";
    return;
  }

  if (!res.ok) {
    // the API answered, but that ZIP doesn't exist
    $("zipNote").textContent = "We couldn't find that ZIP. Please check it, or type your city and state.";
    return;
  }
  const data = await res.json();            // e.g. { places: [ { "place name": "Charlotte", "state abbreviation": "NC" } ] }
  const place = data.places[0];
  fillPlace(place["place name"], place["state abbreviation"],
            "Found: " + place["place name"] + ", " + place["state abbreviation"]);
});

/* =========================
   MENU
========================= */
const menuButton = $("menuButton");
const menuOverlay = $("menuOverlay");

function setMenu(open) {
  menuOverlay.classList.toggle("open", open);
  menuButton.classList.toggle("active", open);
  menuButton.setAttribute("aria-expanded", open);
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", open);
}
menuButton.addEventListener("click", () => setMenu(!menuOverlay.classList.contains("open")));
menuOverlay.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (smsPop.classList.contains("open")) closeSms();
  setMenu(false);
  closeBag();
});

/* =========================
   SCROLL REVEAL — things fade up as you reach them
========================= */
const revealer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => revealer.observe(el));

/* =========================
   NEVER-STOPPING STOPWATCH (footer, bottom left)
   It stays at 000:00:00:00.00 until the official launch.
   ON LAUNCH DAY: put the launch date and time below, for example
     const LAUNCH_DATE = new Date("2027-01-15T12:00:00");
   From then on it counts up forever and never resets, even after a reload.
   Shows DAYS:HOURS:MINUTES:SECONDS.HUNDREDTHS
========================= */
const LAUNCH_DATE = null;   // not launched yet
const pad = (n, len) => String(n).padStart(len, "0");

function tickStopwatch() {
  let ms = LAUNCH_DATE ? Math.max(0, Date.now() - LAUNCH_DATE.getTime()) : 0;
  const days = Math.floor(ms / 86400000); ms %= 86400000;
  const hrs  = Math.floor(ms / 3600000);  ms %= 3600000;
  const mins = Math.floor(ms / 60000);    ms %= 60000;
  const secs = Math.floor(ms / 1000);
  const hund = Math.floor((ms % 1000) / 10);
  $("stopwatch").textContent =
    pad(days, 3) + ":" + pad(hrs, 2) + ":" + pad(mins, 2) + ":" + pad(secs, 2) + "." + pad(hund, 2);
  requestAnimationFrame(tickStopwatch);
}
requestAnimationFrame(tickStopwatch);

/* =========================
   BAG CAROUSEL — one bag at a time, slides every 4 seconds
========================= */
(function () {
  const track = $("productGrid");
  const count = track.children.length;
  let i = 0, timer;
  function go(n) {
    i = (n + count) % count;
    track.style.transform = "translateX(" + (-100 * i) + "%)";
  }
  function restart() { clearInterval(timer); timer = setInterval(() => go(i + 1), 4000); }
  $("bcPrev").addEventListener("click", () => { go(i - 1); restart(); });
  $("bcNext").addEventListener("click", () => { go(i + 1); restart(); });
  let sx = 0, moved = false;
  track.addEventListener("touchstart", e => { sx = e.touches[0].clientX; moved = false; }, { passive: true });
  track.addEventListener("touchend", e => {
    const d = e.changedTouches[0].clientX - sx;
    if (Math.abs(d) > 40) { moved = true; go(i + (d < 0 ? 1 : -1)); restart(); }
  });
  // a swipe shouldn't also open the bag's page
  track.addEventListener("click", e => { if (moved) { e.preventDefault(); moved = false; } }, true);
  restart();
})();

/* =========================
   ROOM UNDER THE FOOTER
   The footer sits right under the shop. Extra empty space is added
   *below* it only when needed, so SHOP NOW can still scroll the
   header to the very top of the screen.
========================= */
function fitBottom() {
  // stretch the bag row so header + bags + band + footer fill the screen
  // exactly: no empty space at the bottom, and SHOP NOW still lands on the header
  const arrivals = document.querySelector(".arrivals");
  const header = document.querySelector("header");
  arrivals.style.minHeight = "";
  const b0 = document.querySelector("footer"); if (b0) b0.style.marginBottom = "";
  if (document.body.dataset.view !== "shop") return;
  const room = document.documentElement.scrollHeight - header.offsetTop;
  const need = window.innerHeight - room;
  const band = document.querySelector("footer");
  band.style.marginBottom = "";
  if (need > 0) {
    // most of the spare space goes around the bags; a little goes under the
    // 간손원 band so the band sits a bit higher, closer to the bags
    const under = Math.min(12, need);
    band.style.marginBottom = under + "px";
    arrivals.style.minHeight = (arrivals.offsetHeight + need - under) + "px";
  }
}
window.addEventListener("resize", fitBottom);
window.addEventListener("load", fitBottom);
window.addEventListener("hashchange", () => setTimeout(fitBottom, 50));

/* =========================
   START
========================= */
drawBag();
route();
fitBottom();
