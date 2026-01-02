# Vercel Deployment Checklist

## Pre-Deployment

- [x] ✅ `vercel.json` configured
- [x] ✅ Build command set (`npm run build`)
- [x] ✅ Output directory set (`dist`)
- [x] ✅ SPA routing configured
- [x] ✅ Service worker headers configured
- [x] ✅ Environment variables documented

## Before Deploying

1. **Test Build Locally:**
   ```bash
   npm run build
   npm run preview
   ```
   Verify:
   - [ ] Build completes without errors
   - [ ] App loads correctly
   - [ ] Map displays
   - [ ] Service worker registers
   - [ ] Search works
   - [ ] Borough filters work

2. **Environment Variables:**
   - [ ] `VITE_SUPABASE_URL` is set
   - [ ] `VITE_SUPABASE_ANON_KEY` is set (NOT the placeholder)
   - [ ] Supabase connection works

3. **Git Repository:**
   - [ ] Code is committed
   - [ ] `.env` is in `.gitignore` (should not be committed)
   - [ ] Repository is pushed to GitHub/GitLab/Bitbucket

## Deployment Steps

1. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Vercel will auto-detect Vite

2. **Configure Environment Variables:**
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = `https://hqvfjrlmxjoiohrjtbzf.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `your_actual_key_here`

3. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

4. **Verify Deployment:**
   - [ ] App loads at Vercel URL
   - [ ] No console errors
   - [ ] Map displays correctly
   - [ ] Service worker registers (`/sw.js` accessible)
   - [ ] PWA manifest works (`/manifest.json` accessible)
   - [ ] Search functionality works
   - [ ] Borough filters work
   - [ ] Supabase data loads

## Post-Deployment

- [ ] Test on mobile device
- [ ] Test PWA installation
- [ ] Test offline functionality
- [ ] Verify all features work
- [ ] Check analytics (if configured)
- [ ] Set up custom domain (optional)

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all dependencies in `package.json`
- Check environment variables are set

### App Doesn't Load
- Check browser console for errors
- Verify environment variables
- Check Supabase connection

### Service Worker Issues
- Verify `/sw.js` returns 200 status
- Check HTTPS is enabled (Vercel provides this)
- Clear browser cache and retry

### Map Not Loading
- Check Leaflet CSS is loading
- Verify CORS settings in Supabase
- Check browser console for errors

## Quick Deploy Command

If using Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel --prod
```

