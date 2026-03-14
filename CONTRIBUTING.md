# Contributing

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone <repo-url> && cd system-design-builder
npm install
npm run dev
```

## Workflow

1. Fork the repo and create a branch from `main` (`git checkout -b feat/my-feature`)
2. Make your changes
3. Run checks before pushing:
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   ```
4. Push your branch and open a Pull Request

## Code Style

- **TypeScript** — strict mode enabled, no `any` unless absolutely necessary
- **ESLint** — all code must pass `npm run lint`
- **Components** — functional components with hooks
- **State** — Zustand stores; keep component-local state minimal
- **Styling** — Tailwind CSS utility classes

## Pull Requests

- Keep PRs focused on a single change
- Write a clear description of what and why
- Add or update tests when applicable
- Make sure CI is green before requesting review

## Reporting Issues

Open an issue with a clear title, steps to reproduce, and expected vs. actual behavior.
