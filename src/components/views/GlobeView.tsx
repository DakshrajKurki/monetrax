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
import { UnifiedMapController, calculateHaversineDistance } from '../map/types';

// Convert Lat/Lng to 3D Sphere coordinates
export function latLngToVector3(lat: number, lng: number, radius = 2.0): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
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

// Animated Bezier Arc between Origin and Destination
function TransactionArc({ 
  fromPos, 
  toPos, 
  color = '#E5484D', 
  isHighlighted = false
}: { 
  fromPos: THREE.Vector3; 
  toPos: THREE.Vector3; 
  color?: string; 
  isHighlighted?: boolean;
}) {
  const particleRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
    const distance = fromPos.distanceTo(toPos);
    mid.normalize().multiplyScalar(2.0 + Math.min(1.0, distance * 0.35));
    return new THREE.QuadraticBezierCurve3(fromPos, mid, toPos);
  }, [fromPos, toPos]);

  const points = useMemo(() => curve.getPoints(30), [curve]);

  useFrame(({ clock }) => {
    if (particleRef.current) {
      const t = (clock.getElapsedTime() * 0.4) % 1.0;
      const pos = curve.getPoint(t);
      particleRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      <Line
        points={points}
        color={isHighlighted ? '#FFFFFF' : color}
        lineWidth={isHighlighted ? 2.5 : 1.2}
        transparent
        opacity={isHighlighted ? 0.95 : 0.4}
      />
      <mesh ref={particleRef}>
        <sphereGeometry args={[isHighlighted ? 0.035 : 0.02, 10, 10]} />
        <meshBasicMaterial color={isHighlighted ? '#FFFFFF' : color} />
      </mesh>
    </group>
  );
}

// 3D Flagged Marker
function FlaggedMarker({ 
  position, 
  riskScore, 
  isSelected, 
  onClick 
}: { 
  position: THREE.Vector3; 
  riskScore: number; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const color = riskScore >= 70 ? 'var(--risk-red)' : 'var(--risk-amber)';

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh>
        <sphereGeometry args={[isSelected ? 0.05 : 0.035, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.045, isSelected ? 0.09 : 0.065, 20]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.8 : 0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

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

// Camera Fly-To Controller with smooth easing
function CameraController({ 
  targetPos, 
  isFlying 
}: { 
  targetPos: THREE.Vector3 | null; 
  isFlying: boolean;
}) {
  useFrame(({ camera }) => {
    if (isFlying && targetPos) {
      const desiredPos = targetPos.clone().normalize().multiplyScalar(3.2);
      camera.position.lerp(desiredPos, 0.06);
      camera.lookAt(targetPos.clone().multiplyScalar(0.4));
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
  focusedTxn?: Transaction;
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

  // Target transaction from URL, store, or active side panel
  const urlCaseId = searchParams.get('case');
  const urlView = searchParams.get('view');

  const focusedTxn = useMemo(() => {
    const targetId = urlCaseId || activeSidePanelTxn?.id || flyToCaseId || selectedTxnId;
    return transactions.find(t => t.id === targetId) || flaggedItems[0] || transactions[0];
  }, [urlCaseId, activeSidePanelTxn?.id, flyToCaseId, selectedTxnId, transactions, flaggedItems]);

  const targetVector = useMemo(() => {
    if (focusedTxn) {
      return latLngToVector3(focusedTxn.toLat, focusedTxn.toLng, 2.0);
    }
    return null;
  }, [focusedTxn?.id]);

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
    setActiveSidePanelTxn(targetCase);
    selectTxn(targetCase.id);

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

    sequenceTimersRef.current.push(tCrossfade, tSettle);
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

  // Monitor URL parameters: /globe?case=ID&view=map triggers sequence automatically
  useEffect(() => {
    if (urlView === 'map' && urlCaseId) {
      const match = transactions.find(t => t.id === urlCaseId);
      if (match && (sequencePhase === 'globe_idle' || activeSidePanelTxn?.id !== match.id)) {
        startDiveSequence(match);
      }
    } else if (!urlView && sequencePhase === 'settled_map') {
      // Browser Back pressed
      handleBackToGlobe();
    }
  }, [urlView, urlCaseId, transactions, sequencePhase, activeSidePanelTxn?.id, startDiveSequence, handleBackToGlobe]);

  // Trigger Fly-To from UI table or markers
  const triggerFlyToSequence = (txn: Transaction) => {
    setSearchParams({ case: txn.id, view: 'map' });
    startDiveSequence(txn);
  };

  const handleClearAlert = (txnId: string) => {
    updateCaseStatus(txnId, 'Cleared', 'Alert cleared from 3D Globe Map view.');
  };

  const handleGenerateSAR = (txn: Transaction) => {
    addToast('SAR Auto-Drafted', `SAR filing generated for Case #${txn.id} (${txn.typologyLabel}).`, 'success');
    navigate('/sar');
  };

  // Ensure Globe route always mounts scrolled to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

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
          First thing under fixed nav: fills remaining viewport height (zero scrolling needed)
          ========================================================================= */}
      <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] rounded-[32px] glass-panel overflow-hidden border border-[var(--line)] shadow-2xl">
        
        {/* Floating Glass Header & Controls Bar Overlay on Globe Stage */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-col md:flex-row md:items-center justify-between gap-3 pointer-events-none">
          <div className="glass-panel px-4 py-2 border border-white/10 shadow-lg pointer-events-auto flex items-center gap-3 backdrop-blur-xl bg-[#0B0F0D]/80 rounded-full">
            <h2 className="text-base font-light text-[var(--text)] tracking-tight">
              Global Surveillance Globe
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--risk-red)]/20 text-[var(--risk-red)] font-mono font-medium border border-[var(--risk-red)]/30">
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
                  className={`pill-btn-secondary text-xs flex items-center gap-1.5 shadow-lg ${isZoomActive ? 'bg-white text-darkCanvas font-medium' : ''}`}
                  title="Enable or disable mouse-wheel zoom on 3D globe"
                >
                  {isZoomActive ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5 text-[var(--sage-3)]" />}
                  <span>{isZoomActive ? 'Zoom Active' : 'Zoom Off'}</span>
                </button>

                <button
                  onClick={() => setIsHeatmapActive(!isHeatmapActive)}
                  className={`pill-btn-secondary text-xs flex items-center gap-1.5 shadow-lg ${isHeatmapActive ? 'bg-white text-[#0A0D0C] font-medium' : ''}`}
                  title="Toggle country risk density heatmap"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isHeatmapActive ? 'Heatmap: Active' : 'Country Heatmap'}</span>
                </button>

                <div className="glass-panel p-1 flex items-center gap-1 shadow-lg bg-[#0B0F0D]/80 rounded-full">
                  <button
                    onClick={() => setRiskFilter('all')}
                    className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${riskFilter === 'all' ? 'bg-white text-[#0A0D0C] font-medium' : 'text-[var(--muted)] hover:text-white'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setRiskFilter('critical')}
                    className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${riskFilter === 'critical' ? 'bg-[var(--risk-red)] text-white font-medium' : 'text-[var(--muted)] hover:text-white'}`}
                  >
                    Critical
                  </button>
                  <button
                    onClick={() => setRiskFilter('medium')}
                    className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${riskFilter === 'medium' ? 'bg-[var(--risk-amber)] text-white font-medium' : 'text-[var(--muted)] hover:text-white'}`}
                  >
                    Medium
                  </button>
                </div>

                <select
                  value={typologyFilter}
                  onChange={(e) => setTypologyFilter(e.target.value)}
                  className="glass-panel px-3 py-1.5 text-xs text-[var(--text)] bg-[#0B0F0D]/80 border border-white/10 rounded-full focus:outline-none cursor-pointer shadow-lg"
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
                <Canvas camera={{ position: [0, 0, 5.0], fov: 45 }}>
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
                    minDistance={2.8} 
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

                  {flaggedItems.map((item) => {
                    const fromPos = latLngToVector3(item.fromLat, item.fromLng, 2.0);
                    const toPos = latLngToVector3(item.toLat, item.toLng, 2.0);
                    const isSelected = focusedTxn?.id === item.id;

                    return (
                      <group key={item.id}>
                        <TransactionArc
                          fromPos={fromPos}
                          toPos={toPos}
                          color={item.riskScore >= 70 ? 'var(--risk-red)' : 'var(--risk-amber)'}
                          isHighlighted={isSelected}
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
          {focusedTxn && (
            <DiveMapContainer
              transaction={focusedTxn}
              initialZoom={sequencePhase === 'settled_map' ? 15 : 4}
              onControllerReady={(ctl) => {
                mapControllerRef.current = ctl;
              }}
              isMapVisible={sequencePhase === 'crossfading' || sequencePhase === 'settled_map'}
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
              initial={{ x: 380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-4 top-4 bottom-4 z-20 w-80 md:w-96 max-w-[calc(100vw-32px)] glass-panel p-5 border border-white/20 shadow-2xl flex flex-col justify-between bg-[#0B0F0D]/95 backdrop-blur-xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[var(--risk-red)]" />
                    <div>
                      <h3 className="text-sm font-medium text-white">
                        Case #{focusedTxn.id}
                      </h3>
                      <p className="text-[10px] text-[var(--muted)] font-mono">
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
                <div className="flex items-center justify-between my-3 p-2.5 rounded-xl bg-white/[0.02] border border-[var(--line)]">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[var(--muted)]">Unified Risk Score</span>
                    <span className="text-[10px] font-mono text-[var(--sage-2)]">500m activity perimeter</span>
                  </div>
                  <span className={`text-lg font-mono font-bold ${
                    focusedTxn.riskScore >= 70 ? 'text-[var(--risk-red)]' : 'text-[var(--risk-amber)]'
                  }`}>
                    {focusedTxn.riskScore.toFixed(1)} / 100
                  </span>
                </div>

                {/* Case Metadata Box */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--line)] text-xs font-mono space-y-1.5 mb-3">
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
                    <span className="text-[var(--sage-3)]">{focusedTxn.fromCity} ➔ {focusedTxn.toCity}</span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Distance:</span>
                    <span className="text-white font-sans">
                      {corridorDistance.km.toLocaleString()} km ({corridorDistance.miles.toLocaleString()} mi)
                    </span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Coordinates:</span>
                    <span className="text-[var(--sage-2)]">
                      {focusedTxn.toLat.toFixed(4)}°, {focusedTxn.toLng.toFixed(4)}°
                    </span>
                  </div>
                </div>

                {/* AI Narrative */}
                <div className="text-xs leading-relaxed text-[var(--text)] font-light p-3 rounded-xl bg-white/[0.015] border border-[var(--line)]">
                  <span className="text-[10px] font-mono uppercase text-[var(--sage-3)] block mb-1">
                    AI Perimeter Narrative
                  </span>
                  {focusedTxn.narrative}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[var(--line)] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      selectTxn(focusedTxn.id);
                      navigate(`/detail/${focusedTxn.id}`);
                    }}
                    className="flex-1 pill-btn-primary text-xs flex items-center justify-center gap-1.5 py-2"
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
      <div className="glass-panel overflow-hidden border border-[var(--line)]">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--text)]">
              Monitored Geographic Corridors
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Click any corridor to trigger smooth 3D globe flight and dive into high-resolution surveillance map
            </p>
          </div>
          <span className="label-small">
            Simulated Coordinates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase font-mono text-[var(--muted)] bg-white/[0.02]">
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
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-medium text-[var(--text)]">#{c.id}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      c.riskScore >= 70 ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)]' : 'bg-[var(--risk-amber)]/20 text-[var(--risk-amber)]'
                    }`}>
                      {c.riskScore.toFixed(0)} RISK
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--text)]">
                    {c.fromCity} ({c.fromCountry}) ➔ {c.toCity} ({c.toCountry})
                  </td>
                  <td className="py-3 px-4 font-mono">${c.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[var(--sage-3)]">{c.typologyLabel}</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFlyToSequence(c);
                      }}
                      className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white transition-all inline-flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 text-[var(--risk-red)]" />
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
