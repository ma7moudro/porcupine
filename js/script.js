"use strict";

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt = n => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const money = n => "$" + n.toLocaleString("en-US");

const PRODUCTS = [
  { id: "gf4", cat: "group", name: "Group Foundations — 4 Lessons", desc: "Four 90-minute sessions in squads of six max. Balance, braking and your first green run.", price: 59, old: 79, rating: 4.9, badge: "Bestseller", tone: "gold", seed: "group-snowboard-lesson" },
  { id: "pf1", cat: "private", name: "Private First Run — 60 min", desc: "One coach, one board, zero pressure. A lesson plan cut precisely to your pace.", price: 99, rating: 5, badge: "Coach's Pick", seed: "private-snow-coach" },
  { id: "wcc", cat: "group", name: "Weekend Crash Course", desc: "Saturday to Sunday, nervous to gliding. Gear included, photos guaranteed.", price: 39, rating: 4.7, seed: "weekend-snow-class" },
  { id: "vas", cat: "private", name: "Video Analysis Session", desc: "We film your run and break it down frame by frame — precision you can actually see.", price: 49, rating: 4.8, badge: "New", seed: "video-analysis-slope" },
  { id: "sqs", cat: "group", name: "Sunset Squad Session", desc: "Golden-hour group rides for early graduates. Small crew, big views, hot cocoa after.", price: 29, rating: 4.9, badge: "New", seed: "sunset-snowboard-squad" },
  { id: "rbd", cat: "gear", name: "Full Board Rental — Day", desc: "Tuned board, bindings and wax, sized to your stance with millimetre care.", price: 19, rating: 4.8, seed: "snowboard-rental-rack" },
  { id: "bhb", cat: "gear", name: "Boots + Helmet Bundle", desc: "Sanitised, fitted, certified. Comfort and safety for the whole day.", price: 12, rating: 4.6, seed: "snow-boots-helmet" },
  { id: "jlk", cat: "gear", name: "Jacket & Layers Kit", desc: "Waterproof shell, mid-layer and gloves — stay warm without buying a wardrobe.", price: 15, rating: 4.7, seed: "winter-jacket-gear" },
  { id: "spu", cat: "season", name: "Season Pass — Unlimited", desc: "Unlimited lessons and rentals all season long, priority booking included.", price: 349, old: 449, rating: 4.9, badge: "Save $100", tone: "gold", seed: "season-pass-slope" },
  { id: "p10", cat: "season", name: "10-Ride Punch Card", desc: "Ten lift-and-lesson credits to use whenever the powder calls. Never expires.", price: 179, rating: 4.8, seed: "punch-card-ski-lift" }
];

const CATS = { group: "Group Lessons", private: "Private Lessons", gear: "Gear Rental", season: "Season Passes" };

function toast(msg) {
  let t = $(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

function runCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  if (RM) {
    el.textContent = (suffix === "$" ? "$" : "") + fmt(target) + (suffix === "$" ? "" : suffix);
    return;
  }
  const dur = 1500;
  const t0 = performance.now();
  const step = t => {
    const p = Math.min((t - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    const v = fmt(Math.round(target * e));
    el.textContent = suffix === "$" ? "$" + v : v + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initHeader() {
  const head = $("#siteHead");
  const top = $("#backTop");
  const onScroll = () => {
    if (head) head.classList.toggle("scrolled", window.scrollY > 8);
    if (top) top.classList.toggle("show", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }));
}

function initNav() {
  const burger = $("#navBurger");
  const nav = $("#nav");
  if (!burger || !nav) return;
  burger.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded", open);
  });
  $$("a", nav).forEach(a => a.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    burger.setAttribute("aria-expanded", "false");
  }));
}

