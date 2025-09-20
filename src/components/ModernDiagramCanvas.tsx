"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Palette, Settings, Play, Pause, Square, Circle, Diamond, Triangle, Eye, EyeOff, Download, Save, Undo, Redo, FileJson, Image, ZoomIn, ZoomOut, Maximize, MousePointer, Database, Server, Cloud, Globe, Shield, Cpu, HardDrive, Network, Smartphone, Monitor, Layers, Zap, Lock, Users, Trash2, Plus } from 'lucide-react';

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
  icon: React.ComponentType<any>;
  description: string;
}

interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
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

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
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

  // Transform coordinates from world to screen space
  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    return {
      x: worldX * viewport.zoom + viewport.x,
      y: worldY * viewport.zoom + viewport.y
    };
  }, [viewport]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activePanel, setActivePanel] = useState<'nodes' | 'edges' | 'animations' | 'templates'>('templates');
  const [draggedTemplate, setDraggedTemplate] = useState<NodeTemplate | null>(null);

  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; handle: 'input' | 'output' } | null>(null);
  const [connectionPreview, setConnectionPreview] = useState<{ x: number; y: number } | null>(null);

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
      setSelectedNodes(new Set());
      setSelectedNode(null);
    } else if (selectedNode) {
      // Delete single selected node
      setNodes(prev => prev.filter(node => node.id !== selectedNode));
      // Delete edges connected to deleted node
      setEdges(prev => prev.filter(edge =>
        edge.sourceId !== selectedNode && edge.targetId !== selectedNode
      ));
      setSelectedNode(null);
    } else if (selectedEdge) {
      // Delete selected edge
      setEdges(prev => prev.filter(edge => edge.id !== selectedEdge));
      setSelectedEdge(null);
    }
    saveToHistory();
  }, [selectedNodes, selectedNode, selectedEdge, saveToHistory]);

  // Create edge between nodes
  const createEdge = useCallback((sourceId: string, targetId: string) => {
    const newEdge: Edge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceId,
      targetId,
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, exportAsJSON, duplicateSelected, deleteSelected]);

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

  const animationFrameRef = useRef<number>();
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

    return {
      startX: source.x + source.width,
      startY: source.y + source.height / 2,
      endX: target.x,
      endY: target.y + target.height / 2
    };
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

    // Selection highlight
    if (isSelected) {
      ctx.fillStyle = '#3b82f6';
      ctx.globalAlpha = 0.2;
      const padding = 4;

      if (shape === 'circle') {
        const radius = Math.max(width, height) / 2 + padding;
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        ctx.fillRect(x - padding, y - padding, width + padding * 2, height + padding * 2);
      }
      ctx.globalAlpha = 1;
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
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.fontWeight = '600';
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

    // Draw edges
    edges.forEach(edge => {
      drawEdge(ctx, edge, edge.id === selectedEdge);
    });

    // Draw nodes
    nodes.forEach(node => {
      drawNode(ctx, node, node.id === selectedNode);
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
        const startX = connectionStart.handle === 'output'
          ? startNode.x + startNode.width
          : startNode.x;
        const startY = startNode.y + startNode.height / 2;

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
  }, [nodes, edges, packets, selectedNode, selectedEdge, selectedNodes, viewport, isConnecting, connectionStart, connectionPreview, drawNode, drawEdge, drawPacket]);

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

    // Middle mouse button or Space+click for panning
    if (event.button === 1 || (event.button === 0 && event.spaceKey)) {
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
            if (connectionStart.handle === 'output' && handle === 'input') {
              createEdge(connectionStart.nodeId, node.id);
            } else if (connectionStart.handle === 'input' && handle === 'output') {
              createEdge(node.id, connectionStart.nodeId);
            }
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
        setSelectedNodes(new Set());
        return;
      }
    }

    if (!event.ctrlKey && !event.metaKey) {
      setSelectedNode(null);
      setSelectedEdge(null);
      setSelectedNodes(new Set());
    }

    // Cancel connection if clicking on empty space
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
      setConnectionPreview(null);
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
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col min-h-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white z-20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">NexFlow</h2>
          </div>

          {/* Panel Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            {[
              { id: 'templates', label: 'Items', icon: Palette },
              { id: 'animations', label: 'Animate', icon: Play },
              { id: 'nodes', label: 'Nodes', icon: Circle },
              { id: 'edges', label: 'Edge', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id as any)}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
                <div className="text-xs text-gray-500">{NODE_TEMPLATES.length} available</div>
              </div>

              <p className="text-xs text-gray-600">
                Drag templates onto the canvas to create new nodes
              </p>

              <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                {NODE_TEMPLATES.map((template) => {
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

              <div className="space-y-3 max-h-96 overflow-y-auto">
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
                                    [edge.id]: { ...prev[edge.id], shape: shape as any }
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
            <div className="space-y-4 max-h-96 overflow-y-auto">
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
                          n.id === selectedNode ? { ...n, shape: e.target.value as any } : n
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
            <div className="space-y-4 max-h-96 overflow-y-auto">
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
                          onChange={(e) => setEdges(prev => prev.map(e =>
                            e.id === selectedEdge ? { ...e, color: e.target.value } : e
                          ))}
                          className="w-full h-8 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
                        <select
                          value={edge.style}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, style: e.target.value as any } : ed
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
                          onChange={(e) => setEdges(prev => prev.map(e =>
                            e.id === selectedEdge ? { ...e, width: Number(e.target.value) } : e
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
                          onChange={(e) => setEdges(prev => prev.map(e =>
                            e.id === selectedEdge ? { ...e, curvature: Number(e.target.value) } : e
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
                          onChange={(e) => setEdges(prev => prev.map(e =>
                            e.id === selectedEdge ? { ...e, arrowSize: Number(e.target.value) } : e
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

          {!selectedNode && !selectedEdge && activePanel !== 'animations' && activePanel !== 'templates' && (
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
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Architecture Diagram</h1>
              <p className="text-sm text-gray-600">Drag templates to add nodes • Click handles to connect • Select and delete items • Mouse wheel to zoom • Ctrl+D to duplicate</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Export Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
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

              {/* Undo/Redo */}
              <div className="flex items-center gap-1">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-4 h-4" />
                </button>
              </div>

              {/* Delete Button */}
              <button
                onClick={deleteSelected}
                disabled={!selectedNode && !selectedEdge && selectedNodes.size === 0}
                className="p-2 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-red-600 hover:text-red-700"
                title="Delete (Del)"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }))}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom * 0.8) }))}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Reset View (Ctrl+0)"
                >
                  <Maximize className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 px-2">
                  {Math.round(viewport.zoom * 100)}%
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Packets: <span className="font-medium text-gray-900">{packets.length}</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full bg-white cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
          />

          {/* Minimap */}
          <div className="absolute bottom-6 right-6 w-48 h-36 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-10">
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-1">
                <MousePointer className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Minimap</span>
              </div>
            </div>
            <div className="relative w-full h-28 bg-gradient-to-br from-blue-50 to-gray-100">
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

          {/* Help overlay */}
          <div className="absolute top-6 left-6 bg-white bg-opacity-90 rounded-lg p-3 shadow-sm text-xs text-gray-600 max-w-64 z-10">
            <div className="font-medium mb-2">Controls:</div>
            <div className="space-y-1">
              <div>• <span className="font-medium">Drag templates:</span> Add nodes</div>
              <div>• <span className="font-medium">Click handles:</span> Connect nodes</div>
              <div>• <span className="font-medium">Mouse wheel:</span> Zoom</div>
              <div>• <span className="font-medium">Middle click + drag:</span> Pan</div>
              <div>• <span className="font-medium">Ctrl+click:</span> Multi-select</div>
              <div>• <span className="font-medium">Delete key:</span> Remove items</div>
              <div>• <span className="font-medium">Ctrl+D:</span> Duplicate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDiagramCanvas;