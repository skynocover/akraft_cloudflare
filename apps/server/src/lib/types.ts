export interface LinkItem {
  name: string;
  url: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  topLinks: LinkItem[];
  headLinks: LinkItem[];
  forbidContents: string[];
  blockedIPs: string[];
  visible: boolean;
  auth: Record<string, unknown> | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reply {
  id: string;
  name: string;
  content: string;
  imageToken: string | null;
  youtubeID: string | null;
  sage: boolean;
  threadId: string;
  userId: string;
  userIp: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Thread {
  id: string;
  title: string;
  name: string;
  content: string;
  imageToken: string | null;
  youtubeID: string | null;
  replyAt: Date;
  serviceId: string;
  userId: string;
  userIp: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThreadWithReplies extends Thread {
  replies: Reply[];
}

export interface Report {
  id: string;
  content: string;
  threadId: string | null;
  replyId: string | null;
  userIp: string;
  reportedIp: string;
  createdAt: Date;
}
