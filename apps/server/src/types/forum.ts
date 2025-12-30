// 論壇相關類型定義

export interface LinkItem {
  name: string;
  url: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  topLinks?: LinkItem[];
  headLinks?: LinkItem[];
  forbidContents?: string[];
  blockedIPs?: string[];
}

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
  serviceId: string;
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
}

export interface Report {
  id: string;
  serviceId: string;
  threadId?: string;
  replyId?: string;
  content: string;
  userIp?: string;
  reportedIp?: string;
  createdAt: Date;
}
