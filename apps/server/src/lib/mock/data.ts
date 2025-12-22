import type { Service, Thread, Reply, ThreadWithReplies } from '../types';

export const mockServices: Service[] = [
  {
    id: '66a6eca2bfccee3f04a52bc4',
    name: 'General Discussion',
    description: 'A place to discuss anything and everything. Be respectful and follow the rules.\n\n**Rules:**\n- No spam\n- Be respectful\n- No NSFW content',
    topLinks: [
      { name: 'Rules', url: '/rules' },
      { name: 'FAQ', url: '/faq' },
    ],
    headLinks: [
      { name: 'Discord', url: 'https://discord.gg/example' },
      { name: 'Twitter', url: 'https://twitter.com/example' },
    ],
    forbidContents: [],
    blockedIPs: [],
    visible: true,
    auth: null,
    ownerId: 'admin_user_123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '77b7fdb3cgddff4g05b63cd5',
    name: 'Technology',
    description: 'Discuss the latest tech news, programming, and gadgets.',
    topLinks: [],
    headLinks: [
      { name: 'GitHub', url: 'https://github.com' },
    ],
    forbidContents: [],
    blockedIPs: [],
    visible: true,
    auth: null,
    ownerId: 'admin_user_456',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

export const mockReplies: Reply[] = [
  {
    id: 'rec_reply_001',
    name: 'User A',
    content: 'This is a great thread! Thanks for sharing.',
    imageToken: null,
    youtubeID: null,
    sage: false,
    threadId: 'rec_d4utebsgmio87vvfiqig',
    userId: 'user_abc123',
    userIp: '192.168.1.1',
    createdAt: new Date('2024-03-15T10:30:00'),
    updatedAt: new Date('2024-03-15T10:30:00'),
  },
  {
    id: 'rec_reply_002',
    name: 'Anonymous',
    content: 'I have a different opinion on this matter.\n\n> Original post was interesting\n\nBut I think we should consider other perspectives.',
    imageToken: null,
    youtubeID: null,
    sage: false,
    threadId: 'rec_d4utebsgmio87vvfiqig',
    userId: 'user_def456',
    userIp: '192.168.1.2',
    createdAt: new Date('2024-03-15T11:00:00'),
    updatedAt: new Date('2024-03-15T11:00:00'),
  },
  {
    id: 'rec_reply_003',
    name: 'TechEnthusiast',
    content: '>> rec_reply_001\nAgreed! This is really helpful.',
    imageToken: null,
    youtubeID: null,
    sage: false,
    threadId: 'rec_d4utebsgmio87vvfiqig',
    userId: 'user_ghi789',
    userIp: '192.168.1.3',
    createdAt: new Date('2024-03-15T12:00:00'),
    updatedAt: new Date('2024-03-15T12:00:00'),
  },
  {
    id: 'rec_reply_004',
    name: 'VideoFan',
    content: 'Check out this related video!',
    imageToken: null,
    youtubeID: 'dQw4w9WgXcQ',
    sage: false,
    threadId: 'rec_d4utebsgmio87vvfiqig',
    userId: 'user_jkl012',
    userIp: '192.168.1.4',
    createdAt: new Date('2024-03-15T13:00:00'),
    updatedAt: new Date('2024-03-15T13:00:00'),
  },
  {
    id: 'rec_reply_005',
    name: 'ImagePoster',
    content: 'Here is an example image for reference.',
    imageToken: 'sample_image_token',
    youtubeID: null,
    sage: false,
    threadId: 'rec_d4utebsgmio87vvfiqig',
    userId: 'user_mno345',
    userIp: '192.168.1.5',
    createdAt: new Date('2024-03-15T14:00:00'),
    updatedAt: new Date('2024-03-15T14:00:00'),
  },
  {
    id: 'rec_reply_006',
    name: 'Sage User',
    content: 'This is a sage reply (will not bump the thread).',
    imageToken: null,
    youtubeID: null,
    sage: true,
    threadId: 'rec_d4utebsgmio87vvfiqig',
    userId: 'user_pqr678',
    userIp: '192.168.1.6',
    createdAt: new Date('2024-03-15T15:00:00'),
    updatedAt: new Date('2024-03-15T15:00:00'),
  },
  {
    id: 'rec_reply_007',
    name: 'admin',
    content: 'Official announcement: Please follow the rules!',
    imageToken: null,
    youtubeID: null,
    sage: false,
    threadId: 'rec_thread_002',
    userId: 'admin',
    userIp: '127.0.0.1',
    createdAt: new Date('2024-03-16T09:00:00'),
    updatedAt: new Date('2024-03-16T09:00:00'),
  },
];

export const mockThreads: Thread[] = [
  {
    id: 'rec_d4utebsgmio87vvfiqig',
    title: 'Welcome to the forum!',
    name: 'Administrator',
    content: '# Welcome!\n\nThis is the first thread in our new forum. Feel free to discuss anything here.\n\n**Rules:**\n1. Be respectful\n2. No spam\n3. Have fun!',
    imageToken: null,
    youtubeID: null,
    replyAt: new Date('2024-03-15T15:00:00'),
    serviceId: '66a6eca2bfccee3f04a52bc4',
    userId: 'admin',
    userIp: '127.0.0.1',
    createdAt: new Date('2024-03-10T09:00:00'),
    updatedAt: new Date('2024-03-15T15:00:00'),
  },
  {
    id: 'rec_thread_002',
    title: 'How to use this forum?',
    name: 'NewUser',
    content: 'Hello everyone!\n\nI am new here and would like to know how to use this forum effectively.\n\nCan someone explain the features?',
    imageToken: null,
    youtubeID: null,
    replyAt: new Date('2024-03-16T09:00:00'),
    serviceId: '66a6eca2bfccee3f04a52bc4',
    userId: 'user_new001',
    userIp: '192.168.2.1',
    createdAt: new Date('2024-03-12T14:00:00'),
    updatedAt: new Date('2024-03-16T09:00:00'),
  },
  {
    id: 'rec_thread_003',
    title: 'Check out this cool video',
    name: 'VideoLover',
    content: 'Found this amazing video about programming. What do you all think?',
    imageToken: null,
    youtubeID: 'dQw4w9WgXcQ',
    replyAt: new Date('2024-03-14T16:00:00'),
    serviceId: '66a6eca2bfccee3f04a52bc4',
    userId: 'user_video01',
    userIp: '192.168.3.1',
    createdAt: new Date('2024-03-14T16:00:00'),
    updatedAt: new Date('2024-03-14T16:00:00'),
  },
  {
    id: 'rec_thread_004',
    title: 'Image sharing thread',
    name: 'Photographer',
    content: 'Share your favorite images here!\n\nHere is mine:',
    imageToken: 'sample_thread_image',
    youtubeID: null,
    replyAt: new Date('2024-03-13T10:00:00'),
    serviceId: '66a6eca2bfccee3f04a52bc4',
    userId: 'user_photo01',
    userIp: '192.168.4.1',
    createdAt: new Date('2024-03-13T10:00:00'),
    updatedAt: new Date('2024-03-13T10:00:00'),
  },
  {
    id: 'rec_thread_005',
    title: 'Discussion about latest tech',
    name: 'TechGuru',
    content: 'What do you think about the latest developments in AI and machine learning?\n\n## Topics to discuss:\n- LLMs\n- Computer Vision\n- Robotics',
    imageToken: null,
    youtubeID: null,
    replyAt: new Date('2024-03-11T08:00:00'),
    serviceId: '77b7fdb3cgddff4g05b63cd5',
    userId: 'user_tech01',
    userIp: '192.168.5.1',
    createdAt: new Date('2024-03-11T08:00:00'),
    updatedAt: new Date('2024-03-11T08:00:00'),
  },
];

export function getService(serviceId: string): Service | null {
  return mockServices.find((s) => s.id === serviceId) || null;
}

export function getThreads(
  serviceId: string,
  page: number = 1,
  pageSize: number = 10
): { threads: ThreadWithReplies[]; totalPages: number } {
  const serviceThreads = mockThreads
    .filter((t) => t.serviceId === serviceId)
    .sort((a, b) => b.replyAt.getTime() - a.replyAt.getTime());

  const totalPages = Math.ceil(serviceThreads.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedThreads = serviceThreads.slice(startIndex, startIndex + pageSize);

  const threadsWithReplies: ThreadWithReplies[] = paginatedThreads.map((thread) => ({
    ...thread,
    replies: mockReplies.filter((r) => r.threadId === thread.id).slice(-5),
  }));

  return { threads: threadsWithReplies, totalPages };
}

export function getThread(serviceId: string, threadId: string): ThreadWithReplies | null {
  const thread = mockThreads.find((t) => t.id === threadId && t.serviceId === serviceId);
  if (!thread) return null;

  return {
    ...thread,
    replies: mockReplies
      .filter((r) => r.threadId === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
  };
}
