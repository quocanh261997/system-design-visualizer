import type { SystemNode, SystemEdge } from '@/types'

export interface DesignTemplate {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  nodes: SystemNode[]
  edges: SystemEdge[]
}

// ── Helpers ──

function node(
  id: string,
  componentType: string,
  label: string,
  x: number,
  y: number,
): SystemNode {
  return {
    id,
    type: 'system-component',
    position: { x, y },
    data: { componentType, label, config: {} },
  }
}

function edge(
  id: string,
  source: string,
  target: string,
  label: string,
  protocol: string,
  connectionType: 'sync' | 'async' | 'streaming',
  latencyMs: number,
): SystemEdge {
  return {
    id,
    source,
    target,
    type: 'typed-edge',
    data: { label, protocol, connectionType, latencyMs },
  }
}

// ── Templates ──

export const designTemplates: DesignTemplate[] = [
  // 1. URL Shortener
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Simple URL shortening service with caching layer and persistent storage',
    difficulty: 'beginner',
    tags: ['caching', 'REST', 'beginner-friendly'],
    nodes: [
      node('tpl-url-browser', 'browser-client', 'Browser', 0, 150),
      node('tpl-url-lb', 'load-balancer', 'Load Balancer', 250, 150),
      node('tpl-url-web', 'web-server', 'Web Server', 500, 150),
      node('tpl-url-redis', 'redis', 'Redis Cache', 750, 50),
      node('tpl-url-pg', 'postgresql', 'PostgreSQL', 750, 250),
    ],
    edges: [
      edge('tpl-url-e1', 'tpl-url-browser', 'tpl-url-lb', 'HTTPS', 'HTTPS', 'sync', 10),
      edge('tpl-url-e2', 'tpl-url-lb', 'tpl-url-web', 'Forward', 'HTTP', 'sync', 2),
      edge('tpl-url-e3', 'tpl-url-web', 'tpl-url-redis', 'Cache lookup', 'TCP', 'sync', 1),
      edge('tpl-url-e4', 'tpl-url-web', 'tpl-url-pg', 'Read/Write URL', 'TCP', 'sync', 5),
    ],
  },

  // 2. Chat Application
  {
    id: 'chat-app',
    name: 'Chat Application',
    description: 'Real-time messaging platform with push notifications and persistent history',
    difficulty: 'intermediate',
    tags: ['real-time', 'WebSocket', 'messaging', 'push-notifications'],
    nodes: [
      node('tpl-chat-browser', 'browser-client', 'Browser', 0, 80),
      node('tpl-chat-mobile', 'mobile-client', 'Mobile App', 0, 280),
      node('tpl-chat-lb', 'load-balancer', 'Load Balancer', 250, 180),
      node('tpl-chat-gw', 'api-gateway', 'API Gateway', 450, 180),
      node('tpl-chat-web', 'web-server', 'Chat Server', 650, 180),
      node('tpl-chat-redis', 'redis', 'Session / Presence', 850, 50),
      node('tpl-chat-pg', 'postgresql', 'Message Store', 850, 180),
      node('tpl-chat-kafka', 'kafka', 'Kafka', 850, 320),
      node('tpl-chat-worker', 'worker', 'Notification Worker', 1100, 320),
      node('tpl-chat-notif', 'monitoring', 'Push Notifier', 1350, 320),
    ],
    edges: [
      edge('tpl-chat-e1', 'tpl-chat-browser', 'tpl-chat-lb', 'WSS', 'WebSocket', 'streaming', 15),
      edge('tpl-chat-e2', 'tpl-chat-mobile', 'tpl-chat-lb', 'WSS', 'WebSocket', 'streaming', 30),
      edge('tpl-chat-e3', 'tpl-chat-lb', 'tpl-chat-gw', 'Route', 'HTTP', 'sync', 2),
      edge('tpl-chat-e4', 'tpl-chat-gw', 'tpl-chat-web', 'Forward', 'HTTP', 'sync', 2),
      edge('tpl-chat-e5', 'tpl-chat-web', 'tpl-chat-redis', 'Session check', 'TCP', 'sync', 1),
      edge('tpl-chat-e6', 'tpl-chat-web', 'tpl-chat-pg', 'Persist message', 'TCP', 'sync', 5),
      edge('tpl-chat-e7', 'tpl-chat-web', 'tpl-chat-kafka', 'Publish event', 'Kafka', 'async', 3),
      edge('tpl-chat-e8', 'tpl-chat-kafka', 'tpl-chat-worker', 'Consume', 'Kafka', 'async', 10),
      edge('tpl-chat-e9', 'tpl-chat-worker', 'tpl-chat-notif', 'Send push', 'HTTP', 'sync', 50),
    ],
  },

  // 3. E-Commerce Platform
  {
    id: 'ecommerce',
    name: 'E-Commerce Platform',
    description: 'Full-featured online store with search, media storage, and async order processing',
    difficulty: 'intermediate',
    tags: ['search', 'async-processing', 'CDN', 'e-commerce'],
    nodes: [
      node('tpl-ec-browser', 'browser-client', 'Browser', 0, 180),
      node('tpl-ec-cdn', 'cdn', 'CDN', 220, 50),
      node('tpl-ec-lb', 'load-balancer', 'Load Balancer', 220, 180),
      node('tpl-ec-gw', 'api-gateway', 'API Gateway', 440, 180),
      node('tpl-ec-web', 'web-server', 'App Server', 660, 180),
      node('tpl-ec-redis', 'redis', 'Redis Cache', 900, 0),
      node('tpl-ec-pg', 'postgresql', 'PostgreSQL', 900, 120),
      node('tpl-ec-es', 'elasticsearch', 'Elasticsearch', 900, 240),
      node('tpl-ec-blob', 'blob-storage', 'Image Store', 900, 360),
      node('tpl-ec-mq', 'message-queue', 'Order Queue', 1140, 180),
      node('tpl-ec-worker', 'worker', 'Order Worker', 1380, 180),
    ],
    edges: [
      edge('tpl-ec-e1', 'tpl-ec-browser', 'tpl-ec-cdn', 'Static assets', 'HTTPS', 'sync', 5),
      edge('tpl-ec-e2', 'tpl-ec-browser', 'tpl-ec-lb', 'API calls', 'HTTPS', 'sync', 15),
      edge('tpl-ec-e3', 'tpl-ec-lb', 'tpl-ec-gw', 'Route', 'HTTP', 'sync', 2),
      edge('tpl-ec-e4', 'tpl-ec-gw', 'tpl-ec-web', 'Forward', 'REST', 'sync', 3),
      edge('tpl-ec-e5', 'tpl-ec-web', 'tpl-ec-redis', 'Cache', 'TCP', 'sync', 1),
      edge('tpl-ec-e6', 'tpl-ec-web', 'tpl-ec-pg', 'Query', 'TCP', 'sync', 5),
      edge('tpl-ec-e7', 'tpl-ec-web', 'tpl-ec-es', 'Search', 'HTTP', 'sync', 10),
      edge('tpl-ec-e8', 'tpl-ec-web', 'tpl-ec-blob', 'Upload / fetch', 'HTTPS', 'sync', 20),
      edge('tpl-ec-e9', 'tpl-ec-web', 'tpl-ec-mq', 'Enqueue order', 'AMQP', 'async', 3),
      edge('tpl-ec-e10', 'tpl-ec-mq', 'tpl-ec-worker', 'Process order', 'AMQP', 'async', 15),
    ],
  },

  // 4. Twitter/X Clone
  {
    id: 'twitter-clone',
    name: 'Twitter / X Clone',
    description: 'Social media feed with fan-out, full-text search, media uploads, and event streaming',
    difficulty: 'advanced',
    tags: ['fan-out', 'event-streaming', 'search', 'social-media'],
    nodes: [
      node('tpl-tw-browser', 'browser-client', 'Browser', 0, 100),
      node('tpl-tw-mobile', 'mobile-client', 'Mobile App', 0, 300),
      node('tpl-tw-cdn', 'cdn', 'CDN', 230, 0),
      node('tpl-tw-lb', 'load-balancer', 'Load Balancer', 230, 200),
      node('tpl-tw-gw', 'api-gateway', 'API Gateway', 460, 200),
      node('tpl-tw-web', 'web-server', 'App Server', 690, 200),
      node('tpl-tw-redis', 'redis', 'Timeline Cache', 940, 30),
      node('tpl-tw-pg', 'postgresql', 'PostgreSQL', 940, 150),
      node('tpl-tw-kafka', 'kafka', 'Kafka', 940, 270),
      node('tpl-tw-es', 'elasticsearch', 'Elasticsearch', 940, 390),
      node('tpl-tw-blob', 'blob-storage', 'Media Store', 1180, 30),
      node('tpl-tw-worker', 'worker', 'Fan-out Worker', 1180, 270),
    ],
    edges: [
      edge('tpl-tw-e1', 'tpl-tw-browser', 'tpl-tw-cdn', 'Static', 'HTTPS', 'sync', 5),
      edge('tpl-tw-e2', 'tpl-tw-browser', 'tpl-tw-lb', 'API', 'HTTPS', 'sync', 15),
      edge('tpl-tw-e3', 'tpl-tw-mobile', 'tpl-tw-lb', 'API', 'HTTPS', 'sync', 30),
      edge('tpl-tw-e4', 'tpl-tw-lb', 'tpl-tw-gw', 'Route', 'HTTP', 'sync', 2),
      edge('tpl-tw-e5', 'tpl-tw-gw', 'tpl-tw-web', 'Forward', 'REST', 'sync', 3),
      edge('tpl-tw-e6', 'tpl-tw-web', 'tpl-tw-redis', 'Timeline read', 'TCP', 'sync', 1),
      edge('tpl-tw-e7', 'tpl-tw-web', 'tpl-tw-pg', 'CRUD', 'TCP', 'sync', 5),
      edge('tpl-tw-e8', 'tpl-tw-web', 'tpl-tw-kafka', 'Publish tweet', 'Kafka', 'async', 3),
      edge('tpl-tw-e9', 'tpl-tw-web', 'tpl-tw-es', 'Search', 'HTTP', 'sync', 10),
      edge('tpl-tw-e10', 'tpl-tw-web', 'tpl-tw-blob', 'Media upload', 'HTTPS', 'sync', 25),
      edge('tpl-tw-e11', 'tpl-tw-kafka', 'tpl-tw-worker', 'Fan-out', 'Kafka', 'async', 10),
      edge('tpl-tw-e12', 'tpl-tw-worker', 'tpl-tw-redis', 'Update timelines', 'TCP', 'sync', 2),
    ],
  },

  // 5. Video Streaming Service
  {
    id: 'video-streaming',
    name: 'Video Streaming Service',
    description: 'Video-on-demand platform with CDN delivery, transcoding pipeline, and metadata store',
    difficulty: 'advanced',
    tags: ['streaming', 'CDN', 'transcoding', 'blob-storage'],
    nodes: [
      node('tpl-vid-browser', 'browser-client', 'Browser', 0, 100),
      node('tpl-vid-mobile', 'mobile-client', 'Mobile App', 0, 300),
      node('tpl-vid-cdn', 'cdn', 'CDN', 230, 0),
      node('tpl-vid-lb', 'load-balancer', 'Load Balancer', 230, 200),
      node('tpl-vid-gw', 'api-gateway', 'API Gateway', 460, 200),
      node('tpl-vid-web', 'web-server', 'App Server', 690, 200),
      node('tpl-vid-redis', 'redis', 'Session Cache', 940, 50),
      node('tpl-vid-pg', 'postgresql', 'Metadata DB', 940, 200),
      node('tpl-vid-blob', 'blob-storage', 'Video Store', 940, 350),
      node('tpl-vid-kafka', 'kafka', 'Kafka', 1180, 200),
      node('tpl-vid-worker', 'worker', 'Transcoder', 1420, 200),
    ],
    edges: [
      edge('tpl-vid-e1', 'tpl-vid-browser', 'tpl-vid-cdn', 'Stream video', 'HTTPS', 'streaming', 5),
      edge('tpl-vid-e2', 'tpl-vid-mobile', 'tpl-vid-cdn', 'Stream video', 'HTTPS', 'streaming', 10),
      edge('tpl-vid-e3', 'tpl-vid-browser', 'tpl-vid-lb', 'API', 'HTTPS', 'sync', 15),
      edge('tpl-vid-e4', 'tpl-vid-mobile', 'tpl-vid-lb', 'API', 'HTTPS', 'sync', 30),
      edge('tpl-vid-e5', 'tpl-vid-lb', 'tpl-vid-gw', 'Route', 'HTTP', 'sync', 2),
      edge('tpl-vid-e6', 'tpl-vid-gw', 'tpl-vid-web', 'Forward', 'REST', 'sync', 3),
      edge('tpl-vid-e7', 'tpl-vid-web', 'tpl-vid-redis', 'Session', 'TCP', 'sync', 1),
      edge('tpl-vid-e8', 'tpl-vid-web', 'tpl-vid-pg', 'Metadata', 'TCP', 'sync', 5),
      edge('tpl-vid-e9', 'tpl-vid-web', 'tpl-vid-blob', 'Upload video', 'HTTPS', 'sync', 50),
      edge('tpl-vid-e10', 'tpl-vid-web', 'tpl-vid-kafka', 'Transcode job', 'Kafka', 'async', 3),
      edge('tpl-vid-e11', 'tpl-vid-kafka', 'tpl-vid-worker', 'Consume', 'Kafka', 'async', 10),
      edge('tpl-vid-e12', 'tpl-vid-worker', 'tpl-vid-blob', 'Write segments', 'HTTPS', 'async', 100),
    ],
  },

  // 6. Ride-Sharing App
  {
    id: 'ride-sharing',
    name: 'Ride-Sharing App',
    description: 'Location-aware ride matching with real-time tracking, event processing, and monitoring',
    difficulty: 'intermediate',
    tags: ['real-time', 'location', 'event-driven', 'mobile'],
    nodes: [
      node('tpl-ride-mobile', 'mobile-client', 'Driver / Rider App', 0, 150),
      node('tpl-ride-lb', 'load-balancer', 'Load Balancer', 250, 150),
      node('tpl-ride-gw', 'api-gateway', 'API Gateway', 470, 150),
      node('tpl-ride-web', 'web-server', 'Ride Service', 690, 150),
      node('tpl-ride-redis', 'redis', 'Location Cache', 930, 20),
      node('tpl-ride-pg', 'postgresql', 'Ride DB', 930, 150),
      node('tpl-ride-kafka', 'kafka', 'Kafka', 930, 290),
      node('tpl-ride-worker', 'worker', 'Matching Worker', 1170, 220),
      node('tpl-ride-mon', 'monitoring', 'Monitoring', 1170, 60),
    ],
    edges: [
      edge('tpl-ride-e1', 'tpl-ride-mobile', 'tpl-ride-lb', 'GPS updates', 'HTTPS', 'sync', 20),
      edge('tpl-ride-e2', 'tpl-ride-lb', 'tpl-ride-gw', 'Route', 'HTTP', 'sync', 2),
      edge('tpl-ride-e3', 'tpl-ride-gw', 'tpl-ride-web', 'Forward', 'REST', 'sync', 3),
      edge('tpl-ride-e4', 'tpl-ride-web', 'tpl-ride-redis', 'Update location', 'TCP', 'sync', 1),
      edge('tpl-ride-e5', 'tpl-ride-web', 'tpl-ride-pg', 'Ride CRUD', 'TCP', 'sync', 5),
      edge('tpl-ride-e6', 'tpl-ride-web', 'tpl-ride-kafka', 'Ride event', 'Kafka', 'async', 3),
      edge('tpl-ride-e7', 'tpl-ride-kafka', 'tpl-ride-worker', 'Match request', 'Kafka', 'async', 10),
      edge('tpl-ride-e8', 'tpl-ride-web', 'tpl-ride-mon', 'Metrics', 'HTTP', 'async', 5),
    ],
  },

  // 7. Notification System
  {
    id: 'notification-system',
    name: 'Notification System',
    description: 'Scalable notification pipeline with rate limiting, deduplication, and multi-channel delivery',
    difficulty: 'beginner',
    tags: ['async', 'rate-limiting', 'messaging', 'pipeline'],
    nodes: [
      node('tpl-notif-web', 'web-server', 'Trigger Service', 0, 150),
      node('tpl-notif-kafka', 'kafka', 'Kafka', 250, 150),
      node('tpl-notif-worker', 'worker', 'Notification Worker', 500, 150),
      node('tpl-notif-redis', 'redis', 'Rate Limiter Store', 750, 50),
      node('tpl-notif-sender', 'monitoring', 'Notification Sender', 750, 260),
    ],
    edges: [
      edge('tpl-notif-e1', 'tpl-notif-web', 'tpl-notif-kafka', 'Publish event', 'Kafka', 'async', 3),
      edge('tpl-notif-e2', 'tpl-notif-kafka', 'tpl-notif-worker', 'Consume', 'Kafka', 'async', 10),
      edge('tpl-notif-e3', 'tpl-notif-worker', 'tpl-notif-redis', 'Check rate limit', 'TCP', 'sync', 1),
      edge('tpl-notif-e4', 'tpl-notif-worker', 'tpl-notif-sender', 'Send notification', 'HTTP', 'sync', 30),
    ],
  },

  // 8. Rate Limiter Design
  {
    id: 'rate-limiter',
    name: 'Rate Limiter Design',
    description: 'Token-bucket rate limiter protecting backend services with Redis-backed counters',
    difficulty: 'beginner',
    tags: ['rate-limiting', 'Redis', 'security', 'beginner-friendly'],
    nodes: [
      node('tpl-rl-browser', 'browser-client', 'Browser', 0, 150),
      node('tpl-rl-limiter', 'rate-limiter', 'Rate Limiter', 250, 150),
      node('tpl-rl-gw', 'api-gateway', 'API Gateway', 500, 150),
      node('tpl-rl-web', 'web-server', 'Web Server', 750, 150),
      node('tpl-rl-redis', 'redis', 'Redis Counters', 500, 350),
    ],
    edges: [
      edge('tpl-rl-e1', 'tpl-rl-browser', 'tpl-rl-limiter', 'Request', 'HTTPS', 'sync', 5),
      edge('tpl-rl-e2', 'tpl-rl-limiter', 'tpl-rl-redis', 'Check / incr', 'TCP', 'sync', 1),
      edge('tpl-rl-e3', 'tpl-rl-limiter', 'tpl-rl-gw', 'Allowed request', 'HTTP', 'sync', 2),
      edge('tpl-rl-e4', 'tpl-rl-gw', 'tpl-rl-web', 'Forward', 'REST', 'sync', 3),
    ],
  },

  // 9. Search Autocomplete
  {
    id: 'search-autocomplete',
    name: 'Search Autocomplete',
    description: 'Low-latency typeahead suggestions with trie-based cache and full-text search fallback',
    difficulty: 'intermediate',
    tags: ['search', 'low-latency', 'caching', 'Elasticsearch'],
    nodes: [
      node('tpl-sa-browser', 'browser-client', 'Browser', 0, 150),
      node('tpl-sa-lb', 'load-balancer', 'Load Balancer', 250, 150),
      node('tpl-sa-gw', 'api-gateway', 'API Gateway', 470, 150),
      node('tpl-sa-web', 'web-server', 'Suggestion Service', 690, 150),
      node('tpl-sa-redis', 'redis', 'Prefix Cache', 940, 50),
      node('tpl-sa-es', 'elasticsearch', 'Elasticsearch', 940, 260),
    ],
    edges: [
      edge('tpl-sa-e1', 'tpl-sa-browser', 'tpl-sa-lb', 'Keystroke', 'HTTPS', 'sync', 10),
      edge('tpl-sa-e2', 'tpl-sa-lb', 'tpl-sa-gw', 'Route', 'HTTP', 'sync', 2),
      edge('tpl-sa-e3', 'tpl-sa-gw', 'tpl-sa-web', 'Forward', 'REST', 'sync', 3),
      edge('tpl-sa-e4', 'tpl-sa-web', 'tpl-sa-redis', 'Prefix lookup', 'TCP', 'sync', 1),
      edge('tpl-sa-e5', 'tpl-sa-web', 'tpl-sa-es', 'Full-text search', 'HTTP', 'sync', 15),
    ],
  },

  // 10. File Upload Service
  {
    id: 'file-upload',
    name: 'File Upload Service',
    description: 'Chunked file upload with virus scanning, thumbnail generation, and metadata indexing',
    difficulty: 'intermediate',
    tags: ['file-upload', 'blob-storage', 'async-processing', 'pipeline'],
    nodes: [
      node('tpl-fu-browser', 'browser-client', 'Browser', 0, 150),
      node('tpl-fu-lb', 'load-balancer', 'Load Balancer', 250, 150),
      node('tpl-fu-gw', 'api-gateway', 'API Gateway', 470, 150),
      node('tpl-fu-web', 'web-server', 'Upload Server', 690, 150),
      node('tpl-fu-blob', 'blob-storage', 'Blob Storage', 940, 30),
      node('tpl-fu-pg', 'postgresql', 'File Metadata DB', 940, 160),
      node('tpl-fu-kafka', 'kafka', 'Kafka', 940, 290),
      node('tpl-fu-worker', 'worker', 'Processing Worker', 1190, 290),
    ],
    edges: [
      edge('tpl-fu-e1', 'tpl-fu-browser', 'tpl-fu-lb', 'Upload chunks', 'HTTPS', 'sync', 20),
      edge('tpl-fu-e2', 'tpl-fu-lb', 'tpl-fu-gw', 'Route', 'HTTP', 'sync', 2),
      edge('tpl-fu-e3', 'tpl-fu-gw', 'tpl-fu-web', 'Forward', 'REST', 'sync', 3),
      edge('tpl-fu-e4', 'tpl-fu-web', 'tpl-fu-blob', 'Store file', 'HTTPS', 'sync', 40),
      edge('tpl-fu-e5', 'tpl-fu-web', 'tpl-fu-pg', 'Save metadata', 'TCP', 'sync', 5),
      edge('tpl-fu-e6', 'tpl-fu-web', 'tpl-fu-kafka', 'Process event', 'Kafka', 'async', 3),
      edge('tpl-fu-e7', 'tpl-fu-kafka', 'tpl-fu-worker', 'Consume', 'Kafka', 'async', 10),
      edge('tpl-fu-e8', 'tpl-fu-worker', 'tpl-fu-blob', 'Write thumbnail', 'HTTPS', 'async', 30),
    ],
  },
]

/** Lookup map for fast template resolution by ID */
export const templateMap = new Map<string, DesignTemplate>(
  designTemplates.map((t) => [t.id, t]),
)
