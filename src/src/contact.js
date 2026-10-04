import { site } from '../content/site.js';
import { text } from '../i18n.js';

export function setupContact(content) {
  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');
  const btn = form.querySelector('button[type=submit]');
  const emailEl = document.getElementById('contact-email');
  const f = content.contact.form;
  const whatsappUrl = /^https:\/\/wa\.me\/\d+$/.test(site.whatsappUrl)
    ? new URL(site.whatsappUrl)
    : null;

  emailEl.textContent = site.email;

  if (!whatsappUrl && site.whatsappUrl) {
    console.error('Invalid WhatsApp URL in src/content/site.js. Use https://wa.me/ followed by the international phone number.');
  }
  btn.disabled = !whatsappUrl;
  note.innerHTML = btn.disabled ? text(f.unconfigured) : '';

  form.onsubmit = (e) => {
    e.preventDefault();
    if (!whatsappUrl) {
      note.textContent = f.unconfigured;
      return;
    }

    const data = new FormData(form);
    const message = `${f.name}: ${data.get('name')}\n${f.email}: ${data.get('email')}\n\n${f.message}:\n${data.get('message')}`;
    whatsappUrl.searchParams.set('text', message);
    location.assign(whatsappUrl.toString());
  };
}
