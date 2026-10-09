/**
 * noFOMO - Automated Test Suite
 * Tests parser accuracy, quote verification, and deterministic analysis.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseConversationText } from '../parser.ts';
import { verifySourceEvidence } from '../ai/provider.ts';
import { MockAIProvider } from '../ai/mockProvider.ts';
import { store } from '../store.ts';

test('Parser: Correctly extracts lines, timestamps, and senders from WhatsApp format', () => {
  const sample = `[10/09/2026, 09:15 AM] Maya: We need to submit the report by 5 PM.\n[10/09/2026, 09:16 AM] Alex: I am finishing Section 2 now.`;
  const result = parseConversationText(sample, 'whatsapp');

  assert.equal(result.messages.length, 2);
  assert.equal(result.messages[0].sender, 'Maya');
  assert.equal(result.messages[0].text, 'We need to submit the report by 5 PM.');
  assert.equal(result.messages[0].lineIndex, 1);
  assert.equal(result.messages[1].sender, 'Alex');
  assert.equal(result.messages[1].lineIndex, 2);
});

test('Parser: Handles multi-line message continuation without losing lines', () => {
  const sample = `Vikram: Here is the error trace:\nTypeError: Cannot read properties of undefined\n    at replica.js:42\nMaya: Looking into it.`;
  const result = parseConversationText(sample, 'slack');

  assert.equal(result.messages.length, 2);
  assert.ok(result.messages[0].text.includes('TypeError: Cannot read properties'));
  assert.equal(result.messages[1].sender, 'Maya');
});

test('Evidence Verification: Verifies verbatim quote against source lines', () => {
  const messages = [
    { id: '1', sender: 'Lead', text: 'Agreed: we drop the Redis cache and use SQLite instead.', timestamp: '10:00', lineIndex: 4, rawText: '' },
    { id: '2', sender: 'Dev', text: 'Sounds good to me.', timestamp: '10:01', lineIndex: 5, rawText: '' }
  ];

  const match = verifySourceEvidence('we drop the Redis cache and use SQLite instead', messages);
  assert.equal(match.verified, true);
  assert.equal(match.lineIndex, 4);

  const nonMatch = verifySourceEvidence('We are adopting Cassandra cluster for everything', messages);
  assert.equal(nonMatch.verified, false);
});

test('Mock AI Provider: Accurately identifies deadline, decision, and mention', async () => {
  const provider = new MockAIProvider();
  const demoConv = store.loadDemoConversation();
  const analysis = await provider.analyze(demoConv, 'Alex');

  assert.ok(analysis.summary.length > 20);
  assert.equal(analysis.priority, 'URGENT');
  assert.ok(analysis.decisions.length >= 1);
  assert.ok(analysis.tasks.length >= 1);
  assert.ok(analysis.deadlines.length >= 1);
  assert.ok(analysis.mentions.some(m => m.isUserMatch));
  assert.ok(analysis.unansweredQuestions.length >= 1);

  // Every extracted decision must be verified
  for (const d of analysis.decisions) {
    assert.equal(d.verified, true);
    assert.ok(d.sourceLine > 0);
  }
});

test('Action Approval: Idempotent execution and status transition', async () => {
  const demoConv = store.loadDemoConversation();
  store.saveConversation(demoConv);
  const provider = new MockAIProvider();
  const analysis = await provider.analyze(demoConv, 'Alex');
  store.saveAnalysis(demoConv.id, analysis);
  const actions = store.getProposedActions();
  assert.ok(actions.length > 0);

  const first = actions[0];
  const approved = store.approveAction(first.id);
  assert.equal(approved?.status, 'EXECUTED');

  // Second call is idempotent
  const secondCall = store.approveAction(first.id);
  assert.equal(secondCall?.status, 'EXECUTED');
});
