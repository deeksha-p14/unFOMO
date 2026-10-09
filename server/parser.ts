/**
 * noFOMO - Robust Message Parser
 * Parses pasted text and chat exports into normalized messages with source line numbers.
 * Treats all message text as untrusted data!
 */

import { NormalizedMessage, PlatformType } from './types.js';

export interface ParseResult {
  platform: PlatformType;
  channelOrChat: string;
  messages: NormalizedMessage[];
  totalLines: number;
}

export function parseConversationText(rawText: string, defaultPlatform: PlatformType = 'manual'): ParseResult {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Conversation text is empty.');
  }

  // Enforce size limit (2MB)
  if (Buffer.byteLength(rawText, 'utf8') > 2 * 1024 * 1024) {
    throw new Error('Import exceeds maximum size limit of 2MB.');
  }

  // Normalize line breaks
  const rawLines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const messages: NormalizedMessage[] = [];

  let detectedPlatform: PlatformType = defaultPlatform;
  let inferredChannel = 'Imported Chat';

  // Common Chat Regex Patterns
  // 1. WhatsApp: [10/09/26, 11:15:30 AM] Sender: Message OR 10/09/26, 11:15 - Sender: Message
  const waBracketPattern = /^\[?(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?\s*(?:-\s*)?([^:]+):\s*(.*)$/;
  
  // 2. Slack style: Sender [11:15 AM]: Message OR Sender 11:15: Message
  const slackPattern = /^([A-Za-z0-9_\s.()]+)\s+\[?(\d{1,2}:\d{2}\s*(?:[APap][Mm])?)\]?:\s*(.*)$/;

  // 3. Simple Colon pattern: Sender: Message
  const simpleColonPattern = /^([A-Za-z0-9_\s.()@]+):\s*(.*)$/;

  let whatsappHits = 0;
  let slackHits = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();
    const lineIndex = i + 1; // 1-based index

    if (!trimmed) continue;

    // Check WhatsApp pattern
    const waMatch = trimmed.match(waBracketPattern);
    if (waMatch) {
      whatsappHits++;
      messages.push({
        id: `msg-${messages.length + 1}`,
        sender: sanitizeString(waMatch[2].trim()),
        text: sanitizeString(waMatch[3].trim()),
        timestamp: waMatch[1].trim(),
        lineIndex: lineIndex,
        rawText: line
      });
      continue;
    }

    // Check Slack pattern
    const slackMatch = trimmed.match(slackPattern);
    if (slackMatch && !slackMatch[1].toLowerCase().includes('http')) {
      slackHits++;
      messages.push({
        id: `msg-${messages.length + 1}`,
        sender: sanitizeString(slackMatch[1].trim()),
        text: sanitizeString(slackMatch[3].trim()),
        timestamp: slackMatch[2].trim(),
        lineIndex: lineIndex,
        rawText: line
      });
      continue;
    }

    // Check Simple Colon pattern
    const colonMatch = trimmed.match(simpleColonPattern);
    if (colonMatch && colonMatch[1].length < 40 && !colonMatch[1].includes('//')) {
      messages.push({
        id: `msg-${messages.length + 1}`,
        sender: sanitizeString(colonMatch[1].trim()),
        text: sanitizeString(colonMatch[2].trim()),
        timestamp: 'Imported',
        lineIndex: lineIndex,
        rawText: line
      });
      continue;
    }

    // Multiline continuation: append to previous message if one exists
    if (messages.length > 0) {
      const prev = messages[messages.length - 1];
      prev.text += `\n${sanitizeString(trimmed)}`;
      prev.rawText += `\n${line}`;
    } else {
      // First line without colon or timestamp: treat as generic message
      messages.push({
        id: `msg-${messages.length + 1}`,
        sender: 'Participant',
        text: sanitizeString(trimmed),
        timestamp: 'Imported',
        lineIndex: lineIndex,
        rawText: line
      });
    }
  }

  // Detect platform based on matched formats
  if (whatsappHits > 1) {
    detectedPlatform = 'whatsapp';
    inferredChannel = 'WhatsApp Export';
  } else if (slackHits > 1) {
    detectedPlatform = 'slack';
    inferredChannel = '#general-slack';
  }

  if (messages.length === 0) {
    throw new Error('No valid message lines found in input.');
  }

  return {
    platform: detectedPlatform,
    channelOrChat: inferredChannel,
    messages,
    totalLines: rawLines.length
  };
}

/**
 * Sanitizes untrusted text by stripping script injections while keeping natural language
 */
function sanitizeString(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}
