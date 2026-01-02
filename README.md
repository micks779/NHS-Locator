# ELFT Sites & Teams Locator

A Progressive Web App (PWA) for locating East London NHS Foundation Trust sites and teams, with interactive maps, search functionality, and offline support.

## Features

- 🗺️ Interactive map with Leaflet
- 🔍 Search sites and teams
- 📍 Borough filtering
- 📱 PWA support (installable, offline-capable)
- 🌐 Multi-language support (English, Bengali, Urdu)
- 🎨 Modern, responsive UI
- ⚡ Fast, optimized performance

## Run Locally

**Prerequisites:** Node.js 18+ and npm

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://hqvfjrlmxjoiohrjtbzf.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Project Structure

```
├── components/        # React components
│   ├── MapView.tsx   # Leaflet map component
│   ├── SearchBar.tsx # Search input component
│   └── SiteCard.tsx  # Site card component
├── dist/             # Build output (generated)
├── App.tsx           # Main application component
├── index.html        # HTML entry point
├── sw.js             # Service worker for PWA
├── manifest.json     # PWA manifest
├── vercel.json       # Vercel deployment config
└── package.json      # Dependencies
```

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Leaflet** - Interactive maps
- **Tailwind CSS** - Styling
- **Supabase** - Backend database
- **PWA** - Progressive Web App features

## License

© Akinbola Digitals
