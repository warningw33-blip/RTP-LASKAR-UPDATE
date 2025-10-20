// ==== STUB YANG SUDAH ADA (biar tombol "Lihat Pola" & zoom tetap jalan) ====
function showPola(title, i) {
  try {
    const popup   = document.getElementById("polaPopup");
    const titleEl = document.getElementById("popupTitle");
    const imgEl   = document.getElementById("popupImage");
    const listEl  = document.getElementById("popupPola");
    const linkEl  = document.getElementById("mainLink");

    // Prefer games array if present
    let game = (typeof games !== 'undefined' && Array.isArray(games))
      ? ((Number.isInteger(i) && games[i]) || games.find(g => g.name === title))
      : null;

    // Fallback: derive from card DOM
    if (!game) {
      const card = [...document.querySelectorAll(".rtp-card")]
        .find(c => c.querySelector("h3")?.textContent.trim() === title);
      if (card) {
        game = {
          name: title,
          image: card.querySelector("img")?.getAttribute("src"),
          mainLink: card.querySelector(".btn-main")?.getAttribute("href"),
        };
      }
    }

    if (!game || !game.image) { alert("Data game tidak ditemukan."); return; }

    // Fill modal content
    titleEl.textContent = game.name || title;
    imgEl.src = game.image;
    imgEl.alt = game.name || title;

    const seedIndex = (typeof games !== 'undefined' && Array.isArray(games) && game) ? games.indexOf(game) : 0;
    const pola = (typeof getPolaValue === "function") ? getPolaValue(seedIndex >= 0 ? seedIndex : 0) : [];
    listEl.innerHTML = pola.map(p => `<li>${p}</li>`).join("");

    if (linkEl && game.mainLink) linkEl.href = game.mainLink;

    // Show modal
    popup.classList.add("show");
  } catch (e) {
    console.error(e);
  }
}

function closeZoom(){
  try{ document.getElementById('buktiLightbox')?.classList.remove('open'); }catch(e){}
}
function zoomBukti(img){
  try{
    const frame = document.getElementById('zoomedFrame');
    if(frame){ frame.innerHTML = ''; const i = new Image(); i.src = img.src; i.style.maxWidth='90vw'; i.style.maxHeight='90vh'; frame.appendChild(i); }
    document.getElementById('buktiLightbox')?.classList.add('open');
  }catch(e){}
}
function ardFunction(){
  try{ document.querySelector('.ard-sosmed')?.classList.toggle('open'); }catch(e){}
}

// ==== LOGIKA PROVIDER & PENCARIAN ====
document.addEventListener('DOMContentLoaded', () => {
  const providerNameDisplay = document.getElementById('providerNameDisplay');
  const rtpContainer = document.getElementById('rtpContainer');
  const providerListEl = document.getElementById('providerList');
  const searchInput = document.getElementById('searchInput');

  function filterByProvider(name){
    const cards = rtpContainer?.querySelectorAll('.rtp-card') || [];
    cards.forEach(card => {
      const prov = card.querySelector('.provider')?.textContent.trim() || '';
      card.style.display = (name === 'SEMUA PERMAINAN' || prov === name) ? '' : 'none';
    });
  }

  // Dipanggil dari HTML: onclick="selectProvider(this, 'PG Soft')"
  window.selectProvider = function(el, name){
    document.querySelectorAll('.provider-item').forEach(i => i.classList.remove('active'));
    el?.classList.add('active');
    if (providerNameDisplay) providerNameDisplay.textContent = name;
    filterByProvider(name);
    // reset pencarian ketika ganti provider (opsional)
    if (searchInput){ searchInput.value = ''; }
  };

  // Dipanggil dari HTML: onclick="scrollProvider(1)"
  window.scrollProvider = function(dir){
    if (!providerListEl) return;
    providerListEl.scrollBy({ left: (dir || 1) * 220, behavior: 'smooth' });
  };

  // Pencarian judul game
  if (searchInput){
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const cards = rtpContainer?.querySelectorAll('.rtp-card') || [];
      cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        // visibilitas gabungan: sesuai provider TERPILIH + cocok query
        const providerActive = document.querySelector('.provider-item.active span')
          ? document.querySelector('.provider-name-display')?.textContent || 'SEMUA PERMAINAN'
          : 'SEMUA PERMAINAN';
        const prov = card.querySelector('.provider')?.textContent.trim() || '';
        const okProv = (providerActive === 'SEMUA PERMAINAN' || prov === providerActive);
        card.style.display = (okProv && title.includes(q)) ? '' : 'none';
      });
    });
  }

  // Inisialisasi filter awal berdasarkan provider yang aktif di HTML
  const activeItem = document.querySelector('.provider-item.active');
  const initialName = providerNameDisplay?.textContent?.trim() || 'SEMUA PERMAINAN';
  if (activeItem && initialName) filterByProvider(initialName);
});

