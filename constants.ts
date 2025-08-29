

import { Conversation, Message, MessageTag, Agent, SystemHealth, Broadcast, CannedResponse, FacebookPage, SaaSUser } from './types';

// Fix: Added missing page_id and page_access_token properties to mock data to conform to the FacebookPage type.
export const MOCK_PAGES: FacebookPage[] = [
    { id: 'page_1', page_id: 'fb_page_id_1', name: 'Acme Inc. Apparel', avatarUrl: 'https://picsum.photos/seed/acme_apparel/40/40', page_access_token: 'mock-token-1' },
    { id: 'page_2', page_id: 'fb_page_id_2', name: 'Acme Inc. Home Goods', avatarUrl: 'https://picsum.photos/seed/acme_home/40/40', page_access_token: 'mock-token-2' },
    { id: 'page_3', page_id: 'fb_page_id_3', name: 'Starlight Cafe', avatarUrl: 'https://picsum.photos/seed/starlight/40/40', page_access_token: 'mock-token-3' },
];

export const MOCK_AGENTS: Agent[] = [
    { id: 'agent_1', name: 'Dan Abramov', avatarUrl: 'https://picsum.photos/seed/dan/40/40' },
    { id: 'agent_2', name: 'Sarah Drasner', avatarUrl: 'https://picsum.photos/seed/sarah/40/40' },
    { id: 'agent_3', name: 'Kent C. Dodds', avatarUrl: 'https://picsum.photos/seed/kent/40/40' },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    pageId: 'page_1',
    userProfile: {
// Fix: Added missing 'id' and 'psid' properties to conform to the UserProfile type.
      id: 'up_1',
      psid: 'psid_alice',
      name: 'Alice Johnson',
      avatarUrl: 'https://picsum.photos/seed/alice/100/100',
      email: 'alice.j@example.com',
      joinedAt: '2023-05-12T10:00:00Z',
    },
    lastMessage: "Thanks for the update! I'll check it out.",
    lastMessageAt: new Date().toISOString(),
    unreadCount: 2,
    labels: ['VIP', 'Interested'],
    assignedAgentId: 'agent_1',
  },
  {
    id: 'conv_2',
    pageId: 'page_1',
    userProfile: {
// Fix: Added missing 'id' and 'psid' properties to conform to the UserProfile type.
      id: 'up_2',
      psid: 'psid_bob',
      name: 'Bob Williams',
      avatarUrl: 'https://picsum.photos/seed/bob/100/100',
      email: 'bob.w@example.com',
      joinedAt: '2023-08-20T14:30:00Z',
    },
    lastMessage: 'Can you resend the invoice?',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    unreadCount: 0,
    labels: ['Billing'],
    assignedAgentId: null,
  },
  {
    id: 'conv_3',
    pageId: 'page_2',
    userProfile: {
// Fix: Added missing 'id' and 'psid' properties to conform to the UserProfile type.
      id: 'up_3',
      psid: 'psid_charlie',
      name: 'Charlie Brown',
      avatarUrl: 'https://picsum.photos/seed/charlie/100/100',
      email: 'charlie.b@example.com',
      joinedAt: '2023-01-05T09:00:00Z',
    },
    lastMessage: 'What are your hours on Saturday?',
    lastMessageAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago (outside 24h window)
    unreadCount: 1,
    labels: ['Support'],
    assignedAgentId: 'agent_2',
  },
   {
    id: 'conv_4',
    pageId: 'page_2',
    userProfile: {
// Fix: Added missing 'id' and 'psid' properties to conform to the UserProfile type.
      id: 'up_4',
      psid: 'psid_diana',
      name: 'Diana Prince',
      avatarUrl: 'https://picsum.photos/seed/diana/100/100',
      email: 'diana.p@example.com',
      joinedAt: '2022-11-18T18:45:00Z',
    },
    lastMessage: 'This is amazing! Thank you!',
    lastMessageAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    unreadCount: 0,
    labels: [],
    assignedAgentId: null,
  },
   {
    id: 'conv_5',
    pageId: 'page_3',
    userProfile: {
// Fix: Added missing 'id' and 'psid' properties to conform to the UserProfile type.
      id: 'up_5',
      psid: 'psid_ethan',
      name: 'Ethan Hunt',
      avatarUrl: 'https://picsum.photos/seed/ethan/100/100',
      email: 'ethan.h@example.com',
      joinedAt: '2023-10-01T11:00:00Z',
    },
    lastMessage: 'Do you take reservations for tonight?',
    lastMessageAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    unreadCount: 1,
    labels: ['New Customer'],
    assignedAgentId: null,
  },
];

