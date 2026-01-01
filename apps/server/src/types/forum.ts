// 論壇相關類型定義

export interface LinkItem {
  name: string;
  url: string;
}

// Organization metadata for forum-specific settings
export interface OrganizationMetadata {
  description?: string;
  topLinks?: LinkItem[];
  headLinks?: LinkItem[];
  forbidContents?: string[];
  blockedIPs?: string[];
  auth?: Record<string, string>;
  visible?: boolean;
}

// Organization (replaces Service)
export interface Organization {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  metadata?: OrganizationMetadata;
  showOnHome?: boolean;
  createdAt: Date;
}

// Alias for backward compatibility
export type Service = Organization;

export interface Reply {
  id: string;
  threadId: string;
  name: string;
  content: string;
  userId?: string;
  userIp?: string;
  imageToken?: string;
  image?: string;
  youtubeID?: string;
  sage?: boolean;
  createdAt: Date;
}

export interface Thread {
  id: string;
  organizationId: string;
  title: string;
  name: string;
  content: string;
  userId?: string;
  userIp?: string;
  imageToken?: string;
  image?: string;
  youtubeID?: string;
  replyAt: Date;
  createdAt: Date;
}

export interface ThreadWithReplies extends Thread {
  replies: Reply[];
  replyCount?: number;
}

export interface Report {
  id: string;
  organizationId: string;
  threadId?: string;
  replyId?: string;
  content: string;
  userIp?: string;
  reportedIp?: string;
  createdAt: Date;
}
