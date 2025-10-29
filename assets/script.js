document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- AOS ---------------- */
  if (window.AOS) {
    AOS.init({ duration: 700, once: true });
  }

  /* ---------------- Leaflet Map ---------------- */
  const mapEl = document.getElementById("leaflet-map");
  if (mapEl && window.L) {
    const map = L.map("leaflet-map").setView([37.5665, 126.9780], 12);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
        'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    const spots = [
      { name: "Gyeongbokgung", coord: [37.5796, 126.9770] },
      { name: "Bukchon Hanok", coord: [37.5826, 126.9830] },
      { name: "N Seoul Tower", coord: [37.5512, 126.9882] },
      { name: "The Hyundai Seoul", coord: [37.5253, 126.9287] },
      { name: "Gwangjang Market", coord: [37.5700, 126.9990] },
      { name: "Seongsu-dong", coord: [37.5442, 127.0494] },
      { name: "Lotte World Tower", coord: [37.5125, 127.1028] },
      { name: "Hongdae", coord: [37.5566, 126.9229] },
      { name: "Gwanghwamun Gate", coord: [37.576068, 126.976955] },
      { name: "Cheonggyecheon", coord: [37.5687, 127.0038] },
      { name: "Dongdaemun Design Plaza (DDP)", coord: [37.56657, 127.00914] }
    ];
    spots.forEach((s) => L.marker(s.coord).addTo(map).bindPopup(s.name));
    window.appMap = map;
  }

  /* ---------------- Glide ---------------- */
  function initGlide(root, opts) {
    const el = typeof root === "string" ? document.querySelector(root) : root;
    if (!el || !window.Glide) return null;
    const g = new Glide(el, Object.assign({
      type: "carousel",
      perView: 1,
      autoplay: 3500,
      hoverpause: true,
      animationDuration: 700,
    }, opts || {}));
    g.mount();
    el._glide = g;
    return g;
  }

  initGlide(".hero-glide", {
    autoplay: 3800,
    animationDuration: 900,
    hoverpause: false
  });

  initGlide("#highlights .glide", { autoplay: 3600 });

  function rebuildGlide(containerSel) {
    const container = document.querySelector(containerSel);
    if (!container || !container._glide) return;
    const instance = container._glide;
    const track = container.querySelector(".glide__track .glide__slides");
    if (!track) return;

    instance.destroy();

    // display !== none 인 것만 순서대로 재삽입
    const slides = Array.from(track.children);
    track.innerHTML = "";
    slides.filter(li => li.style.display !== "none").forEach(li => track.appendChild(li));

    // 다시 mount
    initGlide(container, { autoplay: 3600 });
  }

  /* ---------------- 커버 타이틀/CTA 인터랙션 ---------------- */
  // 글자별 살짝 뜨는 효과
  const titleSpan = document.querySelector('.interactive-title > span');
  if (titleSpan) {
    const text = titleSpan.textContent;
    titleSpan.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = ch;
      s.style.display = 'inline-block';
      s.style.transition = 'transform .12s ease, text-shadow .12s ease';
      s.style.margin = '0 .02em';
      s.style.animation = `floaty 4.2s ease-in-out ${i * 60}ms infinite`;
      titleSpan.appendChild(s);
    });

    titleSpan.addEventListener('mousemove', (e) => {
      if (e.target.classList.contains('ch')) {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.textShadow = '0 6px 14px rgba(0,0,0,.35)';
        setTimeout(() => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.textShadow = '';
        }, 180);
      }
    });

    const styleFloat = document.createElement('style');
    styleFloat.textContent = `
      @keyframes floaty {
        0% { transform: translateY(0) }
        50% { transform: translateY(-2px) }
        100% { transform: translateY(0) }
      }`;
    document.head.appendChild(styleFloat);
  }

  // CTA 버튼 리액션
  const funBtn = document.querySelector('.cover-cta');
  if (funBtn) {
    funBtn.addEventListener('click', () => {
      funBtn.animate(
        [
          { transform: 'translateY(-1px) scale(1.02)' },
          { transform: 'translateY(0) scale(0.98)' },
          { transform: 'translateY(0) scale(1)' }
        ],
        { duration: 260, easing: 'ease-out' }
      );
    });
  }

  /* ---------------- VisitSeoul Header ---------------- */
  const menuBtn    = document.querySelector(".vk-menu");
  const searchWrap = document.getElementById("vkSearch");
  if (menuBtn && searchWrap) {
    menuBtn.addEventListener("click", () => {
      const open = searchWrap.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      if (open) {
        const input = document.getElementById("globalSearch");
        input && input.focus();
      }
    });
  }

  /* =================================================
     Search: Gallery + Highlights + Map flyTo
     ================================================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const form  = $("#globalSearchForm");
  const input = $("#globalSearch");

  const SPOT_INDEX = {
    "gwanghwamun":       { coord: [37.5759, 126.9769], popup: "Gwanghwamun Gate" },
    "gwanghwamun gate":  { coord: [37.5759, 126.9769], popup: "Gwanghwamun Gate" },
    "ddp":               { coord: [37.5663, 127.0091], popup: "DDP (Dongdaemun Design Plaza)" },
    "dongdaemun design plaza": { coord: [37.5663, 127.0091], popup: "DDP" },
    "bukchon":           { coord: [37.5826, 126.9830], popup: "Bukchon Hanok Village" },
    "hanok":             { coord: [37.5826, 126.9830], popup: "Bukchon Hanok Village" },
    "hangang":           { coord: [37.5129, 126.9970], popup: "Hangang (Banpo area)" },
    "han river":         { coord: [37.5129, 126.9970], popup: "Hangang (Banpo area)" },
    "cheonggyecheon":    { coord: [37.5699, 126.9786], popup: "Cheonggyecheon" },
    "cheonggyecheon billboard": { coord: [37.5699, 126.9786], popup: "Cheonggyecheon LED" },
  };

  const tokenize = (str) =>
    (str || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .split(/\s+/)
      .filter(Boolean);

  function matches(el, tokens) {
    // Priority: data-tags > data-title > alt Text
    const img = el.querySelector?.("img");
    const hay =
      (el.getAttribute?.("data-tags") || "") + " " +
      (el.getAttribute?.("data-title") || "") + " " +
      (img?.alt || "");
    const hayL = hay.toLowerCase();
    return tokens.every(t => hayL.includes(t));
  }

  function filterGallery(q) {
    const tokens = tokenize(q);
    const items = $$("#gallery .grid a");
    let showCnt = 0;
    items.forEach(a => {
      const ok = tokens.length ? matches(a, tokens) : true;
      a.style.display = ok ? "" : "none";
      if (ok) showCnt++;
    });
    if (showCnt) $("#gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function filterHighlights(q) {
    const tokens = tokenize(q);
    const container = document.querySelector("#highlights .glide");
    const track = container?.querySelector(".glide__track .glide__slides");
    if (!container || !track) return;

    const slides = $$("#highlights .glide__slides > li");
    slides.forEach(li => {
      const ok = tokens.length ? matches(li, tokens) : true;
      li.style.display = ok ? "" : "none";
    });

    rebuildGlide("#highlights .glide");
  }

  function flyMapIfMatch(q) {
    const lower = (q || "").toLowerCase();
    const key = Object.keys(SPOT_INDEX).find(k => lower.includes(k));
    if (!key) return;

    const info = SPOT_INDEX[key];
    const map = window.appMap;
    if (map && window.L) {
      map.flyTo(info.coord, 15, { duration: 1.2 });
      L.popup().setLatLng(info.coord).setContent(info.popup).openOn(map);
    }
  }

  function runSearch(q) {
    const query = (q || "").trim();
    if (!query) {
      // 초기화: 모두 표시
      filterGallery("");
      filterHighlights("");
      return;
    }
    filterGallery(query);
    flyMapIfMatch(query);
  }

  // Form submit
  if (form && input && !form.dataset.bound) {
    form.dataset.bound = "1";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      runSearch(input.value);
    });
  }

  $$(".vk-hotkeys [data-k]").forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-k") || "";
      if (input) input.value = val;
      runSearch(val);
    });
  });

  const formContact = document.getElementById("contactForm");
  if (formContact && window.Parsley && window.$) {
    $(formContact).parsley();
  } else if (formContact) {
    formContact.addEventListener("submit", (e) => {
      const ok = [...formContact.querySelectorAll("[required]")].every(
        (el) => el.value.trim() !== ""
      );
      if (!ok) {
        e.preventDefault();
        alert("Please fill all fields.");
      }
    });
  }
});

// === Build hover info cards from data-title ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#gallery .grid a').forEach(a => {
    if (a.querySelector('.hover-info')) return;

    let html = a.getAttribute('data-title');

    if (!html) {
      const alt = a.querySelector('img')?.alt || 'Seoul';
      html = `<span class="place">${alt}</span>`;
    }

    const box = document.createElement('div');
    box.className = 'hover-info';
    box.innerHTML = html;
    a.appendChild(box);
  });
});