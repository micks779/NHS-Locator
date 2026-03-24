
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Map as MapIcon, 
  List as ListIcon, 
  Building2, 
  Users, 
  ArrowLeft,
  ChevronRight,
  Search,
  Phone,
  MapPin,
  ExternalLink,
  Navigation,
  ChevronLeft,
  Loader2,
  ArrowRight,
  Globe,
  Accessibility,
  Car,
  Share2,
  LocateFixed,
  Filter
} from 'lucide-react';
import { TRANSLATIONS } from './mockData';
import { Site, Team, ViewMode, Language, ServiceCategory } from './types';
import SearchBar from './components/SearchBar';
import SiteCard, { getCategoryColor } from './components/SiteCard';
import MapView from './components/MapView';

// Supabase configuration from environment variables
// Set these in your .env file (see .env.example)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hqvfjrlmxjoiohrjtbzf.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE'; 

const BOROUGH_ORDER = ['NEWHAM', 'TOWER HAMLETS', 'CITY & HACKNEY', 'BEDFORDSHIRE', 'LUTON', 'LONDON', 'OTHER'];
const BOROUGH_ALIAS_MAP: Record<string, string> = {
  'CH NEWHAM': 'NEWHAM',
  'NEW HAM': 'NEWHAM',
  HACKNEY: 'CITY & HACKNEY',
  'CITY AND HACKNEY': 'CITY & HACKNEY',
  'CENTRAL BEDFORDSHIRE': 'BEDFORDSHIRE',
  BEDFORD: 'BEDFORDSHIRE',
};
const normalizeBorough = (borough: string | null | undefined): Site['borough'] => {
  const raw = (borough || 'LONDON').toString().toUpperCase().trim();
  const normalized = BOROUGH_ALIAS_MAP[raw] || raw;
  const allowed: Site['borough'][] = ['TOWER HAMLETS', 'NEWHAM', 'CITY & HACKNEY', 'BEDFORDSHIRE', 'LUTON', 'LONDON', 'BEDFORD', 'OTHER'];
  return (allowed.includes(normalized as Site['borough']) ? normalized : 'OTHER') as Site['borough'];
};
type SiteProfileReturnView = 'map' | 'list' | 'team-profile';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<{team: Team, site: Site} | null>(null);
  const [viewingTeam, setViewingTeam] = useState<{name: string, category: ServiceCategory} | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [siteProfileReturnView, setSiteProfileReturnView] = useState<SiteProfileReturnView>('list');
  
  const t = TRANSLATIONS[language];

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.error('PWA SW Fail:', err));
    }
  }, []);

  // Track User Location for Proximity Sorting
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("Location permission denied"),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Fetch Live Production Data from Supabase
  useEffect(() => {
    const fetchLiveTrustData = async () => {
      // Fallback to local data if keys aren't set yet
      if (SUPABASE_ANON_KEY === 'YOUR_ANON_KEY_HERE' || !SUPABASE_ANON_KEY) {
        console.log('Using mock data: Supabase key not configured');
        const { ELFT_SITES } = await import('./mockData');
        setSites(ELFT_SITES);
        setIsLoading(false);
        return;
      }
      
      console.log('Attempting to fetch from Supabase...');

      try {
        setIsLoading(true);
        
        // Try multiple query patterns to handle different relationship names
        // Pattern 1: services:site_services(service:services(*))
        // Pattern 2: site_services(services(*))
        // Pattern 3: site_services(service(*))
        let response = await fetch(
          `${SUPABASE_URL}/rest/v1/sites?select=*,services:site_services(service:services(*))&order=name.asc`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          }
        );

        // If first query fails, try alternative relationship name
        if (!response.ok) {
          console.log('Trying alternative query pattern...');
          response = await fetch(
            `${SUPABASE_URL}/rest/v1/sites?select=*,site_services(services(*))&order=name.asc`,
            {
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
              }
            }
          );
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Supabase query failed:', response.status, errorText);
          throw new Error(`Trust Database Unavailable: ${response.status}`);
        }

        const rawData = await response.json();
        
        // Check if we got data
        if (!rawData || rawData.length === 0) {
          console.warn('Supabase returned empty data, falling back to mock data');
          throw new Error('No data returned from Supabase');
        }
        
        // Debug: Log first site to see structure
        if (rawData.length > 0) {
          console.log('Sample site data structure:', JSON.stringify(rawData[0], null, 2));
        }
        
        const transformed: Site[] = rawData.map((s: any) => {
          // Handle different possible data structures
          let teams: any[] = [];
          
          // Try different possible structures for the services relationship
          if (s.services && Array.isArray(s.services)) {
            // Structure: services: [{ service: {...} }]
            teams = s.services.map((link: any) => {
              const service = link.service || link; // Handle both nested and flat structures
              return {
                id: service.id,
                name: service.name,
                category: (service.category || 'Other') as ServiceCategory,
                directorate: service.directorate || 'Uncategorized',
                description: service.description,
                serviceLead: service.service_lead,
                seniorManager: service.senior_manager,
                url: service.url,
                phone: service.phone
              };
            });
          } else if (s.site_services && Array.isArray(s.site_services)) {
            // Alternative structure: site_services: [{ services: {...} }] or [{ service: {...} }]
            teams = s.site_services.map((link: any) => {
              const service = link.services || link.service || link;
              return {
                id: service.id,
                name: service.name,
                category: (service.category || 'Other') as ServiceCategory,
                directorate: service.directorate || 'Uncategorized',
                description: service.description,
                serviceLead: service.service_lead,
                seniorManager: service.senior_manager,
                url: service.url,
                phone: service.phone
              };
            });
          }
          
          // Normalize borough value (uppercase, trim)
          const normalizedBorough = normalizeBorough(s.borough);
          
          // Log if no teams found for debugging
          if (teams.length === 0 && rawData.length > 0) {
            console.warn(`No teams found for site: ${s.name}. Available keys:`, Object.keys(s));
          }
          
          return {
            id: s.id,
            name: s.name,
            address: s.address,
            latitude: s.latitude || 51.52,
            longitude: s.longitude || 0.03,
            receptionPhone: s.reception_phone || '020 7655 4000',
            borough: normalizedBorough,
            hasStepFreeAccess: s.has_step_free_access,
            hasParking: s.has_parking,
            teams: teams
          };
        });
        
        // Debug: Log borough distribution after transformation
        const boroughStats = new Map<string, number>();
        transformed.forEach(site => {
          const b = site.borough || 'UNKNOWN';
          boroughStats.set(b, (boroughStats.get(b) || 0) + 1);
        });
        console.log('Borough distribution:', Array.from(boroughStats.entries()).sort((a, b) => b[1] - a[1]));

        setSites(transformed);
        setError(null);
        
        // Detailed statistics
        const sitesWithTeams = transformed.filter(s => s.teams.length > 0);
        const sitesWithoutTeams = transformed.filter(s => s.teams.length === 0);
        const totalTeams = transformed.reduce((sum, s) => sum + s.teams.length, 0);
        
        console.log(`Successfully loaded ${transformed.length} sites from Supabase`);
        console.log(`  - Sites with teams: ${sitesWithTeams.length}`);
        console.log(`  - Sites without teams: ${sitesWithoutTeams.length}`);
        console.log(`  - Total teams/services: ${totalTeams}`);
        
        if (sitesWithoutTeams.length > 0) {
          console.warn(`⚠️ ${sitesWithoutTeams.length} sites have no teams linked. This might indicate missing site_services relationships.`);
        }
      } catch (err: any) {
        console.error('Supabase fetch failed:', err);
        setError("Working Offline: Showing local site data.");
        const { ELFT_SITES } = await import('./mockData');
        setSites(ELFT_SITES);
        console.log(`Fell back to mock data: ${ELFT_SITES.length} sites`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveTrustData();
  }, []);

  const processedSites = useMemo(() => {
    let result = sites.map(site => ({
      ...site,
      distance: userLocation ? (
        (() => {
          const R = 3958.8; // Miles
          const dLat = (site.latitude - userLocation.lat) * Math.PI / 180;
          const dLon = (site.longitude - userLocation.lng) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(site.latitude * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        })()
      ) : undefined
    }));

    if (userLocation) {
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    return result;
  }, [sites, userLocation]);

  const filteredSites = useMemo(() => {
    let result = processedSites;
    
    // Debug: Log initial state
    if (processedSites.length === 0) {
      console.warn('⚠️ No sites in processedSites. Check data loading.');
    } else {
      console.log(`📊 Filtering ${processedSites.length} sites. Active filters:`, {
        viewingTeam: viewingTeam?.name || null,
        selectedBorough,
        searchQuery: searchQuery || null
      });
    }
    
    // If viewing a specific team, filter to only show sites with that team
    if (viewingTeam) {
      // Normalize team name comparison (case-insensitive, trim whitespace)
      const normalizedTeamName = viewingTeam.name.trim().toLowerCase();
      result = result.filter(s => {
        const hasTeam = s.teams.some(t => t.name.trim().toLowerCase() === normalizedTeamName);
        return hasTeam;
      });
      
      // Debug: Log team filtering results
      if (result.length === 0) {
        console.warn(`Team filter "${viewingTeam.name}" found 0 sites. Checking team name variations...`);
        const allTeamNames = new Set<string>();
        processedSites.forEach(site => {
          site.teams.forEach(team => {
            allTeamNames.add(team.name);
          });
        });
        const similarNames = Array.from(allTeamNames).filter(name => 
          name.toLowerCase().includes(normalizedTeamName) || 
          normalizedTeamName.includes(name.toLowerCase())
        );
        if (similarNames.length > 0) {
          console.log('Similar team names found:', similarNames);
        }
      } else {
        console.log(`Team filter "${viewingTeam.name}" found ${result.length} site(s):`, result.map(s => s.name));
      }
    }
    
    if (selectedBorough) {
      // Normalize borough comparison (case-insensitive, trim whitespace)
      const normalizedSelected = normalizeBorough(selectedBorough);
      result = result.filter(s => {
        const normalizedSiteBorough = normalizeBorough(s.borough);
        return normalizedSiteBorough === normalizedSelected;
      });
      
      // Debug: Log borough distribution when filtering
      if (result.length === 0 && processedSites.length > 0) {
        const boroughCounts = new Map<string, number>();
        processedSites.forEach(s => {
          const b = (s.borough || 'UNKNOWN').toUpperCase().trim();
          boroughCounts.set(b, (boroughCounts.get(b) || 0) + 1);
        });
        console.log(`Filter: "${selectedBorough}" found 0 sites. Available boroughs:`, Array.from(boroughCounts.entries()));
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.borough.toLowerCase().includes(q) ||
        s.teams.some(t => t.name.toLowerCase().includes(q))
      );
    }
    
    // Debug: Log final result
    console.log(`✅ Filtered to ${result.length} site(s)`);
    
    return result;
  }, [searchQuery, processedSites, selectedBorough, viewingTeam]);

  const allUniqueTeams = useMemo(() => {
    const teamsMap = new Map<string, { name: string, category: ServiceCategory, count: number }>();
    sites.forEach(site => {
      site.teams.forEach(team => {
        const existing = teamsMap.get(team.name);
        if (existing) existing.count++;
        else teamsMap.set(team.name, { name: team.name, category: team.category, count: 1 });
      });
    });
    return Array.from(teamsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [sites]);

  const availableBoroughs = useMemo(() => {
    const counts = new Map<string, number>();
    sites.forEach((site) => {
      const b = normalizeBorough(site.borough);
      counts.set(b, (counts.get(b) || 0) + 1);
    });

    const ordered = BOROUGH_ORDER.filter((b) => counts.has(b)).map((b) => ({
      borough: b,
      count: counts.get(b) || 0,
    }));
    const extras = Array.from(counts.entries())
      .filter(([b]) => !BOROUGH_ORDER.includes(b))
      .map(([borough, count]) => ({ borough, count }))
      .sort((a, b) => a.borough.localeCompare(b.borough));

    return [...ordered, ...extras];
  }, [sites]);

  const handleShare = (title: string, text: string) => {
    if (navigator.share) {
      navigator.share({ title, text, url: window.location.origin }).catch(console.warn);
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied to clipboard!');
    }
  };

  const navigateToView = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedSite(null);
    setSelectedTeam(null);
    setViewingTeam(null);
    setSelectedBorough(null);
    if (mode === 'home') setSearchQuery('');
    window.scrollTo(0, 0);
  };

  const openSiteProfile = (site: Site, returnView: SiteProfileReturnView) => {
    setSelectedSite(site);
    setSiteProfileReturnView(returnView);
    setViewMode('site-profile');
    window.scrollTo(0, 0);
  };

  const returnFromSiteProfile = () => {
    setSelectedSite(null);
    if (siteProfileReturnView === 'map') {
      setViewMode('map');
    } else if (siteProfileReturnView === 'team-profile' && viewingTeam) {
      setViewMode('team-profile');
    } else {
      setViewMode('list');
      setViewingTeam(null);
      setSelectedBorough(null);
    }
    window.scrollTo(0, 0);
  };

  const handleContextHome = () => {
    if (viewMode === 'site-profile' && siteProfileReturnView === 'map') {
      setSelectedSite(null);
      setViewMode('map');
      window.scrollTo(0, 0);
      return;
    }
    navigateToView('home');
  };

  const Breadcrumbs = ({ items }: { items: { label: string; onClick?: () => void }[] }) => (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 px-6 bg-white border-b safe-area-top sticky top-0 z-[60] shadow-sm">
      <button onClick={handleContextHome} className="text-[#005eb8] hover:underline font-black text-[10px] uppercase tracking-widest flex items-center gap-1 shrink-0">
        <ArrowLeft className="h-3 w-3" /> {t.backHome}
      </button>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="h-3 w-3 text-gray-300 shrink-0" />
          <button 
            onClick={item.onClick} 
            disabled={!item.onClick}
            className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${item.onClick ? 'text-[#005eb8] hover:underline' : 'text-gray-400'}`}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="h-12 w-12 text-[#005eb8] animate-spin" />
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden" style={{ height: 'var(--app-height)' }}>
      {viewMode !== 'home' && (
        <header className="bg-[#005eb8] text-white p-4 shadow-xl z-50 safe-area-top">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateToView('home')}>
              <Building2 className="text-white h-5 w-5" />
              <h1 className="text-sm font-black tracking-tight uppercase">ELFT Locator</h1>
            </div>
            <div className="bg-[#004a91] p-1 rounded-xl flex shadow-inner">
              <button 
                onClick={() => {
                  // If viewing a team profile, switch to map but keep team context
                  if (viewMode === 'team-profile' && viewingTeam) {
                    setViewMode('map');
                    // Keep viewingTeam state so filteredSites filters correctly
                  } else {
                    setViewMode('map');
                  }
                }} 
                className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'map' ? 'bg-[#005eb8] shadow-lg' : 'opacity-60'}`}
              >
                MAP
              </button>
              <button 
                onClick={() => {
                  // If viewing a team profile, switch to list but keep team context
                  if (viewMode === 'team-profile' && viewingTeam) {
                    setViewMode('team-profile');
                    // Already on team-profile which shows list view
                  } else if (viewMode === 'map' && viewingTeam) {
                    setViewMode('team-profile');
                  } else {
                    setViewMode('list');
                  }
                }} 
                className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'list' || viewMode === 'team-profile' ? 'bg-[#005eb8] shadow-lg' : 'opacity-60'}`}
              >
                LIST
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-hidden relative max-w-6xl mx-auto w-full flex flex-col">
        {viewMode === 'home' ? (
          <div className="flex-1 flex flex-col items-center justify-start pt-12 p-6 text-center overflow-y-auto pb-24 scroll-smooth no-scrollbar">
            <div className="mb-10 flex gap-2">
               {(['en', 'bn', 'ur'] as Language[]).map(l => (
                 <button key={l} onClick={() => setLanguage(l)} className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${language === l ? 'bg-[#005eb8] text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>
                   {l.toUpperCase()}
                 </button>
               ))}
            </div>
            <div className="max-w-xl w-full space-y-12">
              <div className="space-y-6">
                <div className="bg-[#005eb8] w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                  <Building2 className="text-white h-10 w-10" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-[#005eb8] tracking-tight leading-none">{t.title}</h1>
                <p className="text-lg text-gray-400 font-bold">{t.strapline}</p>
              </div>
              <SearchBar value={searchQuery} onChange={(v) => { setSearchQuery(v); if (v) { setViewMode('list'); setViewingTeam(null); setSelectedBorough(null); } }} placeholder={t.searchPlaceholder} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => { setViewMode('map'); setViewingTeam(null); setSelectedBorough(null); }} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 text-left hover:shadow-lg transition-all active:scale-95 group">
                  <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-[#005eb8] transition-colors"><MapIcon className="h-6 w-6 text-[#005eb8] group-hover:text-white" /></div>
                  <div><span className="font-black text-xl block leading-none mb-1">{t.mapView}</span><span className="text-[10px] text-gray-400 uppercase tracking-widest">Interactive Pins</span></div>
                </button>
                <button onClick={() => { setViewMode('list'); setViewingTeam(null); setSelectedBorough(null); }} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 text-left hover:shadow-lg transition-all active:scale-95 group">
                  <div className="bg-blue-50 p-3 rounded-2xl group-hover:bg-[#005eb8] transition-colors"><ListIcon className="h-6 w-6 text-[#005eb8] group-hover:text-white" /></div>
                  <div><span className="font-black text-xl block leading-none mb-1">{t.allSites}</span><span className="text-[10px] text-gray-400 uppercase tracking-widest">Site Directory</span></div>
                </button>
              </div>
              <button onClick={() => setViewMode('teams-list')} className="w-full p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 p-3 rounded-2xl group-hover:bg-emerald-600 transition-colors"><Users className="h-6 w-6 text-emerald-600 group-hover:text-white" /></div>
                  <span className="font-black text-xl">{t.findTeam}</span>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-200 group-hover:text-emerald-600 transition-all" />
              </button>
            </div>
            {error && <div className="mt-8 bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100 text-[10px] font-bold uppercase">{error}</div>}
            <footer className="mt-20 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{t.footer}</footer>
          </div>
        ) : viewMode === 'service-detail' && selectedTeam ? (
          <div className="flex-1 overflow-y-auto bg-white pb-24 scroll-smooth">
            <Breadcrumbs items={[
              { label: 'Sites', onClick: () => { setViewMode('list'); setViewingTeam(null); setSelectedBorough(null); } },
              { label: selectedTeam.site.name, onClick: () => { setSelectedSite(selectedTeam.site); setViewMode('site-profile'); } },
              { label: selectedTeam.team.name }
            ]} />
            <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-10">
              <div className="flex justify-between items-start">
                <span className={`inline-block px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${getCategoryColor(selectedTeam.team.category, false)}`}>
                  {selectedTeam.team.category}
                </span>
                <button onClick={() => handleShare(selectedTeam.team.name, `Find ${selectedTeam.team.name} at ${selectedTeam.site.name}`)} className="bg-gray-50 p-4 rounded-2xl hover:bg-gray-100 transition-colors">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1]">{selectedTeam.team.name}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-gray-100">
                {selectedTeam.team.serviceLead && (
                  <div>
                    <h4 className="text-[10px] font-black text-[#005eb8] uppercase tracking-widest mb-2">{t.serviceLead}</h4>
                    <p className="text-lg font-bold text-gray-800">{selectedTeam.team.serviceLead}</p>
                  </div>
                )}
                {selectedTeam.team.seniorManager && (
                  <div>
                    <h4 className="text-[10px] font-black text-[#005eb8] uppercase tracking-widest mb-2">{t.seniorManager}</h4>
                    <p className="text-lg font-bold text-gray-800">{selectedTeam.team.seniorManager}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-12 space-y-10 shadow-inner border border-gray-100">
                <div className="space-y-4">
                  <h2 className="text-[10px] font-black text-[#005eb8] uppercase tracking-[0.3em]">{t.address}</h2>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-blue-300 shrink-0" />
                    <div className="text-xl font-bold text-gray-900 leading-snug">
                      {selectedTeam.site.name}<br/>
                      <span className="text-gray-500 font-medium">{selectedTeam.site.address}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-[10px] font-black text-[#005eb8] uppercase tracking-[0.3em]">{t.telephone}</h2>
                  <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-blue-300 shrink-0" />
                    <a href={`tel:${selectedTeam.site.receptionPhone.replace(/\s+/g, '')}`} className="text-3xl font-black text-[#005eb8] hover:underline decoration-4">
                      {selectedTeam.site.receptionPhone}
                    </a>
                  </div>
                </div>

                <div className="pt-8 flex flex-col gap-4">
                  {selectedTeam.team.url && (
                    <a href={selectedTeam.team.url} target="_blank" rel="noopener noreferrer" className="bg-white border-2 border-blue-50 text-[#005eb8] py-5 rounded-2xl font-black text-center flex items-center justify-center gap-3 hover:bg-blue-50 transition-all">
                      <Globe className="h-5 w-5" /> {t.viewOfficialPage}
                    </a>
                  )}
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedTeam.site.postcode ? `${selectedTeam.site.name}, ${selectedTeam.site.address}, ${selectedTeam.site.postcode}` : `${selectedTeam.site.name}, ${selectedTeam.site.address}`)}`} target="_blank" className="bg-[#005eb8] text-white py-5 rounded-2xl font-black text-center flex items-center justify-center gap-3 shadow-xl hover:shadow-[#005eb8]/30 transition-all">
                    <Navigation className="h-5 w-5" /> {t.getDirections}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'teams-list' ? (
          <div className="flex-1 overflow-y-auto bg-gray-50 pb-24 scroll-smooth">
            <Breadcrumbs items={[{ label: 'Teams Directory' }]} />
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search all trust teams..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allUniqueTeams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(team => (
                  <button key={team.name} onClick={() => { setViewingTeam(team); setViewMode('team-profile'); }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group active:scale-95 hover:border-blue-200 transition-all">
                    <div className="text-left">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getCategoryColor(team.category, false)}`}>{team.category}</span>
                      <h4 className="font-black text-lg mt-2 group-hover:text-[#005eb8]">{team.name}</h4>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-200 group-hover:text-[#005eb8] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === 'team-profile' && viewingTeam ? (
          <div className="flex-1 overflow-y-auto bg-white pb-24 scroll-smooth">
            <Breadcrumbs items={[{ label: 'Teams', onClick: () => setViewMode('teams-list') }, { label: viewingTeam.name }]} />
            <div className="p-6 max-w-6xl mx-auto space-y-8">
              <div className="border-b pb-8">
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border mb-4 inline-block ${getCategoryColor(viewingTeam.category, false)}`}>{viewingTeam.category}</span>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">{viewingTeam.name}</h1>
                <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">{t.locationsProvidingThis}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSites.map(site => (
                  <SiteCard key={site.id} site={site} onClick={() => openSiteProfile(site, 'team-profile')} onTeamClick={(team) => { setSelectedTeam({team, site}); setViewMode('service-detail'); }} />
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === 'site-profile' && selectedSite ? (
           <div className="flex-1 overflow-y-auto bg-white pb-24 scroll-smooth">
            <Breadcrumbs items={[{ label: 'Sites', onClick: returnFromSiteProfile }, { label: selectedSite.name }]} />
            <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
              <div className="border-b border-gray-50 pb-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-blue-50 text-[#005eb8] text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest inline-block">
                    {selectedSite.borough}
                  </span>
                  <button onClick={() => handleShare(selectedSite.name, `Site Information: ${selectedSite.name}`)} className="bg-gray-50 p-4 rounded-2xl hover:bg-gray-100 transition-colors">
                    <Share2 className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-[#005eb8] leading-tight mb-8">{selectedSite.name}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-blue-300 shrink-0" />
                      <p className="text-xl text-gray-600 font-bold leading-snug">{selectedSite.address}</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-blue-300 shrink-0" />
                      <a href={`tel:${selectedSite.receptionPhone}`} className="text-2xl font-black text-[#005eb8] hover:underline">{selectedSite.receptionPhone}</a>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4 justify-end">
                    <div className="flex flex-wrap gap-2">
                      {selectedSite.hasStepFreeAccess && (
                        <div className="flex items-center gap-2 text-[10px] bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl border border-emerald-100 font-black uppercase tracking-widest">
                          <Accessibility className="h-4 w-4" /> STEP-FREE
                        </div>
                      )}
                      {selectedSite.hasParking && (
                        <div className="flex items-center gap-2 text-[10px] bg-amber-50 text-amber-700 px-3 py-2 rounded-xl border border-amber-100 font-black uppercase tracking-widest">
                          <Car className="h-4 w-4" /> PARKING
                        </div>
                      )}
                    </div>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedSite.postcode ? `${selectedSite.name}, ${selectedSite.address}, ${selectedSite.postcode}` : `${selectedSite.name}, ${selectedSite.address}`)}`} target="_blank" className="bg-[#005eb8] text-white py-5 rounded-2xl font-black text-center flex items-center justify-center gap-3 shadow-xl hover:shadow-[#005eb8]/30 transition-all text-sm tracking-widest">
                      <Navigation className="h-5 w-5"/> {t.getDirections}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">{t.teamsBasedHere} ({selectedSite.teams.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedSite.teams.map(team => (
                    <button key={team.id} onClick={() => { setSelectedTeam({team, site: selectedSite}); setViewMode('service-detail'); }} className="p-8 bg-white border border-gray-100 rounded-[2rem] text-left hover:border-[#005eb8] hover:shadow-xl transition-all group shadow-sm flex flex-col justify-between min-h-[160px]">
                      <div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border mb-4 inline-block ${getCategoryColor(team.category, false)}`}>{team.category}</span>
                        <h4 className="font-black text-xl leading-tight group-hover:text-[#005eb8] mb-4">{team.name}</h4>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-200 group-hover:text-[#005eb8] self-end transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white border-b sticky top-0 z-40 shadow-sm overflow-hidden">
              <div className="p-4">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-4">
                <button 
                  onClick={() => { setSelectedBorough(null); setViewingTeam(null); }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border flex items-center gap-2 ${!selectedBorough ? 'bg-[#005eb8] text-white border-[#005eb8]' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                >
                  <Filter className="h-3 w-3" /> ALL SITES
                </button>
                {availableBoroughs.map(({ borough, count }) => (
                  <button key={borough} onClick={() => setSelectedBorough(borough === selectedBorough ? null : borough)} className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border ${selectedBorough === borough ? 'bg-[#005eb8] text-white border-[#005eb8]' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {borough} <span className={`${selectedBorough === borough ? 'text-white/90' : 'text-gray-400'}`}>({count})</span>
                  </button>
                ))}
              </div>
            </div>
            {viewMode === 'map' ? (
              <div className="flex-1 relative">
                {viewingTeam && (
                  <div className="absolute top-4 left-4 z-[100] bg-white rounded-2xl shadow-xl border-2 border-[#005eb8] px-4 py-3 max-w-md">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border shrink-0 ${getCategoryColor(viewingTeam.category, false)}`}>
                        {viewingTeam.category}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">VIEWING TEAM</p>
                        <p className="text-sm font-black text-[#005eb8] leading-tight truncate">{viewingTeam.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{filteredSites.length} location{filteredSites.length !== 1 ? 's' : ''}</p>
                      </div>
                      <button 
                        onClick={() => { setViewingTeam(null); }}
                        className="text-gray-400 hover:text-[#005eb8] transition-colors shrink-0"
                        aria-label="Clear team filter"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                <MapView sites={filteredSites} onSiteClick={(s) => openSiteProfile(s, 'map')} />
                <button 
                  onClick={() => { if(userLocation) setViewMode('map'); }}
                  className="absolute bottom-24 right-4 bg-white p-5 rounded-3xl shadow-2xl border-4 border-blue-50 active:scale-90 transition-all z-[100] group"
                  aria-label="Find my location"
                >
                  <LocateFixed className="h-6 w-6 text-[#005eb8] group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
                {filteredSites.length > 0 ? (
                  <div className="max-w-4xl mx-auto w-full space-y-4">
                    {filteredSites.map(site => (
                      <SiteCard key={site.id} site={site} onClick={() => openSiteProfile(site, 'list')} onTeamClick={(team, s) => { setSelectedTeam({team, site: s}); setViewMode('service-detail'); }} searchQuery={searchQuery} />
                    ))}
                  </div>
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="text-gray-300 h-8 w-8" /></div>
                    <p className="font-black text-gray-400 uppercase tracking-widest text-xs">No matching results in {selectedBorough || 'All Sites'}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {viewMode !== 'home' && (
        <button onClick={handleContextHome} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#005eb8] text-white px-8 py-5 rounded-full shadow-2xl active:scale-90 transition-all z-[100] flex items-center gap-3 border-4 border-white font-black text-xs tracking-[0.2em] shadow-[#005eb8]/40">
          <ChevronLeft className="h-5 w-5"/> HOME
        </button>
      )}
    </div>
  );
};

export default App;
