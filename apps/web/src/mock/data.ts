// Types for mock data
export interface LinkItem {
  name: string;
  url: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  topLinks: LinkItem[];
  headLinks: LinkItem[];
  forbidContents: string[];
  blockedIPs: string[];
  auth?: Record<string, unknown>;
  createdAt: Date;
}

export interface Report {
  id: string;
  serviceId: string;
  content: string;
  userIp: string;
  reportedIp: string;
  threadId?: string;
  replyId?: string;
  thread?: {
    id: string;
    title: string;
  };
  reply?: {
    id: string;
    content: string;
  };
  createdAt: Date;
}

// Mock Services
export const mockServices: Record<string, Service> = {
  "demo-service": {
    id: "demo-service",
    name: "General Discussion",
    description: `Welcome to the General Discussion forum!

**Rules:**
1. Please maintain a friendly atmosphere
2. No illegal content
3. No spamming

Markdown syntax is supported`,
    ownerId: "admin-user-id",
    topLinks: [
      { name: "Home", url: "/" },
      { name: "Rules", url: "#rules" },
      { name: "Report", url: "#report" },
    ],
    headLinks: [
      { name: "GitHub", url: "https://github.com" },
      { name: "Discord", url: "https://discord.com" },
    ],
    forbidContents: ["spam", "illegal content", "advertising"],
    blockedIPs: ["192.168.1.100", "10.0.0.50"],
    auth: {
      requireAuth: false,
      allowAnonymous: true,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
  },
  "tech-forum": {
    id: "tech-forum",
    name: "Tech Forum",
    description: "Discuss programming and software development topics",
    ownerId: "admin-user-id",
    topLinks: [
      { name: "Home", url: "/" },
      { name: "General", url: "/service/demo-service" },
    ],
    headLinks: [],
    forbidContents: [],
    blockedIPs: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
  },
};

// Mock Reports
export const mockReports: Record<string, Report[]> = {
  "demo-service": [
    {
      id: "report-1",
      serviceId: "demo-service",
      content: "This post contains spam links",
      userIp: "192.168.1.50",
      reportedIp: "10.0.0.25",
      threadId: "thread-1",
      thread: {
        id: "thread-1",
        title: "Welcome to the New Forum!",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "report-2",
      serviceId: "demo-service",
      content: "Inappropriate language",
      userIp: "192.168.1.75",
      reportedIp: "10.0.0.30",
      threadId: "thread-2",
      replyId: "thread-2-reply-1",
      thread: {
        id: "thread-2",
        title: "Nice weather today",
      },
      reply: {
        id: "thread-2-reply-1",
        content: "This is an interesting idea!",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      id: "report-3",
      serviceId: "demo-service",
      content: "Off-topic discussion",
      userIp: "192.168.1.100",
      reportedIp: "10.0.0.35",
      threadId: "thread-3",
      thread: {
        id: "thread-3",
        title: "Movie Recommendation",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: "report-4",
      serviceId: "demo-service",
      content: "Suspected bot activity",
      userIp: "192.168.1.120",
      reportedIp: "10.0.0.40",
      threadId: "thread-4",
      replyId: "thread-4-reply-3",
      thread: {
        id: "thread-4",
        title: "Beginner programmer needs help",
      },
      reply: {
        id: "thread-4-reply-3",
        content: "**Key points:**\n\n1. First point\n2. Second point",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: "report-5",
      serviceId: "demo-service",
      content: "Personal attack on another user",
      userIp: "192.168.1.200",
      reportedIp: "10.0.0.55",
      threadId: "thread-5",
      thread: {
        id: "thread-5",
        title: "Weekend meetup - looking for people",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    },
  ],
  "tech-forum": [
    {
      id: "tech-report-1",
      serviceId: "tech-forum",
      content: "Misinformation about technology",
      userIp: "192.168.2.50",
      reportedIp: "10.0.1.25",
      threadId: "tech-thread-1",
      thread: {
        id: "tech-thread-1",
        title: "React 19 New Features Discussion",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    },
  ],
};

// Mock data access functions
export function getMockService(serviceId: string): Service | undefined {
  return mockServices[serviceId];
}

export function getMockReports(serviceId: string): Report[] {
  return mockReports[serviceId] || [];
}

export function deleteMockReports(reportIds: string[]): void {
  for (const serviceId of Object.keys(mockReports)) {
    mockReports[serviceId] = mockReports[serviceId].filter(
      (report) => !reportIds.includes(report.id)
    );
  }
}

export function deleteMockThreadOrReply(
  serviceId: string,
  threadId?: string,
  replyId?: string
): void {
  // Mock deletion - in real implementation this would call API
  console.log(
    `Mock: Deleting ${replyId ? "reply" : "thread"} - ${replyId || threadId} from service ${serviceId}`
  );
}

export function updateMockService(serviceId: string, data: Partial<Service>): void {
  if (mockServices[serviceId]) {
    mockServices[serviceId] = { ...mockServices[serviceId], ...data };
  }
}

export function deleteMockService(serviceId: string): void {
  delete mockServices[serviceId];
  delete mockReports[serviceId];
}
