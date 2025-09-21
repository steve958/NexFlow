"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Palette, Settings, Play, Pause, Square, Circle, Diamond, Triangle, Eye, EyeOff, Download, Save, Undo, Redo, FileJson, Image, ZoomIn, ZoomOut, Maximize, MousePointer, Database, Server, Cloud, Globe, Shield, Cpu, HardDrive, Network, Smartphone, Monitor, Layers, Zap, Trash2, Plus, HelpCircle, X, FolderOpen, Edit } from 'lucide-react';
import { db, auth } from '@/lib/firestoreClient';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';

interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: 'service' | 'database' | 'queue' | 'gateway' | 'custom' | 'cloud' | 'api' | 'security' | 'storage' | 'compute' | 'network' | 'frontend' | 'mobile' | 'monitor';
  color: string;
  borderColor: string;
  textColor: string;
  shape: 'rectangle' | 'rounded' | 'circle' | 'diamond';
  icon?: string;
  fontSize: number;
  borderWidth: number;
  shadow: boolean;
  isVisible: boolean;
}

interface NodeTemplate {
  type: Node['type'];
  label: string;
  color: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
}

interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: 'input' | 'output' | 'top' | 'bottom';
  targetHandle: 'input' | 'output' | 'top' | 'bottom';
  label: string;
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  animated: boolean;
  curvature: number;
  arrowSize: number;
  isVisible: boolean;
}

interface Packet {
  id: string;
  x: number;
  y: number;
  progress: number;
  color: string;
  size: number;
  shape: 'circle' | 'square' | 'diamond' | 'triangle';
  edgeId: string;
  trail: boolean;
  speed: number;
}

interface AnimationConfig {
  speed: number;
  frequency: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'diamond' | 'triangle';
  trail: boolean;
  enabled: boolean;
}

interface NodeGroup {
  id: string;
  label: string;
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

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  groups: NodeGroup[];
  animationConfigs: Record<string, AnimationConfig>;
}

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

// Predefined node templates
const NODE_TEMPLATES: NodeTemplate[] = [
  {
    type: 'service',
    label: 'Microservice',
    color: '#3b82f6',
    borderColor: '#1e40af',
    icon: Server,
    description: 'Application service or microservice'
  },
  {
    type: 'database',
    label: 'Database',
    color: '#10b981',
    borderColor: '#047857',
    icon: Database,
    description: 'Database or data store'
  },
  {
    type: 'cloud',
    label: 'Cloud Service',
    color: '#06b6d4',
    borderColor: '#0891b2',
    icon: Cloud,
    description: 'Cloud provider service'
  },
  {
    type: 'api',
    label: 'API Gateway',
    color: '#8b5cf6',
    borderColor: '#7c3aed',
    icon: Globe,
    description: 'API gateway or proxy'
  },
  {
    type: 'queue',
    label: 'Message Queue',
    color: '#f59e0b',
    borderColor: '#d97706',
    icon: Layers,
    description: 'Message queue or broker'
  },
  {
    type: 'security',
    label: 'Security',
    color: '#ef4444',
    borderColor: '#dc2626',
    icon: Shield,
    description: 'Security service or firewall'
  },
  {
    type: 'storage',
    label: 'File Storage',
    color: '#84cc16',
    borderColor: '#65a30d',
    icon: HardDrive,
    description: 'File storage or CDN'
  },
  {
    type: 'compute',
    label: 'Compute',
    color: '#f97316',
    borderColor: '#ea580c',
    icon: Cpu,
    description: 'Computing resource or function'
  },
  {
    type: 'network',
    label: 'Load Balancer',
    color: '#6366f1',
    borderColor: '#4f46e5',
    icon: Network,
    description: 'Load balancer or network'
  },
  {
    type: 'frontend',
    label: 'Web App',
    color: '#ec4899',
    borderColor: '#db2777',
    icon: Monitor,
    description: 'Web application or frontend'
  },
  {
    type: 'mobile',
    label: 'Mobile App',
    color: '#14b8a6',
    borderColor: '#0f766e',
    icon: Smartphone,
    description: 'Mobile application'
  },
  {
    type: 'monitor',
    label: 'Monitoring',
    color: '#a855f7',
    borderColor: '#9333ea',
    icon: Zap,
    description: 'Monitoring or analytics'
  }
];

const ModernDiagramCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // History management for undo/redo
  const [history, setHistory] = useState<DiagramState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'svc',
      x: 150,
      y: 200,
      width: 160,
      height: 80,
      label: 'Service',
      type: 'service',
      color: '#3b82f6',
      borderColor: '#1e40af',
      textColor: '#ffffff',
      shape: 'rounded',
      fontSize: 14,
      borderWidth: 2,
      shadow: true,
      isVisible: true
    },
    {
      id: 'db',
      x: 500,
      y: 200,
      width: 160,
      height: 80,
      label: 'Database',
      type: 'database',
      color: '#10b981',
      borderColor: '#047857',
      textColor: '#ffffff',
      shape: 'rounded',
      fontSize: 14,
      borderWidth: 2,
      shadow: true,
      isVisible: true
    },
    {
      id: 'api',
      x: 150,
      y: 350,
      width: 160,
      height: 80,
      label: 'API Gateway',
      type: 'gateway',
      color: '#8b5cf6',
      borderColor: '#6d28d9',
      textColor: '#ffffff',
      shape: 'rounded',
      fontSize: 14,
      borderWidth: 2,
      shadow: true,
      isVisible: true
    },
    {
      id: 'queue',
      x: 500,
      y: 350,
      width: 160,
      height: 80,
      label: 'Message Queue',
      type: 'queue',
      color: '#f59e0b',
      borderColor: '#d97706',
      textColor: '#ffffff',
      shape: 'rounded',
      fontSize: 14,
      borderWidth: 2,
      shadow: true,
      isVisible: true
    }
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    {
      id: 'e1',
      sourceId: 'svc',
      targetId: 'db',
      sourceHandle: 'output',
      targetHandle: 'input',
      label: 'writes',
      color: '#6b7280',
      width: 2,
      style: 'solid',
      animated: false,
      curvature: 0.3,
      arrowSize: 12,
      isVisible: true
    },
    {
      id: 'e2',
      sourceId: 'api',
      targetId: 'svc',
      sourceHandle: 'output',
      targetHandle: 'input',
      label: 'requests',
      color: '#6b7280',
      width: 2,
      style: 'solid',
      animated: false,
      curvature: 0.3,
      arrowSize: 12,
      isVisible: true
    },
    {
      id: 'e3',
      sourceId: 'svc',
      targetId: 'queue',
      sourceHandle: 'output',
      targetHandle: 'input',
      label: 'events',
      color: '#6b7280',
      width: 2,
      style: 'solid',
      animated: false,
      curvature: 0.3,
      arrowSize: 12,
      isVisible: true
    }
  ]);

  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState<User | null>(null);

  // Groups state
  const [groups, setGroups] = useState<NodeGroup[]>([]);

  // Viewport state for zoom and pan (client-side only)
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  // Transform coordinates from screen to world space
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - viewport.x) / viewport.zoom,
      y: (screenY - viewport.y) / viewport.zoom
    };
  }, [viewport]);

  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activePanel, setActivePanel] = useState<'nodes' | 'edges' | 'animations' | 'templates' | 'groups' | 'controls'>('templates');
  const [draggedTemplate, setDraggedTemplate] = useState<NodeTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; handle: 'input' | 'output' | 'top' | 'bottom' } | null>(null);
  const [connectionPreview, setConnectionPreview] = useState<{ x: number; y: number } | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'node' | 'edge' | 'canvas' | 'group';
    targetId?: string
  } | null>(null);

  // Help panel state
  const [showHelp, setShowHelp] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Save/Load state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedDiagrams, setSavedDiagrams] = useState<{ id: string; title: string; nodes: Node[]; edges: Edge[]; groups: NodeGroup[]; animationConfigs: Record<string, AnimationConfig>; createdAt: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Templates state
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);

  // Predefined diagram templates
  const DIAGRAM_TEMPLATES = [
    {
      id: 'microservices',
      name: 'Microservices Architecture',
      description: 'Basic microservices pattern with API gateway and services',
      category: 'Architecture',
      nodes: [
        { id: 'gateway', x: 400, y: 100, width: 120, height: 80, type: 'api', label: 'API Gateway', color: '#3b82f6', borderColor: '#1e40af', isVisible: true },
        { id: 'service1', x: 200, y: 250, width: 100, height: 80, type: 'service', label: 'User Service', color: '#10b981', borderColor: '#047857', isVisible: true },
        { id: 'service2', x: 400, y: 250, width: 100, height: 80, type: 'service', label: 'Order Service', color: '#10b981', borderColor: '#047857', isVisible: true },
        { id: 'service3', x: 600, y: 250, width: 100, height: 80, type: 'service', label: 'Payment Service', color: '#10b981', borderColor: '#047857', isVisible: true },
        { id: 'db1', x: 200, y: 400, width: 100, height: 60, type: 'database', label: 'User DB', color: '#f59e0b', borderColor: '#d97706', isVisible: true },
        { id: 'db2', x: 400, y: 400, width: 100, height: 60, type: 'database', label: 'Order DB', color: '#f59e0b', borderColor: '#d97706', isVisible: true },
        { id: 'db3', x: 600, y: 400, width: 100, height: 60, type: 'database', label: 'Payment DB', color: '#f59e0b', borderColor: '#d97706', isVisible: true }
      ],
      edges: [
        { id: 'e1', sourceId: 'gateway', targetId: 'service1', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e2', sourceId: 'gateway', targetId: 'service2', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e3', sourceId: 'gateway', targetId: 'service3', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e4', sourceId: 'service1', targetId: 'db1', type: 'straight', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e5', sourceId: 'service2', targetId: 'db2', type: 'straight', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e6', sourceId: 'service3', targetId: 'db3', type: 'straight', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' }
      ],
      groups: []
    },
    {
      id: 'three-tier',
      name: 'Three-Tier Architecture',
      description: 'Classic presentation, business logic, and data layers',
      category: 'Architecture',
      nodes: [
        { id: 'web', x: 400, y: 100, width: 120, height: 80, type: 'frontend', label: 'Web Frontend', color: '#8b5cf6', borderColor: '#7c3aed', isVisible: true },
        { id: 'app1', x: 300, y: 250, width: 100, height: 80, type: 'service', label: 'App Server 1', color: '#10b981', borderColor: '#047857', isVisible: true },
        { id: 'app2', x: 500, y: 250, width: 100, height: 80, type: 'service', label: 'App Server 2', color: '#10b981', borderColor: '#047857', isVisible: true },
        { id: 'lb', x: 400, y: 180, width: 100, height: 50, type: 'loadbalancer', label: 'Load Balancer', color: '#06b6d4', borderColor: '#0891b2', isVisible: true },
        { id: 'db', x: 400, y: 400, width: 120, height: 80, type: 'database', label: 'Database', color: '#f59e0b', borderColor: '#d97706', isVisible: true }
      ],
      edges: [
        { id: 'e1', sourceId: 'web', targetId: 'lb', type: 'straight', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e2', sourceId: 'lb', targetId: 'app1', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e3', sourceId: 'lb', targetId: 'app2', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e4', sourceId: 'app1', targetId: 'db', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e5', sourceId: 'app2', targetId: 'db', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' }
      ],
      groups: [
        { id: 'presentation', label: 'Presentation Layer', x: 350, y: 80, width: 220, height: 120, color: '#8b5cf6', borderColor: '#7c3aed', backgroundColor: 'rgba(139, 92, 246, 0.1)', nodeIds: ['web', 'lb'], isCollapsed: false, isVisible: true, padding: 20 },
        { id: 'business', label: 'Business Logic Layer', x: 280, y: 220, width: 340, height: 130, color: '#10b981', borderColor: '#047857', backgroundColor: 'rgba(16, 185, 129, 0.1)', nodeIds: ['app1', 'app2'], isCollapsed: false, isVisible: true, padding: 20 },
        { id: 'data', label: 'Data Layer', x: 360, y: 380, width: 200, height: 120, color: '#f59e0b', borderColor: '#d97706', backgroundColor: 'rgba(245, 158, 11, 0.1)', nodeIds: ['db'], isCollapsed: false, isVisible: true, padding: 20 }
      ]
    },
    {
      id: 'serverless',
      name: 'Serverless Architecture',
      description: 'Event-driven serverless pattern with functions and managed services',
      category: 'Cloud',
      nodes: [
        { id: 'client', x: 100, y: 200, width: 100, height: 80, type: 'frontend', label: 'Client App', color: '#8b5cf6', borderColor: '#7c3aed', isVisible: true },
        { id: 'cdn', x: 300, y: 100, width: 100, height: 60, type: 'cloud', label: 'CDN', color: '#06b6d4', borderColor: '#0891b2', isVisible: true },
        { id: 'apigateway', x: 300, y: 200, width: 100, height: 80, type: 'api', label: 'API Gateway', color: '#3b82f6', borderColor: '#1e40af', isVisible: true },
        { id: 'lambda1', x: 500, y: 150, width: 80, height: 60, type: 'function', label: 'Auth Function', color: '#f97316', borderColor: '#ea580c', isVisible: true },
        { id: 'lambda2', x: 500, y: 250, width: 80, height: 60, type: 'function', label: 'Data Function', color: '#f97316', borderColor: '#ea580c', isVisible: true },
        { id: 'dynamodb', x: 700, y: 200, width: 100, height: 80, type: 'database', label: 'DynamoDB', color: '#f59e0b', borderColor: '#d97706', isVisible: true },
        { id: 's3', x: 500, y: 350, width: 80, height: 60, type: 'storage', label: 'S3 Storage', color: '#84cc16', borderColor: '#65a30d', isVisible: true }
      ],
      edges: [
        { id: 'e1', sourceId: 'client', targetId: 'cdn', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: 'Static Assets' },
        { id: 'e2', sourceId: 'client', targetId: 'apigateway', type: 'straight', color: '#64748b', strokeWidth: 2, isVisible: true, label: 'API Calls' },
        { id: 'e3', sourceId: 'apigateway', targetId: 'lambda1', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e4', sourceId: 'apigateway', targetId: 'lambda2', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e5', sourceId: 'lambda2', targetId: 'dynamodb', type: 'straight', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' },
        { id: 'e6', sourceId: 'lambda2', targetId: 's3', type: 'bezier', color: '#64748b', strokeWidth: 2, isVisible: true, label: '' }
      ],
      groups: []
    }
  ];

  const [animationConfigs, setAnimationConfigs] = useState<Record<string, AnimationConfig>>({});

  // Save state to history for undo/redo
  const saveToHistory = useCallback(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    const currentState: DiagramState = {
      nodes: nodes,
      edges: edges,
      groups: groups,
      animationConfigs: animationConfigs
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      // Keep only last 50 states to prevent memory issues
      return newHistory.slice(-50);
    });

    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [nodes, edges, animationConfigs, historyIndex]);

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoRef.current = true;
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setGroups(prevState.groups || []);
      setAnimationConfigs(prevState.animationConfigs);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setGroups(nextState.groups || []);
      setAnimationConfigs(nextState.animationConfigs);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  // Export as PNG
  const exportAsPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      // Fill with white background
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the original canvas on top
      tempCtx.drawImage(canvas, 0, 0);

      // Create download link
      tempCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `nexflow-diagram-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    }
  }, []);

  // Export as SVG
  const exportAsSVG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create SVG string
    let svg = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="white"/>`;

    // Add nodes
    nodes.filter(node => node.isVisible).forEach(node => {
      const rx = node.shape === 'circle' ? node.width / 2 : (node.shape === 'rounded' ? 8 : 0);
      svg += `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}"
        fill="${node.color}" stroke="${node.borderColor}" stroke-width="${node.borderWidth}" rx="${rx}"/>`;
      svg += `<text x="${node.x + node.width / 2}" y="${node.y + node.height / 2 + 4}"
        text-anchor="middle" font-family="sans-serif" font-size="${node.fontSize}" fill="${node.textColor}">${node.label}</text>`;
    });

    // Add edges
    edges.filter(edge => edge.isVisible).forEach(edge => {
      const points = getConnectionPoints(edge);
      if (points) {
        const { startX, startY, endX, endY } = points;
        const controlOffset = Math.min(Math.abs(endX - startX) * edge.curvature, 150);
        const cp1X = startX + controlOffset;
        const cp1Y = startY;
        const cp2X = endX - controlOffset;
        const cp2Y = endY;

        svg += `<path d="M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}"
          stroke="${edge.color}" stroke-width="${edge.width}" fill="none"/>`;

        // Add arrow
        const angle = Math.atan2(endY - cp2Y, endX - cp2X);
        const arrowLength = edge.arrowSize;
        svg += `<path d="M ${endX} ${endY} L ${endX - arrowLength * Math.cos(angle - Math.PI / 6)} ${endY - arrowLength * Math.sin(angle - Math.PI / 6)} M ${endX} ${endY} L ${endX - arrowLength * Math.cos(angle + Math.PI / 6)} ${endY - arrowLength * Math.sin(angle + Math.PI / 6)}"
          stroke="${edge.color}" stroke-width="${edge.width}" fill="none"/>`;

        // Add label
        const midX = (startX + cp1X + cp2X + endX) / 4;
        const midY = (startY + cp1Y + cp2Y + endY) / 4;
        svg += `<text x="${midX}" y="${midY - 8}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#374151">${edge.label}</text>`;
      }
    });

    svg += `</svg>`;

    // Create download
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexflow-diagram-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Export as JSON
  const exportAsJSON = useCallback(() => {
    const data = {
      nodes: nodes,
      edges: edges,
      animationConfigs: animationConfigs,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexflow-diagram-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges, animationConfigs]);

  // Import from JSON
  const importFromJSON = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
          if (data.animationConfigs) {
            setAnimationConfigs(data.animationConfigs);
          }
          saveToHistory();
        }
      } catch (error) {
        alert('Invalid JSON file format');
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  }, [saveToHistory]);

  // Duplication with Ctrl+D
  const duplicateSelected = useCallback(() => {
    if (selectedNodes.size > 0) {
      const newNodes: Node[] = [];
      const nodeMap = new Map<string, string>();

      selectedNodes.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          const newId = `${node.id}-copy-${Date.now()}`;
          nodeMap.set(nodeId, newId);
          newNodes.push({
            ...node,
            id: newId,
            x: node.x + 50,
            y: node.y + 50,
            label: `${node.label} Copy`
          });
        }
      });

      if (newNodes.length > 0) {
        setNodes(prev => [...prev, ...newNodes]);
        setSelectedNodes(new Set(newNodes.map(n => n.id)));
        setSelectedNode(newNodes[0].id);
      }
    } else if (selectedNode) {
      const node = nodes.find(n => n.id === selectedNode);
      if (node) {
        const newNode = {
          ...node,
          id: `${node.id}-copy-${Date.now()}`,
          x: node.x + 50,
          y: node.y + 50,
          label: `${node.label} Copy`
        };
        setNodes(prev => [...prev, newNode]);
        setSelectedNode(newNode.id);
        setSelectedNodes(new Set([newNode.id]));
      }
    }
  }, [selectedNodes, selectedNode, nodes]);

  // Delete selected nodes and their edges
  const deleteSelected = useCallback(() => {
    if (selectedNodes.size > 0) {
      // Delete selected nodes
      setNodes(prev => prev.filter(node => !selectedNodes.has(node.id)));
      // Delete edges connected to deleted nodes
      setEdges(prev => prev.filter(edge =>
        !selectedNodes.has(edge.sourceId) && !selectedNodes.has(edge.targetId)
      ));
      // Remove nodes from groups
      setGroups(prev => prev.map(group => ({
        ...group,
        nodeIds: group.nodeIds.filter(nodeId => !selectedNodes.has(nodeId))
      })).filter(group => group.nodeIds.length > 0)); // Remove empty groups
      setSelectedNodes(new Set());
      setSelectedNode(null);
    } else if (selectedNode) {
      // Delete single selected node
      setNodes(prev => prev.filter(node => node.id !== selectedNode));
      // Delete edges connected to deleted node
      setEdges(prev => prev.filter(edge =>
        edge.sourceId !== selectedNode && edge.targetId !== selectedNode
      ));
      // Remove node from groups
      setGroups(prev => prev.map(group => ({
        ...group,
        nodeIds: group.nodeIds.filter(nodeId => nodeId !== selectedNode)
      })).filter(group => group.nodeIds.length > 0)); // Remove empty groups
      setSelectedNode(null);
    } else if (selectedEdge) {
      // Delete selected edge
      setEdges(prev => prev.filter(edge => edge.id !== selectedEdge));
      setSelectedEdge(null);
    } else if (selectedGroup) {
      // Delete selected group (but keep nodes)
      setGroups(prev => prev.filter(group => group.id !== selectedGroup));
      setSelectedGroup(null);
    }
    saveToHistory();
  }, [selectedNodes, selectedNode, selectedEdge, selectedGroup, saveToHistory]);

  // Group management functions
  const createGroupFromSelected = useCallback(() => {
    if (selectedNodes.size < 2) return; // Need at least 2 nodes to create a group

    const selectedNodesList = Array.from(selectedNodes);
    const groupNodes = nodes.filter(node => selectedNodes.has(node.id));

    if (groupNodes.length === 0) return;

    // Calculate bounding box for the group
    const padding = 20;
    const minX = Math.min(...groupNodes.map(node => node.x)) - padding;
    const minY = Math.min(...groupNodes.map(node => node.y)) - padding;
    const maxX = Math.max(...groupNodes.map(node => node.x + node.width)) + padding;
    const maxY = Math.max(...groupNodes.map(node => node.y + node.height)) + padding;

    const newGroup: NodeGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: `Group ${groups.length + 1}`,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      color: '#3b82f6',
      borderColor: '#1e40af',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      nodeIds: selectedNodesList,
      isCollapsed: false,
      isVisible: true,
      padding
    };

    setGroups(prev => [...prev, newGroup]);
    setSelectedGroup(newGroup.id);
    setSelectedNodes(new Set());
    setSelectedNode(null);
    saveToHistory();
  }, [selectedNodes, nodes, groups.length, saveToHistory]);

  const ungroupSelected = useCallback(() => {
    if (!selectedGroup) return;

    setGroups(prev => prev.filter(group => group.id !== selectedGroup));
    setSelectedGroup(null);
    saveToHistory();
  }, [selectedGroup, saveToHistory]);

  const updateGroupBounds = useCallback((groupId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;

      const groupNodes = nodes.filter(node => group.nodeIds.includes(node.id));
      if (groupNodes.length === 0) return group;

      const padding = group.padding;
      const minX = Math.min(...groupNodes.map(node => node.x)) - padding;
      const minY = Math.min(...groupNodes.map(node => node.y)) - padding;
      const maxX = Math.max(...groupNodes.map(node => node.x + node.width)) + padding;
      const maxY = Math.max(...groupNodes.map(node => node.y + node.height)) + padding;

      return {
        ...group,
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    }));
  }, [nodes]);

  // Save/Load functions
  const saveDiagram = useCallback(async (name: string, description: string = '') => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please sign in to save diagrams');
      return;
    }

    setIsLoading(true);
    try {
      const diagramData = {
        name,
        description,
        nodes,
        edges,
        groups,
        animationConfigs,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        userId: user.uid,
        userEmail: user.email
      };

      const docRef = await addDoc(collection(db, 'diagrams'), diagramData);
      console.log('Diagram saved with ID: ', docRef.id);
      alert('Diagram saved successfully!');
      setShowSaveDialog(false);
      loadSavedDiagrams(); // Refresh the list
    } catch (error) {
      console.error('Error saving diagram: ', error);
      alert('Failed to save diagram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [nodes, edges, groups, animationConfigs]);

  const loadSavedDiagrams = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'diagrams'),
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const diagrams = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as { id: string; title: string; nodes: Node[]; edges: Edge[]; groups: NodeGroup[]; animationConfigs: Record<string, AnimationConfig>; createdAt: string }[];
      setSavedDiagrams(diagrams);
    } catch (error) {
      console.error('Error loading diagrams: ', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDiagram = useCallback(async (diagramId: string) => {
    const diagram = savedDiagrams.find(d => d.id === diagramId);
    if (!diagram) return;

    // Clear current state
    setSelectedNode(null);
    setSelectedEdge(null);
    setSelectedGroup(null);
    setSelectedNodes(new Set());

    // Load diagram data
    setNodes(diagram.nodes || []);
    setEdges(diagram.edges || []);
    setGroups(diagram.groups || []);
    setAnimationConfigs(diagram.animationConfigs || {});

    // Reset viewport
    setViewport({ x: 0, y: 0, zoom: 1 });

    // Save to history for undo/redo
    saveToHistory();

    setShowLoadDialog(false);
    alert(`Loaded diagram: ${diagram.title}`);
  }, [savedDiagrams, saveToHistory]);

  const deleteDiagram = useCallback(async (diagramId: string) => {
    if (!confirm('Are you sure you want to delete this diagram?')) return;

    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'diagrams', diagramId));
      loadSavedDiagrams(); // Refresh the list
      alert('Diagram deleted successfully');
    } catch (error) {
      console.error('Error deleting diagram: ', error);
      alert('Failed to delete diagram');
    } finally {
      setIsLoading(false);
    }
  }, [loadSavedDiagrams]);

  const loadTemplate = useCallback((templateId: string) => {
    const template = DIAGRAM_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Clear current state
    setSelectedNode(null);
    setSelectedEdge(null);
    setSelectedGroup(null);
    setSelectedNodes(new Set());

    // Load template data with unique IDs
    const uniqueNodes = template.nodes.map(node => ({
      ...node,
      id: `${node.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    })) as unknown as Node[];

    const nodeIdMap = new Map(template.nodes.map((node, i) => [node.id, uniqueNodes[i].id]));

    const uniqueEdges = template.edges.map(edge => ({
      ...edge,
      id: `${edge.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sourceId: nodeIdMap.get(edge.sourceId) || edge.sourceId,
      targetId: nodeIdMap.get(edge.targetId) || edge.targetId
    })) as unknown as Edge[];

    const uniqueGroups = template.groups.map(group => ({
      ...group,
      id: `${group.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nodeIds: group.nodeIds.map(nodeId => nodeIdMap.get(nodeId) || nodeId)
    }));

    setNodes(uniqueNodes);
    setEdges(uniqueEdges);
    setGroups(uniqueGroups);
    setAnimationConfigs({});

    // Reset viewport
    setViewport({ x: 0, y: 0, zoom: 1 });

    // Save to history for undo/redo
    saveToHistory();

    setShowTemplatesDialog(false);
    alert(`Loaded template: ${template.name}`);
  }, [DIAGRAM_TEMPLATES, saveToHistory]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Load saved diagrams when component mounts
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      loadSavedDiagrams();
    }
  }, [loadSavedDiagrams]);

  // Create edge between nodes
  const createEdge = useCallback((sourceId: string, targetId: string, sourceHandle: 'input' | 'output' | 'top' | 'bottom', targetHandle: 'input' | 'output' | 'top' | 'bottom') => {
    const newEdge: Edge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceId,
      targetId,
      sourceHandle,
      targetHandle,
      label: 'connection',
      color: '#6b7280',
      width: 2,
      style: 'solid',
      animated: false,
      curvature: 0.3,
      arrowSize: 12,
      isVisible: true
    };

    setEdges(prev => [...prev, newEdge]);
    saveToHistory();
  }, [saveToHistory]);

  // Create node from template
  const createNodeFromTemplate = useCallback((template: NodeTemplate, x: number, y: number) => {
    const newNode: Node = {
      id: `${template.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      width: 160,
      height: 80,
      label: template.label,
      type: template.type,
      color: template.color,
      borderColor: template.borderColor,
      textColor: '#ffffff',
      shape: 'rounded',
      fontSize: 14,
      borderWidth: 2,
      shadow: true,
      isVisible: true
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
    setSelectedNodes(new Set([newNode.id]));
    saveToHistory();
  }, [saveToHistory]);

  // Handle template drag start
  const handleTemplateDragStart = useCallback((template: NodeTemplate, event: React.DragEvent) => {
    setDraggedTemplate(template);
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(template));
  }, []);

  // Handle canvas drop
  const handleCanvasDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    if (!draggedTemplate) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    createNodeFromTemplate(draggedTemplate, worldPos.x - 80, worldPos.y - 40);
    setDraggedTemplate(null);
  }, [draggedTemplate, screenToWorld, createNodeFromTemplate]);

  // Helper function to check if click is on connection handle
  const getClickedHandle = useCallback((worldPos: { x: number; y: number }, node: Node) => {
    const handleSize = 8;
    const handleRadius = handleSize / 2;

    // Input handle (left side)
    const inputX = node.x;
    const inputY = node.y + node.height / 2;
    const inputDist = Math.sqrt(Math.pow(worldPos.x - inputX, 2) + Math.pow(worldPos.y - inputY, 2));
    if (inputDist <= handleRadius + 5) {
      return 'input';
    }

    // Output handle (right side)
    const outputX = node.x + node.width;
    const outputY = node.y + node.height / 2;
    const outputDist = Math.sqrt(Math.pow(worldPos.x - outputX, 2) + Math.pow(worldPos.y - outputY, 2));
    if (outputDist <= handleRadius + 5) {
      return 'output';
    }

    // Top handle
    const topX = node.x + node.width / 2;
    const topY = node.y;
    const topDist = Math.sqrt(Math.pow(worldPos.x - topX, 2) + Math.pow(worldPos.y - topY, 2));
    if (topDist <= handleRadius + 5) {
      return 'top';
    }

    // Bottom handle
    const bottomX = node.x + node.width / 2;
    const bottomY = node.y + node.height;
    const bottomDist = Math.sqrt(Math.pow(worldPos.x - bottomX, 2) + Math.pow(worldPos.y - bottomY, 2));
    if (bottomDist <= handleRadius + 5) {
      return 'bottom';
    }

    return null;
  }, []);

  // Handle canvas drag over
  const handleCanvasDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Keyboard shortcuts
  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            exportAsJSON();
            break;
          case 'd':
            e.preventDefault();
            duplicateSelected();
            break;
          case 'g':
            e.preventDefault();
            if (selectedNodes.size >= 2) {
              createGroupFromSelected();
            }
            break;
          case '0':
            e.preventDefault();
            // Reset zoom and pan
            setViewport({ x: 0, y: 0, zoom: 1 });
            break;
        }
      }

      // Handle delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      }

      // Handle help toggle
      if (e.key === '?' || e.key === 'F1') {
        e.preventDefault();
        setShowHelp(prev => !prev);
      }

      // Handle escape key
      if (e.key === 'Escape') {
        setShowHelp(false);
        setContextMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, exportAsJSON, duplicateSelected, deleteSelected, createGroupFromSelected, selectedNodes.size]);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
    if (history.length === 0) {
      saveToHistory();
    }
  }, [saveToHistory]);

  // Canvas resize to fit container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    // Initial resize
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  // Save to history when nodes or edges change
  useEffect(() => {
    if (history.length > 0) {
      const timeoutId = setTimeout(saveToHistory, 300); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, saveToHistory]);

  const animationFrameRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  // Initialize animation configs for all edges
  useEffect(() => {
    const configs: Record<string, AnimationConfig> = {};
    edges.forEach(edge => {
      configs[edge.id] = {
        speed: 0.02,
        frequency: 60,
        size: 8,
        color: '#3b82f6',
        shape: 'circle',
        trail: false,
        enabled: false
      };
    });
    setAnimationConfigs(configs);
  }, [edges]);

  // Get node by ID
  const getNode = (id: string) => nodes.find(n => n.id === id);

  // Get edge connection points
  const getConnectionPoints = (edge: Edge) => {
    const source = getNode(edge.sourceId);
    const target = getNode(edge.targetId);
    if (!source || !target) return null;

    // Calculate source connection point based on handle type
    let startX, startY;
    switch (edge.sourceHandle) {
      case 'input':
        startX = source.x;
        startY = source.y + source.height / 2;
        break;
      case 'output':
        startX = source.x + source.width;
        startY = source.y + source.height / 2;
        break;
      case 'top':
        startX = source.x + source.width / 2;
        startY = source.y;
        break;
      case 'bottom':
        startX = source.x + source.width / 2;
        startY = source.y + source.height;
        break;
    }

    // Calculate target connection point based on handle type
    let endX, endY;
    switch (edge.targetHandle) {
      case 'input':
        endX = target.x;
        endY = target.y + target.height / 2;
        break;
      case 'output':
        endX = target.x + target.width;
        endY = target.y + target.height / 2;
        break;
      case 'top':
        endX = target.x + target.width / 2;
        endY = target.y;
        break;
      case 'bottom':
        endX = target.x + target.width / 2;
        endY = target.y + target.height;
        break;
    }

    return { startX, startY, endX, endY };
  };

  // Draw a node with advanced styling
  const drawNode = (ctx: CanvasRenderingContext2D, node: Node, isSelected = false) => {
    if (!node.isVisible) return;

    const { x, y, width, height, color, borderColor, textColor, shape, label, fontSize, borderWidth, shadow } = node;

    // Shadow
    if (shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
    }

    // Selection highlight with enhanced visuals
    if (isSelected) {
      const padding = 6;

      // Outer glow effect
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Selection border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);

      if (shape === 'circle') {
        const radius = Math.max(width, height) / 2 + padding;
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape === 'rounded') {
        const cornerRadius = 12 + padding;
        ctx.beginPath();
        ctx.roundRect(x - padding, y - padding, width + padding * 2, height + padding * 2, cornerRadius);
        ctx.stroke();
      } else {
        ctx.strokeRect(x - padding, y - padding, width + padding * 2, height + padding * 2);
      }

      // Reset effects
      ctx.setLineDash([]);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Selection handles (corner indicators)
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      const handles = [
        { x: x - padding, y: y - padding }, // top-left
        { x: x + width + padding, y: y - padding }, // top-right
        { x: x - padding, y: y + height + padding }, // bottom-left
        { x: x + width + padding, y: y + height + padding } // bottom-right
      ];

      handles.forEach(handle => {
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, handleSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      });
    }

    // Main shape
    ctx.fillStyle = color;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;

    ctx.beginPath();
    switch (shape) {
      case 'circle':
        const radius = Math.min(width, height) / 2;
        ctx.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI);
        break;
      case 'diamond':
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width / 2, y + height);
        ctx.lineTo(x, y + height / 2);
        ctx.closePath();
        break;
      case 'rounded':
        const cornerRadius = 12;
        ctx.roundRect(x, y, width, height, cornerRadius);
        break;
      default: // rectangle
        ctx.rect(x, y, width, height);
    }

    ctx.fill();
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Icon area
    const iconSize = 20;
    const iconX = x + 12;
    const iconY = y + 8;

    // Draw simple icon representation based on node type
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;

    switch (node.type) {
      case 'database':
        // Database cylinder
        ctx.beginPath();
        ctx.ellipse(iconX + iconSize / 2, iconY + 4, iconSize / 2 - 2, 3, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.rect(iconX + 2, iconY + 4, iconSize - 4, 12);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(iconX + iconSize / 2, iconY + 16, iconSize / 2 - 2, 3, 0, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'cloud':
        // Cloud shape
        ctx.beginPath();
        ctx.arc(iconX + 6, iconY + 12, 4, 0, 2 * Math.PI);
        ctx.arc(iconX + 10, iconY + 8, 5, 0, 2 * Math.PI);
        ctx.arc(iconX + 14, iconY + 12, 4, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'security':
        // Shield
        ctx.beginPath();
        ctx.moveTo(iconX + iconSize / 2, iconY + 2);
        ctx.lineTo(iconX + iconSize - 2, iconY + 6);
        ctx.lineTo(iconX + iconSize - 2, iconY + 12);
        ctx.lineTo(iconX + iconSize / 2, iconY + 18);
        ctx.lineTo(iconX + 2, iconY + 12);
        ctx.lineTo(iconX + 2, iconY + 6);
        ctx.closePath();
        ctx.fill();
        break;
      case 'api':
      case 'gateway':
        // Globe/network
        ctx.beginPath();
        ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 - 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(iconX + 2, iconY + iconSize / 2);
        ctx.lineTo(iconX + iconSize - 2, iconY + iconSize / 2);
        ctx.moveTo(iconX + iconSize / 2, iconY + 2);
        ctx.lineTo(iconX + iconSize / 2, iconY + iconSize - 2);
        ctx.stroke();
        break;
      case 'storage':
        // Hard drive
        ctx.fillRect(iconX + 2, iconY + 4, iconSize - 4, 12);
        ctx.strokeRect(iconX + 2, iconY + 4, iconSize - 4, 12);
        ctx.fillStyle = borderColor;
        ctx.fillRect(iconX + 4, iconY + 12, iconSize - 8, 2);
        break;
      case 'compute':
        // CPU
        ctx.strokeRect(iconX + 4, iconY + 4, iconSize - 8, iconSize - 8);
        ctx.strokeRect(iconX + 6, iconY + 6, iconSize - 12, iconSize - 12);
        // CPU pins
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(iconX + 2, iconY + 6 + i * 3);
          ctx.lineTo(iconX + 4, iconY + 6 + i * 3);
          ctx.moveTo(iconX + iconSize - 4, iconY + 6 + i * 3);
          ctx.lineTo(iconX + iconSize - 2, iconY + 6 + i * 3);
          ctx.stroke();
        }
        break;
      case 'network':
        // Network nodes
        const nodePositions = [
          [iconX + 4, iconY + 4],
          [iconX + iconSize - 4, iconY + 4],
          [iconX + iconSize / 2, iconY + iconSize - 4],
          [iconX + 2, iconY + iconSize - 4],
          [iconX + iconSize - 2, iconY + iconSize - 4]
        ];
        nodePositions.forEach(([nx, ny]) => {
          ctx.beginPath();
          ctx.arc(nx, ny, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
        // Connections
        ctx.beginPath();
        ctx.moveTo(nodePositions[0][0], nodePositions[0][1]);
        ctx.lineTo(nodePositions[1][0], nodePositions[1][1]);
        ctx.lineTo(nodePositions[2][0], nodePositions[2][1]);
        ctx.lineTo(nodePositions[0][0], nodePositions[0][1]);
        ctx.stroke();
        break;
      case 'frontend':
        // Monitor
        ctx.strokeRect(iconX + 2, iconY + 2, iconSize - 4, 12);
        ctx.fillRect(iconX + iconSize / 2 - 1, iconY + 14, 2, 3);
        ctx.fillRect(iconX + 4, iconY + 17, iconSize - 8, 2);
        break;
      case 'mobile':
        // Phone
        ctx.strokeRect(iconX + 6, iconY + 2, iconSize - 12, 16);
        ctx.fillRect(iconX + 8, iconY + 15, iconSize - 16, 1);
        ctx.beginPath();
        ctx.arc(iconX + iconSize / 2, iconY + 16, 1, 0, 2 * Math.PI);
        ctx.fill();
        break;
      default:
        // Server/service (default)
        ctx.strokeRect(iconX + 2, iconY + 2, iconSize - 4, iconSize - 4);
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(iconX + 4, iconY + 5 + i * 3, iconSize - 8, 1);
        }
        ctx.beginPath();
        ctx.arc(iconX + iconSize - 5, iconY + 6, 1, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Node type badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x, y + 28, width, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(node.type.toUpperCase(), x + width / 2, y + 40);

    // Main label
    ctx.fillStyle = textColor;
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x + width / 2, y + height - 16);

    // Connection handles (show when selected or connecting)
    if (isSelected || isConnecting) {
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      // Input handle (left side)
      const inputX = x - handleSize / 2;
      const inputY = y + height / 2 - handleSize / 2;
      ctx.beginPath();
      ctx.arc(inputX + handleSize / 2, inputY + handleSize / 2, handleSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Output handle (right side)
      const outputX = x + width - handleSize / 2;
      const outputY = y + height / 2 - handleSize / 2;
      ctx.beginPath();
      ctx.arc(outputX + handleSize / 2, outputY + handleSize / 2, handleSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Top handle
      const topX = x + width / 2 - handleSize / 2;
      const topY = y - handleSize / 2;
      ctx.beginPath();
      ctx.arc(topX + handleSize / 2, topY + handleSize / 2, handleSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Bottom handle
      const bottomX = x + width / 2 - handleSize / 2;
      const bottomY = y + height - handleSize / 2;
      ctx.beginPath();
      ctx.arc(bottomX + handleSize / 2, bottomY + handleSize / 2, handleSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  };

  // Draw edge with advanced styling
  const drawEdge = (ctx: CanvasRenderingContext2D, edge: Edge, isSelected = false) => {
    if (!edge.isVisible) return;

    const points = getConnectionPoints(edge);
    if (!points) return;

    const { startX, startY, endX, endY } = points;
    const controlOffset = Math.min(Math.abs(endX - startX) * edge.curvature, 150);
    const cp1X = startX + controlOffset;
    const cp1Y = startY;
    const cp2X = endX - controlOffset;
    const cp2Y = endY;

    // Edge styling
    ctx.strokeStyle = isSelected ? '#ef4444' : edge.color;
    ctx.lineWidth = isSelected ? edge.width + 2 : edge.width;

    // Line style
    if (edge.style === 'dashed') {
      ctx.setLineDash([8, 4]);
    } else if (edge.style === 'dotted') {
      ctx.setLineDash([2, 3]);
    } else {
      ctx.setLineDash([]);
    }

    // Draw curved line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
    ctx.stroke();

    // Reset line dash
    ctx.setLineDash([]);

    // Arrow
    const angle = Math.atan2(endY - cp2Y, endX - cp2X);
    const arrowLength = edge.arrowSize;

    ctx.fillStyle = isSelected ? '#ef4444' : edge.color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - Math.PI / 6),
      endY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + Math.PI / 6),
      endY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    // Edge label
    const midX = (startX + cp1X + cp2X + endX) / 4;
    const midY = (startY + cp1Y + cp2Y + endY) / 4;

    // Label background
    const labelMetrics = ctx.measureText(edge.label);
    const labelWidth = labelMetrics.width + 12;
    const labelHeight = 20;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(midX - labelWidth / 2, midY - labelHeight / 2, labelWidth, labelHeight);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(midX - labelWidth / 2, midY - labelHeight / 2, labelWidth, labelHeight);

    // Label text
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(edge.label, midX, midY + 4);
  };

  // Draw group container
  const drawGroup = (ctx: CanvasRenderingContext2D, group: NodeGroup, isSelected = false) => {
    if (!group.isVisible) return;

    const { x, y, width, height, label, color, borderColor, backgroundColor } = group;

    // Group background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(x, y, width, height);

    // Group border
    ctx.strokeStyle = isSelected ? '#ef4444' : borderColor;
    ctx.lineWidth = isSelected ? 3 : 2;

    if (isSelected) {
      ctx.setLineDash([8, 4]);
    }

    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);

    // Group label background
    const labelPadding = 8;
    const labelHeight = 24;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, Math.max(100, ctx.measureText(label).width + labelPadding * 2), labelHeight);

    // Group label text
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + labelPadding, y + 16);

    // Collapse/expand indicator
    const indicatorSize = 12;
    const indicatorX = x + width - indicatorSize - 8;
    const indicatorY = y + 6;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(indicatorX, indicatorY, indicatorSize, indicatorSize);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(indicatorX, indicatorY, indicatorSize, indicatorSize);

    // Draw collapse/expand icon
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (group.isCollapsed) {
      // Plus icon
      ctx.moveTo(indicatorX + 3, indicatorY + 6);
      ctx.lineTo(indicatorX + 9, indicatorY + 6);
      ctx.moveTo(indicatorX + 6, indicatorY + 3);
      ctx.lineTo(indicatorX + 6, indicatorY + 9);
    } else {
      // Minus icon
      ctx.moveTo(indicatorX + 3, indicatorY + 6);
      ctx.lineTo(indicatorX + 9, indicatorY + 6);
    }
    ctx.stroke();

    // Selection handles for groups
    if (isSelected) {
      const handleSize = 8;
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      const handles = [
        { x: x, y: y }, // top-left
        { x: x + width, y: y }, // top-right
        { x: x, y: y + height }, // bottom-left
        { x: x + width, y: y + height } // bottom-right
      ];

      handles.forEach(handle => {
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, handleSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      });
    }
  };

  // Draw packet with shape support
  const drawPacket = (ctx: CanvasRenderingContext2D, packet: Packet) => {
    const { x, y, size, color, shape, trail } = packet;

    // Trail effect
    if (trail) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      gradient.addColorStop(0, color + '40');
      gradient.addColorStop(1, color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Main packet
    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    switch (shape) {
      case 'circle':
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        break;
      case 'square':
        ctx.rect(x - size, y - size, size * 2, size * 2);
        break;
      case 'diamond':
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        break;
      case 'triangle':
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x - size, y + size);
        ctx.closePath();
        break;
    }

    ctx.fill();
    ctx.stroke();
  };

  // Calculate packet position along bezier curve
  const getPacketPosition = (edge: Edge, progress: number) => {
    const points = getConnectionPoints(edge);
    if (!points) return null;

    const { startX, startY, endX, endY } = points;
    const controlOffset = Math.min(Math.abs(endX - startX) * edge.curvature, 150);
    const cp1X = startX + controlOffset;
    const cp1Y = startY;
    const cp2X = endX - controlOffset;
    const cp2Y = endY;

    const t = progress;
    const x = Math.pow(1 - t, 3) * startX +
              3 * Math.pow(1 - t, 2) * t * cp1X +
              3 * (1 - t) * Math.pow(t, 2) * cp2X +
              Math.pow(t, 3) * endX;

    const y = Math.pow(1 - t, 3) * startY +
              3 * Math.pow(1 - t, 2) * t * cp1Y +
              3 * (1 - t) * Math.pow(t, 2) * cp2Y +
              Math.pow(t, 3) * endY;

    return { x, y };
  };

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save context state
    ctx.save();

    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply viewport transform
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Grid pattern
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1 / viewport.zoom;
    const gridSize = 20;

    // Calculate visible world bounds
    const worldBounds = {
      left: Math.floor((-viewport.x / viewport.zoom) / gridSize) * gridSize,
      top: Math.floor((-viewport.y / viewport.zoom) / gridSize) * gridSize,
      right: Math.ceil((canvas.width - viewport.x) / viewport.zoom / gridSize) * gridSize,
      bottom: Math.ceil((canvas.height - viewport.y) / viewport.zoom / gridSize) * gridSize
    };

    for (let x = worldBounds.left; x <= worldBounds.right; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, worldBounds.top);
      ctx.lineTo(x, worldBounds.bottom);
      ctx.stroke();
    }

    for (let y = worldBounds.top; y <= worldBounds.bottom; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(worldBounds.left, y);
      ctx.lineTo(worldBounds.right, y);
      ctx.stroke();
    }

    // Draw groups (background layer)
    groups.forEach(group => {
      drawGroup(ctx, group, group.id === selectedGroup);
    });

    // Draw edges
    edges.forEach(edge => {
      drawEdge(ctx, edge, edge.id === selectedEdge);
    });

    // Draw nodes (only visible ones, and hide collapsed group nodes)
    nodes.forEach(node => {
      // Check if node is in a collapsed group
      const parentGroup = groups.find(group =>
        group.nodeIds.includes(node.id) && group.isCollapsed
      );

      if (!parentGroup) {
        drawNode(ctx, node, node.id === selectedNode);
      }
    });

    // Draw packets
    packets.forEach(packet => {
      drawPacket(ctx, packet);
    });

    // Draw selection rectangles for multi-selected nodes
    selectedNodes.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node && node.isVisible) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 / viewport.zoom;
        ctx.setLineDash([5 / viewport.zoom, 5 / viewport.zoom]);
        ctx.strokeRect(node.x - 2, node.y - 2, node.width + 4, node.height + 4);
        ctx.setLineDash([]);
      }
    });

    // Draw connection preview
    if (isConnecting && connectionStart && connectionPreview) {
      const startNode = nodes.find(n => n.id === connectionStart.nodeId);
      if (startNode) {
        let startX, startY;
        switch (connectionStart.handle) {
          case 'input':
            startX = startNode.x;
            startY = startNode.y + startNode.height / 2;
            break;
          case 'output':
            startX = startNode.x + startNode.width;
            startY = startNode.y + startNode.height / 2;
            break;
          case 'top':
            startX = startNode.x + startNode.width / 2;
            startY = startNode.y;
            break;
          case 'bottom':
            startX = startNode.x + startNode.width / 2;
            startY = startNode.y + startNode.height;
            break;
        }

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 / viewport.zoom;
        ctx.setLineDash([5 / viewport.zoom, 5 / viewport.zoom]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(connectionPreview.x, connectionPreview.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw preview endpoint
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(connectionPreview.x, connectionPreview.y, 4 / viewport.zoom, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Restore context
    ctx.restore();
  }, [nodes, edges, groups, packets, selectedNode, selectedEdge, selectedNodes, selectedGroup, viewport, isConnecting, connectionStart, connectionPreview, drawNode, drawEdge, drawGroup, drawPacket]);

  // Animation loop
  const animate = useCallback(() => {
    frameCountRef.current++;

    // Update packets
    setPackets(prev => {
      const updated = prev.map(packet => {
        const edge = edges.find(e => e.id === packet.edgeId);
        const config = animationConfigs[packet.edgeId];

        if (!edge || !config?.enabled) return null;

        const newProgress = packet.progress + packet.speed;

        if (newProgress >= 1) {
          return null; // Remove completed packet
        }

        const position = getPacketPosition(edge, newProgress);
        if (!position) return packet;

        return {
          ...packet,
          x: position.x,
          y: position.y,
          progress: newProgress
        };
      }).filter(Boolean) as Packet[];

      // Add new packets for active animations
      Object.entries(animationConfigs).forEach(([edgeId, config]) => {
        if (config.enabled && frameCountRef.current % config.frequency === 0) {
          const edge = edges.find(e => e.id === edgeId);
          if (edge) {
            const position = getPacketPosition(edge, 0);
            if (position) {
              updated.push({
                id: `packet-${Date.now()}-${Math.random()}`,
                x: position.x,
                y: position.y,
                progress: 0,
                color: config.color,
                size: config.size,
                shape: config.shape,
                edgeId,
                trail: config.trail,
                speed: config.speed
              });
            }
          }
        }
      });

      return updated;
    });

    render();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [render, edges, animationConfigs]);

  // Start animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  // Mouse event handlers
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    // Handle right-click context menu
    if (event.button === 2) {
      event.preventDefault();

      // Check if right-clicking on a group first
      for (const group of groups) {
        if (group.isVisible &&
            worldPos.x >= group.x && worldPos.x <= group.x + group.width &&
            worldPos.y >= group.y && worldPos.y <= group.y + group.height) {
          setContextMenu({
            x: event.clientX,
            y: event.clientY,
            type: 'group',
            targetId: group.id
          });
          return;
        }
      }

      // Check if right-clicking on a node
      for (const node of nodes) {
        if (node.isVisible &&
            worldPos.x >= node.x && worldPos.x <= node.x + node.width &&
            worldPos.y >= node.y && worldPos.y <= node.y + node.height) {
          setContextMenu({
            x: event.clientX,
            y: event.clientY,
            type: 'node',
            targetId: node.id
          });
          return;
        }
      }

      // Check if right-clicking on an edge
      for (const edge of edges) {
        if (!edge.isVisible) continue;
        const points = getConnectionPoints(edge);
        if (!points) continue;
        const { startX, startY, endX, endY } = points;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const distance = Math.sqrt(Math.pow(worldPos.x - midX, 2) + Math.pow(worldPos.y - midY, 2));
        if (distance < 40 / viewport.zoom) {
          setContextMenu({
            x: event.clientX,
            y: event.clientY,
            type: 'edge',
            targetId: edge.id
          });
          return;
        }
      }

      // Right-clicking on canvas
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'canvas'
      });
      return;
    }

    // Close context menu on any left click
    setContextMenu(null);

    // Middle mouse button for panning
    if (event.button === 1) {
      setIsPanning(true);
      setLastPanPoint({ x: screenX, y: screenY });
      return;
    }

    // Check for connection handles first
    for (const node of nodes) {
      if (!node.isVisible) continue;

      const handle = getClickedHandle(worldPos, node);
      if (handle) {
        if (isConnecting && connectionStart) {
          // Complete connection
          if (connectionStart.nodeId !== node.id) {
            // Allow connections between any handles (more flexible)
            createEdge(connectionStart.nodeId, node.id, connectionStart.handle, handle);
          }
          setIsConnecting(false);
          setConnectionStart(null);
          setConnectionPreview(null);
        } else {
          // Start connection
          setIsConnecting(true);
          setConnectionStart({ nodeId: node.id, handle });
          setConnectionPreview(worldPos);
        }
        return;
      }
    }

    // Check for group selection first (groups are behind nodes)
    for (const group of groups.slice().reverse()) { // Reverse to check top groups first
      if (group.isVisible &&
          worldPos.x >= group.x && worldPos.x <= group.x + group.width &&
          worldPos.y >= group.y && worldPos.y <= group.y + group.height) {

        // Check if clicking on collapse/expand button
        const indicatorSize = 12;
        const indicatorX = group.x + group.width - indicatorSize - 8;
        const indicatorY = group.y + 6;

        if (worldPos.x >= indicatorX && worldPos.x <= indicatorX + indicatorSize &&
            worldPos.y >= indicatorY && worldPos.y <= indicatorY + indicatorSize) {
          // Toggle collapse/expand
          setGroups(prev => prev.map(g =>
            g.id === group.id ? { ...g, isCollapsed: !g.isCollapsed } : g
          ));
          return;
        }

        // Check if clicking on a node within the group instead
        let clickedNode = false;
        for (const node of nodes) {
          if (node.isVisible &&
              worldPos.x >= node.x && worldPos.x <= node.x + node.width &&
              worldPos.y >= node.y && worldPos.y <= node.y + node.height) {
            clickedNode = true;
            break;
          }
        }

        if (!clickedNode) {
          // Select the group
          setSelectedGroup(group.id);
          setSelectedNode(null);
          setSelectedEdge(null);
          setSelectedNodes(new Set());
          return;
        }
      }
    }

    // Check for node selection
    for (const node of nodes) {
      if (node.isVisible &&
          worldPos.x >= node.x && worldPos.x <= node.x + node.width &&
          worldPos.y >= node.y && worldPos.y <= node.y + node.height) {

        // Cancel connection if clicking on node body
        if (isConnecting) {
          setIsConnecting(false);
          setConnectionStart(null);
          setConnectionPreview(null);
        }

        if (event.ctrlKey || event.metaKey) {
          // Multi-select with Ctrl
          const newSelected = new Set(selectedNodes);
          if (selectedNodes.has(node.id)) {
            newSelected.delete(node.id);
          } else {
            newSelected.add(node.id);
          }
          setSelectedNodes(newSelected);
        } else {
          setSelectedNode(node.id);
          setSelectedEdge(null);
          setSelectedGroup(null);
          setSelectedNodes(new Set([node.id]));
        }

        setDraggedNode(node.id);
        setDragOffset({ x: worldPos.x - node.x, y: worldPos.y - node.y });
        return;
      }
    }

    // Check for edge selection
    for (const edge of edges) {
      if (!edge.isVisible) continue;

      const points = getConnectionPoints(edge);
      if (!points) continue;

      const { startX, startY, endX, endY } = points;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      const distance = Math.sqrt(Math.pow(worldPos.x - midX, 2) + Math.pow(worldPos.y - midY, 2));
      if (distance < 40 / viewport.zoom) {
        setSelectedEdge(edge.id);
        setSelectedNode(null);
        setSelectedGroup(null);
        setSelectedNodes(new Set());
        return;
      }
    }

    if (!event.ctrlKey && !event.metaKey) {
      setSelectedNode(null);
      setSelectedEdge(null);
      setSelectedGroup(null);
      setSelectedNodes(new Set());
    }

    // Cancel connection if clicking on empty space
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
      setConnectionPreview(null);
    }

    // Start panning if left mouse button on empty space
    if (event.button === 0) {
      setIsPanning(true);
      setLastPanPoint({ x: screenX, y: screenY });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    // Update connection preview
    if (isConnecting && connectionStart) {
      setConnectionPreview(worldPos);
    }

    if (isPanning) {
      const deltaX = screenX - lastPanPoint.x;
      const deltaY = screenY - lastPanPoint.y;
      setViewport(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint({ x: screenX, y: screenY });
      return;
    }

    if (!draggedNode) return;

    const newX = worldPos.x - dragOffset.x;
    const newY = worldPos.y - dragOffset.y;

    // Snap to grid if enabled
    const gridSize = 20;
    const snappedX = Math.round(newX / gridSize) * gridSize;
    const snappedY = Math.round(newY / gridSize) * gridSize;

    setNodes(prev => prev.map(node =>
      node.id === draggedNode ? { ...node, x: snappedX, y: snappedY } : node
    ));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsPanning(false);
  };

  // Zoom with mouse wheel
  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, viewport.zoom * zoomFactor));

    // Zoom towards mouse position
    const worldPosBeforeZoom = screenToWorld(mouseX, mouseY);

    setViewport(prev => {
      const newViewport = { ...prev, zoom: newZoom };
      const worldPosAfterZoom = {
        x: (mouseX - newViewport.x) / newZoom,
        y: (mouseY - newViewport.y) / newZoom
      };

      return {
        ...newViewport,
        x: newViewport.x + (worldPosAfterZoom.x - worldPosBeforeZoom.x) * newZoom,
        y: newViewport.y + (worldPosAfterZoom.y - worldPosBeforeZoom.y) * newZoom
      };
    });
  };

  // Don't render complex UI until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading NexFlow</h2>
          <p className="text-gray-600">Preparing your diagram canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col min-h-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white z-20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">NexFlow</h2>
          </div>

          {/* Panel Tabs */}
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-2">
            {[
              { id: 'templates', label: 'Items', icon: Palette },
              { id: 'groups', label: 'Groups', icon: Layers },
              { id: 'animations', label: 'Animate', icon: Play },
              { id: 'nodes', label: 'Node', icon: Circle },
              { id: 'edges', label: 'Edge', icon: Settings },
              { id: 'controls', label: 'Controls', icon: HelpCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id as 'nodes' | 'edges' | 'animations' | 'templates' | 'groups' | 'controls')}
                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  activePanel === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {activePanel === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Node Templates</h3>
                <div className="text-xs text-gray-500">
                  {NODE_TEMPLATES.filter(template =>
                    template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    template.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    template.description.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length} / {NODE_TEMPLATES.length}
                </div>
              </div>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pl-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-2.5 top-2.5 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-600">
                Drag templates onto the canvas to create new nodes
              </p>

              <div className="grid grid-cols-2 gap-3">
                {NODE_TEMPLATES
                  .filter(template =>
                    template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    template.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    template.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((template) => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={template.type}
                      draggable
                      onDragStart={(e) => handleTemplateDragStart(template, e)}
                      className="group p-3 border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all"
                      style={{ borderLeftColor: template.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: template.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{template.label}</div>
                          <div className="text-xs text-gray-500 truncate">{template.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0 mt-0.5"></div>
                  <div className="text-xs text-blue-700">
                    <strong>Tip:</strong> Drag any template to the canvas to create a new node. You can customize colors, labels, and other properties in the Nodes panel.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePanel === 'animations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Animation Controls</h3>
                <div className="text-xs text-gray-500">{packets.length} active packets</div>
              </div>

              {edges.length === 0 && (
                <div className="text-center text-gray-500 py-6">
                  <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No connections available</p>
                  <p className="text-xs">Connect nodes to enable animations</p>
                </div>
              )}

              <div className="space-y-3">
                {edges.map(edge => {
                const config = animationConfigs[edge.id];
                if (!config) return null;

                return (
                  <div
                    key={edge.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedEdge === edge.id
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{edge.label}</div>
                        <div className="text-xs text-gray-500">
                          {getNode(edge.sourceId)?.label} → {getNode(edge.targetId)?.label}
                        </div>
                      </div>
                      <button
                        onClick={() => setAnimationConfigs(prev => ({
                          ...prev,
                          [edge.id]: { ...prev[edge.id], enabled: !prev[edge.id].enabled }
                        }))}
                        className={`p-2 rounded-md transition-colors ${
                          config.enabled
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {config.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>

                    {config.enabled && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Speed</label>
                          <input
                            type="range"
                            min="0.005"
                            max="0.05"
                            step="0.005"
                            value={config.speed}
                            onChange={(e) => setAnimationConfigs(prev => ({
                              ...prev,
                              [edge.id]: { ...prev[edge.id], speed: Number(e.target.value) }
                            }))}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                          <input
                            type="range"
                            min="20"
                            max="120"
                            step="10"
                            value={config.frequency}
                            onChange={(e) => setAnimationConfigs(prev => ({
                              ...prev,
                              [edge.id]: { ...prev[edge.id], frequency: Number(e.target.value) }
                            }))}
                            className="w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                            <input
                              type="range"
                              min="4"
                              max="16"
                              value={config.size}
                              onChange={(e) => setAnimationConfigs(prev => ({
                                ...prev,
                                [edge.id]: { ...prev[edge.id], size: Number(e.target.value) }
                              }))}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                            <input
                              type="color"
                              value={config.color}
                              onChange={(e) => setAnimationConfigs(prev => ({
                                ...prev,
                                [edge.id]: { ...prev[edge.id], color: e.target.value }
                              }))}
                              className="w-full h-8 border rounded"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-gray-700">Shape:</label>
                            <div className="flex gap-1">
                              {[
                                { shape: 'circle', icon: Circle },
                                { shape: 'square', icon: Square },
                                { shape: 'diamond', icon: Diamond },
                                { shape: 'triangle', icon: Triangle }
                              ].map(({ shape, icon: Icon }) => (
                                <button
                                  key={shape}
                                  onClick={() => setAnimationConfigs(prev => ({
                                    ...prev,
                                    [edge.id]: { ...prev[edge.id], shape: shape as 'circle' | 'square' | 'diamond' | 'triangle' }
                                  }))}
                                  className={`p-1 rounded transition-colors ${
                                    config.shape === shape
                                      ? 'bg-blue-100 text-blue-600'
                                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                  }`}
                                >
                                  <Icon className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={config.trail}
                              onChange={(e) => setAnimationConfigs(prev => ({
                                ...prev,
                                [edge.id]: { ...prev[edge.id], trail: e.target.checked }
                              }))}
                              className="rounded"
                            />
                            Trail
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            </div>
          )}

          {activePanel === 'nodes' && selectedNode && (
            <div className="space-y-4">
              {(() => {
                const node = nodes.find(n => n.id === selectedNode);
                if (!node) return null;

                return (
                  <>
                    <div className="flex items-center justify-between sticky top-0 bg-white pb-2 z-10">
                      <h3 className="text-sm font-semibold text-gray-900">Node Properties</h3>
                      <button
                        onClick={() => setNodes(prev => prev.map(n =>
                          n.id === selectedNode ? { ...n, isVisible: !n.isVisible } : n
                        ))}
                        className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                      >
                        {node.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                      <input
                        type="text"
                        value={node.label}
                        onChange={(e) => setNodes(prev => prev.map(n =>
                          n.id === selectedNode ? { ...n, label: e.target.value } : n
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                        <input
                          type="number"
                          value={node.width}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, width: Number(e.target.value) } : n
                          ))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                        <input
                          type="number"
                          value={node.height}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, height: Number(e.target.value) } : n
                          ))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Fill</label>
                        <input
                          type="color"
                          value={node.color}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, color: e.target.value } : n
                          ))}
                          className="w-full h-8 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Border</label>
                        <input
                          type="color"
                          value={node.borderColor}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, borderColor: e.target.value } : n
                          ))}
                          className="w-full h-8 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Text</label>
                        <input
                          type="color"
                          value={node.textColor}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, textColor: e.target.value } : n
                          ))}
                          className="w-full h-8 border rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Shape</label>
                      <select
                        value={node.shape}
                        onChange={(e) => setNodes(prev => prev.map(n =>
                          n.id === selectedNode ? { ...n, shape: e.target.value as 'rectangle' | 'rounded' | 'circle' | 'diamond' } : n
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="rectangle">Rectangle</option>
                        <option value="rounded">Rounded Rectangle</option>
                        <option value="circle">Circle</option>
                        <option value="diamond">Diamond</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                        <input
                          type="range"
                          min="10"
                          max="24"
                          value={node.fontSize}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, fontSize: Number(e.target.value) } : n
                          ))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{node.fontSize}px</span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Border Width</label>
                        <input
                          type="range"
                          min="0"
                          max="6"
                          value={node.borderWidth}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, borderWidth: Number(e.target.value) } : n
                          ))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{node.borderWidth}px</span>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={node.shadow}
                        onChange={(e) => setNodes(prev => prev.map(n =>
                          n.id === selectedNode ? { ...n, shadow: e.target.checked } : n
                        ))}
                        className="rounded"
                      />
                      Drop Shadow
                    </label>
                  </>
                );
              })()}
            </div>
          )}

          {activePanel === 'edges' && selectedEdge && (
            <div className="space-y-4">
              {(() => {
                const edge = edges.find(e => e.id === selectedEdge);
                if (!edge) return null;

                return (
                  <>
                    <div className="flex items-center justify-between sticky top-0 bg-white pb-2 z-10">
                      <h3 className="text-sm font-semibold text-gray-900">Edge Properties</h3>
                      <button
                        onClick={() => setEdges(prev => prev.map(e =>
                          e.id === selectedEdge ? { ...e, isVisible: !e.isVisible } : e
                        ))}
                        className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
                      >
                        {edge.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                      <input
                        type="text"
                        value={edge.label}
                        onChange={(e) => setEdges(prev => prev.map(ed =>
                          ed.id === selectedEdge ? { ...ed, label: e.target.value } : ed
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                        <input
                          type="color"
                          value={edge.color}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, color: e.target.value } : ed
                          ))}
                          className="w-full h-8 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
                        <select
                          value={edge.style}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, style: e.target.value as 'solid' | 'dashed' | 'dotted' } : ed
                          ))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={edge.width}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, width: Number(e.target.value) } : ed
                          ))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{edge.width}px</span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Curvature</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={edge.curvature}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, curvature: Number(e.target.value) } : ed
                          ))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{edge.curvature}</span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Arrow</label>
                        <input
                          type="range"
                          min="6"
                          max="20"
                          value={edge.arrowSize}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, arrowSize: Number(e.target.value) } : ed
                          ))}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{edge.arrowSize}px</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {activePanel === 'groups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Node Groups</h3>
                <div className="text-xs text-gray-500">{groups.length} groups</div>
              </div>

              {selectedNodes.size >= 2 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3">
                    {selectedNodes.size} nodes selected
                  </p>
                  <button
                    onClick={createGroupFromSelected}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
                  >
                    <Layers className="w-4 h-4" />
                    Create Group
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {groups.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No groups created</p>
                    <p className="text-xs text-gray-400">Select multiple nodes and click &quot;Create Group&quot;</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedGroup === group.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedGroup(group.id);
                        setSelectedNode(null);
                        setSelectedEdge(null);
                        setSelectedNodes(new Set());
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded border"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="text-sm font-medium">{group.label}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {group.nodeIds.length} nodes
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{Math.round(group.width)} × {Math.round(group.height)}</span>
                        {group.isCollapsed && <span className="text-orange-600">Collapsed</span>}
                      </div>

                      {selectedGroup === group.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setGroups(prev => prev.map(g =>
                                  g.id === group.id ? { ...g, isCollapsed: !g.isCollapsed } : g
                                ));
                              }}
                              className="flex-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                            >
                              {group.isCollapsed ? 'Expand' : 'Collapse'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                ungroupSelected();
                              }}
                              className="flex-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
                            >
                              Ungroup
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Controls Panel */}
          {activePanel === 'controls' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Keyboard Shortcuts</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Canvas Navigation</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pan canvas</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Click + drag</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Zoom in/out</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Mouse wheel</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reset view</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Ctrl + 0</kbd>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Node Operations</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Duplicate selection</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Ctrl + D</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delete selection</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Delete</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Group nodes</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Ctrl + G</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Multi-select</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Ctrl + click</kbd>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">File Operations</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Export JSON</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Ctrl + S</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Undo</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Ctrl + Z</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Redo</span>
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Ctrl + Y</kbd>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Mouse Controls</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Create connection</span>
                      <span className="text-gray-500 text-xs">Click node handles</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Add nodes</span>
                      <span className="text-gray-500 text-xs">Drag from sidebar</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Move nodes</span>
                      <span className="text-gray-500 text-xs">Click and drag</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <strong>Pro Tip:</strong> Press <kbd className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">?</kbd> or <kbd className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">F1</kbd> anytime to open the full help dialog with more detailed instructions.
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedNode && !selectedEdge && !selectedGroup && activePanel !== 'animations' && activePanel !== 'templates' && activePanel !== 'groups' && activePanel !== 'controls' && (
            <div className="text-center text-gray-500 py-12">
              <div className="mb-3">
                {activePanel === 'nodes' ? <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" /> : <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />}
              </div>
              <p className="text-sm">Select a {activePanel === 'nodes' ? 'node' : 'edge'}</p>
              <p className="text-xs text-gray-400">to customize its properties</p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0 space-y-2">
          <div className="text-xs text-gray-500 text-center">
            {nodes.length} nodes • {edges.length} connections
          </div>
          <button
            onClick={() => setPackets([])}
            disabled={packets.length === 0}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All Packets ({packets.length})
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Unified Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left Side - Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900">Architecture Diagram</h1>
            </div>

            {/* Right Side - All Controls */}
            <div className="flex items-center gap-2 ml-6">
              {/* Quick Node Creation */}
              <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                <button
                  onClick={() => createNodeFromTemplate(NODE_TEMPLATES.find(t => t.type === 'service')!, 100, 100)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  title="Add Service Node"
                >
                  <Server className="w-4 h-4" />
                </button>
                <button
                  onClick={() => createNodeFromTemplate(NODE_TEMPLATES.find(t => t.type === 'database')!, 150, 100)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  title="Add Database Node"
                >
                  <Database className="w-4 h-4" />
                </button>
                <button
                  onClick={() => createNodeFromTemplate(NODE_TEMPLATES.find(t => t.type === 'cloud')!, 200, 100)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  title="Add Cloud Service"
                >
                  <Cloud className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Actions */}
              <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-4 h-4" />
                </button>
                <button
                  onClick={duplicateSelected}
                  disabled={!selectedNode && selectedNodes.size === 0}
                  className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Duplicate Selection (Ctrl+D)"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={createGroupFromSelected}
                  disabled={selectedNodes.size < 2}
                  className="p-2 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-blue-600"
                  title="Group Selected Nodes (Ctrl+G)"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={deleteSelected}
                  disabled={!selectedNode && !selectedEdge && !selectedGroup && selectedNodes.size === 0}
                  className="p-2 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-red-600"
                  title="Delete Selection (Del)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                <button
                  onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }))}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom * 0.8) }))}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  title="Reset View (Ctrl+0)"
                >
                  <Maximize className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 px-2 min-w-[45px] text-center">
                  {Math.round(viewport.zoom * 100)}%
                </div>
              </div>

              {/* File Operations */}
              <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="p-2 rounded-md hover:bg-green-100 transition-colors text-green-600"
                  title="Save Diagram to Cloud"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    loadSavedDiagrams();
                    setShowLoadDialog(true);
                  }}
                  className="p-2 rounded-md hover:bg-blue-100 transition-colors text-blue-600"
                  title="Load Diagram from Cloud"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowTemplatesDialog(true)}
                  className="p-2 rounded-md hover:bg-purple-100 transition-colors text-purple-600"
                  title="Load Template Diagram"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                    if (dropdown) {
                      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                  style={{ display: 'none' }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                >
                  <button
                    onClick={exportAsPNG}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Image className="w-4 h-4" />
                    Export as PNG
                  </button>
                  <button
                    onClick={exportAsSVG}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Image className="w-4 h-4" />
                    Export as SVG
                  </button>
                  <button
                    onClick={exportAsJSON}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <FileJson className="w-4 h-4" />
                    Export as JSON
                  </button>
                  <label className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm cursor-pointer border-t border-gray-100">
                    <Save className="w-4 h-4" />
                    Import JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={importFromJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Help */}
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                title="Show Help (? key)"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Profile Menu"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700 max-w-[120px] truncate">
                    {user?.displayName || user?.email || 'User'}
                  </span>
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="Profile"
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.displayName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          // Navigate to dashboard
                          window.location.href = '/';
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                      >
                        <Palette className="w-4 h-4" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowHelp(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Help & Shortcuts
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          signOut(auth);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <X className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 ml-2">
                <div className="text-xs text-gray-600">
                  Packets: <span className="font-medium text-gray-900">{packets.length}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full bg-white ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Context Menu */}
          {contextMenu && (
            <div
              className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onMouseLeave={() => setContextMenu(null)}
            >
              {contextMenu.type === 'node' && (
                <>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (contextMenu.targetId) {
                        duplicateSelected();
                      }
                      setContextMenu(null);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Duplicate Node
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (contextMenu.targetId) {
                        setSelectedNode(contextMenu.targetId);
                        setSelectedNodes(new Set([contextMenu.targetId]));
                        deleteSelected();
                      }
                      setContextMenu(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Delete Node
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (contextMenu.targetId) {
                        const node = nodes.find(n => n.id === contextMenu.targetId);
                        if (node) {
                          setNodes(prev => prev.map(n =>
                            n.id === contextMenu.targetId ? { ...n, isVisible: !n.isVisible } : n
                          ));
                        }
                      }
                      setContextMenu(null);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    Toggle Visibility
                  </button>
                </>
              )}

              {contextMenu.type === 'edge' && (
                <>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (contextMenu.targetId) {
                        setSelectedEdge(contextMenu.targetId);
                        deleteSelected();
                      }
                      setContextMenu(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Delete Connection
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (contextMenu.targetId) {
                        setAnimationConfigs(prev => ({
                          ...prev,
                          [contextMenu.targetId!]: {
                            ...prev[contextMenu.targetId!],
                            enabled: !prev[contextMenu.targetId!]?.enabled
                          }
                        }));
                      }
                      setContextMenu(null);
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Toggle Animation
                  </button>
                </>
              )}

              {contextMenu.type === 'group' && (
                <>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (contextMenu.targetId) {
                        setSelectedGroup(contextMenu.targetId);
                        ungroupSelected();
                      }
                      setContextMenu(null);
                    }}
                  >
                    <Square className="w-4 h-4" />
                    Ungroup
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (contextMenu.targetId) {
                        setGroups(prev => prev.map(group =>
                          group.id === contextMenu.targetId
                            ? { ...group, isCollapsed: !group.isCollapsed }
                            : group
                        ));
                      }
                      setContextMenu(null);
                    }}
                  >
                    <Maximize className="w-4 h-4" />
                    Toggle Collapse
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (contextMenu.targetId) {
                        setGroups(prev => prev.map(group =>
                          group.id === contextMenu.targetId
                            ? { ...group, label: prompt('New group name:', group.label) || group.label }
                            : group
                        ));
                      }
                      setContextMenu(null);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    Rename Group
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      if (contextMenu.targetId) {
                        setSelectedGroup(contextMenu.targetId);
                        deleteSelected();
                      }
                      setContextMenu(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Delete Group
                  </button>
                </>
              )}

              {contextMenu.type === 'canvas' && (
                <>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      setViewport({ x: 0, y: 0, zoom: 1 });
                      setContextMenu(null);
                    }}
                  >
                    <Maximize className="w-4 h-4" />
                    Reset View
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      setPackets([]);
                      setContextMenu(null);
                    }}
                  >
                    <Square className="w-4 h-4" />
                    Clear Animations
                  </button>
                </>
              )}
            </div>
          )}

          {/* Help Panel Overlay */}
          {showHelp && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts & Help</h2>
                    <p className="text-sm text-gray-600">Master NexFlow with these shortcuts and tips</p>
                  </div>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Essential Shortcuts */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Essential Shortcuts</h3>
                      <div className="space-y-3">
                        {[
                          { keys: ['Ctrl', 'Z'], desc: 'Undo action' },
                          { keys: ['Ctrl', 'Y'], desc: 'Redo action' },
                          { keys: ['Ctrl', 'S'], desc: 'Export as JSON' },
                          { keys: ['Ctrl', 'D'], desc: 'Duplicate selection' },
                          { keys: ['Ctrl', 'G'], desc: 'Group selected nodes' },
                          { keys: ['Ctrl', '0'], desc: 'Reset zoom & pan' },
                          { keys: ['Del'], desc: 'Delete selection' },
                          { keys: ['?'], desc: 'Show this help' },
                          { keys: ['Esc'], desc: 'Close dialogs/cancel' }
                        ].map((shortcut, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <div className="flex gap-1">
                              {shortcut.keys.map((key, j) => (
                                <span key={j} className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                  {key}
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{shortcut.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mouse Controls */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Mouse Controls</h3>
                      <div className="space-y-3">
                        {[
                          { action: 'Left Click', desc: 'Select nodes/edges' },
                          { action: 'Ctrl + Click', desc: 'Multi-select nodes' },
                          { action: 'Right Click', desc: 'Context menu' },
                          { action: 'Click + Drag', desc: 'Pan canvas' },
                          { action: 'Mouse Wheel', desc: 'Zoom in/out' },
                          { action: 'Drag Templates', desc: 'Create new nodes' },
                          { action: 'Click Node Handles', desc: 'Create connections' },
                          { action: 'Click Minimap', desc: 'Navigate to area' }
                        ].map((control, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              {control.action}
                            </span>
                            <span className="text-sm text-gray-600">{control.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Node Operations */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Node Operations</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Creating Nodes:</strong> Drag templates from sidebar onto canvas</p>
                        <p><strong>Connecting Nodes:</strong> Click blue connection handles on node edges</p>
                        <p><strong>Moving Nodes:</strong> Drag nodes to reposition with grid snapping</p>
                        <p><strong>Grouping:</strong> Select multiple nodes and press Ctrl+G</p>
                        <p><strong>Editing:</strong> Select nodes to edit properties in sidebar</p>
                      </div>
                    </div>

                    {/* Canvas Navigation */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Canvas Navigation</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Zooming:</strong> Mouse wheel or toolbar zoom controls</p>
                        <p><strong>Panning:</strong> Click and drag on empty space or use minimap</p>
                        <p><strong>Reset View:</strong> Ctrl+0 or toolbar reset button</p>
                        <p><strong>Minimap:</strong> Click anywhere to jump to that location</p>
                        <p><strong>Grid Snapping:</strong> Nodes snap to 20px grid automatically</p>
                      </div>
                    </div>

                    {/* Animation Features */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Animation Features</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Packet Animations:</strong> Use Animate tab to configure flowing particles</p>
                        <p><strong>Shapes & Colors:</strong> Customize animation appearance</p>
                        <p><strong>Speed Control:</strong> Adjust animation timing and frequency</p>
                        <p><strong>Trail Effects:</strong> Enable particle trails for visual impact</p>
                      </div>
                    </div>

                    {/* Group Management */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Group Management</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Creating Groups:</strong> Select 2+ nodes and use Ctrl+G</p>
                        <p><strong>Collapse/Expand:</strong> Click +/- button on group</p>
                        <p><strong>Ungrouping:</strong> Right-click group or use Groups tab</p>
                        <p><strong>Group Properties:</strong> Use Groups tab to manage all groups</p>
                      </div>
                    </div>
                  </div>

                  {/* Tips Section */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-3 text-blue-900">💡 Pro Tips</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                      <p>• Use Ctrl+Click for multi-selection</p>
                      <p>• Right-click for context menus</p>
                      <p>• Groups help organize complex diagrams</p>
                      <p>• Export JSON to save your work</p>
                      <p>• Use search to find specific templates</p>
                      <p>• Minimap makes navigation easier</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Press <kbd className="px-2 py-1 bg-gray-200 rounded">?</kbd> or <kbd className="px-2 py-1 bg-gray-200 rounded">F1</kbd> to toggle this help
                    </div>
                    <button
                      onClick={() => setShowHelp(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Dialog */}
          {showSaveDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Save Diagram</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const name = formData.get('name') as string;
                    const description = formData.get('description') as string;
                    if (name.trim()) {
                      saveDiagram(name.trim(), description.trim());
                    }
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Diagram Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="My Architecture Diagram"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description (optional)
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Brief description of your diagram..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowSaveDialog(false)}
                        className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Load Dialog */}
          {showLoadDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] mx-4">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Load Diagram</h2>
                    <button
                      onClick={() => setShowLoadDialog(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading diagrams...</p>
                    </div>
                  ) : savedDiagrams.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No saved diagrams found</p>
                      <p className="text-sm text-gray-400">Create and save your first diagram!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedDiagrams.map((diagram) => (
                        <div
                          key={diagram.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{diagram.title}</h3>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>{diagram.nodes?.length || 0} nodes</span>
                                <span>{diagram.edges?.length || 0} connections</span>
                                <span>{diagram.groups?.length || 0} groups</span>
                                <span>
                                  {diagram.createdAt || 'Unknown date'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => loadDiagram(diagram.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              >
                                Load
                              </button>
                              <button
                                onClick={() => deleteDiagram(diagram.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Templates Dialog */}
          {showTemplatesDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] mx-4">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Diagram Templates</h2>
                      <p className="text-sm text-gray-600">Start with a pre-built architecture pattern</p>
                    </div>
                    <button
                      onClick={() => setShowTemplatesDialog(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DIAGRAM_TEMPLATES.map((template) => (
                      <div
                        key={template.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => loadTemplate(template.id)}
                      >
                        {/* Template Preview */}
                        <div className="h-32 bg-gradient-to-br from-purple-50 to-blue-50 p-4 flex items-center justify-center relative">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                              {template.category === 'Architecture' && <Server className="w-8 h-8 text-purple-600" />}
                              {template.category === 'Cloud' && <Cloud className="w-8 h-8 text-purple-600" />}
                              {template.category === 'Network' && <Network className="w-8 h-8 text-purple-600" />}
                            </div>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {template.category}
                            </span>
                          </div>
                        </div>

                        {/* Template Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <span>{template.nodes.length} nodes</span>
                              <span>{template.edges.length} connections</span>
                              {template.groups.length > 0 && <span>{template.groups.length} groups</span>}
                            </div>
                            <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                              Use
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Section */}
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Create Your Own</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer"
                        onClick={() => {
                          // Clear everything for blank canvas
                          setNodes([]);
                          setEdges([]);
                          setGroups([]);
                          setAnimationConfigs({});
                          setSelectedNode(null);
                          setSelectedEdge(null);
                          setSelectedGroup(null);
                          setSelectedNodes(new Set());
                          setViewport({ x: 0, y: 0, zoom: 1 });
                          saveToHistory();
                          setShowTemplatesDialog(false);
                        }}
                      >
                        <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <h4 className="font-medium text-gray-900">Blank Canvas</h4>
                        <p className="text-sm text-gray-600">Start from scratch</p>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-6 text-center bg-white">
                        <FileJson className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <h4 className="font-medium text-gray-900">Import JSON</h4>
                        <p className="text-sm text-gray-600 mb-3">Load exported diagram</p>
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          id="import-json"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                try {
                                  const data = JSON.parse(event.target?.result as string);
                                  if (data.nodes && data.edges) {
                                    setNodes(data.nodes || []);
                                    setEdges(data.edges || []);
                                    setGroups(data.groups || []);
                                    setAnimationConfigs(data.animationConfigs || {});
                                    setViewport({ x: 0, y: 0, zoom: 1 });
                                    saveToHistory();
                                    setShowTemplatesDialog(false);
                                    alert('Diagram imported successfully!');
                                  }
                                } catch (error) {
                                  alert('Invalid JSON file');
                                }
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="import-json"
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          Choose File
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Minimap */}
          <div className="absolute bottom-6 right-6 w-48 h-36 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-10">
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-1">
                <MousePointer className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Minimap</span>
              </div>
            </div>
            <div
              className="relative w-full h-28 bg-gradient-to-br from-blue-50 to-gray-100 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // Convert minimap coordinates to world coordinates
                const scale = 0.08;
                const worldX = (clickX - 4) / scale;
                const worldY = (clickY - 4) / scale;

                // Center the viewport on the clicked position
                const canvasRect = canvasRef.current?.getBoundingClientRect();
                if (canvasRect) {
                  setViewport(prev => ({
                    ...prev,
                    x: canvasRect.width / 2 - worldX * prev.zoom,
                    y: canvasRect.height / 2 - worldY * prev.zoom
                  }));
                }
              }}
            >
              {/* Minimap nodes */}
              {nodes.filter(node => node.isVisible).map(node => {
                const scale = 0.08; // Scale factor for minimap
                const minimapX = node.x * scale + 4;
                const minimapY = node.y * scale + 4;
                const minimapWidth = Math.max(4, node.width * scale);
                const minimapHeight = Math.max(4, node.height * scale);

                return (
                  <div
                    key={node.id}
                    className="absolute rounded-sm border"
                    style={{
                      left: `${minimapX}px`,
                      top: `${minimapY}px`,
                      width: `${minimapWidth}px`,
                      height: `${minimapHeight}px`,
                      backgroundColor: node.color,
                      borderColor: node.borderColor,
                      opacity: selectedNodes.has(node.id) || selectedNode === node.id ? 1 : 0.7
                    }}
                  />
                );
              })}

              {/* Viewport indicator */}
              <div
                className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-20 rounded"
                style={{
                  left: `${Math.max(0, -viewport.x * 0.08 + 4)}px`,
                  top: `${Math.max(0, -viewport.y * 0.08 + 4)}px`,
                  width: `${Math.min(180, 1000 * 0.08 / viewport.zoom)}px`,
                  height: `${Math.min(108, 700 * 0.08 / viewport.zoom)}px`
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModernDiagramCanvas;