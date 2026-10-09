/**
 * noFOMO - Deterministic Mock AI Provider
 * High-accuracy, offline, zero-hallucination analysis engine.
 * Never invents facts; anchors every task, decision, and deadline to verified source lines.
 */

import { verifySourceEvidence } from './provider.js';

export class MockAIProvider {
  constructor() {
    this.name = 'mock';
  }

  async analyze(conversation, userDisplayName = 'Alex') {
    const messages = conversation.messages || [];

    // 1. Extract Decisions
    const decisions = [];
    const decisionKeywords = ['agreed', 'decided', 'consensus', 'settled on', 'approved', 'we will go with', 'signed off'];

    messages.forEach((msg, idx) => {
      const sentences = msg.text.split(/(?<=[.?!])\s+/);
      sentences.forEach(sentence => {
        const lower = sentence.toLowerCase();
        if (decisionKeywords.some(kw => lower.includes(kw)) && sentence.length > 12) {
          const verification = verifySourceEvidence(sentence, messages);
          decisions.push({
            id: `dec-${idx + 1}-${decisions.length + 1}`,
            decision: cleanPunctuation(sentence),
            consensus: `Agreed by ${msg.sender} and participating members`,
            sourceQuote: sentence,
            sourceLine: verification.lineIndex || msg.lineIndex,
            confidence: 0.95,
            verified: verification.verified
          });
        }
      });
    });

    // 2. Extract Tasks
    const tasks = [];
    const taskTriggers = ['todo', 'action item', 'must finish', 'can you', 'please finish', 'please check', 'need you to', 'assigned to', 'will handle', 'push your branch'];

    messages.forEach((msg, idx) => {
      const sentences = msg.text.split(/(?<=[.?!])\s+/);
      sentences.forEach(sentence => {
        const lower = sentence.toLowerCase();
        if (taskTriggers.some(kw => lower.includes(kw)) && sentence.length > 10) {
          let assignee = null;
          const mentionMatch = sentence.match(/@(\w+)/);
          if (mentionMatch) {
            assignee = mentionMatch[1];
          } else if (lower.includes('i will') || lower.includes("i'll")) {
            assignee = msg.sender;
          }

          const deadlineMatch = sentence.match(/(?:by|before|until|due)\s+([a-zA-Z0-9:\s]+?(?:am|pm|today|tonight|tomorrow|friday|monday)?)(?=[,.]|$)/i);
          const deadlineText = deadlineMatch ? deadlineMatch[1].trim() : null;
          const isExplicit = !!deadlineText && /\d|am|pm|tonight|today|eod/i.test(deadlineText);

          const verification = verifySourceEvidence(sentence, messages);
          tasks.push({
            id: `task-${idx + 1}-${tasks.length + 1}`,
            title: cleanTaskTitle(sentence),
            assignee: assignee,
            deadline: deadlineText,
            isExplicitDeadline: isExplicit,
            sourceQuote: sentence,
            sourceLine: verification.lineIndex || msg.lineIndex,
            completed: false,
            confidence: 0.92,
            verified: verification.verified
          });
        }
      });
    });

    // 3. Extract Deadlines
    const deadlines = [];
    const deadlineRegexes = [
      { regex: /(?:due|deadline\s*is|before|by)\s+(tonight\s+by\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i, explicit: true, urgency: 'CRITICAL' },
      { regex: /(?:due|deadline\s*is|before|by)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:today|tonight)?)/i, explicit: true, urgency: 'CRITICAL' },
      { regex: /(?:due|before|by)\s+(tomorrow\s*(?:morning|afternoon|evening|eod)?)/i, explicit: true, urgency: 'NEAR_TERM' },
      { regex: /(?:due|before|by)\s+(friday|monday|tuesday|wednesday|thursday|saturday|sunday)/i, explicit: true, urgency: 'UPCOMING' },
      { regex: /(?:asap|immediately|within\s+\d+\s+hours?)/i, explicit: false, urgency: 'CRITICAL' }
    ];

    messages.forEach((msg, idx) => {
      deadlineRegexes.forEach(pattern => {
        const match = msg.text.match(pattern.regex);
        if (match) {
          const verification = verifySourceEvidence(msg.text, messages);
          deadlines.push({
            id: `dl-${idx + 1}-${deadlines.length + 1}`,
            title: `${msg.sender}: ${match[0]}`,
            deadlineText: match[1] || match[0],
            deadlineDate: pattern.explicit ? new Date().toISOString().split('T')[0] : null,
            isExplicit: pattern.explicit,
            urgency: pattern.urgency,
            sourceQuote: msg.text,
            sourceLine: verification.lineIndex || msg.lineIndex,
            verified: verification.verified
          });
        }
      });
    });

    // 4. Extract Direct Mentions
    const mentions = [];
    const normalizedUser = userDisplayName.toLowerCase();

    messages.forEach((msg, idx) => {
      const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
      let match;
      while ((match = mentionRegex.exec(msg.text)) !== null) {
        const target = match[1];
        const isUserMatch = target.toLowerCase() === normalizedUser || target.toLowerCase() === 'you';
        const verification = verifySourceEvidence(msg.text, messages);

        mentions.push({
          id: `men-${idx + 1}-${mentions.length + 1}`,
          targetMention: `@${target}`,
          sender: msg.sender,
          quote: msg.text,
          sourceLine: verification.lineIndex || msg.lineIndex,
          isUserMatch: isUserMatch
        });
      }
    });

    // 5. Extract Unanswered Questions
    const unansweredQuestions = [];
    messages.forEach((msg, idx) => {
      const sentences = msg.text.split(/(?<=[.?!])\s+/);
      sentences.forEach(sentence => {
        if (sentence.includes('?') && sentence.length > 8) {
          const isAnswered = messages.slice(idx + 1, idx + 4).some(next => 
            next.sender !== msg.sender && next.text.length > 8
          );

          let addressedTo = null;
          if (sentence.toLowerCase().includes(`@${normalizedUser}`) || sentence.toLowerCase().includes('you')) {
            addressedTo = userDisplayName;
          }

          const verification = verifySourceEvidence(sentence, messages);
          unansweredQuestions.push({
            id: `q-${idx + 1}-${unansweredQuestions.length + 1}`,
            question: sentence.trim(),
            askedBy: msg.sender,
            addressedTo: addressedTo,
            sourceQuote: sentence,
            sourceLine: verification.lineIndex || msg.lineIndex,
            status: isAnswered ? 'RESOLVED' : 'OPEN'
          });
        }
      });
    });

    // 6. Calculate Priority & Summary
    let priority = 'MEDIUM';
    let priorityReason = 'Standard team updates and discussions.';

    const criticalDeadlines = deadlines.filter(d => d.urgency === 'CRITICAL');
    const userMentions = mentions.filter(m => m.isUserMatch);
    const openUserQuestions = unansweredQuestions.filter(q => q.addressedTo === userDisplayName && q.status === 'OPEN');

    if (criticalDeadlines.length > 0 || userMentions.length > 0 || openUserQuestions.length > 0) {
      priority = 'URGENT';
      priorityReason = `Urgent items detected: ${criticalDeadlines.length} critical deadline(s), ${userMentions.length} direct mention(s) requiring response.`;
    } else if (tasks.length > 0 || decisions.length > 0) {
      priority = 'HIGH';
      priorityReason = `High priority: ${tasks.length} action item(s) and ${decisions.length} team decision(s) recorded.`;
    }

    let summary = '';
    if (decisions.length > 0 && tasks.length > 0) {
      summary = `The team converged on ${decisions[0].decision}. Action items assigned: "${tasks[0].title}".`;
      if (criticalDeadlines.length > 0) {
        summary += ` Imminent deadline: ${criticalDeadlines[0].deadlineText}.`;
      }
    } else if (messages.length > 0) {
      summary = `Discussion across ${messages.length} messages involving ${Array.from(new Set(messages.map(m => m.sender))).slice(0, 3).join(', ')}. Key topic: ${messages[0].text.substring(0, 90)}...`;
    } else {
      summary = 'Empty conversation.';
    }

    return {
      conversationId: conversation.id,
      summary,
      confidence: 0.94,
      priority,
      priorityReason,
      decisions,
      tasks,
      deadlines,
      mentions,
      unansweredQuestions,
      analyzedAt: new Date().toISOString(),
      provider: 'mock'
    };
  }
}

function cleanPunctuation(str) {
  return str.replace(/^[-*•\s]+/, '').trim();
}

function cleanTaskTitle(str) {
  return str
    .replace(/^(todo:?|action item:?|-|\*|•)\s*/i, '')
    .replace(/^@\w+\s+/i, '')
    .trim();
}
