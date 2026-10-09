import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { ShieldCheck } from 'lucide-react';
import type { NavigationTab } from '../types';

interface TopBarProps {
  activeTab: NavigationTab;
  conversationCount: number;
  onRequestWipeAll: () => void;
}

const TAB_TITLES: Record<NavigationTab, string> = {
  overview: 'Overview Dashboard',
  inbox: 'Import Conversation',
  briefing: 'AI Catch-Up Briefing',
  tasks: 'Action Items & Tasks',
  deadlines: 'Deadlines & Timeline',
  decisions: 'Decisions & Consensus',
  mentions: 'Direct Mentions & Pings',
  integrations: 'Encrypted Integrations',
  activity: 'Security Audit Log',
  privacy: 'Privacy & Data Vault',
  detail: 'Conversation Evidence Log',
};

export function TopBar({ activeTab, conversationCount, onRequestWipeAll }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-navy-950/80 backdrop-blur-xl border-b border-white/8 transition-colors duration-200">
      <div className="flex items-center gap-2.5">
        <h2 className="text-sm font-bold text-white tracking-tight">
          {TAB_TITLES[activeTab] || 'noFOMO'}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Local Security Shield Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>On-Device Vault Active</span>
        </div>

        {/* Light / Dark Mode Toggle in Top Right Corner */}
        <ThemeToggle />
      </div>
    </header>
  );
}
