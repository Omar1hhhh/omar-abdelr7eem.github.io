import React from 'react';
import { createRoot } from 'react-dom/client';
import './scene/src/src/styles/main.css';
import { VirtualPortfolioGuide } from './guide/VirtualPortfolioGuide.jsx';
import { createI18n } from './i18n.js';
import { renderContent } from './src/render.js';
import { setupHero } from './src/src/hero.js';
import { setupNav } from './nav.js';
import { setupContact } from './src/contact.js';
import { setupScroll, refreshScroll } from './scroll.js';

async function bootstrap() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileQuery = matchMedia('(max-width: 768px)');
  let sceneApi = null;
  const i18n = createI18n();
  setupNav(i18n);

  const guideRoot = document.getElementById('portfolio-guide-root');
  if (!guideRoot) throw new Error('The portfolio guide mount point is missing.');
  createRoot(guideRoot).render(React.createElement(VirtualPortfolioGuide));

  let first = true;
  i18n.onRender(({ lang, content }) => {
    renderContent(content);
    setupHero(content, lang, reduced);
    setupContact(content);
    sceneApi?.setLayout({ rtl: lang === 'ar', mobile: mobileQuery.matches });
    if (!first) refreshScroll(() => sceneApi, reduced);
  });
  i18n.render();
  setupScroll(() => sceneApi, reduced);
  first = false;

  mobileQuery.addEventListener('change', e => sceneApi?.setLayout({ mobile: e.matches }));

  const canvas = document.getElementById('scene');

  if (!canvas || (!canvas.getContext('webgl2') && !canvas.getContext('webgl'))) {
    document.body.classList.add('no-webgl');
    return;
  }

  async function loadScene() {
    try {
      const { createScene } = await import('./scene/scene.js');
      sceneApi = createScene(canvas, { reduced });
      sceneApi.setLayout({ rtl: i18n.lang === 'ar', mobile: mobileQuery.matches });
    } catch (error) {
      console.error('The 3D background could not be loaded. Using the static background instead.', error);
      document.body.classList.add('no-webgl');
    }
  }

  window.setTimeout(() => { void loadScene(); }, 0);
}

bootstrap();
