# Pizza Lab - Dough Calculator

Super-smooth, dependency-free pizza dough calculator with an unconventional UI. Built with Bun and vanilla JS.

![Runtime](https://img.shields.io/badge/Runtime-Bun-000000?logo=bun&logoColor=white&style=for-the-badge)
![Vanilla JS](https://img.shields.io/badge/JS-Vanilla-F7DF1E?logo=javascript&logoColor=000&style=for-the-badge)
![Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen?style=for-the-badge)
![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white&style=for-the-badge)
![Container](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge)

## Highlights
- Zero deps: plain `index.html`, `index.js`, `app.css`.
- Live updates: tweak sliders, see results instantly.
- Unique visuals: animated background "slices" and hydration fill bar.
- Accessible: keyboard-friendly controls and ARIA live region.

## Quick Start
- Open `index.html` in your browser.

## Using Bun
- `bun dev` - serve current folder at `http://localhost:3000`
- `bun build` - output static site to `dist/`
- `bun prod` - build, then serve `dist/`

## Docker
- Build: `docker build -t pizza-calc .`
- Run: `docker run -p 3000:3000 pizza-calc`

## CI/CD
- GitHub Actions builds and pushes a multi-arch image to GHCR, then restarts a remote service via SSH.
- Required secrets: `NIX_SSH_USER`, `NIX_SSH_HOST`, `NIX_SSH_KEY` (private key). Optional: `REMOTE_SERVICE_NAME` (defaults to `pizza-calc`).

## Math Notes
- Doughball weight is estimated from diameter via a 5th-degree polynomial:
  `4.0179e-5*x^5 - 6.7213e-3*x^4 + 0.4312*x^3 - 13.0956*x^2 + 194.669*x - 970.154`
- Flour rounds to the nearest 5 g.
- tsp/tbsp conversions mirror the original constants.

## Project Structure
- `index.html` - UI markup
- `app.css` - theme, animations, layout
- `index.js` - calculations, formatting, live updates
- `server.js` - tiny static file server
- `scripts/build.mjs` - copy static files to `dist/`
- `scripts/prod.mjs` - build, then serve `dist/`
- `.github/workflows/build-push-deploy.yml` - container build/push + remote restart

## Roadmap
- Unit toggle (metric/US)
- Print/shareable recipe view
- Themes (dark/bright kitchen modes)
