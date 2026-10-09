import React, { useState } from 'react';
import { cn, priorityBg, timeSince, formatDate, platformIcon } from '../../utils';
import type { ImportedConversation, StructuredAnalysis, TaskItem } from '../../types';
import {
  Sparkles, CheckSquare, Clock, GitBranch, AtSign,
  HelpCircle, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Shield
} from 'lucide-react';

interface BriefingViewProps {
  conversations: ImportedConversation[];
  onToggleTask: (taskId: string) => void;
  onSelectConversation: (id: string) => void;
}

function ConfidenceBadge({ confidence, verified }: { confidence: number; verified: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium',
      verified && confidence >= 80
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        : confidence < 60
          ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
          : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
    )}>
      {verified ? <Shield size={8} /> : <AlertTriangle size={8} />}
      {verified ? `${Math.round(confidence)}% verified` : '⚠ unverified'}
    </span>
  );
}

function EvidenceQuote({ quote, line }: { quote: string; line: number }) {
  return (
    <div className="mt-2 px-3 py-2 rounded-lg bg-navy-950/60 border-l-2 border-lavender-500/40">
      <div className="text-[10px] text-slate-600 mb-0.5">Line {line + 1} · Source evidence</div>
      <div className="text-xs text-slate-400 italic">"{quote}"</div>
    </div>
  );
}

