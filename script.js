/* ============================================================
   Coach Ithihax — interactions
   Vanilla JS, no dependencies. Kept light for fast mobile loads.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky nav background on scroll ---- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (window.scrollY > 24) nav.classList.add("is-stuck");
    else nav.classList.remove("is-stuck");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Pricing tabs ---- */
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".plans");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function (p) {
        var show = p.id === target;
        p.classList.toggle("is-active", show);
        p.hidden = !show;
      });
    });
  });

  /* ---- Carousel ---- */
  var track = document.getElementById("track");
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll(".slide"));
    var dotsWrap = document.getElementById("dots");
    var prev = document.querySelector(".carousel__arrow--prev");
    var next = document.querySelector(".carousel__arrow--next");

    // Build dots
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () { scrollToSlide(i); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function scrollToSlide(i) {
      var slide = slides[i];
      if (!slide) return;
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
    }

    function currentIndex() {
      var center = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestDist = Infinity;
      slides.forEach(function (s, i) {
        var sc = s.offsetLeft - track.offsetLeft + s.clientWidth / 2;
        var d = Math.abs(sc - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    var syncTimer;
    track.addEventListener("scroll", function () {
      window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(function () {
        var idx = currentIndex();
        dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
      }, 80);
    }, { passive: true });

    if (prev) prev.addEventListener("click", function () { scrollToSlide(Math.max(0, currentIndex() - 1)); });
    if (next) next.addEventListener("click", function () { scrollToSlide(Math.min(slides.length - 1, currentIndex() + 1)); });
  }

  /* ---- Lazy video embed (load iframe only on click) ---- */
  document.querySelectorAll(".video-embed").forEach(function (box) {
    box.addEventListener("click", function () {
      var src = box.getAttribute("data-video");
      if (!src || box.querySelector("iframe")) return;
      var iframe = document.createElement("iframe");
      iframe.setAttribute("src", src + "?autoplay=1&rel=0");
      iframe.setAttribute("title", "Client transformation video");
      iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("loading", "lazy");
      iframe.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;";
      box.appendChild(iframe);
    });
  });

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
