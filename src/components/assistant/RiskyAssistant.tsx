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
  source?: 'gemini' | 'fallback';
  fallbackReason?: string;
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

  // Listen for global custom event to open assistant from sidebar or commands
  useEffect(() => {
    const handleOpenRisky = () => setIsOpen(true);
    window.addEventListener('open-risky-assistant', handleOpenRisky);
    return () => window.removeEventListener('open-risky-assistant', handleOpenRisky);
  }, []);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'risky',
      text: "Investigator online. I'm actively monitoring the 1,420 tx/min stream and XGBoost + IF feature attributions. How can I assist with your surveillance queue?",
      timestamp: 'Now',
      sources: ['Monetrax Surveillance Core', '0.83 PR-AUC Model'],
      source: 'gemini'
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
          history: messages.slice(-10).map(m => ({
            sender: m.sender,
            text: m.text
          })),
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
          source: data.source || 'gemini',
          fallbackReason: data.fallbackReason,
          toolCall: data.toolCall
        };
        setMessages(prev => [...prev, riskyReply]);
      } else {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `r-${Date.now()}`,
          sender: 'risky',
          text: `Surveillance indicators for ${activeTxn.id} reflect an elevated ${activeTxn.typologyLabel}. Features are consistent with obfuscated fund routing across ${activeTxn.fromCity} and ${activeTxn.toCity}.`,
          timestamp: 'Just now',
          sources: ['Ensemble Scoring Engine', 'Offline Fallback'],
          source: 'fallback',
          fallbackReason: e instanceof Error ? e.message : 'Connection failed'
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
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full shadow-2xl border border-white/10 bg-[#161619]/90 hover:border-[#FF6A2B]/40 backdrop-blur-xl group transition-all flex items-center gap-2.5"
        >
          <div className="w-2 h-2 rounded-full bg-[#FF6A2B] animate-ping" />
          <div className="text-left font-sans">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>Ask Risky</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FF6A2B]/20 text-[#FF6A2B] font-mono font-medium">
                AI Copilot
              </span>
            </div>
            <div className="text-[10px] text-[var(--caption)] font-mono">Autonomous Investigator</div>
          </div>
          <Sparkles className="w-4 h-4 text-[#FF6A2B] group-hover:scale-110 transition-transform ml-1" />
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-32px)] h-[540px] max-h-[85vh] rounded-[20px] p-4 shadow-2xl border border-white/10 flex flex-col justify-between animate-fadeIn bg-[#121215]/95 backdrop-blur-2xl font-sans">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FF6A2B]/20 border border-[#FF6A2B]/40 flex items-center justify-center text-[#FF6A2B]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-semibold text-white">
                    Risky — AI Investigator
                  </h3>
                  <span className="text-[9px] px-1.5 rounded-full bg-[#4ADE9A]/20 text-[#4ADE9A] font-mono">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-[var(--caption)] font-mono">
                  Context: #{activeTxn.id}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--muted)] hover:text-white p-1 rounded-full hover:bg-white/[0.08]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-3 text-xs leading-relaxed scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 max-w-[88%] ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-[#FF6A2B] to-[#FF4D1A] text-white font-medium rounded-2xl rounded-br-sm shadow-md'
                      : 'bg-white/[0.04] border border-white/[0.08] text-[#F5F5F6] font-normal rounded-2xl rounded-bl-sm backdrop-blur-sm'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>

                  {/* Tool Call Action Pill */}
                  {m.toolCall && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      {m.toolCall.executed ? (
                        <div className="flex items-center gap-1 text-[11px] text-[#4ADE9A] font-mono">
                          <Check className="w-3 h-3" />
                          <span>Action Executed: {m.toolCall.name}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleExecuteTool(m.id, m.toolCall!)}
                          className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 text-[11px] font-mono text-white transition-all flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5 text-[#FF6A2B]" />
                          <span>Execute: {m.toolCall.name}()</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Traceability Sources & Engine Status Chip */}
                  {m.sender === 'risky' && (
                    <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2 flex-wrap">
                      {/* Live · Gemini or Offline Fallback Chip */}
                      {m.source === 'gemini' ? (
                        <span className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full font-mono font-medium bg-[#4ADE9A]/15 text-[#4ADE9A] border border-[#4ADE9A]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE9A] animate-pulse" />
                          Live · Gemini
                        </span>
                      ) : (
                        <span
                          title={m.fallbackReason ? `Reason: ${m.fallbackReason}` : 'Operating in deterministic offline fallback'}
                          className="inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full font-mono font-medium bg-[#F5C04A]/15 text-[#F5C04A] border border-[#F5C04A]/30 cursor-help"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F5C04A]" />
                          Offline Fallback
                        </span>
                      )}

                      {/* Source attribution badges */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {m.sources.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-white/[0.06] text-[var(--muted)] border border-white/10"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {m.sender === 'risky' && (
                    <div className="text-[9px] text-[var(--caption)] font-mono mt-1.5 italic">
                      AI-generated • Verify before compliance action
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[var(--caption)] font-mono mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-[#FF6A2B] font-mono animate-pulse p-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Investigating stream indicators...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Suggested Prompt Chips */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {contextualPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-[var(--muted)] hover:text-white border border-white/[0.08] hover:border-[#FF6A2B]/40 transition-all whitespace-nowrap"
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
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-full pl-4 pr-10 py-2 text-xs text-white placeholder:text-[var(--caption)] focus:outline-none focus:border-[#FF6A2B] transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6A2B] to-[#FF4D1A] text-white flex items-center justify-center disabled:opacity-40 hover:brightness-105 shadow-md transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-[9px] text-[var(--caption)] text-center pt-2 font-mono">
            AI-generated indicators • Grounded in stream features
          </div>
        </div>
      )}
    </>
  );
};
