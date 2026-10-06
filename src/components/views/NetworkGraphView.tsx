import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useAMLStore } from '../../store/useAMLStore';
import { 
  Share2, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  ShieldAlert, 
  ArrowRight, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  ExternalLink,
  ChevronRight,
  Info,
  Maximize2
} from 'lucide-react';
import { AccountGraphNode, AccountGraphEdge } from '../../types';
import { pageVariants } from '../common/MotionComponents';

// Predefined Suspicious Network with realistic AML typologies
function generateNetworkData() {
  const nodes: AccountGraphNode[] = [
    // Illicit Structuring & Layering Ring
    { id: 'ACCT-8841-US', label: 'Smurf Aggregation Hub', x: -1.4, y: 0.8, z: 0.3, volume: 88500, riskScore: 94.2, cluster: 'suspicious', inflow: 92000, outflow: 88500, flagCount: 7 },
    { id: 'ACCT-9022-UK', label: 'Layering Node London', x: -0.4, y: 1.2, z: 0.6, volume: 86400, riskScore: 92.5, cluster: 'suspicious', inflow: 88500, outflow: 85200, flagCount: 5 },
    { id: 'ACCT-7712-CH', label: 'Swiss Custody Transit', x: 0.3, y: 0.4, z: 1.1, volume: 84100, riskScore: 91.8, cluster: 'suspicious', inflow: 85200, outflow: 82900, flagCount: 6 },
    { id: 'ACCT-3304-SG', label: 'Singapore Clearing Entity', x: 0.9, y: 0.9, z: 0.4, volume: 82000, riskScore: 89.4, cluster: 'suspicious', inflow: 82900, outflow: 81200, flagCount: 4 },
    { id: 'ACCT-9921-CY', label: 'Cyprus Shell Holding', x: -0.8, y: -0.6, z: 0.8, volume: 80500, riskScore: 88.0, cluster: 'suspicious', inflow: 81200, outflow: 79800, flagCount: 5 },
    { id: 'ACCT-MULE-01', label: 'Funnel Smurf 1 (Miami)', x: -2.3, y: 1.4, z: 0.1, volume: 9800, riskScore: 84.1, cluster: 'suspicious', inflow: 9800, outflow: 9800, flagCount: 3 },
    { id: 'ACCT-MULE-02', label: 'Funnel Smurf 2 (New York)', x: -2.1, y: 0.2, z: -0.2, volume: 9750, riskScore: 83.7, cluster: 'suspicious', inflow: 9750, outflow: 9750, flagCount: 2 },
    { id: 'ACCT-MULE-03', label: 'Funnel Smurf 3 (Toronto)', x: -1.9, y: 1.9, z: 0.5, volume: 9900, riskScore: 85.0, cluster: 'suspicious', inflow: 9900, outflow: 9900, flagCount: 3 },
  ];

  const edges: AccountGraphEdge[] = [
    // Smurfing fan-in
    { id: 'e-smurf-1', source: 'ACCT-MULE-01', target: 'ACCT-8841-US', amount: 9800, typology: 'structuring' },
    { id: 'e-smurf-2', source: 'ACCT-MULE-02', target: 'ACCT-8841-US', amount: 9750, typology: 'structuring' },
    { id: 'e-smurf-3', source: 'ACCT-MULE-03', target: 'ACCT-8841-US', amount: 9900, typology: 'structuring' },
    // Cyclic layering loop
    { id: 'e-cyc-1', source: 'ACCT-8841-US', target: 'ACCT-9022-UK', amount: 29450, typology: 'cyclic_flow' },
    { id: 'e-cyc-2', source: 'ACCT-9022-UK', target: 'ACCT-7712-CH', amount: 28800, typology: 'cyclic_flow' },
    { id: 'e-cyc-3', source: 'ACCT-7712-CH', target: 'ACCT-3304-SG', amount: 28200, typology: 'cyclic_flow' },
    { id: 'e-cyc-4', source: 'ACCT-3304-SG', target: 'ACCT-9921-CY', amount: 27600, typology: 'cyclic_flow' },
    { id: 'e-cyc-5', source: 'ACCT-9921-CY', target: 'ACCT-8841-US', amount: 27000, typology: 'cyclic_flow' },
  ];

  // 14 legitimate institutional accounts orbiting around
  const legitNames = [
    'JPMorgan Clearing Alpha', 'Barclays Settlement Prime', 'HSBC Commercial Treasury',
    'Deutsche Bank Euro Corp', 'BNP Paribas Trade Hub', 'UBS Wealth Custody',
    'DBS Institutional Clearing', 'Santander Trade Services', 'Credit Agricole Corp',
    'Standard Chartered Trade', 'Mizuho Americas Prime', 'Sumitomo Mitsui Treasury',
    'RBC Capital Settlement', 'Scotiabank Trade Clear'
  ];

  for (let i = 0; i < legitNames.length; i++) {
    const angle = (i / legitNames.length) * Math.PI * 2;
    const radius = 2.4 + (i % 2) * 0.5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.6;
    const z = ((i % 4) - 1.5) * 0.7;
    const id = `ACCT-INST-${100 + i}`;
    const vol = Math.round(45000 + (i * 12000));

    nodes.push({
      id,
      label: legitNames[i],
      x,
      y,
      z,
      volume: vol,
      riskScore: +(12 + (i * 2.3)).toFixed(1),
      cluster: 'legitimate',
      inflow: Math.round(vol * 0.98),
      outflow: Math.round(vol * 0.95),
      flagCount: 0
    });

    if (i > 0) {
      edges.push({
        id: `e-leg-${i}`,
        source: nodes[8 + i - 1].id,
        target: id,
        amount: Math.round(15000 + (i * 3000))
      });
    }
  }

  return { nodes, edges };
}

