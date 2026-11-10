// Firewall Games site interactions. No dependencies.
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ART = 'images/internet-please/svg/';
  var ICONS = 'images/internet-please/icons.svg#';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var PACKETS = [
    ['video', 'Video'], ['live-stream', 'Live stream'], ['social-photo', 'Social photos'], ['short-video', 'Short videos'],
    ['microblog', 'Microblogs'], ['messaging', 'Messaging'], ['video-call', 'Video calls'], ['music', 'Music'],
    ['shopping', 'Shopping'], ['news', 'News'], ['web', 'Web'], ['gaming-pad', 'Pad gaming'],
    ['gaming-console', 'Console gaming'], ['gaming-handheld', 'Handheld gaming'], ['gaming-arcade', 'Arcade gaming'], ['gaming-pc', 'PC gaming']
  ];

  var theme = function () { return root.getAttribute('data-theme') === 'dusk' ? 'dusk' : 'day'; };
  var themed = function (src) { return src.replace(/-(day|dusk)\.svg$/, '-' + theme() + '.svg'); };
  var el = function (name, attrs, parent) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  // ---------- theme ----------
  var applyThemeArt = function () {
    document.querySelectorAll('img[data-themed]').forEach(function (img) { img.src = themed(img.getAttribute('src')); });
    document.querySelectorAll('image[data-themed]').forEach(function (img) { img.setAttribute('href', themed(img.getAttribute('href'))); });
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-checked', String(theme() === 'dusk')); });
  };
  var setTheme = function (t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('fg-theme', t); } catch (e) {}
    applyThemeArt();
    document.dispatchEvent(new CustomEvent('themechange'));
  };

  document.addEventListener('DOMContentLoaded', function () {
    applyThemeArt();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () { setTheme(theme() === 'dusk' ? 'day' : 'dusk'); });
    });

    // ---------- menu ----------
    var nav = document.getElementById('nav');
    var menu = document.querySelector('[data-menu]');
    if (nav && menu) {
      var close = function () { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
      menu.addEventListener('click', function () {
        var open = menu.getAttribute('aria-expanded') !== 'true';
        nav.classList.toggle('open', open);
        menu.setAttribute('aria-expanded', String(open));
      });
      nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      document.addEventListener('click', function (e) { if (!nav.contains(e.target) && !menu.contains(e.target)) close(); });
    }

    // current page in nav
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(function (a) {
      if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
    });

    // ---------- reveal ----------
    var rv = document.querySelectorAll('.rv');
    if ('IntersectionObserver' in window && !reduce) {
      var groups = new Map();
      rv.forEach(function (n) {
        var i = groups.get(n.parentElement) || 0;
        n.style.setProperty('--d', Math.min(i * 0.07, 0.42) + 's');
        groups.set(n.parentElement, i + 1);
      });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      rv.forEach(function (n) { io.observe(n); });
    } else {
      rv.forEach(function (n) { n.classList.add('in'); });
    }

    // ---------- year ----------
    document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });

    // ---------- glass tube dividers ----------
    document.querySelectorAll('[data-tube]').forEach(function (tube) {
      var track = document.createElement('div');
      track.className = 'tube-track';
      var html = '';
      for (var r = 0; r < 2; r++) {
        PACKETS.forEach(function (p) { html += '<img src="' + ART + 'packets/packet-' + p[0] + '-day.svg" data-themed alt="" width="30" height="18" loading="lazy">'; });
      }
      track.innerHTML = html;
      tube.appendChild(track);
    });

    // ---------- packet grid ----------
    document.querySelectorAll('[data-packets]').forEach(function (grid) {
      grid.innerHTML = PACKETS.map(function (p) {
        return '<div class="packet mat fiber"><img src="' + ART + 'packets/packet-' + p[0] + '-day.svg" data-themed alt="" width="46" height="28" loading="lazy"><span>' + p[1] + '</span></div>';
      }).join('');
    });

    applyThemeArt();

    // ---------- cities carousel ----------
    var track = document.querySelector('[data-cities-track]');
    document.querySelectorAll('[data-cities]').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = track && track.querySelector('.city');
        if (!card) return;
        track.scrollBy({ left: Number(b.getAttribute('data-cities')) * (card.offsetWidth + 22), behavior: reduce ? 'auto' : 'smooth' });
      });
    });

    // ---------- evening rush ----------
    var rush = document.querySelector('[data-rush]');
    if (rush) {
      var ticks = rush.querySelector('[data-ticks]');
      for (var t = 0; t < 12; t++) {
        var a = t / 12 * Math.PI * 2;
        el('line', { class: 'tick', x1: 50 + Math.sin(a) * 36, y1: 50 - Math.cos(a) * 36, x2: 50 + Math.sin(a) * 40, y2: 50 - Math.cos(a) * 40 }, ticks);
      }
      var hour = rush.querySelector('[data-hour]');
      var min = rush.querySelector('[data-min]');
      var lines = rush.querySelectorAll('[data-line]');
      var sky = rush.querySelector('.sky');
      var last = -1;
      var onRush = function () {
        var r = rush.getBoundingClientRect();
        var span = r.height - window.innerHeight;
        var p = Math.min(1, Math.max(0, -r.top / (span || 1)));
        rush.style.setProperty('--p', p.toFixed(3));
        var q = Math.min(1, Math.max(0, (p - 0.4) / 0.2));
        q = q * q * (3 - 2 * q);
        rush.style.setProperty('--q', q.toFixed(3));
        rush.classList.toggle('night', q >= 0.5);
        var hours = 8 + p * 13;
        hour.style.transform = 'rotate(' + ((hours % 12) * 30).toFixed(2) + 'deg)';
        min.style.transform = 'rotate(' + ((hours % 1) * 360).toFixed(2) + 'deg)';
        sky.setAttribute('style', 'fill:' + (p < 0.66 ? 'var(--line-marigold)' : 'var(--line-plum)'));
        var hdr = document.querySelector('[data-hdr]');
        if (hdr) {
          var under = r.top < 60 && r.bottom > 60;
          hdr.classList.toggle('on-dark', under && theme() === 'day' && q >= 0.5);
          hdr.classList.toggle('on-light', under && theme() === 'dusk' && q < 0.5);
        }
        var idx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
        if (idx !== last) {
          lines.forEach(function (l, i) { l.classList.toggle('on', i === idx); });
          last = idx;
        }
      };
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(function () { onRush(); ticking = false; }); }
      }, { passive: true });
      window.addEventListener('resize', onRush);
      document.addEventListener('themechange', onRush);
      onRush();
    }

    // ---------- footer cable ----------
    var fc = document.querySelector('[data-ftr-cable]');
    if (fc) footerCable(fc);

    // ---------- newsletter ----------
    document.querySelectorAll('[data-newsletter]').forEach(function (form) {
      var status = form.querySelector('.form-status');
      var say = function (msg, kind) { status.textContent = msg; status.className = 'form-status' + (kind ? ' ' + kind : ''); };
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        say('Sending...', null);
        fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
          .then(function (res) {
            if (res.ok) { say('You are on the list. Watch your inbox.', 'success'); form.reset(); return; }
            return res.json().then(function (d) {
              say(d && d.errors && d.errors.length ? d.errors.map(function (x) { return x.message; }).join(' ') : 'That did not work. Please try again.', 'error');
            }, function () { say('That did not work. Please try again.', 'error'); });
          })
          .catch(function () { say('No connection. Please check your internet and try again.', 'error'); });
      });
    });

    // ---------- board ----------
    var board = document.querySelector('[data-board]');
    if (board) townBoard(board);

    // ---------- game page: gallery lightbox ----------
    var gallery = document.querySelector('[data-gallery]');
    if (gallery) lightbox(gallery);

    // ---------- mood / state switchers ----------
    document.querySelectorAll('[data-switch]').forEach(function (seg) {
      var target = document.querySelector(seg.getAttribute('data-switch'));
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var v = b.getAttribute('data-v');
        target.querySelectorAll('img[data-base]').forEach(function (img) {
          img.src = ART + img.getAttribute('data-base').replace('{v}', v ? '-' + v : '') + '-' + theme() + '.svg';
        });
      });
    });
  });

  // ---------- footer: a cable from the page to a happy home ----------
  // The SVG is drawn 1:1 in CSS pixels and rebuilt on resize, so nothing is
  // cropped at wide or narrow widths (a fixed viewBox with "slice" cut off the
  // lower run, the house and the packets on wide screens).
  function footerCable(host) {
    var H = 150;
    var svg = el('svg', { preserveAspectRatio: 'xMinYMin meet' }, host);
    var shapes = el('g', {}, svg);
    var pk = el('g', {}, svg);
    var top = el('g', {}, svg);
    var path = null, L = 0, items = [], W = 0, t0 = performance.now();
    var place = function (now) {
      if (!L) return;
      var k = (now - t0) * 0.15 / L; // ~150 px per second at any width
      items.forEach(function (it) {
        var u = (k + it.o) % 1;
        var pt = path.getPointAtLength(u * L);
        it.n.setAttribute('x', (pt.x - 15).toFixed(1));
        it.n.setAttribute('y', (pt.y - 9).toFixed(1));
        it.n.setAttribute('opacity', u > 0.97 ? ((1 - u) / 0.03).toFixed(2) : 1);
      });
    };
    var build = function () {
      var w = Math.round(host.clientWidth);
      if (!w || w === W) return;
      W = w;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      shapes.textContent = ''; pk.textContent = ''; top.textContent = '';
      var house = W - 190;
      var drop = Math.max(Math.round(W * 0.4), W - 400);
      var d = 'M-40 70 H' + (drop - 40) + ' Q' + drop + ' 70 ' + drop + ' 100 V104 Q' + drop + ' 116 ' + (drop + 12) + ' 116 H' + (house + 30);
      el('path', { d: d, class: 'b-cable-shadow', transform: 'translate(2 3)' }, shapes);
      el('path', { d: d, class: 'b-cable-edge' }, shapes);
      el('path', { d: d, class: 'b-cable-body' }, shapes);
      el('path', { d: d, class: 'b-cable-core' }, shapes);
      path = el('path', { d: d, fill: 'none' }, shapes);
      el('path', { d: d, class: 'b-cable-hi', transform: 'translate(-3 -6)' }, top);
      el('image', { href: ART + 'buildings/house-normal-very-happy-day.svg', 'data-themed': '', x: house, y: 52, width: 100, height: 100 }, top);
      items = [];
      if (!reduce && path.getTotalLength) {
        L = path.getTotalLength();
        var n = Math.max(3, Math.round(L / 190));
        for (var i = 0; i < n; i++) {
          var img = el('image', { href: ART + 'packets/packet-' + PACKETS[(i * 5) % 16][0] + '-day.svg', 'data-themed': '', width: 30, height: 18 }, pk);
          items.push({ n: img, o: i / n });
        }
        place(performance.now());
      }
      applyThemeArt();
    };
    build();
    if ('ResizeObserver' in window) new ResizeObserver(build).observe(host);
    else window.addEventListener('resize', build);
    if (reduce || !path || !path.getTotalLength) return;
    var visible = false;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(host);
    (function frame(now) {
      if (visible) place(now);
      requestAnimationFrame(frame);
    })(t0);
  }

  // ---------- the hero town: tap waiting homes to cable them ----------
  function townBoard(board) {
    var fallback = board.querySelector('.board-fallback');
    var hint = board.querySelector('[data-hint]');
    var done = board.querySelector('[data-done]');
    var stats = {};
    board.querySelectorAll('[data-stat]').forEach(function (n) { stats[n.getAttribute('data-stat')] = n; });

    var svg = el('svg', { class: 'board-svg', viewBox: '0 0 1000 800', preserveAspectRatio: 'xMidYMid slice', role: 'group', 'aria-label': 'A tiny town. Homes appear and wait for the internet; connect them.' });
    board.insertBefore(svg, board.firstChild);
    if (fallback) fallback.remove();

    var gTerrain = el('g', {}, svg);
    var gGrid = el('g', {}, gTerrain);
    for (var gx = 0; gx <= 1000; gx += 62.5) el('line', { class: 'b-grid', x1: gx, y1: 0, x2: gx, y2: 800 }, gGrid);
    for (var gy = 0; gy <= 800; gy += 62.5) el('line', { class: 'b-grid', x1: 0, y1: gy, x2: 1000, y2: gy }, gGrid);
    var river = 'M890 -20 V250 L940 300 V560 L890 610 V820';
    el('path', { d: river, class: 'b-water-edge', 'stroke-width': 86, 'stroke-linejoin': 'round', fill: 'none', style: 'stroke-width:86' }, gTerrain);
    el('path', { d: river, fill: 'none', stroke: 'var(--water)', 'stroke-width': 80, 'stroke-linejoin': 'round' }, gTerrain);
    el('path', { d: 'M-10 650 H55 L115 710 V810 H-10 Z', class: 'b-grass' }, gTerrain);
    var oct = function (cx, cy, r) {
      var pts = [];
      for (var i = 0; i < 8; i++) { var a = Math.PI / 8 + i * Math.PI / 4; pts.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1)); }
      return pts.join(' ');
    };
    el('polygon', { points: oct(720, 690, 78), class: 'b-sand' }, gTerrain);
    el('polygon', { points: oct(720, 690, 52), class: 'b-water' }, gTerrain);

    var gShadow = el('g', {}, svg);
    var gBody = el('g', {}, svg);
    var gPk = el('g', {}, svg);
    var gHi = el('g', {}, svg);
    var gNodes = el('g', {}, svg);
    var gFx = el('g', {}, svg);
    var gPaths = el('g', { visibility: 'hidden' }, svg);

    var I = [150, 470], R = [430, 470], S = [430, 280];
    var roundPath = function (pts, r) {
      r = r || 26;
      var d = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var i = 1; i < pts.length - 1; i++) {
        var p = pts[i], a = pts[i - 1], b = pts[i + 1];
        var ax = Math.sign(p[0] - a[0]), ay = Math.sign(p[1] - a[1]), bx = Math.sign(b[0] - p[0]), by = Math.sign(b[1] - p[1]);
        d += ' L' + (p[0] - ax * r) + ' ' + (p[1] - ay * r) + ' Q' + p[0] + ' ' + p[1] + ' ' + (p[0] + bx * r) + ' ' + (p[1] + by * r);
      }
      var z = pts[pts.length - 1];
      return d + ' L' + z[0] + ' ' + z[1];
    };
    var cable = function (pts, fresh) {
      var d = roundPath(pts);
      var parts = [
        el('path', { d: d, class: 'b-cable-shadow', transform: 'translate(3 5)' }, gShadow),
        el('path', { d: d, class: 'b-cable-edge' }, gBody),
        el('path', { d: d, class: 'b-cable-body' }, gBody),
        el('path', { d: d, class: 'b-cable-core' }, gBody),
        el('path', { d: d, class: 'b-cable-hi', transform: 'translate(-3 -6)' }, gHi)
      ];
      if (fresh && !reduce) {
        var len = parts[1].getTotalLength();
        parts.forEach(function (p) {
          if (p.classList.contains('b-cable-core')) { p.style.opacity = '0'; setTimeout(function () { p.style.transition = 'opacity .3s'; p.style.opacity = ''; }, 650); return; }
          p.style.strokeDasharray = len + ' ' + len;
          p.style.strokeDashoffset = len;
          p.getBoundingClientRect();
          p.style.transition = 'stroke-dashoffset .7s cubic-bezier(.16,1,.3,1)';
          p.style.strokeDashoffset = '0';
        });
      }
    };
    var image = function (href, cx, cy, w, h, parent) {
      return el('image', { href: themed(ART + href + '-day.svg'), 'data-themed': '', x: cx - w / 2, y: cy - h / 2, width: w, height: h }, parent || gNodes);
    };

    cable([I, R]);
    cable([R, S]);
    image('devices/internet', I[0], I[1], 200, 200);
    var router = image('devices/edge-router-t1-normal', R[0], R[1], 176, 176);
    image('devices/switch-t1-normal', S[0], S[1], 236, 118);

    var HOMES = [
      { id: 'a', kind: 'house-normal', name: 'house', at: [150, 245], leg: [I, [150, 245]], via: [I, [150, 245]], taste: ['video', 'music', 'messaging', 'social-photo', 'web'], online: true },
      { id: 'b', kind: 'house-light', name: 'cottage', at: [430, 662], leg: [R, [430, 662]], via: [I, R, [430, 662]], taste: ['news', 'web', 'messaging', 'music'], online: true },
      { id: 'c', kind: 'internet-cafe', name: 'game café', at: [690, 470], leg: [R, [690, 470]], via: [I, R, [690, 470]], taste: ['gaming-pc', 'gaming-arcade', 'gaming-pad', 'gaming-handheld', 'gaming-console'] },
      { id: 'd', kind: 'house-heavy', name: 'big house', at: [700, 280], leg: [S, [700, 280]], via: [I, R, S, [700, 280]], taste: ['video', 'live-stream', 'gaming-console', 'short-video'] },
      { id: 'e', kind: 'office', name: 'office', at: [270, 280], leg: [S, [270, 280]], via: [I, R, S, [270, 280]], taste: ['video-call', 'messaging', 'web', 'video-call'] },
      { id: 'f', kind: 'house-normal', name: 'house', at: [290, 662], leg: [I, [150, 585], [290, 585], [290, 662]], via: [I, [150, 585], [290, 585], [290, 662]], taste: ['video', 'shopping', 'social-photo', 'music'] }
    ];

    var count = { coins: 0, homes: 0, packets: 0 };
    var bump = function (k, v) {
      count[k] = v;
      var n = stats[k];
      if (!n) return;
      n.textContent = v.toLocaleString('en-US');
      n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump');
    };

    var setFace = function (h, mood) {
      h.mood = mood;
      var name = h.kind + (mood && mood !== 'happy' ? '-' + mood : '');
      h.sprite.setAttribute('href', themed(ART + 'buildings/' + name + '-day.svg'));
    };

    HOMES.forEach(function (h) {
      var p = el('path', { d: roundPath(h.via) }, gPaths);
      h.path = p;
      h.len = p.getTotalLength();
      h.g = el('g', { class: 'b-home', 'data-state': 'hidden', visibility: 'hidden' }, gNodes);
      el('circle', { class: 'b-ring', cx: h.at[0], cy: h.at[1] - 4, r: 66 }, h.g);
      var inner = el('g', { class: 'b-sprite' }, h.g);
      h.sprite = image('buildings/' + h.kind, h.at[0], h.at[1] - 8, 128, 128, inner);
      h.timer = el('g', { visibility: 'hidden' }, h.g);
      el('circle', { class: 'b-wait', cx: h.at[0] + 52, cy: h.at[1] - 52, r: 13 }, h.timer);
      h.ring = el('circle', { class: 'b-wait-ring', cx: h.at[0] + 52, cy: h.at[1] - 52, r: 13, 'stroke-dasharray': '0 100' }, h.timer);
      if (h.online) {
        cable(h.leg);
        h.g.setAttribute('visibility', 'visible');
        h.g.setAttribute('data-state', 'online');
        setFace(h, 'happy');
        h.next = 300 + Math.random() * 900;
      }
      var go = function () { if (h.g.getAttribute('data-state') === 'waiting') connect(h); };
      h.g.addEventListener('click', go);
      h.g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    bump('homes', 2);

    var waiting = [];
    var spawnAt = 900;
    var connected = 2;
    var spawn = function () {
      var h = HOMES.find(function (x) { return x.g.getAttribute('data-state') === 'hidden'; });
      if (!h) return;
      h.g.setAttribute('visibility', 'visible');
      h.g.setAttribute('data-state', 'waiting');
      h.g.setAttribute('tabindex', '0');
      h.g.setAttribute('role', 'button');
      h.g.setAttribute('aria-label', 'Connect the ' + h.name + ' to the internet');
      setFace(h, 'waiting');
      h.wait = 0;
      h.timer.setAttribute('visibility', 'visible');
      if (!reduce) { h.g.classList.add('b-pop'); setTimeout(function () { h.g.classList.remove('b-pop'); }, 600); }
      waiting.push(h);
      if (hint && connected === 2) { hint.hidden = false; hint.classList.remove('hide'); }
    };
    var connect = function (h) {
      h.g.setAttribute('data-state', 'online');
      h.g.removeAttribute('tabindex');
      h.g.removeAttribute('role');
      h.g.setAttribute('aria-label', 'The ' + h.name + ' is online');
      h.timer.setAttribute('visibility', 'hidden');
      h.next = 800;
      waiting.splice(waiting.indexOf(h), 1);
      cable(h.leg, true);
      if (hint) hint.classList.add('hide');
      setTimeout(function () {
        setFace(h, 'very-happy');
        connected++;
        bump('homes', connected);
        bump('coins', count.coins + 5);
        floatText('+5', h.at[0], h.at[1] - 70);
        setTimeout(function () { if (h.mood === 'very-happy') setFace(h, 'happy'); }, 2600);
        if (connected >= 5) router.setAttribute('href', themed(ART + 'devices/edge-router-t1-busy-day.svg'));
        if (connected === HOMES.length && done) setTimeout(function () { done.classList.add('show'); }, 1400);
      }, reduce ? 0 : 650);
      spawnAt = Math.min(spawnAt, 1400);
    };
    var floatText = function (txt, x, y) {
      var t = el('text', { class: 'b-coin b-coin-float', x: x, y: y, 'text-anchor': 'middle' }, gFx);
      t.textContent = txt;
      setTimeout(function () { t.remove(); }, 950);
    };

    var packets = [];
    var send = function (h) {
      var up = Math.random() < 0.22;
      var type = h.taste[Math.floor(Math.random() * h.taste.length)];
      var img = el('image', { href: themed(ART + 'packets/packet-' + type + '-day.svg'), 'data-themed': '', width: 40, height: 24 }, gPk);
      packets.push({ h: h, n: img, s: 0, up: up, v: 240 + Math.random() * 60 });
    };

    var visible = true, last = performance.now();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(board);

    var step = function (now) {
      var dt = Math.min(64, now - last);
      last = now;
      if (!visible || document.hidden) { requestAnimationFrame(step); return; }

      spawnAt -= dt;
      if (spawnAt <= 0) {
        if (waiting.length < 2) spawn();
        spawnAt = 4200;
      }
      waiting.forEach(function (h) {
        h.wait += dt;
        var k = Math.min(1, h.wait / 16000);
        h.ring.setAttribute('stroke-dasharray', (k * 81.7).toFixed(1) + ' 100');
        if (h.wait > 11000 && h.mood !== 'grumpy') setFace(h, 'grumpy');
        else if (h.wait > 5500 && h.mood === 'waiting') setFace(h, 'worried');
      });

      if (!reduce) {
        HOMES.forEach(function (h) {
          if (h.g.getAttribute('data-state') !== 'online') return;
          h.next -= dt;
          if (h.next <= 0) { send(h); h.next = 1100 + Math.random() * 1400 - connected * 60; }
        });
        for (var i = packets.length - 1; i >= 0; i--) {
          var p = packets[i];
          p.s += p.v * dt / 1000;
          var L = p.h.len;
          if (p.s >= L) {
            p.n.remove();
            packets.splice(i, 1);
            if (!p.up) { bump('coins', count.coins + 1); }
            bump('packets', count.packets + 1);
            continue;
          }
          var pt = p.h.path.getPointAtLength(p.up ? L - p.s : p.s);
          p.n.setAttribute('x', (pt.x - 20).toFixed(1));
          p.n.setAttribute('y', (pt.y - 12).toFixed(1));
        }
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    document.addEventListener('themechange', function () {
      HOMES.forEach(function (h) { if (h.mood) setFace(h, h.mood); });
    });
  }

  // ---------- lightbox ----------
  function lightbox(gallery) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('button[data-full]'));
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Screenshot');
    box.innerHTML = '<figure class="mat fiber"><img alt=""><figcaption></figcaption>' +
      '<button class="close mat fiber press" type="button" aria-label="Close"><svg class="ic" aria-hidden="true"><use href="' + ICONS + 'close"/></svg></button>' +
      '<button class="lb-prev mat fiber press" type="button" aria-label="Previous"><svg class="ic" aria-hidden="true"><use href="' + ICONS + 'next"/></svg></button>' +
      '<button class="lb-next mat fiber press" type="button" aria-label="Next"><svg class="ic" aria-hidden="true"><use href="' + ICONS + 'next"/></svg></button></figure>';
    document.body.appendChild(box);
    var img = box.querySelector('img'), cap = box.querySelector('figcaption'), idx = 0, opener = null;
    var show = function (i) {
      idx = (i + items.length) % items.length;
      var b = items[idx];
      img.src = b.getAttribute('data-full');
      img.alt = b.querySelector('img').alt;
      cap.textContent = b.getAttribute('data-caption') || '';
    };
    var close = function () { box.classList.remove('open'); if (opener) opener.focus(); };
    items.forEach(function (b, i) {
      b.addEventListener('click', function () { opener = b; show(i); box.classList.add('open'); box.querySelector('.close').focus(); });
    });
    box.querySelector('.close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }
})();
