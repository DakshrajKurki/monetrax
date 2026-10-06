import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  HardDrive, 
  Activity, 
  Cpu, 
  Server, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Pause,
  Database,
  Radio,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useAMLStore } from '../../store/useAMLStore';
import { pageVariants } from '../common/MotionComponents';
import { ChartCard } from '../common/ChartCard';
import { KPICard } from '../common/KPICard';

export const SystemHealthView: React.FC = () => {
  const isLiveStreaming = useAMLStore((s) => s.isLiveStreaming);
  const toggleLiveStream = useAMLStore((s) => s.toggleLiveStream);
  const liveKPIs = useAMLStore((s) => s.liveKPIs);
  const addToast = useAMLStore((s) => s.addToast);
  const transactions = useAMLStore((s) => s.transactions);

  const [isRetraining, setIsRetraining] = useState<boolean>(false);

  // Simulated latency telemetry points
  const latencyData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      time: `${i * 2}s ago`,
      latencyMs: +(0.85 + Math.sin(i * 0.7) * 0.28).toFixed(2),
      throughput: Math.round(14 + Math.sin(i * 0.5) * 3)
    }));
  }, []);

  // Population Stability Index (PSI) Feature Drift
  const psiFeatures = [
    { feature: 'structuring_score', label: 'Structuring Proximity (< $10k)', psi: 0.038, status: 'Stable', action: 'No action' },
    { feature: 'cyclic_flow_score', label: 'Graph Cycle Coefficient (A-B-C-A)', psi: 0.052, status: 'Stable', action: 'No action' },
    { feature: 'peer_cohort_zscore', label: 'Peer Cohort Velocity Divergence', psi: 0.074, status: 'Stable', action: 'Monitoring' },
    { feature: 'flow_imbalance', label: 'Net Flow Liquidation Imbalance', psi: 0.118, status: 'Moderate Shift', action: 'Retraining recommended' },
    { feature: 'benford_deviation', label: "Benford's Law Skew Deviation", psi: 0.031, status: 'Stable', action: 'No action' },
    { feature: 'from_count_24h', label: 'Unique Senders in 24h Window', psi: 0.045, status: 'Stable', action: 'No action' },
    { feature: 'log_amount', label: 'Log Transfer Magnitude', psi: 0.022, status: 'Stable', action: 'No action' },
  ];

  // Pipeline Worker Nodes
  const workerNodes = [
    { id: 'worker-us-east-1', region: 'US East (N. Virginia)', status: 'Online', cpu: '28%', mem: '1.4 / 4 GB', rate: '5.2 tx/s' },
    { id: 'worker-eu-west-1', region: 'EU West (Frankfurt)', status: 'Online', cpu: '34%', mem: '1.8 / 4 GB', rate: '4.8 tx/s' },
    { id: 'worker-ap-se-1', region: 'APAC (Singapore)', status: 'Online', cpu: '22%', mem: '1.2 / 4 GB', rate: '4.4 tx/s' },
  ];

  const handleTriggerRetraining = () => {
    setIsRetraining(true);
    addToast({
      title: 'ML Pipeline Triggered',
      message: 'Incremental model retraining scheduled over last 200,000 transactions',
      type: 'info'
    });
    setTimeout(() => {
      setIsRetraining(false);
      addToast({
        title: 'Retraining Complete',
        message: 'New XGBoost weights deployed to inference cluster (PSI normalized to 0.041)',
        type: 'success'
      });
    }, 3200);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full flex flex-col gap-6 pb-16"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-light text-[var(--text)] tracking-tight">
              System Infrastructure & Model Health
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--live)]/20 text-[var(--live)] font-mono font-medium border border-[var(--live)]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse" />
              <span>All Systems Operational</span>
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 font-light">
            Real-time inference latency telemetry, Population Stability Index (PSI) feature drift monitoring, and distributed streaming pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLiveStream}
            className={`pill-btn-secondary text-xs flex items-center gap-1.5 ${isLiveStreaming ? '' : 'border-[var(--risk-amber)] text-[var(--risk-amber)]'}`}
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveStreaming ? 'Pause Ingestion' : 'Resume Ingestion'}</span>
          </button>

          <button
            onClick={handleTriggerRetraining}
            disabled={isRetraining}
            className="pill-btn-primary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Calibrating...' : 'Trigger Model Retrain'}</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Inference Latency"
          value="0.94 ms"
          delta="-0.12 ms vs SLA"
          deltaType="positive"
          sparklineData={[1.2, 1.1, 1.05, 0.98, 0.96, 0.94]}
          subtitle="99th percentile: 1.82 ms"
        />
        <KPICard
          title="Ingestion Throughput"
          value={`${liveKPIs.transactionsPerMin} /min`}
          delta="Dynamic stream"
          deltaType="positive"
          sparklineData={[28, 30, 32, 34, 33, 35, 36]}
          subtitle="Peak capacity: 1,200 /min"
        />
        <KPICard
          title="Queue Backlog"
          value={`${liveKPIs.openCases} cases`}
          delta="Under SLA capacity"
          deltaType="positive"
          sparklineData={[18, 17, 16, 15, 14, 13, liveKPIs.openCases]}
          subtitle="Zero unassigned SLA breaches"
        />
        <KPICard
          title="Feature Drift Index"
          value="0.052 PSI"
          delta="Baseline stable"
          deltaType="positive"
          sparklineData={[0.04, 0.045, 0.048, 0.051, 0.052]}
          subtitle="Alert threshold: > 0.100 PSI"
        />
      </div>

      {/* Latency & Throughput Chart */}
      <ChartCard
        title="Real-Time Scoring Latency & Throughput Telemetry"
        subtitle="End-to-end processing duration from raw Kafka ingestion event to SHAP attribution output"
        dataWindow="last 40 seconds live telemetry"
      >
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--live)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--live)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="time" stroke="var(--muted)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}ms`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B0F0D',
                  borderColor: 'var(--line)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
              />
              <Area type="monotone" dataKey="latencyMs" stroke="var(--live)" fill="url(#latencyGrad)" strokeWidth={2} name="Scoring Latency (ms)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Population Stability Index (PSI) Feature Drift Table */}
      <div className="glass-panel overflow-hidden border border-[var(--line)]">
        <div className="p-4 border-b border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-white">
              Population Stability Index (PSI) Feature Drift
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Continuous divergence testing comparing current stream distributions against reference training baseline
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-[var(--live)]">PSI &lt; 0.10: Stable</span>
            <span className="text-[var(--risk-amber)]">0.10–0.20: Moderate</span>
            <span className="text-[var(--risk-red)]">&gt; 0.20: Severe</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase text-[var(--muted)] bg-white/[0.02]">
                <th className="py-3 px-4">Feature Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Current PSI</th>
                <th className="py-3 px-4">Stability Standing</th>
                <th className="py-3 px-4 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {psiFeatures.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-white">{item.feature}</td>
                  <td className="py-3 px-4 text-[var(--muted)] font-sans">{item.label}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${item.psi >= 0.1 ? 'text-[var(--risk-amber)]' : 'text-[var(--live)]'}`}>
                      {item.psi.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.psi >= 0.1 ? 'bg-[var(--risk-amber)]/20 text-[var(--risk-amber)]' : 'bg-[var(--live)]/20 text-[var(--live)]'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--muted)]">
                    {item.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distributed Worker Nodes */}
      <div className="glass-panel overflow-hidden border border-[var(--line)]">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">
              Distributed Streaming Inference Workers
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Multi-region worker nodes running real-time event parsing and XGBoost scoring
            </p>
          </div>
          <span className="label-small">
            3 Region Clusters Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase text-[var(--muted)] bg-white/[0.02]">
                <th className="py-3 px-4">Node Identifier</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Cluster Status</th>
                <th className="py-3 px-4">CPU Utilization</th>
                <th className="py-3 px-4">Memory Footprint</th>
                <th className="py-3 px-4 text-right">Throughput Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {workerNodes.map((w) => (
                <tr key={w.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-white font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--live)]" />
                    <span>{w.id}</span>
                  </td>
                  <td className="py-3 px-4 text-[var(--muted)]">{w.region}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--live)]/20 text-[var(--live)] font-bold">
                      {w.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--text)]">{w.cpu}</td>
                  <td className="py-3 px-4 text-[var(--muted)]">{w.mem}</td>
                  <td className="py-3 px-4 text-right font-bold text-[var(--sage-3)]">{w.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
