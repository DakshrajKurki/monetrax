import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAMLStore } from '../../store/useAMLStore';
import { 
  ArrowRight, 
  Sparkles, 
  Globe2, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Cpu, 
  Clock, 
  RefreshCw,
  Info,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Eye,
  BarChart2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { AnimatedCounter, pageVariants, staggerContainer, staggerItem } from '../common/MotionComponents';
import { KPICard } from '../common/KPICard';
import { ChartCard } from '../common/ChartCard';
import { COUNTRIES, MAJOR_CORRIDORS } from '../../data/mockSeed';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

export const HeroCommandView: React.FC = () => {
  const navigate = useNavigate();
  const transactions = useAMLStore((s) => s.transactions);
  const accounts = useAMLStore((s) => s.accounts);
  const liveKPIs = useAMLStore((s) => s.liveKPIs);
  const agentStatuses = useAMLStore((s) => s.agentStatuses);
  const liveAlertTicker = useAMLStore((s) => s.liveAlertTicker);
  const situationBrief = useAMLStore((s) => s.situationBrief);
  const isBriefGenerating = useAMLStore((s) => s.isBriefGenerating);
  const refreshSituationBrief = useAMLStore((s) => s.refreshSituationBrief);
  const selectTxn = useAMLStore((s) => s.selectTxn);
  const selectAccount = useAMLStore((s) => s.selectAccount);
  const flyToCase = useAMLStore((s) => s.flyToCase);

  const [geoTooltip, setGeoTooltip] = useState<string | null>(null);
  const [activeHeatmapCell, setActiveHeatmapCell] = useState<{ day: string; hour: number; count: number } | null>(null);

  // Risk breakdown
  const flagged = transactions.filter(t => t.riskScore >= 70).length;
  const medium = transactions.filter(t => t.riskScore >= 40 && t.riskScore < 70).length;
  const normal = Math.max(1, transactions.length - flagged - medium);

  const donutData = [
    { name: 'Normal (Benign)', value: normal, color: 'var(--live)' },
    { name: 'Medium Risk', value: medium, color: 'var(--risk-amber)' },
    { name: 'High / Critical', value: flagged, color: 'var(--risk-red)' },
  ];

  // Ingestion profile
  const trendData = [
    { time: '10:00', totalVolume: 1240, flaggedAlerts: 3 },
    { time: '10:05', totalVolume: 1380, flaggedAlerts: 4 },
    { time: '10:10', totalVolume: 1410, flaggedAlerts: 6 },
    { time: '10:15', totalVolume: 1390, flaggedAlerts: 2 },
    { time: '10:20', totalVolume: 1440, flaggedAlerts: 5 },
    { time: '10:25', totalVolume: 1420, flaggedAlerts: 7 },
    { time: '10:30', totalVolume: 1480, flaggedAlerts: liveKPIs.flaggedToday % 8 + 3 },
  ];

  // Typology Breakdown Chart Data
  const typologyCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Structuring: 0,
      'Cyclic Flow': 0,
      'Mule Network': 0,
      'Pass-Through': 0,
      'Dormant Burst': 0
    };
    transactions.forEach(t => {
      if (t.typology === 'structuring') counts.Structuring += 1;
      else if (t.typology === 'cyclic_flow') counts['Cyclic Flow'] += 1;
      else if (t.typology === 'mule_fan') counts['Mule Network'] += 1;
      else if (t.typology === 'rapid_passthrough') counts['Pass-Through'] += 1;
      else if (t.typology === 'dormant_burst') counts['Dormant Burst'] += 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [transactions]);

  // Top 10 Riskiest Accounts Leaderboard
  const topRiskyAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);
  }, [accounts]);

  // Heatmap generation (7 days x 24 hours) with strict 5% red / 20% amber thresholds
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapGrid = useMemo(() => {
    interface CellInfo {
      day: string;
      dIdx: number;
      hour: number;
      count: number;
      colorTier: 'red' | 'amber' | 'sage';
      opacity: number;
    }

    const flatCells: CellInfo[] = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        // Realistic distribution: peak activity in business hours
        const isPeak = h >= 9 && h <= 17;
        const count = isPeak ? 4 + ((d * 3 + h * 7) % 8) : 1 + ((d + h) % 3);
        flatCells.push({
          day: weekdays[d],
          dIdx: d,
          hour: h,
          count,
          colorTier: 'sage',
          opacity: 0.15 + (count / 12) * 0.5
        });
      }
    }

    // Sort descending by count, with stable tie-break
    const sortedIndices = flatCells
      .map((c, idx) => ({ idx, count: c.count, sortKey: c.count * 1000 + (c.dIdx * 24 + c.hour) }))
      .sort((a, b) => b.sortKey - a.sortKey);

    // Strict caps: Top 5% (8 cells) red, Next 20% (34 cells) amber, Remaining 75% sage
    const redCount = Math.round(flatCells.length * 0.05); // 8 cells
    const amberCount = Math.round(flatCells.length * 0.20); // 34 cells

    sortedIndices.forEach(({ idx }, rank) => {
      if (rank < redCount) {
        flatCells[idx].colorTier = 'red';
      } else if (rank < redCount + amberCount) {
        flatCells[idx].colorTier = 'amber';
      } else {
        flatCells[idx].colorTier = 'sage';
      }
    });

    // Reconstruct 7 x 24 2D grid
    const grid: CellInfo[][] = [];
    for (let d = 0; d < 7; d++) {
      grid.push(flatCells.filter(c => c.dIdx === d));
    }
    return grid;
  }, []);

  return (
    <div className="w-full flex flex-col gap-12 pb-16">
      {/* =========================================================================
          HERO SECTION (Matching Reference Image Pixel-for-Pixel)
          ========================================================================= */}
      <section className="relative min-h-[580px] w-full flex flex-col items-center justify-center pt-8 pb-12 select-none">
        
        {/* Floating Node Chips at the 4 Quadrants connected by subtle curved lines */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {/* Top-Left: Structuring Agent */}
          <div className="absolute left-6 top-16 pointer-events-auto">
            <div className="node-chip">
              <span className={`w-2 h-2 rounded-full ${agentStatuses[0].isFiring ? 'bg-[var(--risk-red)] animate-ping' : 'bg-[var(--sage-2)]'}`} />
              <div className="text-left font-mono">
                <span className="text-[11px] font-medium text-[var(--text)] block leading-tight">Structuring Agent</span>
                <span className="text-[9px] text-[var(--muted)]">{agentStatuses[0].activeCount} patterns</span>
              </div>
            </div>
            <svg className="absolute left-full top-1/2 w-44 h-16 pointer-events-none -translate-y-1/2 overflow-visible">
              <path
                d="M 0 0 C 60 0, 80 28, 160 28"
                fill="none"
                stroke="rgba(255, 255, 255, 0.09)"
                strokeWidth="1"
              />
              <circle cx="80" cy="14" r="2" fill="var(--sage-3)" />
            </svg>
          </div>

          {/* Bottom-Left: Cycle Detector */}
          <div className="absolute left-10 bottom-24 pointer-events-auto">
            <div className="node-chip">
              <span className={`w-2 h-2 rounded-full ${agentStatuses[1].isFiring ? 'bg-[var(--risk-amber)] animate-ping' : 'bg-[var(--sage-2)]'}`} />
              <div className="text-left font-mono">
                <span className="text-[11px] font-medium text-[var(--text)] block leading-tight">Cycle Detector</span>
                <span className="text-[9px] text-[var(--muted)]">{agentStatuses[1].activeCount} loops</span>
              </div>
            </div>
            <svg className="absolute left-full top-1/2 w-48 h-16 pointer-events-none -translate-y-1/2 overflow-visible">
              <path
                d="M 0 0 C 70 0, 90 -24, 180 -24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.09)"
                strokeWidth="1"
              />
              <circle cx="90" cy="-12" r="2" fill="var(--sage-3)" />
            </svg>
          </div>

          {/* Top-Right: Mule Radar */}
          <div className="absolute right-8 top-16 pointer-events-auto">
            <div className="node-chip">
              <span className={`w-2 h-2 rounded-full ${agentStatuses[2].isFiring ? 'bg-[var(--risk-red)] animate-ping' : 'bg-[var(--sage-2)]'}`} />
              <div className="text-left font-mono">
                <span className="text-[11px] font-medium text-[var(--text)] block leading-tight">Mule Radar</span>
                <span className="text-[9px] text-[var(--muted)]">{agentStatuses[2].activeCount} rings</span>
              </div>
            </div>
            <svg className="absolute right-full top-1/2 w-44 h-16 pointer-events-none -translate-y-1/2 overflow-visible">
              <path
                d="M 176 0 C 116 0, 96 28, 0 28"
                fill="none"
                stroke="rgba(255, 255, 255, 0.09)"
                strokeWidth="1"
              />
              <circle cx="88" cy="14" r="2" fill="var(--sage-3)" />
            </svg>
          </div>

          {/* Bottom-Right: Sanctions Screen */}
          <div className="absolute right-12 bottom-24 pointer-events-auto">
            <div className="node-chip">
              <span className="w-2 h-2 rounded-full bg-[var(--live)]" />
              <div className="text-left font-mono">
                <span className="text-[11px] font-medium text-[var(--text)] block leading-tight">Sanctions Screen</span>
                <span className="text-[9px] text-[var(--muted)]">0 hits (Clean)</span>
              </div>
            </div>
            <svg className="absolute right-full top-1/2 w-48 h-16 pointer-events-none -translate-y-1/2 overflow-visible">
              <path
                d="M 192 0 C 122 0, 102 -24, 0 -24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.09)"
                strokeWidth="1"
              />
              <circle cx="96" cy="-12" r="2" fill="var(--sage-3)" />
            </svg>
          </div>
        </div>

        {/* Ambient Vertical Falling Streaks */}
        <div className="ambient-streak left-[48%] h-36" style={{ top: '65%', animationDuration: '6s' }} />
        <div className="ambient-streak left-[50%] h-48" style={{ top: '60%', animationDuration: '8s', animationDelay: '1.5s' }} />
        <div className="ambient-streak left-[52%] h-32" style={{ top: '68%', animationDuration: '7s', animationDelay: '3s' }} />

        {/* Minimal Hero Center Content */}
        <div className="text-center z-10 max-w-3xl flex flex-col items-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-[var(--line)] text-xs text-[var(--sage-3)] font-mono mb-6">
            <Sparkles className="w-3 h-3 text-[var(--sage-3)]" />
            <span>Autonomous Asset Defense Active</span>
            <span className="text-[10px] text-[var(--muted)]">• 1,420 tx/min</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-light tracking-[-0.02em] text-[var(--text)] leading-[1.08]">
            One-click for <br className="hidden sm:inline" />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[var(--text)] via-[var(--sage-3)] to-[var(--sage-2)]">
              Asset Defense.
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base md:text-lg text-[var(--muted)] font-light max-w-xl leading-relaxed">
            Continuous surveillance fusing gradient boosted trees, unsupervised autoencoders, and graph neural network topology.
          </p>

          <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={() => navigate('/queue')}
              className="pill-btn-secondary text-sm"
            >
              <span>Explore Case Queue</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
            </button>

            <button
              onClick={() => navigate('/globe')}
              className="pill-btn-primary text-sm"
            >
              <span>Launch 3D Globe</span>
              <Globe2 className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Bottom Hero Indicators */}
        <div className="w-full flex items-center justify-between px-6 pt-16 text-xs text-[var(--muted)] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--live)] animate-pulse" />
            <span className="text-[11px]">01/04 • Real-time stream active</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider">Surveillance Horizon</span>
            <div className="w-20 h-1 bg-white/[0.08] rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-[var(--sage-2)] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LIVE ALERT TICKER
          ========================================================================= */}
      {liveAlertTicker && (
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-full glass-panel px-5 py-2.5 flex items-center justify-between gap-4 border border-[var(--risk-red)]/30 bg-[var(--risk-red)]/[0.04]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--risk-red)]/20 text-[var(--risk-red)] font-mono text-[10px] font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--risk-red)] animate-ping" />
              LIVE FLAG
            </span>
            <span className="text-xs font-mono font-medium text-[var(--text)] shrink-0">
              #{liveAlertTicker.id}
            </span>
            <span className="text-xs text-[var(--muted)] truncate">
              {liveAlertTicker.typologyLabel} — ${liveAlertTicker.amount.toLocaleString()} between{' '}
              <span 
                className="underline decoration-dotted cursor-help text-[var(--text)]"
                onMouseEnter={() => setGeoTooltip(liveAlertTicker.id)}
                onMouseLeave={() => setGeoTooltip(null)}
              >
                {liveAlertTicker.fromCity} ➔ {liveAlertTicker.toCity}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                flyToCase(liveAlertTicker.id);
                navigate(`/globe?case=${liveAlertTicker.id}&view=map`);
              }}
              className="text-xs text-[var(--sage-3)] hover:text-white font-medium flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-all"
            >
              <span>Show on Globe</span>
              <Globe2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                selectTxn(liveAlertTicker.id);
                navigate(`/detail/${liveAlertTicker.id}`);
              }}
              className="text-xs text-white font-medium flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] transition-all"
            >
              <span>Investigate</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          LIVE KPI ROW WITH SPARKLINES & PRE-FILTER LINKS (Wave 0 Display Rule)
          ========================================================================= */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <KPICard
          label="Throughput"
          value={liveKPIs.transactionsPerMin}
          suffix="tx/m"
          delta={liveKPIs.throughputDelta}
          sparklineData={liveKPIs.sparklineThroughput}
          icon={<Activity className="w-3.5 h-3.5 text-[var(--sage-2)]" />}
        />

        <KPICard
          label="Flagged Today"
          value={liveKPIs.flaggedToday}
          suffix="cases"
          delta={liveKPIs.flaggedDelta}
          sparklineData={liveKPIs.sparklineFlagged}
          filterParam={{ key: 'risk', value: 'critical' }}
          icon={<ShieldAlert className="w-3.5 h-3.5 text-[var(--risk-red)]" />}
        />

        <KPICard
          label="Open Cases"
          value={liveKPIs.openCases}
          suffix="active"
          delta={liveKPIs.openCasesDelta}
          sparklineData={liveKPIs.sparklineOpenCases}
          filterParam={{ key: 'status', value: 'New' }}
          icon={<Layers className="w-3.5 h-3.5 text-[var(--risk-amber)]" />}
        />

        <KPICard
          label="Model PR-AUC"
          value={liveKPIs.modelPrAuc}
          decimals={2}
          suffix="auc"
          delta={+1.4}
          sparklineData={[0.79, 0.80, 0.81, 0.82, 0.82, 0.83, 0.83]}
          filterParam={{ key: 'typology', value: 'structuring' }}
          icon={<Cpu className="w-3.5 h-3.5 text-[var(--sage-2)]" />}
        />

        <KPICard
          label="Triage SLA"
          value={liveKPIs.avgTimeToTriageMinutes}
          decimals={1}
          suffix="min"
          delta={-8.5}
          sparklineData={[2.4, 2.1, 1.9, 1.8, 1.6, 1.5, 1.4]}
          icon={<Clock className="w-3.5 h-3.5 text-[var(--live)]" />}
        />
      </motion.div>

      {/* =========================================================================
          TELEMETRY CHARTS & REAL-TIME DONUT & TYPOLOGY BREAKDOWN
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingestion Trend Area Chart */}
        <ChartCard
          title="Continuous Ingestion Velocity & Flag Rate"
          subtitle="Real-time multi-bank transaction stream against risk cutoff envelope"
          className="lg:col-span-2"
          headerAction={
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[var(--muted)]">
                <span className="w-2 h-2 rounded-full bg-[var(--sage-2)]" /> Volume
              </span>
              <span className="flex items-center gap-1.5 text-[var(--risk-red)]">
                <span className="w-2 h-2 rounded-full bg-[var(--risk-red)]" /> Flags
              </span>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="sageArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--sage-2)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--sage-2)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="redArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--risk-red)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--risk-red)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="var(--muted)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} 
              />
              <YAxis 
                stroke="var(--muted)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(11, 15, 13, 0.95)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: 'var(--text)',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="totalVolume" 
                stroke="var(--sage-2)" 
                strokeWidth={1.5} 
                fillOpacity={1} 
                fill="url(#sageArea)" 
              />
              <Area 
                type="monotone" 
                dataKey="flaggedAlerts" 
                stroke="var(--risk-red)" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#redArea)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Risk Donut Chart */}
        <ChartCard
          title="Stream Risk Profile"
          subtitle="Current evaluated transaction population across risk tiers"
        >
          <div className="relative h-44 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(11, 15, 13, 0.95)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: 'var(--text)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-light text-[var(--text)] font-sans tabular-nums">
                {transactions.length}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-mono">
                Evaluated
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-[var(--line)] font-mono w-full">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--live)]" />
              <span className="text-[var(--muted)] tabular-nums">{normal} Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--risk-amber)]" />
              <span className="text-[var(--muted)] tabular-nums">{medium} Med</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--risk-red)]" />
              <span className="text-[var(--risk-red)] font-medium tabular-nums">{flagged} Critical</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* =========================================================================
          WAVE 2: TYPOLOGY BREAKDOWN & ALERTS-BY-HOUR HEATMAP
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Typology Breakdown Bar Chart */}
        <ChartCard
          title="Isolated Typology Frequencies"
          subtitle="Distribution of algorithmic detections across active financial crime typologies"
          headerAction={
            <button
              onClick={() => navigate('/typologies')}
              className="text-xs text-[var(--sage-3)] hover:text-white flex items-center gap-1"
            >
              <span>Library</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={typologyCounts} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <XAxis type="number" stroke="var(--muted)" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="var(--muted)" fontSize={11} axisLine={false} tickLine={false} width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(11, 15, 13, 0.95)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: 'var(--text)',
                }}
              />
              <Bar dataKey="count" fill="var(--sage-2)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Alerts-By-Hour Heatmap (Hour x Weekday) - Compact 7x24 Grid <= 260px */}
        <ChartCard
          title="Alert Density Heatmap (Hour × Weekday)"
          subtitle="Hourly threat recurrence matrix across 30 days of continuous ingestion"
          headerAction={
            activeHeatmapCell && (
              <span className="text-[11px] font-mono text-[var(--risk-red)] bg-white/[0.04] px-2 py-0.5 rounded-full border border-[var(--line)]">
                {activeHeatmapCell.day} {String(activeHeatmapCell.hour).padStart(2, '0')}:00 — {activeHeatmapCell.count} alerts
              </span>
            )
          }
        >
          <div className="w-full overflow-x-auto pb-1 max-h-[220px]">
            <div className="heatmap-grid min-w-[580px]">
              {weekdays.map((day, dIdx) => (
                <React.Fragment key={day}>
                  <div className="h-[22px] flex items-center text-[10px] font-mono text-[var(--muted)]">
                    {day}
                  </div>
                  {heatmapGrid[dIdx].map(({ hour, count, colorTier, opacity }) => {
                    const bg = colorTier === 'red'
                      ? '#E5484D'
                      : colorTier === 'amber'
                      ? '#E8A33D'
                      : `rgba(127, 148, 136, ${opacity})`;

                    return (
                      <div
                        key={hour}
                        onMouseEnter={() => setActiveHeatmapCell({ day, hour, count })}
                        onMouseLeave={() => setActiveHeatmapCell(null)}
                        className="h-[22px] rounded-[2px] cursor-pointer transition-transform hover:scale-110 hover:z-20 border border-white/[0.04]"
                        style={{ backgroundColor: bg }}
                        title={`${day} ${String(hour).padStart(2, '0')}:00 UTC — ${count} anomalies`}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[var(--muted)] pl-[44px] pt-1.5">
              <span>00:00 UTC</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* =========================================================================
          WAVE 2: MINI WORLD MAP & TOP-10 RISKY ACCOUNTS LEADERBOARD
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini World Map */}
        <div className="glass-panel p-5 border border-[var(--line)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <h3 className="text-sm font-medium text-[var(--text)]">
                Global Threat Vector Map
              </h3>
              <p className="text-xs text-[var(--muted)] font-light">
                Settlement corridors with active AML alerts
              </p>
            </div>
            <button
              onClick={() => navigate('/globe')}
              className="text-xs text-[var(--sage-3)] hover:text-white flex items-center gap-1"
            >
              <span>3D Globe</span>
              <Globe2 className="w-3 h-3" />
            </button>
          </div>

          {/* SVG Map Projection */}
          <div className="relative h-52 w-full my-2 bg-[#080C0A] rounded-xl overflow-hidden border border-[var(--line)] flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 220">
              {/* Graticule lines */}
              <line x1="0" y1="110" x2="400" y2="110" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <line x1="200" y1="0" x2="200" y2="220" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <circle cx="200" cy="110" r="90" fill="none" stroke="rgba(127,148,136,0.1)" />

              {/* Major settlement nodes & arcs */}
              {MAJOR_CORRIDORS.slice(0, 6).map((c, i) => {
                const x1 = ((c.fromLng + 180) / 360) * 380 + 10;
                const y1 = ((90 - c.fromLat) / 180) * 200 + 10;
                const x2 = ((c.toLng + 180) / 360) * 380 + 10;
                const y2 = ((90 - c.toLat) / 180) * 200 + 10;
                const midX = (x1 + x2) / 2;
                const midY = Math.min(y1, y2) - 20;
                const matchedTxn = transactions.find(t => t.fromCity === c.fromCity || t.toCity === c.toCity) || transactions[i % transactions.length];

                return (
                  <g 
                    key={i}
                    className="cursor-pointer group"
                    onClick={() => {
                      if (matchedTxn) {
                        flyToCase(matchedTxn.id);
                        navigate(`/globe?case=${matchedTxn.id}&view=map`);
                      }
                    }}
                  >
                    <path
                      d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                      fill="none"
                      stroke={i === 0 ? 'var(--risk-red)' : 'var(--sage-2)'}
                      strokeWidth={1.4}
                      strokeOpacity={0.8}
                      className="group-hover:stroke-white group-hover:stroke-[2] transition-all"
                    />
                    <circle cx={x1} cy={y1} r={3.5} fill="var(--risk-amber)" className="group-hover:r-[5] transition-all" />
                    <circle cx={x2} cy={y2} r={3.5} fill="var(--risk-red)" className="group-hover:r-[5] transition-all" />
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-2 left-3 text-[9px] font-mono text-[var(--muted)] flex items-center gap-1.5 bg-[#0B0F0D]/90 px-2 py-0.5 rounded-full border border-[var(--line)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--risk-red)] animate-ping" />
              <span>12 Global Inter-Bank Corridors Active</span>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-[var(--muted)] font-mono flex items-center justify-between">
            <span>Simulated Surveillance Coordinates</span>
            <span className="text-[var(--sage-3)]">14 Active High Risk Vectors</span>
          </div>
        </div>

        {/* Top-10 Riskiest Accounts Leaderboard */}
        <div className="glass-panel p-5 border border-[var(--line)] flex flex-col justify-between col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <h3 className="text-sm font-medium text-[var(--text)]">
                Top Riskiest Accounts Leaderboard
              </h3>
              <p className="text-xs text-[var(--muted)] font-light">
                Highest risk score entities ranked across supervised ensemble & network centrality
              </p>
            </div>
            <button
              onClick={() => navigate('/queue')}
              className="text-xs text-[var(--sage-3)] hover:text-white flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto w-full my-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)] text-[10px] font-mono uppercase text-[var(--muted)]">
                  <th className="py-2 px-3 font-normal">Rank</th>
                  <th className="py-2 px-3 font-normal">Account ID</th>
                  <th className="py-2 px-3 font-normal">Entity Name</th>
                  <th className="py-2 px-3 font-normal">Bank</th>
                  <th className="py-2 px-3 font-normal">Risk Score</th>
                  <th className="py-2 px-3 font-normal">Balance</th>
                  <th className="py-2 px-3 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {topRiskyAccounts.map((acc, idx) => (
                  <tr key={acc.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-2.5 px-3 font-mono text-[var(--muted)]">#{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-white">{acc.id}</td>
                    <td className="py-2.5 px-3 text-[var(--text)]">{acc.entityName}</td>
                    <td className="py-2.5 px-3 text-[var(--muted)]">{acc.bank}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        acc.riskScore >= 80 
                          ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)] border border-[var(--risk-red)]/30' 
                          : 'bg-[var(--risk-amber)]/20 text-[var(--risk-amber)] border border-[var(--risk-amber)]/30'
                      }`}>
                        {acc.riskScore} / 100
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--text)] tabular-nums">{formatCurrency(acc.balance)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          selectAccount(acc.id);
                          navigate(`/account/${acc.id}`);
                        }}
                        className="text-[11px] text-[var(--sage-3)] hover:text-white font-medium inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                      >
                        <span>Account 360</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-[10px] text-[var(--muted)] font-mono flex items-center justify-between border-t border-[var(--line)]">
            <span>Ranked by continuous meta-learner risk score</span>
            <span className="text-[var(--live)]">Real-time surveillance window</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          AI SITUATION BRIEF CARD
          ========================================================================= */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-6 relative overflow-hidden border border-[var(--sage-2)]/25 bg-[var(--sage-2)]/[0.02]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[var(--sage-2)]/20 flex items-center justify-center text-[var(--sage-3)]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--text)]">
                  AI Situation Brief
                </h4>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] text-[var(--sage-3)] font-mono">
                  Autonomous Synthesis
                </span>
              </div>
              <p className="text-[10px] text-[var(--muted)]">
                Real-time regulatory synopsis of current stream dynamics
              </p>
            </div>
          </div>

          <button
            onClick={refreshSituationBrief}
            disabled={isBriefGenerating}
            className="text-xs text-[var(--sage-3)] hover:text-white font-mono flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isBriefGenerating ? 'animate-spin' : ''}`} />
            <span>{isBriefGenerating ? 'Synthesizing...' : 'Refresh Brief'}</span>
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[var(--text)]/90 font-light font-sans">
          {situationBrief}
        </p>

        <div className="mt-4 flex items-center justify-between text-[10px] text-[var(--muted)] pt-3 border-t border-[var(--line)] font-mono">
          <span>Grounding: 7 feature weights • 0.83 PR-AUC meta-learner</span>
          <span className="text-[var(--sage-3)]">AI-generated — verify before action</span>
        </div>
      </motion.div>

      {/* Simulated Geography Floating Tooltip */}
      {geoTooltip && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-[#0B0F0D] border border-[var(--line)] text-xs text-[var(--text)] shadow-2xl flex items-center gap-2 font-mono">
          <Info className="w-3.5 h-3.5 text-[var(--sage-3)]" />
          <span>The IBM AML benchmark contains mock geographic coordinates for simulation.</span>
        </div>
      )}
    </div>
  );
};