// =======================
// PATCH FINAL (multi-container + DOM ready + normalize provider)
// =======================
document.addEventListener('DOMContentLoaded', function () {
  // Kumpulkan SEMUA grid yang berisi kartu RTP (meski id kembar)
  const RTP_CONTAINERS = Array.from(
    document.querySelectorAll('#rtpContainer, .rtpContainer, .live-rtp-grid')
  ).filter(c => c.querySelector('.rtp-card, .card, [data-rtp-card]'));

  if (!RTP_CONTAINERS.length) return; // tidak ganggu jika struktur berbeda

  // Elemen tambahan (opsional, kalau ada di HTML)
  const providerNameDisplay =
    document.getElementById('providerNameDisplay') ||
    document.querySelector('.provider-name-display');

  const searchInput =
    document.getElementById('searchInput') ||
    document.querySelector('.search-rtp, input[type="search"][name*="rtp"]');

  // Helper normalisasi agar perbandingan provider konsisten
  const norm = (s) =>
    (s || '').toString().trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

  // Baca info kartu
  const readCardInfo = (card) => {
    const prov =
      (card.querySelector('.provider, [data-provider]')?.textContent ||
        card.getAttribute('data-provider') ||
        '').trim();
    const title =
      (card.querySelector('.title, .game-title, h3, [data-title]')?.textContent ||
        card.getAttribute('data-title') ||
        '').trim();
    return { prov, title };
  };

  // State provider aktif untuk kebutuhan pencarian
  if (typeof window.providerActive === 'undefined') window.providerActive = 'SEMUA PERMAINAN';

  // ---------------- Filter Provider ----------------
  function applyFilterByProvider(providerName) {
    const target = norm(providerName);
    const matchAll =
      !target || target === norm('SEMUA') || target === norm('SEMUA PERMAINAN');

    RTP_CONTAINERS.forEach((container) => {
      const cards = container.querySelectorAll('.rtp-card, .card, [data-rtp-card]');
      cards.forEach((card) => {
        const { prov } = readCardInfo(card);
        const ok = matchAll || norm(prov) === target;
        card.style.display = ok ? '' : 'none';
      });
    });

    if (providerNameDisplay) providerNameDisplay.textContent = providerName || 'SEMUA PERMAINAN';
    window.providerActive = providerName || 'SEMUA PERMAINAN';
  }

  // ---------------- Pencarian Judul (respect provider aktif) ----------------
  function applySearch(query) {
    const q = (query || '').toString().toLowerCase().trim();
    const active = norm(window.providerActive || 'SEMUA PERMAINAN');
    const matchAll =
      !active || active === norm('SEMUA') || active === norm('SEMUA PERMAINAN');

    RTP_CONTAINERS.forEach((container) => {
      const cards = container.querySelectorAll('.rtp-card, .card, [data-rtp-card]');
      cards.forEach((card) => {
        const { prov, title } = readCardInfo(card);
        const provOk = matchAll || norm(prov) === active;
        const textOk = !q || title.toLowerCase().includes(q);
        card.style.display = provOk && textOk ? '' : 'none';
      });
    });
  }

  // ---------------- Compat layer: hook fungsi lama bila ada ----------------
  // selectProvider(this, 'Nama Provider') dari HTML
  if (typeof window.selectProvider === 'function') {
    const old = window.selectProvider;
    window.selectProvider = function (btnOrEvent, providerName) {
      try { applyFilterByProvider(providerName); } catch (e) {}
      try { return old.apply(this, arguments); } catch (e) {}
    };
  } else {
    window.selectProvider = function (btnOrEvent, providerName) {
      applyFilterByProvider(providerName);
    };
  }

  // filterByProvider('Nama Provider') dari JS
  window.filterByProvider = (function (orig) {
    return function (providerName) {
      applyFilterByProvider(providerName);
      if (typeof orig === 'function') try { return orig.apply(this, arguments); } catch (e) {}
    };
  })(window.filterByProvider);

  // scrollProvider(±1) tetap dibiarkan ke implementasi lama kalau ada

  // Wire up input pencarian (jika ada)
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      applySearch(this.value);
    });
  }

  // Inisialisasi awal sesuai judul provider yang tampil (jika ada)
  const initialName = providerNameDisplay?.textContent?.trim() || 'SEMUA PERMAINAN';
  applyFilterByProvider(initialName);
});

