import React from 'react';
import { cn, priorityBg, platformIcon, timeSince, estimateReadTime } from '../../utils';
import type { ImportedConversation, TaskItem, ProposedAction, DeadlineItem } from '../../types';
import { Sparkles, Play, AlertCircle, CheckSquare, Clock, ArrowRight } from 'lucide-react';

interface OverviewDashboardProps {
  conversations: ImportedConversation[];
  tasks: TaskItem[];
  actions: ProposedAction[];
  onLoadDemo: () => void;
  onRequestWipeAll: () => void;
  onSelectConversation: (id: string) => void;
  onTabChange: (tab: string) => void;
  isLoading: boolean;
}

function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: string | number; sub: string;
  accent: string; icon: React.ReactNode;
}) {
  return (
    <div className={cn('glass-card p-5 flex flex-col gap-2', `border-l-2 ${accent}`)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{label}</span>
        <span className="text-slate-600">{icon}</span>
      </div>
      <div className={cn('text-3xl font-extrabold', accent.replace('border-l-2 ', '').replace('border-', 'text-'))}>{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  );
}

export function OverviewDashboard({
  conversations, tasks, actions, onLoadDemo, onRequestWipeAll, onSelectConversation, onTabChange, isLoading
}: OverviewDashboardProps) {
  const urgentConvos = conversations.filter(c => c.analysis?.priority === 'URGENT');
  const allDeadlines: DeadlineItem[] = conversations.flatMap(c => c.analysis?.deadlines ?? []);
  const criticalDeadlines = allDeadlines.filter(d => d.urgency === 'CRITICAL');
  const pendingTasks = tasks.filter(t => !t.completed);
  const pendingActions = actions.filter(a => a.status === 'PENDING');
  const totalReadTimeSaved = conversations.reduce((acc, c) => acc + estimateReadTime(c.rawText), 0);

  const hasData = conversations.length > 0;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {hasData ? `${conversations.length} conversation${conversations.length > 1 ? 's' : ''} imported` : 'No conversations yet'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasData && (
            <button
              onClick={onRequestWipeAll}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-all"
            >
              <span>🗑</span>
              <span>Delete All Data</span>
            </button>
          )}
          <button
            onClick={onLoadDemo}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lavender-500/20 border border-lavender-500/30 text-lavender-300 hover:bg-lavender-500/30 transition-all text-sm font-semibold disabled:opacity-50"
          >
            <Play size={14} />
            {isLoading ? 'Loading…' : 'Load Demo'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Urgent"
          value={urgentConvos.length}
          sub="Conversations needing immediate attention"
          accent="border-red-500 text-red-400"
          icon={<AlertCircle size={18} />}
        />
        <StatCard
          label="Pending Tasks"
          value={pendingTasks.length}
          sub="Action items awaiting completion"
          accent="border-orange-500 text-orange-400"
          icon={<CheckSquare size={18} />}
        />
        <StatCard
          label="Critical Deadlines"
          value={criticalDeadlines.length}
          sub="Due within the next 24 hours"
          accent="border-yellow-500 text-yellow-400"
          icon={<Clock size={18} />}
        />
        <StatCard
          label="Time Saved"
          value={`${totalReadTimeSaved} min`}
          sub="Estimated reading time synthesized"
          accent="border-emerald-500 text-emerald-400"
          icon={<Sparkles size={18} />}
        />
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="glass-card flex flex-col items-center justify-center gap-5 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-lavender-500/10 border border-lavender-500/20 flex items-center justify-center">
            <Sparkles size={28} className="text-lavender-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Welcome to noFOMO</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Import a conversation or load the demo to see AI-powered summaries, extracted tasks, and deadlines.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onLoadDemo}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lavender-500/20 border border-lavender-500/30 text-lavender-300 hover:bg-lavender-500/30 transition-all font-semibold text-sm disabled:opacity-50"
            >
              <Play size={14} />
              {isLoading ? 'Loading…' : 'Try Demo Mode'}
            </button>
            <button
              onClick={() => onTabChange('inbox')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all font-semibold text-sm"
            >
              Import Conversation
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Recent conversations */}
      {hasData && (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h2 className="font-bold text-white text-sm">Recent Conversations</h2>
            <button
              onClick={() => onTabChange('briefing')}
              className="text-xs text-lavender-400 hover:text-lavender-300 flex items-center gap-1"
            >
              View briefing <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {conversations.slice(0, 6).map(conv => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left"
              >
                <span className="text-2xl shrink-0">{platformIcon(conv.platform)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-white text-sm truncate">{conv.title}</span>
                    {conv.analysis?.priority && (
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0', priorityBg(conv.analysis.priority))}>
                        {conv.analysis.priority}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span>{conv.channelOrChat}</span>
                    <span>·</span>
                    <span>{conv.messages.length} messages</span>
                    <span>·</span>
                    <span>{timeSince(conv.importedAt)}</span>
                  </div>
                </div>
                {conv.analysis && (
                  <div className="flex items-center gap-3 shrink-0 text-xs text-slate-600">
                    {conv.analysis.tasks.length > 0 && (
                      <span className="flex items-center gap-1"><CheckSquare size={12} />{conv.analysis.tasks.length}</span>
                    )}
                    {conv.analysis.deadlines.length > 0 && (
                      <span className="flex items-center gap-1"><Clock size={12} />{conv.analysis.deadlines.length}</span>
                    )}
                  </div>
                )}
                <ArrowRight size={14} className="text-slate-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action queue preview */}
      {pendingActions.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              {pendingActions.length} Action{pendingActions.length > 1 ? 's' : ''} Awaiting Approval
            </h2>
            <button
              onClick={() => onTabChange('tasks')}
              className="text-xs text-lavender-400 hover:text-lavender-300 flex items-center gap-1"
            >
              Review <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-4 text-sm text-slate-400">
            {pendingActions.slice(0, 2).map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2">
                <span className="text-yellow-400">⟳</span>
                <span className="truncate">{a.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
