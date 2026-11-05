import en from './content/en.json';
import ar from './content/ar.json';

const DICT = { en, ar };
const KEY = 'oa-lang';

export const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const isPlaceholder = (s) => typeof s === 'string' && s.trim().startsWith('[[EDIT');
export const text = (s) => isPlaceholder(s) ? `<mark class="edit">${esc(s)}</mark>` : esc(s);
const get = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);

export function createI18n() {
  const listeners = [];
  const q = new URLSearchParams(location.search).get('lang');
  let lang = DICT[q] ? q : localStorage.getItem(KEY) || (navigator.language?.startsWith('ar') ? 'ar' : 'en');

  function render() {
    const c = DICT[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = c.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', c.meta.description);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = get(c, el.dataset.i18n);
      if (v != null) el.innerHTML = text(v);
    });
    localStorage.setItem(KEY, lang);
    listeners.forEach(fn => fn({ lang, content: c }));
    window.dispatchEvent(new CustomEvent('portfolio:language-change', { detail: { lang } }));
  }

  return {
    get lang() { return lang; },
    content: () => DICT[lang],
    onRender: (fn) => listeners.push(fn),
    render,
    toggle() { lang = lang === 'en' ? 'ar' : 'en'; render(); }
  };
}
