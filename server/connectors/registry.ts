/**
 * noFOMO - Connector Architecture & Registry
 * Truthful, honest connector states. Never fakes OAuth or data access.
 */

import { ConnectorInfo, PlatformType } from '../types.js';

export const CONNECTORS_REGISTRY: Record<PlatformType, ConnectorInfo> = {
  gmail: {
    id: 'gmail',
    name: 'Google Gmail',
    category: 'Email & Communications',
    description: 'Official Google OAuth integration with minimum read-only scopes.',
    status: process.env.GMAIL_CLIENT_ID ? 'CONFIGURED' : 'SETUP_REQUIRED',
    capabilities: ['Read unread email threads', 'Extract sender and dates', 'Draft replies (with user approval)'],
    permissions: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.compose'],
    lastSync: null,
    errorMessage: process.env.GMAIL_CLIENT_ID ? null : 'Google Cloud OAuth credentials not configured in environment.',
    docsUrl: 'https://developers.google.com/gmail/api',
    setupInstructions: 'Create a Project in Google Cloud Console, enable Gmail API, configure OAuth Consent Screen, and set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env.'
  },
  discord: {
    id: 'discord',
    name: 'Discord Bot & Gateway',
    category: 'Community & Gaming',
    description: 'Official Discord Bot API reading designated server channels where bot is installed.',
    status: process.env.DISCORD_BOT_TOKEN ? 'CONFIGURED' : 'SETUP_REQUIRED',
    capabilities: ['Read public channels bot is invited to', 'Extract user mentions and timestamps', 'Direct Messages are restricted by Discord privacy policies'],
    permissions: ['View Channels', 'Read Message History', 'Send Messages (for approved replies)'],
    lastSync: null,
    errorMessage: process.env.DISCORD_BOT_TOKEN ? null : 'Discord Bot Token missing in environment.',
    docsUrl: 'https://discord.com/developers/docs/intro',
    setupInstructions: 'Create an Application in Discord Developer Portal, add a Bot with "Message Content Intent", invite the bot to your server, and set DISCORD_BOT_TOKEN.'
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp (Manual Export & Business API)',
    category: 'Messaging & Groups',
    description: 'Distinguishes user-provided chat export (.txt) from Meta WhatsApp Business Platform.',
    status: 'MANUAL_IMPORT_AVAILABLE',
    capabilities: ['Instant .txt Chat Export Parser', 'Zero cloud storage (pure device isolation)', 'Business Cloud API requires registered business phone number'],
    permissions: ['Local file read only', 'whatsapp_business_messaging (only for verified Meta Business App)'],
    lastSync: null,
    errorMessage: null,
    docsUrl: 'https://developers.facebook.com/docs/whatsapp',
    setupInstructions: 'For personal WhatsApp: open any chat > More > Export Chat > Without Media, and use our Paste/File Import. Consumer WhatsApp has no open user API. WhatsApp Business Platform requires a Meta Developer Business Account.'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram Direct Messages',
    category: 'Social Media',
    description: 'Meta Graph API for eligible Professional/Creator accounts.',
    status: 'COMING_SOON',
    capabilities: ['Professional Account Messaging (Restricted by Meta to business/creator accounts linked to FB Page)', 'Personal user accounts cannot be accessed via API'],
    permissions: ['instagram_basic', 'instagram_manage_messages'],
    lastSync: null,
    errorMessage: 'Personal Instagram inboxes are not accessible via API. Meta restricts messaging to verified Creator/Business pages.',
    docsUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api',
    setupInstructions: 'Coming soon for verified Creator accounts. In accordance with Meta Platform Terms, scraping personal DMs is strictly prohibited.'
  },
  slack: {
    id: 'slack',
    name: 'Slack Workplace',
    category: 'Workplace Team Chat',
    description: 'Official Slack App integration using OAuth v2 bots and user tokens.',
    status: process.env.SLACK_CLIENT_ID ? 'CONFIGURED' : 'SETUP_REQUIRED',
    capabilities: ['Read joined public & private channels', 'Direct mention catch-up', 'Draft thread replies'],
    permissions: ['channels:history', 'groups:history', 'im:history', 'users:read', 'chat:write'],
    lastSync: null,
    errorMessage: process.env.SLACK_CLIENT_ID ? null : 'Slack App credentials not set in .env.',
    docsUrl: 'https://api.slack.com/start',
    setupInstructions: 'Create a Slack App at api.slack.com, add User & Bot Scopes, install to workspace, and configure SLACK_CLIENT_ID and SLACK_CLIENT_SECRET.'
  },
  teams: {
    id: 'teams',
    name: 'Microsoft Outlook & Teams',
    category: 'Enterprise Office Suite',
    description: 'Microsoft Graph API with delegated least-privilege permissions.',
    status: process.env.MICROSOFT_CLIENT_ID ? 'CONFIGURED' : 'SETUP_REQUIRED',
    capabilities: ['Read Outlook email messages', 'Read Microsoft Teams chat threads', 'Draft reply messages'],
    permissions: ['Mail.Read', 'Chat.Read', 'User.Read', 'Mail.Send (only upon approval)'],
    lastSync: null,
    errorMessage: process.env.MICROSOFT_CLIENT_ID ? null : 'Azure App Registration Client ID not configured.',
    docsUrl: 'https://learn.microsoft.com/en-us/graph/overview',
    setupInstructions: 'Register an App in Azure Portal (App Registrations), grant Microsoft Graph Delegated permissions (Mail.Read, Chat.Read), and add credentials to .env.'
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram Bot API',
    category: 'Encrypted & Group Messaging',
    description: 'Telegram Bot API integration with privacy mode controls.',
    status: process.env.TELEGRAM_BOT_TOKEN ? 'CONFIGURED' : 'SETUP_REQUIRED',
    capabilities: ['Read messages in groups where bot is admin or privacy mode disabled', 'Direct mention alerts', 'Send approved notifications'],
    permissions: ['Bot Privacy Mode: Disabled or Admin in Group'],
    lastSync: null,
    errorMessage: process.env.TELEGRAM_BOT_TOKEN ? null : 'Telegram Bot Token not configured in environment.',
    docsUrl: 'https://core.telegram.org/bots/api',
    setupInstructions: 'Talk to @BotFather on Telegram, create a new bot, disable privacy mode in group settings if needed, and paste TELEGRAM_BOT_TOKEN in .env.'
  },
  calendar: {
    id: 'calendar',
    name: 'Google Calendar',
    category: 'Productivity & Scheduling',
    description: 'Google Calendar API for creating approved events from extracted deadlines.',
    status: process.env.GMAIL_CLIENT_ID ? 'CONFIGURED' : 'SETUP_REQUIRED',
    capabilities: ['Create events from approved action items', 'Check conflicting schedules'],
    permissions: ['https://www.googleapis.com/auth/calendar.events'],
    lastSync: null,
    errorMessage: process.env.GMAIL_CLIENT_ID ? null : 'Google Calendar OAuth credentials not configured in environment.',
    docsUrl: 'https://developers.google.com/calendar',
    setupInstructions: 'Enable Google Calendar API in your Google Cloud Project alongside Gmail API.'
  },
  manual: {
    id: 'manual',
    name: 'Manual Text & File Import',
    category: 'Universal / Privacy First',
    description: 'Paste text or upload .txt exports. 100% on-device or sandboxed processing.',
    status: 'CONFIGURED',
    capabilities: ['Paste raw chat or email transcripts', 'Upload exported .txt files', 'Automatic source line referencing and validation'],
    permissions: ['Local memory only'],
    lastSync: 'Always Available',
    errorMessage: null,
    docsUrl: '#',
    setupInstructions: 'Available immediately without API keys or OAuth setup.'
  }
};
