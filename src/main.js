import "./style.css";

// ── Configuration ───────────────────────────────────────────────────────
const START_FRAME = 7;
const END_FRAME   = 270;
const TOTAL       = END_FRAME - START_FRAME + 1; // 264 frames

// ── DOM References ──────────────────────────────────────────────────────
const canvas        = document.getElementById("dragonCanvas");
const ctx           = canvas.getContext("2d", { alpha: false });
const loader        = document.getElementById("loader");
const loaderBar     = document.getElementById("loaderBar");
const loaderCopy    = document.getElementById("loaderCopy");
const frameEl       = document.getElementById("frameNumber");
const heroBar       = document.getElementById("heroBar");
const heroContent   = document.getElementById("heroContent");
const heroOverlay   = document.getElementById("heroOverlay");
const stagePill     = document.getElementById("stagePill");
const stageTitle    = document.getElementById("stageTitle");

const phaseEls = [
  document.getElementById("phase1"),
  document.getElementById("phase2"),
  document.getElementById("phase3"),
  document.getElementById("phase4")
];

// ── Image State ─────────────────────────────────────────────────────────
const images       = new Array(TOTAL);
let loadedCount    = 0;
let displayedFrame = 0; // Float index for smooth interpolation
let targetFrame    = 0; // Integer target index from scroll
let isTicking      = false;
let lastDrawnIndex = -1;

function framePath(i) {
  return `/frames/frame_${String(START_FRAME + i).padStart(4, "0")}.jpg`;
}

// ── Stages definition ───────────────────────────────────────────────────
const STAGES = [
  { maxPct: 0.25, pill: "STAGE 01", title: "PRIMORDIAL GUARDIAN" },
  { maxPct: 0.55, pill: "STAGE 02", title: "STELLAR CORE IGNITION" },
  { maxPct: 0.80, pill: "STAGE 03", title: "CELESTIAL ASCENSION" },
  { maxPct: 1.00, pill: "STAGE 04", title: "COSMIC SOVEREIGN" }
];

// ── Canvas Sizing & Drawing ─────────────────────────────────────────────
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width  = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  paint(Math.round(displayedFrame));
}

// Find nearest loaded frame if current frame is not ready
function getBestImage(targetIdx) {
  if (images[targetIdx]?.complete && images[targetIdx].naturalWidth > 0) {
    return { img: images[targetIdx], idx: targetIdx };
  }
  // Search backward first, then forward
  for (let offset = 1; offset < TOTAL; offset++) {
    const prev = targetIdx - offset;
    if (prev >= 0 && images[prev]?.complete && images[prev].naturalWidth > 0) {
      return { img: images[prev], idx: prev };
    }
    const next = targetIdx + offset;
    if (next < TOTAL && images[next]?.complete && images[next].naturalWidth > 0) {
      return { img: images[next], idx: next };
    }
  }
  return null;
}

function paint(index) {
  const result = getBestImage(index);
  if (!result) return;

  const { img } = result;
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Clear canvas
  ctx.fillStyle = "#020612";
  ctx.fillRect(0, 0, w, h);

  // Cover aspect fit centered
  const iw    = img.naturalWidth || 1280;
  const ih    = img.naturalHeight || 720;
  const scale = Math.max(w / iw, h / ih);
  const dw    = iw * scale;
  const dh    = ih * scale;
  const dx    = (w - dw) / 2;
  const dy    = (h - dh) / 2;

  ctx.drawImage(img, dx, dy, dw, dh);
  lastDrawnIndex = index;

  // Update frame number readout
  if (frameEl) {
    frameEl.textContent = String(START_FRAME + index).padStart(3, "0");
  }
}

// ── Smooth Animation Loop (Lerp) ────────────────────────────────────────
function lerpTick() {
  const diff = targetFrame - displayedFrame;
  if (Math.abs(diff) < 0.2) {
    displayedFrame = targetFrame;
    paint(Math.round(displayedFrame));
    isTicking = false;
    return;
  }
  // Smooth 18% easing per frame
  displayedFrame += diff * 0.18;
  paint(Math.round(displayedFrame));
  requestAnimationFrame(lerpTick);
}