export const MOCK_MESSAGES: { [conversationId: string]: Message[] } = {
  'conv_1': [
    { id: 'msg_1_1', conversationId: 'conv_1', direction: 'in', text: 'Hey, I had a question about my recent order.', attachments: [], tag: null, windowState: 'inside24h', status: 'read', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: 'msg_1_2', conversationId: 'conv_1', direction: 'out', text: 'Hi Alice! Of course, what is your order number?', attachments: [], tag: null, windowState: 'inside24h', status: 'delivered', createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), sentAt: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
    { id: 'msg_1_3', conversationId: 'conv_1', direction: 'in', text: 'It is #12345.', attachments: [], tag: null, windowState: 'inside24h', status: 'read', createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), sentAt: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
    { id: 'msg_1_4', conversationId: 'conv_1', direction: 'in', text: "Thanks for the update! I'll check it out.", attachments: [], tag: null, windowState: 'inside24h', status: 'read', createdAt: new Date().toISOString(), sentAt: new Date().toISOString() },
  ],
  'conv_2': [
    { id: 'msg_2_1', conversationId: 'conv_2', direction: 'in', text: 'Can you resend the invoice?', attachments: [], tag: null, windowState: 'inside24h', status: 'read', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  ],
  'conv_3': [
    { id: 'msg_3_1', conversationId: 'conv_3', direction: 'in', text: 'What are your hours on Saturday?', attachments: [], tag: null, windowState: 'outside24h', status: 'read', createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), sentAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
  ],
   'conv_4': [
    { id: 'msg_4_1', conversationId: 'conv_4', direction: 'in', text: 'This is amazing! Thank you!', attachments: [], tag: null, windowState: 'outside24h', status: 'read', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  'conv_5': [
    { id: 'msg_5_1', conversationId: 'conv_5', direction: 'in', text: 'Do you take reservations for tonight?', attachments: [], tag: null, windowState: 'inside24h', status: 'read', createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), sentAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  ],
};

export const AVAILABLE_TAGS = [
    MessageTag.ACCOUNT_UPDATE,
    MessageTag.POST_PURCHASE_UPDATE,
    MessageTag.CONFIRMED_EVENT_UPDATE,
    MessageTag.HUMAN_AGENT
];

export const MOCK_HEALTH_STATUS: SystemHealth = {
    facebookApi: 'operational',
    webhooks: 'operational',
    messageQueue: 'degraded',
    database: 'operational'
};

export const MOCK_BROADCASTS: Broadcast[] = [
    { id: 'bc_7a1b', pageId: 'page_1', userId: 'user_001', campaignName: 'Summer Sale Announcement', audience: 'All Users', status: 'Sent', progress: 100, message: 'Hey {{first_name}}! Our big summer sale is on! Get 20% off everything.', tag: MessageTag.POST_PURCHASE_UPDATE, totalRecipients: 4821, sentCount: 4821, scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), timeSpent: '5m 12s', isTemplate: false },
    { id: 'bc_8c2d', pageId: 'page_1', userId: 'user_001', campaignName: 'New Arrivals Alert', audience: 'VIP Label', status: 'Scheduled', progress: 0, message: 'VIP exclusive: New arrivals just dropped. Be the first to see them!', tag: MessageTag.ACCOUNT_UPDATE, totalRecipients: 550, sentCount: 0, scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), timeSpent: null, isTemplate: false },
    { id: 'bc_9d3e', pageId: 'page_2', userId: 'user_001', campaignName: 'Holiday Hours Update', audience: 'All Users', status: 'Sent', progress: 100, message: 'Just a heads up, we have special hours for the upcoming holiday weekend.', tag: MessageTag.CONFIRMED_EVENT_UPDATE, totalRecipients: 12045, sentCount: 12045, scheduledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), timeSpent: '15m 3s', isTemplate: false },
    // Fix: Changed scheduledAt from an empty string to null to conform to the updated `Broadcast` type.
    { id: 'bc_1f4g', pageId: 'page_1', userId: 'user_001', campaignName: 'Q3 Newsletter', audience: 'All Users', status: 'Draft', progress: 0, message: 'Our quarterly newsletter is here with exciting updates!', tag: null, totalRecipients: 0, sentCount: 0, scheduledAt: null, timeSpent: null, isTemplate: false },
    { id: 'bc_2g5h', pageId: 'page_3', userId: 'user_002', campaignName: 'Weekend Special', audience: 'Active Users', status: 'In Progress', progress: 65, message: 'Come by this weekend for our new espresso special!', tag: null, totalRecipients: 850, sentCount: 552, scheduledAt: new Date().toISOString(), timeSpent: '3m 22s', isTemplate: false },
    { id: 'bc_3h6i', pageId: 'page_1', userId: 'user_001', campaignName: 'Flash Sale Reminder', audience: 'VIP Label', status: 'Cancelled', progress: 0, message: 'Last chance for the flash sale!', tag: MessageTag.POST_PURCHASE_UPDATE, totalRecipients: 550, sentCount: 0, scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), timeSpent: null, isTemplate: false },
];

