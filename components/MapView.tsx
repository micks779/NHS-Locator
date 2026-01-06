
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Site } from '../types';

interface MapViewProps {
  sites: Site[];
  selectedSiteId?: string | null;
  onSiteClick: (site: Site) => void;
}

const MapView: React.FC<MapViewProps> = ({ sites, selectedSiteId, onSiteClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map centering on East London by default
    const map = L.map(containerRef.current).setView([51.52, 0.03], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds([]);

    sites.forEach(site => {
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-125" style="background-color: #005eb8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      // Escape HTML to prevent XSS (defense-in-depth)
      const escapeHtml = (text: string) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      const marker = L.marker([site.latitude, site.longitude], { icon: customIcon })
        .addTo(mapRef.current!)
        .on('click', () => onSiteClick(site))
        .bindTooltip(
          `<div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px 12px; font-weight: 700; font-size: 13px; color: #005eb8; text-align: center; white-space: nowrap;">
            ${escapeHtml(site.name)}
            <div style="font-size: 10px; color: #6b7280; font-weight: 600; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em;">
              ${escapeHtml(site.borough)}
            </div>
          </div>`,
          {
            permanent: false,
            direction: 'top',
            offset: [0, -10],
            className: 'custom-marker-tooltip',
            interactive: false
          }
        );
      
      markersRef.current[site.id] = marker;
      bounds.extend([site.latitude, site.longitude]);
    });

    // Always fit bounds to show ALL visible markers
    if (sites.length > 0) {
      mapRef.current.fitBounds(bounds, { 
        padding: [60, 60],
        maxZoom: 14 // Prevent zooming in too far if only one marker
      });
    }
  }, [sites, onSiteClick]);

  useEffect(() => {
    if (!mapRef.current || !selectedSiteId) return;

    const marker = markersRef.current[selectedSiteId];
    if (marker) {
      mapRef.current.setView(marker.getLatLng(), 15);
    }
  }, [selectedSiteId]);

  return <div ref={containerRef} className="w-full h-full rounded-b-xl md:rounded-xl shadow-inner border border-gray-200" />;
};

export default MapView;
