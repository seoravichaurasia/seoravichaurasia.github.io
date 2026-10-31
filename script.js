/* Ravi Chaurasia portfolio: small enhancements, no libraries */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- theme (applied before first paint) ---------- */
  var THEME_KEY = 'rc-theme';
  function storedTheme() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '#0b1413' : '#0f3d3e');
  }
  applyTheme(storedTheme() === 'dark' ? 'dark' : 'light');

  /* ---------- quick initials intro, once per visit ---------- */
  var reduceEarly = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seenIntro = false;
  try { seenIntro = sessionStorage.getItem('rc-intro') === '1'; sessionStorage.setItem('rc-intro', '1'); } catch (e) {}
  if (!reduceEarly && !seenIntro) {
    root.classList.add('intro');
    var endIntro = function () {
      root.classList.remove('intro');
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { window.removeEventListener(ev, endIntro, true); });
    };
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, endIntro, { capture: true, passive: true }); });
    setTimeout(endIntro, 700);
  }

  function failOpen() {
    // If anything goes wrong, show every piece of content.
    root.classList.remove('js');
  }
  // Safety net: if the page has not finished setting up in a few seconds, show everything.
  var safety = setTimeout(failOpen, 4000);

  function init() {
    try {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var hasIO = 'IntersectionObserver' in window;

      /* ---------- scroll reveal ---------- */
      var revealSel = [
        'section:not(.hero) h2', '.sub', '.about .two > div', '.every', '.pfilter',
        '.skillgrid > div', '.timeline > li', '.edu li', '.contact .lead', '.ccard'
      ].join(',');
      var revealEls = Array.prototype.slice.call(document.querySelectorAll(revealSel));
      var cards = Array.prototype.slice.call(document.querySelectorAll('.pcard'));
      revealEls = revealEls.concat(cards);
      revealEls.forEach(function (el) { el.classList.add('reveal'); });

      document.querySelectorAll('.chips').forEach(function (ul) {
        ul.classList.add('pop');
        Array.prototype.forEach.call(ul.children, function (li, i) { li.style.setProperty('--i', i); });
      });

      if (reduce || !hasIO) {
        revealEls.forEach(function (el) { el.classList.add('in'); });
        document.querySelectorAll('.chips').forEach(function (ul) { ul.classList.add('in'); });
      } else {
        var io = new IntersectionObserver(function (entries) {
          var batch = entries.filter(function (e) { return e.isIntersecting; })
            .map(function (e) { return e.target; })
            .sort(function (a, b) {
              return (a.getBoundingClientRect().top - b.getBoundingClientRect().top) ||
                     (a.getBoundingClientRect().left - b.getBoundingClientRect().left);
            });
          batch.forEach(function (el, i) {
            el.style.setProperty('--d', Math.min(i, 6) * 90 + 'ms');
            el.classList.add('in');
            io.unobserve(el);
          });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        revealEls.forEach(function (el) { io.observe(el); });

        var chipIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('in'); chipIO.unobserve(e.target); }
          });
        }, { threshold: 0.2 });
        document.querySelectorAll('.chips').forEach(function (ul) { chipIO.observe(ul); });
      }


      /* ---------- hero rotating text ---------- */
      var rot = document.querySelector('.rotator');
      var rotText = rot && rot.querySelector('.rot-text');
      if (rot && rotText && !reduce) {
        var words = ['On-page SEO', 'Technical SEO', 'E-commerce SEO', 'Local SEO'];
        rot.classList.add('live');
        var wi = 0, ci = words[0].length, deleting = true, first = true;
        var tick = function () {
          var w = words[wi];
          var delay;
          if (first) { first = false; delay = 1800; }
          else if (deleting) {
            ci--; rotText.textContent = w.slice(0, ci);
            if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; delay = 260; } else delay = 38;
          } else {
            var nw = words[wi]; ci++; rotText.textContent = nw.slice(0, ci);
            if (ci >= nw.length) { deleting = true; delay = 1700; } else delay = 75;
          }
          setTimeout(tick, delay);
        };
        setTimeout(tick, 600);
      }

      /* ---------- theme toggle ---------- */
      var tbtn = document.querySelector('.theme-btn');
      function syncThemeBtn() {
        if (!tbtn) return;
        var dark = root.getAttribute('data-theme') === 'dark';
        tbtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
        tbtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      }
      if (tbtn) {
        syncThemeBtn();
        tbtn.addEventListener('click', function () {
          var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
          if (!reduce) {
            root.classList.add('theme-anim');
            setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
          }
          applyTheme(next);
          try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
          syncThemeBtn();
        });
      }

      /* ---------- project logos: lettered circle if an image fails ---------- */
      document.querySelectorAll('.plogo img').forEach(function (img) {
        function swap() {
          var span = img.parentNode;
          span.classList.add('pletter');
          span.setAttribute('aria-hidden', 'true');
          span.textContent = span.getAttribute('data-initials') || '';
        }
        if (img.complete && img.naturalWidth === 0) swap();
        else img.addEventListener('error', swap);
      });

      /* ---------- desktop only: cursor glow and card tilt ---------- */
      var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (fine && !reduce) {
        var glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.setAttribute('aria-hidden', 'true');
        document.body.appendChild(glow);
        var gx = 0, gy = 0, gPending = false;
        window.addEventListener('pointermove', function (e) {
          if (e.pointerType !== 'mouse') return;
          gx = e.clientX; gy = e.clientY;
          if (!glow.classList.contains('on')) glow.classList.add('on');
          if (gPending) return;
          gPending = true;
          requestAnimationFrame(function () {
            glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)';
            gPending = false;
          });
        }, { passive: true });
        document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });

        cards.forEach(function (card) {
          var raf = 0;
          card.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse') return;
            var r = card.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(function () {
              card.classList.add('tilting');
              card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
              card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
              card.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - py) * 5).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 6).toFixed(2) + 'deg) translateY(-5px)';
            });
          });
          card.addEventListener('pointerleave', function () {
            cancelAnimationFrame(raf);
            card.classList.remove('tilting');
            card.style.transform = '';
          });
        });
      }

      /* ---------- experience line draws as you scroll ---------- */
      var tl = document.querySelector('.timeline');
      var tlItems = tl ? Array.prototype.slice.call(tl.children) : [];
      function drawTimeline() {
        if (!tl) return;
        if (reduce) { tl.style.setProperty('--tl', 1); tlItems.forEach(function (li) { li.classList.add('lit'); }); return; }
        var r = tl.getBoundingClientRect();
        var mark = window.innerHeight * 0.62;
        var p = (mark - r.top) / r.height;
        p = Math.max(0, Math.min(1, p));
        tl.style.setProperty('--tl', p.toFixed(4));
        tlItems.forEach(function (li) { li.classList.toggle('lit', li.getBoundingClientRect().top + 14 < mark); });
      }

      /* ---------- progress bar, header shadow, back to top ---------- */
      var bar = document.querySelector('.progress span');
      var topbar = document.querySelector('.topbar');
      var toTop = document.querySelector('.to-top');
      var ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.pageYOffset || root.scrollTop;
          var max = root.scrollHeight - window.innerHeight;
          if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
          if (topbar) topbar.classList.toggle('scrolled', y > 40);
          if (toTop) toTop.classList.toggle('show', y > 700);
          drawTimeline();
          ticking = false;
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();

      if (toTop) {
        toTop.addEventListener('click', function (e) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
          var skip = document.querySelector('.brand');
          if (skip) skip.focus({ preventScroll: true });
        });
      }

      /* ---------- mobile menu ---------- */
      var btn = document.querySelector('.menu-btn');
      var nav = document.getElementById('mainnav');
      function closeMenu() {
        if (!nav || !btn) return;
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Open menu');
      }
      if (btn && nav) {
        btn.addEventListener('click', function () {
          var open = !nav.classList.contains('open');
          nav.classList.toggle('open', open);
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
          btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        });
        nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
        document.addEventListener('click', function (e) {
          if (nav.classList.contains('open') && !e.target.closest('.topbar')) closeMenu();
        });
        window.addEventListener('resize', function () { if (window.innerWidth > 640) closeMenu(); });
      }

      /* ---------- active nav link while scrolling ---------- */
      var links = Array.prototype.slice.call(document.querySelectorAll('nav a[href^="#"]'));
      var map = {};
      links.forEach(function (a) {
        var id = a.getAttribute('href').slice(1);
        var sec = document.getElementById(id);
        if (sec) map[id] = a;
      });
      if (hasIO) {
        var navIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            var a = map[e.target.id];
            if (!a) return;
            if (e.isIntersecting) {
              links.forEach(function (l) { l.classList.remove('active'); l.removeAttribute('aria-current'); });
              a.classList.add('active');
              a.setAttribute('aria-current', 'true');
            } else if (a.classList.contains('active')) {
              a.classList.remove('active');
              a.removeAttribute('aria-current');
            }
          });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(map).forEach(function (id) { navIO.observe(document.getElementById(id)); });
      }

      /* ---------- project filter ---------- */
      var filter = document.querySelector('.pfilter');
      var status = document.getElementById('filter-status');
      if (filter && cards.length) {
        filter.hidden = false;
        var buttons = Array.prototype.slice.call(filter.querySelectorAll('button'));
        filter.addEventListener('click', function (e) {
          var b = e.target.closest('button');
          if (!b) return;
          var type = b.getAttribute('data-filter');
          buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          var shown = 0;
          cards.forEach(function (card) {
            var match = type === 'all' || card.getAttribute('data-type') === type;
            card.hidden = !match;
            card.classList.remove('fade-in');
            if (match) {
              card.classList.add('in');
              void card.offsetWidth;
              card.style.animationDelay = Math.min(shown, 8) * 50 + 'ms';
              card.classList.add('fade-in');
              shown++;
            }
          });
          if (status) status.textContent = b.textContent + ' projects shown';
        });
      }

      clearTimeout(safety);
    } catch (err) {
      clearTimeout(safety);
      failOpen();
      if (window.console) console.error(err);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
