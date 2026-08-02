/**
 * OSIS Putra SMAFISTA — Website Multi-Page
 * index.html              → lobby / gateway (navigasi ke 2 website)
 * osis-2025-2026.html     → website periode pertama (legacy site)
 * osis-2026-2027.html     → website periode kedua (modern site)
 *
 * Fitur: skeleton loading, parallax lobby, navigasi antar halaman,
 * carousel, ticker divisi (drag + physics), reveal animations,
 * smooth anchor, lightbox divisi, reset state saat back browser.
 */

document.addEventListener("DOMContentLoaded", () => {
  const body    = document.body;
  const page    = body.dataset.page || "index";
  const lobby   = document.querySelector(".osis-lobby");
  const stages  = document.querySelectorAll(".generation-stage");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Skeleton loading ───────────────────────────────────────────────── */

  const skeleton = document.getElementById("skeletonLoader");

  function hideSkeleton() {
    if (!skeleton) return;
    skeleton.classList.add("skeleton-hidden");
  }

  /* Sembunyikan skeleton setelah seluruh aset (gambar, dll) selesai dimuat */
  window.addEventListener("load", hideSkeleton);
  /* Jaga-jaga: paksa hilang setelah 4 detik agar tidak pernah menggantung */
  window.setTimeout(hideSkeleton, 4000);

  /* ── Reset state saat kembali via tombol back browser (bfcache) ────── */

  /* Saat user menekan tombol "back" bawaan Chrome, halaman index sering
     di-restore dari bfcache. State "is-changing-page" (yang memunculkan
     overlay blur/transisi) masih menempel di body → halaman jadi blur.
     Solusi: reset semua state kelas + variabel parallax (tanpa reload agar
     tidak memunculkan skeleton lagi), sama seperti hasil akhir saat user
     menekan tombol "Kembali". */
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      body.classList.remove("is-changing-page", "is-opening-site", "site-open", "site-open-with-host");
      body.classList.add("is-lobby");
      body.style.setProperty("--modern-parallax-x", "0px");
      body.style.setProperty("--modern-parallax-y", "0px");
      if (lobby) {
        lobby.style.setProperty("--scene-x", "0px");
        lobby.style.setProperty("--scene-y", "0px");
      }
      hideSkeleton();
    }
  });

  /* Pengaman tambahan: pastikan tidak ada state blur tersisa sejak awal */
  body.classList.remove("is-changing-page", "is-opening-site", "site-open-with-host");

  /* ── Helpers ────────────────────────────────────────────────────────── */

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  function createRipple(stage, e) {
    const rect   = stage.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className    = "click-ripple";
    ripple.style.width  = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left   = `${e.clientX - rect.left  - size / 2}px`;
    ripple.style.top    = `${e.clientY - rect.top   - size / 2}px`;
    stage.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  }

  /* =====================================================================
     HALAMAN INDEX (LOBBY) — navigasi ke website periode
     ===================================================================== */

  const PAGE_FOR_GENERATION = {
    "2024": "osis-2025-2026.html",
    "2026": "osis-2026-2027.html",
  };

  function openGeneration(key, stage, e) {
    if (stage && e) createRipple(stage, e);
    const target = PAGE_FOR_GENERATION[key] || "index.html";

    stages.forEach(s => s.classList.toggle("is-selected", s === stage));
    body.classList.add("is-changing-page");
    window.setTimeout(() => {
      window.location.href = target;
    }, reduced ? 0 : 420);
  }

  if (page === "index" && lobby) {
    /* ── Pointer / parallax lobby ──────────────────────────────────── */

    const lobbyItems = Array.from(document.querySelectorAll("[data-parallax]"));
    let raf = 0;

    function applyLobbyParallax(e) {
      if (reduced) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        const sx = clamp((x - 0.5) * 34, -18, 18);
        const sy = clamp((y - 0.5) * 28, -16, 16);

        /* CATATAN PERFORMA:
           --pointer-x/y sengaja TIDAK diubah → efek shine (gradien
           full-screen) tetap statis sehingga browser tidak perlu
           me-raster ulang gradien setiap frame (sumber lag terbesar).
           Hanya --scene-x/y + translate elemen yang digerakkan
           (transform/translate = murni composite GPU, sangat ringan). */
        lobby.style.setProperty("--scene-x", `${sx}px`);
        lobby.style.setProperty("--scene-y", `${sy}px`);
        body.style.setProperty("--modern-parallax-x", `${(sx * 0.45).toFixed(2)}px`);
        body.style.setProperty("--modern-parallax-y", `${(sy * 0.45).toFixed(2)}px`);

        lobbyItems.forEach(item => {
          const d  = Number(item.dataset.parallax || 0.2);
          const mx = clamp((x - 0.5) * d * 86, -38, 38).toFixed(2);
          const my = clamp((y - 0.5) * d * 62, -30, 30).toFixed(2);
          item.style.translate = `${mx}px ${my}px`;
        });
      });
    }

    function onPointerLeave() {
      if (raf) cancelAnimationFrame(raf);
      lobby.style.setProperty("--scene-x", "0px");
      lobby.style.setProperty("--scene-y", "0px");
      body.style.setProperty("--modern-parallax-x", "0px");
      body.style.setProperty("--modern-parallax-y", "0px");
      lobbyItems.forEach(item => { item.style.translate = "0px 0px"; });
    }

    /* Parallax diaktifkan, TAPI hanya yang ringan:
       - gambar background ikut gerak (translate = GPU composite)
       - logo/foto orang ikut gerak halus
       - efek shine DIKUNCI statis (tidak mengikuti pointer) */
    window.addEventListener("pointermove",  applyLobbyParallax, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    /* ── Stage cards: hover + klik navigasi ────────────────────────── */

    stages.forEach((stage, i) => {
      stage.style.setProperty("--card-index", i);
      stage.addEventListener("mouseenter", () => stage.classList.add("is-selected"));
      stage.addEventListener("mouseleave", () => stage.classList.remove("is-selected"));
      stage.addEventListener("click", e => openGeneration(stage.dataset.openGeneration, stage, e));
    });
  }

  /* =====================================================================
     HALAMAN OSIS 2025/2026 (LEGACY SITE)
     ===================================================================== */

  if (page === "osis-2025-2026") {
    /* ── Carousel (Visi Misi) ──────────────────────────────────────── */

    function setupCarousel() {
      const carousel = document.getElementById("carouselImages");
      if (!carousel || !carousel.children.length) return;

      let current = 0;
      const total = carousel.children.length;
      const goTo  = n => {
        current = n;
        carousel.style.transform = `translateX(-${current * 100}%)`;
      };

      window.nextSlide = () => goTo((current + 1) % total);
      window.prevSlide = () => goTo((current - 1 + total) % total);
      window.setInterval(window.nextSlide, 5000);
    }

    /* ── Ticker marquee (divisi) — auto-scroll kiri + drag kanan/kiri
          dengan physics (momentum + friksi saat dilempar) ─────────── */

    function setupTicker() {
      const ticker = document.querySelector(".ticker");
      if (!ticker || ticker.dataset.ready === "true") return;

      ticker.dataset.ready = "true";
      ticker.innerHTML += ticker.innerHTML;

      const speed = 0.85;                       /* kecepatan auto-scroll (px/frame) */
      const friction = 0.93;                    /* friksi momentum saat dilempar     */
      const minFling = 0.3;                     /* ambang agar dilempar ≠ auto lagi  */

      const loopWidth = () => ticker.scrollWidth / 2;

      let pos       = 0;                        /* posisi translateX saat ini */
      let dragging  = false;
      let auto      = true;                     /* true = auto-scroll aktif   */
      let lastX     = 0;
      let lastT     = 0;
      let velocity  = 0;                        /* momentum per-frame */

      ticker.style.cursor        = "grab";
      ticker.style.userSelect    = "none";
      ticker.style.willChange    = "transform";
      ticker.style.touchAction   = "pan-y";     /* scroll vertikal tetap jalan, drag horizontal diproses JS */

      /* Jaga posisi selalu dalam satu putaran (agar wrap mulus) */
      function wrap() {
        const w = loopWidth();
        if (!w) return;
        while (pos > 0)      pos -= w;
        while (pos <= -w)    pos += w;
      }

      function apply() {
        ticker.style.transform = `translateX(${pos}px)`;
      }

      function frame() {
        if (auto) {
          pos -= speed;
          wrap();
        } else if (!dragging) {
          /* Momentum hasil lemparan → melambat karena friksi */
          if (Math.abs(velocity) > 0.06) {
            pos += velocity;
            velocity *= friction;
            wrap();
          } else {
            velocity = 0;
            auto = true;
          }
        }
        apply();
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      function onDown(e) {
        dragging = true;
        auto     = false;
        velocity = 0;
        lastX    = e.clientX;
        lastT    = performance.now();
        ticker.style.cursor = "grabbing";
        ticker.classList.add("is-dragging");
        try { ticker.setPointerCapture(e.pointerId); } catch (_) {}
        if (e.cancelable) e.preventDefault();
      }

      function onMove(e) {
        if (!dragging) return;
        const now = performance.now();
        const dt  = Math.max(now - lastT, 1);
        const dx  = e.clientX - lastX;

        pos += dx;
        /* kecepatan dinormalisasi ke per-frame (~60fps) agar konsisten */
        velocity = (dx / dt) * 16.67;

        lastX = e.clientX;
        lastT = now;
        wrap();
        apply();
      }

      function onUp(e) {
        if (!dragging) return;
        dragging = false;
        ticker.style.cursor = "grab";
        ticker.classList.remove("is-dragging");
        try { ticker.releasePointerCapture(e.pointerId); } catch (_) {}

        /* Jika dilempar cukup cepat → lanjut dengan momentum (physics).
           Jika pelan → langsung kembali ke auto-scroll. */
        if (Math.abs(velocity) < minFling) {
          velocity = 0;
          auto     = true;
        }
      }

      ticker.addEventListener("pointerdown", onDown);
      ticker.addEventListener("pointermove", onMove);
      ticker.addEventListener("pointerup",   onUp);
      ticker.addEventListener("pointercancel", onUp);

      /* Hover pause hanya untuk perangkat dengan kursor (desktop).
         Jangan membatalkan momentum saat dilempar (fling). */
      if (window.matchMedia("(hover: hover)").matches) {
        ticker.addEventListener("mouseenter", () => { if (!dragging) auto = false; });
        ticker.addEventListener("mouseleave", () => {
          if (!dragging && Math.abs(velocity) < 0.06) auto = true;
        });
      }
    }

    /* ── Reveal animasi elemen legacy ──────────────────────────────── */

    function setupRevealAnimations() {
      const targets = document.querySelectorAll(".fadeUp, .card");
      if (!targets.length) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("ukuranNormal"); });
      }, { threshold: 0.12 });
      targets.forEach(t => obs.observe(t));
    }

    /* ── Smooth anchor links ───────────────────────────────────────── */

    function setupSmoothAnchors() {
      document.querySelectorAll('.osis-site-shell a[href^="#"], .legacy-site a[href^="#"]').forEach(a => {
        a.addEventListener("click", e => {
          const target = document.getElementById(a.getAttribute("href").slice(1));
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        });
      });
    }

    setupCarousel();
    setupTicker();
    setupRevealAnimations();
    setupSmoothAnchors();
  }

  /* =====================================================================
     HALAMAN OSIS 2026/2027 (MODERN SITE)
     ===================================================================== */

  if (page === "osis-2026-2027") {
    /* ── Navigasi & reveal modern site ─────────────────────────────── */

    function setupModernNavigation() {
      const links    = document.querySelectorAll(".modern-actionbar a[href^='#modern-']");
      const sections = document.querySelectorAll("#modern-home, #modern-vimi, #modern-divisi, #modern-alumni, #modern-events");

      if (!links.length) return;

      /* Reveal biasa (panel, blockquote, events) */
      const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
      }, { threshold: 0.18 });

      document.querySelectorAll(".modern-panel, .modern-quote-row blockquote, .modern-event-list article")
              .forEach(el => revealObs.observe(el));

      /* Stagger reveal kartu Divisi */
      const divGrid = document.querySelector(".modern-division-grid");
      if (divGrid) {
        const divCards = Array.from(divGrid.children);
        const divObs   = new IntersectionObserver((entries, obs) => {
          entries.forEach(e => {
            if (!e.isIntersecting) return;
            divCards.forEach(c => c.classList.add("is-visible"));
            obs.disconnect();
          });
        }, { threshold: 0.1 });
        divObs.observe(divGrid);
      }

      /* Highlight link navigasi aktif */
      function updateActiveLink() {
        let activeId   = "modern-home";
        const midpoint = window.innerHeight * 0.34;
        sections.forEach(sec => {
          const r = sec.getBoundingClientRect();
          if (r.top <= midpoint && r.bottom > midpoint) activeId = sec.id;
        });
        links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === `#${activeId}`));
      }

      window.addEventListener("scroll", updateActiveLink, { passive: true });
      window.addEventListener("resize", updateActiveLink);
      updateActiveLink();
    }

    /* ── Lightbox foto Divisi ──────────────────────────────────────── */

    function setupDivisionLightbox() {
      const lightbox    = document.getElementById("divisionLightbox");
      const lbImage     = document.getElementById("divisionLightboxImage");
      const lbName      = document.getElementById("divisionLightboxName");
      const lbCount     = document.getElementById("divisionLightboxCount");
      const photoCards  = Array.from(
        document.querySelectorAll(".modern-division-grid article")
      ).filter(c => c.querySelector("img"));

      if (!lightbox || !lbImage || !photoCards.length) return;

      /* Preload semua foto */
      photoCards.forEach(card => {
        const src = card.querySelector("img")?.src;
        if (src) Object.assign(new Image(), { src });
      });

      let current   = 0;
      let slideTimer;

      function commitContent() {
        const card  = photoCards[current];
        const img   = card.querySelector("img");
        const title = card.querySelector("strong")?.textContent || img.alt || "Divisi";
        lbImage.src     = img.src;
        lbImage.alt     = img.alt || title;
        if (lbName)  lbName.textContent  = title;
        if (lbCount) lbCount.textContent = `${current + 1} / ${photoCards.length}`;
      }

      const OUT_MS = 200;
      const IN_MS  = 440;

      function animateSlide(direction) {
        window.clearTimeout(slideTimer);

        const outClass = direction > 0 ? "slide-out-left"  : "slide-out-right";
        const inClass  = direction > 0 ? "slide-in-right"  : "slide-in-left";

        lbImage.classList.remove("slide-out-left", "slide-out-right", "slide-in-left", "slide-in-right");
        lbImage.classList.add(outClass);

        slideTimer = window.setTimeout(() => {
          commitContent();
          void lbImage.offsetWidth;

          lbImage.classList.remove(outClass);
          lbImage.classList.add(inClass);

          slideTimer = window.setTimeout(() => {
            lbImage.classList.remove(inClass);
          }, IN_MS + 20);
        }, OUT_MS + 10);
      }

      function openLightbox(index) {
        current = index;
        lbImage.classList.remove("slide-out-left", "slide-out-right", "slide-in-left", "slide-in-right");
        commitContent();
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        body.classList.add("lightbox-open");
      }

      function closeLightbox() {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        body.classList.remove("lightbox-open");
      }

      function moveLightbox(dir) {
        current = (current + dir + photoCards.length) % photoCards.length;
        animateSlide(dir);
      }

      photoCards.forEach((card, i) => {
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `Buka foto ${card.querySelector("strong")?.textContent || "divisi"}`);
        card.addEventListener("click",   () => openLightbox(i));
        card.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
        });
      });

      lightbox.querySelectorAll("[data-division-close]").forEach(b => b.addEventListener("click", closeLightbox));
      lightbox.querySelector("[data-division-prev]")?.addEventListener("click", () => moveLightbox(-1));
      lightbox.querySelector("[data-division-next]")?.addEventListener("click", () => moveLightbox(1));

      window.addEventListener("keydown", e => {
        if (!lightbox.classList.contains("is-open")) return;
        if (e.key === "Escape")     closeLightbox();
        if (e.key === "ArrowLeft")  moveLightbox(-1);
        if (e.key === "ArrowRight") moveLightbox(1);
      });
    }

    /* ── Parallax scroll modern site ───────────────────────────────── */

    function setupScrollParallax() {
      if (reduced) return;
      const scrollItems = Array.from(document.querySelectorAll("[data-parallax-scroll]"));

      function applyScrollParallax() {
        if (!scrollItems.length) return;
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
        scrollItems.forEach(item => {
          const d = Number(item.dataset.parallaxScroll || 0.1);
          item.style.translate = `0px ${(scrollY * d).toFixed(2)}px`;
        });
      }

      window.addEventListener("scroll", applyScrollParallax, { passive: true });
      window.addEventListener("resize", applyScrollParallax);
      applyScrollParallax();
    }

    setupModernNavigation();
    setupDivisionLightbox();
    setupScrollParallax();
  }
});

