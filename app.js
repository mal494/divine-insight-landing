/* ============ Divine Insight — landing interactions ============ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- starfield ---------- */
  (function starfield() {
    var canvas = document.getElementById("stars");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var shooting = [];
    var W, H;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      seed();
    }

    function seed() {
      stars = [];
      var n = Math.min(220, Math.floor((W * H) / 9000));
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.4 + 0.3,
          base: Math.random() * 0.55 + 0.25,
          speed: Math.random() * 1.6 + 0.4,
          phase: Math.random() * Math.PI * 2,
          gold: Math.random() < 0.18
        });
      }
    }

    function spawnShooting() {
      shooting.push({
        x: Math.random() * W * 0.7 + W * 0.15,
        y: Math.random() * H * 0.3,
        vx: -(Math.random() * 5 + 6),
        vy: Math.random() * 2.5 + 2,
        life: 1
      });
      setTimeout(spawnShooting, Math.random() * 7000 + 4000);
    }

    var t = 0;
    function frame() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      var i, s;
      for (i = 0; i < stars.length; i++) {
        s = stars[i];
        var tw = s.base + Math.sin(t * s.speed + s.phase) * 0.28;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold
          ? "rgba(227,195,124," + tw.toFixed(3) + ")"
          : "rgba(220,220,255," + tw.toFixed(3) + ")";
        ctx.fill();
      }
      for (i = shooting.length - 1; i >= 0; i--) {
        var sh = shooting[i];
        sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.02;
        if (sh.life <= 0 || sh.x < -80 || sh.y > H + 80) { shooting.splice(i, 1); continue; }
        var grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 9, sh.y - sh.vy * 9);
        grad.addColorStop(0, "rgba(240,215,154," + (sh.life * 0.9).toFixed(3) + ")");
        grad.addColorStop(1, "rgba(240,215,154,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 9, sh.y - sh.vy * 9);
        ctx.stroke();
      }
      requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    resize();
    if (!prefersReduced) {
      frame();
      setTimeout(spawnShooting, 2500);
    } else {
      // static starfield, one paint
      t = 1.2;
      ctx.clearRect(0, 0, W, H);
      stars.forEach(function (s) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold ? "rgba(227,195,124,0.5)" : "rgba(220,220,255,0.5)";
        ctx.fill();
      });
    }
  })();

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }, { passive: true });

  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- reveal on scroll ---------- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { revealObs.observe(el); });

  /* ---------- animated counters ---------- */
  var counted = new WeakSet();
  var countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || counted.has(e.target)) return;
      counted.add(e.target);
      var target = parseInt(e.target.getAttribute("data-count"), 10) || 0;
      if (prefersReduced) { e.target.textContent = target; return; }
      var start = null, dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        e.target.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".stat-num").forEach(function (el) { countObs.observe(el); });

  /* ---------- footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* =====================================================
     Interactive three-card draw
     ===================================================== */
  /* Pinned Core release — mirrors the `core.version` file at the repo root.
     Like every Divine Insight branch, this page consumes a versioned Core
     release rather than bundling its own copy of the card data. */
  var CORE_VERSION = "v1.6.1";
  var CORE_URL = "https://raw.githubusercontent.com/mal494/divine-insight-core/" +
    CORE_VERSION + "/data/tarot_data_v1.6.1.json";

  var SUIT_GLYPHS = { Wands: "♣", Cups: "♥", Swords: "♠", Pentacles: "♦" };

  function toRoman(n) {
    var table = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    var s = "";
    table.forEach(function (pair) {
      while (n >= pair[0]) { s += pair[1]; n -= pair[0]; }
    });
    return s || "0";
  }

  function truncate(s, max) {
    s = String(s || "");
    return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
  }

  function mapCoreCard(c) {
    var isMajor = c.arcana === "Major";
    var up = (c.meanings && c.meanings.upright) || {};
    var rev = (c.meanings && c.meanings.reversed) || {};
    return {
      num: isMajor ? toRoman(c.number) : String(c.number),
      name: c.name,
      glyph: isMajor ? "✦" : (SUIT_GLYPHS[c.suit] || "✦"),
      keys: (up.keywords || []).slice(0, 3).join(" · "),
      up: truncate(up.description, 150),
      rev: truncate(rev.description, 150)
    };
  }

  var deckPromise = null;
  function loadFullDeck() {
    if (!deckPromise) {
      deckPromise = fetch(CORE_URL)
        .then(function (res) {
          if (!res.ok) throw new Error("core fetch failed");
          return res.json();
        })
        .then(function (data) {
          var cards = (data.cards || [])
            .map(mapCoreCard)
            .filter(function (c) { return c.name && c.up; });
          return cards.length >= 78 ? cards : null;
        })
        .catch(function () { return null; })
        .then(function (cards) { return cards || FALLBACK_DECK; });
    }
    return deckPromise;
  }

  /* Offline fallback: a small teaser deck used only if Core can't be reached. */
  var FALLBACK_DECK = [
    { num: "0", name: "The Fool", glyph: "☀",
      keys: "Beginnings · spontaneity · leap of faith",
      up: "A new journey beckons — trust the step into the unknown.",
      rev: "Recklessness or hesitation — look before you leap, but do leap." },
    { num: "I", name: "The Magician", glyph: "✦",
      keys: "Willpower · creation · resourcefulness",
      up: "You have every tool you need — focus your will and create.",
      rev: "Untapped talent or misdirection — reclaim your focus." },
    { num: "II", name: "The High Priestess", glyph: "☾",
      keys: "Intuition · mystery · inner voice",
      up: "Trust your intuition — the answer is already within you.",
      rev: "Secrets or ignored instincts — listen more closely." },
    { num: "III", name: "The Empress", glyph: "❀",
      keys: "Abundance · nurture · creativity",
      up: "Abundance flows — nurture your ideas and they will bloom.",
      rev: "Creative block or smothering care — give things room to grow." },
    { num: "IV", name: "The Emperor", glyph: "♔",
      keys: "Structure · authority · stability",
      up: "Order brings power — build solid foundations and lead.",
      rev: "Rigidity or control struggles — loosen your grip." },
    { num: "V", name: "The Lovers", glyph: "♥",
      keys: "Union · choices · alignment",
      up: "A meaningful union or choice — align heart with values.",
      rev: "Misalignment or a hard choice — examine what truly matters." },
    { num: "VII", name: "The Chariot", glyph: "➶",
      keys: "Direction · determination · victory",
      up: "Steady determination carries you forward — victory is near.",
      rev: "Scattered effort or lost direction — re-take the reins." },
    { num: "VIII", name: "Strength", glyph: "🦁",
      keys: "Courage · patience · gentle power",
      up: "Quiet courage overcomes — meet challenges with patience.",
      rev: "Self-doubt or raw emotion — tame it with compassion." }
  ];
  var POSITIONS = ["Past", "Present", "Future"];

  var spread = document.getElementById("spread");
  var drawBtn = document.getElementById("drawBtn");
  var againBtn = document.getElementById("againBtn");
  var hint = document.getElementById("drawHint");
  var slots = Array.prototype.slice.call(spread.querySelectorAll(".slot"));
  var drawn = false;

  function shuffled(arr) {
    var a = arr.slice(), i, j, tmp;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function buildCard(card, pos) {
    var reversed = Math.random() < 0.28;
    var el = document.createElement("div");
    el.className = "tarot-card" + (reversed ? " is-reversed" : "");
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", pos + " card, face down. Activate to reveal.");
    el.innerHTML =
      '<div class="card-inner">' +
        '<div class="card-face card-back">' +
          '<span class="back-glyph">✦</span>' +
          '<span class="back-word">Divine Insight</span>' +
        "</div>" +
        '<div class="card-face card-front">' +
          '<span class="card-pos">' + pos + "</span>" +
          '<span class="card-num">' + card.num + "</span>" +
          '<span class="card-glyph">' + card.glyph + "</span>" +
          '<span class="card-name">' + card.name + "</span>" +
          '<span class="card-orient">' + (reversed ? "Reversed" : "Upright") + "</span>" +
          '<span class="card-keys">' + card.keys + "</span>" +
          '<span class="card-meaning">' + (reversed ? card.rev : card.up) + "</span>" +
        "</div>" +
      "</div>";

    function flip() {
      if (el.classList.contains("flipped")) return;
      el.classList.add("flipped");
      el.setAttribute("aria-label", pos + ": " + card.name + ", " + (reversed ? "reversed" : "upright") + ".");
      var remaining = spread.querySelectorAll(".tarot-card:not(.flipped)").length;
      if (remaining === 0) {
        hint.textContent = "The cards have spoken — reflect, then draw again whenever you're ready.";
        againBtn.hidden = false;
      } else {
        hint.textContent = remaining + (remaining === 1 ? " card" : " cards") + " still face down — tap to reveal.";
      }
    }
    el.addEventListener("click", flip);
    el.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); flip(); }
    });
    return el;
  }

  function draw() {
    // clear previous
    slots.forEach(function (s) { s.querySelector(".slot-card").innerHTML = ""; });
    againBtn.hidden = true;
    drawBtn.disabled = true;
    var originalLabel = drawn ? "Reshuffle" : "Shuffle & draw";
    drawBtn.textContent = "Consulting the deck…";
    hint.textContent = "Reaching out to the full 78-card canon…";

    loadFullDeck().then(function (deck) {
      var picks = shuffled(deck).slice(0, 3);
      hint.textContent = "The cards are dealt — tap each one to reveal its meaning.";
      picks.forEach(function (card, i) {
        var holder = slots[i].querySelector(".slot-card");
        var el = buildCard(card, POSITIONS[i]);
        holder.appendChild(el);
        // staggered deal-in
        setTimeout(function () { el.classList.add("dealt"); }, prefersReduced ? 0 : 180 * i + 120);
      });
      drawn = true;
      drawBtn.disabled = false;
      drawBtn.textContent = "Reshuffle";
    });
  }

  drawBtn.addEventListener("click", draw);
  againBtn.addEventListener("click", draw);
})();
