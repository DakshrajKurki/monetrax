import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useAMLStore } from '../../store/useAMLStore';
import { 
  Globe2, 
  Share2, 
  Play, 
  Pause, 
  ShieldAlert, 
  ArrowRight, 
  Activity, 
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { AccountGraphNode, AccountGraphEdge } from '../../types';

// Generate 25 accounts in 3D graph space
function generateGraphNetwork(): { nodes: AccountGraphNode[]; edges: AccountGraphEdge[] } {
  const nodes: AccountGraphNode[] = [];
  const edges: AccountGraphEdge[] = [];

  // Suspicious cluster nodes (Structuring & Layering Ring)
  const suspiciousAccounts = [
    { id: 'ACCT-8841-US', label: 'Smurf Origin Hub', x: -1.2, y: 0.6, z: 0.4, vol: 68000, risk: 94.2, cluster: 'suspicious' as const },
    { id: 'ACCT-9022-UK', label: 'Layering Intermediary A', x: -0.4, y: 1.1, z: 0.8, vol: 66500, risk: 92.5, cluster: 'suspicious' as const },
    { id: 'ACCT-7712-CH', label: 'Swiss Custody Node', x: -0.1, y: 0.2, z: 1.3, vol: 89000, risk: 91.8, cluster: 'suspicious' as const },
    { id: 'ACCT-3304-SG', label: 'Singapore Transit Account', x: 0.6, y: 0.8, z: 0.5, vol: 87200, risk: 89.4, cluster: 'suspicious' as const },
    { id: 'ACCT-9921-CY', label: 'Cyprus Shell Entity', x: -0.8, y: -0.5, z: 0.9, vol: 85500, risk: 88.0, cluster: 'suspicious' as const },
    { id: 'ACCT-MULE-CENTRAL', label: 'Mule Convergence Hub', x: -1.8, y: -0.4, z: -0.2, vol: 142000, risk: 95.0, cluster: 'suspicious' as const },
  ];

  suspiciousAccounts.forEach((acc, i) => {
    nodes.push({
      id: acc.id,
      label: acc.label,
      x: acc.x,
      y: acc.y,
      z: acc.z,
      volume: acc.vol,
      riskScore: acc.risk,
      cluster: acc.cluster,
      inflow: Math.round(acc.vol * 0.9),
      outflow: Math.round(acc.vol * 0.85),
      flagCount: 3 + i
    });
  });

  // Suspicious cyclic edges
  edges.push(
    { id: 'e-1', source: 'ACCT-8841-US', target: 'ACCT-9022-UK', amount: 9850, typology: 'structuring' },
    { id: 'e-2', source: 'ACCT-9022-UK', target: 'ACCT-7712-CH', amount: 48500, typology: 'cyclic_flow' },
    { id: 'e-3', source: 'ACCT-7712-CH', target: 'ACCT-3304-SG', amount: 47600, typology: 'cyclic_flow' },
    { id: 'e-4', source: 'ACCT-3304-SG', target: 'ACCT-9921-CY', amount: 46750, typology: 'cyclic_flow' },
    { id: 'e-5', source: 'ACCT-9921-CY', target: 'ACCT-7712-CH', amount: 45900, typology: 'cyclic_flow' },
    { id: 'e-6', source: 'ACCT-8841-US', target: 'ACCT-MULE-CENTRAL', amount: 14200, typology: 'mule_fan' }
  );

  // 19 benign institutional accounts
  for (let i = 0; i < 19; i++) {
    const angle = (i / 19) * Math.PI * 2;
    const radius = 2.4 + (i % 3) * 0.4;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.6;
    const z = ((i % 5) - 2) * 0.7;

    const id = `ACCT-CORP-${1000 + i * 27}`;
    const vol = Math.round(25000 + Math.random() * 95000);
    nodes.push({
      id,
      label: `Commercial Treasury #${i + 1}`,
      x,
      y,
      z,
      volume: vol,
      riskScore: +(4 + Math.random() * 26).toFixed(1),
      cluster: 'legitimate',
      inflow: Math.round(vol * 0.95),
      outflow: Math.round(vol * 0.90),
      flagCount: 0
    });

    if (i > 0) {
      edges.push({
        id: `e-leg-${i}`,
        source: nodes[6 + i - 1].id,
        target: id,
        amount: Math.round(5000 + Math.random() * 20000)
      });
    }
  }

  return { nodes, edges };
}

// 3D Account Sphere Node
function NodeSphere({ 
  node, 
  isSelected, 
  onClick 
}: { 
  node: AccountGraphNode; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const isSuspicious = node.cluster === 'suspicious';
  const size = THREE.MathUtils.clamp(0.06 + Math.log10(node.volume) * 0.035, 0.08, 0.22);
  const color = isSuspicious ? (node.riskScore >= 90 ? '#E5484D' : '#E8A33D') : '#8FA89A';

  return (
    <group position={[node.x, node.y, node.z ?? 0]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Node sphere */}
      <mesh>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.7}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : isSuspicious ? 0.4 : 0.15}
        />
      </mesh>

      {/* Red Suspicious Halo on illicit cluster */}
      {isSuspicious && (
        <mesh>
          <sphereGeometry args={[size * 1.6, 16, 16]} />
          <meshBasicMaterial
            color="#E5484D"
            transparent
            opacity={0.18}
            wireframe
          />
        </mesh>
      )}

      {/* Label on Hover / Selection */}
      {isSelected && (
        <Html distanceFactor={10} position={[0, size + 0.15, 0]} center>
          <div className="glass-panel px-2.5 py-1 text-[10px] font-mono text-textOffWhite whitespace-nowrap shadow-xl border border-white/20">
            {node.id} ({node.riskScore} Risk)
          </div>
        </Html>
      )}
    </group>
  );
}

