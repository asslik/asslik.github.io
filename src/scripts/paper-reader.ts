// View-only paper reader built on PDF.js. Pages are drawn on canvases, without a
// text layer and without download or print controls.
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { scramble } from './paper-cipher.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const MAX_PIXEL_RATIO = 2;
const KEEP_DISTANCE = 1600;

interface Slot {
  number: number;
  page: PDFPageProxy;
  box: HTMLDivElement;
  canvas?: HTMLCanvasElement;
  task?: RenderTask;
  drawnAt?: number;
}

const root = document.querySelector<HTMLElement>('[data-reader]');
if (root) start(root);

function start(el: HTMLElement) {
  const $ = <T extends Element>(selector: string) => el.querySelector<T>(selector) as T;
  const scroller = $<HTMLElement>('.reader__scroll');
  const pagesEl = $<HTMLElement>('.reader__pages');
  const state = $<HTMLElement>('.reader__state');
  const message = $<HTMLElement>('[data-message]');
  const bar = $<HTMLElement>('.reader__progress i');
  const pageInput = $<HTMLInputElement>('[data-page]');
  const pageTotal = $<HTMLElement>('[data-total]');
  const zoomLabel = $<HTMLElement>('[data-zoom-label]');
  const id = el.dataset.id as string;

  let slots: Slot[] = [];
  let zoom = 1;
  let baseWidth = 612;
  let current = 1;
  let redrawTimer = 0;

  const scale = () => {
    const room = Math.min(scroller.clientWidth - paddingX(), 960);
    return (Math.max(room, 240) / baseWidth) * zoom;
  };
  const paddingX = () => {
    const style = getComputedStyle(scroller);
    return parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  };

  async function download(): Promise<Uint8Array> {
    const response = await fetch(el.dataset.src as string);
    if (!response.ok || !response.body) throw new Error(`Request failed: ${response.status}`);
    const total = Number(response.headers.get('content-length')) || 0;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (total) bar.style.width = `${Math.min(100, (received / total) * 100)}%`;
    }
    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return scramble(bytes, id);
  }

  function layout() {
    const s = scale();
    for (const slot of slots) {
      const viewport = slot.page.getViewport({ scale: s });
      slot.box.style.width = `${Math.floor(viewport.width)}px`;
      slot.box.style.height = `${Math.floor(viewport.height)}px`;
    }
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  }

  function release(slot: Slot) {
    slot.task?.cancel();
    slot.task = undefined;
    slot.drawnAt = undefined;
    if (slot.canvas) {
      slot.canvas.width = slot.canvas.height = 0;
      slot.canvas.remove();
      slot.canvas = undefined;
    }
  }

  async function draw(slot: Slot) {
    const s = scale();
    if (slot.drawnAt === s || slot.task) return;
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const viewport = slot.page.getViewport({ scale: s * ratio });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.setAttribute('aria-hidden', 'true');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;
    const task = slot.page.render({ canvasContext: context, viewport, annotationMode: pdfjs.AnnotationMode.DISABLE });
    slot.task = task;
    try {
      await task.promise;
      slot.canvas?.remove();
      slot.canvas = canvas;
      slot.box.append(canvas);
      slot.drawnAt = s;
    } catch (error) {
      if ((error as Error).name !== 'RenderingCancelledException') console.error(error);
    } finally {
      if (slot.task === task) slot.task = undefined;
    }
    if (slot.drawnAt !== scale()) refresh();
  }

  function refresh() {
    const view = scroller.getBoundingClientRect();
    let best = current;
    let bestDistance = Infinity;
    for (const slot of slots) {
      const rect = slot.box.getBoundingClientRect();
      const distance = Math.max(view.top - rect.bottom, rect.top - view.bottom, 0);
      if (distance < 500) draw(slot);
      else if (distance > KEEP_DISTANCE) release(slot);
      const anchor = Math.abs(rect.top - (view.top + view.height * 0.3));
      const contains = rect.top <= view.top + view.height * 0.3 && rect.bottom >= view.top + view.height * 0.3;
      const score = contains ? -1 : anchor;
      if (score < bestDistance) {
        bestDistance = score;
        best = slot.number;
      }
    }
    if (best !== current || document.activeElement !== pageInput) {
      current = best;
      if (document.activeElement !== pageInput) pageInput.value = String(current);
    }
    $<HTMLButtonElement>('[data-prev]').disabled = current <= 1;
    $<HTMLButtonElement>('[data-next]').disabled = current >= slots.length;
  }

  function goTo(number: number) {
    const slot = slots[Math.min(slots.length, Math.max(1, number)) - 1];
    if (!slot) return;
    scroller.scrollTo({ top: slot.box.offsetTop - pagesEl.offsetTop - 8 });
  }

  function setZoom(next: number) {
    const anchorPage = current;
    const offset = slots[anchorPage - 1]
      ? (scroller.scrollTop - (slots[anchorPage - 1].box.offsetTop - pagesEl.offsetTop)) /
        (slots[anchorPage - 1].box.offsetHeight || 1)
      : 0;
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next * 100) / 100));
    layout();
    const slot = slots[anchorPage - 1];
    if (slot) scroller.scrollTop = slot.box.offsetTop - pagesEl.offsetTop + offset * slot.box.offsetHeight;
    scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2;
    queueRedraw();
  }

  function queueRedraw() {
    clearTimeout(redrawTimer);
    redrawTimer = window.setTimeout(() => {
      slots.forEach((slot) => {
        if (slot.task) {
          slot.task.cancel();
          slot.task = undefined;
        }
      });
      refresh();
    }, 140);
  }

  function bindControls() {
    $('[data-zoom-in]').addEventListener('click', () => setZoom(zoom + 0.15));
    $('[data-zoom-out]').addEventListener('click', () => setZoom(zoom - 0.15));
    $('[data-fit]').addEventListener('click', () => setZoom(1));
    $('[data-prev]').addEventListener('click', () => goTo(current - 1));
    $('[data-next]').addEventListener('click', () => goTo(current + 1));
    pageInput.addEventListener('change', () => goTo(Number(pageInput.value) || current));
    pageInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') pageInput.blur();
    });
    $('[data-fullscreen]').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else el.requestFullscreen?.();
    });
    let ticking = false;
    scroller.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          refresh();
        });
      },
      { passive: true },
    );
    new ResizeObserver(() => {
      layout();
      queueRedraw();
    }).observe(scroller);
  }

  function blockSaving() {
    el.addEventListener('contextmenu', (event) => event.preventDefault());
    el.addEventListener('dragstart', (event) => event.preventDefault());
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && ['s', 'p'].includes(event.key.toLowerCase())) event.preventDefault();
    });
  }

  async function open() {
    state.hidden = false;
    message.textContent = 'Loading paper…';
    bar.style.width = '0';
    try {
      const data = await download();
      const pdf: PDFDocumentProxy = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
      const pages = await Promise.all(Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1)));
      baseWidth = pages[0].getViewport({ scale: 1 }).width;
      slots = pages.map((page, i) => {
        const box = document.createElement('div');
        box.className = 'pdf-page';
        box.setAttribute('role', 'img');
        box.setAttribute('aria-label', `Page ${i + 1} of ${pdf.numPages}`);
        pagesEl.append(box);
        return { number: i + 1, page, box };
      });
      pageTotal.textContent = String(pdf.numPages);
      pageInput.max = String(pdf.numPages);
      state.hidden = true;
      layout();
      bindControls();
      refresh();
      el.dataset.ready = 'true';
    } catch (error) {
      console.error(error);
      message.textContent = 'The paper could not be loaded. Please reload the page and try again.';
      bar.parentElement?.setAttribute('hidden', '');
    }
  }

  blockSaving();
  open();
}
