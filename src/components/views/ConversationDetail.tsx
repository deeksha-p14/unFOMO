import React, { useState } from 'react';
import { cn, platformIcon, formatDate } from '../../utils';
import type { ImportedConversation } from '../../types';
import { MessageSquare, ArrowLeft, Hash } from 'lucide-react';

interface ConversationDetailProps {
  conversation: ImportedConversation;
  onBack: () => void;
  onToggleTask: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationDetail({ conversation, onBack, onToggleTask, onDelete }: ConversationDetailProps) {
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const analysis = conversation.analysis;

  function scrollToLine(lineIndex: number) {
    setHighlightLine(lineIndex);
    const el = document.getElementById(`msg-line-${lineIndex}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setHighlightLine(null), 3000);
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{platformIcon(conversation.platform)}</span>
            <div>
              <h1 className="text-xl font-extrabold text-white leading-tight">{conversation.title}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Hash size={10} />
                <span>{conversation.channelOrChat}</span>
                <span>·</span>
                <span>{conversation.messages.length} messages</span>
                <span>·</span>
                <span>{formatDate(conversation.importedAt)}</span>
                {conversation.isDemo && (
                  <span className="px-1.5 py-0.5 rounded bg-lavender-500/20 text-lavender-400 font-semibold">DEMO</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Conversation Action */}
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDelete(conversation.id)}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-all"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all"
            >
              <span>🗑</span>
              <span>Delete Conversation</span>
            </button>
          )}
        </div>
      </div>

      {/* Analysis summary if available */}
      {analysis && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">AI Summary</span>
            <span className="text-xs text-slate-600">· Provider: {analysis.provider}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
          {analysis.priorityReason && (
            <p className="text-xs text-slate-500 mt-1.5 italic">Priority: {analysis.priority} — {analysis.priorityReason}</p>
          )}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {analysis.tasks.length > 0 && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                ✓ {analysis.tasks.length} task{analysis.tasks.length > 1 ? 's' : ''}
              </span>
            )}
            {analysis.decisions.length > 0 && (
              <span className="text-xs text-slate-400">⌥ {analysis.decisions.length} decision{analysis.decisions.length > 1 ? 's' : ''}</span>
            )}
            {analysis.deadlines.length > 0 && (
              <span className="text-xs text-slate-400">⏰ {analysis.deadlines.length} deadline{analysis.deadlines.length > 1 ? 's' : ''}</span>
            )}
            {analysis.mentions.length > 0 && (
              <span className="text-xs text-slate-400">@ {analysis.mentions.length} mention{analysis.mentions.length > 1 ? 's' : ''}</span>
            )}
            {analysis.unansweredQuestions.length > 0 && (
              <span className="text-xs text-yellow-400">? {analysis.unansweredQuestions.length} unanswered</span>
            )}
          </div>
        </div>
      )}

      {/* Raw message log */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8">
          <MessageSquare size={14} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Message Log</span>
          {analysis && (
            <span className="ml-2 text-xs text-slate-600">Click evidence "Line N" buttons in Briefing to jump here</span>
          )}
        </div>
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              id={`msg-line-${msg.lineIndex}`}
              className={cn(
                'flex gap-3 px-5 py-3 transition-colors',
                highlightLine === msg.lineIndex
                  ? 'bg-lavender-500/15 border-l-2 border-lavender-400'
                  : 'hover:bg-white/3'
              )}
            >
              <span className="text-[10px] text-slate-700 font-mono mt-1 w-6 shrink-0 text-right">
                {msg.lineIndex + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-lavender-400">{msg.sender}</span>
                  {msg.timestamp && msg.timestamp !== 'unknown' && (
                    <span className="text-[10px] text-slate-600">{msg.timestamp}</span>
                  )}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed break-words">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
