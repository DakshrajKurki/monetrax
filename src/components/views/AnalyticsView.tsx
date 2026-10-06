import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Download, 
  Users, 
  Globe2, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAMLStore } from '../../store/useAMLStore';
import { pageVariants } from '../common/MotionComponents';
import { ChartCard } from '../common/ChartCard';
import { KPICard } from '../common/KPICard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const transactions = useAMLStore((s) => s.transactions);
  const liveKPIs = useAMLStore((s) => s.liveKPIs);
  const addToast = useAMLStore((s) => s.addToast);

  // False-Positive Rate 30-day simulated historical trend
  const fprTrendData = useMemo(() => {
    const data = [];
    for (let day = 30; day >= 1; day--) {
      const d = new Date(Date.now() - day * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Declining FPR curve as model learns
      const baseFPR = 24.2 - (30 - day) * 0.38 + Math.sin(day) * 1.2;
      data.push({
        date: d,
        fpr: +Math.max(8.5, baseFPR).toFixed(1),
        target: 12.0
      });
    }
    return data;
  }, []);

  // Alert Resolution Funnel
  const funnelData = useMemo(() => [
    { stage: '1. Ingested Transactions', count: transactions.length, pct: '100%' },
    { stage: '2. Ensemble Model Flagged', count: transactions.filter(t => t.riskScore >= 40).length, pct: '7.8%' },
    { stage: '3. Priority Queue Assigned', count: transactions.filter(t => t.riskScore >= 70).length, pct: '3.2%' },
    { stage: '4. Full SAR Drafts Filed', count: 18, pct: '0.8%' }
  ], [transactions]);

  // Analyst Workload Distribution
  const analystWorkload = useMemo(() => [
    { name: 'Elena Vance', active: 34, closed: 112, avgTimeMin: 14.2 },
    { name: 'Marcus Chen', active: 28, closed: 98, avgTimeMin: 16.5 },
    { name: 'Sarah Jenkins', active: 22, closed: 84, avgTimeMin: 12.8 },
    { name: 'Alex Rivera', active: 19, closed: 76, avgTimeMin: 18.0 }
  ], []);

  // Corridor Flow breakdown
  const corridorFlows = useMemo(() => [
    { corridor: 'US ➔ UK', volume: 4850000, riskShare: 18.4 },
    { corridor: 'UK ➔ CH', volume: 3920000, riskShare: 24.1 },
    { corridor: 'DE ➔ SG', volume: 3410000, riskShare: 14.8 },
    { corridor: 'US ➔ PA', volume: 2980000, riskShare: 32.5 },
    { corridor: 'AE ➔ CY', volume: 2850000, riskShare: 28.9 },
    { corridor: 'SG ➔ HK', volume: 2600000, riskShare: 11.2 }
  ], []);

  const handleExportExecutiveReport = () => {
    const report = {
      title: 'Monetrax Executive AML Performance & Compliance Audit Report',
      generatedAt: new Date().toISOString(),
      metrics: {
        totalHistoricalVolume: transactions.length,
        currentFPR: '11.8%',
        meanTimeToTriageMinutes: 14.5,
        slaComplianceRate: '98.2%',
        activeAnalystHeadcount: 4,
        sarFilingConversionRate: '0.88%'
      },
      funnel: funnelData,
      analysts: analystWorkload
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Executive_AML_Report_${Date.now()}.json`;
    link.click();
    addToast({
      title: 'Report Generated',
      message: 'Downloaded executive compliance and FPR audit summary',
      type: 'success'
    });
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
              Operational Analytics & Compliance Reporting
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--sage-2)]/20 text-[var(--sage-2)] font-mono font-medium border border-[var(--sage-2)]/30">
              30-Day Aggregation
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 font-light">
            Comprehensive false-positive reduction trends, SLA compliance metrics, and analyst throughput telemetry.
          </p>
        </div>

        <button
          onClick={handleExportExecutiveReport}
          className="pill-btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Executive Summary</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="False Positive Rate"
          value="11.8%"
          delta="-4.6% vs last mo"
          deltaType="positive"
          sparklineData={[24, 22, 21, 19, 18, 16, 14, 13, 11.8]}
          subtitle="Target benchmark: < 12.0%"
        />
        <KPICard
          title="Mean Time To Triage"
          value="14.5 min"
          delta="-2.8 min vs target"
          deltaType="positive"
          sparklineData={[24, 21, 19, 18, 17, 16, 15, 14.5]}
          subtitle="Avg first-response latency"
        />
        <KPICard
          title="SLA Compliance"
          value="98.4%"
          delta="+1.2% period delta"
          deltaType="positive"
          sparklineData={[94, 95, 96, 96, 97, 98, 98.4]}
          subtitle="24h resolution standard"
        />
        <KPICard
          title="SAR Escalation Yield"
          value="18.2%"
          delta="+3.1% precision"
          deltaType="positive"
          sparklineData={[12, 13, 14, 15, 16, 17, 18.2]}
          subtitle="Alerts converting to SAR"
        />
      </div>

      {/* Charts Grid: FPR Trend & Alert Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="False-Positive Rate (FPR) 30-Day Trajectory"
          subtitle="Continuous decline in false alerts following SHAP-guided model calibration"
          dataWindow="last 30 days, actual vs target"
        >
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fprTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fprGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--sage-2)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--sage-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="var(--muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 30]} stroke="var(--muted)" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F0D',
                    borderColor: 'var(--line)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Area type="monotone" dataKey="fpr" stroke="var(--sage-2)" fill="url(#fprGrad)" strokeWidth={2} name="Model FPR (%)" />
                <Line type="monotone" dataKey="target" stroke="var(--risk-red)" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Target Threshold" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Alert Resolution Funnel */}
        <div className="glass-panel p-6 border border-[var(--line)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-sm font-medium text-white">
                  Compliance Alert Funnel
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Filtration stages from raw settlement ingest to filed SARs
                </p>
              </div>
              <span className="label-small">End-to-End Triage</span>
            </div>

            <div className="space-y-3 mt-4">
              {funnelData.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-[var(--line)]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-white">{f.stage}</span>
                    <span className="font-mono font-bold text-[var(--sage-3)]">{f.count.toLocaleString()} cases</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-[var(--sage-2)] h-full"
                      style={{ width: f.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--line)] text-xs text-[var(--muted)] font-mono flex items-center justify-between">
            <span>Overall Ingest-to-SAR Ratio: 0.88%</span>
            <span className="text-[var(--live)] font-bold">99.12% Noise Reduction</span>
          </div>
        </div>
      </div>

      {/* Compliance Analyst Workload Table */}
      <div className="glass-panel overflow-hidden border border-[var(--line)]">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">
              Compliance Analyst Team Distribution
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Real-time assignment, resolution velocity, and mean triage latency per investigator
            </p>
          </div>
          <span className="label-small">
            4 Active Investigators
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase font-mono text-[var(--muted)] bg-white/[0.02]">
                <th className="py-3 px-4">Investigator Name</th>
                <th className="py-3 px-4">Active Queue</th>
                <th className="py-3 px-4">Cases Closed (30d)</th>
                <th className="py-3 px-4">Mean Triage Latency</th>
                <th className="py-3 px-4">SLA Standing</th>
                <th className="py-3 px-4 text-right">Team Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {analystWorkload.map((a, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px]">
                        {a.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{a.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">{a.active} cases</td>
                  <td className="py-3 px-4 font-mono text-[var(--sage-3)]">{a.closed} cleared</td>
                  <td className="py-3 px-4 font-mono">{a.avgTimeMin} min/case</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--live)]/20 text-[var(--live)] font-mono font-bold">
                      100% IN-SLA
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[var(--muted)]">
                    {Math.round((a.closed / 370) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Cross-Border Corridor Volumes */}
      <div className="glass-panel overflow-hidden border border-[var(--line)]">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">
              Cross-Border Settlement Corridors
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Gross throughput and high-risk concentration percentages across major clearing pathways
            </p>
          </div>
          <span className="label-small">
            SWIFT / Fedwire / SEPA
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase text-[var(--muted)] bg-white/[0.02]">
                <th className="py-3 px-4">Clearing Corridor</th>
                <th className="py-3 px-4">Gross 30d Settlement</th>
                <th className="py-3 px-4">Elevated Risk Share</th>
                <th className="py-3 px-4">Supervisory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {corridorFlows.map((c, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{c.corridor}</td>
                  <td className="py-3 px-4 text-white font-bold">{formatCurrency(c.volume)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      c.riskShare >= 25 ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)] font-bold' : 'bg-[var(--risk-amber)]/20 text-[var(--risk-amber)]'
                    }`}>
                      {c.riskShare}% Elevated
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--muted)] font-sans">
                    {c.riskShare >= 25 ? 'Enhanced Due Diligence (EDD)' : 'Standard Routine Oversight'}
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
