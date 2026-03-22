export interface EstimationPreset {
  id: string
  name: string
  description: string
  defaults: Record<string, number>
}

export const estimationPresets: EstimationPreset[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Blank template -- fill in your own values',
    defaults: {},
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Twitter/Instagram-style: posts, timelines, media',
    defaults: {
      dau: 100_000_000,
      requestsPerUser: 20,
      peakMultiplier: 3,
      readWriteRatio: 10,
      recordSizeBytes: 500,
      retentionDays: 1825,
      cacheRatio: 0.2,
      avgRequestSizeKb: 2,
      avgResponseSizeKb: 10,
    },
  },
  {
    id: 'chat-messaging',
    name: 'Chat / Messaging',
    description: 'WhatsApp/Slack-style: messages, connections, presence',
    defaults: {
      dau: 50_000_000,
      requestsPerUser: 40,
      peakMultiplier: 2.5,
      readWriteRatio: 1,
      recordSizeBytes: 200,
      retentionDays: 3650,
      cacheRatio: 0.15,
      avgRequestSizeKb: 1,
      avgResponseSizeKb: 3,
    },
  },
  {
    id: 'video-streaming',
    name: 'Video Streaming',
    description: 'YouTube/Netflix-style: uploads, views, CDN bandwidth',
    defaults: {
      dau: 200_000_000,
      requestsPerUser: 5,
      peakMultiplier: 3,
      readWriteRatio: 200,
      recordSizeBytes: 50_000_000,
      retentionDays: 3650,
      cacheRatio: 0.1,
      avgRequestSizeKb: 5,
      avgResponseSizeKb: 5000,
    },
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'bit.ly-style: URL creation and redirect lookups',
    defaults: {
      dau: 10_000_000,
      requestsPerUser: 5,
      peakMultiplier: 2,
      readWriteRatio: 100,
      recordSizeBytes: 500,
      retentionDays: 1825,
      cacheRatio: 0.2,
      avgRequestSizeKb: 0.5,
      avgResponseSizeKb: 0.5,
    },
  },
  {
    id: 'e-commerce',
    name: 'E-Commerce',
    description: 'Amazon-style: browsing, search, orders, inventory',
    defaults: {
      dau: 50_000_000,
      requestsPerUser: 15,
      peakMultiplier: 5,
      readWriteRatio: 50,
      recordSizeBytes: 2000,
      retentionDays: 1825,
      cacheRatio: 0.25,
      avgRequestSizeKb: 3,
      avgResponseSizeKb: 15,
    },
  },
]
