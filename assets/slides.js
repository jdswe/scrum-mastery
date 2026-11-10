/* ===== Git Mastery — Slide Engine + i18n + OS tabs ===== */
(function () {
  const deck = document.querySelector('.deck');
  const hasDeck = !!deck;
  const slides = hasDeck ? Array.from(deck.querySelectorAll('.slide')) : [];
  let current = 0;
  const total = slides.length;

  /* ---------- i18n ---------- */
  const I18N_KEY = 'gitmastery-lang';
  let curLang = 'es';
  try { curLang = localStorage.getItem(I18N_KEY) || 'es'; } catch (e) {}
  const origStore = new WeakMap();

  function captureOriginals() {
    document.querySelectorAll('[data-en],[data-pt]').forEach(el => {
      if (!origStore.has(el)) origStore.set(el, el.innerHTML);
    });
  }
  function textFor(el, lang) {
    if (lang === 'es') return origStore.has(el) ? origStore.get(el) : el.innerHTML;
    const val = el.getAttribute('data-' + lang);
    return val != null ? val : (origStore.has(el) ? origStore.get(el) : el.innerHTML);
  }
  function applyLang(lang) {
    curLang = lang;
    try { localStorage.setItem(I18N_KEY, lang); } catch (e) {}
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-en],[data-pt]').forEach(el => { el.innerHTML = textFor(el, lang); });
    document.querySelectorAll('.lang-switch button[data-lang]').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  /* inject language switcher */
  const topnav = document.querySelector('.topnav');
  if (topnav && !topnav.querySelector('.lang-switch')) {
    const sw = document.createElement('div');
    sw.className = 'lang-switch';
    const label = {
      es: 'Idioma', en: 'Language', pt: 'Idioma'
    };
    sw.innerHTML = '<span class="lang-label">🌐</span>' +
      ['es','en','pt'].map(l => '<button data-lang="' + l + '">' + l.toUpperCase() + '</button>').join('');
    sw.querySelectorAll('button[data-lang]').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));
    topnav.appendChild(sw);
  }

  captureOriginals();
  applyLang(curLang);

  if (!hasDeck) return;

  /* ---------- TOC ---------- */
  function buildTOC() {
    const overlay = document.querySelector('.toc-overlay');
    if (!overlay) return;
    const list = overlay.querySelector('.toc-list');
    list.innerHTML = '';
    slides.forEach((s, i) => {
      const src = s.dataset['title' + (curLang !== 'es' ? '-' + curLang : '')] || s.dataset.title;
      const title = src || (s.querySelector('h1, h2') ? (s.querySelector('h1, h2')).textContent : 'Slide ' + (i + 1));
      const item = document.createElement('div');
      item.className = 'toc-item';
      item.innerHTML = '<span class="toc-num">' + String(i + 1).padStart(2, '0') + '</span><span class="toc-title">' + title + '</span>';
      item.addEventListener('click', () => { goTo(i); overlay.classList.remove('show'); });
      list.appendChild(item);
    });
  }

  /* ---------- render ---------- */
  function render() {
    slides.forEach((s, i) => {
      s.classList.remove('active', 'prev');
      if (i === current) s.classList.add('active');
      else if (i < current) s.classList.add('prev');
    });
    const p = document.querySelector('.progress');
    if (p) p.style.width = (total ? ((current + 1) / total * 100) : 0) + '%';
    const c = document.querySelector('.counter');
    if (c) c.innerHTML = '<span class="cur">' + String(current + 1).padStart(2, '0') + '</span> / ' + String(total).padStart(2, '0');
    const slide = slides[current];
    if (slide) slide.scrollTop = 0;
  }
  function goTo(i) { current = Math.max(0, Math.min(total - 1, i)); render(); }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const overlay = document.querySelector('.toc-overlay');
    if (overlay && overlay.classList.contains('show')) {
      if (e.key === 'Escape') overlay.classList.remove('show');
      return;
    }
    switch (e.key) {
      case 'ArrowRight': case ' ': case 'PageDown': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
      case 'Home': goTo(0); break;
      case 'End': goTo(total - 1); break;
      case 'Escape': if (overlay) overlay.classList.remove('show'); break;
      case 'o': case 'O': if (overlay) overlay.classList.toggle('show'); break;
    }
  });

  /* ---------- wheel ---------- */
  let wheelLock = false;
  document.addEventListener('wheel', (e) => {
    const slide = slides[current];
    if (slide && slide.scrollHeight > slide.clientHeight && e.deltaY > 0 && slide.scrollTop + slide.clientHeight < slide.scrollHeight - 2) return;
    if (slide && slide.scrollHeight > slide.clientHeight && e.deltaY < 0 && slide.scrollTop > 0) return;
    if (wheelLock) return;
    wheelLock = true; setTimeout(() => wheelLock = false, 600);
    if (e.deltaY > 30) next(); else if (e.deltaY < -30) prev();
  }, { passive: true });

  /* ---------- buttons ---------- */
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.dataset.nav;
      if (d === 'next') next();
      else if (d === 'prev') prev();
      else if (d === 'toc') document.querySelector('.toc-overlay')?.classList.toggle('show');
      else if (d === 'home') window.location.href = 'index.html';
      else if (d === 'close-toc') document.querySelector('.toc-overlay')?.classList.remove('show');
    });
  });

  /* ---------- touch ---------- */
  let touchX = 0;
  document.addEventListener('touchstart', e => touchX = e.touches[0].clientX, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) { if (dx < 0) next(); else prev(); }
  }, { passive: true });

  /* ---------- OS tabs (install slides) ---------- */
  document.querySelectorAll('.os-tabs').forEach(tabs => {
    const group = tabs.dataset.osGroup || 'default';
    tabs.querySelectorAll('.os-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.os;
        document.querySelectorAll('[data-os-group="' + group + '"] .os-tab').forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.os-panel[data-os-group="' + group + '"]').forEach(p => p.classList.toggle('active', p.dataset.os === target));
      });
    });
  });

  buildTOC();
  render();
})();