// Curved 3D Edge between Accounts
function GraphEdgeLine({ 
  edge, 
  sourcePos, 
  targetPos, 
  isReplaying 
}: { 
  edge: AccountGraphEdge; 
  sourcePos: [number, number, number]; 
  targetPos: [number, number, number]; 
  isReplaying: boolean;
}) {
  const vSource = useMemo(() => new THREE.Vector3(...sourcePos), [sourcePos]);
  const vTarget = useMemo(() => new THREE.Vector3(...targetPos), [targetPos]);

  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(vSource, vTarget).multiplyScalar(0.5);
    mid.y += 0.2;
    return new THREE.QuadraticBezierCurve3(vSource, mid, vTarget);
  }, [vSource, vTarget]);

  const points = useMemo(() => curve.getPoints(20), [curve]);
  const isSuspicious = Boolean(edge.typology);

  return (
    <Line
      points={points}
      color={isSuspicious ? '#E5484D' : 'rgba(143, 168, 154, 0.25)'}
      lineWidth={isSuspicious ? 2.0 : 0.8}
      transparent
      opacity={isSuspicious ? 0.8 : 0.25}
    />
  );
}

export const Network3DView: React.FC = () => {
  const setView = useAMLStore((s) => s.setView);
  const selectTxn = useAMLStore((s) => s.selectTxn);
  const isReplayingTypology = useAMLStore((s) => s.isReplayingTypology);
  const triggerReplayTypology = useAMLStore((s) => s.triggerReplayTypology);
  const stopReplayTypology = useAMLStore((s) => s.stopReplayTypology);
  const activeReplayStep = useAMLStore((s) => s.activeReplayStep);

  const { nodes, edges } = useMemo(() => generateGraphNetwork(), []);
  const [selectedNode, setSelectedNode] = useState<AccountGraphNode | null>(nodes[0]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, AccountGraphNode>();
    nodes.forEach(n => m.set(n.id, n));
    return m;
  }, [nodes]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[640px] flex flex-col justify-between overflow-hidden">
      {/* Sage Ambient Orb */}
      <div className="sage-orb top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-65 animate-drift-orb" />

      {/* Floating Top Header */}
      <div className="relative z-20 px-6 pt-4 flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 flex items-center gap-2.5">
            <Share2 className="w-4 h-4 text-sage" />
            <span className="text-xs font-semibold uppercase tracking-wider text-textOffWhite">
              3D Account Topological Graph
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sage/20 text-sage font-mono font-bold">
              {nodes.length} Accounts
            </span>
          </div>

          {/* Switch to Globe View */}
          <button
            onClick={() => setView('globe')}
            className="pill-btn-secondary text-xs flex items-center gap-1.5"
          >
            <Globe2 className="w-3.5 h-3.5 text-sage" />
            <span>Switch to 3D Globe</span>
          </button>
        </div>

        {/* Replay Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => isReplayingTypology ? stopReplayTypology() : triggerReplayTypology('structuring')}
            className={`pill-btn-secondary text-xs flex items-center gap-1.5 ${isReplayingTypology ? 'border-risk-red text-risk-red' : ''}`}
          >
            {isReplayingTypology ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-sage" />}
            <span>{isReplayingTypology ? `Network Hop Replay (Step ${activeReplayStep + 1}/4)` : 'Replay Network Flow'}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 1.5, 4.5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.4} />
          <pointLight position={[-10, -10, -10]} intensity={0.6} />

          <OrbitControls 
            enablePan={true} 
            minDistance={2.0} 
            maxDistance={8.0} 
            dampingFactor={0.06} 
          />

          {/* Edges */}
          {edges.map((e) => {
            const s = nodeMap.get(e.source);
            const t = nodeMap.get(e.target);
            if (!s || !t) return null;
            return (
              <GraphEdgeLine
                key={e.id}
                edge={e}
                sourcePos={[s.x, s.y, s.z ?? 0]}
                targetPos={[t.x, t.y, t.z ?? 0]}
                isReplaying={isReplayingTypology}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <NodeSphere
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onClick={() => setSelectedNode(node)}
            />
          ))}
        </Canvas>
      </div>

      {/* Selected Account Node Side Panel */}
      {selectedNode && (
        <div className="absolute right-6 top-20 z-30 w-88 glass-panel p-5 border border-white/15 shadow-2xl animate-fadeIn space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                selectedNode.riskScore >= 70 ? 'bg-risk-red animate-ping' : 'bg-sage'
              }`} />
              <h3 className="text-sm font-medium text-textOffWhite font-mono">
                {selectedNode.id}
              </h3>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              selectedNode.riskScore >= 70 
                ? 'bg-risk-red/20 text-risk-red border border-risk-red/30'
                : 'bg-sage/20 text-sage border border-sage/30'
            }`}>
              {selectedNode.riskScore.toFixed(1)} RISK
            </span>
          </div>

          <div className="text-xs text-textMuted font-light">
            {selectedNode.label}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] text-textMuted flex items-center gap-1">
                <ArrowDownLeft className="w-3 h-3 text-risk-mint" />
                <span>30d Inflow</span>
              </div>
              <div className="text-textOffWhite font-bold mt-1">
                ${selectedNode.inflow.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="text-[10px] text-textMuted flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-risk-amber" />
                <span>30d Outflow</span>
              </div>
              <div className="text-textOffWhite font-bold mt-1">
                ${selectedNode.outflow.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono space-y-1">
            <div className="flex justify-between text-textMuted">
              <span>Topological Cluster:</span>
              <span className={selectedNode.cluster === 'suspicious' ? 'text-risk-red' : 'text-sage'}>
                {selectedNode.cluster === 'suspicious' ? 'Flagged Layering Ring' : 'Institutional Tier-1'}
              </span>
            </div>
            <div className="flex justify-between text-textMuted">
              <span>Flagged Transfers:</span>
              <span className="text-textOffWhite font-bold">{selectedNode.flagCount} transactions</span>
            </div>
          </div>

          <button
            onClick={() => setView('queue')}
            className="w-full pill-btn-primary text-xs flex items-center justify-center gap-1.5 bg-white text-darkCanvas"
          >
            <span>Filter Queue for this Entity</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Footer Info */}
      <div className="relative z-20 px-6 pb-4 flex items-center justify-between text-xs text-textMuted pointer-events-none">
        <div className="glass-panel px-3 py-1.5 flex items-center gap-2 font-mono text-[11px] pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
          <span>Spheres sized by volume • Red wireframe indicates algorithmic layering ring</span>
        </div>
      </div>
    </div>
  );
};
