import React, { useState } from 'react';
import { cn } from '../../utils';
import type { TaskItem } from '../../types';
import { CheckCircle2, Clock, Filter } from 'lucide-react';

interface TaskCenterProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
}

type FilterState = 'all' | 'pending' | 'completed';

export function TaskCenter({ tasks, onToggleTask }: TaskCenterProps) {
  const [filter, setFilter] = useState<FilterState>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filtered = tasks.filter(t => {
    const matchesStatus = filter === 'all' || (filter === 'pending' ? !t.completed : t.completed);
    return matchesStatus;
  });

  const pending = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-6">
        <CheckCircle2 size={40} className="text-slate-700" />
        <div>
          <h2 className="text-lg font-bold text-white">No tasks yet</h2>
          <p className="text-sm text-slate-400 mt-1">Import and analyze a conversation to extract action items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pending} pending · {completed} completed</p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed'] as FilterState[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize',
                filter === f
                  ? 'bg-lavender-500/20 border-lavender-500/40 text-lavender-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card divide-y divide-white/5 overflow-hidden">
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 p-5">No tasks match this filter.</p>
        )}
        {filtered.map(task => (
          <div key={task.id} className="flex items-start gap-4 p-5 hover:bg-white/3 transition-colors">
            <button
              onClick={() => onToggleTask(task.id)}
              className={cn(
                'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                task.completed
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'border-slate-600 hover:border-lavender-400'
              )}
            >
              {task.completed && <CheckCircle2 size={12} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium text-white', task.completed && 'line-through text-slate-500')}>
                {task.title}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                {task.assignee && (
                  <span>To: <span className="text-cyan font-medium">{task.assignee}</span></span>
                )}
                {task.deadline && (
                  <span className={cn('flex items-center gap-1', task.isExplicitDeadline ? 'text-orange-400' : 'text-slate-500')}>
                    <Clock size={10} />
                    {task.deadline}
                    {!task.isExplicitDeadline && ' (inferred)'}
                  </span>
                )}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full border font-semibold',
                  task.verified
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                )}>
                  {task.verified ? `${Math.round(task.confidence)}% verified` : 'unverified'}
                </span>
              </div>
              <div className="mt-2 px-3 py-1.5 rounded-lg bg-navy-950/60 border-l-2 border-lavender-500/30">
                <p className="text-xs text-slate-400 italic">"{task.sourceQuote}"</p>
                <span className="text-[10px] text-slate-600">Line {task.sourceLine + 1}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
