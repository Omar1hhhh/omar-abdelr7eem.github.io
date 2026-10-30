import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

let dynamicTriggers = [];
let revealObserver = null;

export function setupScroll(getSceneApi, reduced) {
  if (reduced) return staticMode();

  document.querySelectorAll('[data-stage]').forEach(sec => ScrollTrigger.create({
    trigger: sec, start: 'top 55%', end: 'bottom 55%',
    onEnter: () => getSceneApi()?.setStage(sec.dataset.stage),
    onEnterBack: () => getSceneApi()?.setStage(sec.dataset.stage)
  }));

  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => getSceneApi()?.setProgress(s.progress) });

  gsap.to('.hero__content', {
    yPercent: -12, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 30%', scrub: true }
  });

  bindDynamic(getSceneApi);
}

export function refreshScroll(getSceneApi, reduced) {
  if (reduced) return staticMode();
  bindDynamic(getSceneApi);
  ScrollTrigger.refresh();
}

function bindDynamic(getSceneApi) {
  dynamicTriggers.forEach(trigger => trigger.kill());
  dynamicTriggers = [];
  revealObserver?.disconnect();

  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      gsap.fromTo(el, { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, ease: 'power3.out'
      });
      revealObserver.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px' });

  gsap.utils.toArray('[data-reveal]').forEach(el => revealObserver.observe(el));

  const steps = gsap.utils.toArray('.journey__step');
  steps.forEach((el, i) => dynamicTriggers.push(ScrollTrigger.create({
    trigger: el, start: 'top 60%', end: 'bottom 60%',
    onToggle: self => {
      if (!self.isActive) return;
      steps.forEach(s => s.classList.toggle('is-active', s === el));
      getSceneApi()?.setJourneyStep(i, steps.length);
    }
  })));
}

function staticMode() {
  document.querySelectorAll('[data-reveal]').forEach(el => (el.style.opacity = 1));
  document.querySelectorAll('.journey__step').forEach(s => s.classList.add('is-active'));
}
