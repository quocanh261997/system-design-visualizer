import {
  Globe, Smartphone, Monitor, Cpu, Server, Shield, Database, HardDrive,
  MemoryStick, MessageSquare, Search, Cloud, Eye, Lock, Zap, Network,
  Container, Waypoints, Cable, Layers, Workflow, Radio, Satellite,
  FileText, Boxes, Timer,
} from "lucide-react";
import type { ComponentDefinition } from "@/types";

/** 32 system design components across 10 categories */
export const componentDefinitions: ComponentDefinition[] = [
  // ── Clients ──
  {
    type: "browser-client", label: "Browser", category: "clients",
    description: "Web browser client making HTTP requests",
    icon: Globe, color: "#3b82f6",
    properties: [
      { key: "users", label: "Est. Users", type: "number", defaultValue: 1000 },
      { key: "protocol", label: "Protocol", type: "select", defaultValue: "HTTPS", options: ["HTTP", "HTTPS", "WebSocket"] },
    ],
    defaultPorts: { inputs: 1, outputs: 1 },
  },
  {
    type: "mobile-client", label: "Mobile App", category: "clients",
    description: "Native mobile application (iOS/Android)",
    icon: Smartphone, color: "#8b5cf6",
    properties: [
      { key: "users", label: "Est. Users", type: "number", defaultValue: 5000 },
      { key: "protocol", label: "Protocol", type: "select", defaultValue: "HTTPS", options: ["HTTPS", "gRPC", "WebSocket"] },
    ],
    defaultPorts: { inputs: 1, outputs: 1 },
  },
  {
    type: "desktop-client", label: "Desktop App", category: "clients",
    description: "Native desktop application (Windows/macOS/Linux)",
    icon: Monitor, color: "#64748b",
    properties: [
      { key: "users", label: "Est. Users", type: "number", defaultValue: 500 },
      { key: "protocol", label: "Protocol", type: "select", defaultValue: "HTTPS", options: ["HTTPS", "gRPC", "WebSocket"] },
    ],
    defaultPorts: { inputs: 1, outputs: 1 },
  },
  {
    type: "iot-device", label: "IoT Device", category: "clients",
    description: "Internet of Things device sending telemetry data",
    icon: Cpu, color: "#84cc16",
    properties: [
      { key: "devices", label: "Device Count", type: "number", defaultValue: 100 },
      { key: "protocol", label: "Protocol", type: "select", defaultValue: "MQTT", options: ["MQTT", "HTTPS", "CoAP"] },
    ],
    defaultPorts: { inputs: 1, outputs: 1 },
  },
  // ── Networking ──
  {
    type: "load-balancer", label: "Load Balancer", category: "networking",
    description: "Distributes traffic across multiple servers",
    icon: Network, color: "#06b6d4",
    properties: [
      { key: "algorithm", label: "Algorithm", type: "select", defaultValue: "Round Robin", options: ["Round Robin", "Least Connections", "IP Hash", "Weighted"] },
      { key: "layer", label: "Layer", type: "select", defaultValue: "L7", options: ["L4", "L7"] },
      { key: "maxRps", label: "Max RPS", type: "number", defaultValue: 100000 },
    ],
    defaultPorts: { inputs: 1, outputs: 3 },
  },
  {
    type: "api-gateway", label: "API Gateway", category: "networking",
    description: "Entry point for API requests with routing, auth, rate limiting",
    icon: Shield, color: "#10b981",
    properties: [
      { key: "rateLimitRps", label: "Rate Limit (RPS)", type: "number", defaultValue: 10000 },
      { key: "auth", label: "Auth Enabled", type: "boolean", defaultValue: true },
      { key: "protocol", label: "Protocol", type: "select", defaultValue: "REST", options: ["REST", "GraphQL", "gRPC"] },
    ],
    defaultPorts: { inputs: 1, outputs: 3 },
  },
  {
    type: "cdn", label: "CDN", category: "networking",
    description: "Content Delivery Network for caching static assets at edge",
    icon: Cloud, color: "#f59e0b",
    properties: [
      { key: "provider", label: "Provider", type: "select", defaultValue: "CloudFront", options: ["CloudFront", "Cloudflare", "Akamai", "Fastly"] },
      { key: "ttl", label: "TTL (seconds)", type: "number", defaultValue: 3600 },
    ],
    defaultPorts: { inputs: 1, outputs: 1 },
  },
  {
    type: "dns", label: "DNS", category: "networking",
    description: "Domain Name System resolver for service discovery",
    icon: Waypoints, color: "#0ea5e9",
    properties: [
      { key: "provider", label: "Provider", type: "select", defaultValue: "Route 53", options: ["Route 53", "Cloud DNS", "Cloudflare DNS", "Custom"] },
      { key: "ttl", label: "TTL (seconds)", type: "number", defaultValue: 300 },
    ],
    defaultPorts: { inputs: 1, outputs: 2 },
  },
  {
    type: "reverse-proxy", label: "Reverse Proxy", category: "networking",
    description: "Reverse proxy for TLS termination and routing (Nginx/HAProxy)",
    icon: Cable, color: "#7c3aed",
    properties: [
      { key: "provider", label: "Provider", type: "select", defaultValue: "Nginx", options: ["Nginx", "HAProxy", "Envoy", "Traefik"] },
      { key: "tls", label: "TLS Termination", type: "boolean", defaultValue: true },
    ],
    defaultPorts: { inputs: 1, outputs: 3 },
  },
  // ── Compute ──
  {
    type: "web-server", label: "Web Server", category: "compute",
    description: "Application server handling business logic",
    icon: Server, color: "#6366f1",
    properties: [
      { key: "instances", label: "Instances", type: "number", defaultValue: 3 },
      { key: "language", label: "Language", type: "select", defaultValue: "Node.js", options: ["Node.js", "Python", "Go", "Java", "Rust", "C#"] },
      { key: "maxRps", label: "Max RPS/Instance", type: "number", defaultValue: 5000 },
    ],
    defaultPorts: { inputs: 2, outputs: 3 },
  },
  {
    type: "worker", label: "Worker", category: "compute",
    description: "Background job processor consuming from a queue",
    icon: Container, color: "#a855f7",
    properties: [
      { key: "instances", label: "Instances", type: "number", defaultValue: 2 },
      { key: "concurrency", label: "Concurrency", type: "number", defaultValue: 10 },
    ],
    defaultPorts: { inputs: 1, outputs: 2 },
  },
  {
    type: "app-server", label: "App Server", category: "compute",
    description: "Dedicated application server for business logic processing",
    icon: Layers, color: "#0891b2",
    properties: [
      { key: "instances", label: "Instances", type: "number", defaultValue: 3 },
      { key: "framework", label: "Framework", type: "select", defaultValue: "Express", options: ["Express", "Spring Boot", "Django", "ASP.NET"] },
    ],
    defaultPorts: { inputs: 2, outputs: 3 },
  },
  {
    type: "serverless-function", label: "Serverless Function", category: "compute",
    description: "Event-driven serverless compute (Lambda/Cloud Functions)",
    icon: Workflow, color: "#f472b6",
    properties: [
      { key: "runtime", label: "Runtime", type: "select", defaultValue: "Node.js", options: ["Node.js", "Python", "Go", "Java", ".NET"] },
      { key: "memoryMb", label: "Memory (MB)", type: "number", defaultValue: 256 },
      { key: "timeoutSec", label: "Timeout (s)", type: "number", defaultValue: 30 },
    ],
    defaultPorts: { inputs: 1, outputs: 2 },
  },
  // ── Databases ──
  {
    type: "postgresql", label: "PostgreSQL", category: "databases",
    description: "Relational database with ACID compliance",
    icon: Database, color: "#336791",
    properties: [
      { key: "replicas", label: "Read Replicas", type: "number", defaultValue: 1 },
      { key: "storage", label: "Storage (GB)", type: "number", defaultValue: 100 },
      { key: "maxConnections", label: "Max Connections", type: "number", defaultValue: 100 },
    ],
    defaultPorts: { inputs: 2, outputs: 1 },
  },
  {
    type: "mongodb", label: "MongoDB", category: "databases",
    description: "Document-oriented NoSQL database",
    icon: Database, color: "#47a248",
    properties: [
      { key: "shards", label: "Shards", type: "number", defaultValue: 1 },
      { key: "replicaSet", label: "Replica Set Size", type: "number", defaultValue: 3 },
      { key: "storage", label: "Storage (GB)", type: "number", defaultValue: 50 },
    ],
    defaultPorts: { inputs: 2, outputs: 1 },
  },
  {
    type: "mysql", label: "MySQL", category: "databases",
    description: "Popular open-source relational database",
    icon: Database, color: "#00758f",
    properties: [
      { key: "replicas", label: "Read Replicas", type: "number", defaultValue: 1 },
      { key: "storage", label: "Storage (GB)", type: "number", defaultValue: 100 },
    ],
    defaultPorts: { inputs: 2, outputs: 1 },
  },
  {
    type: "dynamodb", label: "DynamoDB", category: "databases",
    description: "Fully managed NoSQL key-value and document database",
    icon: Database, color: "#4053d6",
    properties: [
      { key: "rcu", label: "Read Capacity Units", type: "number", defaultValue: 25 },
      { key: "wcu", label: "Write Capacity Units", type: "number", defaultValue: 25 },
    ],
    defaultPorts: { inputs: 2, outputs: 1 },
  },
  {
    type: "cassandra", label: "Cassandra", category: "databases",
    description: "Distributed wide-column store for high write throughput",
    icon: Database, color: "#1287b1",
    properties: [
      { key: "nodes", label: "Nodes", type: "number", defaultValue: 3 },
      { key: "replicationFactor", label: "Replication Factor", type: "number", defaultValue: 3 },
    ],
    defaultPorts: { inputs: 2, outputs: 1 },
  },
  // ── Caching ──
  {
    type: "redis", label: "Redis", category: "caching",
    description: "In-memory key-value store for caching and pub/sub",
    icon: MemoryStick, color: "#dc382d",
    properties: [
      { key: "maxMemory", label: "Max Memory (MB)", type: "number", defaultValue: 512 },
      { key: "evictionPolicy", label: "Eviction", type: "select", defaultValue: "allkeys-lru", options: ["allkeys-lru", "volatile-lru", "noeviction"] },
      { key: "cluster", label: "Cluster Mode", type: "boolean", defaultValue: false },
    ],
    defaultPorts: { inputs: 2, outputs: 1 },
  },
  {
    type: "memcached", label: "Memcached", category: "caching",
    description: "High-performance distributed memory caching system",
    icon: MemoryStick, color: "#6b7280",
    properties: [
      { key: "maxMemory", label: "Max Memory (MB)", type: "number", defaultValue: 512 },
      { key: "threads", label: "Threads", type: "number", defaultValue: 4 },
    ],
    defaultPorts: { inputs: 2, outputs: 1 },
  },
  {
    type: "app-cache", label: "App Cache", category: "caching",
    description: "Application-level in-memory cache with TTL support",
    icon: Timer, color: "#f59e0b",
    properties: [
      { key: "maxEntries", label: "Max Entries", type: "number", defaultValue: 10000 },
      { key: "ttl", label: "TTL (seconds)", type: "number", defaultValue: 60 },
    ],
    defaultPorts: { inputs: 1, outputs: 1 },
  },
  // ── Messaging ──
  {
    type: "message-queue", label: "Message Queue", category: "messaging",
    description: "Async message broker (Kafka, RabbitMQ, SQS)",
    icon: MessageSquare, color: "#f97316",
    properties: [
      { key: "provider", label: "Provider", type: "select", defaultValue: "Kafka", options: ["Kafka", "RabbitMQ", "SQS", "Pub/Sub"] },
      { key: "partitions", label: "Partitions", type: "number", defaultValue: 6 },
      { key: "retentionHours", label: "Retention (hours)", type: "number", defaultValue: 168 },
    ],
    defaultPorts: { inputs: 2, outputs: 2 },
  },
  {
    type: "kafka", label: "Apache Kafka", category: "messaging",
    description: "Distributed event streaming platform for high-throughput",
    icon: Radio, color: "#555555",
    properties: [
      { key: "brokers", label: "Brokers", type: "number", defaultValue: 3 },
      { key: "partitions", label: "Partitions", type: "number", defaultValue: 12 },
      { key: "retentionHours", label: "Retention (hours)", type: "number", defaultValue: 168 },
    ],
    defaultPorts: { inputs: 2, outputs: 3 },
  },
  {
    type: "rabbitmq", label: "RabbitMQ", category: "messaging",
    description: "Lightweight message broker supporting multiple protocols",
    icon: MessageSquare, color: "#ff6600",
    properties: [
      { key: "queues", label: "Queues", type: "number", defaultValue: 5 },
      { key: "durable", label: "Durable", type: "boolean", defaultValue: true },
    ],
    defaultPorts: { inputs: 2, outputs: 2 },
  },
  {
    type: "event-bus", label: "Event Bus", category: "messaging",
    description: "Pub/sub event bus for decoupled communication",
    icon: Satellite, color: "#8b5cf6",
    properties: [
      { key: "provider", label: "Provider", type: "select", defaultValue: "EventBridge", options: ["EventBridge", "Pub/Sub", "SNS", "Custom"] },
      { key: "filterRules", label: "Filter Rules", type: "number", defaultValue: 10 },
    ],
    defaultPorts: { inputs: 2, outputs: 3 },
  },
  // ── Storage ──
  {
    type: "blob-storage", label: "Blob Storage", category: "storage",
    description: "Object storage for files, images, backups (S3-compatible)",
    icon: HardDrive, color: "#eab308",
    properties: [
      { key: "provider", label: "Provider", type: "select", defaultValue: "S3", options: ["S3", "GCS", "Azure Blob", "MinIO"] },
      { key: "storage", label: "Storage (TB)", type: "number", defaultValue: 1 },
    ],
    defaultPorts: { inputs: 1, outputs: 1 },
  },
  {
    type: "file-system", label: "File System", category: "storage",
    description: "Network or distributed file system (EFS/NFS)",
    icon: FileText, color: "#a3a3a3",
    properties: [
      { key: "type", label: "Type", type: "select", defaultValue: "NFS", options: ["NFS", "EFS", "GlusterFS", "HDFS"] },
      { key: "storage", label: "Storage (TB)", type: "number", defaultValue: 5 },
    ],
    defaultPorts: { inputs: 1, outputs: 1 },
  },
  {
    type: "data-lake", label: "Data Lake", category: "storage",
    description: "Centralized data lake or data warehouse for analytics",
    icon: Boxes, color: "#0e7490",
    properties: [
      { key: "provider", label: "Provider", type: "select", defaultValue: "Snowflake", options: ["Snowflake", "BigQuery", "Redshift", "Databricks"] },
      { key: "storage", label: "Storage (TB)", type: "number", defaultValue: 10 },
    ],
    defaultPorts: { inputs: 2, outputs: 1 },
  },
  // ── Search ──
  {
    type: "elasticsearch", label: "Elasticsearch", category: "search",
    description: "Full-text search and analytics engine",
    icon: Search, color: "#fed10a",
    properties: [
      { key: "nodes", label: "Nodes", type: "number", defaultValue: 3 },
      { key: "indices", label: "Indices", type: "number", defaultValue: 5 },
    ],
    defaultPorts: { inputs: 2, outputs: 1 },
  },
  // ── Auth & Security ──
  {
    type: "auth-service", label: "Auth Service", category: "auth",
    description: "Authentication and authorization service (OAuth, JWT)",
    icon: Lock, color: "#ec4899",
    properties: [
      { key: "provider", label: "Provider", type: "select", defaultValue: "Custom", options: ["Custom", "Auth0", "Firebase Auth", "Keycloak"] },
      { key: "tokenType", label: "Token Type", type: "select", defaultValue: "JWT", options: ["JWT", "Opaque", "Session"] },
    ],
    defaultPorts: { inputs: 1, outputs: 1 },
  },
  // ── Observability ──
  {
    type: "monitoring", label: "Monitoring", category: "observability",
    description: "Metrics, logs, and distributed tracing collection",
    icon: Eye, color: "#14b8a6",
    properties: [
      { key: "provider", label: "Provider", type: "select", defaultValue: "Prometheus + Grafana", options: ["Prometheus + Grafana", "Datadog", "New Relic", "ELK Stack"] },
      { key: "tracing", label: "Distributed Tracing", type: "boolean", defaultValue: true },
    ],
    defaultPorts: { inputs: 3, outputs: 0 },
  },
  {
    type: "rate-limiter", label: "Rate Limiter", category: "auth",
    description: "Limits request rates to protect downstream services",
    icon: Zap, color: "#f43f5e",
    properties: [
      { key: "algorithm", label: "Algorithm", type: "select", defaultValue: "Token Bucket", options: ["Token Bucket", "Sliding Window", "Fixed Window", "Leaky Bucket"] },
      { key: "limitRps", label: "Limit (RPS)", type: "number", defaultValue: 1000 },
    ],
    defaultPorts: { inputs: 1, outputs: 1 },
  },
  // ── Decision ──
  {
    type: "decision-gateway", label: "Decision", category: "decision",
    description: "Conditional branching point (cache hit/miss, feature flag, A/B test)",
    icon: Waypoints, color: "#f59e0b",
    properties: [
      { key: "condition", label: "Condition", type: "text", defaultValue: "Cache Hit?", placeholder: "e.g., Cache Hit?" },
    ],
    defaultPorts: { inputs: 1, outputs: 3 },
  },
];

/** Lookup map for fast component type resolution */
export const componentDefinitionMap = new Map<string, ComponentDefinition>(
  componentDefinitions.map((def) => [def.type, def]),
);

/** Category display metadata */
export const categoryLabels: Record<string, string> = {
  clients: "Clients",
  networking: "Networking",
  compute: "Compute",
  databases: "Databases",
  caching: "Caching",
  messaging: "Messaging",
  storage: "Storage",
  search: "Search",
  auth: "Auth & Security",
  observability: "Observability",
  "third-party": "Third-Party",
  decision: "Decision",
};
