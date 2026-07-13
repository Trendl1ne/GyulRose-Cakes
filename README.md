# GyulRose Cakes

Local-first rebuild of the GyulRose Cakes website. The live `main` branch remains unchanged until the redesign and client facts are approved.

## Local review

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Quality checks

```bash
npm run check
npm run build
npm audit
```

The build optimizes every cake photograph to a web-friendly WebP while preserving the owner's original upload.

## Owner uploads

Cake entries live in `src/content/cakes`. `.pages.yml` exposes them through Pages CMS so the owner can add one photo, cake name, category, description, ingredients and starting price without editing code. See `OWNER-CAKE-UPLOAD-GUIDE.md`.

## Before production

Confirm all text marked as requiring client approval, connect the order webhook if wanted, authorize Pages CMS, test one owner upload, and only then merge into `main`.
