import React from 'react';
import { cn, formatDate } from '../../utils';
import type { ImportedConversation, DeadlineItem } from '../../types';
import { Clock, AlertTriangle } from 'lucide-react';

interface DeadlinesViewProps {
  conversations: ImportedConversation[];
}

export function DeadlinesView({ conversations }: DeadlinesViewProps) {
  const allDeadlines: (DeadlineItem & { conversationTitle: string })[] = conversations.flatMap(c =>
    (c.analysis?.deadlines ?? []).map(d => ({ ...d, conversationTitle: c.title }))
  );

  const sorted = [...allDeadlines].sort((a, b) => {
    const order = { CRITICAL: 0, NEAR_TERM: 1, UPCOMING: 2 };
    return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3);
  });

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-6">
        <Clock size={40} className="text-slate-700" />
        <div>
          <h2 className="text-lg font-bold text-white">No deadlines detected</h2>
          <p className="text-sm text-slate-400 mt-1">Deadlines will appear here after analyzing conversations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-extrabold text-white">Deadlines</h1>
      <div className="flex flex-col gap-3">
        {sorted.map(d => (
          <div key={d.id} className={cn(
            'glass-card p-5 border-l-4',
            d.urgency === 'CRITICAL' ? 'border-red-500' : d.urgency === 'NEAR_TERM' ? 'border-orange-500' : 'border-yellow-500'
          )}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full border',
                    d.urgency === 'CRITICAL'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : d.urgency === 'NEAR_TERM'
                        ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                        : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                  )}>
                    {d.urgency.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-semibold text-white">{d.title}</span>
                  {!d.isExplicit && <span className="text-[10px] text-slate-500">(inferred)</span>}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <Clock size={10} />
                  <span>{d.deadlineText}</span>
                  {d.deadlineDate && <span className="text-slate-600">· {formatDate(d.deadlineDate)}</span>}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">From: {d.conversationTitle}</div>
              </div>
              {d.urgency === 'CRITICAL' && (
                <AlertTriangle size={18} className="text-red-400 shrink-0" />
              )}
            </div>
            <div className="mt-3 px-3 py-2 rounded-lg bg-navy-950/60 border-l-2 border-white/10">
              <p className="text-xs text-slate-400 italic">"{d.sourceQuote}"</p>
              <span className="text-[10px] text-slate-600">Line {d.sourceLine + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
