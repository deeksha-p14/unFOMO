import React, { useState } from 'react';
import { cn } from '../../utils';
import { ShieldCheck, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

interface PrivacySettingsProps {
  displayName: string;
  aiProvider: string;
  onUpdateConfig: (config: { displayName?: string; aiProvider?: string }) => Promise<void>;
  onWipeData: () => Promise<void>;
}

export function PrivacySettings({ displayName, aiProvider, onUpdateConfig, onWipeData }: PrivacySettingsProps) {
  const [name, setName] = useState(displayName);
  const [provider, setProvider] = useState(aiProvider);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await onUpdateConfig({ displayName: name.trim(), aiProvider: provider });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleWipe() {
    if (!wipeConfirm) { setWipeConfirm(true); return; }
    setWiping(true);
    try {
      await onWipeData();
      setWipeConfirm(false);
    } catch (e: any) {
      setError(e.message || 'Wipe failed.');
    } finally {
      setWiping(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Privacy & Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure display name for mention matching, AI provider, and data controls.
        </p>
      </div>

      {/* Privacy guarantees */}
      <div className="glass-card p-5">
        <h2 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          Privacy Guarantees
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['Local-First Processing', 'Conversations are processed server-side per-request and never persisted.'],
            ['No Raw Data Logging', 'Server logs contain metadata only, never raw conversation text.'],
            ['Session-Only Storage', 'All conversation data is stored in memory, cleared on restart.'],
            ['Minimal API Scopes', 'OAuth connectors request the minimum necessary permissions.'],
            ['Encrypted Tokens', 'OAuth tokens are encrypted at rest when connector keys are configured.'],
            ['Data Export & Wipe', 'Export or delete all your data at any time below.'],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
              <div>
                <p className="text-xs font-semibold text-emerald-300">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User config */}
      <div className="glass-card p-5 flex flex-col gap-5">
        <h2 className="font-bold text-white text-sm">User Preferences</h2>

        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold block mb-1.5">
            Display Name (for @mention detection)
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Alex or @alex"
            maxLength={80}
            className="w-full bg-navy-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-lavender-500/50 focus:ring-1 focus:ring-lavender-500/20 transition-all"
          />
          <p className="text-xs text-slate-600 mt-1">
            Used to highlight mentions directed at you. Never sent to third parties.
          </p>
        </div>

        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold block mb-1.5">
            AI Provider
          </label>
          <div className="flex gap-2">
            {[
              { id: 'mock', label: 'Mock (No API key)', desc: 'Regex-based, works offline' },
              { id: 'gemini', label: 'Gemini 2.5 Flash', desc: 'Requires GEMINI_API_KEY in .env' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={cn(
                  'flex-1 text-left px-4 py-3 rounded-xl border transition-all',
                  provider === p.id
                    ? 'bg-lavender-500/20 border-lavender-500/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                )}
              >
                <p className={cn('text-sm font-semibold', provider === p.id ? 'text-lavender-300' : 'text-slate-300')}>
                  {p.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-lavender-500/20 border border-lavender-500/30 text-lavender-300 hover:bg-lavender-500/30 transition-all font-semibold text-sm disabled:opacity-50"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : saved ? <><CheckCircle size={14} /> Saved!</> : 'Save Preferences'}
        </button>
      </div>

      {/* Data controls */}
      <div className="glass-card p-5">
        <h2 className="font-bold text-white text-sm mb-2">Cryptographic Vault & Data Controls</h2>
        <p className="text-xs text-slate-400 mb-4">
          All processed data is maintained purely in isolated memory. You can export a full JSON dump or immediately shred and purge all data.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/api/privacy/export"
            download="nofomo-vault-export.json"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all text-center"
          >
            <span>📥</span>
            <span>Export Encrypted Vault</span>
          </a>

          <button
            onClick={handleWipe}
            disabled={wiping}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50',
              wipeConfirm
                ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                : 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20'
            )}
          >
            {wiping ? (
              <><Loader2 size={14} className="animate-spin" /> Purging…</>
            ) : wipeConfirm ? (
              '⚠️ Click Again to Confirm Full Purge'
            ) : (
              '🗑 Delete All Stored Data'
            )}
          </button>
        </div>

        {wipeConfirm && !wiping && (
          <div className="flex justify-end mt-2">
            <button
              onClick={() => setWipeConfirm(false)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel Purge
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
