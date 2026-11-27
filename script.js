const PRODUCTS = [
  {
    id: "ativzul",
    name: '"ATIVZUL"',
    price: 145,

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

const $ = id => document.getElementById(id);
const money = n => "$" + n.toFixed(2);
const findProduct = id => PRODUCTS.find(p => p.id === id);

const hero = $("hero");

function endIntro() {
  if (document.body.classList.contains("loaded")) return;
  document.body.classList.remove("intro-playing");
  document.body.classList.add("loaded");
}
setTimeout(endIntro, 2200);
hero.addEventListener("click", endIntro);

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

function showView(name) {
  document.body.dataset.view = name;
}

function toTop() {
  const html = document.documentElement;
  const old = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.scrollTop = 0; document.body.scrollTop = 0;
  requestAnimationFrame(() => { window.scrollTo(0, 0); html.style.scrollBehavior = old; });
}

function snapTo(el, gap = 0) {
  const html = document.documentElement;
  const old = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - gap);
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
    if (window.innerWidth <= 600) {
      requestAnimationFrame(() => requestAnimationFrame(() =>
        snapTo(document.querySelector("header .korean-logo"), 10)));
    }
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

    const target = hash && document.getElementById(hash);
    const cameFromOtherPage = prevView && prevView !== "shop";
    if (target && cameFromOtherPage) {

      fitBottom();
      snapTo(target);
    } else if (target) setTimeout(() => {
      fitBottom();
      target.scrollIntoView({ behavior: "smooth" });
    }, 30);
  }
  closeBag();
  lastView = prevView;
}
window.addEventListener("hashchange", route);

let current = null;
let photo = 0;

const pvImg = $("pvImg");
const pvVid = $("pvVid");
const isVideo = src => /\.mp4$/i.test(src);
const posterOf = src => src.replace(/\.mp4$/i, ".jpg");

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
  showPrice();
  $("pvDetails").textContent = p.details;
  pvImg.alt = plain;
  showMedia(p.images[0]);

  $("addToCart").textContent = "ADD TO CART";

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

let currency = "USD";
let rate = 1;

function showPrice() {
  const amount = current.price * rate;
  const text = new Intl.NumberFormat(undefined, {
    style: "currency", currency: currency
  }).format(amount);
  $("pvPrice").textContent = text;
  $("pvPriceTop").textContent = $("pvPriceSide").textContent = text;
}

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
    const res = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=" + currency);
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    rate = data.rates[currency];
    $("rateNote").textContent = "1 USD = " + rate + " " + currency + " · live rate from " + data.date + " · you pay in USD";
  } catch (err) {

    rate = BACKUP_RATES[currency];
    $("rateNote").textContent = "1 USD ≈ " + rate + " " + currency + " · saved rate (live rates offline) · you pay in USD";
  }
  showPrice();
});

let cart = [];
try { cart = JSON.parse(localStorage.getItem("ganswon-cart")) || []; } catch (e) { cart = []; }
cart = cart.filter(item => findProduct(item.id));

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
        <div class="bi-img"><img src="${p.images[0]}" alt=""></div>
        <div class="bi-info">
          <p class="bi-name">${p.name}</p>
          <p class="bi-opt"><b>Color:</b> ${i.opt}</p>
          <div class="bi-bottom">
            <div class="qty">
              <button type="button" data-act="minus" data-idx="${idx}" aria-label="One less">−</button>
              <span>${i.qty}</span>
              <button type="button" data-act="plus" data-idx="${idx}" aria-label="One more">+</button>
            </div>
            <p class="bi-price">${money(p.price * i.qty)}</p>
          </div>
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

  let saved = null;
  try { saved = localStorage.getItem("ganswon-code"); } catch (e) {}
  if (saved && !$("promoInput").value) $("promoInput").value = saved;
  updatePayButton();
}

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

  const btn = $("payButton");
  btn.disabled = true;
  btn.textContent = "PROCESSING…";

  setTimeout(() => {
    $("orderNumber").textContent = "#GW-" + Math.floor(100000 + Math.random() * 900000);
    $("orderEmail").textContent = $("coEmail").value;

    ["cardNumber", "cardExp", "cardCvc", "cardName"].forEach(id => { $(id).value = ""; });
    cart = [];
    saveCart();
    drawBag();
    btn.disabled = false;
    location.hash = "thanks";
  }, 1500);
});

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

setTimeout(function autoSms() {
  if (smsSeen || smsPop.classList.contains("open")) return;
  if (document.body.dataset.view !== "shop" || !document.body.classList.contains("loaded")) {
    setTimeout(autoSms, 3000);
    return;
  }
  openSms();
}, 7000);

$("smsBand").addEventListener("click", openSms);
$("smsBand").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSms(); } });
$("smsClose").addEventListener("click", closeSms);
$("smsNo").addEventListener("click", closeSms);
smsPop.addEventListener("click", e => { if (e.target === smsPop) closeSms(); });

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

