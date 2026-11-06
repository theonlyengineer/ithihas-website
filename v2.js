/* ============================================================
   Coach Ithihax — interactions
   Vanilla JS, no dependencies. Kept light for fast mobile loads.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Nav + sticky CTA: adopt the theme of the section beneath them,
          hide the nav while scrolling down, show it when scrolling up ---- */
  var nav = document.getElementById("nav");
  var sticky = document.getElementById("sticky-cta");

  // Theme of the nearest themed element under a point (skipping the floating UI itself),
  // so the nav/CTA also invert over e.g. the dark featured plan inside a light section.
  function themeAt(y) {
    var els = document.elementsFromPoint(window.innerWidth / 2, y);
    for (var i = 0; i < els.length; i++) {
      if ((nav && nav.contains(els[i])) || (sticky && sticky.contains(els[i]))) continue;
      var room = els[i].closest("[data-theme]");
      if (room && room !== nav && room !== sticky) return room.getAttribute("data-theme");
    }
    return null;
  }

  var lastY = window.scrollY;
  var ticking = false;

  function onScrollFrame() {
    ticking = false;
    var y = window.scrollY;

    if (nav) {
      var navTheme = themeAt(nav.offsetHeight + 1);
      if (navTheme && nav.getAttribute("data-theme") !== navTheme) nav.setAttribute("data-theme", navTheme);

      if (y > 480 && y > lastY + 4) nav.classList.add("is-hidden");
      else if (y < lastY - 4 || y <= 480) nav.classList.remove("is-hidden");
    }

    if (sticky) {
      var stickyTheme = themeAt(window.innerHeight - 36);
      if (stickyTheme && sticky.getAttribute("data-theme") !== stickyTheme) sticky.setAttribute("data-theme", stickyTheme);
    }

    lastY = y;
  }

  function requestFrame() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScrollFrame); }
  }
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame);
  onScrollFrame();

  /* ---- Sticky CTA appears once the hero CTA has scrolled away,
          and steps aside while the final CTA is on screen ---- */
  if (sticky && "IntersectionObserver" in window) {
    var heroCta = document.getElementById("hero-cta");
    var endCta = document.querySelector(".cta__row");
    var state = { hero: true, end: false };
    var update = function () { sticky.classList.toggle("is-visible", !state.hero && !state.end); };
    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === heroCta) state.hero = e.isIntersecting || e.boundingClientRect.top > 0;
        if (e.target === endCta) state.end = e.isIntersecting;
      });
      update();
    });
    if (heroCta) ctaObserver.observe(heroCta);
    if (endCta) ctaObserver.observe(endCta);
  } else if (sticky) {
    sticky.classList.add("is-visible");
  }

  /* ---- Pricing tabs (ARIA tabs pattern with arrow-key support) ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var panels = document.querySelectorAll(".plans");

  function selectTab(tab, focus) {
    var target = tab.getAttribute("data-tab");
    tabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
    });
    panels.forEach(function (p) {
      var show = p.id === target;
      p.classList.toggle("is-active", show);
      p.hidden = !show;
    });
    if (focus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---- Client stories track: arrows + scroll progress ---- */
  var track = document.getElementById("cases");
  if (track) {
    var prev = document.getElementById("cases-prev");
    var next = document.getElementById("cases-next");
    var bar = document.getElementById("cases-progress");

    var step = function () {
      var card = track.querySelector(".case");
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };

    var syncTrack = function () {
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? (track.scrollLeft + track.clientWidth) / track.scrollWidth : 1;
      if (bar) bar.style.setProperty("--p", p.toFixed(3));
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    };

    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    track.addEventListener("scroll", syncTrack, { passive: true });
    window.addEventListener("resize", syncTrack);
    syncTrack();
  }

  /* ---- Count-up for numeric stats (runs once) ---- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target) || reduceMotion) return;
    var duration = 1400;
    var delay = el.closest(".hero") ? 650 : 0;
    var start = null;
    el.textContent = "0";
    function tick(now) {
      if (start === null) start = now + delay;
      var t = Math.min(Math.max((now - start) / duration, 0), 1);
      var eased = 1 - Math.pow(1 - t, 4); // power4.out
      el.textContent = String(Math.round(target * eased));
      if (t < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  /* ---- Scroll reveal + counters ---- */
  var reveals = document.querySelectorAll(".reveal");
  var counters = document.querySelectorAll("[data-count]");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = (batch * 80) + "ms";
        e.target.classList.add("is-visible");
        revealObserver.unobserve(e.target);
        batch++;
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });

    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(e.target);
        countObserver.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
