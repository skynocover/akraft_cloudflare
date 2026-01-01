import type { Service, ThreadWithReplies, Reply } from "../types/forum";

// Mock Service data
export const mockServices: Record<string, Service> = {
  "demo-service": {
    id: "demo-service",
    name: "General Discussion",
    createdAt: new Date(),
    metadata: {
      topLinks: [
        { name: "Home", url: "/" },
        { name: "Rules", url: "#rules" },
        { name: "Report", url: "#report" },
      ],
      headLinks: [
        { name: "GitHub", url: "https://github.com" },
        { name: "Discord", url: "https://discord.com" },
      ],
    },
  },
  "tech-forum": {
    id: "tech-forum",
    name: "Tech Forum",
    createdAt: new Date(),
    metadata: {
      topLinks: [
        { name: "Home", url: "/" },
        { name: "General", url: "/service/demo-service" },
      ],
      headLinks: [],
    },
  },
};

// Mock reply data
const createMockReplies = (threadId: string, count: number): Reply[] => {
  const replies: Reply[] = [];
  for (let i = 1; i <= count; i++) {
    replies.push({
      id: `${threadId}-reply-${i}`,
      threadId,
      name: i % 3 === 0 ? "Anonymous" : `User${String.fromCharCode(64 + (i % 26))}`,
      content: getMockReplyContent(i),
      userId: `user-${i}`,
      createdAt: new Date(Date.now() - (count - i) * 1000 * 60 * 30),
    });
  }
  return replies;
};

const getMockReplyContent = (index: number): string => {
  const contents = [
    "This is an interesting idea!",
    "I had a similar experience. Let me share.\n\nI encountered the same problem before, and found the solution was quite simple.",
    "**Key points:**\n\n1. First point\n2. Second point\n3. Third point",
    "Upvoted! Looking forward to updates!",
    "> Quoting the above\n\nCompletely agree with this view.",
    "Can you provide more details?",
    "Thanks for sharing! Learned a lot.",
    "I've researched this before, you might want to try this approach...",
    "Great post! Very informative.",
    "Has anyone tried this method? Would love to hear feedback.",
  ];
  return contents[(index - 1) % contents.length] ?? "Reply content";
};

// Generate additional mock threads for pagination testing
const generateMockThreads = (serviceId: string, count: number): ThreadWithReplies[] => {
  const topics = [
    { title: "What's your favorite programming language?", content: "I'm curious about what languages everyone prefers.\n\nPersonally, I love TypeScript for its type safety and developer experience." },
    { title: "Tips for staying productive while working from home", content: "Working from home can be challenging. Here are some tips:\n\n1. Set a dedicated workspace\n2. Maintain regular hours\n3. Take breaks\n\nWhat works for you?" },
    { title: "Best resources for learning web development", content: "Looking for recommendations on learning resources.\n\n**Currently studying:**\n- HTML/CSS\n- JavaScript\n- React" },
    { title: "Coffee vs Tea - The eternal debate", content: "Which do you prefer and why?\n\nI'm a coffee person myself. ☕" },
    { title: "Share your weekend plans", content: "What's everyone doing this weekend?\n\nI'm planning to go hiking if the weather is nice." },
    { title: "Favorite IDE or code editor?", content: "VS Code user here. What's your choice?\n\n**Features I love:**\n- Extensions ecosystem\n- Integrated terminal\n- Git integration" },
    { title: "How do you handle stress?", content: "Life can be stressful sometimes. Share your coping mechanisms!\n\n> Exercise is my go-to stress relief" },
    { title: "Book recommendations thread", content: "Looking for good book recommendations.\n\nI recently finished reading and looking for something new." },
    { title: "Music for coding - what do you listen to?", content: "Lo-fi beats? Classical? Metal?\n\nShare your coding playlist!" },
    { title: "Side project ideas discussion", content: "Brainstorming side project ideas.\n\nWhat are you currently working on?" },
    { title: "Remote work best practices", content: "Share your remote work tips!\n\n**My setup:**\n- Standing desk\n- Dual monitors\n- Good lighting" },
    { title: "Gaming thread - what are you playing?", content: "Just finished an amazing game.\n\nWhat's everyone playing lately?" },
    { title: "Cooking experiments - share your recipes", content: "I tried making pasta from scratch today!\n\nAnyone else into cooking?" },
    { title: "Fitness and exercise routines", content: "How do you stay fit while working at a desk?\n\n**My routine:**\n- Morning jog\n- Stretching breaks\n- Evening workout" },
    { title: "Language learning tips", content: "I'm learning Japanese. Any tips for language learners?\n\nImmersion seems to be key!" },
  ];

  const threads: ThreadWithReplies[] = [];

  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length]!;
    const threadId = `thread-${serviceId}-${i + 10}`;
    const replyCount = Math.floor(Math.random() * 15) + 1;

    threads.push({
      id: threadId,
      organizationId: serviceId,
      title: topic.title,
      name: i % 2 === 0 ? "Anonymous" : `User${i + 1}`,
      content: topic.content,
      userId: i % 3 === 0 ? undefined : `user-${i + 100}`,
      replyAt: new Date(Date.now() - i * 1000 * 60 * 60 * 2),
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 4),
      replies: createMockReplies(threadId, replyCount),
    });
  }

  return threads;
};