// ==== PATCH: alias provider & pembandingan fleksibel ====
(function(){
  // Ambil fungsi/variabel dari patch sebelumnya:
  const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

  // Peta alias untuk konsistensi nama tombol vs kartu
  function providerAlias(key){
    const k = norm(key);
    const map = {
      // PG variants
      'pg': 'pgsoft',
      'pgsoft': 'pgsoft',
      'pggaming': 'pgsoft',
      'pocketgamesoft': 'pgsoft',
      // Pragmatic variants
      'pragmatic': 'pragmaticplay',
      'pragmaticplay': 'pragmaticplay',
      // No Limit City variants
      'nolimitcity': 'nolimitcity',
      'nolimit': 'nolimitcity',
      'limitcity': 'nolimitcity',
      // Semua
      'semua': 'semua',
      'semuapermainan': 'semua'
    };
    return map[k] || k;
  }

  // Helper banding fleksibel: exact OR contains dua arah (untuk kasus "pg" vs "pgsoft")
  function isProviderMatch(targetName, cardName){
    const t = providerAlias(targetName);
    const c = providerAlias(cardName);
    if (!t || t === 'semua') return true;
    if (t === c) return true;
    return c.includes(t) || t.includes(c);
  }

  // Hook ke applyFilterByProvider & applySearch dari patch sebelumnya
  const _oldApplyFilter = window.applyFilterByProvider;
  const _oldApplySearch = window.applySearch;

  // Re-wrap applyFilter agar gunakan isProviderMatch
  window.applyFilterByProvider = function(providerName){
    const RTP_CONTAINERS = Array.from(
      document.querySelectorAll('#rtpContainer, .rtpContainer, .live-rtp-grid')
    ).filter(c => c.querySelector('.rtp-card, .card, [data-rtp-card]'));

    const displayTitle =
      document.getElementById('providerNameDisplay') ||
      document.querySelector('[data-provider-title]') ||
      document.querySelector('.provider-name-display');

    RTP_CONTAINERS.forEach(container=>{
      container.querySelectorAll('.rtp-card, .card, [data-rtp-card]').forEach(card=>{
        const prov = (card.querySelector('.provider, [data-provider]')?.textContent || card.getAttribute('data-provider') || '').trim();
        const ok = isProviderMatch(providerName, prov);
        card.style.display = ok ? '' : 'none';
      });
    });

    if (displayTitle) displayTitle.textContent = providerName || 'SEMUA PERMAINAN';
    window.providerActive = providerName || 'SEMUA PERMAINAN';

    // panggil original (jika ada) biar side-effect lain tetap jalan
    if (typeof _oldApplyFilter === 'function') try { _oldApplyFilter(providerName); } catch(e){}
  };

  // Re-wrap applySearch agar tetap hormati providerActive dengan alias & fleksibel
  window.applySearch = function(query){
    const q = (query || '').toString().toLowerCase().trim();
    const active = window.providerActive || 'SEMUA PERMAINAN';

    const RTP_CONTAINERS = Array.from(
      document.querySelectorAll('#rtpContainer, .rtpContainer, .live-rtp-grid')
    ).filter(c => c.querySelector('.rtp-card, .card, [data-rtp-card]'));

    RTP_CONTAINERS.forEach(container=>{
      container.querySelectorAll('.rtp-card, .card, [data-rtp-card]').forEach(card=>{
        const title = (card.querySelector('.title, .game-title, [data-title], h3')?.textContent || card.getAttribute('data-title') || '').trim();
        const prov  = (card.querySelector('.provider, [data-provider]')?.textContent || card.getAttribute('data-provider') || '').trim();
        const provOk = isProviderMatch(active, prov);
        const textOk = !q || title.toLowerCase().includes(q);
        card.style.display = (provOk && textOk) ? '' : 'none';
      });
    });

    if (typeof _oldApplySearch === 'function') try { _oldApplySearch(query); } catch(e){}
  };

  // Setelah patch: jalankan ulang filter untuk provider aktif saat ini
  document.addEventListener('DOMContentLoaded', function(){
    const current = window.providerActive || (document.getElementById('providerNameDisplay')?.textContent?.trim()) || 'SEMUA PERMAINAN';
    window.applyFilterByProvider(current);
  });
})();

