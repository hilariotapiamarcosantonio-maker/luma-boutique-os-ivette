# GitHub and Vercel Deployment

## GitHub remote

Use this repository as the deployment source:

```bash
git remote add origin https://github.com/hilariotapiamarcosantonio-maker/Luma-Estate-OS.git
git branch -M main
git push -u origin main
```

For future updates after the first push:

```bash
git add .
git commit -m "Describe the update"
git push
```

## Vercel settings

- Framework preset: Next.js
- Root directory: repository root
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: leave empty/default

## Required environment variables

Create these in Vercel Project Settings > Environment Variables:

```bash
SPREADSHEET_ID=your-google-sheet-id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=paste-private-key-from-service-account-json
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

Do not commit `.env.local`, service account JSON files, private keys, or `.vercel`.
