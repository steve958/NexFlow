import type { DiagramNode, DiagramEdge, NodeGroup, NodeType } from '@/types/diagram';
import type {
  SerializedArchitecture,
  SerializedService,
  SerializedConnection,
  SerializedGroup,
} from '@/types/generation';

// ─── Node-type → infrastructure concept mapping ─────────────────────────────

const NODE_TYPE_DESCRIPTIONS: Record<NodeType, string> = {
  service: 'Microservice',
  server: 'On-premise server',
  database: 'Database',
  queue: 'Message broker / queue',
  gateway: 'API gateway',
  custom: 'Custom component',
  cloud: 'Cloud service',
  api: 'API gateway / proxy',
  endpoint: 'API endpoint',
  security: 'Security service / firewall',
  storage: 'File / object storage',
  compute: 'Compute / serverless function',
  network: 'Load balancer / network',
  frontend: 'Web application',
  mobile: 'Mobile application',
  monitor: 'Monitoring / observability',
  cache: 'Cache layer (Redis / Memcached)',
  auth: 'Authentication / authorization service',
  email: 'Email service',
  search: 'Search engine',
  analytics: 'Analytics / data pipeline',
  config: 'Configuration service',
  cicd: 'CI/CD pipeline',
  docs: 'Documentation',
  scheduler: 'Scheduled job / cron',
  users: 'User service / directory',
  chat: 'Chat / messaging service',
  workflow: 'Workflow / orchestration engine',
  container: 'Container / Docker',
  router: 'Router / reverse proxy',
  streaming: 'Event streaming platform',
  timer: 'Timer / scheduler',
  notification: 'Notification service',
  secrets: 'Secrets / vault',
  code: 'Code / lambda function',
};

// ─── Protocol inference from edge labels ─────────────────────────────────────

const PROTOCOL_PATTERNS: [RegExp, string][] = [
  [/grpc/i, 'gRPC'],
  [/websocket|ws/i, 'WebSocket'],
  [/graphql/i, 'GraphQL'],
  [/http|rest|api/i, 'HTTP/REST'],
  [/event|emit/i, 'Event'],
  [/publish|subscribe|pub.?sub/i, 'Pub/Sub'],
  [/quer(?:y|ies)/i, 'Database query'],
  [/stream/i, 'Streaming'],
  [/tcp/i, 'TCP'],
  [/udp/i, 'UDP'],
  [/smtp|email/i, 'SMTP'],
  [/amqp/i, 'AMQP'],
  [/mqtt/i, 'MQTT'],
];

function inferProtocol(label: string): string {
  if (!label || !label.trim()) return 'unspecified';
  for (const [pattern, protocol] of PROTOCOL_PATTERNS) {
    if (pattern.test(label)) return protocol;
  }
  // Return the raw label as a fallback — it still gives the AI useful context
  return label.trim();
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Convert a visual diagram into a clean, AI-friendly semantic representation.
 *
 * All visual properties (coordinates, colors, shapes, animations) are stripped.
 * Only semantic information (types, labels, descriptions, relationships) is kept.
 */
export function serializeDiagram(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  groups: NodeGroup[],
): SerializedArchitecture {
  // Build a nodeId → group label lookup
  const nodeGroupMap = new Map<string, string>();
  for (const group of groups) {
    for (const nodeId of group.nodeIds) {
      nodeGroupMap.set(nodeId, group.label);
    }
  }

  // Build a nodeId → label lookup for connection descriptions
  const nodeLabels = new Map<string, string>();
  for (const node of nodes) {
    nodeLabels.set(node.id, node.label);
  }

  const services: SerializedService[] = nodes
    .filter((n) => n.isVisible)
    .map((node) => ({
      id: node.id,
      name: node.label,
      type: NODE_TYPE_DESCRIPTIONS[node.type] ?? node.type,
      description: node.description || '',
      ...(nodeGroupMap.has(node.id)
        ? { group: nodeGroupMap.get(node.id)! }
        : {}),
    }));

  const connections: SerializedConnection[] = edges
    .filter((e) => e.isVisible)
    .map((edge) => ({
      from: nodeLabels.get(edge.sourceId) ?? edge.sourceId,
      to: nodeLabels.get(edge.targetId) ?? edge.targetId,
      protocol: inferProtocol(edge.label),
      description: edge.label || '',
      bidirectional: edge.bidirectional,
    }));

  const serializedGroups: SerializedGroup[] = groups
    .filter((g) => g.isVisible)
    .map((group) => ({
      name: group.label,
      description: group.description || '',
      memberIds: group.nodeIds
        .map((id) => nodeLabels.get(id) ?? id)
        .filter(Boolean),
    }));

  return {
    services,
    connections,
    groups: serializedGroups,
  };
}

/** Maximum nodes allowed per generation request. */
export const MAX_NODES_PER_GENERATION = 50;

/** Check whether the diagram is within the generation size limit. */
export function isWithinSizeLimit(nodes: DiagramNode[]): boolean {
  return nodes.filter((n) => n.isVisible).length <= MAX_NODES_PER_GENERATION;
}
