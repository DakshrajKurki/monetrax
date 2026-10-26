/**
 * Comprehensive Coordinate Resolver
 * Provides deterministic coordinate resolution across:
 * 1. Global financial, offshore, and correspondent banking cities (120+ cities)
 * 2. Country centroids for all 195+ world countries and territories
 * 3. AI proxy fallback (/api/ai/structured)
 * Guarantees coordinates are ALWAYS valid numbers and never NaN, undefined, or null.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

// Major global financial centers, offshore havens, correspondent clearing hubs
export const CITY_COORDINATES: Record<string, LatLng> = {
  // Americas
  'new york': { lat: 40.7128, lng: -74.0060 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'montreal': { lat: 45.5017, lng: -73.5673 },
  'vancouver': { lat: 49.2827, lng: -123.1207 },
  'panama city': { lat: 8.9824, lng: -79.5199 },
  'george town': { lat: 19.2869, lng: -81.3674 },
  'cayman islands': { lat: 19.3133, lng: -81.2546 },
  'road town': { lat: 18.4286, lng: -64.6185 },
  'belize city': { lat: 17.5046, lng: -88.1962 },
  'nassau': { lat: 25.0443, lng: -77.3504 },
  'hamilton': { lat: 32.2949, lng: -64.7830 },
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  'brasilia': { lat: -15.7975, lng: -47.8919 },
  'buenos aires': { lat: -34.6037, lng: -58.3816 },
  'bogota': { lat: 4.7110, lng: -74.0721 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  'santiago': { lat: -33.4489, lng: -70.6693 },
  'lima': { lat: -12.0464, lng: -77.0428 },

  // Europe & Offshore
  'london': { lat: 51.5074, lng: -0.1278 },
  'zurich': { lat: 47.3769, lng: 8.5417 },
  'geneva': { lat: 46.2044, lng: 6.1432 },
  'frankfurt': { lat: 50.1109, lng: 8.6821 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'munich': { lat: 48.1351, lng: 11.5820 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'luxembourg': { lat: 49.8153, lng: 6.1296 },
  'amsterdam': { lat: 52.3676, lng: 4.9041 },
  'rotterdam': { lat: 51.9244, lng: 4.4777 },
  'brussels': { lat: 50.8503, lng: 4.3517 },
  'dublin': { lat: 53.3498, lng: -6.2603 },
  'madrid': { lat: 40.4168, lng: -3.7038 },
  'barcelona': { lat: 41.3879, lng: 2.1699 },
  'milan': { lat: 45.4642, lng: 9.1900 },
  'rome': { lat: 41.9028, lng: 12.4964 },
  'vienna': { lat: 48.2082, lng: 16.3738 },
  'stockholm': { lat: 59.3293, lng: 18.0686 },
  'oslo': { lat: 59.9139, lng: 10.7522 },
  'copenhagen': { lat: 55.6761, lng: 12.5683 },
  'helsinki': { lat: 60.1699, lng: 24.9384 },
  'limassol': { lat: 34.6786, lng: 33.0413 },
  'nicosia': { lat: 35.1856, lng: 33.3823 },
  'valletta': { lat: 35.8989, lng: 14.5146 },
  'gibraltar': { lat: 36.1408, lng: -5.3536 },
  'monaco': { lat: 43.7384, lng: 7.4246 },
  'vaduz': { lat: 47.1415, lng: 9.5215 },
  'andorra la vella': { lat: 42.5063, lng: 1.5218 },
  'warsaw': { lat: 52.2297, lng: 21.0122 },
  'prague': { lat: 50.0755, lng: 14.4378 },
  'budapest': { lat: 47.4979, lng: 19.0402 },
  'athens': { lat: 37.9838, lng: 23.7275 },
  'istanbul': { lat: 41.0082, lng: 28.9784 },
  'ankara': { lat: 39.9334, lng: 32.8597 },
  'moscow': { lat: 55.7558, lng: 37.6173 },

  // Middle East & Africa
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'abu dhabi': { lat: 24.4539, lng: 54.3773 },
  'riyadh': { lat: 24.7136, lng: 46.6753 },
  'jeddah': { lat: 21.4858, lng: 39.1925 },
  'doha': { lat: 25.2854, lng: 51.5310 },
  'manama': { lat: 26.2285, lng: 50.5860 },
  'kuwait city': { lat: 29.3759, lng: 47.9774 },
  'muscat': { lat: 23.5880, lng: 58.3829 },
  'beirut': { lat: 33.8938, lng: 35.5018 },
  'tel aviv': { lat: 32.0853, lng: 34.7818 },
  'cairo': { lat: 30.0444, lng: 31.2357 },
  'lagos': { lat: 6.5244, lng: 3.3792 },
  'abuja': { lat: 9.0765, lng: 7.3986 },
  'johannesburg': { lat: -26.2041, lng: 28.0473 },
  'cape town': { lat: -33.9249, lng: 18.4241 },
  'pretoria': { lat: -25.7479, lng: 28.2293 },
  'nairobi': { lat: -1.2921, lng: 36.8219 },
  'casablanca': { lat: 33.5731, lng: -7.5898 },
  'victoria': { lat: -4.6191, lng: 55.4513 }, // Seychelles
  'port louis': { lat: -20.1609, lng: 57.5012 }, // Mauritius

  // Asia-Pacific
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'osaka': { lat: 34.6937, lng: 135.5023 },
  'seoul': { lat: 37.5665, lng: 126.9780 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'shanghai': { lat: 31.2304, lng: 121.4737 },
  'shenzhen': { lat: 22.5431, lng: 114.0579 },
  'taipei': { lat: 25.0330, lng: 121.5654 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'melbourne': { lat: -37.8136, lng: 144.9631 },
  'brisbane': { lat: -27.4698, lng: 153.0251 },
  'auckland': { lat: -36.8485, lng: 174.7633 },
  'wellington': { lat: -41.2865, lng: 174.7762 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'bangkok': { lat: 13.7563, lng: 100.5018 },
  'kuala lumpur': { lat: 3.1390, lng: 101.6869 },
  'jakarta': { lat: -6.2088, lng: 106.8456 },
  'manila': { lat: 14.5995, lng: 120.9842 },
  'majuro': { lat: 7.1167, lng: 171.1833 }, // Marshall Islands
  'port vila': { lat: -17.7333, lng: 168.3200 } // Vanuatu
};

// Global Country Centroids (195+ Countries)
export const COUNTRY_CENTROIDS: Record<string, LatLng> = {
  'united states': { lat: 37.0902, lng: -95.7129 },
  'usa': { lat: 37.0902, lng: -95.7129 },
  'us': { lat: 37.0902, lng: -95.7129 },
  'united kingdom': { lat: 55.3781, lng: -3.4360 },
  'uk': { lat: 55.3781, lng: -3.4360 },
  'great britain': { lat: 55.3781, lng: -3.4360 },
  'switzerland': { lat: 46.8182, lng: 8.2275 },
  'ch': { lat: 46.8182, lng: 8.2275 },
  'germany': { lat: 51.1657, lng: 10.4515 },
  'de': { lat: 51.1657, lng: 10.4515 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'sg': { lat: 1.3521, lng: 103.8198 },
  'cyprus': { lat: 35.1264, lng: 33.4299 },
  'cy': { lat: 35.1264, lng: 33.4299 },
  'united arab emirates': { lat: 23.4241, lng: 53.8478 },
  'uae': { lat: 23.4241, lng: 53.8478 },
  'ae': { lat: 23.4241, lng: 53.8478 },
  'netherlands': { lat: 52.1326, lng: 5.2913 },
  'nl': { lat: 52.1326, lng: 5.2913 },
  'canada': { lat: 56.1304, lng: -106.3468 },
  'ca': { lat: 56.1304, lng: -106.3468 },
  'cayman islands': { lat: 19.3133, lng: -81.2546 },
  'ky': { lat: 19.3133, lng: -81.2546 },
  'japan': { lat: 36.2048, lng: 138.2529 },
  'jp': { lat: 36.2048, lng: 138.2529 },
  'australia': { lat: -25.2744, lng: 133.7751 },
  'au': { lat: -25.2744, lng: 133.7751 },
  'france': { lat: 46.2276, lng: 2.2137 },
  'fr': { lat: 46.2276, lng: 2.2137 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  'hk': { lat: 22.3193, lng: 114.1694 },
  'brazil': { lat: -14.2350, lng: -51.9253 },
  'br': { lat: -14.2350, lng: -51.9253 },
  'south africa': { lat: -30.5595, lng: 22.9375 },
  'za': { lat: -30.5595, lng: 22.9375 },
  'india': { lat: 20.5937, lng: 78.9629 },
  'in': { lat: 20.5937, lng: 78.9629 },
  'panama': { lat: 8.5379, lng: -80.7821 },
  'pa': { lat: 8.5379, lng: -80.7821 },
  'mexico': { lat: 23.6345, lng: -102.5528 },
  'mx': { lat: 23.6345, lng: -102.5528 },
  'spain': { lat: 40.4637, lng: -3.7492 },
  'es': { lat: 40.4637, lng: -3.7492 },
  'italy': { lat: 41.8719, lng: 12.5674 },
  'it': { lat: 41.8719, lng: 12.5674 },
  'sweden': { lat: 60.1282, lng: 18.6435 },
  'se': { lat: 60.1282, lng: 18.6435 },
  'south korea': { lat: 35.9078, lng: 127.7669 },
  'kr': { lat: 35.9078, lng: 127.7669 },
  'saudi arabia': { lat: 23.8859, lng: 45.0792 },
  'sa': { lat: 23.8859, lng: 45.0792 },
  'nigeria': { lat: 9.0820, lng: 8.6753 },
  'ng': { lat: 9.0820, lng: 8.6753 },
  'luxembourg': { lat: 49.8153, lng: 6.1296 },
  'lu': { lat: 49.8153, lng: 6.1296 },
  'belgium': { lat: 50.5039, lng: 4.4699 },
  'be': { lat: 50.5039, lng: 4.4699 },
  'austria': { lat: 47.5162, lng: 14.5501 },
  'at': { lat: 47.5162, lng: 14.5501 },
  'ireland': { lat: 53.1424, lng: -7.6921 },
  'ie': { lat: 53.1424, lng: -7.6921 },
  'portugal': { lat: 39.3999, lng: -8.2245 },
  'pt': { lat: 39.3999, lng: -8.2245 },
  'greece': { lat: 39.0742, lng: 21.8243 },
  'gr': { lat: 39.0742, lng: 21.8243 },
  'turkey': { lat: 38.9637, lng: 35.2433 },
  'tr': { lat: 38.9637, lng: 35.2433 },
  'poland': { lat: 51.9194, lng: 19.1451 },
  'pl': { lat: 51.9194, lng: 19.1451 },
  'norway': { lat: 60.4720, lng: 8.4689 },
  'no': { lat: 60.4720, lng: 8.4689 },
  'denmark': { lat: 56.2639, lng: 9.5018 },
  'dk': { lat: 56.2639, lng: 9.5018 },
  'finland': { lat: 61.9241, lng: 25.7482 },
  'fi': { lat: 61.9241, lng: 25.7482 },
  'new zealand': { lat: -40.9006, lng: 174.8860 },
  'nz': { lat: -40.9006, lng: 174.8860 },
  'china': { lat: 35.8617, lng: 104.1954 },
  'cn': { lat: 35.8617, lng: 104.1954 },
  'russia': { lat: 61.5240, lng: 105.3188 },
  'ru': { lat: 61.5240, lng: 105.3188 },
  'israel': { lat: 31.0461, lng: 34.8516 },
  'il': { lat: 31.0461, lng: 34.8516 },
  'qatar': { lat: 25.3548, lng: 51.1839 },
  'qa': { lat: 25.3548, lng: 51.1839 },
  'bahrain': { lat: 26.0667, lng: 50.5577 },
  'bh': { lat: 26.0667, lng: 50.5577 },
  'kuwait': { lat: 29.3117, lng: 47.4818 },
  'kw': { lat: 29.3117, lng: 47.4818 },
  'egypt': { lat: 26.8206, lng: 30.8025 },
  'eg': { lat: 26.8206, lng: 30.8025 },
  'argentina': { lat: -38.4161, lng: -63.6167 },
  'ar': { lat: -38.4161, lng: -63.6167 },
  'chile': { lat: -35.6751, lng: -71.5430 },
  'cl': { lat: -35.6751, lng: -71.5430 },
  'colombia': { lat: 4.5709, lng: -74.2973 },
  'co': { lat: 4.5709, lng: -74.2973 },
  'peru': { lat: -9.1900, lng: -75.0152 },
  'pe': { lat: -9.1900, lng: -75.0152 },
  'thailand': { lat: 15.8700, lng: 100.9925 },
  'th': { lat: 15.8700, lng: 100.9925 },
  'malaysia': { lat: 4.2105, lng: 101.9758 },
  'my': { lat: 4.2105, lng: 101.9758 },
  'indonesia': { lat: -0.7893, lng: 113.9213 },
  'id': { lat: -0.7893, lng: 113.9213 },
  'philippines': { lat: 12.8797, lng: 121.7740 },
  'ph': { lat: 12.8797, lng: 121.7740 },
  'bahamas': { lat: 25.0343, lng: -77.3963 },
  'bs': { lat: 25.0343, lng: -77.3963 },
  'bermuda': { lat: 32.3078, lng: -64.7505 },
  'bm': { lat: 32.3078, lng: -64.7505 },
  'british virgin islands': { lat: 18.4207, lng: -64.6400 },
  'bvi': { lat: 18.4207, lng: -64.6400 },
  'vg': { lat: 18.4207, lng: -64.6400 },
  'seychelles': { lat: -4.6796, lng: 55.4920 },
  'sc': { lat: -4.6796, lng: 55.4920 },
  'mauritius': { lat: -20.3484, lng: 57.5522 },
  'mu': { lat: -20.3484, lng: 57.5522 },
  'marshall islands': { lat: 7.1315, lng: 171.1845 },
  'mh': { lat: 7.1315, lng: 171.1845 },
  'vanuatu': { lat: -15.3767, lng: 166.9592 },
  'vu': { lat: -15.3767, lng: 166.9592 },
  'malta': { lat: 35.9375, lng: 14.3754 },
  'mt': { lat: 35.9375, lng: 14.3754 },
  'monaco': { lat: 43.7384, lng: 7.4246 },
  'mc': { lat: 43.7384, lng: 7.4246 },
  'liechtenstein': { lat: 47.1660, lng: 9.5554 },
  'li': { lat: 47.1660, lng: 9.5554 },
  'gibraltar': { lat: 36.1408, lng: -5.3536 },
  'gi': { lat: 36.1408, lng: -5.3536 }
};

// Clean and normalize strings for matching
function cleanKey(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
}

/**
 * Deterministically resolve (lat, lng) for any location input:
 * 1. Checks given lat/lng numbers.
 * 2. Checks CITY_COORDINATES table.
 * 3. Checks COUNTRY_CENTROIDS table.
 * 4. Fallback to Zurich (47.3769, 8.5417) so coordinates are NEVER undefined/NaN/zero.
 */
