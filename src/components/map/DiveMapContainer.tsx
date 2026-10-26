import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// @ts-ignore
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

if (maplibregl.config) {
  maplibregl.config.WORKER_URL = workerUrl;
}
import {
  MapStyle,
  MapProvider,
  DiveFocus,
  UnifiedMapController,
  getMockNearbyAccounts,
  getMockBankBranches,
  createCircleGeoJSON,
  calculateHaversineDistance,
  getGreatCirclePoints,
  generateAccountChain,
  AccountHop,
  LiveTrackingStatus,
  NearbyAccount,
  BankBranch
} from './types';
import { Transaction } from '../../types';
import { 
  Compass, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  Building2, 
  UserCheck, 
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { sanitizeTransactionCoordinates, resolveLocationCoordinates } from '../../utils/coordinateResolver';

interface DiveMapContainerProps {
  transaction: Transaction;
  initialZoom?: number;
  onControllerReady?: (controller: UnifiedMapController) => void;
  isMapVisible?: boolean;
  onTrackingUpdate?: (status: LiveTrackingStatus) => void;
}

// Fallback Free Tile Style (CartoDB / OpenStreetMap)
const FALLBACK_FREE_STYLE = {
  version: 8 as const,
  sources: {
    'carto-dark-fallback': {
      type: 'raster' as const,
      tiles: [
        'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{y}/{x}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-dark-fallback-layer',
      type: 'raster' as const,
      source: 'carto-dark-fallback',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

// MapLibre Open Tile Styles
const MAPLIBRE_STYLES = {
  roadmap: {
    version: 8 as const,
    sources: {
      'esri-dark-base': {
        type: 'raster' as const,
        tiles: [
          'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: '&copy; Esri &copy; HERE, DeLorme'
      },
      'esri-dark-ref': {
        type: 'raster' as const,
        tiles: [
          'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'esri-dark-base-layer',
        type: 'raster' as const,
        source: 'esri-dark-base',
        minzoom: 0,
        maxzoom: 16
      },
      {
        id: 'esri-dark-ref-layer',
        type: 'raster' as const,
        source: 'esri-dark-ref',
        minzoom: 0,
        maxzoom: 16
      }
    ]
  },
  satellite: {
    version: 8 as const,
    sources: {
      'esri-satellite': {
        type: 'raster' as const,
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: '&copy; Esri &copy; Earthstar Geographics'
      }
    },
    layers: [
      {
        id: 'esri-satellite-layer',
        type: 'raster' as const,
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
  hybrid: {
    version: 8 as const,
    sources: {
      'esri-satellite': {
        type: 'raster' as const,
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: '&copy; Esri'
      },
      'esri-labels': {
        type: 'raster' as const,
        tiles: [
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'esri-base',
        type: 'raster' as const,
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 19
      },
      {
        id: 'labels-layer',
        type: 'raster' as const,
        source: 'esri-labels',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  }
};

export const DiveMapContainer: React.FC<DiveMapContainerProps> = ({
  transaction,
  initialZoom = 15,
  onControllerReady,
  isMapVisible = true,
  onTrackingUpdate
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  // Provider & View States
  const [provider, setProvider] = useState<MapProvider>('maplibre');
  const [currentStyle, setCurrentStyle] = useState<MapStyle>('hybrid');
  const [currentFocus, setCurrentFocus] = useState<DiveFocus>('destination');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layers, setLayers] = useState({
    nearbyAccounts: true,
    bankBranches: true
  });
  const [activeNearbyEntity, setActiveNearbyEntity] = useState<NearbyAccount | BankBranch | null>(null);

  // References to active map instances
  const mapLibreInstanceRef = useRef<maplibregl.Map | null>(null);
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const googleMarkersRef = useRef<any[]>([]);
  const googleCircleRef = useRef<google.maps.Circle | null>(null);
  const googlePolylineRef = useRef<google.maps.Polyline | null>(null);
  const mapLibreMarkersRef = useRef<maplibregl.Marker[]>([]);
  const hopMarkersRef = useRef<maplibregl.Marker[]>([]);
  const hopChipsRef = useRef<HTMLElement[]>([]);
  const cometAnimRef = useRef<number | null>(null);
  const cometMarkerRef = useRef<maplibregl.Marker | null>(null);
  const lastHopIndexRef = useRef<number>(-1);
  const lastStatusRef = useRef<string>('');

  // Robust Sanitized Coordinates Guarantee
  const safeTxn = useMemo(() => sanitizeTransactionCoordinates(transaction), [transaction]);
  const [tileErrorOccurred, setTileErrorOccurred] = useState(false);
  const [isUsingFallbackStyle, setIsUsingFallbackStyle] = useState(false);

  // Computed data
  const distance = calculateHaversineDistance(
    safeTxn.fromLat,
    safeTxn.fromLng,
    safeTxn.toLat,
    safeTxn.toLng
  );

  const nearbyAccounts = useMemo(() => 
    getMockNearbyAccounts(safeTxn.toLat, safeTxn.toLng, safeTxn.id),
    [safeTxn.id, safeTxn.toLat, safeTxn.toLng]
  );
  const bankBranches = useMemo(() => 
    getMockBankBranches(safeTxn.toLat, safeTxn.toLng, safeTxn.toCity),
    [safeTxn.id, safeTxn.toLat, safeTxn.toLng, safeTxn.toCity]
  );

  const onTrackingUpdateRef = useRef(onTrackingUpdate);
  useEffect(() => {
    onTrackingUpdateRef.current = onTrackingUpdate;
  }, [onTrackingUpdate]);

  // --------------------------------------------------------------------------
  // MapLibre Tracking & Corridor Setup Helper
  // --------------------------------------------------------------------------
  const setupMapLibreTracking = useCallback((map: maplibregl.Map) => {
    // 1. Cancel previous animation and cleanup previous hop markers
    if (cometAnimRef.current) {
      cancelAnimationFrame(cometAnimRef.current);
      cometAnimRef.current = null;
    }
    if (cometMarkerRef.current) {
      cometMarkerRef.current.remove();
      cometMarkerRef.current = null;
    }
    hopMarkersRef.current.forEach(m => m.remove());
    hopMarkersRef.current = [];
    hopChipsRef.current = [];
    lastHopIndexRef.current = -1;
    lastStatusRef.current = '';

    const { hops, corridorPoints } = generateAccountChain(safeTxn);
    const totalPoints = corridorPoints.length;
    if (totalPoints < 2) return;

    const riskColor = safeTxn.riskScore >= 70 ? '#FF6B6B' : '#FFAE42';

    // 2. Add / update 500m activity perimeter circle
    const circleGeoJSON = createCircleGeoJSON(safeTxn.toLat, safeTxn.toLng, 500);
    if (!map.getSource('activity-circle')) {
      map.addSource('activity-circle', { type: 'geojson', data: circleGeoJSON });
      map.addLayer({
        id: 'activity-circle-fill',
        type: 'fill',
        source: 'activity-circle',
        paint: { 'fill-color': '#E5484D', 'fill-opacity': 0.16 }
      });
      map.addLayer({
        id: 'activity-circle-stroke',
        type: 'line',
        source: 'activity-circle',
        paint: { 'line-color': '#E5484D', 'line-width': 2, 'line-dasharray': [3, 2], 'line-opacity': 0.85 }
      });
    } else {
      (map.getSource('activity-circle') as maplibregl.GeoJSONSource).setData(circleGeoJSON);
    }

    // 3. Add / update full multi-hop corridor polyline
    const corridorGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: corridorPoints }
    };
    if (!map.getSource('corridor-line')) {
      map.addSource('corridor-line', { type: 'geojson', data: corridorGeoJSON });
      map.addLayer({
        id: 'corridor-line-path',
        type: 'line',
        source: 'corridor-line',
        paint: { 'line-color': '#C4D2C8', 'line-width': 2.5, 'line-dasharray': [4, 4], 'line-opacity': 0.75 }
      });
    } else {
      (map.getSource('corridor-line') as maplibregl.GeoJSONSource).setData(corridorGeoJSON);
    }

    // 4. Add / update dynamic comet trail source and layers (fading trail of pooled points)
    const trailGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: [] }
    };
    if (!map.getSource('comet-trail-source')) {
      map.addSource('comet-trail-source', { type: 'geojson', data: trailGeoJSON });
      map.addLayer({
        id: 'comet-trail-glow',
        type: 'line',
        source: 'comet-trail-source',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': riskColor, 'line-width': 6, 'line-opacity': 0.85, 'line-blur': 3 }
      });
      map.addLayer({
        id: 'comet-trail-core',
        type: 'line',
        source: 'comet-trail-source',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#FFFFFF', 'line-width': 2, 'line-opacity': 0.95 }
      });
    } else {
      (map.getSource('comet-trail-source') as maplibregl.GeoJSONSource).setData(trailGeoJSON);
    }

    // 5. Create markers and animated fading label chips for every hop in the chain
    hops.forEach((hop, idx) => {
      const isOrigin = hop.role === 'origin';
      const isDest = hop.role === 'destination';
      const hopColor = isDest ? '#E5484D' : isOrigin ? '#E8A33D' : '#7F9488';

      const hopEl = document.createElement('div');
      hopEl.className = 'monetrax-hop-pin cursor-pointer relative flex flex-col items-center';
      hopEl.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${isDest ? '<span class="absolute w-8 h-8 rounded-full bg-red-500/30 animate-ping"></span>' : ''}
          ${isOrigin ? '<span class="absolute w-6 h-6 rounded-full bg-amber-500/30 animate-pulse"></span>' : ''}
          <span class="relative w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg" style="background: ${hopColor};"></span>
        </div>
        <div class="hop-chip absolute -top-8 px-2 py-0.5 rounded-full bg-[#0B0F0D]/95 border border-white/10 text-[9px] font-mono text-white shadow-xl flex items-center gap-1.5 whitespace-nowrap pointer-events-none backdrop-blur-md transition-all duration-300" style="opacity: ${idx === 0 ? '1' : '0.35'};">
          <span class="w-1.5 h-1.5 rounded-full" style="background: ${hopColor};"></span>
          <span class="font-medium text-white">${hop.account}</span>
          <span class="text-[var(--muted)]">• ${hop.city}</span>
        </div>
      `;

      const chipEl = hopEl.querySelector('.hop-chip') as HTMLElement;
      if (chipEl) hopChipsRef.current.push(chipEl);

      const marker = new maplibregl.Marker({ element: hopEl })
        .setLngLat([hop.lng, hop.lat])
        .addTo(map);

      hopMarkersRef.current.push(marker);
      mapLibreMarkersRef.current.push(marker);
    });

    // 6. Create Traveling Glowing Comet Dot Marker
    const cometDotEl = document.createElement('div');
    cometDotEl.className = 'monetrax-comet-dot pointer-events-none';
    cometDotEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full animate-ping opacity-60" style="background: ${riskColor};"></span>
        <span class="absolute w-6 h-6 rounded-full blur-[3px]" style="background: ${riskColor}; opacity: 0.85;"></span>
        <span class="relative w-3.5 h-3.5 rounded-full border border-white" style="background: ${riskColor}; box-shadow: 0 0 14px ${riskColor};"></span>
      </div>
    `;
    const cometMarker = new maplibregl.Marker({ element: cometDotEl })
      .setLngLat(corridorPoints[0])
      .addTo(map);
    cometMarkerRef.current = cometMarker;

    // 7. Continuous Looping Animation Frame Loop
    const loopDuration = 4200; // 4.2 seconds travel
    const dwellAtEnd = 600;   // 600ms pause at destination before restart
    const cycleTotal = loopDuration + dwellAtEnd;
    let cycleStartTime = performance.now();

    const stepTracking = (now: number) => {
      const elapsed = now - cycleStartTime;
      const progressRaw = Math.min(1.0, (elapsed % cycleTotal) / loopDuration);
      
      // Smooth cubic ease-in-out
      const t = progressRaw < 0.5 
        ? 4 * progressRaw * progressRaw * progressRaw 
        : 1 - Math.pow(-2 * progressRaw + 2, 3) / 2;

      const currentIdxFloat = t * (totalPoints - 1);
      const idxLow = Math.floor(currentIdxFloat);
      const idxHigh = Math.min(totalPoints - 1, Math.ceil(currentIdxFloat));
      const frac = currentIdxFloat - idxLow;

      const pLow = corridorPoints[idxLow];
      const pHigh = corridorPoints[idxHigh];
      const curLng = pLow[0] + (pHigh[0] - pLow[0]) * frac;
      const curLat = pLow[1] + (pHigh[1] - pLow[1]) * frac;

      cometMarker.setLngLat([curLng, curLat]);

      // Fading trail of ~10 pooled points
      const trailLength = 10;
      const startIdx = Math.max(0, idxLow - trailLength);
      const trailCoords = corridorPoints.slice(startIdx, idxLow + 1);
      trailCoords.push([curLng, curLat]);

      const trailSource = map.getSource('comet-trail-source') as maplibregl.GeoJSONSource;
      if (trailSource) {
        trailSource.setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: trailCoords }
        });
      }

      // Determine active hop
      let activeHopIdx = 0;
      for (let i = 0; i < hops.length; i++) {
        if (progressRaw >= hops[i].progressFraction - 0.03) {
          activeHopIdx = i;
        }
      }

      // Fade in hop label chips as the dot passes them
      for (let i = 0; i < hopChipsRef.current.length; i++) {
        const chip = hopChipsRef.current[i];
        if (!chip) continue;
        if (i <= activeHopIdx) {
          chip.style.opacity = '1';
          chip.style.borderColor = i === hops.length - 1 ? '#E5484D' : i === 0 ? '#E8A33D' : '#7F9488';
          chip.style.boxShadow = '0 0 14px rgba(127,148,136,0.25)';
        } else {
          chip.style.opacity = '0.35';
          chip.style.borderColor = 'rgba(255,255,255,0.1)';
          chip.style.boxShadow = 'none';
        }
      }

      // Determine tracking status
      let currentStatus: 'In Transit' | 'Layered' | 'Reached Destination' = 'In Transit';
      if (progressRaw >= 0.98) {
        currentStatus = 'Reached Destination';
      } else if (activeHopIdx > 0 && activeHopIdx < hops.length - 1) {
        currentStatus = 'Layered';
      } else {
        currentStatus = 'In Transit';
      }

      // Fire callback only on hop index or status change (zero re-render per frame)
      if (lastHopIndexRef.current !== activeHopIdx || lastStatusRef.current !== currentStatus) {
        lastHopIndexRef.current = activeHopIdx;
        lastStatusRef.current = currentStatus;
        onTrackingUpdateRef.current?.({
          currentHopIndex: activeHopIdx,
          status: currentStatus,
          activeHop: hops[activeHopIdx],
          nextHop: hops[activeHopIdx + 1],
          chain: hops
        });
      }

      // Loop cycle reset
      if (elapsed >= cycleTotal) {
        cycleStartTime = now;
      }

      cometAnimRef.current = requestAnimationFrame(stepTracking);
    };

    cometAnimRef.current = requestAnimationFrame(stepTracking);
  }, [safeTxn]);

  // --------------------------------------------------------------------------
  // MapLibre GL Initializer
  // --------------------------------------------------------------------------
  const initMapLibre = useCallback(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance if any
    if (mapLibreInstanceRef.current) {
      mapLibreInstanceRef.current.remove();
      mapLibreInstanceRef.current = null;
    }

    try {
      const activeStyle = isUsingFallbackStyle ? FALLBACK_FREE_STYLE : MAPLIBRE_STYLES[currentStyle];
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: activeStyle as any,
        center: [safeTxn.toLng, safeTxn.toLat],
        zoom: initialZoom,
        pitch: 35,
        bearing: -15,
        cooperativeGestures: true,
        attributionControl: false
      });

      // Tile error and map error safety net
      map.on('error', (e) => {
        if (e && !isUsingFallbackStyle) {
          console.warn('MapLibre error or tile load failure, activating fallback style:', e);
          setTileErrorOccurred(true);
          setIsUsingFallbackStyle(true);
          try {
            map.setStyle(FALLBACK_FREE_STYLE as any);
            map.once('style.load', () => {
              setupMapLibreTracking(map);
            });
          } catch (fbErr) {
            console.warn('Fallback style failed:', fbErr);
          }
        }
      });

      mapLibreInstanceRef.current = map;
      setProvider('maplibre');

      const onMapReady = () => {
        map.resize();
        setupMapLibreTracking(map);

        // Add Nearby Accounts markers
        nearbyAccounts.forEach((acc) => {
          const accEl = document.createElement('div');
          accEl.className = 'nearby-acc-marker cursor-pointer group';
          accEl.innerHTML = `
            <div class="relative flex items-center justify-center">
              <span class="w-2.5 h-2.5 rounded-full bg-[var(--sage-2)] border border-white/60 shadow group-hover:scale-125 transition-transform"></span>
              <div class="absolute -bottom-7 hidden group-hover:flex px-2 py-1 rounded bg-[#0B0F0D]/95 border border-[var(--sage-2)] text-[9px] font-mono text-white shadow-xl whitespace-nowrap z-50">
                ${acc.id} (${acc.entityName})
              </div>
            </div>
          `;
          accEl.onclick = () => {
            setActiveNearbyEntity(acc);
          };
          const m = new maplibregl.Marker({ element: accEl })
            .setLngLat([acc.lng, acc.lat])
            .addTo(map);
          mapLibreMarkersRef.current.push(m);
        });

        // Add Bank Branch markers
        bankBranches.forEach((b) => {
          const bEl = document.createElement('div');
          bEl.className = 'bank-branch-marker cursor-pointer group';
          bEl.innerHTML = `
            <div class="relative flex items-center justify-center">
              <span class="w-2.5 h-2.5 rounded bg-[var(--live)]/80 border border-white/60 shadow group-hover:scale-125 transition-transform"></span>
              <div class="absolute -bottom-7 hidden group-hover:flex px-2 py-1 rounded bg-[#0B0F0D]/95 border border-[var(--live)] text-[9px] font-mono text-white shadow-xl whitespace-nowrap z-50">
                ${b.name} (${b.bic})
              </div>
            </div>
          `;
          bEl.onclick = () => {
            setActiveNearbyEntity(b);
          };
          const m = new maplibregl.Marker({ element: bEl })
            .setLngLat([b.lng, b.lat])
            .addTo(map);
          mapLibreMarkersRef.current.push(m);
        });
      };

      if (map.loaded()) {
        onMapReady();
      } else {
        map.once('load', onMapReady);
      }

      // Pass controller to parent if requested
      if (onControllerReady) {
        onControllerReady({
          flyTo: (lat, lng, zoom, durationMs = 1800) => {
            map.flyTo({ center: [lng, lat], zoom, duration: durationMs, essential: true });
          },
          setZoom: (z) => map.setZoom(z),
          getZoom: () => map.getZoom(),
          fitBounds: (points) => {
            if (points.length === 0) return;
            const bounds = new maplibregl.LngLatBounds();
            points.forEach(p => bounds.extend([p.lng, p.lat]));
            map.fitBounds(bounds, { padding: 80, duration: 1500 });
          },
          setStyle: (st) => {
            setCurrentStyle(st);
            map.setStyle(MAPLIBRE_STYLES[st] as any);
            map.once('style.load', () => {
              setupMapLibreTracking(map);
            });
          },
          setLayersVisible: (lyrs) => {
            setLayers(lyrs);
          },
          destroy: () => {
            map.remove();
          }
        });
      }
    } catch (err) {
      console.warn('MapLibre init error:', err);
    }
  }, [currentStyle, initialZoom, isUsingFallbackStyle, onControllerReady, setupMapLibreTracking, safeTxn, nearbyAccounts, bankBranches]);

  // --------------------------------------------------------------------------
  // Google Maps JS API Initializer (Attempts Google First, Falls back cleanly)
  // --------------------------------------------------------------------------
  const initGoogleMaps = useCallback(async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      // No key provided; use MapLibre directly without console warnings
      initMapLibre();
      return;
    }

    try {
      setOptions({
        key: apiKey,
        v: 'weekly'
      });

      const { Map } = await importLibrary('maps');
      if (!mapContainerRef.current) return;

      const map = new Map(mapContainerRef.current, {
        center: { lat: safeTxn.toLat, lng: safeTxn.toLng },
        zoom: initialZoom,
        mapId: import.meta.env.VITE_GOOGLE_MAP_ID || 'monetrax_dark_vector',
        gestureHandling: 'cooperative',
        disableDefaultUI: true,
        backgroundColor: '#050706'
      });

      googleMapInstanceRef.current = map;
      setProvider('google');

      // Add Circle
      googleCircleRef.current = new google.maps.Circle({
        strokeColor: '#E5484D',
        strokeOpacity: 0.85,
        strokeWeight: 1.8,
        fillColor: '#E5484D',
        fillOpacity: 0.16,
        map,
        center: { lat: safeTxn.toLat, lng: safeTxn.toLng },
        radius: 500
      });

      // Add Polyline
      googlePolylineRef.current = new google.maps.Polyline({
        path: [
          { lat: safeTxn.fromLat, lng: safeTxn.fromLng },
          { lat: safeTxn.toLat, lng: safeTxn.toLng }
        ],
        geodesic: true,
        strokeColor: '#C4D2C8',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map
      });

      // Advanced Marker or Standard Marker
      try {
        const { AdvancedMarkerElement } = await importLibrary('marker');
        const pinContent = document.createElement('div');
        pinContent.className = 'monetrax-google-pin';
        pinContent.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-red-500/30 animate-ping"></span>
            <span class="relative w-4 h-4 rounded-full bg-[#E5484D] border-2 border-white shadow-xl"></span>
            <div class="absolute -top-7 px-2.5 py-0.5 rounded-full bg-[#0B0F0D]/90 border border-white/20 text-[10px] font-mono text-white shadow-xl whitespace-nowrap backdrop-blur-md">
              Case #${safeTxn.id}
            </div>
          </div>
        `;
        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: safeTxn.toLat, lng: safeTxn.toLng },
          title: `Case #${safeTxn.id}`,
          content: pinContent
        });
        googleMarkersRef.current.push(marker);
      } catch (markerErr) {
        const marker = new google.maps.Marker({
          position: { lat: safeTxn.toLat, lng: safeTxn.toLng },
          map,
          title: `Case #${safeTxn.id}`
        });
        googleMarkersRef.current.push(marker);
      }

      if (onControllerReady) {
        onControllerReady({
          flyTo: (lat, lng, zoom) => {
            map.panTo({ lat, lng });
            map.setZoom(zoom);
          },
          setZoom: (z) => map.setZoom(z),
          getZoom: () => map.getZoom() || 15,
          fitBounds: (points) => {
            const bounds = new google.maps.LatLngBounds();
            points.forEach(p => bounds.extend(p));
            map.fitBounds(bounds, 80);
          },
          setStyle: (st) => {
            setCurrentStyle(st);
            if (st === 'satellite') map.setMapTypeId('satellite');
            else if (st === 'hybrid') map.setMapTypeId('hybrid');
            else map.setMapTypeId('roadmap');
          },
          setLayersVisible: (lyrs) => {
            setLayers(lyrs);
          },
          destroy: () => {
            // Clean up
          }
        });
      }
    } catch (err) {
      console.warn('Google Maps JS API load failed, switching to MapLibre GL fallback:', err);
      initMapLibre();
    }
  }, [initialZoom, onControllerReady, safeTxn, initMapLibre]);

  // Initialize on mount
  useEffect(() => {
    initGoogleMaps();

    return () => {
      if (cometAnimRef.current) {
        cancelAnimationFrame(cometAnimRef.current);
        cometAnimRef.current = null;
      }
      if (cometMarkerRef.current) {
        cometMarkerRef.current.remove();
        cometMarkerRef.current = null;
      }
      hopMarkersRef.current.forEach(m => m.remove());
      hopMarkersRef.current = [];
      hopChipsRef.current = [];
      mapLibreMarkersRef.current.forEach(m => m.remove());
      mapLibreMarkersRef.current = [];
      if (mapLibreInstanceRef.current) {
        mapLibreInstanceRef.current.remove();
        mapLibreInstanceRef.current = null;
      }
    };
  }, [safeTxn.id]);

  // Ensure map canvas properly calculates size when becoming visible
  useEffect(() => {
    if (isMapVisible) {
      const timer = setTimeout(() => {
        if (mapLibreInstanceRef.current) {
          mapLibreInstanceRef.current.resize();
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isMapVisible]);

  // Handle Focus changes (Destination / Origin / Both)
  const handleFocusChange = (focus: DiveFocus) => {
    setCurrentFocus(focus);

    if (provider === 'maplibre' && mapLibreInstanceRef.current) {
      const map = mapLibreInstanceRef.current;
      if (focus === 'destination') {
        map.flyTo({ center: [safeTxn.toLng, safeTxn.toLat], zoom: 15, duration: 1200 });
      } else if (focus === 'origin') {
        map.flyTo({ center: [safeTxn.fromLng, safeTxn.fromLat], zoom: 14, duration: 1200 });
      } else if (focus === 'both') {
        const { hops } = generateAccountChain(safeTxn);
        const bounds = new maplibregl.LngLatBounds();
        hops.forEach(h => bounds.extend([h.lng, h.lat]));
        map.fitBounds(bounds, { padding: 90, duration: 1200 });
      }
    } else if (provider === 'google' && googleMapInstanceRef.current) {
      const map = googleMapInstanceRef.current;
      if (focus === 'destination') {
        map.panTo({ lat: safeTxn.toLat, lng: safeTxn.toLng });
        map.setZoom(15);
      } else if (focus === 'origin') {
        map.panTo({ lat: safeTxn.fromLat, lng: safeTxn.fromLng });
        map.setZoom(14);
      } else if (focus === 'both') {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: safeTxn.fromLat, lng: safeTxn.fromLng });
        bounds.extend({ lat: safeTxn.toLat, lng: safeTxn.toLng });
        map.fitBounds(bounds, 80);
      }
    }
  };

  // Handle Style change (Roadmap / Hybrid / Satellite)
  const handleStyleChange = (style: MapStyle) => {
    setCurrentStyle(style);
    if (provider === 'maplibre' && mapLibreInstanceRef.current) {
      const map = mapLibreInstanceRef.current;
      map.setStyle(MAPLIBRE_STYLES[style] as any);
      map.once('style.load', () => {
        setupMapLibreTracking(map);
      });
    } else if (provider === 'google' && googleMapInstanceRef.current) {
      if (style === 'satellite') googleMapInstanceRef.current.setMapTypeId('satellite');
      else if (style === 'hybrid') googleMapInstanceRef.current.setMapTypeId('hybrid');
      else googleMapInstanceRef.current.setMapTypeId('roadmap');
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (provider === 'maplibre' && mapLibreInstanceRef.current) {
      mapLibreInstanceRef.current.zoomIn();
    } else if (provider === 'google' && googleMapInstanceRef.current) {
      const current = googleMapInstanceRef.current.getZoom() || 15;
      googleMapInstanceRef.current.setZoom(current + 1);
    }
  };

  const handleZoomOut = () => {
    if (provider === 'maplibre' && mapLibreInstanceRef.current) {
      mapLibreInstanceRef.current.zoomOut();
    } else if (provider === 'google' && googleMapInstanceRef.current) {
      const current = googleMapInstanceRef.current.getZoom() || 15;
      googleMapInstanceRef.current.setZoom(current - 1);
    }
  };

  const handleResetView = () => {
    handleFocusChange('destination');
  };

  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div 
      ref={mapWrapperRef}
      className={`relative w-full h-full bg-[#050706] rounded-[24px] overflow-hidden border border-[var(--line)] ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Actual Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ opacity: isMapVisible ? 1 : 0 }}
      />

      {/* TOP HEADER CONTROLS & DISCLAIMER BAR */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Simulated Location Disclaimer + Distance */}
        <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
          {/* Simulated Notice */}
          <div className="px-3 py-1 rounded-full bg-[#0B0F0D]/90 border border-amber-500/40 text-amber-300 text-[11px] font-mono flex items-center gap-1.5 shadow-lg backdrop-blur-md">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Simulated location — not a real transaction</span>
          </div>

          {/* Provider Badge */}
          <div className="px-2.5 py-1 rounded-full bg-[#0B0F0D]/90 border border-[var(--line)] text-[10px] font-mono text-[var(--muted)] flex items-center gap-1.5 shadow-md backdrop-blur-md">
            <span className={`w-1.5 h-1.5 rounded-full ${provider === 'google' ? 'bg-[var(--live)]' : 'bg-[var(--sage-2)]'} animate-pulse`} />
            <span>{provider === 'google' ? 'Google Maps Vector' : 'Fallback Map (MapLibre GL)'}</span>
          </div>

          {/* Corridor Distance */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0B0F0D]/90 border border-[var(--line)] text-[10px] font-mono text-[var(--sage-3)] shadow-md backdrop-blur-md">
            <Compass className="w-3 h-3 text-[var(--sage-2)]" />
            <span>{safeTxn.fromCity} ➔ {safeTxn.toCity} ({distance.km.toLocaleString()} km / {distance.miles.toLocaleString()} mi)</span>
          </div>
        </div>

        {/* Right: Layer Toggles (Nearby Accounts, Branches) */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#0B0F0D]/90 p-1 rounded-full border border-[var(--line)] shadow-lg backdrop-blur-md">
          {tileErrorOccurred && (
            <div className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px] font-mono flex items-center gap-1 shadow-md mr-1">
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Map tiles unavailable, retrying</span>
            </div>
          )}
          <button
            onClick={() => setLayers(l => ({ ...l, nearbyAccounts: !l.nearbyAccounts }))}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 transition-all ${
              layers.nearbyAccounts 
                ? 'bg-white/10 text-white font-medium border border-white/20' 
                : 'text-[var(--muted)] hover:text-white'
            }`}
            title="Toggle simulated nearby beneficiary accounts"
          >
            <UserCheck className="w-3 h-3 text-[var(--sage-2)]" />
            <span>Nearby Accounts</span>
          </button>

          <button
            onClick={() => setLayers(l => ({ ...l, bankBranches: !l.bankBranches }))}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 transition-all ${
              layers.bankBranches 
                ? 'bg-white/10 text-white font-medium border border-white/20' 
                : 'text-[var(--muted)] hover:text-white'
            }`}
            title="Toggle simulated clearing bank branches"
          >
            <Building2 className="w-3 h-3 text-[var(--live)]" />
            <span>Branches</span>
          </button>
        </div>
      </div>

      {/* BOTTOM-LEFT: FLOATING GLASS NAVIGATION TOOLBAR & CONTROLS */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto max-w-[calc(100%-420px)]">
        {/* Style & Focus Control Bar */}
        <div className="flex items-center gap-2 bg-[#0B0F0D]/90 border border-white/15 p-1 rounded-full shadow-2xl backdrop-blur-md">
          {/* Focus Toggle (Origin / Destination / Both) */}
          <div className="flex items-center gap-1 pr-1 border-r border-white/10">
            <button
              onClick={() => handleFocusChange('destination')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                currentFocus === 'destination' ? 'bg-[var(--risk-red)] text-white font-medium shadow' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              Destination
            </button>
            <button
              onClick={() => handleFocusChange('origin')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                currentFocus === 'origin' ? 'bg-[var(--risk-amber)] text-white font-medium shadow' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              Origin
            </button>
            <button
              onClick={() => handleFocusChange('both')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                currentFocus === 'both' ? 'bg-white text-black font-medium shadow' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              Both (Corridor)
            </button>
          </div>

          {/* Map Style Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStyleChange('roadmap')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                currentStyle === 'roadmap' ? 'bg-white/20 text-white font-medium' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => handleStyleChange('hybrid')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                currentStyle === 'hybrid' ? 'bg-white/20 text-white font-medium' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => handleStyleChange('satellite')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                currentStyle === 'satellite' ? 'bg-white/20 text-white font-medium' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>

        {/* Zoom & Utility Actions Bar */}
        <div className="flex items-center gap-1.5 bg-[#0B0F0D]/90 border border-white/15 p-1 rounded-full shadow-2xl backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-white/15 mx-0.5" />
          <button
            onClick={handleResetView}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/10 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Gesture Hint */}
        <div className="hidden lg:flex items-center gap-1.5 text-[9px] font-mono text-[var(--muted)] bg-[#0B0F0D]/80 px-2.5 py-1 rounded-full border border-[var(--line)] backdrop-blur-sm pointer-events-none">
          <Info className="w-3 h-3 text-[var(--sage-2)]" />
          <span>Ctrl + scroll to zoom</span>
        </div>
      </div>

      {/* POPUP MODAL FOR CLICKED NEARBY ENTITY */}
      {activeNearbyEntity && (
        <div className="absolute top-16 left-4 z-20 w-80 glass-panel p-4 border border-white/20 shadow-2xl bg-[#0B0F0D]/95 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
            <span className="text-xs font-mono font-medium text-white flex items-center gap-1.5">
              {'entityName' in activeNearbyEntity ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-[var(--sage-2)]" />
                  <span>Nearby Account Entity</span>
                </>
              ) : (
                <>
                  <Building2 className="w-3.5 h-3.5 text-[var(--live)]" />
                  <span>Bank Branch</span>
                </>
              )}
            </span>
            <button
              onClick={() => setActiveNearbyEntity(null)}
              className="text-[var(--muted)] hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            {'entityName' in activeNearbyEntity ? (
              <>
                <div className="font-medium text-white text-sm">
                  {activeNearbyEntity.entityName}
                </div>
                <div className="flex justify-between text-[var(--muted)] font-mono text-[11px]">
                  <span>Account ID:</span>
                  <span className="text-white">{activeNearbyEntity.id}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)] font-mono text-[11px]">
                  <span>Entity Classification:</span>
                  <span className="text-[var(--sage-3)]">{activeNearbyEntity.type}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)] font-mono text-[11px]">
                  <span>Perimeter Distance:</span>
                  <span className="text-white">{activeNearbyEntity.distanceMeters}m from centroid</span>
                </div>
                <div className="flex justify-between text-[var(--muted)] font-mono text-[11px]">
                  <span>Risk Score:</span>
                  <span className={`font-bold ${activeNearbyEntity.riskScore >= 70 ? 'text-[var(--risk-red)]' : 'text-[var(--risk-amber)]'}`}>
                    {activeNearbyEntity.riskScore}/100
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      navigate(`/account/${activeNearbyEntity.id}`);
                    }}
                    className="w-full pill-btn-primary text-xs flex items-center justify-center gap-1.5 py-1.5"
                  >
                    <span>View Account 360</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="font-medium text-white text-sm">
                  {activeNearbyEntity.name}
                </div>
                <div className="flex justify-between text-[var(--muted)] font-mono text-[11px]">
                  <span>BIC / SWIFT:</span>
                  <span className="text-white">{activeNearbyEntity.bic}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)] font-mono text-[11px]">
                  <span>Address:</span>
                  <span className="text-[var(--sage-3)]">{activeNearbyEntity.address}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)] font-mono text-[11px]">
                  <span>Perimeter Distance:</span>
                  <span className="text-white">{activeNearbyEntity.distanceMeters}m from centroid</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
