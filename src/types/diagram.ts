// ─── Node Types ──────────────────────────────────────────────────────────────

export type NodeType =
  | 'service' | 'server' | 'database' | 'queue' | 'gateway' | 'custom'
  | 'cloud' | 'api' | 'endpoint' | 'security' | 'storage' | 'compute'
  | 'network' | 'frontend' | 'mobile' | 'monitor' | 'cache' | 'auth'
  | 'email' | 'search' | 'analytics' | 'config' | 'cicd' | 'docs'
  | 'scheduler' | 'users' | 'chat' | 'workflow' | 'container' | 'router'
  | 'streaming' | 'timer' | 'notification' | 'secrets' | 'code';

export type NodeShape = 'rectangle' | 'rounded' | 'circle' | 'diamond';

export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  description?: string;
  type: NodeType;
  color: string;
  borderColor: string;
  textColor: string;
  shape: NodeShape;
  icon?: string;
  fontSize: number;
  borderWidth: number;
  shadow: boolean;
  isVisible: boolean;
}

// ─── Edge Types ──────────────────────────────────────────────────────────────

export type HandlePosition = 'input' | 'output' | 'top' | 'bottom';
export type EdgeStyle = 'solid' | 'dashed' | 'dotted';
export type PacketShape = 'circle' | 'square' | 'diamond' | 'triangle';

export interface DiagramEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: HandlePosition;
  targetHandle: HandlePosition;
  label: string;
  color: string;
  width: number;
  style: EdgeStyle;
  animated: boolean;
  bidirectional: boolean;
  bounce: boolean;
  curvature: number;
  arrowSize?: number;
  isVisible: boolean;
}

// ─── Group Types ─────────────────────────────────────────────────────────────

export interface NodeGroup {
  id: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  backgroundColor: string;
  nodeIds: string[];
  isCollapsed: boolean;
  isVisible: boolean;
  padding: number;
}

// ─── Viewport ────────────────────────────────────────────────────────────────

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// ─── Animation Types ─────────────────────────────────────────────────────────

export interface AnimationConfig {
  speed: number;
  frequency: number;
  size: number;
  color: string;
  shape: PacketShape;
  trail: boolean;
  enabled: boolean;
  frameOffset?: number;
}

// ─── Flow Types ──────────────────────────────────────────────────────────────

export interface FlowPathNode {
  nodeId: string;
  delay: number;
}

export interface FlowConfig {
  id: string;
  label: string;
  path: FlowPathNode[];
  packetColor: string;
  packetSize: number;
  packetShape: PacketShape;
  speed: number;
  trail: boolean;
  loop: boolean;
  return: boolean;
  enabled: boolean;
}

// ─── Composite Types ─────────────────────────────────────────────────────────

export interface DiagramData {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: NodeGroup[];
  viewport: Viewport;
  animationConfigs?: Record<string, AnimationConfig>;
  flowConfigs?: FlowConfig[];
}

export interface DiagramState {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: NodeGroup[];
  animationConfigs: Record<string, AnimationConfig>;
  flowConfigs?: FlowConfig[];
}
