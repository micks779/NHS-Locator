
import { Site, TranslationStrings, Language } from './types';

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  en: {
    title: 'ELFT Sites & Teams Locator',
    strapline: 'Find services, teams and site information.',
    searchPlaceholder: 'Search 279+ services (e.g. CAMHS, HR)...',
    mapView: 'Interactive Map',
    allSites: 'Sites Directory',
    findTeam: 'Find a Team',
    browseDirectorates: 'Browse Directorates',
    nearest: 'Find Nearest',
    footer: '© Akinbola Digitals',
    backHome: 'Home',
    allServices: 'All Services',
    stepFree: 'Step-Free',
    parking: 'Parking',
    teamsBasedHere: 'Teams Based Here',
    selectLanguage: 'Select Language',
    serviceDetails: 'Service Details',
    serviceLead: 'Service Lead',
    seniorManager: 'Senior Manager',
    address: 'Address',
    telephone: 'Telephone number',
    viewOnMap: 'View on Map',
    siteProfile: 'Site Profile',
    getDirections: 'Get Directions',
    allTeams: 'All Teams',
    teamsDirectory: 'Teams Directory',
    availableAt: 'Sites with this team',
    teamOverview: 'Team Overview',
    locationsProvidingThis: 'Locations Providing This Service',
    loading: 'Loading Production Data...',
    viewOfficialPage: 'View Official Service Page',
    noResults: 'No results matching your search'
  },
  bn: {
    title: 'ELFT সাইট এবং টিম লোকেটর',
    strapline: 'পরিষেবা, দল এবং সাইটের তথ্য খুঁজুন।',
    searchPlaceholder: '২৭৯+ পরিষেবা খুঁজুন (যেমন CAMHS, HR)...',
    mapView: 'মানচিত্র',
    allSites: 'সাইট ডিরেক্টরি',
    findTeam: 'টিম খুঁজুন',
    browseDirectorates: 'পরিচালনা অধিদপ্তর',
    nearest: 'নিকটতম খুঁজুন',
    footer: '© Akinbola Digitals',
    backHome: 'হোম',
    allServices: 'সব পরিষেবা',
    stepFree: 'ধাপ-মুক্ত',
    parking: 'পার্কিং',
    teamsBasedHere: 'এখানে অবস্থিত দলগুলি',
    selectLanguage: 'ভাষা',
    serviceDetails: 'বিবরণ',
    serviceLead: 'প্রধান',
    seniorManager: 'ম্যানেজার',
    address: 'ঠিকানা',
    telephone: 'ফোন',
    viewOnMap: 'মানচিত্র',
    siteProfile: 'প্রোফাইল',
    getDirections: 'দিকনির্দেশ',
    allTeams: 'সব দল',
    teamsDirectory: 'ডিরেক্টরি',
    availableAt: 'উপলব্ধ স্থান',
    teamOverview: 'ওভারভিউ',
    locationsProvidingThis: 'পরিষেবা কেন্দ্র',
    loading: 'লোড হচ্ছে...',
    viewOfficialPage: 'অফিসিয়াল পেজ',
    noResults: 'কোন ফলাফল পাওয়া যায়নি'
  },
  ur: {
    title: 'ELFT لوکیٹر',
    strapline: 'خدمات، ٹیمیں اور معلومات تلاش کریں۔',
    searchPlaceholder: 'تلاش کریں...',
    mapView: 'نقشہ',
    allSites: 'سائٹس',
    findTeam: 'ٹیم تلاش کریں',
    browseDirectorates: 'ڈائریکٹوریٹ',
    nearest: 'قریبی',
    footer: '© Akinbola Digitals',
    backHome: 'ہوم',
    allServices: 'تمام خدمات',
    stepFree: 'اسٹیپ فری',
    parking: 'پارکینگ',
    teamsBasedHere: 'ٹیمیں',
    selectLanguage: 'زبان',
    serviceDetails: 'تفصیلات',
    serviceLead: 'لیڈ',
    seniorManager: 'مینیجر',
    address: 'پتہ',
    telephone: 'فون',
    viewOnMap: 'نقشہ',
    siteProfile: 'پروفائل',
    getDirections: 'ہدایات',
    allTeams: 'تمام ٹیمیں',
    teamsDirectory: 'ڈائریکٹری',
    availableAt: 'مقامات',
    teamOverview: 'جائزہ',
    locationsProvidingThis: 'مقامات',
    loading: 'لوڈنگ...',
    viewOfficialPage: 'آفیشل پیج',
    noResults: 'آپ کی تلاش کے مطابق کوئی نتیجہ نہیں ملا'
  }
};

