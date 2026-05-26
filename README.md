# FHP Platform

Foundation High Performance — Athlete Platform MVP

## Setup

1. Install dependencies:
```
npm install
```

2. Add your logo:
Place `logo.png` (the transparent FHP badge) into the `/public` folder.

3. Run locally:
```
npm run dev 
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to vercel.com → New Project → Import your GitHub repo
3. Click Deploy — Vercel auto-detects Next.js, no config needed

## Project Structure

```
src/
  app/
    page.tsx        — Main platform (athlete + admin views)
    layout.tsx      — Root layout
    globals.css     — FHP design tokens + global styles
  lib/
    lessons.ts      — All 4 week lesson content
public/
    logo.png        — FHP badge logo (add this manually)
```

## Content

All lesson content lives in `src/lib/lessons.ts`. 
Edit the `lessons` array to update titles, focus text, video URLs, prompts, PDF links.

## Next steps

- Connect Supabase for persistent data storage
- Add authentication (Supabase Auth)
- Wire Claude API for real AI mirror analysis
- Build full admin CMS
