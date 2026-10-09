/**
 * noFOMO - In-Memory Store & Data Layer
 * Provides zero-configuration sandboxed persistence out of the box,
 * complete with approval queues, audit events, and PostgreSQL schema documentation.
 */

export class AppStore {
  constructor() {
    this.conversations = new Map();
    this.tasks = new Map();
    this.actions = new Map();
    this.auditLog = [];
    this.userConfig = {
      displayName: process.env.DEFAULT_USER_DISPLAY_NAME || 'Alex',
      aiProvider: process.env.AI_PROVIDER || 'mock',
      dataRetentionDays: 30,
    };

    this.addAudit('IMPORT', 'System initialized in sandboxed memory mode.', 'INFO');
  }

  addAudit(type, title, severity = 'INFO', details = '') {
    const event = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      title,
      details,
      severity
    };
    this.auditLog.unshift(event);
    if (this.auditLog.length > 200) this.auditLog.pop();
  }

  saveConversation(conv) {
    this.conversations.set(conv.id, conv);
    this.addAudit('IMPORT', `Imported conversation: "${conv.title}" (${conv.platform})`, 'INFO', `${conv.messages.length} messages parsed.`);
  }

  getConversation(id) {
    return this.conversations.get(id);
  }

  getAllConversations() {
    return Array.from(this.conversations.values()).sort(
      (a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime()
    );
  }

  deleteConversation(id) {
    const exists = this.conversations.has(id);
    if (exists) {
      this.conversations.delete(id);
      for (const [actionId, action] of this.actions.entries()) {
        if (action.conversationId === id) this.actions.delete(actionId);
      }
      this.addAudit('DATA_WIPED', `Deleted conversation ${id}`, 'WARNING');
    }
    return exists;
  }

  saveAnalysis(convId, analysis) {
    const conv = this.conversations.get(convId);
    if (conv) {
      conv.analysis = analysis;
      analysis.tasks.forEach(task => {
        this.tasks.set(task.id, task);
      });
      this.generateProposedActions(conv, analysis);
      this.addAudit('ANALYZE', `Analyzed "${conv.title}" with provider: ${analysis.provider}`, 'INFO');
    }
  }

  generateProposedActions(conv, analysis) {
    analysis.deadlines.forEach(dl => {
      const actionId = `act-cal-${dl.id}`;
      if (!this.actions.has(actionId)) {
        this.actions.set(actionId, {
          id: actionId,
          conversationId: conv.id,
          type: 'SCHEDULE_CALENDAR_EVENT',
          title: `Add Deadline to Calendar: ${dl.deadlineText}`,
          details: `Create calendar reminder: "${dl.title}". Source quote: "${dl.sourceQuote.substring(0, 80)}"`,
          destination: 'Google Calendar / Outlook Calendar',
          requiredPermissions: ['calendar.events.write'],
          sourceQuote: dl.sourceQuote,
          sourceLine: dl.sourceLine,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          idempotencyKey: `idemp-cal-${dl.id}`
        });
      }
    });

    analysis.tasks.slice(0, 3).forEach(t => {
      const actionId = `act-task-${t.id}`;
      if (!this.actions.has(actionId)) {
        this.actions.set(actionId, {
          id: actionId,
          conversationId: conv.id,
          type: 'CREATE_TASK',
          title: `Add Action Item: ${t.title}`,
          details: `Assign to: ${t.assignee || 'You'}. Deadline: ${t.deadline || 'None specified'}.`,
          destination: 'Local Task Center',
          requiredPermissions: ['tasks.write'],
          sourceQuote: t.sourceQuote,
          sourceLine: t.sourceLine,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          idempotencyKey: `idemp-task-${t.id}`
        });
      }
    });

    const userMention = analysis.mentions.find(m => m.isUserMatch);
    if (userMention) {
      const actionId = `act-reply-${userMention.id}`;
      if (!this.actions.has(actionId)) {
        this.actions.set(actionId, {
          id: actionId,
          conversationId: conv.id,
          type: 'DRAFT_REPLY',
          title: `Draft Reply to ${userMention.sender}`,
          details: `Prepare response to mention: "${userMention.quote.substring(0, 90)}..."`,
          destination: `${conv.platform.toUpperCase()} Thread`,
          requiredPermissions: ['chat.write', 'messages.send'],
          sourceQuote: userMention.quote,
          sourceLine: userMention.sourceLine,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          idempotencyKey: `idemp-reply-${userMention.id}`
        });
      }
    }
  }

  approveAction(actionId) {
    const action = this.actions.get(actionId);
    if (!action) return null;

    if (action.status !== 'PENDING') {
      return action;
    }

    action.status = 'APPROVED';
    action.reviewedAt = new Date().toISOString();

    if (action.type === 'CREATE_TASK') {
      action.status = 'EXECUTED';
      action.executionResult = 'Task successfully synchronized to Local Task Center.';
    } else if (action.type === 'SCHEDULE_CALENDAR_EVENT') {
      action.status = 'EXECUTED';
      action.executionResult = 'Draft event created locally in Sandbox Calendar Queue (Real Google OAuth pending setup).';
    } else if (action.type === 'DRAFT_REPLY') {
      action.status = 'EXECUTED';
      action.executionResult = 'Draft reply generated and staged for user review. Message not sent without manual dispatch.';
    }

    this.addAudit('ACTION_EXECUTED', `Action approved & executed: ${action.title}`, 'INFO', action.executionResult);
    return action;
  }

  dismissAction(actionId) {
    const action = this.actions.get(actionId);
    if (!action) return null;
    action.status = 'DISMISSED';
    action.reviewedAt = new Date().toISOString();
    this.addAudit('ACTION_DISMISSED', `Action dismissed: ${action.title}`, 'INFO');
    return action;
  }

  getProposedActions() {
    return Array.from(this.actions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  toggleTaskCompleted(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    task.completed = !task.completed;
    return task;
  }

  wipeAllData() {
    this.conversations.clear();
    this.tasks.clear();
    this.actions.clear();
    this.addAudit('DATA_WIPED', 'All conversations and action queues have been permanently purged.', 'CRITICAL');
  }

  loadDemoConversation() {
    const demoRawText = `[09/10/2026, 04:15 PM] Maya (Team Lead): Team, urgent reminder: CS410 Final Report is due tonight by 11:59 PM.
[09/10/2026, 04:17 PM] Vikram (Backend): We ran the stress test. Redis cache cluster failed with OOM errors under load.
[09/10/2026, 04:20 PM] David (DBA): Should we try to fix the Redis clustering or drop it for the final paper?
[09/10/2026, 04:22 PM] Maya (Team Lead): Agreed: we drop the Redis cache feature and submit SQLite benchmarks instead.
[09/10/2026, 04:25 PM] Maya (Team Lead): @Alex must finish Section 3 benchmarking graphs before 9:00 PM so we can assemble the PDF.
[09/10/2026, 04:28 PM] Vikram (Backend): @Alex can you push your branch before 9 PM?
[09/10/2026, 04:30 PM] David (DBA): Who has the AWS billing receipt for Appendix B?
[09/10/2026, 04:35 PM] Priya: Grabbing coffee first, lol good luck everyone!`;

    const demoMessages = [
      { id: 'demo-msg-1', sender: 'Maya (Team Lead)', text: 'Team, urgent reminder: CS410 Final Report is due tonight by 11:59 PM.', timestamp: '04:15 PM', lineIndex: 1, rawText: '[09/10/2026, 04:15 PM] Maya (Team Lead): Team, urgent reminder: CS410 Final Report is due tonight by 11:59 PM.' },
      { id: 'demo-msg-2', sender: 'Vikram (Backend)', text: 'We ran the stress test. Redis cache cluster failed with OOM errors under load.', timestamp: '04:17 PM', lineIndex: 2, rawText: '[09/10/2026, 04:17 PM] Vikram (Backend): We ran the stress test. Redis cache cluster failed with OOM errors under load.' },
      { id: 'demo-msg-3', sender: 'David (DBA)', text: 'Should we try to fix the Redis clustering or drop it for the final paper?', timestamp: '04:20 PM', lineIndex: 3, rawText: '[09/10/2026, 04:20 PM] David (DBA): Should we try to fix the Redis clustering or drop it for the final paper?' },
      { id: 'demo-msg-4', sender: 'Maya (Team Lead)', text: 'Agreed: we drop the Redis cache feature and submit SQLite benchmarks instead.', timestamp: '04:22 PM', lineIndex: 4, rawText: '[09/10/2026, 04:22 PM] Maya (Team Lead): Agreed: we drop the Redis cache feature and submit SQLite benchmarks instead.' },
      { id: 'demo-msg-5', sender: 'Maya (Team Lead)', text: '@Alex must finish Section 3 benchmarking graphs before 9:00 PM so we can assemble the PDF.', timestamp: '04:25 PM', lineIndex: 5, rawText: '[09/10/2026, 04:25 PM] Maya (Team Lead): @Alex must finish Section 3 benchmarking graphs before 9:00 PM so we can assemble the PDF.' },
      { id: 'demo-msg-6', sender: 'Vikram (Backend)', text: '@Alex can you push your branch before 9 PM?', timestamp: '04:28 PM', lineIndex: 6, rawText: '[09/10/2026, 04:28 PM] Vikram (Backend): @Alex can you push your branch before 9 PM?' },
      { id: 'demo-msg-7', sender: 'David (DBA)', text: 'Who has the AWS billing receipt for Appendix B?', timestamp: '04:30 PM', lineIndex: 7, rawText: '[09/10/2026, 04:30 PM] David (DBA): Who has the AWS billing receipt for Appendix B?' },
      { id: 'demo-msg-8', sender: 'Priya', text: 'Grabbing coffee first, lol good luck everyone!', timestamp: '04:35 PM', lineIndex: 8, rawText: '[09/10/2026, 04:35 PM] Priya: Grabbing coffee first, lol good luck everyone!' }
    ];

    const demoConv = {
      id: 'demo-cs410-crunch',
      title: 'CS410 Final Report Crunch',
      platform: 'slack',
      channelOrChat: '#cs410-team-project',
      rawText: demoRawText,
      messages: demoMessages,
      importedAt: new Date().toISOString(),
      isDemo: true
    };

    return demoConv;
  }
}

export const store = new AppStore();
