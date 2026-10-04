import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

let dynamic = [];

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
  dynamic.forEach(t => t.kill());
  dynamic = [];

  gsap.utils.toArray('[data-reveal]').forEach(el => {
    const tw = gsap.fromTo(el, { y: 36, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
    dynamic.push(tw.scrollTrigger);
  });

  const steps = gsap.utils.toArray('.journey__step');
  steps.forEach((el, i) => dynamic.push(ScrollTrigger.create({
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