// ==== PATCH: paksa load gambar untuk kartu yang baru ditampilkan ====
(function(){
  function __forceLoadImages__(scope){
    if (!scope) return;
    // <img data-src> / <img data-original> / <img data-lazy>
    scope.querySelectorAll('img[data-src], img[data-original], img[data-lazy]').forEach(img=>{
      const src = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('data-lazy');
      if (src && (!img.getAttribute('src') || img.getAttribute('src') === '#' )) {
        img.setAttribute('src', src);
        img.removeAttribute('data-src'); img.removeAttribute('data-original'); img.removeAttribute('data-lazy');
        img.classList.add('lazyloaded');
      }
    });
    // <source data-srcset> (untuk <picture>)
    scope.querySelectorAll('source[data-srcset]').forEach(srcsetEl=>{
      const ss = srcsetEl.getAttribute('data-srcset');
      if (ss) {
        srcsetEl.setAttribute('srcset', ss);
        srcsetEl.removeAttribute('data-srcset');
      }
    });
    // data-bg (lazy background-image)
    scope.querySelectorAll('[data-bg]').forEach(el=>{
      const bg = el.getAttribute('data-bg');
      if (bg) {
        el.style.backgroundImage = `url("${bg}")`;
        el.removeAttribute('data-bg');
        el.classList.add('lazyloaded');
      }
    });
  }

  // Hook ke patch sebelumnya: saat kartu ditampilkan, paksa load gambar
  const __oldApplyFilterByProvider__ = window.applyFilterByProvider;
  const __oldApplySearch__ = window.applySearch;

  window.applyFilterByProvider = function(providerName){
    // jalankan filter asli
    if (typeof __oldApplyFilterByProvider__ === 'function') __oldApplyFilterByProvider__(providerName);
    // paksa load pada kartu yang kini terlihat
    document.querySelectorAll('.rtp-card, .card, [data-rtp-card]').forEach(card=>{
      if (card.style.display !== 'none') __forceLoadImages__(card);
    });
  };

  window.applySearch = function(query){
    if (typeof __oldApplySearch__ === 'function') __oldApplySearch__(query);
    document.querySelectorAll('.rtp-card, .card, [data-rtp-card]').forEach(card=>{
      if (card.style.display !== 'none') __forceLoadImages__(card);
    });
  };

  // jalankan sekali saat halaman siap (untuk provider awal)
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.rtp-card, .card, [data-rtp-card]').forEach(card=>{
      if (card.style.display !== 'none') __forceLoadImages__(card);
    });
  });
})();