// Mock thread data
export const mockThreads: Record<string, ThreadWithReplies[]> = {
  "demo-service": [
    {
      id: "thread-1",
      organizationId: "demo-service",
      title: "Welcome to the New Forum!",
      name: "Admin",
      content: `# Welcome to the New Forum!

This is our newly redesigned discussion board with modern architecture.

## New Features

- **Markdown Support**: You can use Markdown syntax to format your posts
- **Image Upload**: Image upload is supported
- **YouTube Embed**: You can embed YouTube videos directly

## How to Use

1. Click "Submit" button to create a new thread
2. Click the reply icon to respond to discussions
3. Use the red flag to report inappropriate content

Feel free to ask questions here!`,
      userId: "admin",
      replyAt: new Date(Date.now() - 1000 * 60 * 10),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      replies: createMockReplies("thread-1", 8),
    },
    {
      id: "thread-2",
      organizationId: "demo-service",
      title: "Nice weather today",
      name: "Anonymous",
      content: "Let's go outside!\n\nThe weather is so nice, don't stay indoors all day.",
      replyAt: new Date(Date.now() - 1000 * 60 * 30),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      replies: createMockReplies("thread-2", 3),
    },
    {
      id: "thread-3",
      organizationId: "demo-service",
      title: "Movie Recommendation",
      name: "MovieFan",
      content: `Just watched an amazing movie, highly recommend!

**Synopsis:**
It's a story about... (spoiler-free)

**My Rating:** ⭐⭐⭐⭐⭐

Anyone else seen it? Let's discuss!`,
      userId: "movie-fan",
      youtubeID: "dQw4w9WgXcQ",
      replyAt: new Date(Date.now() - 1000 * 60 * 60),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      replies: createMockReplies("thread-3", 12),
    },
    {
      id: "thread-4",
      organizationId: "demo-service",
      title: "Beginner programmer needs help",
      name: "NewDev",
      content: `Hi everyone, I'm just starting to learn programming.

Currently learning JavaScript and having some issues:

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

Why is this code giving me an error?

Any guidance would be appreciated!`,
      replyAt: new Date(Date.now() - 1000 * 60 * 120),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      replies: createMockReplies("thread-4", 5),
    },
    {
      id: "thread-5",
      organizationId: "demo-service",
      title: "Weekend meetup - looking for people",
      name: "EventOrganizer",
      content: "Anyone want to hang out this weekend?\n\nLocation: Downtown\nTime: Saturday 6 PM\n\nLeave a comment if interested!",
      replyAt: new Date(Date.now() - 1000 * 60 * 180),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      replies: createMockReplies("thread-5", 2),
    },
    // Add more threads for pagination testing
    ...generateMockThreads("demo-service", 20),
  ],
  "tech-forum": [
    {
      id: "tech-thread-1",
      organizationId: "tech-forum",
      title: "React 19 New Features Discussion",
      name: "FrontendDev",
      content: `React 19 brings many exciting new features!

## Main Updates

1. **Server Components** - Better server-side rendering support
2. **Actions** - Simplified form handling
3. **use() Hook** - New data fetching approach

What do you think?`,
      userId: "frontend-dev",
      replyAt: new Date(Date.now() - 1000 * 60 * 45),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      replies: createMockReplies("tech-thread-1", 6),
    },
    ...generateMockThreads("tech-forum", 15),
  ],
};

// Get Service
export function getMockService(serviceId: string): Service | undefined {
  return mockServices[serviceId];
}

// Get thread list (with pagination)
export function getMockThreads(
  serviceId: string,
  page: number = 1,
  pageSize: number = 10
): { threads: ThreadWithReplies[]; totalPages: number } {
  const allThreads = mockThreads[serviceId] || [];
  const totalPages = Math.ceil(allThreads.length / pageSize);
  const start = (page - 1) * pageSize;
  const threads = allThreads.slice(start, start + pageSize);

  return { threads, totalPages };
}

// Get single thread
export function getMockThread(
  serviceId: string,
  threadId: string
): ThreadWithReplies | undefined {
  const threads = mockThreads[serviceId] || [];
  return threads.find((t) => t.id === threadId);
}
