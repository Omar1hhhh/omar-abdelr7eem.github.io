import './styles/main.css';
import { createI18n } from './i18n.js';
import { renderContent } from './render.js';
import { setupHero } from './hero.js';
import { setupNav } from './nav.js';
import { setupContact } from './contact.js';
import { setupScroll, refreshScroll } from './scroll.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileQuery = matchMedia('(max-width: 768px)');

const hasWebGL = (() => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
})();

let sceneApi = null;
if (hasWebGL) {
  const { createScene } = await import('./scene/scene.js');
  sceneApi = createScene(document.getElementById('scene'), { reduced });
} else {
  document.body.classList.add('no-webgl');
}

const i18n = createI18n();
setupNav(i18n);

let first = true;
i18n.onRender(({ lang, content }) => {
  renderContent(content);
  setupHero(content, lang, reduced);
  setupContact(content);
  sceneApi?.setLayout({ rtl: lang === 'ar', mobile: mobileQuery.matches });
  if (!first) refreshScroll(sceneApi, reduced);
});
i18n.render();
setupScroll(sceneApi, reduced);
first = false;

mobileQuery.addEventListener('change', e => sceneApi?.setLayout({ mobile: e.matches }));
