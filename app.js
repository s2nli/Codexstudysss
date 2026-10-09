(function () {
  var APPS = window.APPS || [];
  var WA = 'https://whatsapp.com/channel/0029VbDI2CGEAKWNSoya5L2w';
  var FAV_KEY = 'codexstudys_favs';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TABS = [
    { key: 'all', label: 'Apps', on: 'ri-apps-2-fill', off: 'ri-apps-2-line' },
    { key: 'upcoming', label: 'Upcoming', on: 'ri-notification-3-fill', off: 'ri-notification-3-line' },
    { key: 'fav', label: 'Favorites', on: 'ri-star-fill', off: 'ri-star-line' }
  ];
  var BANNERS = [
    { id: 'nt', tag: 'Most Popular', title: 'NEXT TOPPERS', sub: 'Ace your exams with us.' },
    { id: 'fk', tag: 'Trending', title: 'FUTUREKUL', sub: 'Start your journey today.' }
  ];
  var ABOUT = {};

  var state = { tab: 'all', q: '', slide: 0, timer: null };
  var favs = [];
  try { favs = JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch (e) {}

  function byId(id) { return APPS.filter(function (a) { return a.id === id; })[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function saveFavs() { try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {} }
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  function iconHTML(a, cls) {
    cls = cls || '';
    if (a.icon) return '<img class="app-ico ' + cls + '" src="' + a.icon + '" alt="" loading="lazy" width="68" height="68">';
    var ri = a.ri || 'ri-book-open-fill';
    return '<div class="app-ico ph ' + cls + '" style="--c:' + a.color + '"><i class="' + ri + '"></i></div>';
  }
  function aboutText(a) {
    if (ABOUT[a.id]) return ABOUT[a.id];
    return a.name.split(' ').map(function (w) { return w.length <= 3 ? w : w.charAt(0) + w.slice(1).toLowerCase(); }).join(' ') +
      ' on CODEX STUDYS brings its batches, lectures and notes together in one fast, free web app. Pick a batch, start the lecture and keep every note a tap away. It works on phone and desktop, and you can install it to your home screen for a full-screen experience.';
  }

  /* ---------- tabs ---------- */
  function renderTabs() {
    var html = TABS.map(function (t) {
      var on = state.tab === t.key;
      return '<button class="tab' + (on ? ' on' : '') + '" data-tab="' + t.key + '"><i class="' + (on ? t.on : t.off) + '"></i>' + t.label + '</button>';
    }).join('');
    $('.tabbar').innerHTML = html; $('.sidenav').innerHTML = html;
    $$('[data-tab]').forEach(function (b) {
      b.onclick = function () { state.tab = b.getAttribute('data-tab'); if (location.hash !== '#/') location.hash = '#/'; renderTabs(); renderList(); };
    });
  }

  /* ---------- banner ---------- */
  function renderBanner() {
    var items = BANNERS.filter(function (b) { return byId(b.id); });
    $('.slides').innerHTML = items.map(function (b) {
      var a = byId(b.id);
      return '<div class="slide" data-id="' + a.id + '" style="--c:' + a.color + '">' +
        (a.icon ? '<img class="big" src="' + a.icon + '" alt="">' : '<div class="big app-ico ph" style="--c:' + a.color + ';font-size:90px"><i class="' + (a.ri || 'ri-book-open-fill') + '"></i></div>') +
        '<div><span class="tag">' + esc(b.tag) + '</span><h3>' + esc(b.title) + '</h3><p>' + esc(b.sub) + '</p></div></div>';
    }).join('');
    $('.dots').innerHTML = items.map(function (_, i) { return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('');
    $$('.slide').forEach(function (s) { s.onclick = function () { location.hash = '#/app/' + s.getAttribute('data-id'); }; });
    state.n = items.length; go(0);
    clearInterval(state.timer);
    state.timer = setInterval(function () { go((state.slide + 1) % state.n); }, 4800);
  }
  function go(i) {
    state.slide = i;
    $('.slides').style.transform = 'translateX(-' + i * 100 + '%)';
    $$('.dots i').forEach(function (d, k) { d.classList.toggle('on', k === i); });
  }
  (function swipe() {
    var el = $('#banner'), x0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go((state.slide + (dx < 0 ? 1 : state.n - 1)) % state.n);
    });
  })();

  /* ---------- list ---------- */
  function renderList() {
    var q = state.q.trim().toLowerCase();
    var list = APPS.filter(function (a) {
      var m = !q || a.name.toLowerCase().indexOf(q) > -1 || a.cat.toLowerCase().indexOf(q) > -1;
      var t = state.tab === 'all' ? !a.up : state.tab === 'upcoming' ? a.up : favs.indexOf(a.id) > -1;
      return m && t;
    });
    var titles = { all: '<span>🔥</span> Top Free Apps', upcoming: '<span>🚀</span> Coming Soon', fav: '<span>⭐</span> Your Favorites' };
    $('#secTitle').innerHTML = titles[state.tab];
    $('#secCount').textContent = list.length + ' apps';
    $('#list').innerHTML = list.map(function (a) {
      var action = a.up
        ? '<span class="get soon">SOON</span><small>Pre-Order</small>'
        : '<span class="get">GET</span><small>Free</small>';
      var meta = a.up
        ? 'Upcoming <span>·</span> 0 <span>·</span> <span class="st">★</span> —'
        : esc(a.cat) + ' <span>·</span> ' + esc(a.installs) + ' <span>·</span> <span class="st">★</span> ' + a.rating;
      return '<div class="card" data-id="' + a.id + '" tabindex="0" role="link">' +
        '<div class="ico-wrap">' + iconHTML(a) + (a.up ? '<span class="badge">!</span>' : '') + '</div>' +
        '<div class="info"><h3>' + esc(a.name) + '</h3><div class="dev">CODEX <i class="ri-verified-badge-fill"></i></div><div class="meta">' + meta + '</div></div>' +
        '<div class="act">' + action + '</div></div>';
    }).join('');
    $$('.card').forEach(function (c) {
      var open = function () { location.hash = '#/app/' + c.getAttribute('data-id'); };
      c.onclick = open; c.onkeydown = function (e) { if (e.key === 'Enter') open(); };
    });
    var empty = !list.length;
    $('#empty').hidden = !empty;
    $('#emptyMsg').textContent = state.tab === 'fav' && !q ? 'Tap the star on any app to save it here.' : 'Try a different search or filter.';
    $('#clearBtn').style.display = state.tab === 'fav' && !q ? 'none' : '';
  }

  /* ---------- detail ---------- */
  function openApp(a) {
    toast('Opening ' + a.name + '...');
    setTimeout(function () { window.open(a.url, '_blank', 'noopener'); }, 500);
  }
  function renderDetail(a) {
    var isFav = favs.indexOf(a.id) > -1;
    var rel = APPS.filter(function (x) { return x.id !== a.id && x.up === a.up; }).slice(0, 12);
    var cta = a.up
      ? '<a class="cta main-cta" href="' + WA + '" target="_blank" rel="noopener"><i class="ri-whatsapp-fill"></i> Get notified - Join channel</a><div class="cta dis"><i class="ri-time-line"></i> Launching soon</div>'
      : '<button class="cta main-cta" id="getBtn"><i class="ri-download-cloud-2-fill"></i> GET APP - Free</button>' +
        '<button class="cta alt" id="visitBtn"><i class="ri-global-line"></i> Visit Website</button>';
    $('#view-detail').innerHTML =
      '<div class="dhead"><button id="backBtn"><i class="ri-arrow-left-s-line"></i> App Store</button>' +
      '<div class="r"><button id="favBtn" class="' + (isFav ? 'on' : '') + '" aria-label="Favorite"><i class="' + (isFav ? 'ri-star-fill' : 'ri-star-line') + '"></i></button>' +
      '<button id="shareBtn" aria-label="Share"><i class="ri-share-forward-line"></i></button></div></div>' +
      '<div class="hero">' + iconHTML(a) + '<div><h2>' + esc(a.name) + '</h2><div class="dev" style="font-size:15px;margin-top:6px">CODEX <i class="ri-verified-badge-fill"></i></div>' +
      '<div class="chips"><span class="chip">' + esc(a.cat) + '</span><span class="chip">Web App</span>' + (a.up ? '' : '<span class="chip hi">★ ' + a.rating + '</span>') + '</div></div></div>' +
      cta +
      (a.up ? '' : '<div class="stats"><div class="stat"><small>Rating</small><b>' + a.rating + '</b><span>★★★★★</span></div><div class="stat"><small>Users</small><b>' + esc(a.installs) + '</b><span>Students</span></div><div class="stat"><small>Price</small><b>Free</b><span>Always</span></div></div>') +
      '<div class="dsec"><h3>About This App</h3><div class="about">' + esc(aboutText(a)) + '</div></div>' +
      '<div class="dsec"><h3>More ' + (a.up ? 'coming soon' : 'apps') + '</h3><div class="related">' +
      rel.map(function (r) { return '<a class="rel" href="#/app/' + r.id + '">' + iconHTML(r) + '<span>' + esc(r.name.split(' ').slice(0, 2).join(' ')) + '</span></a>'; }).join('') +
      '</div></div>';
    $('#backBtn').onclick = function () { if (history.length > 1) history.back(); else location.hash = '#/'; };
    $('#favBtn').onclick = function () {
      var i = favs.indexOf(a.id); if (i > -1) favs.splice(i, 1); else favs.push(a.id);
      saveFavs(); renderDetail(a); toast(i > -1 ? 'Removed from favorites' : 'Added to favorites');
    };
    $('#shareBtn').onclick = function () {
      var url = a.url || location.href, data = { title: a.name, text: 'Check out ' + a.name + ' on CODEX STUDYS!', url: url };
      if (navigator.share) navigator.share(data).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast('Link copied'); });
    };
    if (!a.up) { $('#getBtn').onclick = $('#visitBtn').onclick = function () { openApp(a); }; }
  }

  /* ---------- routing ---------- */
  function route() {
    var m = location.hash.match(/^#\/app\/([\w-]+)/), a = m && byId(m[1]);
    $('#view-home').hidden = !!a; $('#view-detail').hidden = !a;
    if (a) { renderDetail(a); window.scrollTo(0, 0); } else { renderList(); }
  }
  window.addEventListener('hashchange', route);

  /* ---------- search ---------- */
  $$('.q').forEach(function (inp) {
    inp.addEventListener('input', function () {
      state.q = inp.value; $$('.q').forEach(function (o) { if (o !== inp) o.value = inp.value; });
      if (location.hash !== '#/' && location.hash !== '') location.hash = '#/'; else renderList();
    });
  });
  $('#clearBtn').onclick = function () { state.q = ''; state.tab = 'all'; $$('.q').forEach(function (i) { i.value = ''; }); renderTabs(); renderList(); };

  /* ---------- init ---------- */
  renderTabs(); renderBanner(); route();
  setTimeout(function () { $('#splash').classList.add('out'); }, 1500);
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
})();
