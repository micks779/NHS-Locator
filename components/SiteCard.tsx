
import React from 'react';
import { MapPin, Phone, Navigation, Building2, Accessibility, Car, ExternalLink } from 'lucide-react';
import { Site, Team, ServiceCategory } from '../types';

interface SiteCardProps {
  site: Site;
  onClick?: () => void;
  onTeamClick?: (team: Team, site: Site) => void;
  compact?: boolean;
  searchQuery?: string;
}

export const getCategoryColor = (category: ServiceCategory, isMatch: boolean) => {
  if (isMatch) return 'bg-[#005eb8] text-white border-[#005eb8]';
  
  switch (category) {
    case 'Mental Health': return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'Children': return 'bg-green-50 text-green-700 border-green-100';
    case 'Corporate': return 'bg-gray-50 text-gray-600 border-gray-100';
    case 'Forensic': return 'bg-red-50 text-red-700 border-red-100';
    case 'Community Health': return 'bg-teal-50 text-teal-700 border-teal-100';
    case 'Specialist': return 'bg-purple-50 text-purple-700 border-purple-100';
    case 'Primary Care': return 'bg-orange-50 text-orange-700 border-orange-100';
    default: return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

const SiteCard: React.FC<SiteCardProps> = ({ site, onClick, onTeamClick, compact = false, searchQuery = '' }) => {
  const getDirectionsUrl = () => {
    // Use full address string for better accuracy in Google Maps
    // The address field may already include postcode, so we construct it carefully
    let destination = '';
    if (site.address) {
      // Combine site name and address, postcode is optional
      const fullAddress = site.postcode 
        ? `${site.name}, ${site.address}, ${site.postcode}`
        : `${site.name}, ${site.address}`;
      destination = encodeURIComponent(fullAddress);
    } else {
      // Fallback to coordinates if address is missing
      destination = `${site.latitude},${site.longitude}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  };

  const displayTeams = React.useMemo(() => {
    if (!searchQuery) return site.teams.slice(0, 5);
    
    const query = searchQuery.toLowerCase();
    const matching = site.teams.filter(t => t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
    const nonMatching = site.teams.filter(t => !t.name.toLowerCase().includes(query) && !t.category.toLowerCase().includes(query));
    
    return [...matching, ...nonMatching].slice(0, 6);
  }, [site.teams, searchQuery]);

  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 active:scale-[0.99] ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start gap-4 mb-2">
          <div className="flex-1">
            <h3 className="text-xl font-black text-[#005eb8] leading-tight group-hover:underline">{site.name}</h3>
            {site.distance !== undefined ? (
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mt-1">
                {site.distance.toFixed(1)} MILES AWAY
              </span>
            ) : null}
          </div>
          <span className="bg-blue-50 text-[#005eb8] text-[10px] font-black px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-widest whitespace-nowrap">
            {site.borough}
          </span>
        </div>
        
        <div className="space-y-3 mb-5 mt-4 text-[14px] text-gray-600">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 mt-0.5 text-blue-400" />
            <span className="font-semibold leading-snug">{site.address}, {site.postcode}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-blue-400" />
            <a 
              href={`tel:${site.receptionPhone.replace(/\s+/g, '')}`} 
              className="font-black text-[#005eb8] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {site.receptionPhone}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {site.hasStepFreeAccess && (
            <div className="flex items-center gap-2 text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 font-black uppercase tracking-widest">
              <Accessibility className="h-3.5 w-3.5" /> STEP-FREE
            </div>
          )}
          {site.hasParking && (
            <div className="flex items-center gap-2 text-[10px] bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-100 font-black uppercase tracking-widest">
              <Car className="h-3.5 w-3.5" /> PARKING
            </div>
          )}
        </div>

        {!compact && (
          <div className="border-t border-gray-50 pt-5 mt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <Building2 className="h-4 w-4" />
                TEAMS BASED HERE
              </div>
              <span className="text-[10px] font-black text-[#005eb8] bg-blue-50 px-3 py-1 rounded-full uppercase">
                {site.teams.length} TOTAL
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {displayTeams.map((team) => {
                const isMatch = searchQuery && (team.name.toLowerCase().includes(searchQuery.toLowerCase()) || team.category.toLowerCase().includes(searchQuery.toLowerCase()));
                return (
                  <button 
                    key={team.id} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTeamClick) onTeamClick(team, site);
                    }}
                    className={`inline-block px-3 py-2 rounded-xl text-[12px] font-bold border transition-all hover:scale-105 ${getCategoryColor(team.category, !!isMatch)}`}
                  >
                    {team.name}
                  </button>
                );
              })}
              {site.teams.length > displayTeams.length && (
                <span className="text-[11px] font-black text-gray-400 px-3 py-2">
                  + {site.teams.length - displayTeams.length} MORE
                </span>
              )}
            </div>
          </div>
        )}

        {!compact && (
          <div className="mt-6 grid grid-cols-2 gap-4">
             <button
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
              }}
              className="flex items-center justify-center gap-2 bg-white text-[#005eb8] border-2 border-blue-50 hover:bg-blue-50 hover:border-blue-100 py-4 rounded-2xl font-black text-xs transition-all shadow-sm"
            >
              <ExternalLink className="h-4 w-4" />
              SITE PROFILE
            </button>
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 bg-[#005eb8] hover:bg-[#004a91] text-white py-4 rounded-2xl font-black text-xs transition-all shadow-xl hover:shadow-[#005eb8]/20"
            >
              <Navigation className="h-4 w-4" />
              DIRECTIONS
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteCard;