const BACKUP_ZIPS = {
  "19114": ["Philadelphia", "PA"], "19103": ["Philadelphia", "PA"],
  "28202": ["Charlotte", "NC"],    "10001": ["New York", "NY"],
  "30303": ["Atlanta", "GA"],      "90210": ["Beverly Hills", "CA"],
  "60601": ["Chicago", "IL"],      "20001": ["Washington", "DC"]
};

const ZIP_STATES = [
  [5,5,"NY"],[6,7,"PR"],[8,8,"VI"],[9,9,"PR"],[10,27,"MA"],[28,29,"RI"],[30,38,"NH"],[39,49,"ME"],
  [50,54,"VT"],[55,55,"MA"],[56,59,"VT"],[60,69,"CT"],[70,89,"NJ"],[100,149,"NY"],[150,196,"PA"],
  [197,199,"DE"],[200,200,"DC"],[201,201,"VA"],[202,205,"DC"],[206,219,"MD"],[220,246,"VA"],
  [247,268,"WV"],[270,289,"NC"],[290,299,"SC"],[300,319,"GA"],[320,339,"FL"],[341,349,"FL"],
  [350,369,"AL"],[370,385,"TN"],[386,397,"MS"],[398,399,"GA"],[400,427,"KY"],[430,459,"OH"],
  [460,479,"IN"],[480,499,"MI"],[500,528,"IA"],[530,549,"WI"],[550,567,"MN"],[569,569,"DC"],
  [570,577,"SD"],[580,588,"ND"],[590,599,"MT"],[600,629,"IL"],[630,658,"MO"],[660,679,"KS"],
  [680,693,"NE"],[700,714,"LA"],[716,729,"AR"],[730,732,"OK"],[733,733,"TX"],[734,749,"OK"],
  [750,799,"TX"],[800,816,"CO"],[820,831,"WY"],[832,838,"ID"],[840,847,"UT"],[850,865,"AZ"],
  [870,884,"NM"],[885,885,"TX"],[889,898,"NV"],[900,961,"CA"],[967,968,"HI"],[969,969,"GU"],
  [970,979,"OR"],[980,994,"WA"],[995,999,"AK"]
];
function stateFromZip(zip) {
  const n = Number(zip.slice(0, 3));
  const hit = ZIP_STATES.find(([lo, hi]) => n >= lo && n <= hi);
  return hit ? hit[2] : null;
}

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

    const b = BACKUP_ZIPS[zip];
    const st = stateFromZip(zip);
    if (b) fillPlace(b[0], b[1], "Found: " + b[0] + ", " + b[1] + " (saved list, live lookup offline)");
    else if (st) {
      $("coState").value = st;
      $("coState").classList.remove("bad");
      $("zipNote").textContent = "State: " + st + " (from your ZIP). Live lookup is offline, so please type your city.";
    }
    else $("zipNote").textContent = "ZIP lookup is offline right now. Please type your city and state.";
    return;
  }

  if (!res.ok) {

    $("zipNote").textContent = "We couldn't find that ZIP. Please check it, or type your city and state.";
    return;
  }
  const data = await res.json();
  const place = data.places[0];
  fillPlace(place["place name"], place["state abbreviation"],
            "Found: " + place["place name"] + ", " + place["state abbreviation"]);
});

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

$("aboutToggle").addEventListener("click", () => {
  const open = $("menuAbout").hidden;
  $("menuAbout").hidden = !open;
  $("aboutToggle").setAttribute("aria-expanded", open);
});

$("menuSms").addEventListener("click", () => { setMenu(false); openSms(); });

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (smsPop.classList.contains("open")) closeSms();
  setMenu(false);
  closeBag();
});

const revealer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => revealer.observe(el));

const LAUNCH_DATE = null;
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

  track.addEventListener("click", e => { if (moved) { e.preventDefault(); moved = false; } }, true);
  let started = false;
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) { clearInterval(timer); return; }
    if (!started) { started = true; go(0); }
    restart();
  }, { threshold: 0.5 }).observe(track.parentElement);
})();

function fitBottom() {

  const arrivals = document.querySelector(".arrivals");
  const header = document.querySelector("header");
  const keepY = window.scrollY;
  arrivals.style.minHeight = "";
  const b0 = document.querySelector("footer"); if (b0) b0.style.marginBottom = "";
  if (document.body.dataset.view !== "shop") return;
  const room = document.documentElement.scrollHeight - header.offsetTop;
  const need = window.innerHeight - room;
  const band = document.querySelector("footer");
  band.style.marginBottom = "";
  if (need > 0) {

    const under = Math.min(12, need);
    band.style.marginBottom = under + "px";
    arrivals.style.minHeight = (arrivals.offsetHeight + need - under) + "px";
  }
  if (window.scrollY !== keepY) {
    const html = document.documentElement, b = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto"; window.scrollTo(0, keepY); html.style.scrollBehavior = b;
  }
}
window.addEventListener("resize", fitBottom);
window.addEventListener("load", fitBottom);

drawBag();
route();
fitBottom();