// ---- Alias tombol "PG" -> kartu "PG Soft" (tanpa ubah HTML) ----
(function () {
  const aliasMap = { 'pg': 'PG Soft' };

  function mapAlias(name) {
    const k = (name || '').toLowerCase().trim();
    return aliasMap[k] || name;
  }

  // Jika ada selectProvider lama, bungkus dan map namanya dulu
  if (typeof window.selectProvider === 'function') {
    const old = window.selectProvider;
    window.selectProvider = function (btn, name) {
      return old.call(this, btn, mapAlias(name));
    };
  }

  // Jika ada filterByProvider, bungkus juga
  if (typeof window.filterByProvider === 'function') {
    const old = window.filterByProvider;
    window.filterByProvider = function (name) {
      return old.call(this, mapAlias(name));
    };
  }
})();


// Paksa load gambar lazy (img[data-src]) setelah filter PG aktif
(function () {
  function forceLoad(scope) {
    scope.querySelectorAll('img[data-src], img[data-original], img[data-lazy]').forEach(img => {
      const src = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('data-lazy');
      if (src && !img.getAttribute('src')) {
        img.setAttribute('src', src);
        img.removeAttribute('data-src'); img.removeAttribute('data-original'); img.removeAttribute('data-lazy');
      }
    });
  }

  const wrap = (fnName) => {
    if (typeof window[fnName] !== 'function') return;
    const old = window[fnName];
    window[fnName] = function () {
      const r = old.apply(this, arguments);
      // setelah filter/search, paksa load untuk kartu yang terlihat
      document.querySelectorAll('.rtp-card, .card, [data-rtp-card]').forEach(card => {
        if (card.style.display !== 'none') forceLoad(card);
      });
      return r;
    };
  };

  wrap('selectProvider');
  wrap('filterByProvider');
})();


/* ==== PG FIX: alias + filter mandiri + lazy image ==== */
(function () {
  function norm(s) {
    return (s || '').toString().trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  }
  // alias yang dianggap "PG Soft"
  const PG_ALIASES = ['pg', 'pgsoft', 'pggaming', 'pocketgamesoft', 'pgsoftgaming', 'pgslot', 'pg-soft'];
  function isPGName(name) {
    const n = norm(name);
    if (!n) return false;
    return PG_ALIASES.some(a => n.includes(a) || a.includes(n));
  }

  function forceLoadImages(scope) {
    if (!scope) return;
    scope.querySelectorAll('img[data-src], img[data-original], img[data-lazy]').forEach(img => {
      const src = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('data-lazy');
      if (src && !img.getAttribute('src')) {
        img.setAttribute('src', src);
        img.removeAttribute('data-src'); img.removeAttribute('data-original'); img.removeAttribute('data-lazy');
      }
    });
    scope.querySelectorAll('source[data-srcset]').forEach(s => {
      const ss = s.getAttribute('data-srcset');
      if (ss) { s.setAttribute('srcset', ss); s.removeAttribute('data-srcset'); }
    });
    scope.querySelectorAll('[data-bg]').forEach(el => {
      const bg = el.getAttribute('data-bg');
      if (bg) { el.style.backgroundImage = `url("${bg}")`; el.removeAttribute('data-bg'); }
    });
  }

  function showPG() {
    // cari semua container, walau id rtpContainer duplikat
    const containers = Array.from(document.querySelectorAll('#rtpContainer, .rtpContainer, .live-rtp-grid'));
    let anyShown = false;

    containers.forEach(container => {
      const cards = container.querySelectorAll('.rtp-card, .card, [data-rtp-card]');
      if (!cards.length) return;

      cards.forEach(card => {
        const prov = (card.querySelector('.provider, [data-provider]')?.textContent || card.getAttribute('data-provider') || '').trim();
        const ok = isPGName(prov);
        card.style.display = ok ? '' : 'none';
        if (ok) { forceLoadImages(card); anyShown = true; }
      });
    });

    // update judul jika ada
    const title = document.getElementById('providerNameDisplay') || document.querySelector('[data-provider-title]');
    if (title) title.textContent = 'PG Soft';
    // simpan state aktif untuk pencarian lain
    window.providerActive = 'PG Soft';

    // fallback: kalau tidak ada yang tampil, jangan sembunyikan semua (biarkan default)
    if (!anyShown) {
      containers.forEach(container => {
        const cards = container.querySelectorAll('.rtp-card, .card, [data-rtp-card]');
        cards.forEach(card => { if (card.style.display === 'none') card.style.display = ''; });
      });
    }
  }

  // Listener klik global: bila tombol/tab mengandung PG, jalankan filter kita SETELAH handler lama
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-provider],[data-filter],[data-name],button,a,li,div');
    if (!btn) return;
    const hint = (btn.getAttribute('data-provider') ||
                  btn.getAttribute('data-filter') ||
                  btn.getAttribute('data-name') ||
                  btn.textContent || '').trim();
    if (!hint) return;
    if (isPGName(hint)) {
      // biarkan handler asli jalan dulu, lalu kita sikat PG (agar tidak bentrok)
      setTimeout(showPG, 0);
    }
  }, true);

  // Sediakan fungsi manual jika perlu dipicu dari console/handler lain
  window.__fixPGShow = showPG;
})();

