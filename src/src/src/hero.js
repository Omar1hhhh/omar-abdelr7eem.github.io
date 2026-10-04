import gsap from 'gsap';

export function setupHero(content, lang, reduced) {
  const el = document.getElementById('hero-name');
  const name = content.hero.name;
  el.setAttribute('aria-label', name);
  // Arabic letters must stay joined, so split by word; Latin splits by character.
  el.innerHTML = name.split(' ').map(w => {
    const units = lang === 'ar' ? [w] : [...w];
    return `<span class="hero__word">${units.map(u => `<span class="hero__char" aria-hidden="true">${u}</span>`).join('')}</span>`;
  }).join('');
  if (reduced) return;
  gsap.fromTo('.hero__char',
    { yPercent: 110, opacity: 0, rotateX: -35 },
    { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.2, ease: 'expo.out', stagger: 0.035, delay: 0.15 });
}
