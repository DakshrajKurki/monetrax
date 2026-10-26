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

// Generate great-circle intermediate points between two coordinates for animated arc tracing
export function getGreatCirclePoints(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  numPoints = 60
): [number, number][] {
  const points: [number, number][] = [];
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;

  const φ1 = fromLat * toRad;
  const λ1 = fromLng * toRad;
  const φ2 = toLat * toRad;
  const λ2 = toLng * toRad;

  const d = 2 * Math.asin(
    Math.sqrt(
      Math.sin((φ2 - φ1) / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
    )
  );

  if (d < 1e-6) {
    return [[fromLng, fromLat], [toLng, toLat]];
  }

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * toDeg;
    const lng = Math.atan2(y, x) * toDeg;
    points.push([lng, lat]);
  }
  return points;
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

import { resolveLocationCoordinates } from '../../utils/coordinateResolver';

// ----------------------------------------------------------------------------
// Multi-Hop Account Chain & Live Tracking Types and Helpers
// ----------------------------------------------------------------------------
export interface AccountHop {
  id: string;
  account: string;
  entityName: string;
  bank: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  role: 'origin' | 'intermediary' | 'destination';
  progressFraction: number; // 0.0 to 1.0 along the corridor
}

export interface LiveTrackingStatus {
  currentHopIndex: number;
  status: 'In Transit' | 'Layered' | 'Reached Destination';
  activeHop: AccountHop;
  nextHop?: AccountHop;
  chain: AccountHop[];
}

export function generateAccountChain(txn: {
  id: string;
  fromAccount: string;
  toAccount: string;
  fromEntityName?: string;
  toEntityName?: string;
  fromBank: string;
  toBank: string;
  fromCity: string;
  toCity: string;
  fromCountry: string;
  toCountry: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  riskScore: number;
  typology?: string;
}): { hops: AccountHop[]; corridorPoints: [number, number][] } {
  const fromCoords = resolveLocationCoordinates(txn.fromCity, txn.fromCountry, txn.fromLat, txn.fromLng);
  const toCoords = resolveLocationCoordinates(txn.toCity, txn.toCountry, txn.toLat, txn.toLng);

  // Always start with Origin
  const hops: AccountHop[] = [
    {
      id: txn.fromAccount,
      account: txn.fromAccount,
      entityName: txn.fromEntityName || `${txn.fromCity || 'Origin'} Originator Entity`,
      bank: txn.fromBank,
      city: txn.fromCity || 'Origin City',
      country: txn.fromCountry || 'Origin Country',
      lat: fromCoords.lat,
      lng: fromCoords.lng,
      role: 'origin',
      progressFraction: 0
    }
  ];

  const seed = Math.abs(txn.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
  const hasIntermediary = txn.riskScore >= 60 || txn.typology === 'cyclic_flow' || txn.typology === 'mule_fan';
  const hasSecondIntermediary = txn.typology === 'cyclic_flow' || (txn.riskScore >= 75 && seed % 2 === 0);

  if (hasIntermediary) {
    const frac1 = hasSecondIntermediary ? 0.38 : 0.50;
    const int1Points = getGreatCirclePoints(fromCoords.lng, fromCoords.lat, toCoords.lng, toCoords.lat, 100);
    const idx1 = Math.floor(int1Points.length * frac1);
    const [intLng1, intLat1] = int1Points[idx1] || [(fromCoords.lng + toCoords.lng) / 2, (fromCoords.lat + toCoords.lat) / 2];

    const intCities = ['Zurich', 'London', 'Frankfurt', 'Dubai', 'Singapore', 'Luxembourg'];
    const intBanks = ['EuroClear Intermediary Bank', 'Swiss Settlement Clearing AG', 'Aegis Transatlantic Escrow', 'Standard Correspondent Trust'];
    const intCity = intCities[seed % intCities.length];
    const intBank = intBanks[seed % intBanks.length];

    hops.push({
      id: `ACCT-INT-${(seed % 8999 + 1000)}`,
      account: `ACCT-INT-${(seed % 8999 + 1000)}`,
      entityName: `${intCity} Clearing & Escrow AG`,
      bank: intBank,
      city: intCity,
      country: 'CH',
      lat: Number.isFinite(intLat1) ? intLat1 : fromCoords.lat,
      lng: Number.isFinite(intLng1) ? intLng1 : fromCoords.lng,
      role: 'intermediary',
      progressFraction: 0
    });

    if (hasSecondIntermediary) {
      const frac2 = 0.72;
      const idx2 = Math.floor(int1Points.length * frac2);
      const [intLng2, intLat2] = int1Points[idx2] || [(fromCoords.lng + toCoords.lng * 2) / 3, (fromCoords.lat + toCoords.lat * 2) / 3];
      const intCity2 = intCities[(seed + 2) % intCities.length];
      const intBank2 = intBanks[(seed + 1) % intBanks.length];

      hops.push({
        id: `ACCT-SHELL-${(seed % 7999 + 2000)}`,
        account: `ACCT-SHELL-${(seed % 7999 + 2000)}`,
        entityName: `${intCity2} Layering Intermediary Ltd`,
        bank: intBank2,
        city: intCity2,
        country: 'CY',
        lat: Number.isFinite(intLat2) ? intLat2 : toCoords.lat,
        lng: Number.isFinite(intLng2) ? intLng2 : toCoords.lng,
        role: 'intermediary',
        progressFraction: 0
      });
    }
  }

  // Final destination hop
  hops.push({
    id: txn.toAccount,
    account: txn.toAccount,
    entityName: txn.toEntityName || `${txn.toCity || 'Destination'} Beneficiary Entity`,
    bank: txn.toBank,
    city: txn.toCity || 'Destination City',
    country: txn.toCountry || 'Destination Country',
    lat: toCoords.lat,
    lng: toCoords.lng,
    role: 'destination',
    progressFraction: 1.0
  });

  // Build the full continuous corridor points stitching all hops
  const corridorPoints: [number, number][] = [];
  const hopIndices: number[] = [0];

  for (let i = 0; i < hops.length - 1; i++) {
    const h1 = hops[i];
    const h2 = hops[i + 1];
    const legPoints = getGreatCirclePoints(h1.lng, h1.lat, h2.lng, h2.lat, 40);
    if (i > 0 && legPoints.length > 0) {
      legPoints.shift();
    }
    corridorPoints.push(...legPoints);
    hopIndices.push(corridorPoints.length - 1);
  }

  // Assign exact progressFraction to each hop
  const total = Math.max(1, corridorPoints.length - 1);
  for (let i = 0; i < hops.length; i++) {
    hops[i].progressFraction = hopIndices[i] / total;
  }

  return { hops, corridorPoints };
}
