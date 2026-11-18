# Hatim Asslik: portfolio

Static site built with [Astro](https://astro.build) for GitHub Pages.

## Run locally

```bash
npm install
npm run dev      # http://127.0.0.1:4321
npm run build    # production files in dist/
npm run preview  # serve dist/ locally
```

## Edit the content

| What | Where |
| --- | --- |
| Name, intro, education, skills, awards | `src/data/profile.ts` |
| Papers | `src/content/research/<id>/index.md` |
| Projects | `src/content/projects/<id>/index.md` |
| Experience | `src/content/experience/<id>/index.md` |
| Teaching | `src/content/teaching/<id>/index.md` |

Images sit in the `media/` folder next to each `index.md` and are listed under `media:`.
Add `public: false` to an image to hide it from its page and from the Media gallery.

## Papers and CV

```bash
npm run prepare:papers  # rebuild the view-only files from ../Papers
npm run prepare:cv      # rebuild the public CV PDF, without the phone number
```

The original paper PDFs stay outside this project. Only scrambled files in `public/papers/`
are published and read by the PDF.js viewer. This blocks ordinary saving, but a determined
visitor can still reconstruct a file that their browser is able to display.

## Search engines

The site is hidden from search results: every page carries a `noindex` tag, and `robots.txt`
blocks the CV PDF and image search. It stays open to anyone with the link. To list it again,
set `searchable` to `true` in `src/data/search.mjs`.

Keep `robots.txt` from blocking the pages themselves, or crawlers will never read the tag.

## Publish

Create a repository named `<username>.github.io`, push this folder to `main`, and set
**Settings → Pages → Source** to **GitHub Actions**.
