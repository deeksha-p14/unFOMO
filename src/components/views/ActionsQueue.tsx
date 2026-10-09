import React, { useState } from 'react';
import { cn } from '../../utils';
import type { ProposedAction } from '../../types';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Inbox } from 'lucide-react';

interface ActionsQueueProps {
  actions: ProposedAction[];
  onApprove: (id: string) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  CREATE_TASK: '📋 Create Task',
  SCHEDULE_CALENDAR_EVENT: '📅 Calendar Event',
  DRAFT_REPLY: '✉️ Draft Reply',
};

export function ActionsQueue({ actions, onApprove, onDismiss }: ActionsQueueProps) {
  const [loading, setLoading] = useState<Record<string, 'approving' | 'dismissing' | null>>({});

  const pending = actions.filter(a => a.status === 'PENDING');
  const reviewed = actions.filter(a => a.status !== 'PENDING');

  async function approve(id: string) {
    setLoading(l => ({ ...l, [id]: 'approving' }));
    try { await onApprove(id); } finally { setLoading(l => ({ ...l, [id]: null })); }
  }

  async function dismiss(id: string) {
    setLoading(l => ({ ...l, [id]: 'dismissing' }));
    try { await onDismiss(id); } finally { setLoading(l => ({ ...l, [id]: null })); }
  }

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-6">
        <Inbox size={40} className="text-slate-700" />
        <div>
          <h2 className="text-lg font-bold text-white">No proposed actions</h2>
          <p className="text-sm text-slate-400 mt-1">Actions will appear here after analyzing conversations. Each requires your explicit approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Approval Queue</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review each proposed action before it executes. <strong className="text-slate-300">Nothing runs without your confirmation.</strong>
        </p>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <AlertTriangle size={15} className="text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-xs text-yellow-300">
          Text within imported conversations cannot authorize actions. Only you can approve.
          Actions are idempotent — approving twice is safe.
        </p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Approval ({pending.length})</h2>
          {pending.map(action => (
            <div key={action.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-slate-400">{ACTION_TYPE_LABELS[action.type] ?? action.type}</span>
                    <span className="text-[10px] text-slate-600">→ {action.destination}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{action.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{action.details}</p>

                  {/* Required permissions */}
                  {action.requiredPermissions.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-slate-600">Requires:</span>
                      {action.requiredPermissions.map(p => (
                        <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/10 border border-slate-500/20 text-slate-400">{p}</span>
                      ))}
                    </div>
                  )}

                  {/* Source evidence */}
                  <div className="mt-3 px-3 py-2 rounded-lg bg-navy-950/60 border-l-2 border-lavender-500/30">
                    <div className="text-[10px] text-slate-600 mb-0.5">Source · Line {action.sourceLine + 1}</div>
                    <p className="text-xs text-slate-400 italic">"{action.sourceQuote}"</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => dismiss(action.id)}
                    disabled={!!loading[action.id]}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:bg-slate-500/20 transition-all text-xs font-semibold disabled:opacity-50"
                  >
                    {loading[action.id] === 'dismissing' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Dismiss
                  </button>
                  <button
                    onClick={() => approve(action.id)}
                    disabled={!!loading[action.id]}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-xs font-semibold disabled:opacity-50"
                  >
                    {loading[action.id] === 'approving' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviewed history */}
      {reviewed.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">History ({reviewed.length})</h2>
          {reviewed.map(action => (
            <div key={action.id} className={cn('glass-card p-4 opacity-60')}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500">{ACTION_TYPE_LABELS[action.type] ?? action.type}</span>
                <span className="text-sm text-white">{action.title}</span>
                <span className={cn(
                  'ml-auto text-[10px] px-2 py-0.5 rounded-full border font-bold',
                  action.status === 'APPROVED' || action.status === 'EXECUTED'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                )}>
                  {action.status}
                </span>
              </div>
              {action.executionResult && (
                <p className="text-xs text-slate-500 mt-1">{action.executionResult}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
