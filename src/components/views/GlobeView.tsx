import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useAMLStore } from '../../store/useAMLStore';
import { 
  Globe2, 
  RotateCcw, 
  ShieldAlert, 
  ArrowRight, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  MapPin,
  Compass,
  FileText,
  CheckCircle2,
  FastForward,
  ChevronLeft
} from 'lucide-react';
import { Transaction } from '../../types';
import { pageVariants } from '../common/MotionComponents';
import { COUNTRIES } from '../../data/mockSeed';
import { DiveMapContainer } from '../map/DiveMapContainer';
import { 
  UnifiedMapController, 
  calculateHaversineDistance,
  generateAccountChain,
  LiveTrackingStatus,
  AccountHop
} from '../map/types';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { 
  sanitizeTransactionCoordinates, 
  resolveLocationCoordinates 
} from '../../utils/coordinateResolver';

// Convert Lat/Lng to 3D Sphere coordinates with guaranteed valid numbers
export function latLngToVector3(lat?: number, lng?: number, radius = 2.0): THREE.Vector3 {
  const safe = resolveLocationCoordinates(undefined, undefined, lat, lng);
  const phi = (90 - safe.lat) * (Math.PI / 180);
  const theta = (safe.lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// 3D Earth Sphere Component
function EarthSphere({ isRotating }: { isRotating: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (isRotating && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[2.0, 48, 48]} />
        <meshStandardMaterial
          color="#0B100E"
          roughness={0.7}
          metalness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.008, 24, 18]} />
        <meshBasicMaterial
          color="var(--sage-2)"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}

// Pre-allocated temporary vectors to prevent garbage collection pauses during animation frames
const _tempVec = new THREE.Vector3();
const _cameraDesiredPos = new THREE.Vector3();
const _cameraLookAtPos = new THREE.Vector3();
const TRAIL_POOL_SIZE = 10; // Fixed small number of trailing points (8-12)

interface TransactionArcProps {
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  color?: string;
  isHighlighted?: boolean;
  isFlyingTo?: boolean;
}

// Animated Bezier Arc between Origin and Destination with Pooled Traveling Comet Trail
const TransactionArc: React.FC<TransactionArcProps> = React.memo(({ 
  fromPos, 
  toPos, 
  color = '#FF6B6B', 
  isHighlighted = false,
  isFlyingTo = false
}) => {
  const particleRef = useRef<THREE.Mesh>(null);
  const trailRefs = useRef<(THREE.Mesh | null)[]>([]);
  const flyStartRef = useRef<number | null>(null);
  const flightCompleteRef = useRef<boolean>(false);

  // Compute curve once for given fromPos & toPos
  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
    const distance = fromPos.distanceTo(toPos);
    mid.normalize().multiplyScalar(2.0 + Math.min(1.0, distance * 0.35));
    return new THREE.QuadraticBezierCurve3(fromPos, mid, toPos);
  }, [fromPos, toPos]);

  // Pre-calculate line points once
  const points = useMemo(() => curve.getPoints(36), [curve]);

  // Reusable geometries created once
  const headGeom = useMemo(() => new THREE.SphereGeometry(isHighlighted ? 0.042 : 0.022, 12, 12), [isHighlighted]);
  const trailGeom = useMemo(() => new THREE.SphereGeometry(0.028, 8, 8), []);

  // Pre-allocated material pool with decaying opacity for trail
  const trailMaterials = useMemo(() => {
    const c = new THREE.Color(color);
    return Array.from({ length: TRAIL_POOL_SIZE }, (_, i) => {
      const falloff = 1 - (i + 1) / (TRAIL_POOL_SIZE + 1);
      return new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        opacity: Math.max(0.08, 0.75 * falloff),
        depthWrite: false
      });
    });
  }, [color]);

  // Clean disposal of geometries and materials on unmount
  useEffect(() => {
    return () => {
      headGeom.dispose();
      trailGeom.dispose();
      trailMaterials.forEach(m => m.dispose());
    };
  }, [headGeom, trailGeom, trailMaterials]);

  useEffect(() => {
    if (isFlyingTo) {
      flyStartRef.current = null;
      flightCompleteRef.current = false;
      trailRefs.current.forEach((m) => {
        if (m) m.visible = true;
      });
    } else {
      flightCompleteRef.current = false;
      if (!isHighlighted) {
        trailRefs.current.forEach((m) => {
          if (m) m.visible = false;
        });
      }
    }
  }, [isFlyingTo, isHighlighted]);

  useFrame(({ clock }) => {
    if (!particleRef.current) return;

    let t = 0;
    if (isFlyingTo) {
      if (flightCompleteRef.current) return;

      if (flyStartRef.current === null) {
        flyStartRef.current = clock.getElapsedTime();
      }
      const elapsed = clock.getElapsedTime() - flyStartRef.current;
      const rawT = Math.min(1.0, elapsed / 1.8);
      // easeInOutCubic
      t = rawT < 0.5 
        ? 4 * rawT * rawT * rawT 
        : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

      if (rawT >= 1.0) {
        flightCompleteRef.current = true;
        // Hide trail points upon flight arrival to avoid accumulating active meshes
        trailRefs.current.forEach((m) => {
          if (m) m.visible = false;
        });
        return;
      }
    } else if (isHighlighted) {
      t = (clock.getElapsedTime() * 0.45) % 1.0;
    } else {
      t = (clock.getElapsedTime() * 0.28) % 1.0;
    }

    // Direct object mutation without allocations
    curve.getPoint(t, _tempVec);
    particleRef.current.position.set(_tempVec.x, _tempVec.y, _tempVec.z);

    // Update pooled trail points directly via Three.js mutation
    if (isFlyingTo || isHighlighted) {
      for (let i = 0; i < TRAIL_POOL_SIZE; i++) {
        const mesh = trailRefs.current[i];
        if (!mesh) continue;

        const trailT = Math.max(0, t - (i + 1) * 0.016);
        curve.getPoint(trailT, _tempVec);
        mesh.position.set(_tempVec.x, _tempVec.y, _tempVec.z);

        const scale = Math.max(0.2, 1.0 - (i / TRAIL_POOL_SIZE) * 0.65);
        mesh.scale.set(scale, scale, scale);
        mesh.visible = true;
      }
    }
  });

  return (
    <group>
      <Line
        points={points}
        color={isHighlighted ? '#FFFFFF' : color}
        lineWidth={isHighlighted ? 2.5 : 1.2}
        transparent
        opacity={isHighlighted ? 0.95 : 0.35}
      />
      {/* Comet Head */}
      <mesh ref={particleRef} geometry={headGeom}>
        <meshBasicMaterial color={isHighlighted ? '#FFFFFF' : color} />
      </mesh>
      {/* Pooled Comet Trail Array (fixed 10 points) */}
      {(isHighlighted || isFlyingTo) && (
        <group>
          {Array.from({ length: TRAIL_POOL_SIZE }).map((_, i) => (
            <mesh
              key={i}
              ref={(el) => (trailRefs.current[i] = el)}
              geometry={trailGeom}
              material={trailMaterials[i]}
              visible={false}
            />
          ))}
        </group>
      )}
    </group>
  );
});

