import { text, isPlaceholder, esc } from '../i18n.js';
import { site } from '../content/site.js';

const $ = (id) => document.getElementById(id);
const pad = (i) => String(i + 1).padStart(2, '0');

export function renderContent(c) {
  $('nav-links').innerHTML = Object.entries(c.nav)
    .map(([k, v]) => `<li><a href="#${k}" data-nav="${k}">${text(v)}</a></li>`).join('');

  $('hero-fields').innerHTML = c.hero.fields.map(f => `<li>${text(f)}</li>`).join('');

  $('about-body').innerHTML = `
    <div class="about__text" data-reveal>${c.about.paragraphs.map(p => `<p>${text(p)}</p>`).join('')}</div>
    <ul class="principles" data-reveal>${c.about.principles.map((p, i) => `
      <li><span class="principles__n">${pad(i)}</span><div><h3>${text(p.title)}</h3><p>${text(p.text)}</p></div></li>`).join('')}
    </ul>`;

  $('skills-list').innerHTML = c.skills.groups.map((g, i) => `
    <li class="skill-group${g.complementary ? ' skill-group--complementary' : ''}" data-reveal>
      <header><span class="skill-group__n">${pad(i)}</span><h3>${text(g.title)}</h3><p class="skill-group__tag">${text(g.tagline)}</p></header>
      <ul class="skill-group__items">${g.items.map(s => `<li>${text(s)}</li>`).join('')}</ul>
    </li>`).join('');

  $('services-list').innerHTML = c.services.items.map(s => `
    <li class="service" data-reveal><h3>${text(s.title)}</h3><p>${text(s.text)}</p></li>`).join('');

  $('journey-list').innerHTML = c.journey.steps.map((s, i) => `
    <li class="journey__step" data-step="${i}">
      <span class="journey__label">${text(s.label)}</span><h3>${text(s.title)}</h3><p>${text(s.text)}</p>
    </li>`).join('');

  const whatsappUrl = site.whatsappUrl && !isPlaceholder(site.whatsappUrl);
  $('socials').setAttribute('aria-label', c.a11y.socials);
  $('socials').innerHTML = whatsappUrl
    ? `<li><a href="${esc(site.whatsappUrl)}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>`
    : `<li>${text(c.contact.socialsPlaceholder)}</li>`;
}
