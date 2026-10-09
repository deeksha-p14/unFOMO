import React, { useState, useRef } from 'react';
import { cn, platformIcon } from '../../utils';
import type { PlatformType } from '../../types';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react';

const PLATFORMS: { id: PlatformType; label: string }[] = [
  { id: 'slack', label: 'Slack' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'discord', label: 'Discord' },
  { id: 'gmail', label: 'Gmail' },
  { id: 'teams', label: 'Teams' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'manual', label: 'Other / Manual' },
];

const SAMPLE_TEXT = `[2024-01-15 22:14] Maya: Team — URGENT reminder: our final report is due tonight at 11:59 PM. We cannot miss this deadline.
[2024-01-15 22:15] Priya: Got it. I'm finishing my section now.
[2024-01-15 22:17] Maya: Also, we decided earlier: we drop the Redis cache plan entirely to simplify deployment.
[2024-01-15 22:18] Maya: @Alex must finish Section 3 benchmarking graphs before 9:00 PM so we can compile.
[2024-01-15 22:19] Vikram: @Alex can you push your branch before 9 PM?
[2024-01-15 22:21] David: Who has the AWS billing receipt for Appendix B? We need it.
[2024-01-15 22:25] Priya: Grabbing coffee first, lol good luck everyone!`;

interface InboxViewProps {
  onImportAndAnalyze: (rawText: string, platform: string, title: string, channelOrChat: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function InboxView({ onImportAndAnalyze, isLoading, error }: InboxViewProps) {
  const [rawText, setRawText] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('slack');
  const [title, setTitle] = useState('');
  const [channelOrChat, setChannelOrChat] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = rawText.length;
  const MAX_CHARS = 500_000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) return;
    setSuccess(false);
    setFileError(null);
    try {
      await onImportAndAnalyze(rawText.trim(), platform, title.trim() || 'Untitled Conversation', channelOrChat.trim() || 'Unknown');
      setSuccess(true);
      setRawText('');
      setTitle('');
      setChannelOrChat('');
    } catch {
      // error handled by parent
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    if (file.size > 2_097_152) {
      setFileError('File too large. Maximum size is 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawText(text ?? '');
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.onerror = () => setFileError('Failed to read file.');
    reader.readAsText(file);
    // reset so same file can be re-uploaded
    e.target.value = '';
  }

  function loadSample() {
    setRawText(SAMPLE_TEXT);
    setTitle('CS410 Final Report Crunch');
    setChannelOrChat('#cs410-team-project');
    setPlatform('slack');
    setSuccess(false);
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Import Conversation</h1>
        <p className="text-sm text-slate-400 mt-1">
          Paste or upload a conversation export. Analysis runs server-side; data is never stored beyond your session.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-5">
        {/* Platform picker */}
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold block mb-2">Platform</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                  platform === p.id
                    ? 'bg-lavender-500/20 border-lavender-500/40 text-lavender-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                )}
              >
                <span>{platformIcon(p.id)}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title + Channel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold block mb-1.5">
              Conversation Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Project Launch Discussion"
              maxLength={120}
              className="w-full bg-navy-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-lavender-500/50 focus:ring-1 focus:ring-lavender-500/20 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold block mb-1.5">
              Channel / Chat Name
            </label>
            <input
              type="text"
              value={channelOrChat}
              onChange={e => setChannelOrChat(e.target.value)}
              placeholder="e.g. #general or Family Group"
              maxLength={80}
              className="w-full bg-navy-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-lavender-500/50 focus:ring-1 focus:ring-lavender-500/20 transition-all"
            />
          </div>
        </div>

        {/* Text area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
              Conversation Text
            </label>
            <div className="flex items-center gap-3 text-xs">
              <button type="button" onClick={loadSample} className="text-lavender-400 hover:text-lavender-300 transition-colors">
                Load sample
              </button>
              <span className={cn('text-slate-600', charCount > MAX_CHARS * 0.9 ? 'text-orange-400' : '')}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
              </span>
            </div>
          </div>
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder={`Paste your conversation here...\n\nSupported formats:\n• [YYYY-MM-DD HH:MM] Sender: Message\n• Sender: Message\n• WhatsApp export (.txt)\n• Plain text chat logs`}
            rows={14}
            maxLength={MAX_CHARS}
            className="w-full bg-navy-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 font-mono focus:outline-none focus:border-lavender-500/50 focus:ring-1 focus:ring-lavender-500/20 transition-all resize-y"
          />
        </div>

        {/* File upload */}
        <div
          className="flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-5 hover:border-lavender-500/30 transition-colors cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload .txt file"
        >
          <input ref={fileInputRef} type="file" accept=".txt,.json,.csv" className="hidden" onChange={handleFileUpload} />
          <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
            <Upload size={20} className="text-slate-600 group-hover:text-lavender-400 transition-colors" />
            <span className="text-xs text-slate-500 group-hover:text-slate-400">
              Click to upload <span className="font-semibold">.txt</span> file (max 2MB)
            </span>
          </div>
        </div>

        {/* Errors */}
        {(error || fileError) && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{error || fileError}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300">Conversation imported and analyzed! View results in AI Briefing.</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!rawText.trim() || isLoading || charCount > MAX_CHARS}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-lavender-500/20 border border-lavender-500/30 text-lavender-300 hover:bg-lavender-500/30 transition-all font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
          ) : (
            <><Sparkles size={16} /> Import & Analyze</>
          )}
        </button>
      </form>

      {/* Format tips */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
          <FileText size={14} className="text-slate-400" />
          Supported Formats
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
          {[
            ['WhatsApp Export', '.txt export from "Export Chat"'],
            ['Slack', 'Copy-pasted channel messages'],
            ['Discord', 'Copy chat history text'],
            ['Plain text', '"Sender: Message" per line'],
            ['Timestamped', '"[Date Time] Sender: Message"'],
            ['Manual', 'Any readable conversation text'],
          ].map(([fmt, desc]) => (
            <div key={fmt} className="flex gap-2">
              <span className="text-lavender-400 font-semibold shrink-0">{fmt}</span>
              <span className="text-slate-600">— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
