import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | null): string {
  if (!iso) return 'Unknown date';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

export function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function priorityColor(p: string): string {
  switch (p) {
    case 'URGENT':   return 'text-red-400';
    case 'CRITICAL': return 'text-red-400';
    case 'HIGH':     return 'text-orange-400';
    case 'MEDIUM':   return 'text-yellow-400';
    case 'LOW':      return 'text-slate-400';
    default:         return 'text-slate-400';
  }
}

export function priorityBg(p: string): string {
  switch (p) {
    case 'URGENT':   return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'CRITICAL': return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'HIGH':     return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'MEDIUM':   return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    case 'LOW':      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    default:         return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
}

export function connectorStatusColor(s: string): string {
  switch (s) {
    case 'CONFIGURED': return 'text-emerald-400';
    case 'SETUP_REQUIRED': return 'text-yellow-400';
    case 'MANUAL_IMPORT_AVAILABLE': return 'text-cyan-400';
    case 'COMING_SOON': return 'text-slate-500';
    case 'ERROR': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

export function platformIcon(platform: string): string {
  const icons: Record<string, string> = {
    slack: '🔷', whatsapp: '💬', discord: '🟣', gmail: '📧',
    instagram: '📸', teams: '🔵', telegram: '✈️', calendar: '📅', manual: '📄',
  };
  return icons[platform] ?? '💬';
}

export function estimateReadTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}