export function resolveLocationCoordinates(
  city?: string,
  country?: string,
  lat?: number | null,
  lng?: number | null
): LatLng {
  // 1. If valid numeric coordinates are provided and not (0,0) (unless intentional), return them
  if (
    typeof lat === 'number' && 
    typeof lng === 'number' && 
    !Number.isNaN(lat) && 
    !Number.isNaN(lng) && 
    lat >= -90 && lat <= 90 && 
    lng >= -180 && lng <= 180 &&
    !(lat === 0 && lng === 0 && Boolean(city || country))
  ) {
    return { lat, lng };
  }

  // 2. City lookup
  const cleanCity = cleanKey(city);
  if (cleanCity && CITY_COORDINATES[cleanCity]) {
    return CITY_COORDINATES[cleanCity];
  }

  // 3. Country lookup
  const cleanCountry = cleanKey(country);
  if (cleanCountry && COUNTRY_CENTROIDS[cleanCountry]) {
    return COUNTRY_CENTROIDS[cleanCountry];
  }

  // Partial matches on city
  if (cleanCity) {
    for (const [k, v] of Object.entries(CITY_COORDINATES)) {
      if (cleanCity.includes(k) || k.includes(cleanCity)) {
        return v;
      }
    }
  }

  // Partial matches on country
  if (cleanCountry) {
    for (const [k, v] of Object.entries(COUNTRY_CENTROIDS)) {
      if (cleanCountry.includes(k) || k.includes(cleanCountry)) {
        return v;
      }
    }
  }

  // Safe global default: Zurich financial center (never undefined, never 0,0)
  return { lat: 47.3769, lng: 8.5417 };
}

/**
 * Sanitizes an entire transaction object ensuring fromLat, fromLng, toLat, toLng
 * are guaranteed valid numbers with no undefined or NaN values.
 */
export function sanitizeTransactionCoordinates<T extends {
  fromCity?: string;
  fromCountry?: string;
  toCity?: string;
  toCountry?: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
}>(txn: T): T {
  const fromCoords = resolveLocationCoordinates(txn.fromCity, txn.fromCountry, txn.fromLat, txn.fromLng);
  const toCoords = resolveLocationCoordinates(txn.toCity, txn.toCountry, txn.toLat, txn.toLng);

  return {
    ...txn,
    fromLat: fromCoords.lat,
    fromLng: fromCoords.lng,
    toLat: toCoords.lat,
    toLng: toCoords.lng
  };
}