// 3D Sphere Node
function NodeSphere3D({ 
  node, 
  isSelected, 
  isReplayActive,
  onClick 
}: { 
  node: AccountGraphNode; 
  isSelected: boolean; 
  isReplayActive: boolean;
  onClick: () => void;
}) {
  const isSuspicious = node.cluster === 'suspicious';
  const size = THREE.MathUtils.clamp(0.08 + Math.log10(node.volume) * 0.025, 0.1, 0.24);
  const color = isSuspicious 
    ? (node.riskScore >= 90 ? '#E5484D' : '#E8A33D') 
    : '#7F9488';

  return (
    <group position={[node.x, node.y, node.z ?? 0]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.6}
          emissive={color}
          emissiveIntensity={isSelected || isReplayActive ? 0.9 : isSuspicious ? 0.35 : 0.1}
        />
      </mesh>
      {isSuspicious && (
        <mesh>
          <sphereGeometry args={[size * 1.5, 14, 14]} />
          <meshBasicMaterial
            color="#E5484D"
            transparent
            opacity={isSelected ? 0.4 : 0.15}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

// 3D Curved Edge
function Edge3D({
  sourcePos,
  targetPos,
  isSuspicious,
  isHighlighted
}: {
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
  isSuspicious: boolean;
  isHighlighted: boolean;
}) {
  const vSource = useMemo(() => new THREE.Vector3(...sourcePos), [sourcePos]);
  const vTarget = useMemo(() => new THREE.Vector3(...targetPos), [targetPos]);

  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(vSource, vTarget).multiplyScalar(0.5);
    mid.y += 0.2;
    return new THREE.QuadraticBezierCurve3(vSource, mid, vTarget);
  }, [vSource, vTarget]);

  const points = useMemo(() => curve.getPoints(20), [curve]);

  return (
    <Line
      points={points}
      color={isHighlighted ? '#FFFFFF' : isSuspicious ? '#E5484D' : 'rgba(127, 148, 136, 0.25)'}
      lineWidth={isHighlighted ? 2.8 : isSuspicious ? 1.6 : 0.8}
      transparent
      opacity={isHighlighted ? 0.95 : isSuspicious ? 0.7 : 0.25}
    />
  );
}

export const NetworkGraphView: React.FC = () => {
  const navigate = useNavigate();
  const selectAccount = useAMLStore((s) => s.selectAccount);
  const selectTxn = useAMLStore((s) => s.selectTxn);
  const addToast = useAMLStore((s) => s.addToast);

  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [selectedTypology, setSelectedTypology] = useState<'structuring' | 'cyclic_flow'>('cyclic_flow');
  const [replayStep, setReplayStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isZoomActive, setIsZoomActive] = useState<boolean>(false);

  const { nodes, edges } = useMemo(() => generateNetworkData(), []);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ACCT-8841-US');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['ACCT-8841-US']));

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Replay steps definitions
  const replaySteps = useMemo(() => [
    {
      step: 0,
      title: 'Baseline State',
      description: 'Monitoring 22 accounts across London, Zurich, Singapore, and Cyprus clearing corridors.',
      activeEdges: [],
      activeNodes: ['ACCT-8841-US']
    },
    {
      step: 1,
      title: 'Phase 1: Funnel Smurfing Deposits',
      description: 'Three coordinated mule accounts deposit $9,800, $9,750, and $9,900 just under the $10,000 CTR reporting threshold.',
      activeEdges: ['e-smurf-1', 'e-smurf-2', 'e-smurf-3'],
      activeNodes: ['ACCT-MULE-01', 'ACCT-MULE-02', 'ACCT-MULE-03', 'ACCT-8841-US']
    },
    {
      step: 2,
      title: 'Phase 2: Cross-Border Layering Hop',
      description: 'Aggregated funds of $29,450 are rapidly routed to UK intermediary ACCT-9022-UK to obscure the US domestic trail.',
      activeEdges: ['e-cyc-1'],
      activeNodes: ['ACCT-8841-US', 'ACCT-9022-UK']
    },
    {
      step: 3,
      title: 'Phase 3: Multi-Jurisdiction Circular Loop',
      description: 'Funds hop through Swiss Custody, Singapore, and Cyprus shell entities with 1.8% retained per hop.',
      activeEdges: ['e-cyc-2', 'e-cyc-3', 'e-cyc-4'],
      activeNodes: ['ACCT-9022-UK', 'ACCT-7712-CH', 'ACCT-3304-SG', 'ACCT-9921-CY']
    },
    {
      step: 4,
      title: 'Phase 4: Return Loop & Integration',
      description: 'Residual $27,000 recirculates back to Smurf Hub as "consulting advisory fees", closing the graph cycle.',
      activeEdges: ['e-cyc-5'],
      activeNodes: ['ACCT-9921-CY', 'ACCT-8841-US']
    }
  ], []);

  // Replay interval timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setReplayStep((prev) => {
          if (prev >= replaySteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [isPlaying, replaySteps.length]);

  const handleNodeClick = (node: AccountGraphNode) => {
    setSelectedNodeId(node.id);
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.add(node.id);
      }
      return next;
    });
  };

  const currentReplay = replaySteps[replayStep];

  // 2D SVG Coordinate projection
  const project2D = (x: number, y: number) => {
    return {
      cx: 460 + x * 180,
      cy: 220 - y * 130
    };
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex flex-col gap-6 pb-16"
    >
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-light text-[var(--text)] tracking-tight">
              Network Graph & Typology Replay
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--risk-red)]/20 text-[var(--risk-red)] font-mono font-medium border border-[var(--risk-red)]/30">
              Illicit Ring Detected
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 font-light">
            Interactive multi-party topological graph. Scrub through algorithmic time steps to visualize smurfing and cyclic layering flows.
          </p>
        </div>

        {/* View Mode & Zoom Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 2D vs 3D Switch */}
          <div className="glass-panel p-1 flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1 rounded-full transition-all ${viewMode === '2D' ? 'bg-white text-[#0A0D0C] font-semibold' : 'text-[var(--muted)] hover:text-white'}`}
            >
              2D Force Map
            </button>
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1 rounded-full transition-all ${viewMode === '3D' ? 'bg-white text-[#0A0D0C] font-semibold' : 'text-[var(--muted)] hover:text-white'}`}
            >
              3D Sphere Space
            </button>
          </div>

          {viewMode === '3D' && (
            <button
              onClick={() => setIsZoomActive(!isZoomActive)}
              className={`pill-btn-secondary text-xs flex items-center gap-1.5 ${isZoomActive ? 'bg-white text-[#0A0D0C] font-medium' : ''}`}
            >
              {isZoomActive ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5 text-[var(--sage-3)]" />}
              <span>{isZoomActive ? 'Zoom Active' : 'Scroll Page'}</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          TYPOLOGY REPLAY TIMELINE CONTROLLER
          ========================================================================= */}
      <div className="glass-panel p-4 border border-[var(--line)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-white text-[#0A0D0C] flex items-center justify-center hover:scale-105 transition-all shadow-md"
            title={isPlaying ? 'Pause replay' : 'Play automated replay'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => setReplayStep(Math.max(0, replayStep - 1))}
            disabled={replayStep === 0}
            className="p-2 rounded-full glass-panel hover:text-white text-[var(--muted)] disabled:opacity-40"
            title="Previous step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setReplayStep(Math.min(replaySteps.length - 1, replayStep + 1))}
            disabled={replayStep === replaySteps.length - 1}
            className="p-2 rounded-full glass-panel hover:text-white text-[var(--muted)] disabled:opacity-40"
            title="Next step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setReplayStep(0); setIsPlaying(false); }}
            className="p-2 rounded-full glass-panel hover:text-white text-[var(--muted)]"
            title="Reset timeline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="ml-2">
            <span className="text-xs font-mono font-medium text-white">
              {currentReplay.title}
            </span>
            <p className="text-[11px] text-[var(--muted)] max-w-xl truncate">
              {currentReplay.description}
            </p>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <span className="text-[11px] font-mono text-[var(--muted)]">
            Step {replayStep + 1} / {replaySteps.length}
          </span>
          <input
            type="range"
            min="0"
            max={replaySteps.length - 1}
            step="1"
            value={replayStep}
            onChange={(e) => setReplayStep(Number(e.target.value))}
            className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* =========================================================================
          BOUNDED GRAPH STAGE CONTAINER (Doesn't Swallow Wheel Scrolling)
          ========================================================================= */}
      <div className="relative w-full h-[500px] rounded-[24px] glass-panel overflow-hidden border border-[var(--line)]">
        {/* Ambient sage glow behind graph */}
        <div className="sage-glow-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />

        {viewMode === '2D' ? (
          /* 2D VECTOR FORCE GRAPH VIEW */
          <div className="relative w-full h-full bg-[#080C0A] overflow-hidden flex items-center justify-center select-none">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 920 440">
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Edges */}
              {edges.map((e) => {
                const s = nodes.find(n => n.id === e.source);
                const t = nodes.find(n => n.id === e.target);
                if (!s || !t) return null;

                const p1 = project2D(s.x, s.y);
                const p2 = project2D(t.x, t.y);
                const isSuspicious = Boolean(e.typology);
                const isHighlighted = currentReplay.activeEdges.includes(e.id);
                const color = isHighlighted ? '#FFFFFF' : isSuspicious ? 'var(--risk-red)' : 'rgba(127, 148, 136, 0.35)';

                // Calculate curved control point
                const midX = (p1.cx + p2.cx) / 2;
                const midY = (p1.cy + p2.cy) / 2 - 24;

                return (
                  <g key={e.id}>
                    <path
                      d={`M ${p1.cx} ${p1.cy} Q ${midX} ${midY} ${p2.cx} ${p2.cy}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={isHighlighted ? 3.0 : isSuspicious ? 1.8 : 1.0}
                      strokeOpacity={isHighlighted ? 1.0 : isSuspicious ? 0.75 : 0.25}
                      strokeDasharray={isSuspicious && !isHighlighted ? '4 3' : undefined}
                    />
                    {isHighlighted && (
                      <circle cx={(p1.cx + p2.cx) / 2} cy={(p1.cy + p2.cy) / 2 - 12} r={3.5} fill="#FFFFFF" className="animate-ping" />
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const p = project2D(node.x, node.y);
                const isSuspicious = node.cluster === 'suspicious';
                const isSelected = selectedNodeId === node.id;
                const isReplayActive = currentReplay.activeNodes.includes(node.id);
                const color = isSuspicious 
                  ? (node.riskScore >= 90 ? 'var(--risk-red)' : 'var(--risk-amber)') 
                  : 'var(--sage-2)';
                const radius = isSuspicious ? 9 : 6.5;

                return (
                  <g 
                    key={node.id} 
                    className="cursor-pointer" 
                    onClick={() => handleNodeClick(node)}
                  >
                    {/* Outer pulse halo for flagged ring */}
                    {isSuspicious && (
                      <circle
                        cx={p.cx}
                        cy={p.cy}
                        r={radius * 1.8}
                        fill="none"
                        stroke="var(--risk-red)"
                        strokeWidth={1}
                        strokeOpacity={isSelected || isReplayActive ? 0.6 : 0.2}
                        className={isSelected || isReplayActive ? 'animate-pulse' : undefined}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r={isSelected ? radius + 3 : radius}
                      fill={color}
                      stroke={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.2)'}
                      strokeWidth={isSelected ? 2 : 1}
                    />

                    {/* Node label */}
                    <text
                      x={p.cx}
                      y={p.cy + radius + 14}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : 'var(--muted)'}
                      fontSize={isSelected ? '10px' : '9px'}
                      fontFamily="monospace"
                    >
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Sub-label banner */}
            <div className="absolute bottom-3 left-4 text-[10px] text-[var(--muted)] flex items-center gap-2 bg-[#0B0F0D]/90 px-3 py-1 rounded-full border border-[var(--line)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--risk-red)] animate-pulse" />
              <span>Red Cluster: Structuring & Cyclic Triad Ring • Click any node to inspect & expand</span>
            </div>
          </div>
        ) : (
          /* 3D SPHERICAL GRAPH VIEW */
          <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 0.5, 4.5], fov: 48 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1.2} />
              <pointLight position={[-10, -10, -10]} intensity={0.4} />

              <OrbitControls 
                enablePan={false} 
                enableZoom={isZoomActive}
                minDistance={2.2} 
                maxDistance={7.0} 
                dampingFactor={0.06} 
              />

              {edges.map((e) => {
                const s = nodes.find(n => n.id === e.source);
                const t = nodes.find(n => n.id === e.target);
                if (!s || !t) return null;
                const isSuspicious = Boolean(e.typology);
                const isHighlighted = currentReplay.activeEdges.includes(e.id);

                return (
                  <Edge3D
                    key={e.id}
                    sourcePos={[s.x, s.y, s.z ?? 0]}
                    targetPos={[t.x, t.y, t.z ?? 0]}
                    isSuspicious={isSuspicious}
                    isHighlighted={isHighlighted}
                  />
                );
              })}

              {nodes.map((node) => (
                <NodeSphere3D
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  isReplayActive={currentReplay.activeNodes.includes(node.id)}
                  onClick={() => handleNodeClick(node)}
                />
              ))}
            </Canvas>
          </div>
        )}

        {/* Selected Node Inspection Drawer */}
        {selectedNode && (
          <div className="absolute right-4 top-4 bottom-4 z-20 w-88 max-w-[calc(100vw-32px)] glass-panel p-5 border border-white/20 shadow-2xl flex flex-col justify-between animate-fadeIn bg-[#0B0F0D]/95">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    selectedNode.riskScore >= 70 ? 'bg-[var(--risk-red)] animate-pulse' : 'bg-[var(--sage-2)]'
                  }`} />
                  <h3 className="text-sm font-medium text-white font-mono">
                    {selectedNode.id}
                  </h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  selectedNode.riskScore >= 70 
                    ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)] border border-[var(--risk-red)]/30'
                    : 'bg-[var(--sage-2)]/20 text-[var(--sage-2)] border border-[var(--sage-2)]/30'
                }`}>
                  {selectedNode.riskScore.toFixed(1)} RISK
                </span>
              </div>

              <div className="text-xs text-[var(--muted)] font-light mt-2">
                {selectedNode.label}
              </div>

              <div className="grid grid-cols-2 gap-2 my-4 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block">30d Inflow</span>
                  <span className="text-white font-bold text-sm">${selectedNode.inflow.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-[var(--line)]">
                  <span className="text-[10px] text-[var(--muted)] block">30d Outflow</span>
                  <span className="text-white font-bold text-sm">${selectedNode.outflow.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--line)] text-xs font-mono space-y-1.5 mb-3">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Cluster:</span>
                  <span className={selectedNode.cluster === 'suspicious' ? 'text-[var(--risk-red)] font-medium' : 'text-[var(--sage-3)]'}>
                    {selectedNode.cluster === 'suspicious' ? 'Smurfing & Layering Ring' : 'Tier-1 Institutional'}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Flagged Tx Count:</span>
                  <span className="text-white font-bold">{selectedNode.flagCount} cases</span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-[var(--muted)] font-light">
                {selectedNode.cluster === 'suspicious' 
                  ? 'Exhibits high graph betweenness centrality and cyclic recurrence with Cyprus and UK intermediaries.'
                  : 'Normal institutional settlement entity operating within expected peer velocity thresholds.'}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--line)] space-y-2">
              <button
                onClick={() => {
                  selectAccount(selectedNode.id);
                  navigate(`/account/${selectedNode.id}`);
                }}
                className="w-full pill-btn-primary text-xs flex items-center justify-center gap-1.5"
              >
                <span>Open Account 360</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Counterparties Table for Selected Node */}
      <div className="glass-panel overflow-hidden border border-[var(--line)]">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--text)]">
              Direct Topological Neighbors ({selectedNode.id})
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Direct counterparty relationships observed in transactional graph
            </p>
          </div>
          <span className="label-small">
            Graph Degree: {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase font-mono text-[var(--muted)] bg-white/[0.02]">
                <th className="py-3 px-4">Relationship</th>
                <th className="py-3 px-4">Counterparty ID</th>
                <th className="py-3 px-4">Flow Volume</th>
                <th className="py-3 px-4">Typology Flag</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {edges
                .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                .map((e) => {
                  const isOutflow = e.source === selectedNode.id;
                  const otherId = isOutflow ? e.target : e.source;
                  const otherNode = nodes.find(n => n.id === otherId);

                  return (
                    <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${isOutflow ? 'bg-[var(--risk-amber)]/20 text-[var(--risk-amber)]' : 'bg-[var(--live)]/20 text-[var(--live)]'}`}>
                          {isOutflow ? '➔ Outward Flow' : '⬅ Inward Flow'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-white">
                        {otherId} <span className="text-[var(--muted)] font-sans">({otherNode?.label})</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">${e.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-[var(--sage-3)] font-mono">
                        {e.typology ? e.typology.toUpperCase() : 'STANDARD'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedNodeId(otherId);
                            addToast({ title: 'Focus Shifted', message: `Focused on ${otherId}`, type: 'info' });
                          }}
                          className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white transition-all inline-flex items-center gap-1"
                        >
                          <span>Focus Node</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
