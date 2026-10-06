import React from 'react';
import { Landmark, ShieldCheck, Lock, ArrowLeftRight, Database, Radio } from 'lucide-react';

export const IntegrationsStrip: React.FC = () => {
  const integrations = [
    { name: 'Core Banking Rail', icon: <Landmark className="w-3.5 h-3.5" /> },
    { name: 'KYC Vault', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { name: 'Sanctions API', icon: <Lock className="w-3.5 h-3.5" /> },
    { name: 'Payments Rail', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
    { name: 'SWIFT Gateway', icon: <Database className="w-3.5 h-3.5" /> },
    { name: 'FedNow Bridge', icon: <Radio className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 py-6 flex items-center justify-center gap-8 md:gap-12 flex-wrap text-xs text-[var(--muted)] select-none">
      {integrations.map((item, idx) => (
        <div 
          key={idx} 
          className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors opacity-65 hover:opacity-100"
        >
          <span className="text-[var(--sage-2)]">{item.icon}</span>
          <span className="font-sans font-light tracking-wide text-xs">{item.name}</span>
        </div>
      ))}
    </div>
  );
};
