/**
 * noFOMO - API Client
 * Connects frontend to Express backend
 */

import {
  ImportedConversation,
  StructuredAnalysis,
  TaskItem,
  ProposedAction,
  AuditEvent,
  ConnectorInfo
} from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function importText(
  rawText: string,
  platform?: string,
  title?: string,
  channelOrChat?: string
): Promise<{ success: boolean; conversation: ImportedConversation }> {
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, platform, title, channelOrChat })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Import failed.');
  return data;
}

export async function analyzeConversation(
  id: string
): Promise<{ success: boolean; analysis: StructuredAnalysis; actions: ProposedAction[] }> {
  const res = await fetch(`${API_BASE}/analyze/${id}`, {
    method: 'POST'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Analysis failed.');
  return data;
}

export async function fetchConversations(): Promise<ImportedConversation[]> {
  const res = await fetch(`${API_BASE}/conversations`);
  const data = await res.json();
  return data.conversations || [];
}

export async function fetchConversation(id: string): Promise<ImportedConversation> {
  const res = await fetch(`${API_BASE}/conversations/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Conversation not found.');
  return data.conversation;
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete conversation.');
}

export async function fetchTasks(): Promise<TaskItem[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  const data = await res.json();
  return data.tasks || [];
}

export async function toggleTask(id: string): Promise<TaskItem> {
  const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, { method: 'PATCH' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle task.');
  return data.task;
}

export async function fetchActions(): Promise<ProposedAction[]> {
  const res = await fetch(`${API_BASE}/actions`);
  const data = await res.json();
  return data.actions || [];
}

export async function approveAction(id: string): Promise<ProposedAction> {
  const res = await fetch(`${API_BASE}/actions/${id}/approve`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to approve action.');
  return data.action;
}

export async function dismissAction(id: string): Promise<ProposedAction> {
  const res = await fetch(`${API_BASE}/actions/${id}/dismiss`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to dismiss action.');
  return data.action;
}

export async function fetchConnectors(): Promise<ConnectorInfo[]> {
  const res = await fetch(`${API_BASE}/connectors`);
  const data = await res.json();
  return data.connectors || [];
}

export async function testConnector(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/connectors/${id}/test`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Connector verification failed.');
  return data;
}

export async function fetchAuditLog(): Promise<AuditEvent[]> {
  const res = await fetch(`${API_BASE}/audit`);
  const data = await res.json();
  return data.auditLog || [];
}

export async function loadDemoMode(): Promise<{
  conversation: ImportedConversation;
  analysis: StructuredAnalysis;
  actions: ProposedAction[];
}> {
  const res = await fetch(`${API_BASE}/demo`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load demo mode.');
  return data;
}

export async function wipeAllData(): Promise<void> {
  const res = await fetch(`${API_BASE}/privacy/wipe`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to wipe data.');
}

export async function fetchUserConfig(): Promise<{ displayName: string; aiProvider: string }> {
  const res = await fetch(`${API_BASE}/user/config`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user config.');
  return data.config;
}

export async function updateUserConfig(config: { displayName?: string; aiProvider?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/user/config`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update preferences.');
  return data.config;
}
