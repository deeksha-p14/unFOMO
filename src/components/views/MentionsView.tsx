import React from 'react';
import type { ImportedConversation } from '../../types';
import { AtSign } from 'lucide-react';

interface MentionsViewProps {
  conversations: ImportedConversation[];
}

export function MentionsView({ conversations }: MentionsViewProps) {
  const allMentions = conversations.flatMap(c =>
    (c.analysis?.mentions ?? []).map(m => ({ ...m, conversationTitle: c.title }))
  );

  if (allMentions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-6">
        <AtSign size={40} className="text-slate-700" />
        <div>
          <h2 className="text-lg font-bold text-white">No mentions detected</h2>
          <p className="text-sm text-slate-400 mt-1">Direct @mentions will appear here. Set your display name in Privacy settings for accurate matching.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-extrabold text-white">Mentions</h1>
      <div className="flex flex-col gap-3">
        {allMentions.map(m => (
          <div key={m.id} className="glass-card p-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-cyan">{m.targetMention}</span>
              <span className="text-xs text-slate-500">mentioned by</span>
              <span className="text-sm text-white font-medium">{m.sender}</span>
              {m.isUserMatch && (
                <span className="text-xs text-lavender-400 font-semibold px-2 py-0.5 rounded-full bg-lavender-500/10 border border-lavender-500/20">
                  ● This is you
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 mt-0.5 mb-3">From: {m.conversationTitle}</div>
            <div className="px-3 py-2 rounded-lg bg-navy-950/60 border-l-2 border-cyan/30">
              <p className="text-xs text-slate-400 italic">"{m.quote}"</p>
              <span className="text-[10px] text-slate-600">Line {m.sourceLine + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