window.showPola = showPola;
function closePola(){ try{ document.getElementById('polaPopup')?.classList.remove('show'); }catch(e){} }
window.closePola = closePola;


// ===== Hourly RTP & Pola (deterministic per hour) =====
(function(){
  // Simple deterministic PRNG from string seed (Mulberry32 + string hash)
  function hashStr(s){
    let h = 1779033703 ^ s.length;
    for (let i=0; i<s.length; i++){
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h>>>0);
  }
  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
  function prngFor(key){ return mulberry32(hashStr(key)); }
  function hourKey(){
    const d = new Date();
    const hh = d.getHours().toString().padStart(2,'0');
    const mm = d.getMonth()+1;
    const key = `${d.getFullYear()}-${mm.toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${hh}`;
    return key;
  }
  function formatHourRange(){
    const d = new Date();
    const h = d.getHours();
    const next = (h+1) % 24;
    return `${h}:00 - ${next}:00 WIB`;
  }

  // Update one card's RTP bar and label by deterministic rank
  function setCardRTP(card, percent){
    const bar = card.querySelector('.rtp-bar .rtp-fill, .rtp-fill');
    if (!bar) return;
    percent = Math.max(10, Math.min(98.99, percent));
    bar.style.width = percent + '%';
    bar.textContent = percent.toFixed(2) + '%';
    bar.classList.remove('rtp-green','rtp-yellow','rtp-red');
    if (percent >= 75) bar.classList.add('rtp-green');
    else if (percent >= 50) bar.classList.add('rtp-yellow');
    else bar.classList.add('rtp-red');
  }

  function updateTimeLabel(card){
    const info = card.querySelector('.rtp-info');
    if (!info) return;
    // keep "Jam<br>..." format if exists
    const txt = formatHourRange();
    if (info.innerHTML.includes('<br>')){
      const [prefix] = info.innerHTML.split('<br>');
      info.innerHTML = prefix + '<br>' + txt;
    } else {
      info.textContent = txt;
    }
  }

  function updateAllRTP(){
    const key = hourKey();
    const cards = Array.from(document.querySelectorAll('.rtp-card'));
    if (!cards.length) return;
    // prepare scores per card by name text
    const rng = prngFor('rtp:' + key);
    // shuffle copy
    const order = cards.map((c,i)=>({ c:i, r: rng() })).sort((a,b)=>a.r-b.r).map(o=>o.c);
    // assign percent by rank buckets: top 70% green, next 20% yellow, rest red
    const n = cards.length;
    const greenCut = Math.floor(n * 0.7);
    const yellowCut = Math.floor(n * 0.9);
    for (let rank=0; rank<n; rank++){
      const idx = order[rank];
      const card = cards[idx];
      let pct;
      if (rank < greenCut) pct = 75 + prngFor(key + ':g'+rank)()*23.99;
      else if (rank < yellowCut) pct = 50 + prngFor(key + ':y'+rank)()*23.99;
      else pct = 30 + prngFor(key + ':r'+rank)()*19.99;
      setCardRTP(card, pct);
      updateTimeLabel(card);
    }
    // Save marker to avoid unnecessary repeat until hour changes
    try{ localStorage.setItem('rtp_last_key', key); }catch(e){}
  }

  // Pola generator (deterministic per game per hour)
  const POLA_LIST = [
    "Manual 10x Turbo", "Manual 15x", "Manual 25x Quickspin",
    "Auto 20x Turbo", "Auto 30x", "Auto 40x Quick",
    "Buyspin 1x", "Buyspin 2x", "Buy Free Spin", "Buy 3x Turbo",
    "Manual 10x + Auto 20x", "Spin 15 Turbo", "Manual 20x → Auto 25x",
    "Buy 2x lalu Stop", "Quickspin 20x Manual", "Turbo 15x + Buy 1x",
    "Auto 25x + Manual 10x", "Buyspin 3x lalu Auto 15",
    "Manual 30x Full", "Spin 10x Buy Turbo",
    "Auto 15x + Quickspin 10x", "Manual 12x + Buy 2x",
    "Turbo 18x Manual", "Auto 22x Quick", "Buyspin 4x Turbo"
  ];
  window.getPolaValue = function(seedIndex){
    const key = hourKey() + ':' + (seedIndex||0);
    const r = prngFor('pola:'+key);
    const used = new Set();
    const out = [];
    while (out.length < 3){
      const pick = Math.floor(r() * POLA_LIST.length);
      if (used.has(pick)) continue;
      used.add(pick);
      out.push(POLA_LIST[pick]);
    }
    return out;
  };

  // Kick initial & schedule hourly refresh
  document.addEventListener('DOMContentLoaded', function(){
    updateAllRTP();
    setInterval(function(){
      try{
        const key = hourKey();
        const last = localStorage.getItem('rtp_last_key');
        if (key !== last) updateAllRTP();
      }catch(e){ updateAllRTP(); }
    }, 60000); // check each minute
  });
})();


