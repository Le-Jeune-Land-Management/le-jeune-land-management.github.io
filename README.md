# Le'Jeune Land Management

Website for Le'Jeune Land Management: landscaping, lawn care and outdoor
construction in Cedar Creek, Texas, serving Bastrop County.

A static one-page site with no build step, hosted on GitHub Pages.

```
index.html     the whole site (CSS and JS inline, one HTTP request)
assets/        seal artwork, favicon, apple touch icon
robots.txt     crawler rules, points at the sitemap
sitemap.xml    single URL
.nojekyll      serve files as-is, no Jekyll processing
tools/         local preview server and two optional build scripts
```

## Preview locally

With Node installed:

```bash
node tools/serve.js
```

Then open http://localhost:8200. Edits show on refresh; the server sends
`no-store`, so nothing is cached.

## Publishing

GitHub Pages serves the root of `main`. Pushing to `main` publishes.

To use a custom domain, add a `CNAME` file containing only the domain, then
point its DNS at GitHub Pages and set the domain under
**Settings → Pages**.

### If the domain changes

The canonical URL appears in several places and they must all agree:

- `<link rel="canonical">` in `index.html`
- the `og:url` and `og:image` tags in `index.html`
- the JSON-LD `@id` and `url` fields at the bottom of `index.html`
- `robots.txt`
- `sitemap.xml`

### Contact form

The quote request form is Jobber's embedded work request form, so requests land
directly in the business's Jobber account. The embed snippet sits in the
`#estimate` section of `index.html`. The form renders inside a cross-origin
iframe: its fields, wording and button colour are edited in Jobber, not here.
The page only styles the card around it (`.quote-card` in the CSS).

## Build scripts

Neither is needed to publish. Both are for sharing a preview.

- `node tools/build-dist.js` writes `dist/` containing only the files the site
  serves, with a `robots.txt` that blocks indexing so a preview deploy cannot
  compete with the real site in search.
- `node tools/build-singlefile.js` writes one self-contained HTML file with the
  images inlined. It opens by double-clicking, with no server or asset folder.

## Design notes

- **Colour** is sampled from the business's own wax-seal logo rather than
  chosen. The tokens live in the `:root` block of `index.html`. One rule to
  keep: the honey gold fails contrast on the light background (2.33:1), so it is
  an accent for dark backgrounds only.
- **Type** is Fraunces for display and Source Sans 3 for body, from Google
  Fonts, with Georgia and system sans as fallbacks. Self-hosting the fonts is the
  obvious next performance improvement.
- **Layout** runs services as ruled rows rather than a card grid.
- **Mobile** keeps a tap-to-call bar pinned at every scroll position. On
  desktop, where a `tel:` link cannot dial, clicking a phone number copies it
  and confirms with a toast.
- **The seal** was cut out of a JPEG on a white background. The background is
  flood-filled inward from the image borders, which protects the light silver
  embossing inside the seal that a brightness threshold would destroy. Alpha is
  then derived from a chamfer distance transform, eroding past the JPEG
  compression fringe before feathering, which is what prevents a pale outline
  on the dark hero.
