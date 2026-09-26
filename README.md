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

- **Colour** follows the business's brand, and only the brand. The primary is
  navy `#1F3B4D` (`--navy-600`), the colour the wax seal sits on and the same
  primary their Jobber account uses. The seal's red `#4A1412` (`--oxblood-600`)
  is the accent: phone calls to action and small highlights. The seal's silver
  embossing gives the neutrals (`--bone-*`, `--pewter-*`), and it is what goes on
  navy where a light colour is needed, such as the header's call button. The
  tokens live in the `:root` block of `index.html`. One rule to keep: red on navy
  is nearly invisible (1.28:1), so never put a red button on a navy band.
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