/* === [ADD] Hourly Shuffle + Percent + Badge (Asia/Jakarta, WIB) — Fast/Responsive === */
(function(){
  const CONFIG = {
    gridSelector: '.live-rtp-grid',   // container kartu
    cardSelector: '.rtp-card',         // tiap kartu
    percentSelector: '.rtp-fill',      // elemen bar/text persentase
    badgeSelector: '.badge'            // elemen label/pola
  };

  function hourKeyWIB(){
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit'
    });
    const parts = fmt.formatToParts(new Date());
    const pick = t => parts.find(p => p.type === t)?.value;
    return `${pick('year')}-${pick('month')}-${pick('day')}T${pick('hour')}`;
  }
  function seedFrom(str, salt='Laskar138'){
    let h = 2166136261; const s = str + '|' + salt;
    for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h,16777619); }
    return (h>>>0);
  }
  function mulberry32(seed){ return function(){ let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t>>>15), t|1); t ^= t + Math.imul(t ^ (t>>>7), t|61);
    return ((t ^ (t>>>14))>>>0) / 4294967296; }; }
  function shuffleDeterministic(arr, rand){
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--){ const j = Math.floor(rand()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  function generatePercents(n, rand){
    const out = new Array(n);
    for (let i=0;i<n;i++){
      const r = rand(); let p;
      if (r > 0.95)      p = 96 + (rand()*4|0);   // 96–99
      else if (r > 0.80) p = 90 + (rand()*6|0);   // 90–95
      else if (r > 0.50) p = 80 + (rand()*10|0);  // 80–89
      else               p = 60 + (rand()*20|0);  // 60–79
      out[i] = p;
    }
    return out;
  }
  function badgeFor(p){
    if (p >= 98) return { text:'ULTRA', cls:'badge-ultra' };
    if (p >= 95) return { text:'HOT',   cls:'badge-hot' };
    if (p >= 90) return { text:'HIGH',  cls:'badge-high' };
    if (p >= 80) return { text:'MED',   cls:'badge-med' };
    return           { text:'LOW',   cls:'badge-low' };
  }

  // Minimalkan reflow: hanya ubah jika memang berubah
  function setPercentEl(el, val){
    if (!el) return;
    const prev = el.dataset.pct;
    const txt = val + '%';
    if (prev != String(val)) {
      el.dataset.pct = String(val);
      // Jika .rtp-fill dipakai sebagai progress bar + teks
      if (el.style) el.style.width = txt;
      if (el.textContent !== txt) el.textContent = txt;
      el.classList.remove('rtp-green','rtp-yellow','rtp-red');
      if (val >= 90) el.classList.add('rtp-green');
      else if (val >= 80) el.classList.add('rtp-yellow');
      else el.classList.add('rtp-red');
    }
  }
  function setBadgeEl(el, meta){
    if (!el) return;
    if (el.textContent !== meta.text) el.textContent = meta.text;
    // update kelas hanya jika perlu
    if (!el.classList.contains(meta.cls)) {
      el.classList.remove('badge-ultra','badge-hot','badge-high','badge-med','badge-low');
      el.classList.add(meta.cls);
    }
  }

  function applyHourly(force){
    const key = hourKeyWIB();
    const last = localStorage.getItem('laskar_hour_key');
    if (!force && last === key) return;

    const grids = document.querySelectorAll(CONFIG.gridSelector);
    if (!grids.length) return;

    const rand = mulberry32(seedFrom(key));
    grids.forEach(grid => {
      const cards = Array.from(grid.querySelectorAll(CONFIG.cardSelector));
      if (!cards.length) return;

      const shuffled = shuffleDeterministic(cards, rand);
      const percents = generatePercents(cards.length, rand);

      // Pakai DocumentFragment untuk satu batch append (lebih cepat)
      const frag = document.createDocumentFragment();
      shuffled.forEach((card, idx) => {
        card.dataset.order = String(idx+1);

        // Update persen
        const p = percents[idx];
        setPercentEl(card.querySelector(CONFIG.percentSelector), p);

        // Update badge/pola
        const meta = badgeFor(p);
        setBadgeEl(card.querySelector(CONFIG.badgeSelector), meta);

        frag.appendChild(card);
      });
      grid.appendChild(frag);

      // Update teks jam (opsional)
      cards.forEach(card => {
        const infoEl = card.querySelector('.rtp-info');
        if (infoEl){
          try {
            const parts = key.split('T'); const H = parseInt(parts[1],10);
            const pad = n => (n<10? '0'+n : ''+n);
            const next = (H+1)%24;
            const html = `Jam<br>${pad(H)}:00 - ${pad(next)}:00 WIB`;
            if (infoEl.innerHTML !== html) infoEl.innerHTML = html;
          } catch(e){}
        }
      });
    });

    localStorage.setItem('laskar_hour_key', key);
  }

  // Start cepat & responsif
  document.addEventListener('DOMContentLoaded', () => {
    // Jalankan segera setelah DOM siap
    applyHourly(true);
    // Cek setiap menit (ringan) supaya update otomatis saat ganti jam
    setInterval(() => applyHourly(false), 60 * 1000);
  });
})();
/* === [END ADD] === */

