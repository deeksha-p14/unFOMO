import React from 'react';
import { cn } from '../../utils';
import type { ImportedConversation } from '../../types';
import { GitBranch } from 'lucide-react';

interface DecisionsViewProps {
  conversations: ImportedConversation[];
}

export function DecisionsView({ conversations }: DecisionsViewProps) {
  const allDecisions = conversations.flatMap(c =>
    (c.analysis?.decisions ?? []).map(d => ({ ...d, conversationTitle: c.title }))
  );

  if (allDecisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-6">
        <GitBranch size={40} className="text-slate-700" />
        <div>
          <h2 className="text-lg font-bold text-white">No decisions detected</h2>
          <p className="text-sm text-slate-400 mt-1">Decisions will appear here after analyzing conversations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-extrabold text-white">Decisions</h1>
      <div className="flex flex-col gap-3">
        {allDecisions.map(d => (
          <div key={d.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{d.decision}</p>
                {d.consensus && (
                  <p className="text-xs text-slate-400 mt-1">{d.consensus}</p>
                )}
                <div className="text-xs text-slate-600 mt-0.5">From: {d.conversationTitle}</div>
              </div>
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0',
                d.verified
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
              )}>
                {d.verified ? `${Math.round(d.confidence)}% verified` : 'unverified'}
              </span>
            </div>
            <div className="mt-3 px-3 py-2 rounded-lg bg-navy-950/60 border-l-2 border-lavender-500/30">
              <p className="text-xs text-slate-400 italic">"{d.sourceQuote}"</p>
              <span className="text-[10px] text-slate-600">Line {d.sourceLine + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
