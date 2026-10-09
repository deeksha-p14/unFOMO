import React from 'react';
import { cn } from '../utils';
import type { NavigationTab, ImportedConversation, TaskItem, ProposedAction } from '../types';
import {
  LayoutDashboard, Inbox, Sparkles, CheckSquare, Clock, GitBranch,
  AtSign, Plug, ActivitySquare, ShieldCheck, ChevronLeft, ChevronRight,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  conversations: ImportedConversation[];
  tasks: TaskItem[];
  actions: ProposedAction[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onRequestWipeAll: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ReactNode;
  badgeKey?: 'urgent' | 'tasks' | 'actions';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',     label: 'Overview',     icon: <LayoutDashboard size={18} /> },
  { id: 'inbox',        label: 'Import',        icon: <Inbox size={18} /> },
  { id: 'briefing',     label: 'AI Briefing',   icon: <Sparkles size={18} />, badgeKey: 'urgent' },
  { id: 'tasks',        label: 'Tasks',         icon: <CheckSquare size={18} />, badgeKey: 'tasks' },
  { id: 'deadlines',    label: 'Deadlines',     icon: <Clock size={18} /> },
  { id: 'decisions',    label: 'Decisions',     icon: <GitBranch size={18} /> },
  { id: 'mentions',     label: 'Mentions',      icon: <AtSign size={18} /> },
  { id: 'integrations', label: 'Integrations',  icon: <Plug size={18} /> },
  { id: 'activity',     label: 'Activity',      icon: <ActivitySquare size={18} /> },
  { id: 'privacy',      label: 'Privacy',       icon: <ShieldCheck size={18} /> },
];

export function Sidebar({ activeTab, onTabChange, conversations, tasks, actions, collapsed, onToggleCollapse, onRequestWipeAll }: SidebarProps) {
  const urgentCount = conversations.filter(c => c.analysis?.priority === 'URGENT').length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const pendingActions = actions.filter(a => a.status === 'PENDING').length;

  function getBadge(key?: string): number {
    if (key === 'urgent') return urgentCount;
    if (key === 'tasks') return pendingTasks;
    if (key === 'actions') return pendingActions;
    return 0;
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-navy-900/95 backdrop-blur-2xl border-r border-white/8 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-white/8',
        collapsed && 'justify-center px-2'
      )}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-lavender-500 to-cyan shrink-0 shadow-glow-lavender">
          <Shield size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-extrabold text-white text-base leading-tight">noFOMO</div>
            <div className="text-[10px] text-slate-500 leading-tight">What Did I Miss?</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(item => {
          const badge = getBadge(item.badgeKey);
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-lavender-500/20 text-lavender-300 shadow-glow-lavender border border-lavender-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                collapsed && 'justify-center px-2'
              )}
            >
              <span className={cn('shrink-0 transition-colors', isActive ? 'text-lavender-400' : 'text-slate-500 group-hover:text-slate-300')}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && badge > 0 && (
                <span className={cn(
                  'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                  item.id === 'briefing' ? 'bg-red-500/20 text-red-400' : 'bg-lavender-500/20 text-lavender-400'
                )}>
                  {badge}
                </span>
              )}
              {collapsed && badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Privacy tag & Wipe Action */}
      <div className="p-3 border-t border-white/8 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wide">Local-First · Zero Upload</span>
          </div>
        )}

        <button
          onClick={onRequestWipeAll}
          title="Permanently wipe all stored conversations, tasks, and audit logs"
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
            'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300',
            collapsed ? 'justify-center px-1' : ''
          )}
        >
          <span className="text-sm">🗑</span>
          {!collapsed && <span>Delete All Data</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center p-3 text-slate-500 hover:text-slate-300 border-t border-white/8 hover:bg-white/5 transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
