# Credit Readiness Self-Assessment (standalone)

Minimal Next.js app containing only the **Credit Readiness** landing page and interactive assessment wizard (extracted from the AgDIL `web` project).

## Routes

- `/` → redirects to `/credit-worthiness-assessment-form`
- `/credit-worthiness-assessment-form` — landing / hero
- `/credit-worthiness-assessment-form/form` — assessment + results

## Setup

```bash
cd credit-readiness-standalone
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4
- Fonts: DM Serif Display, Plus Jakarta Sans (Google)

## Own repo

Copy or move this folder, then `git init` and push to a new remote if you want it as a separate repository.
