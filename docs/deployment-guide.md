# Deployment Guide

## Prerequisites

- Node.js 18+
- npm 9+

## Local Development

```bash
git clone <repo-url> && cd system-design-builder
npm install
npm run dev
```

Opens at http://localhost:5173

## Production Build

```bash
npm run build
```

Output: `dist/` directory (static files). No server required.

### Build Steps
1. `tsc -b` — TypeScript type-check
2. `vite build` — Bundle with Rollup, Tailwind CSS, manual chunk splitting

### Bundle Chunks
| Chunk | Contents |
|-------|----------|
| `react-vendor` | react, react-dom |
| `flow-vendor` | @xyflow/react |
| `ui-vendor` | lucide-react, framer-motion |
| Main | Application code |

## Preview Production Build

```bash
npm run preview
```

Serves `dist/` via Vite preview server.

## Static Hosting

Deploy `dist/` to any static host:

- **Vercel**: Zero-config, auto-detects Vite
- **Netlify**: Set build command to `npm run build`, publish directory to `dist`
- **GitHub Pages**: Build and push `dist/` to `gh-pages` branch
- **Cloudflare Pages**: Connect repo, build command `npm run build`, output `dist`
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket with static website hosting

### SPA Routing

Single-page app with no client-side routing (no react-router). No redirect rules needed. `index.html` serves the entire app.

## Pre-deployment Checklist

```bash
npm run typecheck  # TypeScript errors
npm run lint       # ESLint issues
npm run test       # Vitest tests
npm run build      # Verify clean build
```

## Environment

No environment variables required. The app is fully client-side with no API calls. All data is stored in the browser's IndexedDB.
