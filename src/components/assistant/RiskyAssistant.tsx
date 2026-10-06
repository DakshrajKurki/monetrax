import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  Send, 
  Play, 
  Check, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useAMLStore } from '../../store/useAMLStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'risky';
  text: string;
  timestamp: string;
  sources?: string[];
  toolCall?: {
    name: string;
    arguments: any;
    executed?: boolean;
  };
}

export const RiskyAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const selectedTxnId = useAMLStore((s) => s.selectedTxnId);
  const transactions = useAMLStore((s) => s.transactions);
  const selectTxn = useAMLStore((s) => s.selectTxn);
  const flyToCase = useAMLStore((s) => s.flyToCase);
  const openAutoTriageModal = useAMLStore((s) => s.openAutoTriageModal);
  const addFilterChip = useAMLStore((s) => s.addFilterChip);

  const selectAccount = useAMLStore((s) => s.selectAccount);
  const addToast = useAMLStore((s) => s.addToast);

  const activeTxn = transactions.find(t => t.id === selectedTxnId) || transactions[0];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'risky',
      text: "Investigator online. I'm actively monitoring the 1,420 tx/min stream and XGBoost + IF feature attributions. How can I assist with your surveillance queue?",
      timestamp: 'Now',
      sources: ['Monetrax Surveillance Core', '0.83 PR-AUC Model']
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Contextual prompts per route
  const contextualPrompts = useMemo(() => {
    if (pathname === '/') {
      return [
        "Summarize anomalies in current window",
        "What is driving the structuring alert spike?",
        "Fly to Zurich high-risk corridor on globe"
      ];
    }
    if (pathname === '/queue') {
      return [
        "Run bulk auto-triage on false positives",
        "Filter structuring cases over $50k",
        "Explain why top case is ranked #1"
      ];
    }
    if (pathname.startsWith('/detail')) {
      return [
        `Evaluate case #${activeTxn.id} risk factors`,
        "Show counterfactual for lower amount",
        "Check sanctions watchlist match"
      ];
    }
    if (pathname === '/globe') {
      return [
        "Focus on Singapore transit corridor",
        "Filter critical vectors in Europe",
        "Open highest risk transaction detail"
      ];
    }
    if (pathname === '/network') {
      return [
        "Replay cyclic layering loop",
        "Highlight smurfing convergence cluster",
        "Inspect Smurf Hub counterparty balance"
      ];
    }
    if (pathname === '/sanctions') {
      return [
        "Screen Valeriy Mikhailov on OFAC",
        "Lookup Trans-Balkan Petrochemical",
        "Check EU consolidated matches"
      ];
    }
    if (pathname === '/sar') {
      return [
        "Review FinCEN narrative draft",
        "Check filing deadline countdown",
        "Initialize SAR for case #TXN-84200"
      ];
    }
    if (pathname === '/model') {
      return [
        "Explain the AML Accuracy Trap",
        "Why was 0.83 PR-AUC chosen over ROC-AUC?",
        "Show feature importance ranking"
      ];
    }
    return [
      "Summarize stream telemetry",
      "Check active cases"
    ];
  }, [pathname, activeTxn?.id]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/ai/risky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          screen: pathname,
          selectedCase: {
            id: activeTxn.id,
            riskScore: activeTxn.riskScore,
            typology: activeTxn.typology,
            typologyLabel: activeTxn.typologyLabel,
            features: activeTxn.features,
            amount: activeTxn.amount,
            fromCity: activeTxn.fromCity,
            toCity: activeTxn.toCity,
            whyRanked: activeTxn.whyRanked,
            suggestedAction: activeTxn.suggestedAction
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const riskyReply: ChatMessage = {
          id: `r-${Date.now()}`,
          sender: 'risky',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: data.sources || ['Local AML Feature Attribution'],
          toolCall: data.toolCall
        };
        setMessages(prev => [...prev, riskyReply]);
      } else {
        throw new Error('Non-ok response');
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `r-${Date.now()}`,
          sender: 'risky',
          text: `Surveillance indicators for ${activeTxn.id} reflect an elevated ${activeTxn.typologyLabel}. Features are consistent with obfuscated fund routing across ${activeTxn.fromCity} and ${activeTxn.toCity}.`,
          timestamp: 'Just now',
          sources: ['Ensemble Scoring Engine', 'Offline Fallback']
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExecuteTool = (msgId: string, toolCall: { name: string; arguments: any }) => {
    const { name, arguments: args } = toolCall;

    if (name === 'open_case') {
      selectTxn(args.caseId);
      navigate(`/detail/${args.caseId}`);
      addToast({ title: 'Tool Executed', message: `Opened case #${args.caseId}`, type: 'info' });
    } else if (name === 'open_account') {
      selectAccount(args.accountId);
      navigate(`/account/${args.accountId}`);
      addToast({ title: 'Tool Executed', message: `Navigated to Account ${args.accountId}`, type: 'info' });
    } else if (name === 'fly_to_location') {
      const targetId = args.caseId || activeTxn.id;
      flyToCase(targetId);
      navigate(`/globe?case=${targetId}&view=map`);
      addToast({ title: 'Tool Executed', message: `Camera fly-to and map dive triggered for Case #${targetId}`, type: 'info' });
    } else if (name === 'replay_typology') {
      navigate('/network');
      addToast({ title: 'Tool Executed', message: `Loaded network graph typology replay`, type: 'info' });
    } else if (name === 'generate_sar') {
      navigate('/sar');
      addToast({ title: 'Tool Executed', message: `Opened FinCEN SAR Filing Center`, type: 'info' });
    } else if (name === 'screen_name') {
      navigate('/sanctions');
      addToast({ title: 'Tool Executed', message: `Initiated sanctions search for ${args.name}`, type: 'info' });
    } else if (name === 'run_auto_triage') {
      openAutoTriageModal();
      addToast({ title: 'Tool Executed', message: `Auto-triage modal activated`, type: 'info' });
    } else if (name === 'filter_cases') {
      addFilterChip({
        id: `filter-${Date.now()}`,
        label: args.label || 'Filter: Active',
        field: args.field || 'typology',
        value: args.value || 'structuring'
      });
      navigate('/queue');
      addToast({ title: 'Tool Executed', message: `Applied case queue filter`, type: 'info' });
    }

    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.toolCall) {
        return {
          ...m,
          toolCall: { ...m.toolCall, executed: true }
        };
      }
      return m;
    }));
  };

  return (
    <>
      {/* Floating Glass Launcher Button at Bottom Right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 node-chip px-4 py-2.5 shadow-2xl hover:border-[var(--sage-2)] border border-[var(--line)] bg-[#0B0F0D]/90 backdrop-blur-xl group transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-[var(--sage-2)] animate-ping" />
          <div className="text-left font-sans">
            <div className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
              <span>Ask Risky</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[var(--sage-2)]/20 text-[var(--sage-3)] font-mono">
                AI Copilot
              </span>
            </div>
            <div className="text-[10px] text-[var(--muted)] font-mono">Autonomous Investigator</div>
          </div>
          <Sparkles className="w-4 h-4 text-[var(--sage-3)] group-hover:scale-110 transition-transform ml-1" />
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-32px)] h-[540px] max-h-[85vh] rounded-[24px] glass-panel p-4 shadow-2xl border border-[var(--line)] flex flex-col justify-between animate-fadeIn bg-[#0B0F0D]/95 backdrop-blur-2xl font-sans">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[var(--sage-2)]/20 border border-[var(--sage-2)]/40 flex items-center justify-center text-[var(--sage-3)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-medium text-white">
                    Risky — AI Investigator
                  </h3>
                  <span className="text-[9px] px-1.5 rounded-full bg-[var(--live)]/20 text-[var(--live)] font-mono">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-[var(--muted)] font-mono">
                  Context: #{activeTxn.id}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--muted)] hover:text-white p-1 rounded-full hover:bg-white/[0.05]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-3 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 max-w-[88%] ${
                    m.sender === 'user'
                      ? 'bg-[var(--sage-2)] text-[#0A0D0C] font-medium rounded-2xl rounded-br-sm shadow-md'
                      : 'bg-white/[0.04] border border-[var(--line)] text-[var(--text)] font-light rounded-2xl rounded-bl-sm'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>

                  {/* Tool Call Action Pill */}
                  {m.toolCall && (
                    <div className="mt-2.5 pt-2 border-t border-[var(--line)]">
                      {m.toolCall.executed ? (
                        <div className="flex items-center gap-1 text-[11px] text-[var(--live)] font-mono">
                          <Check className="w-3 h-3" />
                          <span>Action Executed: {m.toolCall.name}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleExecuteTool(m.id, m.toolCall!)}
                          className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 text-[11px] font-mono text-[var(--sage-3)] hover:text-white transition-all flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>Execute: {m.toolCall.name}()</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Traceability Sources */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      {m.sources.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-[var(--sage-2)]/[0.1] text-[var(--sage-3)] border border-[var(--sage-2)]/20"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {m.sender === 'risky' && (
                    <div className="text-[9px] text-[var(--muted)] font-mono mt-1.5 italic">
                      AI-generated • Verify before compliance action
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[var(--muted)] font-mono mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-[var(--sage-3)] font-mono animate-pulse p-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Investigating stream indicators...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Suggested Prompt Chips */}
          <div className="pt-2 border-t border-[var(--line)] flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {contextualPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-[var(--muted)] hover:text-white border border-[var(--line)] transition-all whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Risky to evaluate, filter, or act..."
              className="flex-1 bg-white/[0.04] border border-[var(--line)] rounded-full pl-4 pr-10 py-2 text-xs text-white placeholder:text-[var(--muted)]/60 focus:outline-none focus:border-[var(--sage-2)] transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="w-8 h-8 rounded-full bg-white text-darkCanvas flex items-center justify-center disabled:opacity-40 hover:bg-[var(--sage-3)] transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-[9px] text-[var(--muted)] text-center pt-2 font-mono">
            AI-generated indicators • Grounded in stream features • Verify before action
          </div>
        </div>
      )}
    </>
  );
};