// 3D Flagged Marker
const FlaggedMarker: React.FC<{ 
  position: THREE.Vector3; 
  riskScore: number; 
  isSelected: boolean; 
  onClick: () => void;
}> = React.memo(({ 
  position, 
  riskScore, 
  isSelected, 
  onClick 
}) => {
  const color = riskScore >= 70 ? '#FF6B6B' : '#FFAE42';
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ camera, clock }) => {
    if (!groupRef.current) return;
    // Distance attenuation scale: scale = base * (distance / referenceDistance)
    // Keeps markers crisp and constant on screen, preventing giant distorted blobs when camera dives close
    const dist = camera.position.distanceTo(position);
    const scale = Math.min(1.15, Math.max(0.30, dist / 4.6));
    groupRef.current.scale.set(scale, scale, scale);

    if (isSelected && ringRef.current) {
      const s = 1.0 + Math.sin(clock.getElapsedTime() * 5) * 0.22;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh>
        <sphereGeometry args={[isSelected ? 0.052 : 0.035, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.045, isSelected ? 0.095 : 0.065, 20]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.85 : 0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
});

// 3D Country Heatmap Ring
function CountryHeatmapRing({
  lat,
  lng,
  flaggedCount,
  riskLevel
}: {
  lat: number;
  lng: number;
  flaggedCount: number;
  riskLevel: 'High' | 'Medium' | 'Low';
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const position = useMemo(() => latLngToVector3(lat, lng, 2.015), [lat, lng]);
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const color = riskLevel === 'High' ? '#E5484D' : riskLevel === 'Medium' ? '#E8A33D' : '#7F9488';
  const radius = 0.08 + (flaggedCount / 80) * 0.15;

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    }
  }, [normal]);

  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[radius * 0.4, radius, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Camera Fly-To Controller with smooth easing, distance clamping & zero frame allocations
function CameraController({ 
  targetPos, 
  isFlying 
}: { 
  targetPos: THREE.Vector3 | null; 
  isFlying: boolean;
}) {
  const defaultPos = useMemo(() => new THREE.Vector3(0, 0, 5.0), []);
  const defaultLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame(({ camera }) => {
    if (isFlying && targetPos && targetPos.lengthSq() > 0.01 && !Number.isNaN(targetPos.x)) {
      _cameraDesiredPos.copy(targetPos).normalize().multiplyScalar(3.15);
      camera.position.lerp(_cameraDesiredPos, 0.06);

      // Enforce camera distance clamp (min 2.38) so camera can NEVER penetrate or touch the globe surface (2.0)
      const minDistance = 2.38;
      if (camera.position.length() < minDistance) {
        camera.position.normalize().multiplyScalar(minDistance);
      }

      _cameraLookAtPos.copy(targetPos).multiplyScalar(0.4);
      camera.lookAt(_cameraLookAtPos);
    } else if (!isFlying) {
      // Smoothly restore default view if camera drifted
      if (camera.position.distanceTo(defaultPos) > 0.05) {
        camera.position.lerp(defaultPos, 0.06);
        camera.lookAt(defaultLookAt);
      }
    }

    if (typeof window !== 'undefined') {
      (window as any).__THREE_CAMERA_TELEMETRY = {
        distance: camera.position.length(),
        position: [camera.position.x, camera.position.y, camera.position.z],
        near: (camera as any).near,
        far: (camera as any).far,
        isFlying
      };
    }
  });

  return null;
}

// WebGL Support Detector
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

// Error Boundary for Three.js Canvas
class WebGLErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode }, 
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn('WebGL context failed:', err.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// 2D Orthographic Fallback
function RadarFallback({
  flaggedItems,
  focusedTxn,
  onSelectTxn,
  showHeatmap = false
}: {
  flaggedItems: Transaction[];
  focusedTxn?: Transaction | null;
  onSelectTxn: (t: Transaction) => void;
  showHeatmap?: boolean;
}) {
  const project = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 880 + 20;
    const y = ((90 - lat) / 180) * 380 + 20;
    return { x, y };
  };

  return (
    <div className="relative w-full h-full bg-[#080C0A] flex flex-col items-center justify-center overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 920 420" preserveAspectRatio="none">
        <line x1="0" y1="210" x2="920" y2="210" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
        <line x1="460" y1="0" x2="460" y2="420" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
        <circle cx="460" cy="210" r="130" fill="none" stroke="rgba(127, 148, 136, 0.12)" />
        <circle cx="460" cy="210" r="220" fill="none" stroke="rgba(127, 148, 136, 0.08)" />
      </svg>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 920 420">
        {showHeatmap && COUNTRIES.map((c) => {
          const p = project(c.lat, c.lng);
          const color = c.riskLevel === 'High' ? 'var(--risk-red)' : c.riskLevel === 'Medium' ? 'var(--risk-amber)' : 'var(--sage-2)';
          return (
            <circle
              key={c.code}
              cx={p.x}
              cy={p.y}
              r={12 + c.flaggedCount / 3}
              fill={color}
              fillOpacity={0.2}
              stroke={color}
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          );
        })}

        {flaggedItems.map((item) => {
          const p1 = project(item.fromLat, item.fromLng);
          const p2 = project(item.toLat, item.toLng);
          const isSelected = focusedTxn?.id === item.id;
          const color = item.riskScore >= 70 ? 'var(--risk-red)' : 'var(--risk-amber)';
          const midX = (p1.x + p2.x) / 2;
          const midY = Math.min(p1.y, p2.y) - 30;

          return (
            <g key={item.id} className="cursor-pointer" onClick={() => onSelectTxn(item)}>
              <path
                d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                fill="none"
                stroke={isSelected ? '#FFFFFF' : color}
                strokeWidth={isSelected ? 2.5 : 1.2}
                strokeOpacity={isSelected ? 1.0 : 0.6}
              />
              <circle cx={p1.x} cy={p1.y} r={isSelected ? 5 : 3.5} fill={color} />
              <circle cx={p2.x} cy={p2.y} r={isSelected ? 5 : 3.5} fill={color} />
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-3 left-4 text-[10px] text-[var(--muted)] flex items-center gap-2 bg-[#0B0F0D]/90 px-3 py-1 rounded-full border border-[var(--line)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage-2)] animate-pulse" />
        <span>Geospatial Radar Vector Surveillance {showHeatmap ? '(Country Heatmap Active)' : '(Orthographic Fallback Mode)'}</span>
      </div>
    </div>
  );
}

// Sequence Phases:
// 'globe_idle': standard 3D globe idling
// 'flying_globe': 0.0s - 1.8s (globe camera rotates to face coordinates, arc draws)
// 'crossfading': 1.6s - 2.6s (globe scale 1->1.12 & fade out, map zoom 4->15 & fade in)
// 'settled_map': 2.6s - 4.0s+ (settled at zoom 15, 500m circle, marker dropped, side panel open)
type SequencePhase = 'globe_idle' | 'flying_globe' | 'crossfading' | 'settled_map';

/**
 * Single function that owns all scrolling for Fly-to-Location.
 * Resolves the target fresh at call time, checks real container,
 * computes: top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - headerHeight - 16
 * Guards: if the map is already fully in view, does not scroll at all.
 */
export function scrollToMap(force = false) {
  const target = document.getElementById('globe-map-stage');
  if (!target) return;

  // Resolve the real scroll container dynamically
  let container: HTMLElement | null = null;
  let parent = target.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) {
      container = parent;
      break;
    }
    parent = parent.parentElement;
  }

  const header = document.querySelector('header') || document.querySelector('nav');
  const headerHeight = header ? header.getBoundingClientRect().height : 64;
  const targetRect = target.getBoundingClientRect();

  if (!container || container === document.body || container === document.documentElement) {
    // Window / Document root is the active scroll container
    // Check if stage is already fully in view
    const isFullyInView = targetRect.top >= (headerHeight - 10) && targetRect.bottom <= (window.innerHeight + 40);
    if (!force && isFullyInView) return;

    const top = Math.max(0, targetRect.top + window.scrollY - headerHeight - 16);
    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  } else {
    // Inner element scroll container
    const containerRect = container.getBoundingClientRect();
    const isFullyInView = targetRect.top >= containerRect.top && targetRect.bottom <= containerRect.bottom;
    if (!force && isFullyInView) return;

    const top = Math.max(0, targetRect.top - containerRect.top + container.scrollTop - headerHeight - 16);
    container.scrollTo({
      top,
      behavior: 'smooth'
    });
  }
}

interface LiveTrackingPanelBlockProps {
  status: LiveTrackingStatus | null;
}

const LiveTrackingPanelBlock: React.FC<LiveTrackingPanelBlockProps> = React.memo(({ status }) => {
  if (!status) return null;

  const { chain, currentHopIndex, status: trackingState, activeHop } = status;

  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--line)] text-xs space-y-2 mb-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--live)] animate-ping" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--sage-3)] font-semibold">
            Live Corridor Tracking
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
            trackingState === 'Reached Destination'
              ? 'bg-[var(--live)]/20 text-[var(--live)] border-[var(--live)]/40'
              : trackingState === 'Layered'
              ? 'bg-[var(--risk-amber)]/20 text-[var(--risk-amber)] border-[var(--risk-amber)]/40'
              : 'bg-[var(--sage-2)]/20 text-[var(--sage-2)] border-[var(--sage-2)]/40'
          }`}
        >
          {trackingState}
        </span>
      </div>

      {/* Account Chain Steps */}
      <div className="space-y-1.5 pt-1">
        {chain.map((hop, idx) => {
          const isPassed = idx < currentHopIndex;
          const isCurrent = idx === currentHopIndex;

          return (
            <div
              key={hop.id + idx}
              className={`flex items-center justify-between p-1.5 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-white/[0.08] border border-[var(--risk-red)]/50 shadow-sm'
                  : 'bg-white/[0.015] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 ${
                    isPassed
                      ? 'bg-[var(--live)] text-darkCanvas'
                      : isCurrent
                      ? 'bg-[var(--risk-red)] text-white animate-pulse'
                      : 'bg-white/10 text-[var(--muted)]'
                  }`}
                >
                  {isPassed ? '✓' : idx + 1}
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-mono text-[11px] truncate ${
                        isCurrent
                          ? 'text-white font-bold'
                          : isPassed
                          ? 'text-[var(--text)]'
                          : 'text-[var(--muted)]'
                      }`}
                    >
                      {hop.account}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-white/5 text-[var(--muted)] shrink-0 capitalize">
                      {hop.role === 'intermediary' ? 'Layering' : hop.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] truncate">
                    {hop.city} • {hop.bank}
                  </span>
                </div>
              </div>

              {isCurrent && (
                <span className="text-[9px] font-mono text-[var(--risk-red)] font-semibold shrink-0 ml-2 animate-pulse">
                  ACTIVE
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-[var(--muted)] font-mono">
        <span>Active Node:</span>
        <span className="text-[var(--sage-2)] truncate max-w-[170px]">
          {activeHop ? `${activeHop.entityName}` : 'Analyzing route...'}
        </span>
      </div>
    </div>
  );
});