function initReveal() {
  const targets = $$(".reveal, .mask, .stat-num");
  if (RM || !("IntersectionObserver" in window)) {
    targets.forEach(el => {
      el.classList.add("in");
      if (el.classList.contains("stat-num")) runCounter(el);
    });
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      if (en.target.classList.contains("stat-num")) runCounter(en.target);
      else en.target.classList.add("in");
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  targets.forEach(el => io.observe(el));
}

function initFaq() {
  $$(".faq-q").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const panel = item.querySelector(".faq-a");
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0";
    });
  });
}

function initNewsletter() {
  $$(".nl-form").forEach(f => {
    f.addEventListener("submit", e => {
      e.preventDefault();
      f.reset();
      toast("You're on the list — see you at first snow ❄");
    });
  });
}

function initYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

function initShop() {
  const grid = $("#prodGrid");
  if (!grid) return;

  const countEl = $("#prodCount");
  const searchEl = $("#prodSearch");
  const sortEl = $("#prodSort");
  const catRow = $("#catRow");
  const drawer = $("#cartDrawer");
  const itemsEl = $("#cartItems");
  const totalEl = $("#cartTotal");
  const countBadge = $("#cartCount");
  const scrim = $("#scrim");

  const state = {
    cat: "all",
    q: "",
    sort: "featured",
    cart: JSON.parse(localStorage.getItem("porcupine_cart") || "{}"),
    justOrdered: false
  };

  const cardHtml = (p, i) => `
  <article class="prod" style="animation-delay:${i * 60}ms">
    <div class="prod-media">
      <img src="https://picsum.photos/seed/${p.seed}/600/440" alt="${p.name}" loading="lazy">
      ${p.badge ? `<span class="prod-badge${p.tone === "gold" ? " badge-gold" : ""}">${p.badge}</span>` : ""}
    </div>
    <div class="prod-body">
      <div class="prod-top"><span class="prod-cat">${CATS[p.cat]}</span><span class="prod-rate">★ ${fmt(p.rating)}</span></div>
      <h3 class="prod-name">${p.name}</h3>
      <p class="prod-desc">${p.desc}</p>
      <div class="prod-foot">
        <span class="prod-price">${p.old ? `<s>${money(p.old)}</s>` : ""}<strong>${money(p.price)}</strong></span>
        <button class="btn btn-ink btn-sm" data-add="${p.id}">Add to Cart</button>
      </div>
    </div>
  </article>`;

  function render() {
    let list = PRODUCTS.filter(p => state.cat === "all" || p.cat === state.cat)
      .filter(p => (p.name + " " + p.desc).toLowerCase().includes(state.q));
    if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (state.sort === "rating") list.sort((a, b) => b.rating - a.rating);
    grid.innerHTML = list.length
      ? list.map(cardHtml).join("")
      : `<div class="no-results">No matches in the catalogue — try another keyword or category ❄</div>`;
    countEl.textContent = `Showing ${list.length} of ${PRODUCTS.length} packages & services`;
  }

  const saveCart = () => localStorage.setItem("porcupine_cart", JSON.stringify(state.cart));
  const cartQty = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
  const cartSum = () => Object.entries(state.cart).reduce((sum, [id, q]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return p ? sum + p.price * q : sum;
  }, 0);

  function renderCart() {
    state.justOrdered = false;
    const entries = Object.entries(state.cart);
    if (!entries.length) {
      itemsEl.innerHTML = `<div class="cart-empty">Your cart is empty.<br>The catalogue is waiting for you ❄</div>`;
    } else {
      itemsEl.innerHTML = entries.map(([id, q]) => {
        const p = PRODUCTS.find(x => x.id === id);
        return `
        <div class="cart-item">
          <img class="ci-img" src="https://picsum.photos/seed/${p.seed}/160/160" alt="${p.name}">
          <div>
            <div class="ci-name">${p.name}</div>
            <div class="ci-price">${money(p.price)} × ${q}</div>
            <div class="qty">
              <button data-dec="${id}" aria-label="Decrease">−</button>
              <span>${q}</span>
              <button data-inc="${id}" aria-label="Increase">+</button>
            </div>
          </div>
          <button class="ci-del" data-del="${id}" aria-label="Remove">🗑</button>
        </div>`;
      }).join("");
    }
    totalEl.textContent = money(cartSum());
    countBadge.textContent = cartQty();
  }

  function addToCart(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    saveCart();
    renderCart();
  }

  function openCart() {
    document.body.classList.add("cart-open");
    drawer.setAttribute("aria-hidden", "false");
  }
  function closeCart() {
    document.body.classList.remove("cart-open");
    drawer.setAttribute("aria-hidden", "true");
    if (state.justOrdered) renderCart();
  }

  catRow.addEventListener("click", e => {
    const b = e.target.closest(".cat-btn");
    if (!b) return;
    $$(".cat-btn", catRow).forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    state.cat = b.dataset.cat;
    render();
  });

  let debounce;
  searchEl.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      state.q = searchEl.value.trim().toLowerCase();
      render();
    }, 140);
  });

  sortEl.addEventListener("change", () => {
    state.sort = sortEl.value;
    render();
  });

  grid.addEventListener("click", e => {
    const b = e.target.closest("[data-add]");
    if (!b) return;
    addToCart(b.dataset.add);
    b.textContent = "Added ✓";
    setTimeout(() => (b.textContent = "Add to Cart"), 1100);
    toast("Added to cart — nice pick!");
  });

  itemsEl.addEventListener("click", e => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const del = e.target.closest("[data-del]");
    if (inc) { state.cart[inc.dataset.inc]++; saveCart(); renderCart(); }
    if (dec) {
      const id = dec.dataset.dec;
      state.cart[id]--;
      if (state.cart[id] <= 0) delete state.cart[id];
      saveCart();
      renderCart();
    }
    if (del) { delete state.cart[del.dataset.del]; saveCart(); renderCart(); }
  });

  $("#cartOpenBtn").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && document.body.classList.contains("cart-open")) closeCart();
  });

  $("#checkoutBtn").addEventListener("click", () => {
    if (!cartQty()) {
      toast("Your cart is empty — browse the catalogue first");
      return;
    }
    state.cart = {};
    saveCart();
    countBadge.textContent = "0";
    totalEl.textContent = money(0);
    state.justOrdered = true;
    itemsEl.innerHTML = `
    <div class="cart-done">
      <span class="mini-stamp">Booked ✓</span>
      <p><strong>Order received!</strong><br>We'll email your confirmation shortly.<br>See you on the slope ❄</p>
    </div>`;
    toast("Booking confirmed — welcome to Porcupine!");
  });

  render();
  renderCart();
}

