
export type DirectorateType = 
  | '363 Bank Level 2'
  | '363 Bank Level 5'
  | '363 Bedford Level 2'
  | '363 Bedfordshire CHS Level 2'
  | '363 City & Hackney Level 2'
  | '363 Corporate Level 2'
  | '363 Forensic Services Level 2'
  | '363 Honorary Contracts Level 2'
  | '363 Luton Level 2'
  | '363 Newham'
  | '363 Newham CHS Level 2'
  | '363 Newham Level 2'
  | '363 Specialist Services Level 2'
  | 'Uncategorized';

export type ServiceCategory = 
  | 'Mental Health' 
  | 'Corporate' 
  | 'Children' 
  | 'Community Health' 
  | 'Specialist' 
  | 'Primary Care' 
  | 'Forensic'
  | 'Other';

export interface Team {
  id: string;
  name: string;
  category: ServiceCategory;
  directorate: DirectorateType;
  description?: string;
  serviceLead?: string;
  seniorManager?: string;
  url?: string;
  phone?: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  postcode?: string;
  latitude: number;
  longitude: number;
  receptionPhone: string;
  teams: Team[];
  borough: 'TOWER HAMLETS' | 'NEWHAM' | 'CITY & HACKNEY' | 'BEDFORDSHIRE' | 'LUTON' | 'LONDON' | 'BEDFORD' | 'OTHER';
  hasStepFreeAccess?: boolean;
  hasParking?: boolean;
  distance?: number;
}

export type ViewMode = 'home' | 'map' | 'list' | 'directorates' | 'service-detail' | 'site-profile' | 'teams-list' | 'team-profile';

export type Language = 'en' | 'bn' | 'ur';

export interface TranslationStrings {
  title: string;
  strapline: string;
  searchPlaceholder: string;
  mapView: string;
  allSites: string;
  findTeam: string;
  browseDirectorates: string;
  nearest: string;
  footer: string;
  backHome: string;
  allServices: string;
  stepFree: string;
  parking: string;
  teamsBasedHere: string;
  selectLanguage: string;
  serviceDetails: string;
  serviceLead: string;
  seniorManager: string;
  address: string;
  telephone: string;
  viewOnMap: string;
  siteProfile: string;
  getDirections: string;
  allTeams: string;
  teamsDirectory: string;
  availableAt: string;
  teamOverview: string;
  locationsProvidingThis: string;
  loading: string;
  viewOfficialPage: string;
  noResults: string;
}
