import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  DollarSign, 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  Globe2, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useAMLStore } from '../../store/useAMLStore';
import { PageHeader } from '../common/PageHeader';
import { StatCard } from '../common/StatCard';
import { Card } from '../common/Card';
import { PillToggle } from '../common/PillToggle';
import { StatusPill } from '../common/StatusPill';
import { Dropdown } from '../common/Dropdown';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

export const HeroCommandView: React.FC = () => {
  const navigate = useNavigate();
  const transactions = useAMLStore((s) => s.transactions);
  const liveKPIs = useAMLStore((s) => s.liveKPIs);
  const selectTxn = useAMLStore((s) => s.selectTxn);
  const flyToCase = useAMLStore((s) => s.flyToCase);
  const openAutoTriageModal = useAMLStore((s) => s.openAutoTriageModal);
  const addToast = useAMLStore((s) => s.addToast);

  // Alert volume chart timeframe switcher (Monthly, Weekly, Daily)
  const [chartView, setChartView] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(2); // Default to March (index 2) like in reference!
  const [tableSearch, setTableSearch] = useState('');

  // --------------------------------------------------------------------------
  // Row 1 Metrics
  // --------------------------------------------------------------------------
  const openCasesCount = transactions.filter(t => t.riskScore >= 70 && (t.status === 'New' || t.status === 'Under Review')).length || 66;
  const fundsAtRisk = transactions
    .filter(t => t.riskScore >= 60)
    .reduce((acc, t) => acc + t.amount, 0) || 4820500;
  const detectionRate = 98.4;

  // --------------------------------------------------------------------------
  // Row 2 Left: 4 Flagged Corridors (2x2 grid matching reference's "My Wallet")
  // --------------------------------------------------------------------------
  const topCorridorCases = useMemo(() => {
    // Select 4 distinct high-risk cases across corridors
    const critical = transactions.filter(t => t.riskScore >= 60);
    return critical.slice(0, 4);
  }, [transactions]);

  // Handle Fly to Location from corridor card
  const handleFlyToCorridor = (caseId: string) => {
    flyToCase(caseId);
    navigate(`/globe?case=${caseId}&view=map`);
  };

  // --------------------------------------------------------------------------
  // Row 2 Right: Alert Volume Bar Chart Data
  // --------------------------------------------------------------------------
  const chartData = useMemo(() => {
    if (chartView === 'weekly') {
      return [
        { label: 'Mon', value: 240, flaggedCount: 14, riskValue: 420000, date: 'Oct 20, 2026' },
        { label: 'Tue', value: 310, flaggedCount: 19, riskValue: 580000, date: 'Oct 21, 2026' },
        { label: 'Wed', value: 480, flaggedCount: 38, riskValue: 1240000, date: 'Oct 22, 2026' },
        { label: 'Thu', value: 390, flaggedCount: 22, riskValue: 690000, date: 'Oct 23, 2026' },
        { label: 'Fri', value: 520, flaggedCount: 41, riskValue: 1450000, date: 'Oct 24, 2026' },
        { label: 'Sat', value: 180, flaggedCount: 9, riskValue: 210000, date: 'Oct 25, 2026' },
        { label: 'Sun', value: 210, flaggedCount: 12, riskValue: 310000, date: 'Oct 26, 2026' },
      ];
    } else if (chartView === 'daily') {
      return [
        { label: '00:00', value: 40, flaggedCount: 2, riskValue: 45000, date: 'Today 00:00' },
        { label: '04:00', value: 65, flaggedCount: 4, riskValue: 92000, date: 'Today 04:00' },
        { label: '08:00', value: 190, flaggedCount: 15, riskValue: 380000, date: 'Today 08:00' },
        { label: '12:00', value: 340, flaggedCount: 28, riskValue: 840000, date: 'Today 12:00' },
        { label: '16:00', value: 420, flaggedCount: 35, riskValue: 960000, date: 'Today 16:00' },
        { label: '20:00', value: 280, flaggedCount: 19, riskValue: 510000, date: 'Today 20:00' },
      ];
    }
    // Monthly (matching reference: Jan, Feb, Mar, Apr, May, Jun, Jul)
    return [
      { label: 'Jan', value: 28000, flaggedCount: 112, riskValue: 2850000, date: 'Jan 2026' },
      { label: 'Feb', value: 32000, flaggedCount: 138, riskValue: 3410000, date: 'Feb 2026' },
      { label: 'Mar', value: 48500, flaggedCount: 224, riskValue: 540323, date: 'Mar 2026' },
      { label: 'Apr', value: 36000, flaggedCount: 154, riskValue: 3890000, date: 'Apr 2026' },
      { label: 'May', value: 41000, flaggedCount: 189, riskValue: 4200000, date: 'May 2026' },
      { label: 'Jun', value: 29000, flaggedCount: 120, riskValue: 2980000, date: 'Jun 2026' },
      { label: 'Jul', value: 34000, flaggedCount: 145, riskValue: 3620000, date: 'Jul 2026' },
    ];
  }, [chartView]);

  // Total volume display value
  const totalAlertVolumeDisplay = chartView === 'monthly' ? '$540,323.45' : chartView === 'weekly' ? '2,330 Alerts' : '1,335 Alerts';

  // --------------------------------------------------------------------------
  // Row 3: Recent Cases Table Data
  // --------------------------------------------------------------------------
  const filteredCases = useMemo(() => {
    let result = transactions;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      result = result.filter(
        t => t.id.toLowerCase().includes(q) ||
             t.toCity.toLowerCase().includes(q) ||
             t.fromCity.toLowerCase().includes(q) ||
             t.typologyLabel.toLowerCase().includes(q)
      );
    }
    return result.slice(0, 8);
  }, [transactions, tableSearch]);

  return (
    <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto">
      {/* =======================================================================
          PAGE HEADER: Title, Subtitle, Period Picker & Reset
          ======================================================================= */}
      <PageHeader
        title="Command Center"
        subtitle="Real-time AML surveillance, automated threat telemetry, and high-risk corridor tracking"
      />

      {/* =======================================================================
          ROW 1: THREE HERO STAT CARDS (matching reference proportions)
          ======================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Orange Gradient Hero Card (matching reference's My balance) */}
        <StatCard
          variant="orange"
          icon={<ShieldAlert className="w-5 h-5 text-white" />}
          title="Open Cases"
          subtitle="Active Threat Queue"
          value={openCasesCount}
          delta="+15% ↑"
          deltaPositive={true}
          footerText="See details"
          onFooterClick={() => navigate('/queue')}
          onMenuClick={() => navigate('/queue')}
        />

        {/* Card 2: Funds at Risk (matching reference's Savings account) */}
        <StatCard
          variant="glass"
          icon={<DollarSign className="w-5 h-5 text-[#FF6A2B]" />}
          title="Funds at Risk"
          subtitle="Isolated Threat Volume"
          value={formatCurrency(fundsAtRisk)}
          delta="+3.2% ↑"
          deltaPositive={true}
          footerText="View summary"
          onFooterClick={() => navigate('/queue')}
          onMenuClick={() => addToast('Threat Volume', `Total exposed value: ${formatCurrency(fundsAtRisk)}`, 'info')}
        />

        {/* Card 3: Detection Rate (matching reference's Investment portfolio) */}
        <StatCard
          variant="glass"
          icon={<Cpu className="w-5 h-5 text-[#4ADE9A]" />}
          title="Detection Rate"
          subtitle="Model Precision & PR-AUC"
          value="98.4"
          suffix="%"
          delta="-0.7% ↓"
          deltaPositive={false}
          footerText="Analyze performance"
          onFooterClick={() => navigate('/model')}
          onMenuClick={() => navigate('/model')}
        />
      </div>

      {/* =======================================================================
          ROW 2: TWO PANELS (Flagged Corridors 2x2 Grid + Alert Volume Bar Chart)
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Flagged Corridors (4 compact cards in a 2x2 grid, matching My Wallet) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <Card className="h-full p-5 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <span>Flagged Corridors</span>
                  <span className="w-2 h-2 rounded-full bg-[#E5484D] animate-ping" />
                </h3>
                <p className="text-xs text-[var(--caption)] mt-0.5">Click to fly on 3D globe</p>
              </div>

              <button
                onClick={() => navigate('/globe')}
                className="pill-btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-sm"
              >
                <span>3D Stage</span>
                <Globe2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2x2 Grid of Corridor Cards matching reference's USD/EUR/AUD/GBP cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {topCorridorCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleFlyToCorridor(c.id)}
                  className="group relative p-3.5 rounded-[14px] bg-[#161619]/80 hover:bg-[#1C1C21] border border-white/[0.07] hover:border-[#FF6A2B]/40 transition-all cursor-pointer flex flex-col justify-between shadow-sm"
                >
                  {/* Top: Route Header + Flight Pin */}
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm">🌐</span>
                      <span className="text-xs font-semibold text-white truncate">
                        {c.fromCountry} ➔ {c.toCountry}
                      </span>
                    </div>

                    <div className="w-6 h-6 rounded-full bg-white/[0.06] group-hover:bg-[#FF6A2B]/20 text-[var(--caption)] group-hover:text-[#FF6A2B] flex items-center justify-center transition-colors shrink-0">
                      <MapPin className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Middle: Amount & Route Cities */}
                  <div className="my-1">
                    <div className="text-base font-semibold font-mono text-white tracking-tight">
                      ${c.amount.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[var(--caption)] truncate mt-0.5">
                      {c.fromCity} ➔ {c.toCity}
                    </div>
                  </div>

                  {/* Bottom: Risk Pill & Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] mt-2 text-[10px]">
                    <StatusPill score={c.riskScore} size="xs" />
                    <span className="font-mono text-[#4ADE9A] font-medium">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Alert Volume Bar Chart (matching Cash Flow from reference) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <Card className="h-full p-5 flex flex-col justify-between">
            {/* Header: Title + Big Value + Pill Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08] mb-3">
              <div>
                <span className="text-xs text-[var(--caption)] font-medium uppercase tracking-wider">
                  Alert Volume & Threat Inflow
                </span>
                <div className="text-2xl font-semibold font-mono text-white tracking-tight mt-0.5">
                  {totalAlertVolumeDisplay}
                </div>
              </div>

              {/* Pill Switcher: Monthly / Weekly / Daily */}
              <PillToggle
                options={[
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'daily', label: 'Daily' },
                ]}
                selectedId={chartView}
                onChange={(id) => setChartView(id as any)}
              />
            </div>

            {/* Modern Bar Chart with Orange Gradient Highlight on Hover */}
            <div className="relative w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  onMouseMove={(state) => {
                    if (state && state.activeTooltipIndex !== undefined) {
                      setHoveredBarIndex(state.activeTooltipIndex);
                    }
                  }}
                  onMouseLeave={() => setHoveredBarIndex(2)} // Keep March highlighted on exit
                  margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    {/* Orange Gradient for Selected / Hovered Bar */}
                    <linearGradient id="brandBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6A2B" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FF4D1A" stopOpacity={0.75} />
                    </linearGradient>

                    {/* Dark Bar Gradient for Inactive Bars */}
                    <linearGradient id="darkBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.12)" stopOpacity={1} />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.03)" stopOpacity={1} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />

                  {/* Floating Tooltip matching Reference Image Tooltip Card */}
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-[#121215]/95 border border-white/15 shadow-2xl backdrop-blur-xl text-xs font-sans min-w-[170px]">
                            <div className="text-[11px] text-[var(--caption)] mb-1 font-mono">
                              {data.date}
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-[var(--muted)]">Volume:</span>
                              <span className="font-mono font-semibold text-white">
                                {data.value.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-[var(--muted)]">Flagged:</span>
                              <span className="font-mono font-semibold text-[#FF6A2B]">
                                {data.flaggedCount} alerts
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-0.5">
                              <span className="text-[var(--muted)]">At Risk:</span>
                              <span className="font-mono font-semibold text-white">
                                ${(data.riskValue).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Bar dataKey="value" radius={[8, 8, 4, 4]} maxBarSize={48}>
                    {chartData.map((entry, index) => {
                      const isHovered = hoveredBarIndex === index;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isHovered ? 'url(#brandBarGradient)' : 'url(#darkBarGradient)'}
                          stroke={isHovered ? 'rgba(255,106,43,0.5)' : 'rgba(255,255,255,0.06)'}
                          strokeWidth={isHovered ? 1.5 : 1}
                          style={{
                            filter: isHovered ? 'drop-shadow(0 0 12px rgba(255,106,43,0.55))' : 'none',
                            transition: 'all 0.25s ease'
                          }}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* =======================================================================
          ROW 3: RECENT CASES TABLE (matching Recent Activities in reference)
          ======================================================================= */}
      <Card className="p-5">
        {/* Table Header Row: Title + Search + Filter + Auto-Triage Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">Recent Cases</h3>
            <p className="text-xs text-[var(--caption)] mt-0.5">Live surveillance feed & anomalous clusters</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Table Search Input matching reference */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 rounded-full bg-[#161619] border border-white/[0.08] hover:border-white/20 text-xs text-white placeholder:text-[var(--caption)] focus:outline-none focus:border-[#FF6A2B] transition-all w-36 sm:w-48 font-sans"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => navigate('/queue')}
              className="px-3 py-1.5 rounded-full bg-[#161619] border border-white/[0.08] hover:border-white/20 text-xs font-medium text-[var(--muted)] hover:text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Filter className="w-3 h-3 text-[var(--caption)]" />
              <span>Filter</span>
            </button>

            {/* Auto-Triage Button with Sparkle Icon (Requested in prompt) */}
            <button
              onClick={openAutoTriageModal}
              className="pill-btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5 border-[#FF6A2B]/30 hover:border-[#FF6A2B]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF6A2B]" />
              <span>Auto-Triage</span>
            </button>
          </div>
        </div>

        {/* Clean Responsive Table matching reference */}
        <div className="overflow-x-auto scrollbar-thin mt-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-mono text-[var(--caption)] uppercase">
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Corridor</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Risk</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredCases.map((txn) => {
                const dateObj = new Date(txn.timestamp);
                const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr
                    key={txn.id}
                    onClick={() => {
                      selectTxn(txn.id);
                      navigate(`/detail/${txn.id}`);
                    }}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* Case ID with subtle icon */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-white/[0.05] text-[var(--caption)] group-hover:text-[#FF6A2B] group-hover:bg-[#FF6A2B]/10 flex items-center justify-center font-mono text-[10px] transition-colors">
                          #
                        </span>
                        <span className="font-mono font-semibold text-white group-hover:text-[#FF6A2B] transition-colors">
                          {txn.id}
                        </span>
                      </div>
                    </td>

                    {/* Corridor */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-[var(--text)]">
                        <span>{txn.fromCity}</span>
                        <span className="text-[var(--caption)]">➔</span>
                        <span>{txn.toCity}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-[var(--muted)] font-mono">
                      {formattedDate}
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-3 text-[var(--caption)] font-mono">
                      {formattedTime}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 font-mono font-semibold text-white">
                      ${txn.amount.toLocaleString()}
                    </td>

                    {/* Risk Score Pill */}
                    <td className="py-3.5 px-3">
                      <StatusPill score={txn.riskScore} size="xs" />
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-3">
                      <StatusPill
                        type={
                          txn.status === 'Cleared'
                            ? 'cleared'
                            : txn.status === 'Escalated'
                            ? 'escalated'
                            : txn.status === 'Under Review'
                            ? 'under_review'
                            : 'new'
                        }
                        label={txn.status}
                        showDot={true}
                        size="xs"
                      />
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleFlyToCorridor(txn.id)}
                          className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-[#FF6A2B]/20 hover:text-[#FF6A2B] text-[var(--caption)] flex items-center justify-center transition-colors"
                          title="Fly to Location on 3D Globe"
                        >
                          <Globe2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            selectTxn(txn.id);
                            navigate(`/detail/${txn.id}`);
                          }}
                          className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/10 text-[var(--caption)] hover:text-white flex items-center justify-center transition-colors"
                          title="Investigate Case"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
