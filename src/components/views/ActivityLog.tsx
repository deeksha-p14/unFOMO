import React, { useState } from 'react';
import { cn } from '../../utils';
import type { AuditEvent } from '../../types';
import { ActivitySquare, Info, AlertTriangle, Zap } from 'lucide-react';

interface ActivityLogProps {
  auditLog: AuditEvent[];
}

const SEVERITY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  INFO: {
    icon: <Info size={12} />,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
  },
  WARNING: {
    icon: <AlertTriangle size={12} />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  CRITICAL: {
    icon: <Zap size={12} />,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
};

export function ActivityLog({ auditLog }: ActivityLogProps) {
  if (auditLog.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-6">
        <ActivitySquare size={40} className="text-slate-700" />
        <div>
          <h2 className="text-lg font-bold text-white">No activity yet</h2>
          <p className="text-sm text-slate-400 mt-1">Activity events will be logged here as you use noFOMO.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Activity Log</h1>
        <p className="text-sm text-slate-400 mt-1">{auditLog.length} events recorded this session</p>
      </div>

      <div className="glass-card divide-y divide-white/5 overflow-hidden">
        {[...auditLog].reverse().map(event => {
          const cfg = SEVERITY_CONFIG[event.severity] ?? SEVERITY_CONFIG.INFO;
          return (
            <div key={event.id} className="flex items-start gap-4 p-4 hover:bg-white/3 transition-colors">
              <div className={cn('flex items-center justify-center w-6 h-6 rounded-full border shrink-0 mt-0.5', cfg.bg, cfg.color)}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">{event.title}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold border', cfg.bg, cfg.color)}>
                    {event.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{event.details}</p>
                <p className="text-[10px] text-slate-600 mt-1">
                  {new Date(event.timestamp).toLocaleString()} · {event.type}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