function initContact() {
  const form = $("#bookForm");
  if (!form) return;

  const setErr = (input, msg) => {
    const field = input.closest(".field");
    field.classList.toggle("invalid", !!msg);
    field.querySelector(".err-msg").textContent = msg;
    return !msg;
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#fName");
    const phone = $("#fPhone");
    const email = $("#fEmail");
    const date = $("#fDate");
    const pack = $("#fPack");

    let ok = true;
    ok = setErr(name, name.value.trim().length >= 2 ? "" : "Please enter your full name") && ok;
    ok = setErr(phone, /^[+]?[\d\s()-]{8,}$/.test(phone.value.trim()) ? "" : "Please enter a valid phone number") && ok;
    ok = setErr(email, email.value.trim() === "" || /^\S+@\S+\.\S+$/.test(email.value.trim()) ? "" : "Please enter a valid email") && ok;
    ok = setErr(date, date.value ? "" : "Pick a preferred date") && ok;
    ok = setErr(pack, pack.value ? "" : "Choose a package (or 'recommend me')") && ok;

    if (!ok) {
      toast("Almost there — check the highlighted fields");
      return;
    }
    form.classList.add("done");
    toast("Request received — we'll confirm within 24h ❄");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initNav();
  initReveal();
  initFaq();
  initNewsletter();
  initYear();
  initShop();
  initContact();
});
