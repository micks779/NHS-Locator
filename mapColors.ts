import { Site, Team } from './types';

/** Visual group for map pins — aligned with ELFT My Maps style (borough + key overrides). */
export type MapLegendKey =
  | 'tower-hamlets'
  | 'newham'
  | 'city-hackney'
  | 'bedford-chs'
  | 'bedford-mh'
  | 'bedfordshire'
  | 'luton'
  | 'children-specialist'
  | 'forensic'
  | 'london'
  | 'other';

export interface SiteMapStyle {
  color: string;
  label: string;
  legendKey: MapLegendKey;
}

const norm = (s: string) => s.toUpperCase().trim();

function teamText(t: Team): string {
  return `${t.name} ${t.directorate || ''} ${t.category || ''}`;
}

function hasForensicTeam(teams: Team[]): boolean {
  return teams.some(
    (t) =>
      t.category === 'Forensic' ||
      /\bforensic\b/i.test(teamText(t)) ||
      /\bFORENSIC\b/.test(String(t.directorate || ''))
  );
}

function hasChildrenTeam(teams: Team[]): boolean {
  return teams.some(
    (t) =>
      t.category === 'Children' ||
      /\bcamhs\b/i.test(teamText(t)) ||
      /\bchildren\b/i.test(teamText(t)) ||
      /\badolescent\b/i.test(teamText(t))
  );
}

function hasBedfordChs(teams: Team[]): boolean {
  return teams.some((t) => /\bchs\b/i.test(teamText(t)) || /\bcommunity health\b/i.test(teamText(t)));
}

/**
 * Pin colour: forensic and children override borough; Bedford splits CHS vs mental health when possible.
 */
export function getSiteMapStyle(site: Site): SiteMapStyle {
  const borough = norm(site.borough || 'OTHER');
  const teams = site.teams || [];

  if (hasForensicTeam(teams)) {
    return { color: '#E65100', label: 'Forensic', legendKey: 'forensic' };
  }
  if (hasChildrenTeam(teams)) {
    return { color: '#AD1457', label: 'Children & specialist', legendKey: 'children-specialist' };
  }

  if (borough === 'BEDFORD') {
    if (hasBedfordChs(teams)) {
      return { color: '#00897B', label: 'Bedford CHS', legendKey: 'bedford-chs' };
    }
    return { color: '#6D4C41', label: 'Bedford mental health', legendKey: 'bedford-mh' };
  }

  switch (borough) {
    case 'TOWER HAMLETS':
      return { color: '#0D47A1', label: 'Tower Hamlets', legendKey: 'tower-hamlets' };
    case 'NEWHAM':
      return { color: '#43A047', label: 'Newham', legendKey: 'newham' };
    case 'CITY & HACKNEY':
      return { color: '#9CCC65', label: 'City & Hackney', legendKey: 'city-hackney' };
    case 'BEDFORDSHIRE':
      return { color: '#827717', label: 'Bedfordshire', legendKey: 'bedfordshire' };
    case 'LUTON':
      return { color: '#1B5E20', label: 'Luton', legendKey: 'luton' };
    case 'LONDON':
      return { color: '#546E7A', label: 'London / trust-wide', legendKey: 'london' };
    default:
      return { color: '#005EB8', label: 'Other', legendKey: 'other' };
  }
}

const LEGEND_ORDER: MapLegendKey[] = [
  'tower-hamlets',
  'newham',
  'city-hackney',
  'bedford-chs',
  'bedford-mh',
  'bedfordshire',
  'luton',
  'children-specialist',
  'forensic',
  'london',
  'other',
];

export interface LegendRow {
  legendKey: MapLegendKey;
  label: string;
  color: string;
  count: number;
}

export function buildMapLegend(sites: Site[]): LegendRow[] {
  const counts = new Map<MapLegendKey, { label: string; color: string; count: number }>();

  for (const site of sites) {
    const style = getSiteMapStyle(site);
    const prev = counts.get(style.legendKey);
    if (prev) {
      prev.count += 1;
    } else {
      counts.set(style.legendKey, {
        label: style.label,
        color: style.color,
        count: 1,
      });
    }
  }

  return LEGEND_ORDER.filter((k) => counts.has(k)).map((k) => {
    const row = counts.get(k)!;
    return { legendKey: k, label: row.label, color: row.color, count: row.count };
  });
}
