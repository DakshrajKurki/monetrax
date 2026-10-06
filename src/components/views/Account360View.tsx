import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  ShieldAlert, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Activity, 
  TrendingUp, 
  FileText, 
  ExternalLink, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Download,
  Globe2
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
  Bar
} from 'recharts';
import { useAMLStore } from '../../store/useAMLStore';
import { pageVariants } from '../common/MotionComponents';
import { ChartCard } from '../common/ChartCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const Account360View: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const accounts = useAMLStore((s) => s.accounts);
  const transactions = useAMLStore((s) => s.transactions);
  const selectedAccountId = useAMLStore((s) => s.selectedAccountId);
  const selectAccount = useAMLStore((s) => s.selectAccount);
  const selectTxn = useAMLStore((s) => s.selectTxn);
  const flyToCase = useAMLStore((s) => s.flyToCase);
  const addToast = useAMLStore((s) => s.addToast);

  // Match account from URL or store or default to first account
  const activeAccount = useMemo(() => {
    const targetId = id || selectedAccountId || 'ACCT-JPMC-100';
    return accounts.find((a) => a.id === targetId) || accounts[0];
  }, [id, selectedAccountId, accounts]);

  // Linked cases for this account
  const linkedCases = useMemo(() => {
    return transactions.filter(
      (t) => (t.fromAccount === activeAccount.id || t.toAccount === activeAccount.id) && t.riskScore >= 40
    );
  }, [transactions, activeAccount.id]);

  // Velocity drift computation
  const velocityDriftPercent = useMemo(() => {
    if (!activeAccount.baselineVelocity7d) return 0;
    return (
      ((activeAccount.currentVelocity24h - activeAccount.baselineVelocity7d) /
        activeAccount.baselineVelocity7d) *
      100
    );
  }, [activeAccount]);

  const handleExportDossier = () => {
    const jsonStr = JSON.stringify(activeAccount, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Account_Dossier_${activeAccount.id}.json`;
    link.click();
    addToast({
      title: 'Dossier Exported',
      message: `Exported complete compliance record for ${activeAccount.id}`,
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
      {/* Header Profile Card */}
      <div className="glass-panel p-6 border border-[var(--line)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-[var(--line)] flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-[var(--sage-2)]" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-light text-[var(--text)] tracking-tight">
                {activeAccount.entityName}
              </h2>
              <span className="font-mono text-xs text-[var(--muted)] px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-[var(--line)]">
                {activeAccount.id}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                  activeAccount.watchlistStatus === 'Sanctions Hit'
                    ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)] border border-[var(--risk-red)]/30'
                    : activeAccount.watchlistStatus === 'PEP Watch'
                    ? 'bg-[var(--risk-amber)]/20 text-[var(--risk-amber)] border border-[var(--risk-amber)]/30'
                    : 'bg-[var(--live)]/20 text-[var(--live)] border border-[var(--live)]/30'
                }`}
              >
                {activeAccount.watchlistStatus}
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mt-1 font-light">
              {activeAccount.bank} • {activeAccount.city}, {activeAccount.country} ({activeAccount.countryCode}) • {activeAccount.accountType} Tier
            </p>
          </div>
        </div>

        {/* Action Controls & Account Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={activeAccount.id}
            onChange={(e) => {
              selectAccount(e.target.value);
              navigate(`/account/${e.target.value}`);
            }}
            className="glass-panel px-3 py-2 text-xs text-[var(--text)] bg-transparent border border-[var(--line)] rounded-full focus:outline-none cursor-pointer"
          >
            {accounts.slice(0, 30).map((a) => (
              <option key={a.id} value={a.id} className="bg-[#0B0F0D]">
                {a.id} - {a.entityName.substring(0, 24)}...
              </option>
            ))}
          </select>

          <button
            onClick={handleExportDossier}
            className="pill-btn-secondary text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Dossier</span>
          </button>

          <button
            onClick={() => {
              navigate('/sanctions');
              addToast({ title: 'Watchlist Screening', message: `Screening ${activeAccount.entityName}`, type: 'info' });
            }}
            className="pill-btn-primary text-xs flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Screen Watchlist</span>
          </button>
        </div>
      </div>

      {/* KPI & Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Score */}
        <div className="glass-panel p-5 border border-[var(--line)]">
          <span className="text-xs text-[var(--muted)] uppercase font-mono block">Unified Risk Rating</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`text-3xl font-mono font-bold ${
                activeAccount.riskScore >= 70 ? 'text-[var(--risk-red)]' : activeAccount.riskScore >= 40 ? 'text-[var(--risk-amber)]' : 'text-[var(--live)]'
              }`}
            >
              {activeAccount.riskScore.toFixed(1)}
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">/ 100</span>
          </div>
          <span className="text-[11px] text-[var(--muted)] mt-1 block">
            {activeAccount.riskScore >= 70 ? 'Critical AML Attention Required' : 'Standard Routine Surveillance'}
          </span>
        </div>

        {/* Balance & Velocity */}
        <div className="glass-panel p-5 border border-[var(--line)]">
          <span className="text-xs text-[var(--muted)] uppercase font-mono block">Liquid Balance</span>
          <div className="text-3xl font-mono font-bold text-white mt-2">
            {formatCurrency(activeAccount.balance)}
          </div>
          <span className="text-[11px] text-[var(--muted)] mt-1 block">
            Settled Ledger Assets
          </span>
        </div>

        {/* 24h Velocity Drift */}
        <div className="glass-panel p-5 border border-[var(--line)]">
          <span className="text-xs text-[var(--muted)] uppercase font-mono block">24h Velocity Drift</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-mono font-bold ${velocityDriftPercent > 50 ? 'text-[var(--risk-red)]' : 'text-[var(--sage-3)]'}`}>
              {velocityDriftPercent > 0 ? '+' : ''}{velocityDriftPercent.toFixed(1)}%
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted)] mt-1 block">
            Baseline: {activeAccount.baselineVelocity7d} tx/day ➔ Current: {activeAccount.currentVelocity24h} tx/day
          </span>
        </div>

        {/* Inflow vs Outflow */}
        <div className="glass-panel p-5 border border-[var(--line)]">
          <span className="text-xs text-[var(--muted)] uppercase font-mono block">30-Day Flow Balance</span>
          <div className="flex items-center justify-between text-xs font-mono mt-3">
            <div className="flex items-center gap-1 text-[var(--live)]">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>+{formatCurrency(activeAccount.inflow)}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--risk-amber)]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>-{formatCurrency(activeAccount.outflow)}</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-2.5 overflow-hidden flex">
            <div
              className="bg-[var(--live)] h-full"
              style={{ width: `${(activeAccount.inflow / (activeAccount.inflow + activeAccount.outflow)) * 100}%` }}
            />
            <div
              className="bg-[var(--risk-amber)] h-full"
              style={{ width: `${(activeAccount.outflow / (activeAccount.inflow + activeAccount.outflow)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts Section: 30-Day Risk History & Baseline Drift */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="30-Day Historical Risk Trend"
          subtitle="Chronological risk score progression across weekly observation windows"
          dataWindow="last 30 days, simulated telemetry"
        >
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeAccount.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="var(--muted)" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="var(--muted)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F0D',
                    borderColor: 'var(--line)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={activeAccount.riskScore >= 70 ? 'var(--risk-red)' : 'var(--sage-2)'}
                  strokeWidth={2}
                  dot={{ r: 3, fill: activeAccount.riskScore >= 70 ? 'var(--risk-red)' : 'var(--sage-2)' }}
                  name="Risk Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Counterparty Volume Distribution"
          subtitle="Top direct counterparty relationships by settled dollar volume"
          dataWindow="active relationship cohort"
        >
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeAccount.counterparties.slice(0, 5)}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={9} tickLine={false} />
                <YAxis stroke="var(--muted)" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F0D',
                    borderColor: 'var(--line)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="totalAmount" fill="var(--sage-3)" radius={[4, 4, 0, 0]} name="Volume ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Direct Counterparties Breakdown */}
      <div className="glass-panel overflow-hidden border border-[var(--line)]">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--text)]">
              Direct Counterparties Breakdown
            </h3>
            <p className="text-xs text-[var(--muted)]">
              All entities with settled bidirectional transaction volume over the 30-day window
            </p>
          </div>
          <span className="label-small">
            {activeAccount.counterparties.length} Counterparties
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] text-[10px] uppercase font-mono text-[var(--muted)] bg-white/[0.02]">
                <th className="py-3 px-4">Counterparty Name</th>
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4">Settled Volume</th>
                <th className="py-3 px-4">Transfer Count</th>
                <th className="py-3 px-4">Risk Flag</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {activeAccount.counterparties.map((cp, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{cp.name}</td>
                  <td className="py-3 px-4 font-mono text-[var(--muted)]">{cp.accountId}</td>
                  <td className="py-3 px-4 font-mono font-bold">{formatCurrency(cp.totalAmount)}</td>
                  <td className="py-3 px-4 font-mono">{cp.txCount} settlements</td>
                  <td className="py-3 px-4">
                    {cp.isSuspicious ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--risk-red)]/20 text-[var(--risk-red)] font-mono font-bold">
                        HIGH RISK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--live)]/20 text-[var(--live)] font-mono">
                        ROUTINE
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        selectAccount(cp.accountId);
                        navigate(`/account/${cp.accountId}`);
                      }}
                      className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white transition-all inline-flex items-center gap-1"
                    >
                      <span>Inspect 360</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linked Compliance Cases */}
      <div className="glass-panel overflow-hidden border border-[var(--line)]">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--text)]">
              Linked AML Compliance Cases
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Transactions involving this account flagged by the machine learning ensemble
            </p>
          </div>
          <span className="label-small">
            {linkedCases.length} Flagged Incidents
          </span>
        </div>

        <div className="overflow-x-auto">
          {linkedCases.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--muted)] font-light">
              No elevated risk transactions currently associated with this account.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--line)] text-[10px] uppercase font-mono text-[var(--muted)] bg-white/[0.02]">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Typology</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {linkedCases.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">#{c.id}</td>
                    <td className="py-3 px-4 text-[var(--sage-3)]">{c.typologyLabel}</td>
                    <td className="py-3 px-4 font-mono font-bold">{formatCurrency(c.amount)}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        c.riskScore >= 70 ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)]' : 'bg-[var(--risk-amber)]/20 text-[var(--risk-amber)]'
                      }`}>
                        {c.riskScore.toFixed(0)} RISK
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.06] text-white font-mono">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            flyToCase(c.id);
                            navigate(`/globe?case=${c.id}&view=map`);
                          }}
                          className="w-7 h-7 rounded-full bg-white/[0.03] border border-[var(--line)] hover:border-white/30 flex items-center justify-center text-[var(--muted)] hover:text-white transition-colors"
                          title="Fly to Location on Map"
                        >
                          <Globe2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            selectTxn(c.id);
                            navigate(`/detail/${c.id}`);
                          }}
                          className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white transition-all inline-flex items-center gap-1"
                        >
                          <span>Investigate</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
};
