export type MapStyle = 'roadmap' | 'satellite' | 'hybrid';
export type MapProvider = 'google' | 'maplibre';
export type DiveFocus = 'destination' | 'origin' | 'both';

export interface NearbyAccount {
  id: string;
  entityName: string;
  type: string;
  lat: number;
  lng: number;
  riskScore: number;
  balance: number;
  distanceMeters: number;
}

export interface BankBranch {
  id: string;
  name: string;
  bic: string;
  lat: number;
  lng: number;
  address: string;
  distanceMeters: number;
}

export interface UnifiedMapController {
  flyTo: (lat: number, lng: number, zoom: number, durationMs?: number) => void;
  setZoom: (zoom: number) => void;
  getZoom: () => number;
  fitBounds: (points: { lat: number; lng: number }[]) => void;
  setStyle: (style: MapStyle) => void;
  setLayersVisible: (layers: { nearbyAccounts: boolean; bankBranches: boolean }) => void;
  destroy: () => void;
}

// Calculate Haversine distance between two coordinates in km and miles
export function calculateHaversineDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): { km: number; miles: number } {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  return {
    km: Math.round(km),
    miles: Math.round(km * 0.621371)
  };
}

// Generate deterministic nearby simulated accounts around coordinates
export function getMockNearbyAccounts(centerLat: number, centerLng: number, caseId: string): NearbyAccount[] {
  // Use simple hash of caseId for seed
  let hash = 0;
  for (let i = 0; i < caseId.length; i++) {
    hash = ((hash << 5) - hash) + caseId.charCodeAt(i);
    hash |= 0;
  }
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(Math.abs(hash) + offset) * 10000;
    return x - Math.floor(x);
  };

  const accountEntities = [
    { name: 'Apex Capital Holding LLC', type: 'Offshore Shell', risk: 88, balance: 1420500 },
    { name: 'Meridian Logistics Int.', type: 'Trade Intermediary', risk: 74, balance: 890000 },
    { name: 'Vanguard Global Escrow', type: 'Custodial Trust', risk: 62, balance: 2150000 },
    { name: 'Helios FinTech Clearing', type: 'Crypto Gateway', risk: 91, balance: 3410000 }
  ];

  return accountEntities.slice(0, 3).map((item, idx) => {
    const angle = (pseudoRandom(idx * 7) * Math.PI * 2);
    // 300m - 1200m offset
    const distanceMeters = 300 + pseudoRandom(idx * 13) * 900;
    const latOffset = (distanceMeters / 111320) * Math.cos(angle);
    const lngOffset = (distanceMeters / (111320 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);

    return {
      id: `ACC-LOCAL-0${idx + 1}`,
      entityName: item.name,
      type: item.type,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
      riskScore: item.risk,
      balance: item.balance,
      distanceMeters: Math.round(distanceMeters)
    };
  });
}

// Generate deterministic nearby simulated bank branches around coordinates
export function getMockBankBranches(centerLat: number, centerLng: number, city: string): BankBranch[] {
  const branches = [
    { name: `${city} Central Private Bank`, bic: 'CPBKCHZZ', dist: 420, addr: '14 Bahnhofstrasse' },
    { name: 'Credit Union Regional Vault', bic: 'CURVCH22', dist: 890, addr: '82 Financial Canal Ave' },
  ];

  return branches.map((b, idx) => {
    const angle = (idx * 2.1) + 0.8;
    const latOffset = (b.dist / 111320) * Math.cos(angle);
    const lngOffset = (b.dist / (111320 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);

    return {
      id: `BRANCH-0${idx + 1}`,
      name: b.name,
      bic: b.bic,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
      address: b.addr,
      distanceMeters: b.dist
    };
  });
}

// Create GeoJSON polygon for a circle of radius meters around (lat, lng)
export function createCircleGeoJSON(centerLat: number, centerLng: number, radiusMeters = 500, points = 48): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const distanceX = radiusMeters / (111320 * Math.cos(centerLat * Math.PI / 180));
  const distanceY = radiusMeters / 110540;

  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = centerLng + distanceX * Math.sin(theta);
    const y = centerLat + distanceY * Math.cos(theta);
    coords.push([x, y]);
  }

  return {
    type: 'Feature',
    properties: {
      name: '500m Activity Perimeter'
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    }
  };
}
