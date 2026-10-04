export function setupNav(i18n) {
  const nav = document.getElementById('nav');
  const btn = document.getElementById('lang-toggle');
  btn.addEventListener('click', () => i18n.toggle());

  i18n.onRender(({ lang, content }) => {
    btn.textContent = lang === 'en' ? 'عربي' : 'EN';
    btn.lang = lang === 'en' ? 'ar' : 'en';
    btn.setAttribute('aria-label', content.a11y.lang);
  });

  let last = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('nav--hidden', y > last && y > 160);
    last = y;
  }, { passive: true });

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('is-active', a.dataset.nav === e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => io.observe(s));
}
