/**
 * noFOMO - AI Provider Interface & Verification Utilities
 */

import { ImportedConversation, NormalizedMessage, StructuredAnalysis } from '../types.js';

export interface AIProvider {
  name: 'mock' | 'gemini' | 'custom';
  analyze(conversation: ImportedConversation, userDisplayName: string): Promise<StructuredAnalysis>;
}

/**
 * Strictly verifies whether an extracted source quote exists in the conversation messages.
 * Returns verified boolean and the matching 1-based line number.
 */
export function verifySourceEvidence(
  quote: string,
  messages: NormalizedMessage[]
): { verified: boolean; lineIndex: number } {
  if (!quote || quote.trim().length === 0) {
    return { verified: false, lineIndex: 1 };
  }

  const cleanQuote = quote.trim().toLowerCase();

  // 1. Direct exact or substring match in any message text
  for (const msg of messages) {
    const cleanMsg = msg.text.toLowerCase();
    if (cleanMsg.includes(cleanQuote) || cleanQuote.includes(cleanMsg)) {
      return { verified: true, lineIndex: msg.lineIndex };
    }
  }

  // 2. Token overlap match (at least 80% word tokens matched in a single message)
  const quoteTokens = cleanQuote.split(/\s+/).filter(w => w.length > 2);
  if (quoteTokens.length > 0) {
    for (const msg of messages) {
      const msgTokens = new Set(msg.text.toLowerCase().split(/\s+/));
      const matchedTokens = quoteTokens.filter(t => msgTokens.has(t));
      if (matchedTokens.length / quoteTokens.length >= 0.75) {
        return { verified: true, lineIndex: msg.lineIndex };
      }
    }
  }

  return { verified: false, lineIndex: 1 };
}
