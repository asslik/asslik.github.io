// Theme switch, mobile menu, header state, e-mail links and copy buttons.
const root = document.documentElement;
const header = document.querySelector<HTMLElement>('.site-header');

document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    // Private browsing can block storage. The choice then lasts for this page only.
  }
});

const menu = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
menu?.addEventListener('click', () => {
  const open = header?.classList.toggle('is-open') ?? false;
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

if (header?.classList.contains('site-header--hero')) {
  const hero = document.querySelector('.hero');
  if (hero) {
    new IntersectionObserver(
      ([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting),
      { rootMargin: '-72px 0px 0px 0px' },
    ).observe(hero);
  }
}

document.querySelectorAll<HTMLAnchorElement>('[data-email]').forEach((link) => {
  const address = atob(link.dataset.email ?? '').split('').reverse().join('');
  link.href = `mailto:${address}`;
  if (link.hasAttribute('data-email-show')) link.textContent = address;
});

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  const label = button.textContent;
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copy ?? '');
    if (!source?.textContent) return;
    try {
      await navigator.clipboard.writeText(source.textContent);
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Select the text to copy';
    }
    setTimeout(() => (button.textContent = label), 1800);
  });
});