export const MOCK_CANNED_RESPONSES: CannedResponse[] = [
    { id: 'cr_1', title: 'Shipping Info', text: 'Our standard shipping takes 3-5 business days. You can find more details on our shipping policy here: [link]' },
    { id: 'cr_2', title: 'Return Policy', text: 'We offer a 30-day return policy on all unworn items. Please visit our returns portal to start a return: [link]' },
    { id: 'cr_3', title: 'Opening Hours', text: 'We are open from 9 AM to 5 PM, Monday to Friday. We are closed on weekends and public holidays.' },
];

export const MOCK_SAAS_USERS: SaaSUser[] = [
    {
        id: 'user_001',
        name: 'Admin User',
        email: 'admin@admin.com',
        avatarUrl: 'https://picsum.photos/seed/elena/100/100',
        plan: 'Growth',
        messageUsage: 1250600,
        messageQuota: 2000000,
        connectedPagesCount: 2,
        connectedPages: [
            { id: 'page_1', name: 'Acme Inc. Apparel', avatarUrl: 'https://picsum.photos/seed/acme_apparel/40/40', followers: 12580 },
            { id: 'page_2', name: 'Acme Inc. Home Goods', avatarUrl: 'https://picsum.photos/seed/acme_home/40/40', followers: 7650 },
        ],
        status: 'Active',
        joinedDate: '2022-08-15T10:00:00Z',
        lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'user_002',
        name: 'John "Sully" Sullivan',
        email: 'sully@starlight.com',
        avatarUrl: 'https://picsum.photos/seed/sully/100/100',
        plan: 'Starter',
        messageUsage: 780000,
        messageQuota: 800000,
        connectedPagesCount: 1,
        connectedPages: [
            { id: 'page_3', name: 'Starlight Cafe', avatarUrl: 'https://picsum.photos/seed/starlight/40/40', followers: 2345 },
        ],
        status: 'Active',
        joinedDate: '2023-01-20T14:30:00Z',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'user_003',
        name: 'Marcus Holloway',
        email: 'dedsec.main@ctos.net',
        avatarUrl: 'https://picsum.photos/seed/marcus/100/100',
        plan: 'Scale',
        messageUsage: 5800000,
        messageQuota: 7000000,
        connectedPagesCount: 5,
        connectedPages: [], // Example with no pages for now
        status: 'Suspended',
        joinedDate: '2021-05-10T09:00:00Z',
        lastActive: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'user_004',
        name: 'Anya Forger',
        email: 'anya.spy@family.com',
        avatarUrl: 'https://picsum.photos/seed/anya/100/100',
        plan: 'Free',
        messageUsage: 950,
        messageQuota: 1000,
        connectedPagesCount: 1,
        connectedPages: [],
        status: 'Trial',
        joinedDate: '2023-11-01T18:45:00Z',
        lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
];