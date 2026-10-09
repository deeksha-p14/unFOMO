/**
 * noFOMO - Express REST API Routes
 * Complete with Zod schema validation, safety guards, and honest error handling.
 */

import { Router } from 'express';
import { z } from 'zod';
import { store } from './store.js';
import { parseConversationText } from './parser.js';
import { MockAIProvider } from './ai/mockProvider.js';
import { GeminiAIProvider } from './ai/geminiProvider.js';
import { CONNECTORS_REGISTRY } from './connectors/registry.js';

export const apiRouter = Router();

function getAIProvider() {
  const providerType = store.userConfig.aiProvider || process.env.AI_PROVIDER || 'mock';
  if (providerType === 'gemini') {
    return new GeminiAIProvider();
  }
  return new MockAIProvider();
}

// 1. Health & Config Check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'noFOMO — What Did I Miss?',
    version: '1.0.0',
    aiProvider: store.userConfig.aiProvider,
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    displayName: store.userConfig.displayName,
    conversationsCount: store.conversations.size,
    tasksCount: store.tasks.size,
    pendingActionsCount: Array.from(store.actions.values()).filter(a => a.status === 'PENDING').length
  });
});

// 2. Import Message Text / .txt Export
const ImportSchema = z.object({
  rawText: z.string().min(1, 'Conversation text cannot be empty').max(2000000, 'Text exceeds 2MB limit'),
  platform: z.enum(['slack', 'whatsapp', 'discord', 'gmail', 'instagram', 'teams', 'telegram', 'calendar', 'manual']).optional(),
  title: z.string().max(100).optional(),
  channelOrChat: z.string().max(100).optional()
});

apiRouter.post('/import', (req, res) => {
  try {
    const validated = ImportSchema.parse(req.body);
    const parsed = parseConversationText(validated.rawText, validated.platform || 'manual');

    const conversationId = `conv-${Date.now()}`;
    const newConv = {
      id: conversationId,
      title: validated.title || parsed.channelOrChat || 'Imported Chat',
      platform: validated.platform || parsed.platform,
      channelOrChat: validated.channelOrChat || parsed.channelOrChat,
      rawText: validated.rawText,
      messages: parsed.messages,
      importedAt: new Date().toISOString()
    };

    store.saveConversation(newConv);
    res.status(201).json({ success: true, conversation: newConv });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. Analyze Conversation
apiRouter.post('/analyze/:id', async (req, res) => {
  try {
    const conv = store.getConversation(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    const provider = getAIProvider();
    const analysis = await provider.analyze(conv, store.userConfig.displayName);
    store.saveAnalysis(conv.id, analysis);

    res.json({ success: true, analysis, actions: store.getProposedActions().filter(a => a.conversationId === conv.id) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. List Conversations
apiRouter.get('/conversations', (req, res) => {
  res.json({ success: true, conversations: store.getAllConversations() });
});

// 5. Get Single Conversation
apiRouter.get('/conversations/:id', (req, res) => {
  const conv = store.getConversation(req.params.id);
  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found.' });
  }
  res.json({ success: true, conversation: conv });
});

// 6. Delete Conversation
apiRouter.delete('/conversations/:id', (req, res) => {
  const deleted = store.deleteConversation(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Conversation not found.' });
  }
  res.json({ success: true, message: 'Conversation deleted.' });
});

// 7. Tasks
apiRouter.get('/tasks', (req, res) => {
  res.json({ success: true, tasks: Array.from(store.tasks.values()) });
});

apiRouter.patch('/tasks/:id/toggle', (req, res) => {
  const task = store.toggleTaskCompleted(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }
  res.json({ success: true, task });
});

// 8. Approval Queue for Actions
apiRouter.get('/actions', (req, res) => {
  res.json({ success: true, actions: store.getProposedActions() });
});

apiRouter.post('/actions/:id/approve', (req, res) => {
  const approved = store.approveAction(req.params.id);
  if (!approved) {
    return res.status(404).json({ success: false, error: 'Action not found.' });
  }
  res.json({ success: true, action: approved });
});

apiRouter.post('/actions/:id/dismiss', (req, res) => {
  const dismissed = store.dismissAction(req.params.id);
  if (!dismissed) {
    return res.status(404).json({ success: false, error: 'Action not found.' });
  }
  res.json({ success: true, action: dismissed });
});

// 9. Connectors
apiRouter.get('/connectors', (req, res) => {
  res.json({ success: true, connectors: Object.values(CONNECTORS_REGISTRY) });
});

apiRouter.post('/connectors/:id/test', (req, res) => {
  const id = req.params.id;
  const connector = CONNECTORS_REGISTRY[id];
  if (!connector) {
    return res.status(404).json({ success: false, error: 'Connector not found.' });
  }

  if (connector.status === 'CONFIGURED') {
    res.json({ success: true, message: `${connector.name} is configured and verified.` });
  } else {
    res.status(400).json({
      success: false,
      status: connector.status,
      message: connector.errorMessage || connector.setupInstructions
    });
  }
});

// 10. Audit History
apiRouter.get('/audit', (req, res) => {
  res.json({ success: true, auditLog: store.auditLog });
});

// 11. One-Click Hackathon Demo Mode
apiRouter.post('/demo', async (req, res) => {
  try {
    const demoConv = store.loadDemoConversation();
    store.saveConversation(demoConv);

    const provider = getAIProvider();
    const analysis = await provider.analyze(demoConv, store.userConfig.displayName);
    store.saveAnalysis(demoConv.id, analysis);

    res.json({
      success: true,
      message: 'Hackathon college team crunch demo loaded and analyzed.',
      conversation: demoConv,
      analysis,
      actions: store.getProposedActions().filter(a => a.conversationId === demoConv.id)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Privacy Controls: Wipe & Export
apiRouter.post('/privacy/wipe', (req, res) => {
  store.wipeAllData();
  res.json({ success: true, message: 'All conversation and task data wiped permanently.' });
});

apiRouter.get('/privacy/export', (req, res) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    conversations: store.getAllConversations(),
    tasks: Array.from(store.tasks.values()),
    actions: store.getProposedActions(),
    auditLog: store.auditLog,
    userConfig: store.userConfig
  };
  res.setHeader('Content-Disposition', 'attachment; filename=nofomo-export.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(exportData, null, 2));
});

// 13. Get & Update User Config
apiRouter.get('/user/config', (req, res) => {
  res.json({ success: true, config: store.userConfig });
});

const ConfigSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  aiProvider: z.enum(['mock', 'gemini']).optional()
});

apiRouter.patch('/user/config', (req, res) => {
  try {
    const validated = ConfigSchema.parse(req.body);
    if (validated.displayName) store.userConfig.displayName = validated.displayName;
    if (validated.aiProvider) store.userConfig.aiProvider = validated.aiProvider;

    store.addAudit('INFO', `Updated user preferences: Display name "${store.userConfig.displayName}", Provider "${store.userConfig.aiProvider}"`, 'INFO');
    res.json({ success: true, config: store.userConfig });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