// PRODUCTION DATA INTEGRATED FROM SCRAPER
export const ELFT_SITES: Site[] = [
  {
    "id": "east-ham-care-centre",
    "name": "East Ham Care Centre",
    "address": "302 Shrewsbury Road, London, E7 8QP, United Kingdom",
    "latitude": 51.5398,
    "longitude": 0.0378,
    "receptionPhone": "020 7655 4000",
    "borough": "NEWHAM",
    "hasStepFreeAccess": true,
    "hasParking": false,
    "teams": [
      {
        "id": "service-a98b8jekf",
        "name": "Activities Service (Newham)",
        "category": "Corporate",
        "directorate": "Uncategorized",
        "serviceLead": "Happy Khatun, Activities Manager / Senior Occupational Therapist",
        "seniorManager": "Joanna Raphael, Head of Therapies",
        "url": "https://www.elft.nhs.uk/services/activities-service-newham",
        "description": ""
      },
      {
        "id": "service-orz4kiy93",
        "name": "Adult Speech and Language Therapy Service (Newham)",
        "category": "Community Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/adult-speech-and-language-therapy-service-newham-0",
        "description": ""
      },
      {
        "id": "service-u0qf65aty",
        "name": "Care Navigators - Newham",
        "category": "Other",
        "directorate": "Uncategorized",
        "serviceLead": "Tim Hunter – Deputy Lead Nurse",
        "seniorManager": "Gavin Shields -- Lead Nurse",
        "url": "https://www.elft.nhs.uk/services/care-navigators-newham",
        "description": ""
      },
      {
        "id": "service-g9jo20h7d",
        "name": "Community Care - Newham Older People",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/community-care-newham-older-people",
        "description": ""
      },
      {
        "id": "service-p6dmapv8o",
        "name": "Community Neurological Service (Newham)",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/community-neurological-service-newham",
        "description": ""
      },
      {
        "id": "service-7gzifoysw",
        "name": "Continence and Pelvic Rehabilitation Service - Newham",
        "category": "Community Health",
        "directorate": "Uncategorized",
        "serviceLead": "Selina Fifield, Service Manager",
        "seniorManager": "Gavin Shields, Lead Nurse",
        "url": "https://www.elft.nhs.uk/services/continence-and-pelvic-rehabilitation-service-newham",
        "description": ""
      },
      {
        "id": "service-nojetsi3x",
        "name": "Fothergill Ward (Newham)",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/fothergill-ward-newham",
        "description": ""
      },
      {
        "id": "service-tbyc6qqk5",
        "name": "Mental Health and Physical Frailty Unit - Sally Sherman Ward",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "Gavin Shields, Lead Nurse",
        "url": "https://www.elft.nhs.uk/services/mental-health-and-physical-frailty-unit-sally-sherman-ward",
        "description": ""
      },
      {
        "id": "service-6ml6l7tgz",
        "name": "Referral and Assessment Team - Newham",
        "category": "Other",
        "directorate": "Uncategorized",
        "serviceLead": "Ade Adeosun",
        "seniorManager": "Gavin Shields, Lead Nurse",
        "url": "https://www.elft.nhs.uk/services/referral-and-assessment-team-newham",
        "description": ""
      },
      {
        "id": "service-cm0qkql9y",
        "name": "Single Point of Access - Newham",
        "category": "Other",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/single-point-access-newham",
        "description": ""
      }
    ]
  },
  {
    "id": "beaumont-house",
    "name": "Beaumont House",
    "address": "Mile End Hospital , London , E1 4DG, United Kingdom",
    "latitude": 51.5241,
    "longitude": -0.0441,
    "receptionPhone": "020 7655 4000",
    "borough": "LONDON",
    "hasStepFreeAccess": true,
    "hasParking": false,
    "teams": [
      {
        "id": "service-b8h51mxk4",
        "name": "Admission Avoidance and Discharge Service (Tower Hamlets)",
        "category": "Other",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/admission-avoidance-and-discharge-service-tower-hamlets",
        "description": ""
      },
      {
        "id": "service-904yec52g",
        "name": "Advanced Care Planning Team (Tower Hamlets Community Health Services)",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/advanced-care-planning-team-tower-hamlets-community-health-services",
        "description": ""
      },
      {
        "id": "service-cxt2chcdi",
        "name": "Care Navigator (Tower Hamlets Community Health Services)",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/care-navigator-tower-hamlets-community-health-services",
        "description": ""
      },
      {
        "id": "service-gj4gf8mf6",
        "name": "Neighbourhood Care Team (Tower Hamlets)",
        "category": "Other",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/neighbourhood-care-team-tower-hamlets",
        "description": ""
      }
    ]
  },
  {
    "id": "86-old-montague-street",
    "name": "86 Old Montague Street",
    "address": "London, E1 5NN, United Kingdom",
    "latitude": 51.5173,
    "longitude": -0.0658,
    "receptionPhone": "020 7655 4000",
    "borough": "LONDON",
    "hasStepFreeAccess": true,
    "hasParking": false,
    "teams": [
      {
        "id": "service-0ka48b0la",
        "name": "Adult Autism Service (Tower Hamlets)",
        "category": "Other",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/adult-autism-service-tower-hamlets",
        "description": ""
      },
      {
        "id": "service-6o6h0jbkf",
        "name": "Clozapine Clinic (Tower Hamlets)",
        "category": "Other",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/clozapine-clinic-tower-hamlets",
        "description": ""
      },
      {
        "id": "service-4jmv90h44",
        "name": "Enhanced Primary Care Service (Tower Hamlets)",
        "category": "Other",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/enhanced-primary-care-service-tower-hamlets",
        "description": ""
      },
      {
        "id": "service-rrnvxs8n6",
        "name": "Tower Hamlets Primary Care Mental Health Service",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/tower-hamlets-primary-care-mental-health-service",
        "description": ""
      }
    ]
  },
  {
    "id": "12-kenworthy-road",
    "name": "12 Kenworthy Road",
    "address": "London, E9 5TD, United Kingdom",
    "latitude": 51.5482,
    "longitude": -0.0485,
    "receptionPhone": "020 7655 4000",
    "borough": "LONDON",
    "hasStepFreeAccess": true,
    "hasParking": false,
    "teams": [
      {
        "id": "service-lh52eiw55",
        "name": "Aldgate Ward",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/aldgate-ward",
        "description": ""
      },
      {
        "id": "service-lvedzmzzt",
        "name": "Bow Ward",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/bow-ward",
        "description": ""
      },
      {
        "id": "service-7ae5nbrxg",
        "name": "John Howard Centre",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/john-howard-centre",
        "description": ""
      },
      {
        "id": "service-vmzuyb00h",
        "name": "Shoreditch Ward",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/shoreditch-ward",
        "description": ""
      }
    ]
  },
  {
    "id": "oakley-court",
    "name": "Oakley Court",
    "address": "Angel Close, Luton , LU4 9WT, United Kingdom",
    "latitude": 51.8984,
    "longitude": -0.4682,
    "receptionPhone": "020 7655 4000",
    "borough": "LUTON",
    "hasStepFreeAccess": true,
    "hasParking": false,
    "teams": [
      {
        "id": "service-mg5lpd3fk",
        "name": "Ash Ward (Bedfordshire and Luton)",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/ash-ward-bedfordshire-and-luton",
        "description": ""
      },
      {
        "id": "service-hgzwbhn93",
        "name": "Willow Ward - Bedfordshire",
        "category": "Mental Health",
        "directorate": "Uncategorized",
        "serviceLead": "",
        "seniorManager": "",
        "url": "https://www.elft.nhs.uk/services/willow-ward-bedfordshire",
        "description": ""
      }
    ]
  }
];
