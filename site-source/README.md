# Source for aarzoodhiman.github.io

The live site is a plain multi-file static site at the top of the repository. There is no bundling step for the pages: edit the files, refresh, commit.

| What you want to change | File to edit |
|---|---|
| Profile text, numbers, links | `../index.html` |
| Research text and papers | `../research.html` |
| Funding, awards, talks and service (then run `python3 update-counts.py`) | `../funding-talks.html` |
| Ribbon, colours, fonts, spacing, all layout | `../assets/css/site.css` |
| Shared behaviour (personalised links, reveals, contact close) | `../assets/js/app.js` |
| Hero dot field, the education and experience globe and its camera | `../assets/js/profile.js` |
| The seven stop cards (text, dates) | `../index.html`, `#jcards` |
| Funnel and MDT scroll stories, simulator, project gallery, paper filters | `../assets/js/research.js` (the shared pin/scrub/step helper is `../assets/js/story.js`) |
| Funding & talks rail and filters | `../assets/js/funding.js` |
| 404 page | `../404.html` |
| Link-preview image | `og.html` (see below) |
| `classic.html` | `v1-classic/src.html`, then `python3 build.py` |

`v2-signal/` is the old single-file source of the main site. It is kept for reference (and for `make-globe.mjs`); nothing builds from it any more.

## Build step (only vendor files, fonts and classic.html)
```
cd site-source
npm install        # first time only
python3 build.py   # copies gsap, ScrollTrigger, lenis and the two fonts into ../assets, rebuilds ../classic.html
```

## Preview
```
cd ..                       # repository root
python3 -m http.server 8000
# open http://localhost:8000
```

## Photos
Drop photos in `photos/` with the names in `photos/README.md` (and credits in `photos/credits.txt`), then:
```
cd site-source
node make-images.mjs        # writes ../assets/img/<name>-800.webp and -1600.webp and ../assets/data/photos.json
```
The journey globe and the portrait show only the photos listed in `photos.json`; every other stop shows a typographic card.

## Globe data
`land.json` stores tenths of a degree; the detail files store hundredths. See Maps below for how they are made.

## Maps (India, state outlines, UK)
India is drawn with its official boundary from Natural Earth's India point-of-view file, never from the default world polygons. Source zips live in `map-sources/` (git-ignored); download them from https://www.naturalearthdata.com/downloads/10m-cultural-vectors/ (Admin 0 point of views: `ne_10m_admin_0_countries_ind.zip`; Admin 0 countries: `ne_10m_admin_0_countries.zip`; Admin 1: `ne_10m_admin_1_states_provinces.zip`) and unzip in place. Then:
```
cd site-source/map-sources
npx mapshaper ne_10m_admin_0_countries_ind/ne_10m_admin_0_countries_ind.shp -filter 'ADM0_A3 == "IND"' -filter-fields ADM0_A3 -simplify 20% keep-shapes -o format=topojson ../../assets/data/india.json
npx mapshaper ne_10m_admin_1_states_provinces/ne_10m_admin_1_states_provinces.shp -filter '["Haryana","Uttarakhand"].includes(name) && adm0_a3=="IND"' -filter-fields name -simplify 40% keep-shapes -o format=topojson ../../assets/data/india-states.json
cd ..
# Great Britain outline (Natural Earth 10m admin 0, GBR) and the Greater London / East Riding / Hull outlines (10m admin 1; the London boroughs are dissolved into one)
cd map-sources
npx mapshaper ne_10m_admin_0_countries/ne_10m_admin_0_countries.shp -filter 'ADM0_A3 == "GBR"' -filter-fields ADM0_A3 -simplify 25% keep-shapes -o format=topojson ../../assets/data/uk.json
npx mapshaper ne_10m_admin_1_states_provinces/ne_10m_admin_1_states_provinces.shp -filter 'adm0_a3=="GBR" && (region=="Greater London" || name=="East Riding of Yorkshire" || name=="Kingston upon Hull")' -each 'if (region=="Greater London") name="Greater London"' -filter-fields name -dissolve fields=name -simplify 40% keep-shapes -o format=topojson ../../assets/data/uk-regions.json
cd ..
node v2-signal/make-globe.mjs --res 50m --step 0.18 --bbox 6,67,38,98 --shape ../assets/data/india.json --out ../assets/data/india-detail.json
node v2-signal/make-globe.mjs --res 10m --step 0.05 --bbox 49.9,-5.8,56.2,2.0 --shape ../assets/data/uk.json --out ../assets/data/uk-detail.json
```
`--shape` keeps only dots inside the outline, so India's dots follow India's official boundary. Credit shown on the page: Map data: Natural Earth.

## Slides
See `slides/README.md` for the file names and conversion commands (needs LibreOffice's `soffice`, Ghostscript, poppler and webp).

## Link-preview image and icons
`og.html` is the template for `assets/img/og.png` (1200 x 630). Open it in a browser through the local server (`http://localhost:8000/site-source/og.html`) and screenshot the `.og` element. `assets/img/favicon.svg` is the source of the PNG icons.

## Rules that keep the site honest and working
- Only use facts from `CV_FACTS.md` and the existing site text. `FACT_AUDIT.md` lists where each number comes from.
- There is one version of every text. The only thing remembered in the browser is the motion setting (`ad-motion`).
- `?for=Company` personalises the page and is carried across the pages.
- Headings that animate line by line have `data-lines`. Keep them to plain text with no links inside.
- No phone number anywhere on the site.
- Don't edit `classic.html` at the top level by hand; it is a build output.
