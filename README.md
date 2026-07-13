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

Cake entries live in `src/content/cakes`. The unlisted `/owner-upload/` page sends one photo and the cake details to a private n8n workflow. n8n owns the restricted GitHub credential, so the client never needs repository access. See `OWNER-CAKE-UPLOAD-GUIDE.md`.

## Before production

Confirm all text marked as requiring client approval, connect both n8n webhooks, test one owner upload and rollback, and only then merge into `main`.
