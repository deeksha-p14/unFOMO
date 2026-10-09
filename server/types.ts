/**
 * noFOMO - Core Data Models and Types
 */

export type PlatformType =
  | 'slack'
  | 'whatsapp'
  | 'discord'
  | 'gmail'
  | 'instagram'
  | 'teams'
  | 'telegram'
  | 'calendar'
  | 'manual';

export type PriorityLevel = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface NormalizedMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  lineIndex: number; // 1-based source line in original transcript
  rawText: string;
}

export interface ImportedConversation {
  id: string;
  title: string;
  platform: PlatformType;
  channelOrChat: string;
  rawText: string;
  messages: NormalizedMessage[];
  importedAt: string;
  isDemo?: boolean;
  analysis?: StructuredAnalysis;
}

export interface DecisionItem {
  id: string;
  decision: string;
  consensus: string;
  sourceQuote: string;
  sourceLine: number;
  confidence: number;
  verified: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  assignee: string | null;
  deadline: string | null;
  isExplicitDeadline: boolean;
  sourceQuote: string;
  sourceLine: number;
  completed: boolean;
  confidence: number;
  verified: boolean;
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadlineText: string;
  deadlineDate: string | null; // ISO format or null if inferred/unknown
  isExplicit: boolean;
  urgency: 'CRITICAL' | 'NEAR_TERM' | 'UPCOMING';
  sourceQuote: string;
  sourceLine: number;
  verified: boolean;
}

export interface DirectMentionItem {
  id: string;
  targetMention: string;
  sender: string;
  quote: string;
  sourceLine: number;
  isUserMatch: boolean;
}

export interface UnansweredQuestionItem {
  id: string;
  question: string;
  askedBy: string;
  addressedTo: string | null;
  sourceQuote: string;
  sourceLine: number;
  status: 'OPEN' | 'RESOLVED';
}

export interface StructuredAnalysis {
  conversationId: string;
  summary: string;
  confidence: number;
  priority: PriorityLevel;
  priorityReason: string;
  decisions: DecisionItem[];
  tasks: TaskItem[];
  deadlines: DeadlineItem[];
  mentions: DirectMentionItem[];
  unansweredQuestions: UnansweredQuestionItem[];
  analyzedAt: string;
  provider: 'mock' | 'gemini' | 'custom';
}

export type ActionType = 'CREATE_TASK' | 'SCHEDULE_CALENDAR_EVENT' | 'DRAFT_REPLY';
export type ActionStatus = 'PENDING' | 'APPROVED' | 'DISMISSED' | 'EXECUTED' | 'FAILED';

export interface ProposedAction {
  id: string;
  conversationId: string;
  type: ActionType;
  title: string;
  details: string;
  destination: string;
  requiredPermissions: string[];
  sourceQuote: string;
  sourceLine: number;
  status: ActionStatus;
  createdAt: string;
  reviewedAt?: string;
  executionResult?: string;
  idempotencyKey: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: 'IMPORT' | 'ANALYZE' | 'ACTION_APPROVED' | 'ACTION_DISMISSED' | 'ACTION_EXECUTED' | 'CONNECTOR_STATUS' | 'DATA_WIPED';
  title: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export type ConnectorStatus =
  | 'CONFIGURED'
  | 'SETUP_REQUIRED'
  | 'MANUAL_IMPORT_AVAILABLE'
  | 'COMING_SOON'
  | 'ERROR';

export interface ConnectorInfo {
  id: PlatformType;
  name: string;
  category: string;
  description: string;
  status: ConnectorStatus;
  capabilities: string[];
  permissions: string[];
  lastSync: string | null;
  errorMessage: string | null;
  docsUrl: string;
  setupInstructions: string;
}
