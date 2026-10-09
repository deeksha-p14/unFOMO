import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/views/OverviewDashboard';
import { InboxView } from './components/views/InboxView';
import { BriefingView } from './components/views/BriefingView';
import { TaskCenter } from './components/views/TaskCenter';
import { DeadlinesView } from './components/views/DeadlinesView';
import { DecisionsView } from './components/views/DecisionsView';
import { MentionsView } from './components/views/MentionsView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { ActivityLog } from './components/views/ActivityLog';
import { PrivacySettings } from './components/views/PrivacySettings';
import { ConversationDetail } from './components/views/ConversationDetail';
import { ActionsQueue } from './components/views/ActionsQueue';

import { TopBar } from './components/TopBar';

import * as api from './api';
import type {
  NavigationTab, ImportedConversation, TaskItem,
  ProposedAction, ConnectorInfo, AuditEvent
} from './types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [conversations, setConversations] = useState<ImportedConversation[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [actions, setActions] = useState<ProposedAction[]>([]);
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [aiProvider, setAiProvider] = useState('mock');

  const [isLoading, setIsLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string, type: Toast['type'] = 'info') {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }

  // Load initial data
  useEffect(() => {
    Promise.allSettled([
      api.fetchConversations().then(setConversations),
      api.fetchTasks().then(setTasks),
      api.fetchActions().then(setActions),
      api.fetchConnectors().then(setConnectors),
      api.fetchAuditLog().then(setAuditLog),
      api.fetchUserConfig().then(cfg => {
        if (cfg?.displayName) setDisplayName(cfg.displayName);
        if (cfg?.aiProvider) setAiProvider(cfg.aiProvider);
      }),
    ]).catch(() => {});
  }, []);

  // Refresh audit log when needed
  const refreshAuditLog = useCallback(async () => {
    try { setAuditLog(await api.fetchAuditLog()); } catch {}
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [convs, ts, acts, audit] = await Promise.all([
        api.fetchConversations(),
        api.fetchTasks(),
        api.fetchActions(),
        api.fetchAuditLog(),
      ]);
      setConversations(convs);
      setTasks(ts);
      setActions(acts);
      setAuditLog(audit);
    } catch {}
  }, []);

  const [showWipeModal, setShowWipeModal] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  async function handleImportAndAnalyze(rawText: string, platform: string, title: string, channelOrChat: string) {
    setIsLoading(true);
    setImportError(null);
    try {
      const { conversation } = await api.importText(rawText, platform, title, channelOrChat);
      showToast('Conversation imported. Analyzing…', 'info');

      const { analysis, actions: newActions } = await api.analyzeConversation(conversation.id);

      // Merge analysis into conversation
      const updatedConv = { ...conversation, analysis };
      setConversations(prev => {
        const existing = prev.find(c => c.id === updatedConv.id);
        if (existing) return prev.map(c => c.id === updatedConv.id ? updatedConv : c);
        return [updatedConv, ...prev];
      });
      setTasks(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const merged = [...prev];
        analysis.tasks.forEach(t => {
          if (!existingIds.has(t.id)) merged.push(t);
        });
        return merged;
      });
      setActions(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const merged = [...prev];
        newActions.forEach(a => {
          if (!existingIds.has(a.id)) merged.push(a);
        });
        return merged;
      });

      await refreshAuditLog();
      showToast('Analysis complete!', 'success');
      setActiveTab('briefing');
    } catch (e: any) {
      const msg = e.message || 'Failed to import or analyze.';
      setImportError(msg);
      showToast(msg, 'error');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLoadDemo() {
    setIsLoading(true);
    try {
      const { conversation, analysis, actions: demoActions } = await api.loadDemoMode();
      const convWithAnalysis = { ...conversation, analysis };

      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== convWithAnalysis.id);
        return [convWithAnalysis, ...filtered];
      });
      setTasks(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const merged = [...prev];
        analysis.tasks.forEach(t => {
          if (!existingIds.has(t.id)) merged.push(t);
        });
        return merged;
      });
      setActions(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const merged = [...prev];
        demoActions.forEach(a => {
          if (!existingIds.has(a.id)) merged.push(a);
        });
        return merged;
      });

      await refreshAuditLog();
      showToast('Demo conversation loaded!', 'success');
      setActiveTab('briefing');
    } catch (e: any) {
      showToast(e.message || 'Failed to load demo.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleTask(taskId: string) {
    try {
      const updated = await api.toggleTask(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      // also update in conversation analysis
      setConversations(prev => prev.map(conv => {
        if (!conv.analysis) return conv;
        return {
          ...conv,
          analysis: {
            ...conv.analysis,
            tasks: conv.analysis.tasks.map(t => t.id === taskId ? updated : t)
          }
        };
      }));
    } catch (e: any) {
      showToast(e.message || 'Failed to toggle task.', 'error');
    }
  }

  async function handleApproveAction(id: string) {
    try {
      const updated = await api.approveAction(id);
      setActions(prev => prev.map(a => a.id === id ? updated : a));
      await refreshAuditLog();
      showToast('Action approved!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to approve action.', 'error');
    }
  }

  async function handleDismissAction(id: string) {
    try {
      const updated = await api.dismissAction(id);
      setActions(prev => prev.map(a => a.id === id ? updated : a));
      showToast('Action dismissed.', 'info');
    } catch (e: any) {
      showToast(e.message || 'Failed to dismiss action.', 'error');
    }
  }

  async function handleUpdateConfig(config: { displayName?: string; aiProvider?: string }) {
    const updated = await api.updateUserConfig(config);
    if (config.displayName !== undefined) setDisplayName(config.displayName ?? '');
    if (config.aiProvider !== undefined) setAiProvider(config.aiProvider ?? 'mock');
    return updated;
  }

  async function handleDeleteConversation(id: string) {
    try {
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      setTasks(prev => prev.filter(t => !t.id.includes(id)));
      setActions(prev => prev.filter(a => a.conversationId !== id));
      if (selectedConvId === id) {
        setSelectedConvId(null);
        setActiveTab('overview');
      }
      await refreshAuditLog();
      showToast('Conversation deleted.', 'info');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete conversation.', 'error');
    }
  }

  async function handleWipeData() {
    setIsWiping(true);
    try {
      await api.wipeAllData();
      setConversations([]);
      setTasks([]);
      setActions([]);
      setAuditLog([]);
      setSelectedConvId(null);
      setShowWipeModal(false);
      setActiveTab('overview');
      showToast('All conversation and session data has been permanently wiped.', 'info');
    } catch (e: any) {
      showToast(e.message || 'Failed to wipe data.', 'error');
    } finally {
      setIsWiping(false);
    }
  }

  function handleSelectConversation(id: string) {
    setSelectedConvId(id);
    setActiveTab('detail');
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab as NavigationTab);
    if (tab !== 'detail') setSelectedConvId(null);
  }

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  function renderContent() {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewDashboard
            conversations={conversations}
            tasks={tasks}
            actions={actions}
            onLoadDemo={handleLoadDemo}
            onRequestWipeAll={() => setShowWipeModal(true)}
            onSelectConversation={handleSelectConversation}
            onTabChange={handleTabChange}
            isLoading={isLoading}
          />
        );
      case 'inbox':
        return (
          <InboxView
            onImportAndAnalyze={handleImportAndAnalyze}
            isLoading={isLoading}
            error={importError}
          />
        );
      case 'briefing':
        return (
          <BriefingView
            conversations={conversations}
            onToggleTask={handleToggleTask}
            onSelectConversation={handleSelectConversation}
          />
        );
      case 'tasks':
        return (
          <>
            <TaskCenter tasks={tasks} onToggleTask={handleToggleTask} />
            {actions.filter(a => a.status === 'PENDING').length > 0 && (
              <div className="px-6 pb-6 max-w-4xl mx-auto w-full">
                <ActionsQueue
                  actions={actions}
                  onApprove={handleApproveAction}
                  onDismiss={handleDismissAction}
                />
              </div>
            )}
          </>
        );
      case 'deadlines':
        return <DeadlinesView conversations={conversations} />;
      case 'decisions':
        return <DecisionsView conversations={conversations} />;
      case 'mentions':
        return <MentionsView conversations={conversations} />;
      case 'integrations':
        return <IntegrationsView connectors={connectors} />;
      case 'activity':
        return <ActivityLog auditLog={auditLog} />;
      case 'privacy':
        return (
          <PrivacySettings
            displayName={displayName}
            aiProvider={aiProvider}
            onUpdateConfig={handleUpdateConfig}
            onWipeData={handleWipeData}
          />
        );
      case 'detail':
        if (selectedConv) {
          return (
            <ConversationDetail
              conversation={selectedConv}
              onBack={() => handleTabChange('briefing')}
              onToggleTask={handleToggleTask}
              onDelete={handleDeleteConversation}
            />
          );
        }
        setActiveTab('briefing');
        return null;
      default:
        return null;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        conversations={conversations}
        tasks={tasks}
        actions={actions}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        onRequestWipeAll={() => setShowWipeModal(true)}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar
          activeTab={activeTab}
          conversationCount={conversations.length}
          onRequestWipeAll={() => setShowWipeModal(true)}
        />
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      {/* Wipe All Data Confirmation Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 glass-card bg-navy-900/95 border-red-500/30 shadow-2xl rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/20 text-red-400 text-lg">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete All Session Data?</h3>
                <p className="text-xs text-slate-400">Zero-knowledge local purge</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will permanently shred and wipe all loaded conversations, extracted action items, deadlines, decisions, and security audit logs from local memory.
            </p>

            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
              ⚡ <strong>Local-first guarantee:</strong> Data is zeroized immediately. Once deleted, it cannot be recovered without re-importing the original files.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/8">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                disabled={isWiping}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWipeData}
                disabled={isWiping}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-100 bg-red-600/80 hover:bg-red-600 border border-red-500 transition-all shadow-lg shadow-red-900/30 disabled:opacity-50"
              >
                {isWiping ? 'Purging…' : '🗑 Yes, Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl border text-sm font-medium
              backdrop-blur-xl transition-all animate-in slide-in-from-bottom-2
              ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' :
                toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
                'bg-slate-800/90 border-white/10 text-slate-200'}
            `}
          >
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