// ── Scroll Handling ─────────────────────────────────────────────────────
function onScroll() {
  const scrollY = window.scrollY;
  const hero    = document.getElementById("hero");
  if (!hero) return;

  const heroTop  = hero.offsetTop;
  const heroSpan = Math.max(1, hero.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, (scrollY - heroTop) / heroSpan));

  // Drive progress bar
  if (heroBar) {
    heroBar.style.width = (progress * 100).toFixed(1) + "%";
  }

  // Update target frame for 3D scrub
  const nextTarget = Math.min(TOTAL - 1, Math.max(0, Math.round(progress * (TOTAL - 1))));
  if (nextTarget !== targetFrame) {
    targetFrame = nextTarget;
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(lerpTick);
    }
  }

  // Update stage indicators
  let currentStageIdx = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (progress <= STAGES[i].maxPct || i === STAGES.length - 1) {
      currentStageIdx = i;
      if (stagePill)  stagePill.textContent  = STAGES[i].pill;
      if (stageTitle) stageTitle.textContent = STAGES[i].title;
      break;
    }
  }

  // Update active phase pill in hero copy
  phaseEls.forEach((el, idx) => {
    if (!el) return;
    if (idx === currentStageIdx) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });

  // Fade out hero content smoothly as user scrolls into the lore content wrapper
  // Lore content begins at scrollY = heroSpan
  const fadeStart = heroSpan * 0.78;
  if (scrollY > fadeStart) {
    const fadeOutProgress = Math.min(1, (scrollY - fadeStart) / (heroSpan * 0.22));
    const opacity = Math.max(0, 1 - fadeOutProgress);
    if (heroContent) {
      heroContent.style.opacity = opacity.toFixed(2);
      heroContent.style.transform = `translateY(calc(-50% - ${fadeOutProgress * 30}px))`;
      heroContent.style.pointerEvents = opacity <= 0.05 ? "none" : "auto";
    }
    if (heroOverlay) {
      heroOverlay.style.opacity = opacity.toFixed(2);
    }
  } else {
    if (heroContent) {
      heroContent.style.opacity = "1";
      heroContent.style.transform = "translateY(-50%)";
      heroContent.style.pointerEvents = "auto";
    }
    if (heroOverlay) {
      heroOverlay.style.opacity = "1";
    }
  }

  // Update nav links active state based on section scroll positions
  const sections = [
    { id: "hero",   link: document.querySelector('a[href="#hero"]') },
    { id: "forms",  link: document.querySelector('a[href="#forms"]') },
    { id: "power",  link: document.querySelector('a[href="#power"]') },
    { id: "cosmos", link: document.querySelector('a[href="#cosmos"]') }
  ];

  let activeId = "hero";
  for (let i = sections.length - 1; i >= 0; i--) {
    const sec = document.getElementById(sections[i].id);
    if (sec && scrollY >= sec.offsetTop - 200) {
      activeId = sections[i].id;
      break;
    }
  }

  sections.forEach(s => {
    if (s.link) {
      if (s.id === activeId) s.link.classList.add("active");
      else s.link.classList.remove("active");
    }
  });
}

// ── Preload Strategy ────────────────────────────────────────────────────
function preloadImages() {
  return new Promise((resolve) => {
    // First, load frame 0 immediately so we paint instantly
    const initialImg = new Image();
    initialImg.decoding = "async";
    initialImg.onload = () => {
      images[0] = initialImg;
      loadedCount++;
      paint(0);
    };
    initialImg.src = framePath(0);

    let completed = 0;
    const batchSize = 12; // Controlled concurrency to avoid network choke
    let currentIdx = 0;

    function loadNext() {
      if (currentIdx >= TOTAL) return;
      const idx = currentIdx++;
      const img = new Image();
      img.decoding = "async";

      img.onload = () => {
        images[idx] = img;
        completed++;
        loadedCount++;
        const pct = Math.round((loadedCount / TOTAL) * 100);
        if (loaderBar) loaderBar.style.width = pct + "%";
        if (loaderCopy) loaderCopy.textContent = `Awakening the celestial beast… ${pct}%`;

        // Once 25% is loaded, let user start exploring while rest streams in
        if (completed === Math.floor(TOTAL * 0.25)) {
          resolve();
        }
        if (completed >= TOTAL) {
          resolve();
        }
        loadNext();
      };

      img.onerror = () => {
        completed++;
        loadNext();
        if (completed >= TOTAL) resolve();
      };

      img.src = framePath(idx);
    }

    // Launch concurrent batches
    for (let b = 0; b < batchSize; b++) {
      loadNext();
    }
  });
}

// ── Initialization ──────────────────────────────────────────────────────
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", resize);

(async function init() {
  resize();
  await preloadImages();
  resize();
  paint(0);
  onScroll();

  if (loaderCopy) loaderCopy.textContent = "Celestial Dragon Awakened";
  setTimeout(() => {
    loader?.classList.add("done");
  }, 400);
})();