export const GlobeView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const transactions = useAMLStore((s) => s.transactions);
  const selectedTxnId = useAMLStore((s) => s.selectedTxnId);
  const selectTxn = useAMLStore((s) => s.selectTxn);
  const flyToCaseId = useAMLStore((s) => s.flyToCaseId);
  const clearFlyTo = useAMLStore((s) => s.clearFlyTo);
  const updateCaseStatus = useAMLStore((s) => s.updateCaseStatus);
  const addToast = useAMLStore((s) => s.addToast);

  // Filters & Toggles
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'medium'>('all');
  const [typologyFilter, setTypologyFilter] = useState<string>('all');
  const [isZoomActive, setIsZoomActive] = useState<boolean>(false);
  const [isHeatmapActive, setIsHeatmapActive] = useState<boolean>(false);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  // Map Dive Sequence States
  const [sequencePhase, setSequencePhase] = useState<SequencePhase>('globe_idle');
  const [activeSidePanelTxn, setActiveSidePanelTxn] = useState<Transaction | null>(null);
  const mapControllerRef = useRef<UnifiedMapController | null>(null);
  const sequenceTimersRef = useRef<NodeJS.Timeout[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const sidePanelRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(sidePanelRef, () => {
    if (sequencePhase === 'settled_map') {
      handleBackToGlobe();
    }
  }, { enabled: sequencePhase === 'settled_map' });

  // Check WebGL on mount
  useEffect(() => {
    setHasWebGL(checkWebGLSupport());
  }, []);

  // Filtered flagged cases
  const flaggedItems = useMemo(() => {
    return transactions.filter((t) => {
      if (t.riskScore < 40) return false;
      if (riskFilter === 'critical' && t.riskScore < 70) return false;
      if (riskFilter === 'medium' && (t.riskScore < 40 || t.riskScore >= 70)) return false;
      if (typologyFilter !== 'all' && t.typology !== typologyFilter) return false;
      return true;
    }).slice(0, 30);
  }, [transactions, riskFilter, typologyFilter]);

  // Memoize stable 3D coordinates for all flagged items to prevent re-allocating vectors on each render
  const arcItems = useMemo(() => {
    return flaggedItems.map((item) => ({
      item,
      fromPos: latLngToVector3(item.fromLat, item.fromLng, 2.0),
      toPos: latLngToVector3(item.toLat, item.toLng, 2.0),
      color: item.riskScore >= 70 ? '#FF6B6B' : '#FFAE42'
    }));
  }, [flaggedItems]);

  // Target transaction from URL, store, or active side panel
  const urlCaseId = searchParams.get('case') || searchParams.get('flyTo');
  const urlView = searchParams.get('view');

  const focusedTxn = useMemo(() => {
    const targetId = urlCaseId || activeSidePanelTxn?.id || flyToCaseId || selectedTxnId;
    let rawTxn = transactions.find(t => t.id === targetId);
    if (!rawTxn && targetId) {
      rawTxn = transactions.find(t => t.id.includes(targetId) || t.toCity.toLowerCase() === targetId.toLowerCase());
    }
    const resolved = rawTxn || flaggedItems[0] || transactions[0];
    return resolved ? sanitizeTransactionCoordinates(resolved) : null;
  }, [urlCaseId, activeSidePanelTxn?.id, flyToCaseId, selectedTxnId, transactions, flaggedItems]);

  const targetVector = useMemo(() => {
    if (focusedTxn) {
      return latLngToVector3(focusedTxn.toLat, focusedTxn.toLng, 2.0);
    }
    return null;
  }, [focusedTxn?.id, focusedTxn?.toLat, focusedTxn?.toLng]);

  // Distance calculation (Haversine)
  const corridorDistance = useMemo(() => {
    if (!focusedTxn) return { km: 0, miles: 0 };
    return calculateHaversineDistance(
      focusedTxn.fromLat,
      focusedTxn.fromLng,
      focusedTxn.toLat,
      focusedTxn.toLng
    );
  }, [focusedTxn?.id]);

  // Clear all pending animation timers
  const clearSequenceTimers = () => {
    sequenceTimersRef.current.forEach(t => clearTimeout(t));
    sequenceTimersRef.current = [];
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  // Run the 4-second sequence
  const startDiveSequence = useCallback((targetCase: Transaction) => {
    clearSequenceTimers();
    const safeCase = sanitizeTransactionCoordinates(targetCase);
    setActiveSidePanelTxn(safeCase);
    selectTxn(safeCase.id);

    // Phase 1: 0.0s - 1.8s Flying Globe
    setSequencePhase('flying_globe');

    // Phase 2: 1.6s - 2.6s Cross-fade & Map Zoom Animation (4 -> 15)
    const tCrossfade = setTimeout(() => {
      setSequencePhase('crossfading');

      // Animate map zoom from 4 to 15 over 1000ms using easeInOut
      const startTime = performance.now();
      const startZoom = 4;
      const targetZoom = 15;
      const duration = 1000;

      const animateZoom = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // easeInOutCubic
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const currentZ = startZoom + (targetZoom - startZoom) * ease;

        if (mapControllerRef.current) {
          mapControllerRef.current.setZoom(currentZ);
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animateZoom);
        }
      };

      animFrameRef.current = requestAnimationFrame(animateZoom);
    }, 1600);

    // Phase 3: 2.6s - 4.0s Settle on Location, Drop Pulsed Marker, Slide Side Panel
    const tSettle = setTimeout(() => {
      setSequencePhase('settled_map');
      if (mapControllerRef.current) {
        mapControllerRef.current.setZoom(15);
      }
    }, 2600);

    // Phase 4: Deterministic 3.0s hard max watchdog (guarantees handoff to satellite map)
    const tWatchdog = setTimeout(() => {
      setSequencePhase((current) => {
        if (current !== 'settled_map') {
          return 'settled_map';
        }
        return current;
      });
      if (mapControllerRef.current) {
        mapControllerRef.current.setZoom(15);
      }
    }, 3000);

    sequenceTimersRef.current.push(tCrossfade, tSettle, tWatchdog);
  }, [selectTxn]);

  // Skip Animation to Settled Map immediately
  const handleSkipAnimation = useCallback(() => {
    clearSequenceTimers();
    setSequencePhase('settled_map');
    if (mapControllerRef.current) {
      mapControllerRef.current.setZoom(15);
    }
  }, []);

  // Back to Globe: Reverse crossfade back to 3D Globe
  const handleBackToGlobe = useCallback(() => {
    clearSequenceTimers();
    // Reverse crossfade
    setSequencePhase('crossfading');
    setTimeout(() => {
      setSequencePhase('globe_idle');
      setActiveSidePanelTxn(null);
      clearFlyTo();
      // Sync URL back to /globe
      setSearchParams({});
    }, 600);
  }, [clearFlyTo, setSearchParams]);

  // Keyboard shortcut: Esc skips animation or exits side panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sequencePhase === 'flying_globe' || sequencePhase === 'crossfading') {
          handleSkipAnimation();
        } else if (sequencePhase === 'settled_map') {
          handleBackToGlobe();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequencePhase, handleSkipAnimation, handleBackToGlobe]);

  // Live Corridor Tracking State
  const [trackingStatus, setTrackingStatus] = useState<LiveTrackingStatus | null>(null);

  // Initialize tracking status when focusedTxn changes
  useEffect(() => {
    if (focusedTxn) {
      const { hops } = generateAccountChain(focusedTxn);
      setTrackingStatus({
        currentHopIndex: 0,
        status: 'In Transit',
        activeHop: hops[0],
        nextHop: hops[1],
        chain: hops
      });
    } else {
      setTrackingStatus(null);
    }
  }, [focusedTxn?.id]);

  // Monitor URL parameters: /globe?case=ID&view=map or /globe?flyTo=ID triggers sequence automatically
  useEffect(() => {
    const isMapRequested = urlView === 'map' || !!searchParams.get('flyTo') || !!searchParams.get('case');
    if (isMapRequested && urlCaseId) {
      let match = transactions.find(t => t.id === urlCaseId);
      if (!match) {
        match = transactions.find(t => t.id.includes(urlCaseId) || t.toCity.toLowerCase() === urlCaseId.toLowerCase()) || flaggedItems[0] || transactions[0];
      }
      if (match) {
        if (sequencePhase === 'globe_idle' || activeSidePanelTxn?.id !== match.id) {
          startDiveSequence(sanitizeTransactionCoordinates(match));
        }
      }
    } else if (!urlView && !searchParams.get('flyTo') && sequencePhase === 'settled_map') {
      // Browser Back pressed
      handleBackToGlobe();
    }
  }, [urlView, urlCaseId, searchParams, transactions, sequencePhase, activeSidePanelTxn?.id, startDiveSequence, handleBackToGlobe, flaggedItems]);

  // Trigger Fly-To from UI table or markers
  const triggerFlyToSequence = useCallback((txn: Transaction) => {
    setSearchParams({ case: txn.id, view: 'map' });
    startDiveSequence(txn);
  }, [setSearchParams, startDiveSequence]);

  // Scroll to map stage after layout updates (single source of truth for scrolling)
  // Runs after render paint; no-ops if map is already fully in view
  useEffect(() => {
    if (!focusedTxn || sequencePhase === 'globe_idle') return;
    const rafId = requestAnimationFrame(() => {
      scrollToMap();
    });
    return () => cancelAnimationFrame(rafId);
  }, [focusedTxn?.id, sequencePhase]);

  const handleClearAlert = (txnId: string) => {
    updateCaseStatus(txnId, 'Cleared', 'Alert cleared from 3D Globe Map view.');
  };

  const handleGenerateSAR = (txn: Transaction) => {
    addToast('SAR Auto-Drafted', `SAR filing generated for Case #${txn.id} (${txn.typologyLabel}).`, 'success');
    navigate('/sar');
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex flex-col gap-8 pb-16"
    >
      {/* =========================================================================
          STAGE CONTAINER: 3D GLOBE <-> REAL MAP CROSS-FADE STAGE
          Fills remaining viewport height (zero scrolling needed)
          ========================================================================= */}
      <div 
        id="globe-map-stage"
        className="relative w-full h-[calc(100vh-140px)] min-h-[580px] rounded-[16px] fintech-card overflow-hidden border border-white/[0.08] shadow-2xl"
      >
        
        {/* Floating Glass Header & Controls Bar Overlay on Globe Stage */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-col md:flex-row md:items-center justify-between gap-3 pointer-events-none">
          <div className="fintech-card px-4 py-2 border border-white/10 shadow-lg pointer-events-auto flex items-center gap-3 backdrop-blur-xl bg-[#141417]/90 rounded-full">
            <h2 className="text-base font-medium text-white tracking-tight">
              Global Surveillance Globe
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E5484D]/20 text-[#E5484D] font-mono font-medium border border-[#E5484D]/30">
              {flaggedItems.length} Vectors Active
            </span>
          </div>

          {/* Action Controls & Filters in floating glass pills */}
          <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
            {sequencePhase !== 'globe_idle' && (
              <button
                onClick={handleBackToGlobe}
                className="pill-btn-primary text-xs flex items-center gap-1.5 shadow-lg"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to 3D Globe</span>
              </button>
            )}

            {sequencePhase === 'globe_idle' && (
              <>
                <button
                  onClick={() => setIsZoomActive(!isZoomActive)}
                  className={`pill-btn-secondary text-xs flex items-center gap-1.5 shadow-lg ${isZoomActive ? 'bg-white text-black font-medium' : ''}`}
                  title="Enable or disable mouse-wheel zoom on 3D globe"
                >
                  {isZoomActive ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5 text-[var(--caption)]" />}
                  <span>{isZoomActive ? 'Zoom Active' : 'Zoom Off'}</span>
                </button>

                <button
                  onClick={() => setIsHeatmapActive(!isHeatmapActive)}
                  className={`pill-btn-secondary text-xs flex items-center gap-1.5 shadow-lg ${isHeatmapActive ? 'bg-white text-black font-medium' : ''}`}
                  title="Toggle country risk density heatmap"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isHeatmapActive ? 'Heatmap: Active' : 'Country Heatmap'}</span>
                </button>

                <div className="p-1 flex items-center gap-1 shadow-lg bg-[#141417]/90 border border-white/10 rounded-full">
                  <button
                    onClick={() => setRiskFilter('all')}
                    className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${riskFilter === 'all' ? 'bg-white text-black font-medium' : 'text-[var(--muted)] hover:text-white'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setRiskFilter('critical')}
                    className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${riskFilter === 'critical' ? 'bg-[#E5484D] text-white font-medium' : 'text-[var(--muted)] hover:text-white'}`}
                  >
                    Critical
                  </button>
                  <button
                    onClick={() => setRiskFilter('medium')}
                    className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${riskFilter === 'medium' ? 'bg-[#F5C04A] text-black font-medium' : 'text-[var(--muted)] hover:text-white'}`}
                  >
                    Medium
                  </button>
                </div>

                <select
                  value={typologyFilter}
                  onChange={(e) => setTypologyFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs text-white bg-[#141417]/90 border border-white/10 rounded-full focus:outline-none cursor-pointer shadow-lg font-sans"
                >
                  <option value="all" className="bg-[#0B0F0D]">All Typologies</option>
                  <option value="structuring" className="bg-[#0B0F0D]">Structuring (&lt;$10k)</option>
                  <option value="cyclic_flow" className="bg-[#0B0F0D]">Cyclic Layering</option>
                  <option value="mule_fan" className="bg-[#0B0F0D]">Mule Network</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Soft atmospheric sage glow behind the stage */}
        <div className="sage-glow-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-35 pointer-events-none" />

        {/* ---------------------------------------------------------------------
            LAYER A: 3D THREE.JS GLOBE (Scales 1 -> 1.12 & Fades 1 -> 0)
            --------------------------------------------------------------------- */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-in-out z-0"
          style={{
            opacity: sequencePhase === 'settled_map' ? 0 : sequencePhase === 'crossfading' ? 0 : 1,
            transform: sequencePhase === 'crossfading' || sequencePhase === 'settled_map' ? 'scale(1.12)' : 'scale(1)',
            pointerEvents: sequencePhase === 'settled_map' ? 'none' : 'auto',
            display: sequencePhase === 'settled_map' ? 'none' : 'block'
          }}
        >
          {hasWebGL ? (
            <WebGLErrorBoundary
              fallback={
                <RadarFallback
                  flaggedItems={flaggedItems}
                  focusedTxn={focusedTxn}
                  onSelectTxn={triggerFlyToSequence}
                  showHeatmap={isHeatmapActive}
                />
              }
            >
              <div className="w-full h-full cursor-grab active:cursor-grabbing">
                <Canvas camera={{ position: [0, 0, 5.0], fov: 45, near: 0.01, far: 1000 }}>
                  <ambientLight intensity={0.4} />
                  <pointLight position={[10, 10, 10]} intensity={1.2} />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} />

                  <CameraController 
                    targetPos={targetVector} 
                    isFlying={sequencePhase !== 'globe_idle'} 
                  />

                  <OrbitControls 
                    enablePan={false} 
                    enableZoom={isZoomActive}
                    minDistance={2.4} 
                    maxDistance={7.5} 
                    dampingFactor={0.05} 
                    rotateSpeed={0.6}
                  />

                  <EarthSphere isRotating={sequencePhase === 'globe_idle'} />

                  {isHeatmapActive && COUNTRIES.map((c) => (
                    <CountryHeatmapRing
                      key={c.code}
                      lat={c.lat}
                      lng={c.lng}
                      flaggedCount={c.flaggedCount}
                      riskLevel={c.riskLevel}
                    />
                  ))}

                  {arcItems.map(({ item, fromPos, toPos, color }) => {
                    const isSelected = focusedTxn?.id === item.id;

                    return (
                      <group key={item.id}>
                        <TransactionArc
                          fromPos={fromPos}
                          toPos={toPos}
                          color={color}
                          isHighlighted={isSelected}
                          isFlyingTo={sequencePhase === 'flying_globe' && isSelected}
                        />
                        <FlaggedMarker
                          position={fromPos}
                          riskScore={item.riskScore}
                          isSelected={isSelected}
                          onClick={() => triggerFlyToSequence(item)}
                        />
                        <FlaggedMarker
                          position={toPos}
                          riskScore={item.riskScore}
                          isSelected={isSelected}
                          onClick={() => triggerFlyToSequence(item)}
                        />
                      </group>
                    );
                  })}
                </Canvas>
              </div>
            </WebGLErrorBoundary>
          ) : (
            <RadarFallback
              flaggedItems={flaggedItems}
              focusedTxn={focusedTxn}
              onSelectTxn={triggerFlyToSequence}
              showHeatmap={isHeatmapActive}
            />
          )}

          {/* Bottom Globe Info Banner */}
          <div className="absolute left-4 bottom-4 pointer-events-none text-xs text-[var(--muted)] font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse" />
            <span>Interactive 3D Stage • Click any vector or list row to trigger camera dive</span>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            LAYER B: REAL MAP (Google Maps Vector / MapLibre GL Fallback)
            Fades in 0 -> 1 & Zoom 4 -> 15
            --------------------------------------------------------------------- */}
        <div 
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out z-10"
          style={{
            opacity: sequencePhase === 'globe_idle' || sequencePhase === 'flying_globe' ? 0 : 1,
            pointerEvents: sequencePhase === 'settled_map' ? 'auto' : 'none',
            display: sequencePhase === 'globe_idle' ? 'none' : 'block'
          }}
        >
          {focusedTxn && (sequencePhase === 'crossfading' || sequencePhase === 'settled_map') && (
            <DiveMapContainer
              transaction={focusedTxn}
              initialZoom={sequencePhase === 'settled_map' ? 15 : 4}
              onControllerReady={(ctl) => {
                mapControllerRef.current = ctl;
              }}
              isMapVisible={sequencePhase === 'crossfading' || sequencePhase === 'settled_map'}
              onTrackingUpdate={setTrackingStatus}
            />
          )}
        </div>

        {/* ---------------------------------------------------------------------
            SKIP ANIMATION PILL (Visible during flying_globe and crossfading)
            --------------------------------------------------------------------- */}
        {(sequencePhase === 'flying_globe' || sequencePhase === 'crossfading') && (
          <div className="absolute top-4 right-4 z-30 animate-fadeIn">
            <button
              onClick={handleSkipAnimation}
              className="px-3.5 py-1.5 rounded-full bg-[#0B0F0D]/90 hover:bg-white hover:text-black border border-white/20 text-xs text-white font-mono flex items-center gap-2 shadow-2xl transition-all backdrop-blur-md"
            >
              <span>Skip Animation</span>
              <span className="px-1 py-0.2 rounded bg-white/20 text-[10px]">Esc</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            GLASS SIDE PANEL (Slides in during settled_map phase 2.6s - 4.0s)
            --------------------------------------------------------------------- */}
        <AnimatePresence>
          {sequencePhase === 'settled_map' && focusedTxn && (
            <motion.div
              ref={sidePanelRef}
              initial={{ x: 380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-4 top-4 bottom-4 z-20 w-80 md:w-96 max-w-[calc(100vw-32px)] rounded-[16px] p-5 border border-white/10 shadow-2xl flex flex-col justify-between bg-[#121215]/95 backdrop-blur-xl"
            >
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#E5484D]" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Case #{focusedTxn.id}
                      </h3>
                      <p className="text-[10px] text-[var(--caption)] font-mono">
                        Perimeter Surveillance Active
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBackToGlobe}
                    className="text-[var(--muted)] hover:text-white p-1 rounded-md transition-colors"
                    title="Back to globe"
                  >
                    ✕
                  </button>
                </div>

                {/* Unified Risk Score */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[var(--muted)]">Unified Risk Score</span>
                    <span className="text-[10px] font-mono text-[var(--brand-orange)]">500m activity perimeter</span>
                  </div>
                  <span className={`text-lg font-mono font-bold ${
                    focusedTxn.riskScore >= 70 ? 'text-[#E5484D]' : 'text-[#F5C04A]'
                  }`}>
                    {focusedTxn.riskScore.toFixed(1)} / 100
                  </span>
                </div>

                {/* Live Tracking Progress Block */}
                <LiveTrackingPanelBlock status={trackingStatus} />

                {/* Case Metadata Box */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Typology:</span>
                    <span className="text-white font-sans font-medium">{focusedTxn.typologyLabel}</span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Amount:</span>
                    <span className="text-white font-bold">${focusedTxn.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Corridor:</span>
                    <span className="text-white font-semibold">{focusedTxn.fromCity} ➔ {focusedTxn.toCity}</span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Distance:</span>
                    <span className="text-white font-sans">
                      {corridorDistance.km.toLocaleString()} km ({corridorDistance.miles.toLocaleString()} mi)
                    </span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Coordinates:</span>
                    <span className="text-[var(--caption)]">
                      {focusedTxn.toLat.toFixed(4)}°, {focusedTxn.toLng.toFixed(4)}°
                    </span>
                  </div>
                </div>

                {/* AI Narrative */}
                <div className="text-xs leading-relaxed text-[var(--text)] font-normal p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                  <span className="text-[10px] font-mono uppercase text-[#FF6A2B] block mb-1">
                    AI Perimeter Narrative
                  </span>
                  {focusedTxn.narrative}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      selectTxn(focusedTxn.id);
                      navigate(`/detail/${focusedTxn.id}`);
                    }}
                    className="flex-1 pill-btn-primary text-xs flex items-center justify-center gap-1.5 py-2 shadow-md"
                  >
                    <span>Investigate Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleGenerateSAR(focusedTxn)}
                    className="pill-btn-secondary text-xs p-2"
                    title="Generate SAR Draft"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleClearAlert(focusedTxn.id)}
                    className="text-[11px] text-[var(--muted)] hover:text-[var(--live)] font-mono flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Clear Alert</span>
                  </button>

                  <button
                    onClick={handleBackToGlobe}
                    className="text-[11px] text-[var(--sage-3)] hover:text-white font-mono flex items-center gap-1"
                  >
                    <span>Back to 3D Globe</span>
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================================
          GLOBAL CORRIDORS TABLE (Enables Natural Page Scrolling & Exploration)
          ========================================================================= */}
      <div className="fintech-card rounded-[16px] overflow-hidden border border-white/[0.08]">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Monitored Geographic Corridors
            </h3>
            <p className="text-xs text-[var(--caption)]">
              Click any corridor to trigger smooth 3D globe flight and dive into high-resolution surveillance map
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase text-[var(--caption)] tracking-wider">
            Simulated Coordinates
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] uppercase font-mono text-[var(--caption)] bg-[#141417]/95">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4">Origin ➔ Destination</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Typology</th>
                <th className="py-3 px-4 text-right">Map Dive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {flaggedItems.map((c) => (
                <tr 
                  key={c.id}
                  onClick={() => triggerFlyToSequence(c)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-white group-hover:text-[#FF6A2B] transition-colors">#{c.id}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${
                      c.riskScore >= 70 ? 'bg-[#E5484D]/15 text-[#FF7075] border-[#E5484D]/30' : 'bg-[#F5C04A]/15 text-[#FAD375] border-[#F5C04A]/30'
                    }`}>
                      {c.riskScore.toFixed(0)} RISK
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--text)] font-medium">
                    {c.fromCity} ({c.fromCountry}) ➔ {c.toCity} ({c.toCountry})
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-white">${c.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[var(--muted)]">{c.typologyLabel}</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFlyToSequence(c);
                      }}
                      className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-[#FF6A2B]/15 hover:border-[#FF6A2B]/40 text-xs font-medium text-white transition-all inline-flex items-center gap-1.5 border border-white/[0.08]"
                    >
                      <MapPin className="w-3 h-3 text-[#FF6A2B]" />
                      <span>Fly to Location</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
