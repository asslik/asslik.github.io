// Full-screen image viewer for every figure on the page.
const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
const image = dialog?.querySelector('img');
const caption = dialog?.querySelector<HTMLElement>('[data-lb-caption]');
const counter = dialog?.querySelector<HTMLElement>('[data-lb-count]');

if (dialog && image && caption && counter) {
  let index = 0;
  let opener: HTMLElement | null = null;
  const items = () =>
    [...document.querySelectorAll<HTMLButtonElement>('[data-lightbox]')].filter((item) => item.offsetParent !== null);

  const show = (next: number) => {
    const list = items();
    if (!list.length) return;
    index = (next + list.length) % list.length;
    const item = list[index];
    image.src = item.dataset.full ?? '';
    image.alt = item.dataset.alt ?? '';
    image.classList.toggle('is-photo', item.dataset.kind === 'photo');
    caption.textContent = item.dataset.caption ?? '';
    counter.textContent = `${index + 1} / ${list.length}`;
    list[index + 1]?.dataset.full && (new Image().src = list[index + 1].dataset.full as string);
  };

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element).closest<HTMLButtonElement>('[data-lightbox]');
    if (!trigger) return;
    opener = trigger;
    show(items().indexOf(trigger));
    dialog.showModal();
  });
  dialog.querySelector('[data-lb-close]')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lb-prev]')?.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lb-next]')?.addEventListener('click', () => show(index + 1));
  dialog.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.matches('.lightbox__img-wrap, .lightbox__stage')) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    opener?.focus();
  });
}
