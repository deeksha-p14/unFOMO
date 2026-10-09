import React, { useState } from 'react';
import { cn, connectorStatusColor } from '../../utils';
import type { ConnectorInfo } from '../../types';
import { Plug, ExternalLink, CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';

interface IntegrationsViewProps {
  connectors: ConnectorInfo[];
}

const STATUS_LABELS: Record<string, string> = {
  CONFIGURED: '✓ Active',
  SETUP_REQUIRED: 'Setup Required',
  MANUAL_IMPORT_AVAILABLE: 'Manual Import',
  COMING_SOON: 'Coming Soon',
  ERROR: 'Error',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  CONFIGURED: <CheckCircle size={14} />,
  SETUP_REQUIRED: <AlertCircle size={14} />,
  MANUAL_IMPORT_AVAILABLE: <Info size={14} />,
  COMING_SOON: <Clock size={14} />,
  ERROR: <AlertCircle size={14} />,
};

const PLATFORM_EMOJIS: Record<string, string> = {
  gmail: '📧', discord: '🟣', whatsapp: '💬', instagram: '📸',
  slack: '🔷', teams: '🔵', telegram: '✈️', calendar: '📅', manual: '📄',
};

export function IntegrationsView({ connectors }: IntegrationsViewProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Integrations</h1>
        <p className="text-sm text-slate-400 mt-1">
          Connect your communication channels. All connections use official APIs with minimum-necessary permissions.
          No passwords, no scraping.
        </p>
      </div>

      {/* Honesty notice */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
        <Info size={16} className="text-sky-400 mt-0.5 shrink-0" />
        <p className="text-sm text-sky-300">
          <strong>Honest integration status:</strong> Only connectors with configured API credentials show as Active.
          Others require setup or are coming soon. No fake OAuth flows or simulated data syncing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map(connector => (
          <div key={connector.id} className="glass-card overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">{PLATFORM_EMOJIS[connector.id] ?? '🔌'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between flex-wrap">
                    <div>
                      <h3 className="font-bold text-white text-sm">{connector.name}</h3>
                      <span className="text-xs text-slate-500">{connector.category}</span>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1.5 text-xs font-semibold',
                      connectorStatusColor(connector.status)
                    )}>
                      {STATUS_ICONS[connector.status]}
                      {STATUS_LABELS[connector.status] ?? connector.status}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{connector.description}</p>
                </div>
              </div>

              {/* Capabilities */}
              {connector.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {connector.capabilities.map(cap => (
                    <span key={cap} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                      {cap}
                    </span>
                  ))}
                </div>
              )}

              {/* Last sync */}
              {connector.lastSync && (
                <div className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                  <Clock size={10} />
                  Last sync: {new Date(connector.lastSync).toLocaleString()}
                </div>
              )}

              {/* Error */}
              {connector.errorMessage && (
                <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={10} />
                  {connector.errorMessage}
                </div>
              )}
            </div>

            {/* Setup instructions */}
            <div className="border-t border-white/5">
              <button
                onClick={() => setExpanded(expanded === connector.id ? null : connector.id)}
                className="w-full px-5 py-3 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors text-left flex items-center justify-between"
              >
                <span>
                  {connector.status === 'CONFIGURED' ? 'View permissions' : 'Setup instructions'}
                </span>
                <span>{expanded === connector.id ? '▲' : '▼'}</span>
              </button>

              {expanded === connector.id && (
                <div className="px-5 pb-4">
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{connector.setupInstructions}</p>

                  {connector.permissions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-slate-600 uppercase font-semibold mb-1.5">Required permissions:</p>
                      <div className="flex flex-col gap-1">
                        {connector.permissions.map(p => (
                          <div key={p} className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="text-emerald-400">✓</span> {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {connector.docsUrl && (
                    <a
                      href={connector.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-lavender-400 hover:text-lavender-300 transition-colors"
                    >
                      <ExternalLink size={11} />
                      Official API documentation
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