function Section({ title, icon, count, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; count: number;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (count === 0) return null;
  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 font-semibold text-white text-sm">
          <span className="text-slate-400">{icon}</span>
          {title}
          <span className="text-xs text-slate-500 font-normal">({count})</span>
        </div>
        {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>
      {open && <div className="px-5 pb-5 flex flex-col gap-3 border-t border-white/5">{children}</div>}
    </div>
  );
}

export function BriefingView({ conversations, onToggleTask, onSelectConversation }: BriefingViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations.find(c => c.analysis)?.id ?? null
  );

  const conv = conversations.find(c => c.id === selectedId);
  const analysis = conv?.analysis;

  const analyzedConversations = conversations.filter(c => c.analysis);

  if (analyzedConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-lavender-500/10 border border-lavender-500/20 flex items-center justify-center">
          <Sparkles size={28} className="text-lavender-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">No analyzed conversations</h2>
          <p className="text-sm text-slate-400 mt-1">Import a conversation and analyze it to see your AI briefing here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white">AI Briefing</h1>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Shield size={12} className="text-emerald-400" />
          Source-verified extractions only
        </div>
      </div>

      {/* Conversation selector */}
      {analyzedConversations.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {analyzedConversations.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                selectedId === c.id
                  ? 'bg-lavender-500/20 border-lavender-500/40 text-lavender-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              )}
            >
              <span>{platformIcon(c.platform)}</span>
              <span className="truncate max-w-[140px]">{c.title}</span>
              {c.analysis?.priority === 'URGENT' && <span className="text-red-400">●</span>}
            </button>
          ))}
        </div>
      )}

      {analysis && conv && (
        <>
          {/* Summary card */}
          <div className="glass-card p-5">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-lavender-500/10 border border-lavender-500/20 shrink-0">
                <Sparkles size={18} className="text-lavender-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', priorityBg(analysis.priority))}>
                    {analysis.priority}
                  </span>
                  <span className="text-xs text-slate-500">{conv.channelOrChat}</span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-500">{timeSince(analysis.analyzedAt)}</span>
                  <span className="ml-auto text-[10px] text-slate-600">
                    Provider: {analysis.provider} · {Math.round(analysis.confidence)}% confidence
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
                {analysis.priorityReason && (
                  <p className="text-xs text-slate-500 mt-2 italic">Priority reason: {analysis.priorityReason}</p>
                )}
              </div>
            </div>
          </div>

          {/* Decisions */}
          <Section title="Decisions Made" icon={<GitBranch size={14} />} count={analysis.decisions.length}>
            {analysis.decisions.map(d => (
              <div key={d.id} className="pt-3 border-t border-white/5 first:border-0 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white font-medium">{d.decision}</p>
                  <ConfidenceBadge confidence={d.confidence} verified={d.verified} />
                </div>
                {d.consensus && <p className="text-xs text-slate-500 mt-0.5">{d.consensus}</p>}
                <EvidenceQuote quote={d.sourceQuote} line={d.sourceLine} />
              </div>
            ))}
          </Section>

          {/* Tasks */}
          <Section title="Action Items" icon={<CheckSquare size={14} />} count={analysis.tasks.length}>
            {analysis.tasks.map(t => (
              <div key={t.id} className="pt-3 border-t border-white/5 first:border-0 first:pt-0 flex items-start gap-3">
                <button
                  onClick={() => onToggleTask(t.id)}
                  className={cn(
                    'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                    t.completed
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'border-slate-600 hover:border-lavender-400'
                  )}
                >
                  {t.completed && <CheckCircle2 size={12} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-sm text-white', t.completed && 'line-through text-slate-500')}>{t.title}</span>
                    <ConfidenceBadge confidence={t.confidence} verified={t.verified} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    {t.assignee && <span>Assigned to: <span className="text-cyan font-medium">{t.assignee}</span></span>}
                    {t.deadline && <span className={cn('flex items-center gap-1', t.isExplicitDeadline ? 'text-orange-400' : '')}>
                      <Clock size={10} />
                      {t.deadline}
                      {!t.isExplicitDeadline && ' (inferred)'}
                    </span>}
                  </div>
                  <EvidenceQuote quote={t.sourceQuote} line={t.sourceLine} />
                </div>
              </div>
            ))}
          </Section>

          {/* Deadlines */}
          <Section title="Deadlines" icon={<Clock size={14} />} count={analysis.deadlines.length}>
            {analysis.deadlines.map(d => (
              <div key={d.id} className="pt-3 border-t border-white/5 first:border-0 first:pt-0">
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
                  <span className="text-sm text-white font-medium">{d.title}</span>
                  {!d.isExplicit && <span className="text-[10px] text-slate-500">(inferred)</span>}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Clock size={10} />
                  {d.deadlineText}
                  {d.deadlineDate && <span className="text-slate-600 ml-1">· {formatDate(d.deadlineDate)}</span>}
                </div>
                <EvidenceQuote quote={d.sourceQuote} line={d.sourceLine} />
              </div>
            ))}
          </Section>

          {/* Mentions */}
          <Section title="Direct Mentions" icon={<AtSign size={14} />} count={analysis.mentions.length}>
            {analysis.mentions.map(m => (
              <div key={m.id} className="pt-3 border-t border-white/5 first:border-0 first:pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-cyan">{m.targetMention}</span>
                  <span className="text-xs text-slate-500">mentioned by <span className="text-white">{m.sender}</span></span>
                  {m.isUserMatch && <span className="text-xs text-lavender-400 font-semibold">● This is you</span>}
                </div>
                <EvidenceQuote quote={m.quote} line={m.sourceLine} />
              </div>
            ))}
          </Section>

          {/* Unanswered questions */}
          <Section title="Unanswered Questions" icon={<HelpCircle size={14} />} count={analysis.unansweredQuestions.length} defaultOpen={false}>
            {analysis.unansweredQuestions.map(q => (
              <div key={q.id} className="pt-3 border-t border-white/5 first:border-0 first:pt-0">
                <div className="flex items-start gap-2">
                  <HelpCircle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-white">{q.question}</p>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Asked by <span className="text-white">{q.askedBy}</span></span>
                      {q.addressedTo && <span>→ <span className="text-cyan">{q.addressedTo}</span></span>}
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-bold',
                        q.status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'
                      )}>
                        {q.status}
                      </span>
                    </div>
                    <EvidenceQuote quote={q.sourceQuote} line={q.sourceLine} />
                  </div>
                </div>
              </div>
            ))}
          </Section>

          {/* View raw messages link */}
          <button
            onClick={() => onSelectConversation(conv.id)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all text-sm"
          >
            View raw messages & evidence
          </button>
        </>
      )}
    </div>
  );
}
