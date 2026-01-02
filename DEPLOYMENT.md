# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub/GitLab/Bitbucket account (for connecting your repository)

## Deployment Steps

### 1. Push to Git Repository
```bash
git init
git add .
git commit -m "Initial commit - ELFT Locator"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect Vite framework
4. Configure environment variables (see below)
5. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### 3. Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```
VITE_SUPABASE_URL=https://hqvfjrlmxjoiohrjtbzf.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**Important:** 
- Replace `your_actual_anon_key_here` with your actual Supabase anon key
- These variables are automatically available at build time
- After adding variables, redeploy for changes to take effect

### 4. Build Configuration

The project is already configured with:
- ✅ `vercel.json` - Routing and headers configuration
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ SPA routing support (all routes serve index.html)

### 5. Post-Deployment

1. **Verify Service Worker**: Check that `/sw.js` is accessible
2. **Test PWA**: Try installing the app on mobile devices
3. **Check Environment Variables**: Ensure Supabase connection works
4. **Test Map Tiles**: Verify Leaflet map loads correctly

### 6. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Service Worker Not Working
- Verify `/sw.js` is accessible (should return 200)
- Check browser console for service worker errors
- Ensure HTTPS is enabled (Vercel provides this automatically)

### Map Not Loading
- Check CORS settings in Supabase
- Verify Leaflet CSS is loading
- Check browser console for errors

### Environment Variables Not Working
- Redeploy after adding variables
- Check variable names start with `VITE_`
- Verify no typos in variable names

## Project Structure

```
├── dist/              # Build output (auto-generated)
├── components/        # React components
├── index.html         # Main HTML file
├── App.tsx            # Main app component
├── sw.js              # Service worker
├── manifest.json      # PWA manifest
├── vercel.json        # Vercel configuration
└── package.json       # Dependencies
```

## Support

For issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify Supabase connection
4. Review environment variables

