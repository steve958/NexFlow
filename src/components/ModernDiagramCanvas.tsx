"use client";
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Play, Pause, Square, Circle, Diamond, Triangle, Eye, EyeOff, Download, Save, Undo, Redo, FileJson, Image, ZoomIn, ZoomOut, Maximize, MousePointer, Database, Server, Cloud, Globe, Shield, Cpu, HardDrive, Network, Smartphone, Monitor, Layers, Zap, Trash2, Plus, HelpCircle, X, FolderOpen, Edit, Lock, Mail, Search, BarChart3, Settings2, GitBranch, FileText, Calendar, Users, MessageSquare, Workflow, Container, Route, Radio, Timer, Bell, Key, Code2, ArrowRight, CheckCircle, Video, PanelLeftClose, PanelLeftOpen, ServerCog } from 'lucide-react';
import NextImage from 'next/image';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firestoreClient';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDocs, collection, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { getUserProfile, createOrUpdateUserProfile, updateUserDisplayName, getUserStats, UserProfile, UserStats } from '@/lib/userStorage';
import { autoLayout, layoutPresets, LayoutNode, LayoutEdge } from '@/lib/autoLayout';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { CustomNodeBuilder, CustomNodeTemplate } from './CustomNodeBuilder';
import { DiagramExporter, downloadFile, convertPNGtoJPG } from '@/lib/exportUtils';
import { useCanvasTheme } from './CanvasThemeProvider';
import { CanvasThemeToggle } from './CanvasThemeToggle';
import ConfirmationModal from './ConfirmationModal';
import UnsavedChangesModal from './UnsavedChangesModal';
import { VideoExportPanel } from './VideoExportPanel';

interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  description?: string;
  type: 'service' | 'server' | 'database' | 'queue' | 'gateway' | 'custom' | 'cloud' | 'api' | 'endpoint' | 'security' | 'storage' | 'compute' | 'network' | 'frontend' | 'mobile' | 'monitor' | 'cache' | 'auth' | 'email' | 'search' | 'analytics' | 'config' | 'cicd' | 'docs' | 'scheduler' | 'users' | 'chat' | 'workflow' | 'container' | 'router' | 'streaming' | 'timer' | 'notification' | 'secrets' | 'code';
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
  bidirectional: boolean;
  bounce: boolean;
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
  direction: 'forward' | 'reverse';
  isBouncing: boolean;
  hasBouncedOnce: boolean;
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
    type: 'server',
    label: 'On-Premise Server',
    color: '#475569',
    borderColor: '#334155',
    icon: ServerCog,
    description: 'Physical or on-premise server'
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
    type: 'endpoint',
    label: 'API Endpoint',
    color: '#6366f1',
    borderColor: '#4f46e5',
    icon: Route,
    description: 'API endpoint or service endpoint'
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
  },
  {
    type: 'cache',
    label: 'Cache',
    color: '#f59e0b',
    borderColor: '#d97706',
    icon: Layers,
    description: 'Redis, Memcached, or other cache'
  },
  {
    type: 'auth',
    label: 'Authentication',
    color: '#dc2626',
    borderColor: '#b91c1c',
    icon: Lock,
    description: 'Auth service, OAuth, or SSO'
  },
  {
    type: 'email',
    label: 'Email Service',
    color: '#2563eb',
    borderColor: '#1d4ed8',
    icon: Mail,
    description: 'Email service or SMTP'
  },
  {
    type: 'search',
    label: 'Search Engine',
    color: '#059669',
    borderColor: '#047857',
    icon: Search,
    description: 'Elasticsearch, Solr, or search service'
  },
  {
    type: 'analytics',
    label: 'Analytics',
    color: '#7c3aed',
    borderColor: '#6d28d9',
    icon: BarChart3,
    description: 'Analytics or metrics collection'
  },
  {
    type: 'config',
    label: 'Configuration',
    color: '#64748b',
    borderColor: '#475569',
    icon: Settings2,
    description: 'Config service or environment settings'
  },
  {
    type: 'cicd',
    label: 'CI/CD Pipeline',
    color: '#16a34a',
    borderColor: '#15803d',
    icon: GitBranch,
    description: 'Continuous integration/deployment'
  },
  {
    type: 'docs',
    label: 'Documentation',
    color: '#0891b2',
    borderColor: '#0e7490',
    icon: FileText,
    description: 'Documentation or wiki'
  },
  {
    type: 'scheduler',
    label: 'Task Scheduler',
    color: '#ea580c',
    borderColor: '#c2410c',
    icon: Calendar,
    description: 'Cron jobs, scheduled tasks'
  },
  {
    type: 'users',
    label: 'User Management',
    color: '#db2777',
    borderColor: '#be185d',
    icon: Users,
    description: 'User service or directory'
  },
  {
    type: 'chat',
    label: 'Chat/Messaging',
    color: '#0d9488',
    borderColor: '#0f766e',
    icon: MessageSquare,
    description: 'Chat, messaging, or communication'
  },
  {
    type: 'workflow',
    label: 'Workflow Engine',
    color: '#7c2d12',
    borderColor: '#92400e',
    icon: Workflow,
    description: 'Workflow orchestration or automation'
  },
  {
    type: 'container',
    label: 'Container',
    color: '#1e40af',
    borderColor: '#1e3a8a',
    icon: Container,
    description: 'Docker container or K8s pod'
  },
  {
    type: 'router',
    label: 'Router/Proxy',
    color: '#be123c',
    borderColor: '#9f1239',
    icon: Route,
    description: 'Network router or reverse proxy'
  },
  {
    type: 'streaming',
    label: 'Event Streaming',
    color: '#a21caf',
    borderColor: '#86198f',
    icon: Radio,
    description: 'Kafka, EventBridge, or streaming'
  },
  {
    type: 'timer',
    label: 'Timer Service',
    color: '#dc2626',
    borderColor: '#b91c1c',
    icon: Timer,
    description: 'Timer, timeout, or delay service'
  },
  {
    type: 'notification',
    label: 'Notifications',
    color: '#f59e0b',
    borderColor: '#d97706',
    icon: Bell,
    description: 'Push notifications or alerts'
  },
  {
    type: 'secrets',
    label: 'Secrets Manager',
    color: '#374151',
    borderColor: '#1f2937',
    icon: Key,
    description: 'Secret storage, vault, or key management'
  },
  {
    type: 'code',
    label: 'Code Repository',
    color: '#4338ca',
    borderColor: '#3730a3',
    icon: Code2,
    description: 'Git repository or source code'
  }
];

interface ModernDiagramCanvasProps {
  projectId?: string;
}

const ModernDiagramCanvas = ({ projectId }: ModernDiagramCanvasProps) => {
  // Mobile UI state (layout-only; no logic changes)
  const [isMobileOverflowOpen, setIsMobileOverflowOpen] = useState(false);

  const { isDark } = useCanvasTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layoutButtonRef = useRef<HTMLButtonElement>(null);

  // Theme-aware style helpers - enhanced light mode with shadows and borders
  const getThemeStyles = () => ({
    background: isDark ? 'bg-white/5' : 'bg-white/95 shadow-md border border-gray-200/70 backdrop-blur-sm',
    border: isDark ? 'border-white/10' : 'border-gray-200/80',
    borderHover: isDark ? 'hover:border-teal-400/50' : 'hover:border-blue-300/80 hover:shadow-lg',
    text: isDark ? 'text-white' : 'text-gray-800',
    textSecondary: isDark ? 'text-white/70' : 'text-gray-600',
    textTertiary: isDark ? 'text-white/50' : 'text-gray-500',
    textBold: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-white/70' : 'text-gray-500',
    textOnColor: isDark ? 'text-teal-300' : 'text-blue-600',
    hoverBg: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50 hover:shadow-sm',
    activeBg: isDark ? 'bg-gradient-to-br from-teal-500 to-blue-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm',
    inputBg: isDark ? 'bg-white/5' : 'bg-white shadow-sm',
    inputBorder: isDark ? 'border-white/20' : 'border-gray-200/80',
    inputText: isDark ? 'text-white' : 'text-gray-800',
    placeholder: isDark ? 'placeholder-white/50' : 'placeholder-gray-400',
  });

  // History management for undo/redo
  const [history, setHistory] = useState<DiagramState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);
  const [nodes, setNodes] = useState<Node[]>([]);

  const [edges, setEdges] = useState<Edge[]>([]);

  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // User state - Firebase authentication
  const [user, setUser] = useState<User | null>(null);

  // Project state
  const [currentProjectName, setCurrentProjectName] = useState<string>('Architecture Diagram');

  // Groups state
  const [groups, setGroups] = useState<NodeGroup[]>([]);

  // Load project data when projectId changes
  useEffect(() => {
    if (projectId) {
      const loadProject = async () => {
        try {
          // Handle demo project specially
          if (projectId === 'demo') {
            setCurrentProjectName('Demo Architecture');
            setActivePanel('nodes');
            return;
          }

          const { getProject } = await import('@/lib/projectStorage');
          const project = await getProject(projectId);

          if (project && project.data) {
            // Set current project name
            setCurrentProjectName(project.name || 'Architecture Diagram');

            // Load project data into the canvas
            if (project.data.nodes && Array.isArray(project.data.nodes) && project.data.nodes.length > 0) {
              // Ensure all nodes have required properties for rendering
              const processedNodes = project.data.nodes.map((node) => ({
                ...node,
                isVisible: true, // Ensure nodes are visible
                fontSize: node.fontSize || 12,
                borderWidth: node.borderWidth || 2,
                shadow: node.shadow !== false, // Default to true unless explicitly false
                textColor: node.textColor || '#ffffff'
              })) as Node[];

              setNodes(processedNodes);
            } else {
              setNodes([]);
            }

            if (project.data.edges && Array.isArray(project.data.edges)) {
              // Ensure all edges have required properties for rendering
              const processedEdges = project.data.edges.map((edge) => ({
                ...edge,
                isVisible: true, // KEY FIX: Ensure edges are visible
                width: edge.width ?? 2,
                style: edge.style ?? 'solid',
                animated: edge.animated ?? false,
                bidirectional: edge.bidirectional ?? false,
                bounce: edge.bounce ?? false,
                curvature: edge.curvature ?? 0.5
              })) as Edge[];

              setEdges(processedEdges);
            } else {
              setEdges([]);
            }

            // Load groups from project data
            if (project.data.groups && Array.isArray(project.data.groups)) {
              const processedGroups = project.data.groups.map((group) => ({
                ...group,
                isVisible: group.isVisible !== false, // Ensure groups are visible
                isCollapsed: group.isCollapsed || false,
                padding: group.padding || 20
              }));
              setGroups(processedGroups);
            } else {
              setGroups([]);
            }

            // Load animation configs from project data
            if (project.data.animationConfigs) {
              setAnimationConfigs(project.data.animationConfigs);
            } else {
              setAnimationConfigs({});
            }

            // Switch to nodes panel when a project is loaded
            setActivePanel('nodes');
            // Reset viewport to ensure nodes are visible
            setViewport({ x: 0, y: 0, zoom: 1 });
            // Mark as saved when project is loaded
            setHasUnsavedChanges(false);
          } else {
            // If no project found, stay on templates panel
            setCurrentProjectName('Architecture Diagram');
            setActivePanel('templates');
          }
        } catch (error) {
          console.error('Error loading project:', error);
          setCurrentProjectName('Architecture Diagram');
          setActivePanel('templates');
        }
      };

      loadProject();
    } else {
      // If no projectId, show templates by default
      setCurrentProjectName('Architecture Diagram');
      setActivePanel('templates');
    }
  }, [projectId]);

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
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activePanel, setActivePanel] = useState<'nodes' | 'edges' | 'animations' | 'templates' | 'groups' | 'controls'>('templates');
  const [draggedTemplate, setDraggedTemplate] = useState<NodeTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCustomNodeBuilder, setShowCustomNodeBuilder] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [exportMenuPosition, setExportMenuPosition] = useState({ top: 0, right: 0 });
  const [profileMenuPosition, setProfileMenuPosition] = useState({ top: 0, right: 0 });

  // Load state
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedDiagrams, setSavedDiagrams] = useState<{ id: string; title: string; nodes: Node[]; edges: Edge[]; groups: NodeGroup[]; animationConfigs: Record<string, AnimationConfig>; createdAt: string | { toDate: () => Date } }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Templates state
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [customNodeTemplates, setCustomNodeTemplates] = useState<CustomNodeTemplate[]>([]);

  // Profile settings state
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');

  // Viewport width state for responsive breakpoint
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);

  // Auto-layout state
  const [isLayouting, setIsLayouting] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const lastSaveTimeRef = useRef<number>(Date.now()); // Initialize to now to prevent initial unsaved marking
  const saveToHistoryRef = useRef<(() => void) | undefined>(undefined);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Export state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'pdf' | 'jpg'>('png');
  const [exportOptions, setExportOptions] = useState({
    scale: 2,
    quality: 0.95,
    includeBackground: true,
    includeGrid: false,
    includeBranding: true,
    theme: 'current' as 'current' | 'light' | 'dark'
  });

  // Video export state
  const [showVideoExportPanel, setShowVideoExportPanel] = useState(false);


  // Performance monitoring state
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  const [performanceStats, setPerformanceStats] = useState({
    totalNodes: 0,
    visibleNodes: 0,
    totalEdges: 0,
    visibleEdges: 0,
    totalGroups: 0,
    visibleGroups: 0,
    lastRenderTime: 0
  });

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
  // Derive allAnimationsRunning from animationConfigs
  const allAnimationsRunning = Object.values(animationConfigs).some(config => config.enabled);

  // Show notification function
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // Handle actions that might require saving
  const handleActionWithSaveCheck = useCallback((action: () => void) => {
    if (hasUnsavedChanges && projectId && projectId !== 'demo') {
      setPendingAction(() => action);
      setShowUnsavedModal(true);
    } else {
      action();
    }
  }, [hasUnsavedChanges, projectId]);

  // Save and continue with pending action
  const saveAndContinue = useCallback(async () => {
    if (projectId && projectId !== 'demo') {
      setIsSaving(true);
      try {
        await autoSaveToFirestore();
        lastSaveTimeRef.current = Date.now();
        setHasUnsavedChanges(false);
        showNotification('Project saved successfully!', 'success');
      } catch (error) {
        console.error('Error saving project:', error);
        showNotification('Failed to save project. Please try again.', 'error');
        setShowUnsavedModal(false);
        setPendingAction(null);
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    setShowUnsavedModal(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [projectId, showNotification, pendingAction]);

  // Don't save and continue with pending action
  const discardChangesAndContinue = useCallback(() => {
    setShowUnsavedModal(false);
    setHasUnsavedChanges(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  // Auto-save to Firestore
  const autoSaveToFirestore = useCallback(async () => {
    if (!projectId || projectId === 'demo') {
      return; // Don't save demo project
    }

    try {
      const { saveProjectData } = await import('@/lib/projectStorage');
      await saveProjectData(projectId, {
        nodes,
        edges,
        groups,
        viewport,
        animationConfigs
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [projectId, nodes, edges, groups, viewport, animationConfigs]);

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

    // Mark as having unsaved changes (but not if we recently saved)
    const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
    if (timeSinceLastSave > 1000) { // Only mark as unsaved if more than 1 second has passed since last save
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges, groups, animationConfigs, historyIndex]);

  // Update ref to latest saveToHistory function
  saveToHistoryRef.current = saveToHistory;

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

  // Auto-layout functions
  const applyAutoLayout = useCallback(async (layoutType: string) => {
    if (nodes.length === 0) return;

    setIsLayouting(true);

    try {
      // Convert our nodes to layout format
      const layoutNodes: LayoutNode[] = nodes.map(node => ({
        id: node.id,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        label: node.label,
        type: node.type,
      }));

      // Convert our edges to layout format
      const layoutEdges: LayoutEdge[] = edges.map(edge => ({
        id: edge.id,
        from: edge.sourceId,
        to: edge.targetId,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }));

      // Apply layout
      const layoutOptions = layoutPresets[layoutType] || layoutPresets.horizontal;
      const layoutedNodes = await autoLayout(layoutNodes, layoutEdges, layoutOptions);

      // Update nodes with new positions
      const updatedNodes = nodes.map(node => {
        const layoutedNode = layoutedNodes.find(ln => ln.id === node.id);
        if (layoutedNode) {
          return {
            ...node,
            x: layoutedNode.x,
            y: layoutedNode.y,
          };
        }
        return node;
      });

      setNodes(updatedNodes);
      saveToHistory();
      setShowLayoutMenu(false);
    } catch (error) {
      console.error('Auto-layout failed:', error);
    } finally {
      setIsLayouting(false);
    }
  }, [nodes, edges, saveToHistory]);

  // Custom node template handlers
  const handleSaveCustomNodeTemplate = useCallback((template: CustomNodeTemplate) => {
    setCustomNodeTemplates(prev => [...prev, template]);

    // Save to localStorage for persistence
    const updatedTemplates = [...customNodeTemplates, template];
    localStorage.setItem('nexflow-custom-node-templates', JSON.stringify(updatedTemplates));

  }, [customNodeTemplates]);

  // Load custom templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nexflow-custom-node-templates');
    if (saved) {
      try {
        const templates = JSON.parse(saved);
        setCustomNodeTemplates(templates);
      } catch (error) {
        console.error('Failed to load custom node templates:', error);
      }
    }
  }, []);

  // Combine built-in and custom templates
  const allNodeTemplates = useMemo(() => {
    const customTemplatesAsNodeTemplates = customNodeTemplates.map(template => ({
      type: template.type as Node['type'],
      label: template.label,
      color: template.color,
      borderColor: template.borderColor,
      icon: (() => {
        // Return a placeholder icon component for custom nodes
        const CustomIcon = ({ className }: { className?: string }) => (
          <div className={className} dangerouslySetInnerHTML={{ __html: template.icon || '<div>?</div>' }} />
        );
        return CustomIcon;
      })(),
      description: template.description,
    }));

    return [...NODE_TEMPLATES, ...customTemplatesAsNodeTemplates];
  }, [customNodeTemplates]);

  // Viewport culling utilities
  const isInViewport = useCallback((x: number, y: number, width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return true;

    // Calculate viewport bounds in world coordinates
    const viewportBounds = {
      left: -viewport.x / viewport.zoom,
      top: -viewport.y / viewport.zoom,
      right: (canvas.width - viewport.x) / viewport.zoom,
      bottom: (canvas.height - viewport.y) / viewport.zoom
    };

    // Add some padding to reduce popping
    const padding = 50;

    return !(
      x + width < viewportBounds.left - padding ||
      x > viewportBounds.right + padding ||
      y + height < viewportBounds.top - padding ||
      y > viewportBounds.bottom + padding
    );
  }, [viewport]);

  const getVisibleNodes = useCallback(() => {
    return nodes.filter(node =>
      node.isVisible && isInViewport(node.x, node.y, node.width, node.height)
    );
  }, [nodes, isInViewport]);

  const getVisibleEdges = useCallback(() => {
    return edges.filter(edge => {
      if (!edge.isVisible) return false;

      // Get source and target nodes
      const sourceNode = nodes.find(n => n.id === edge.sourceId);
      const targetNode = nodes.find(n => n.id === edge.targetId);

      if (!sourceNode || !targetNode) return false;

      // Check if either endpoint is visible (edges can span viewport)
      return isInViewport(sourceNode.x, sourceNode.y, sourceNode.width, sourceNode.height) ||
             isInViewport(targetNode.x, targetNode.y, targetNode.width, targetNode.height);
    });
  }, [edges, nodes, isInViewport]);

  const getVisibleGroups = useCallback(() => {
    return groups.filter(group =>
      group.isVisible && isInViewport(group.x, group.y, group.width, group.height)
    );
  }, [groups, isInViewport]);

  // Initialize DiagramExporter
  const diagramExporter = React.useMemo(() => {
    return new DiagramExporter(nodes, edges, groups);
  }, [nodes, edges, groups]);

  // Enhanced export function that uses the new export system
  const handleExport = useCallback(async (format?: 'png' | 'svg' | 'pdf' | 'jpg') => {
    if (!diagramExporter) return;

    const formatToUse = format || exportFormat;
    const { theme: themeOption, ...otherOptions } = exportOptions;

    // Determine theme for export
    const actualTheme = themeOption === 'current' ? (isDark ? 'dark' : 'light') : themeOption;
    const finalOptions = {
      ...otherOptions,
      theme: actualTheme,
      background: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
      viewport
    };

    try {
      const timestamp = Date.now();
      const baseFilename = `nexflow-diagram-${timestamp}`;

      switch (formatToUse) {
        case 'svg': {
          const svgData = await diagramExporter.exportAsSVG(finalOptions);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          downloadFile(blob, `${baseFilename}.svg`);
          break;
        }
        case 'pdf': {
          const pdfBlob = await diagramExporter.exportAsPDF(finalOptions);
          downloadFile(pdfBlob, `${baseFilename}.pdf`);
          break;
        }
        case 'jpg': {
          const pngBlob = await diagramExporter.exportAsPNG(finalOptions);
          // Convert PNG to JPG with white background
          const jpgBlob = await convertPNGtoJPG(pngBlob, finalOptions.quality || 0.9);
          downloadFile(jpgBlob, `${baseFilename}.jpg`);
          break;
        }
        default: {
          const pngBlob = await diagramExporter.exportAsPNG(finalOptions);
          downloadFile(pngBlob, `${baseFilename}.png`);
          break;
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Export failed. Please try again.', 'error');
    }
  }, [diagramExporter, exportFormat, exportOptions, isDark, viewport]);

  // Legacy export functions for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const exportAsPNG = useCallback(() => handleExport('png'), [handleExport]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const exportAsSVG = useCallback(() => handleExport('svg'), [handleExport]);

  // Direct save to Firestore
  const saveProject = useCallback(async () => {
    if (!projectId || projectId === 'demo') {
      showNotification('Demo projects cannot be saved', 'info');
      return;
    }

    try {
      await autoSaveToFirestore();
      lastSaveTimeRef.current = Date.now();
      setHasUnsavedChanges(false);
      showNotification('Project saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving project:', error);
      showNotification('Failed to save project. Please try again.', 'error');
    }
  }, [projectId, autoSaveToFirestore, showNotification]);

  // Update user display name
  const handleUpdateDisplayName = useCallback(async () => {
    if (!user || !newDisplayName.trim() || newDisplayName === userProfile?.displayName) {
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await updateUserDisplayName(user.uid, newDisplayName.trim());

      // Reload user profile to get updated data
      const updatedProfile = await getUserProfile(user.uid);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }

      showNotification('Display name updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating display name:', error);
      showNotification('Failed to update display name. Please try again.', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [user, newDisplayName, userProfile?.displayName, showNotification]);

  // Export as JSON
  const exportAsJSON = useCallback(() => {
    try {
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

      showNotification('Diagram exported as JSON successfully!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Failed to export diagram. Please try again.', 'error');
    }
  }, [nodes, edges, animationConfigs, showNotification]);

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
      } catch {
        showNotification('Invalid JSON file format', 'error');
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const loadSavedDiagrams = useCallback(async () => {
    if (!user) {
      setSavedDiagrams([]);
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      setSavedDiagrams([]);
      return;
    }

    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'diagrams'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const diagrams = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSavedDiagrams(diagrams as Array<{ id: string; title: string; nodes: Node[]; edges: Edge[]; groups: NodeGroup[]; animationConfigs: Record<string, AnimationConfig>; createdAt: string | { toDate: () => Date } }>);
    } catch (error: unknown) {
      console.error('Error loading diagrams (this is expected if Firebase rules are not set up): ', error);
      // Don't show error to user for permission issues, just set empty array
      setSavedDiagrams([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create a stable reference for loadSavedDiagrams
  const loadSavedDiagramsRef = useRef(loadSavedDiagrams);
  loadSavedDiagramsRef.current = loadSavedDiagrams;

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
    showNotification(`Loaded diagram: ${diagram.title}`, 'success');
  }, [savedDiagrams, saveToHistory]);

  const deleteDiagram = useCallback(async (diagramId: string, diagramName?: string) => {
    const db = getFirebaseDb();
    if (!db) {
      showNotification('Firebase not configured. Cannot delete from cloud.', 'error');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Diagram',
      message: `Are you sure you want to delete ${diagramName ? `"${diagramName}"` : 'this diagram'}? This action cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete Diagram',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));

        try {
          await deleteDoc(doc(db, 'diagrams', diagramId));
          loadSavedDiagramsRef.current(); // Refresh the list
          showNotification('Diagram deleted successfully', 'success');
        } catch (error: unknown) {
          console.error('Error deleting diagram: ', error);
          if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
            showNotification('Permission denied. Unable to delete diagram.', 'error');
          } else {
            showNotification('Failed to delete diagram', 'error');
          }
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
      }
    });
  }, [showNotification]);

  const loadTemplate = useCallback((templateId: string) => {
    console.log('🔵 Loading template:', templateId);
    const template = DIAGRAM_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return;
    }

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

    // Apply horizontal layout to all templates
    const layoutNodes: LayoutNode[] = uniqueNodes.map(node => ({
      id: node.id,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      label: node.label,
      type: node.type,
    }));

    const layoutEdges: LayoutEdge[] = uniqueEdges.map(edge => ({
      id: edge.id,
      from: edge.sourceId,
      to: edge.targetId,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    }));

    const layoutOptions = layoutPresets.horizontal;

    autoLayout(layoutNodes, layoutEdges, layoutOptions).then(layoutedNodes => {
      const layoutedUniqueNodes = uniqueNodes.map(node => {
        const layoutedNode = layoutedNodes.find(ln => ln.id === node.id);
        if (layoutedNode) {
          return {
            ...node,
            x: layoutedNode.x,
            y: layoutedNode.y,
          };
        }
        return node;
      });

      setNodes(layoutedUniqueNodes);
      setEdges(uniqueEdges);
      setGroups([]);  // Clear groups when applying auto-layout
      setAnimationConfigs({});

      // Reset viewport
      setViewport({ x: 0, y: 0, zoom: 1 });

      // Save to history for undo/redo
      saveToHistory();

      setShowTemplatesDialog(false);
      showNotification(`Loaded template: ${template.name}`, 'success');
    }).catch(() => {
      // Fallback if layout fails
      setNodes(uniqueNodes);
      setEdges(uniqueEdges);
      setGroups(uniqueGroups);
      setAnimationConfigs({});
      setViewport({ x: 0, y: 0, zoom: 1 });
      saveToHistory();
      setShowTemplatesDialog(false);
      showNotification(`Loaded template: ${template.name}`, 'success');
    });
  }, [DIAGRAM_TEMPLATES, saveToHistory]);

  // Auth state listener
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Load or create user profile
        try {
          const profile = await createOrUpdateUserProfile(currentUser);
          setUserProfile(profile);
          setNewDisplayName(profile.displayName);

          // Load user stats
          const stats = await getUserStats(currentUser.uid);
          setUserStats(stats);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
        setUserStats(null);
        setNewDisplayName('');
      }
    });

    return () => unsubscribe();
  }, []);

  // Load saved diagrams when user changes (only if not loading a specific project)
  useEffect(() => {
    if (user && !projectId) {
      loadSavedDiagrams();
    }
  }, [user, loadSavedDiagrams, projectId]);

  // Set sidebar closed on mobile by default and track viewport width
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close layout menu when clicking outside
  useEffect(() => {
    if (!showLayoutMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target && !target.closest('[data-layout-menu]')) {
        setShowLayoutMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLayoutMenu]);

  // Create edge between nodes
  const createEdge = useCallback((sourceId: string, targetId: string, sourceHandle: 'input' | 'output' | 'top' | 'bottom', targetHandle: 'input' | 'output' | 'top' | 'bottom') => {
    const newEdge: Edge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceId,
      targetId,
      sourceHandle,
      targetHandle,
      label: '',
      color: '#6b7280',
      width: 2,
      style: 'solid',
      animated: false,
      bidirectional: false,
      bounce: false,
      curvature: 0.3,
      arrowSize: 24,
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
      description: '',
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

    // Close sidebar on small screens when dragging starts
    if (viewportWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [viewportWidth]);

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
            saveProject();
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
          case 'e':
            e.preventDefault();
            if (e.shiftKey) {
              // Ctrl+Shift+E: Export as SVG
              handleExport('svg');
            } else {
              // Ctrl+E: Export as PNG
              handleExport('png');
            }
            break;
          case 'j':
            e.preventDefault();
            // Ctrl+J: Export as JSON
            exportAsJSON();
            break;
        }
      }

      // Handle delete key (only when not focused on input/textarea)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).contentEditable === 'true'
        );

        if (!isInputFocused) {
          e.preventDefault();
          deleteSelected();
        }
      }

      // Handle help toggle
      if (e.key === '?' || e.key === 'F1') {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }

      // Handle escape key
      if (e.key === 'Escape') {
        setShowHelp(false);
        setShowKeyboardShortcuts(false);
        setShowLayoutMenu(false);
        setShowProfileMenu(false);
        setContextMenu(null);
        // Clear selection when pressing Escape
        setSelectedNode(null);
        setSelectedEdge(null);
        setSelectedGroup(null);
        setSelectedNodes(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveProject, exportAsJSON, handleExport, duplicateSelected, deleteSelected, createGroupFromSelected, selectedNodes.size]);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
    if (history.length === 0) {
      saveToHistory();
    }
  }, [saveToHistory]);

  // Canvas resize to fit container
  const handleCanvasResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    console.log('Canvas resized/refreshed:', { width: canvas.width, height: canvas.height });
  }, []);

  useEffect(() => {
    // Initial resize
    handleCanvasResize();

    // Listen for window resize
    window.addEventListener('resize', handleCanvasResize);
    return () => window.removeEventListener('resize', handleCanvasResize);
  }, [isClient, handleCanvasResize]);

  // Save to history when nodes, edges, or groups change
  useEffect(() => {
    if (history.length > 0) {
      const timeoutId = setTimeout(() => {
        if (saveToHistoryRef.current) {
          saveToHistoryRef.current();
        }
      }, 300); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, groups]);

  const animationFrameRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  // Initialize animation configs for new edges only
  useEffect(() => {
    setAnimationConfigs(prev => {
      const configs = { ...prev };
      edges.forEach(edge => {
        // Only initialize if this edge doesn't have a config yet
        if (!configs[edge.id]) {
          configs[edge.id] = {
            speed: 0.02,
            frequency: 60,
            size: 8,
            color: '#3b82f6',
            shape: 'circle',
            trail: false,
            enabled: false
          };
        }
      });
      // Remove configs for deleted edges
      Object.keys(configs).forEach(edgeId => {
        if (!edges.find(e => e.id === edgeId)) {
          delete configs[edgeId];
        }
      });
      return configs;
    });
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
      const padding = 8;

      // Outer glow effect - lighter and more subtle
      ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Primary selection border - solid, vibrant
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3 / viewport.zoom;
      ctx.setLineDash([]); // Solid line instead of dashed

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

      // Secondary border for depth - slightly lighter blue
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
      ctx.lineWidth = 1 / viewport.zoom;
      const innerPadding = padding - 2;

      if (shape === 'circle') {
        const radius = Math.max(width, height) / 2 + innerPadding;
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape === 'rounded') {
        const cornerRadius = 12 + innerPadding;
        ctx.beginPath();
        ctx.roundRect(x - innerPadding, y - innerPadding, width + innerPadding * 2, height + innerPadding * 2, cornerRadius);
        ctx.stroke();
      } else {
        ctx.strokeRect(x - innerPadding, y - innerPadding, width + innerPadding * 2, height + innerPadding * 2);
      }

      // Reset effects
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

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

    // Icon area - positioned in front of type badge
    const iconSize = 12;
    const badgeHeight = 18;
    const badgeY = y + 6;
    const iconX = x + 8;
    const iconY = badgeY + 3;


    // Improved node layout - ensure proper spacing
    const typeTextSize = 8;
    const labelTextSize = Math.min(fontSize, 12); // Cap at 12px for readability

    // Node type badge (top section)
    // Semi-transparent background for type badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x + 4, badgeY, width - 8, badgeHeight);

    // Draw icon in front of type badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;

    switch (node.type) {
      case 'database':
        // Database cylinder
        ctx.beginPath();
        ctx.ellipse(iconX + iconSize / 2, iconY + 2, iconSize / 2 - 2, 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.rect(iconX + 2, iconY + 2, iconSize - 4, 8);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(iconX + iconSize / 2, iconY + 10, iconSize / 2 - 2, 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'cloud':
        // Cloud shape (smaller)
        ctx.beginPath();
        ctx.arc(iconX + 3, iconY + 7, 2, 0, 2 * Math.PI);
        ctx.arc(iconX + 6, iconY + 5, 3, 0, 2 * Math.PI);
        ctx.arc(iconX + 9, iconY + 7, 2, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'security':
        // Shield (smaller)
        ctx.beginPath();
        ctx.moveTo(iconX + iconSize / 2, iconY + 1);
        ctx.lineTo(iconX + iconSize - 2, iconY + 3);
        ctx.lineTo(iconX + iconSize - 2, iconY + 8);
        ctx.lineTo(iconX + iconSize / 2, iconY + 11);
        ctx.lineTo(iconX + 2, iconY + 8);
        ctx.lineTo(iconX + 2, iconY + 3);
        ctx.closePath();
        ctx.fill();
        break;
      case 'api':
      case 'gateway':
        // Globe/network (smaller)
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
      case 'endpoint':
        // Route/endpoint arrow (smaller)
        ctx.beginPath();
        ctx.moveTo(iconX + 2, iconY + iconSize / 2);
        ctx.lineTo(iconX + iconSize - 6, iconY + iconSize / 2);
        ctx.moveTo(iconX + iconSize - 8, iconY + 4);
        ctx.lineTo(iconX + iconSize - 2, iconY + iconSize / 2);
        ctx.lineTo(iconX + iconSize - 8, iconY + iconSize - 4);
        ctx.stroke();
        // Add a small circle at the start
        ctx.beginPath();
        ctx.arc(iconX + 4, iconY + iconSize / 2, 2, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'storage':
        // Hard drive (smaller)
        ctx.fillRect(iconX + 2, iconY + 3, iconSize - 4, 6);
        ctx.strokeRect(iconX + 2, iconY + 3, iconSize - 4, 6);
        ctx.fillStyle = borderColor;
        ctx.fillRect(iconX + 3, iconY + 7, iconSize - 6, 1);
        break;
      case 'server':
        // On-premise server with gear icon
        ctx.strokeRect(iconX + 2, iconY + 2, iconSize - 4, iconSize - 4);
        for (let i = 0; i < 2; i++) {
          ctx.fillRect(iconX + 3, iconY + 4 + i * 2, iconSize - 6, 1);
        }
        // Draw small gear in corner
        const gearX = iconX + iconSize - 4;
        const gearY = iconY + iconSize - 4;
        ctx.beginPath();
        ctx.arc(gearX, gearY, 1.5, 0, 2 * Math.PI);
        ctx.stroke();
        // Gear teeth
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(gearX, gearY);
          ctx.lineTo(gearX + Math.cos(angle) * 2, gearY + Math.sin(angle) * 2);
          ctx.stroke();
        }
        break;
      default:
        // Server/service (default - smaller)
        ctx.strokeRect(iconX + 2, iconY + 2, iconSize - 4, iconSize - 4);
        for (let i = 0; i < 2; i++) {
          ctx.fillRect(iconX + 3, iconY + 4 + i * 2, iconSize - 6, 1);
        }
        ctx.beginPath();
        ctx.arc(iconX + iconSize - 3, iconY + 4, 1, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Type text positioned after the icon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = `600 ${typeTextSize}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    const typeTextX = iconX + iconSize + 4; // Position text to the right of icon
    ctx.fillText(node.type.toUpperCase(), typeTextX, badgeY + 12);

    // Main label (center section with better positioning)
    const labelY = y + height / 2 + 4; // Center vertically
    ctx.fillStyle = textColor;
    ctx.font = `600 ${labelTextSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';

    // Text wrapping for long labels
    const maxLabelWidth = width - 16; // Leave 8px padding on each side
    const labelWidth = ctx.measureText(label).width;

    if (labelWidth > maxLabelWidth && label.length > 10) {
      // Split long labels into two lines
      const words = label.split(' ');
      if (words.length > 1) {
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');

        ctx.fillText(line1, x + width / 2, labelY - 6);
        ctx.fillText(line2, x + width / 2, labelY + 8);
      } else {
        // Single long word, truncate with ellipsis
        const truncated = label.length > 12 ? label.substring(0, 12) + '...' : label;
        ctx.fillText(truncated, x + width / 2, labelY);
      }
    } else {
      ctx.fillText(label, x + width / 2, labelY);
    }

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

    // Line style
    if (edge.style === 'dashed') {
      ctx.setLineDash([8, 4]);
    } else if (edge.style === 'dotted') {
      ctx.setLineDash([2, 3]);
    } else {
      ctx.setLineDash([]);
    }

    // Draw line (tapered for unidirectional, uniform for bidirectional)
    const baseWidth = isSelected ? edge.width + 2 : edge.width;
    const segments = 20; // Number of segments for smooth taper

    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;

      // Calculate points along the bezier curve
      const x1 = Math.pow(1 - t1, 3) * startX + 3 * Math.pow(1 - t1, 2) * t1 * cp1X + 3 * (1 - t1) * Math.pow(t1, 2) * cp2X + Math.pow(t1, 3) * endX;
      const y1 = Math.pow(1 - t1, 3) * startY + 3 * Math.pow(1 - t1, 2) * t1 * cp1Y + 3 * (1 - t1) * Math.pow(t1, 2) * cp2Y + Math.pow(t1, 3) * endY;
      const x2 = Math.pow(1 - t2, 3) * startX + 3 * Math.pow(1 - t2, 2) * t2 * cp1X + 3 * (1 - t2) * Math.pow(t2, 2) * cp2X + Math.pow(t2, 3) * endX;
      const y2 = Math.pow(1 - t2, 3) * startY + 3 * Math.pow(1 - t2, 2) * t2 * cp1Y + 3 * (1 - t2) * Math.pow(t2, 2) * cp2Y + Math.pow(t2, 3) * endY;

      // Taper for unidirectional, uniform width for bidirectional
      const width = edge.bidirectional ? baseWidth : baseWidth * (1 - t1 * 0.7);

      ctx.strokeStyle = isSelected ? '#ef4444' : edge.color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw arrowheads for bidirectional edges
    if (edge.bidirectional) {
      const arrowSize = edge.arrowSize / 3; // Scale down for visual balance

      // Calculate arrow at end (target)
      const t = 0.95; // Position near the end
      const endArrowX = Math.pow(1 - t, 3) * startX + 3 * Math.pow(1 - t, 2) * t * cp1X + 3 * (1 - t) * Math.pow(t, 2) * cp2X + Math.pow(t, 3) * endX;
      const endArrowY = Math.pow(1 - t, 3) * startY + 3 * Math.pow(1 - t, 2) * t * cp1Y + 3 * (1 - t) * Math.pow(t, 2) * cp2Y + Math.pow(t, 3) * endY;

      // Direction vector at end
      const endDx = endX - endArrowX;
      const endDy = endY - endArrowY;
      const endAngle = Math.atan2(endDy, endDx);

      // Draw end arrowhead
      ctx.fillStyle = isSelected ? '#ef4444' : edge.color;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - arrowSize * Math.cos(endAngle - Math.PI / 6), endY - arrowSize * Math.sin(endAngle - Math.PI / 6));
      ctx.lineTo(endX - arrowSize * Math.cos(endAngle + Math.PI / 6), endY - arrowSize * Math.sin(endAngle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      // Calculate arrow at start (source)
      const tStart = 0.05; // Position near the start
      const startArrowX = Math.pow(1 - tStart, 3) * startX + 3 * Math.pow(1 - tStart, 2) * tStart * cp1X + 3 * (1 - tStart) * Math.pow(tStart, 2) * cp2X + Math.pow(tStart, 3) * endX;
      const startArrowY = Math.pow(1 - tStart, 3) * startY + 3 * Math.pow(1 - tStart, 2) * tStart * cp1Y + 3 * (1 - tStart) * Math.pow(tStart, 2) * cp2Y + Math.pow(tStart, 3) * endY;

      // Direction vector at start (reversed)
      const startDx = startX - startArrowX;
      const startDy = startY - startArrowY;
      const startAngle = Math.atan2(startDy, startDx);

      // Draw start arrowhead
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX - arrowSize * Math.cos(startAngle - Math.PI / 6), startY - arrowSize * Math.sin(startAngle - Math.PI / 6));
      ctx.lineTo(startX - arrowSize * Math.cos(startAngle + Math.PI / 6), startY - arrowSize * Math.sin(startAngle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }

    // Reset line dash
    ctx.setLineDash([]);

    // Edge label (only draw if label is not empty)
    if (edge.label && edge.label.trim() !== '') {
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
    }
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

    // Set font BEFORE measuring text to ensure accurate measurement
    ctx.font = '600 12px Inter, sans-serif';
    const textWidth = ctx.measureText(label).width;
    const labelBackgroundWidth = Math.max(100, textWidth + labelPadding * 2);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, labelBackgroundWidth, labelHeight);

    // Group label text
    ctx.fillStyle = '#ffffff';
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
    const startTime = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render canvas (debugging removed for performance)

    // Save context state
    ctx.save();

    // Clear with gradient background (theme-aware)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (isDark) {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
    } else {
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply viewport transform
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Grid pattern (theme-aware)
    ctx.strokeStyle = isDark ? '#334155' : '#f1f5f9';
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

    // Draw groups (only visible ones in viewport)
    const visibleGroups = getVisibleGroups();
    visibleGroups.forEach(group => {
      drawGroup(ctx, group, group.id === selectedGroup);
    });

    // Draw edges (only visible ones in viewport)
    const visibleEdges = getVisibleEdges();
    visibleEdges.forEach(edge => {
      drawEdge(ctx, edge, edge.id === selectedEdge);
    });

    // Draw nodes (only visible ones in viewport, and hide collapsed group nodes)
    const visibleNodes = getVisibleNodes();
    visibleNodes.forEach(node => {
      // Check if node is in a collapsed group
      const parentGroup = groups.find(group =>
        group.nodeIds.includes(node.id) && group.isCollapsed
      );

      if (!parentGroup) {
        drawNode(ctx, node, node.id === selectedNode);
      }
    });

    // Draw packets (only visible ones)
    packets.forEach(packet => {
      if (isInViewport(packet.x - packet.size, packet.y - packet.size, packet.size * 2, packet.size * 2)) {
        drawPacket(ctx, packet);
      }
    });

    // Draw selection rectangles for multi-selected nodes (only visible ones)
    selectedNodes.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node && node.isVisible && isInViewport(node.x, node.y, node.width, node.height)) {
        const padding = 8;

        // Outer glow effect
        ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Primary selection border - solid
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3 / viewport.zoom;
        ctx.setLineDash([]); // Solid line

        if (node.shape === 'circle') {
          const radius = Math.max(node.width, node.height) / 2 + padding;
          ctx.beginPath();
          ctx.arc(node.x + node.width / 2, node.y + node.height / 2, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (node.shape === 'rounded') {
          const cornerRadius = 12 + padding;
          ctx.beginPath();
          ctx.roundRect(node.x - padding, node.y - padding, node.width + padding * 2, node.height + padding * 2, cornerRadius);
          ctx.stroke();
        } else {
          ctx.strokeRect(node.x - padding, node.y - padding, node.width + padding * 2, node.height + padding * 2);
        }

        // Secondary border for depth
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
        ctx.lineWidth = 1 / viewport.zoom;
        const innerPadding = padding - 2;

        if (node.shape === 'circle') {
          const radius = Math.max(node.width, node.height) / 2 + innerPadding;
          ctx.beginPath();
          ctx.arc(node.x + node.width / 2, node.y + node.height / 2, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (node.shape === 'rounded') {
          const cornerRadius = 12 + innerPadding;
          ctx.beginPath();
          ctx.roundRect(node.x - innerPadding, node.y - innerPadding, node.width + innerPadding * 2, node.height + innerPadding * 2, cornerRadius);
          ctx.stroke();
        } else {
          ctx.strokeRect(node.x - innerPadding, node.y - innerPadding, node.width + innerPadding * 2, node.height + innerPadding * 2);
        }

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
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

    // Update performance stats
    const endTime = performance.now();
    const currentVisibleNodes = getVisibleNodes();
    const currentVisibleEdges = getVisibleEdges();
    const currentVisibleGroups = getVisibleGroups();

    setPerformanceStats({
      totalNodes: nodes.length,
      visibleNodes: currentVisibleNodes.length,
      totalEdges: edges.length,
      visibleEdges: currentVisibleEdges.length,
      totalGroups: groups.length,
      visibleGroups: currentVisibleGroups.length,
      lastRenderTime: endTime - startTime
    });

    // Restore context
    ctx.restore();
  }, [nodes, edges, groups, packets, selectedNode, selectedEdge, selectedNodes, selectedGroup, viewport, isConnecting, connectionStart, connectionPreview, drawNode, drawEdge, drawGroup, drawPacket, getVisibleNodes, getVisibleEdges, getVisibleGroups, isInViewport]);

  // Animation loop
  const animate = useCallback(() => {
    frameCountRef.current++;

    // Update packets
    setPackets(prev => {
      const updated = prev.map(packet => {
        const edge = edges.find(e => e.id === packet.edgeId);
        const config = animationConfigs[packet.edgeId];

        if (!edge || !config?.enabled) return null;

        // Update progress based on direction
        const newProgress = packet.direction === 'forward'
          ? packet.progress + packet.speed
          : packet.progress - packet.speed;

        // Handle bouncing packets
        if (edge.bounce && packet.isBouncing) {
          // Check if packet reached the end and needs to bounce back
          if (packet.direction === 'forward' && newProgress >= 1) {
            if (packet.hasBouncedOnce) {
              return null; // Remove after completing round trip
            }
            // Bounce back
            const position = getPacketPosition(edge, 1);
            if (!position) return packet;
            return {
              ...packet,
              x: position.x,
              y: position.y,
              progress: 1,
              direction: 'reverse',
              hasBouncedOnce: true
            };
          }
          // Check if packet returned to start
          if (packet.direction === 'reverse' && newProgress <= 0) {
            return null; // Remove after completing round trip
          }
        } else {
          // Non-bouncing packets - remove when reaching end
          if (packet.direction === 'forward' && newProgress >= 1) {
            return null;
          }
          if (packet.direction === 'reverse' && newProgress <= 0) {
            return null;
          }
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

      // Add new packets for active animations (only for visible edges)
      const visibleEdgeIds = new Set(getVisibleEdges().map(edge => edge.id));
      Object.entries(animationConfigs).forEach(([edgeId, config]) => {
        if (config.enabled && visibleEdgeIds.has(edgeId) && frameCountRef.current % config.frequency === 0) {
          const edge = edges.find(e => e.id === edgeId);
          if (edge) {
            // Create forward packet
            const forwardPosition = getPacketPosition(edge, 0);
            if (forwardPosition) {
              updated.push({
                id: `packet-${Date.now()}-${Math.random()}`,
                x: forwardPosition.x,
                y: forwardPosition.y,
                progress: 0,
                color: config.color,
                size: config.size,
                shape: config.shape,
                edgeId,
                trail: config.trail,
                speed: config.speed,
                direction: 'forward',
                isBouncing: edge.bounce,
                hasBouncedOnce: false
              });
            }

            // Create reverse packet for bidirectional edges (but not for bounce)
            if (edge.bidirectional && !edge.bounce) {
              const reversePosition = getPacketPosition(edge, 1);
              if (reversePosition) {
                updated.push({
                  id: `packet-${Date.now()}-${Math.random()}-rev`,
                  x: reversePosition.x,
                  y: reversePosition.y,
                  progress: 1,
                  color: config.color,
                  size: config.size,
                  shape: config.shape,
                  edgeId,
                  trail: config.trail,
                  speed: config.speed,
                  direction: 'reverse',
                  isBouncing: false,
                  hasBouncedOnce: false
                });
              }
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

        // Calculate Bezier control points
        const controlOffset = Math.min(Math.abs(endX - startX) * edge.curvature, 150);
        const cp1X = startX + controlOffset;
        const cp1Y = startY;
        const cp2X = endX - controlOffset;
        const cp2Y = endY;

        // Sample multiple points along the Bezier curve for accurate hit detection
        const samples = 20; // More samples for better accuracy on long edges
        let minDistance = Infinity;

        for (let i = 0; i <= samples; i++) {
          const t = i / samples;

          // Bezier curve equation
          const curveX = Math.pow(1 - t, 3) * startX +
                        3 * Math.pow(1 - t, 2) * t * cp1X +
                        3 * (1 - t) * Math.pow(t, 2) * cp2X +
                        Math.pow(t, 3) * endX;
          const curveY = Math.pow(1 - t, 3) * startY +
                        3 * Math.pow(1 - t, 2) * t * cp1Y +
                        3 * (1 - t) * Math.pow(t, 2) * cp2Y +
                        Math.pow(t, 3) * endY;

          const distance = Math.sqrt(
            Math.pow(worldPos.x - curveX, 2) + Math.pow(worldPos.y - curveY, 2)
          );

          minDistance = Math.min(minDistance, distance);
        }

        // Use a threshold that accounts for edge width and zoom level
        const threshold = Math.max(15, edge.width + 10) / viewport.zoom;

        if (minDistance < threshold) {
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

    // Check for edge selection first (so edges can be selected inside groups)
    for (const edge of edges) {
      if (!edge.isVisible) continue;

      const points = getConnectionPoints(edge);
      if (!points) continue;

      const { startX, startY, endX, endY } = points;

      // Calculate Bezier control points
      const controlOffset = Math.min(Math.abs(endX - startX) * edge.curvature, 150);
      const cp1X = startX + controlOffset;
      const cp1Y = startY;
      const cp2X = endX - controlOffset;
      const cp2Y = endY;

      // Sample multiple points along the Bezier curve for accurate hit detection
      const samples = 20; // More samples for better accuracy on long edges
      let minDistance = Infinity;

      for (let i = 0; i <= samples; i++) {
        const t = i / samples;

        // Bezier curve equation
        const curveX = Math.pow(1 - t, 3) * startX +
                      3 * Math.pow(1 - t, 2) * t * cp1X +
                      3 * (1 - t) * Math.pow(t, 2) * cp2X +
                      Math.pow(t, 3) * endX;
        const curveY = Math.pow(1 - t, 3) * startY +
                      3 * Math.pow(1 - t, 2) * t * cp1Y +
                      3 * (1 - t) * Math.pow(t, 2) * cp2Y +
                      Math.pow(t, 3) * endY;

        const distance = Math.sqrt(
          Math.pow(worldPos.x - curveX, 2) + Math.pow(worldPos.y - curveY, 2)
        );

        minDistance = Math.min(minDistance, distance);
      }

      // Use a threshold that accounts for edge width and zoom level
      const threshold = Math.max(15, edge.width + 10) / viewport.zoom;

      if (minDistance < threshold) {
        setSelectedEdge(edge.id);
        setSelectedNode(null);
        setSelectedGroup(null);
        setSelectedNodes(new Set());
        // Auto-switch to Edge section
        setActivePanel('edges');
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
          // Auto-switch to Nodes section for multi-select
          setActivePanel('nodes');
        } else {
          setSelectedNode(node.id);
          setSelectedEdge(null);
          setSelectedGroup(null);
          setSelectedNodes(new Set([node.id]));
          // Auto-switch to Nodes section
          setActivePanel('nodes');
        }

        setDraggedNode(node.id);
        setDragOffset({ x: worldPos.x - node.x, y: worldPos.y - node.y });
        return;
      }
    }

    // Check for group selection last (groups are behind nodes and edges)
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
          // Select and prepare to drag the group
          setSelectedGroup(group.id);
          setSelectedNode(null);
          setSelectedEdge(null);
          setSelectedNodes(new Set());
          // Auto-switch to Groups section
          setActivePanel('groups');
          setDraggedGroup(group.id);
          setDragOffset({ x: worldPos.x - group.x, y: worldPos.y - group.y });
          return;
        }
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

    // Handle group dragging
    if (draggedGroup) {
      const group = groups.find(g => g.id === draggedGroup);
      if (group) {
        const newX = worldPos.x - dragOffset.x;
        const newY = worldPos.y - dragOffset.y;

        // Snap to grid
        const gridSize = 20;
        const snappedX = Math.round(newX / gridSize) * gridSize;
        const snappedY = Math.round(newY / gridSize) * gridSize;

        // Calculate delta movement
        const deltaX = snappedX - group.x;
        const deltaY = snappedY - group.y;

        // Move group
        setGroups(prev => prev.map(g =>
          g.id === draggedGroup ? { ...g, x: snappedX, y: snappedY } : g
        ));

        // Move all nodes in the group
        setNodes(prev => prev.map(node =>
          group.nodeIds.includes(node.id)
            ? { ...node, x: node.x + deltaX, y: node.y + deltaY }
            : node
        ));
      }
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
    setDraggedGroup(null);
    setIsPanning(false);
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const screenX = touch.clientX - rect.left;
    const screenY = touch.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    // Close context menu on any touch
    setContextMenu(null);

    // Check for connection handles first
    for (const node of nodes) {
      if (!node.isVisible) continue;

      const handle = getClickedHandle(worldPos, node);
      if (handle) {
        if (isConnecting && connectionStart) {
          // Complete connection
          if (connectionStart.nodeId !== node.id) {
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

    // Check if touching a group
    for (const group of groups) {
      if (group.isVisible &&
          worldPos.x >= group.x && worldPos.x <= group.x + group.width &&
          worldPos.y >= group.y && worldPos.y <= group.y + group.height) {
        setDraggedGroup(group.id);
        setDragOffset({
          x: worldPos.x - group.x,
          y: worldPos.y - group.y
        });
        setSelectedGroup(group.id);
        setSelectedNode(null);
        setSelectedEdge(null);
        setSelectedNodes(new Set());
        return;
      }
    }

    // Check if touching a node
    for (const node of nodes) {
      if (node.isVisible &&
          worldPos.x >= node.x && worldPos.x <= node.x + node.width &&
          worldPos.y >= node.y && worldPos.y <= node.y + node.height) {
        setDraggedNode(node.id);
        setDragOffset({
          x: worldPos.x - node.x,
          y: worldPos.y - node.y
        });
        setSelectedNode(node.id);
        setSelectedEdge(null);
        setSelectedGroup(null);
        setSelectedNodes(new Set([node.id]));
        return;
      }
    }

    // Check if touching an edge
    for (const edge of edges) {
      if (!edge.isVisible) continue;
      const points = getConnectionPoints(edge);
      if (!points) continue;
      const { startX, startY, endX, endY } = points;

      // Calculate Bezier control points
      const controlOffset = Math.min(Math.abs(endX - startX) * edge.curvature, 150);
      const cp1X = startX + controlOffset;
      const cp1Y = startY;
      const cp2X = endX - controlOffset;
      const cp2Y = endY;

      // Sample multiple points along the Bezier curve for accurate hit detection
      const samples = 20; // More samples for better accuracy on long edges
      let minDistance = Infinity;

      for (let i = 0; i <= samples; i++) {
        const t = i / samples;

        // Bezier curve equation
        const curveX = Math.pow(1 - t, 3) * startX +
                      3 * Math.pow(1 - t, 2) * t * cp1X +
                      3 * (1 - t) * Math.pow(t, 2) * cp2X +
                      Math.pow(t, 3) * endX;
        const curveY = Math.pow(1 - t, 3) * startY +
                      3 * Math.pow(1 - t, 2) * t * cp1Y +
                      3 * (1 - t) * Math.pow(t, 2) * cp2Y +
                      Math.pow(t, 3) * endY;

        const distance = Math.sqrt(
          Math.pow(worldPos.x - curveX, 2) + Math.pow(worldPos.y - curveY, 2)
        );

        minDistance = Math.min(minDistance, distance);
      }

      // Use a threshold that accounts for edge width and zoom level
      const threshold = Math.max(15, edge.width + 10) / viewport.zoom;

      if (minDistance < threshold) {
        setSelectedEdge(edge.id);
        setSelectedNode(null);
        setSelectedGroup(null);
        setSelectedNodes(new Set());
        return;
      }
    }

    // Touching empty space - clear selection and start panning
    if (!draggedNode && !draggedGroup) {
      setSelectedNode(null);
      setSelectedEdge(null);
      setSelectedGroup(null);
      setSelectedNodes(new Set());
    }

    // Cancel connection if touching empty space
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
      setConnectionPreview(null);
    }

    // Start panning
    setIsPanning(true);
    setLastPanPoint({ x: screenX, y: screenY });
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const screenX = touch.clientX - rect.left;
    const screenY = touch.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    // Update connection preview
    if (isConnecting && connectionStart) {
      setConnectionPreview(worldPos);
      return;
    }

    if (isPanning && !draggedNode && !draggedGroup) {
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

    // Handle group dragging
    if (draggedGroup) {
      const group = groups.find(g => g.id === draggedGroup);
      if (group) {
        const newX = worldPos.x - dragOffset.x;
        const newY = worldPos.y - dragOffset.y;

        // Snap to grid
        const gridSize = 20;
        const snappedX = Math.round(newX / gridSize) * gridSize;
        const snappedY = Math.round(newY / gridSize) * gridSize;

        // Calculate delta movement
        const deltaX = snappedX - group.x;
        const deltaY = snappedY - group.y;

        // Move group
        setGroups(prev => prev.map(g =>
          g.id === draggedGroup ? { ...g, x: snappedX, y: snappedY } : g
        ));

        // Move all nodes in the group
        setNodes(prev => prev.map(node =>
          group.nodeIds.includes(node.id)
            ? { ...node, x: node.x + deltaX, y: node.y + deltaY }
            : node
        ));
      }
      return;
    }

    if (!draggedNode) return;

    const newX = worldPos.x - dragOffset.x;
    const newY = worldPos.y - dragOffset.y;

    // Snap to grid
    const gridSize = 20;
    const snappedX = Math.round(newX / gridSize) * gridSize;
    const snappedY = Math.round(newY / gridSize) * gridSize;

    setNodes(prev => prev.map(node =>
      selectedNodes.has(node.id)
        ? { ...node, x: node.x + (snappedX - nodes.find(n => n.id === draggedNode)!.x), y: node.y + (snappedY - nodes.find(n => n.id === draggedNode)!.y) }
        : node
    ));
  };

  const handleTouchEnd = () => {
    setDraggedNode(null);
    setDraggedGroup(null);
    setIsPanning(false);
  };

  // Zoom with mouse wheel - using useEffect to add non-passive listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

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

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [viewport.zoom, screenToWorld]);

  // Don't render complex UI until client-side hydration is complete
  if (!isClient) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-stone-100'}`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${isDark ? 'border-blue-500' : 'border-indigo-500'}`}></div>
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Loading NexFlow</h2>
          <p className={isDark ? 'text-gray-300' : 'text-slate-600'}>Preparing your diagram canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm pointer-events-none"
        />
      )}

      {/* Left Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 md:z-auto h-full w-full md:w-[480px] md:flex-shrink-0 backdrop-blur-xl md:border-r flex flex-col min-h-0 transition-transform duration-300 overflow-hidden ${
        isDark
          ? 'bg-gradient-to-b from-gray-900/95 to-gray-900/98 border-white/10'
          : 'bg-gradient-to-b from-white/95 to-gray-50/95 border-gray-200/80 shadow-xl'
      } pb-[72px] md:pb-0`}>
        {/* Sidebar Header */}
        <div className={`p-3 md:p-4 border-b flex-shrink-0 backdrop-blur-sm z-20 ${
          isDark
            ? 'border-white/10 bg-gradient-to-r from-teal-900/20 to-blue-900/20'
            : 'border-slate-200/60 bg-gradient-to-r from-indigo-50/60 to-purple-50/60'
        }`}>
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-14 md:h-14 relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl blur-md opacity-50"></div>
              <NextImage
                src="/canvas-logo.png"
                alt="NexFlow Logo"
                width={56}
                height={56}
                className="w-full h-full object-contain rounded-xl relative drop-shadow-2xl"
              />
            </div>
            <h2 className={`flex-1 text-base md:text-xl font-bold drop-shadow-lg truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>NexFlow - Diagram</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-white/10 text-white/80 hover:text-white'
                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
              title="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel Tabs */}
          <div className={`grid grid-cols-3 gap-2 rounded-xl backdrop-blur-sm p-2 ${getThemeStyles().background} ${getThemeStyles().border}`}>
            {[
              { id: 'templates', label: 'Items', icon: Square },
              { id: 'groups', label: 'Groups', icon: Layers },
              { id: 'animations', label: 'Animate', icon: Play },
              { id: 'nodes', label: 'Node', icon: Circle },
              { id: 'edges', label: 'Edge', icon: Settings },
              { id: 'controls', label: 'Help', icon: HelpCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActivePanel(id as 'nodes' | 'edges' | 'animations' | 'templates' | 'groups' | 'controls');
                  // Clear group selection when switching panels
                  if (selectedGroup && id !== 'groups') {
                    setSelectedGroup(null);
                  }
                }}
                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activePanel === id
                    ? `${getThemeStyles().activeBg} ${isDark ? 'text-white' : 'text-blue-700 font-semibold'} shadow-lg ${isDark ? 'shadow-teal-500/30' : 'shadow-blue-500/30'}`
                    : `${getThemeStyles().textSecondary} ${isDark ? 'hover:text-white' : 'hover:text-gray-900'} ${getThemeStyles().hoverBg}`
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 min-h-0 custom-scrollbar">
          {activePanel === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold drop-shadow-md ${getThemeStyles().textBold}`}>Node Templates</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCustomNodeBuilder(true)}
                    className={`p-1.5 rounded-lg transition-all hover:scale-110 ${getThemeStyles().textOnColor} ${isDark ? 'hover:bg-teal-500/20' : 'hover:bg-blue-100'}`}
                    title="Create Custom Node"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className={`text-xs font-medium ${getThemeStyles().textMuted}`}>
                    {allNodeTemplates.filter((template) =>
                      template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      template.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      template.description.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length} / {allNodeTemplates.length}
                  </div>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-3 py-2 pl-8 text-sm rounded-lg focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} ${getThemeStyles().placeholder} ${isDark ? 'focus:ring-teal-500' : 'focus:ring-blue-500'}`}
                />
                <div className={`absolute left-2.5 top-2.5 ${getThemeStyles().textMuted}`}>
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

              <p className={`text-xs ${getThemeStyles().textMuted}`}>
                Drag templates onto the canvas to create new nodes
              </p>

              <div className="grid grid-cols-2 gap-3">
                {allNodeTemplates
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
                      className={`group p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 backdrop-blur-sm ${
                        isDark
                          ? 'bg-white/5 border border-white/20 hover:border-teal-400/50 hover:bg-white/10 hover:shadow-lg hover:shadow-teal-500/20'
                          : 'bg-white/90 border border-gray-200/80 hover:border-blue-300/80 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10'
                      }`}
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
                          <div className={`font-semibold text-sm drop-shadow-sm ${getThemeStyles().textBold}`}>{template.label}</div>
                          <div className={`text-xs truncate ${getThemeStyles().textMuted}`}>{template.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-3 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-xl border border-teal-400/30 backdrop-blur-sm">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex-shrink-0 mt-0.5 shadow-lg"></div>
                  <div className={`text-xs ${getThemeStyles().textBold}`}>
                    <strong>Tip:</strong> Drag any template to the canvas to create a new node. You can customize colors, labels, and other properties in the Nodes panel.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePanel === 'animations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold drop-shadow-md ${getThemeStyles().textBold}`}>Animation Controls</h3>
                <div className={`text-xs font-medium ${getThemeStyles().textMuted}`}>{packets.length} active packets</div>
              </div>

              {edges.length === 0 && (
                <div className={`text-center py-6 ${getThemeStyles().textMuted}`}>
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
                    className={`p-3 rounded-xl border transition-all backdrop-blur-sm ${
                      selectedEdge === edge.id
                        ? 'border-teal-400/50 bg-teal-500/20'
                        : 'border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className={`font-semibold text-sm drop-shadow-sm ${getThemeStyles().textBold}`}>{edge.label || 'Unlabeled Connection'}</div>
                        <div className={`text-xs ${getThemeStyles().textMuted}`}>
                          {getNode(edge.sourceId)?.label} → {getNode(edge.targetId)?.label}
                        </div>
                      </div>
                      <button
                        onClick={() => setAnimationConfigs(prev => ({
                          ...prev,
                          [edge.id]: { ...prev[edge.id], enabled: !prev[edge.id].enabled }
                        }))}
                        className={`p-2 rounded-lg transition-all ${
                          config.enabled
                            ? isDark
                              ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                              : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                            : `${getThemeStyles().hoverBg} ${getThemeStyles().textMuted}`
                        }`}
                      >
                        {config.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>

                    {config.enabled && (
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Speed</label>
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
                          <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Frequency</label>
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
                            <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Size</label>
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
                            <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Color</label>
                            <input
                              type="color"
                              value={config.color}
                              onChange={(e) => setAnimationConfigs(prev => ({
                                ...prev,
                                [edge.id]: { ...prev[edge.id], color: e.target.value }
                              }))}
                              className="w-full h-8 border border-white/20 rounded-lg bg-white/5"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className={`text-xs font-semibold ${getThemeStyles().textBold}`}>Shape:</label>
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
                                  className={`p-1 rounded-lg transition-all ${
                                    config.shape === shape
                                      ? 'bg-teal-500/30 text-teal-300'
                                      : `${getThemeStyles().hoverBg} ${getThemeStyles().textMuted}`
                                  }`}
                                >
                                  <Icon className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <label className={`flex items-center gap-2 text-xs font-medium ${getThemeStyles().textBold}`}>
                            <input
                              type="checkbox"
                              checked={config.trail}
                              onChange={(e) => setAnimationConfigs(prev => ({
                                ...prev,
                                [edge.id]: { ...prev[edge.id], trail: e.target.checked }
                              }))}
                              className="rounded border-white/20"
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
                    <div className={`flex items-center justify-between sticky top-0 backdrop-blur-sm pb-2 z-10 ${
                      isDark
                        ? 'bg-gradient-to-b from-gray-900 to-gray-900/80'
                        : 'bg-gradient-to-b from-white to-white/80'
                    }`}>
                      <h3 className={`text-sm font-bold drop-shadow-md ${getThemeStyles().textBold}`}>Node Properties</h3>
                      <button
                        onClick={() => setNodes(prev => prev.map(n =>
                          n.id === selectedNode ? { ...n, isVisible: !n.isVisible } : n
                        ))}
                        className={`p-2 rounded-lg transition-all ${getThemeStyles().hoverBg} ${getThemeStyles().text}`}
                      >
                        {node.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Label</label>
                      <input
                        type="text"
                        value={node.label}
                        onChange={(e) => setNodes(prev => prev.map(n =>
                          n.id === selectedNode ? { ...n, label: e.target.value } : n
                        ))}
                        className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:border-transparent backdrop-blur-sm ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} ${getThemeStyles().placeholder} ${isDark ? 'focus:ring-teal-500' : 'focus:ring-blue-500'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Description</label>
                      <textarea
                        value={node.description || ''}
                        onChange={(e) => setNodes(prev => prev.map(n =>
                          n.id === selectedNode ? { ...n, description: e.target.value } : n
                        ))}
                        placeholder="Add a description for this node..."
                        rows={3}
                        className={`w-full px-3 py-2 ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} ${getThemeStyles().placeholder} rounded-lg text-sm resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Width</label>
                        <input
                          type="number"
                          value={node.width}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, width: Number(e.target.value) } : n
                          ))}
                          className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:border-transparent backdrop-blur-sm ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} ${isDark ? 'focus:ring-teal-500' : 'focus:ring-blue-500'}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Height</label>
                        <input
                          type="number"
                          value={node.height}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, height: Number(e.target.value) } : n
                          ))}
                          className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:border-transparent backdrop-blur-sm ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} ${isDark ? 'focus:ring-teal-500' : 'focus:ring-blue-500'}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Fill</label>
                        <input
                          type="color"
                          value={node.color}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, color: e.target.value } : n
                          ))}
                          className="w-full h-8 border border-white/20 rounded-lg bg-white/5"
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Border</label>
                        <input
                          type="color"
                          value={node.borderColor}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, borderColor: e.target.value } : n
                          ))}
                          className="w-full h-8 border border-white/20 rounded-lg bg-white/5"
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Text</label>
                        <input
                          type="color"
                          value={node.textColor}
                          onChange={(e) => setNodes(prev => prev.map(n =>
                            n.id === selectedNode ? { ...n, textColor: e.target.value } : n
                          ))}
                          className="w-full h-8 border border-white/20 rounded-lg bg-white/5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Shape</label>
                      <select
                        value={node.shape}
                        onChange={(e) => setNodes(prev => prev.map(n =>
                          n.id === selectedNode ? { ...n, shape: e.target.value as 'rectangle' | 'rounded' | 'circle' | 'diamond' } : n
                        ))}
                        className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:border-transparent backdrop-blur-sm ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} ${isDark ? 'focus:ring-teal-500' : 'focus:ring-blue-500'}`}
                      >
                        <option value="rectangle">Rectangle</option>
                        <option value="rounded">Rounded Rectangle</option>
                        <option value="circle">Circle</option>
                        <option value="diamond">Diamond</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Font Size</label>
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
                        <span className={`text-xs ${getThemeStyles().textMuted}`}>{node.fontSize}px</span>
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${getThemeStyles().textBold}`}>Border Width</label>
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
                        <span className={`text-xs ${getThemeStyles().textMuted}`}>{node.borderWidth}px</span>
                      </div>
                    </div>

                    <label className={`flex items-center gap-2 text-sm ${getThemeStyles().textBold}`}>
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
                    <div className={`flex items-center justify-between sticky top-0 backdrop-blur-sm pb-2 z-10 ${
                      isDark
                        ? 'bg-gradient-to-b from-gray-900 to-gray-900/80'
                        : 'bg-gradient-to-b from-white to-white/80'
                    }`}>
                      <h3 className={`text-sm font-bold drop-shadow-md ${getThemeStyles().textBold}`}>Edge Properties</h3>
                      <button
                        onClick={() => setEdges(prev => prev.map(e =>
                          e.id === selectedEdge ? { ...e, isVisible: !e.isVisible } : e
                        ))}
                        className={`p-2 rounded-lg transition-all ${getThemeStyles().hoverBg} ${getThemeStyles().text}`}
                      >
                        {edge.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Label</label>
                      <input
                        type="text"
                        value={edge.label}
                        onChange={(e) => setEdges(prev => prev.map(ed =>
                          ed.id === selectedEdge ? { ...ed, label: e.target.value } : ed
                        ))}
                        placeholder="Leave empty for no label"
                        className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:border-transparent backdrop-blur-sm ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} ${getThemeStyles().placeholder} ${isDark ? 'focus:ring-teal-500' : 'focus:ring-blue-500'}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Color</label>
                        <input
                          type="color"
                          value={edge.color}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, color: e.target.value } : ed
                          ))}
                          className="w-full h-8 border border-white/20 rounded-lg bg-white/5"
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Style</label>
                        <select
                          value={edge.style}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, style: e.target.value as 'solid' | 'dashed' | 'dotted' } : ed
                          ))}
                          className={`w-full px-3 py-2 rounded-lg text-sm focus:ring-2 focus:border-transparent backdrop-blur-sm ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} ${isDark ? 'focus:ring-teal-500' : 'focus:ring-blue-500'}`}
                        >
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 text-xs font-semibold ${getThemeStyles().textBold} cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={edge.bidirectional}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, bidirectional: e.target.checked } : ed
                          ))}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500"
                        />
                        Bidirectional (Two-way animation)
                      </label>
                    </div>

                    <div>
                      <label className={`flex items-center gap-2 text-xs font-semibold ${getThemeStyles().textBold} cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={edge.bounce}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, bounce: e.target.checked } : ed
                          ))}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                        />
                        Bounce (Round-trip animation)
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Width</label>
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
                        <span className={`text-xs ${getThemeStyles().textMuted} font-medium`}>{edge.width}px</span>
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Curvature</label>
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
                        <span className={`text-xs ${getThemeStyles().textMuted} font-medium`}>{edge.curvature}</span>
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold mb-1 ${getThemeStyles().textBold}`}>Arrow Size</label>
                        <input
                          type="range"
                          min="10"
                          max="50"
                          value={edge.arrowSize}
                          onChange={(e) => setEdges(prev => prev.map(ed =>
                            ed.id === selectedEdge ? { ...ed, arrowSize: Number(e.target.value) } : ed
                          ))}
                          className="w-full"
                        />
                        <span className={`text-xs ${getThemeStyles().textMuted} font-medium`}>{edge.arrowSize}px</span>
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
                <h3 className={`text-sm font-bold drop-shadow-md ${getThemeStyles().textBold}`}>Node Groups</h3>
                <div className={`text-xs font-medium ${getThemeStyles().textMuted}`}>{groups.length} groups</div>
              </div>

              {selectedNodes.size >= 2 && (
                <div className="p-3 bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-400/30 rounded-xl backdrop-blur-sm">
                  <p className={`text-sm mb-3 font-medium ${getThemeStyles().textBold}`}>
                    {selectedNodes.size} nodes selected
                  </p>
                  <button
                    onClick={createGroupFromSelected}
                    className="w-full px-3 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2 justify-center font-semibold"
                  >
                    <Layers className="w-4 h-4" />
                    Create Group
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {groups.length === 0 ? (
                  <div className={`text-center py-8 ${getThemeStyles().textMuted}`}>
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No groups created</p>
                    <p className={`text-xs ${getThemeStyles().textMuted}`}>Select multiple nodes and click &quot;Create Group&quot;</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-3 border rounded-xl cursor-pointer transition-all backdrop-blur-sm ${
                        selectedGroup === group.id
                          ? 'border-teal-400/50 bg-teal-500/20'
                          : `${getThemeStyles().border} ${getThemeStyles().background} ${getThemeStyles().borderHover}`
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
                        <span className={`text-sm font-semibold drop-shadow-sm ${getThemeStyles().textBold}`}>{group.label}</span>
                        <span className={`text-xs ml-auto font-medium ${getThemeStyles().textMuted}`}>
                          {group.nodeIds.length} nodes
                        </span>
                      </div>

                      <div className={`flex items-center gap-2 text-xs ${getThemeStyles().textMuted}`}>
                        <span>{Math.round(group.width)} × {Math.round(group.height)}</span>
                        {group.isCollapsed && <span className="text-orange-400">Collapsed</span>}
                      </div>

                      {selectedGroup === group.id && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setGroups(prev => prev.map(g =>
                                  g.id === group.id ? { ...g, isCollapsed: !g.isCollapsed } : g
                                ));
                              }}
                              className="flex-1 px-2 py-1 bg-white/10 text-white text-xs rounded-lg hover:bg-white/20 transition-all font-medium"
                            >
                              {group.isCollapsed ? 'Expand' : 'Collapse'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                ungroupSelected();
                              }}
                              className="flex-1 px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-lg hover:bg-red-500/30 transition-all font-medium"
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
                <h3 className={`text-sm font-bold drop-shadow-md ${getThemeStyles().textBold}`}>Keyboard Shortcuts</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className={`text-xs font-bold mb-2 uppercase tracking-wide ${getThemeStyles().textOnColor}`}>Canvas Navigation</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Pan canvas</span>
                      <kbd className={`px-2 py-1 rounded-lg text-xs ${getThemeStyles().background} ${getThemeStyles().border} ${getThemeStyles().textBold}`}>Click + drag</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Zoom in/out</span>
                      <kbd className={`px-2 py-1 rounded-lg text-xs ${getThemeStyles().background} ${getThemeStyles().border} ${getThemeStyles().textBold}`}>Mouse wheel</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Reset view</span>
                      <kbd className={`px-2 py-1 rounded-lg text-xs ${getThemeStyles().background} ${getThemeStyles().border} ${getThemeStyles().textBold}`}>Ctrl + 0</kbd>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-xs font-bold mb-2 uppercase tracking-wide ${getThemeStyles().textOnColor}`}>Node Operations</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Duplicate selection</span>
                      <kbd className={`px-2 py-1 rounded-lg text-xs ${getThemeStyles().background} ${getThemeStyles().border} ${getThemeStyles().textBold}`}>Ctrl + D</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Delete selection</span>
                      <kbd className={`px-2 py-1 rounded-lg text-xs ${getThemeStyles().background} ${getThemeStyles().border} ${getThemeStyles().textBold}`}>Delete</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Group nodes</span>
                      <kbd className={`px-2 py-1 rounded-lg text-xs ${getThemeStyles().background} ${getThemeStyles().border} ${getThemeStyles().textBold}`}>Ctrl + G</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Multi-select</span>
                      <kbd className={`px-2 py-1 rounded-lg text-xs ${getThemeStyles().background} ${getThemeStyles().border} ${getThemeStyles().textBold}`}>Ctrl + click</kbd>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-xs font-bold mb-2 uppercase tracking-wide ${isDark ? 'text-teal-300' : 'text-blue-600'}`}>File Operations</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Export JSON</span>
                      <kbd className={`px-2 py-1 rounded-lg text-xs ${getThemeStyles().background} ${getThemeStyles().border} ${getThemeStyles().textBold}`}>Ctrl + S</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Undo</span>
                      <kbd className={`px-2 py-1 rounded-lg text-xs ${getThemeStyles().background} ${getThemeStyles().border} ${getThemeStyles().textBold}`}>Ctrl + Z</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Redo</span>
                      <kbd className={`px-2 py-1 rounded-lg text-xs ${getThemeStyles().background} ${getThemeStyles().border} ${getThemeStyles().textBold}`}>Ctrl + Y</kbd>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-xs font-bold mb-2 uppercase tracking-wide ${isDark ? 'text-teal-300' : 'text-blue-600'}`}>Mouse Controls</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Create connection</span>
                      <span className={`${getThemeStyles().textMuted} text-xs`}>Click node handles</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Add nodes</span>
                      <span className={`${getThemeStyles().textMuted} text-xs`}>Drag from sidebar</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${getThemeStyles().textSecondary}`}>Move nodes</span>
                      <span className={`${getThemeStyles().textMuted} text-xs`}>Click and drag</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-3 bg-gradient-to-br rounded-xl backdrop-blur-sm ${isDark ? 'from-teal-500/20 to-blue-500/20 border border-teal-400/30' : 'from-blue-500/10 to-indigo-500/10 border border-blue-400/30'}`}>
                <div className="flex items-start gap-2">
                  <HelpCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-teal-300' : 'text-blue-600'}`} />
                  <div className={`text-xs ${getThemeStyles().textBold}`}>
                    <strong>Pro Tip:</strong> Press <kbd className={`px-1 py-0.5 rounded border text-xs ${isDark ? 'bg-teal-500/30 text-teal-300 border-teal-400/30' : 'bg-blue-500/20 text-blue-700 border-blue-400/40'}`}>?</kbd> or <kbd className={`px-1 py-0.5 rounded border text-xs ${isDark ? 'bg-teal-500/30 text-teal-300 border-teal-400/30' : 'bg-blue-500/20 text-blue-700 border-blue-400/40'}`}>F1</kbd> anytime to open the full help dialog with more detailed instructions.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Group Properties Panel */}
          {selectedGroup && (() => {
            const group = groups.find(g => g.id === selectedGroup);
            if (!group) return null;

            return (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold drop-shadow-md ${getThemeStyles().textBold}`}>Group Properties</h3>
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className={`p-1 rounded-lg transition-all ${getThemeStyles().hoverBg} ${getThemeStyles().text}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Group Name */}
                <div>
                  <label className={`block text-sm font-semibold ${getThemeStyles().textBold} mb-1`}>Group Name</label>
                  <input
                    type="text"
                    value={group.label}
                    onChange={(e) => {
                      setGroups(prev => prev.map(g =>
                        g.id === selectedGroup ? { ...g, label: e.target.value } : g
                      ));
                    }}
                    className={`w-full px-3 py-2 ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} ${getThemeStyles().placeholder} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm`}
                  />
                </div>

                {/* Group Description */}
                <div>
                  <label className={`block text-sm font-semibold ${getThemeStyles().textBold} mb-1`}>Description</label>
                  <textarea
                    value={group.description || ''}
                    onChange={(e) => {
                      setGroups(prev => prev.map(g =>
                        g.id === selectedGroup ? { ...g, description: e.target.value } : g
                      ));
                    }}
                    rows={3}
                    placeholder="Add a description for this group..."
                    className={`w-full px-3 py-2 ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} ${getThemeStyles().placeholder} rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none backdrop-blur-sm`}
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-semibold ${getThemeStyles().textBold} mb-1`}>Border Color</label>
                    <input
                      type="color"
                      value={group.borderColor}
                      onChange={(e) => {
                        setGroups(prev => prev.map(g =>
                          g.id === selectedGroup ? { ...g, borderColor: e.target.value } : g
                        ));
                      }}
                      className={`w-full h-10 rounded-lg border ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${getThemeStyles().textBold} mb-1`}>Text Color</label>
                    <input
                      type="color"
                      value={group.color}
                      onChange={(e) => {
                        setGroups(prev => prev.map(g =>
                          g.id === selectedGroup ? { ...g, color: e.target.value } : g
                        ));
                      }}
                      className={`w-full h-10 rounded-lg border ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'}`}
                    />
                  </div>
                </div>

                {/* Background Color with Opacity */}
                <div>
                  <label className={`block text-sm font-semibold ${getThemeStyles().textBold} mb-1`}>Background</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={(() => {
                        // Extract hex color from rgba or hex format
                        if (group.backgroundColor.startsWith('rgba')) {
                          const match = group.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
                          if (match) {
                            const r = parseInt(match[1]).toString(16).padStart(2, '0');
                            const g = parseInt(match[2]).toString(16).padStart(2, '0');
                            const b = parseInt(match[3]).toString(16).padStart(2, '0');
                            return `#${r}${g}${b}`;
                          }
                        }
                        return group.backgroundColor.substring(0, 7);
                      })()}
                      onChange={(e) => {
                        const hexColor = e.target.value;
                        // Get current opacity
                        let opacity = 0.1;
                        if (group.backgroundColor.startsWith('rgba')) {
                          const match = group.backgroundColor.match(/[\d.]+\)$/);
                          if (match) opacity = parseFloat(match[0].slice(0, -1));
                        }
                        // Convert hex to rgba
                        const r = parseInt(hexColor.slice(1, 3), 16);
                        const g = parseInt(hexColor.slice(3, 5), 16);
                        const b = parseInt(hexColor.slice(5, 7), 16);
                        const newBgColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        console.log('Setting background color:', newBgColor);
                        setGroups(prev => prev.map(g =>
                          g.id === selectedGroup ? {
                            ...g,
                            backgroundColor: newBgColor
                          } : g
                        ));
                      }}
                      className={`flex-1 h-10 rounded-lg border ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'}`}
                    />
                    <select
                      value={(() => {
                        if (group.backgroundColor.startsWith('rgba')) {
                          const match = group.backgroundColor.match(/[\d.]+\)$/);
                          if (match) return match[0].slice(0, -1);
                        }
                        return '0.1';
                      })()}
                      onChange={(e) => {
                        const opacity = e.target.value;
                        console.log('Changing opacity to:', opacity);
                        console.log('Current backgroundColor:', group.backgroundColor);

                        // Get current color
                        let r = 59, g = 130, b = 246; // default blue
                        if (group.backgroundColor.startsWith('rgba')) {
                          const match = group.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
                          if (match) {
                            r = parseInt(match[1]);
                            g = parseInt(match[2]);
                            b = parseInt(match[3]);
                            console.log('Extracted RGB:', r, g, b);
                          } else {
                            console.log('Failed to match rgba pattern');
                          }
                        } else if (group.backgroundColor.startsWith('#')) {
                          // Handle hex color format
                          const hex = group.backgroundColor;
                          r = parseInt(hex.slice(1, 3), 16);
                          g = parseInt(hex.slice(3, 5), 16);
                          b = parseInt(hex.slice(5, 7), 16);
                          console.log('Extracted RGB from hex:', r, g, b);
                        }

                        const newBgColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        console.log('Setting new background color:', newBgColor);

                        setGroups(prev => prev.map(g =>
                          g.id === selectedGroup ? {
                            ...g,
                            backgroundColor: newBgColor
                          } : g
                        ));
                      }}
                      className={`px-2 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        isDark
                          ? 'bg-gray-800 border-white/20 text-white focus:ring-teal-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                      }`}
                    >
                      <option value="0.05">5%</option>
                      <option value="0.1">10%</option>
                      <option value="0.2">20%</option>
                      <option value="0.3">30%</option>
                      <option value="0.5">50%</option>
                    </select>
                  </div>
                </div>

                {/* Padding */}
                <div>
                  <label className={`block text-sm font-semibold ${getThemeStyles().textBold} mb-1`}>
                    Padding: {group.padding}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={group.padding}
                    onChange={(e) => {
                      setGroups(prev => prev.map(g =>
                        g.id === selectedGroup ? { ...g, padding: parseInt(e.target.value) } : g
                      ));
                    }}
                    className="w-full"
                  />
                </div>

                {/* Position & Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-semibold ${getThemeStyles().textBold} mb-1`}>X Position</label>
                    <input
                      type="number"
                      value={Math.round(group.x)}
                      onChange={(e) => {
                        setGroups(prev => prev.map(g =>
                          g.id === selectedGroup ? { ...g, x: parseInt(e.target.value) || 0 } : g
                        ));
                      }}
                      className={`w-full px-2 py-1 ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${getThemeStyles().textBold} mb-1`}>Y Position</label>
                    <input
                      type="number"
                      value={Math.round(group.y)}
                      onChange={(e) => {
                        setGroups(prev => prev.map(g =>
                          g.id === selectedGroup ? { ...g, y: parseInt(e.target.value) || 0 } : g
                        ));
                      }}
                      className={`w-full px-2 py-1 ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${getThemeStyles().textBold} mb-1`}>Width</label>
                    <input
                      type="number"
                      value={Math.round(group.width)}
                      onChange={(e) => {
                        setGroups(prev => prev.map(g =>
                          g.id === selectedGroup ? { ...g, width: parseInt(e.target.value) || 100 } : g
                        ));
                      }}
                      className={`w-full px-2 py-1 ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${getThemeStyles().textBold} mb-1`}>Height</label>
                    <input
                      type="number"
                      value={Math.round(group.height)}
                      onChange={(e) => {
                        setGroups(prev => prev.map(g =>
                          g.id === selectedGroup ? { ...g, height: parseInt(e.target.value) || 100 } : g
                        ));
                      }}
                      className={`w-full px-2 py-1 ${getThemeStyles().inputBg} ${getThemeStyles().inputBorder} ${getThemeStyles().inputText} rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm`}
                    />
                  </div>
                </div>

                {/* Group Info */}
                <div className={`p-3 rounded-xl backdrop-blur-sm ${
                  isDark
                    ? 'bg-white/5 border border-white/20'
                    : 'bg-gray-100 border border-gray-200'
                }`}>
                  <div className={`text-sm ${getThemeStyles().textBold} space-y-1`}>
                    <p><strong className={isDark ? 'text-teal-300' : 'text-blue-600'}>Nodes in group:</strong> {group.nodeIds.length}</p>
                    <p><strong className={isDark ? 'text-teal-300' : 'text-blue-600'}>Status:</strong> {group.isCollapsed ? 'Collapsed' : 'Expanded'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setGroups(prev => prev.map(g =>
                        g.id === selectedGroup ? { ...g, isCollapsed: !g.isCollapsed } : g
                      ));
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg transition-all font-semibold ${
                      isDark
                        ? 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30'
                        : 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30'
                    }`}
                  >
                    {group.isCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                  <button
                    onClick={() => {
                      setGroups(prev => prev.map(g =>
                        g.id === selectedGroup ? { ...g, isVisible: !g.isVisible } : g
                      ));
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg transition-all font-semibold flex items-center justify-center gap-2 ${
                      isDark
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {group.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {group.isVisible ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      ungroupSelected();
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg transition-all font-semibold ${
                      isDark
                        ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                        : 'bg-orange-500/20 text-orange-700 hover:bg-orange-500/30'
                    }`}
                  >
                    Ungroup
                  </button>
                  <button
                    onClick={() => {
                      deleteSelected();
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg transition-all font-semibold ${
                      isDark
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        : 'bg-red-500/20 text-red-700 hover:bg-red-500/30'
                    }`}
                  >
                    Delete Group
                  </button>
                </div>
              </div>
            );
          })()}

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
        <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0 space-y-2">
          <div className="text-xs text-gray-500 text-center">
            {nodes.length} nodes • {edges.length} connections
          </div>
          <button
            onClick={() => {
              if (allAnimationsRunning) {
                // Stop all animations
                setAnimationConfigs(prev => {
                  const updated = { ...prev };
                  Object.keys(updated).forEach(key => {
                    updated[key] = { ...updated[key], enabled: false };
                  });
                  return updated;
                });
                setPackets([]);
              } else {
                // Start all animations
                setAnimationConfigs(prev => {
                  const updated = { ...prev };
                  Object.keys(updated).forEach(key => {
                    updated[key] = { ...updated[key], enabled: true };
                  });
                  return updated;
                });
              }
            }}
            disabled={Object.keys(animationConfigs).length === 0}
            className={`w-full py-2 px-3 rounded-lg transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md border ${
              allAnimationsRunning
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 border-orange-400 hover:shadow-orange-500/50'
                : 'bg-[#000F22] hover:bg-[#001933] text-[#00D4FF] border-[#00D4FF] hover:shadow-[#00D4FF]/50'
            }`}
          >
            {allAnimationsRunning ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
                Stop All
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Unified Toolbar */}
        <div className={`backdrop-blur-xl border-b px-3 sm:px-6 py-3 flex-shrink-0 relative z-[10000] ${
          isDark
            ? 'bg-gradient-to-r from-gray-900/95 via-slate-900/95 to-gray-900/95 border-white/10'
            : 'bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 border-gray-200/80 shadow-lg'
        }`}>
          <div className="flex items-center justify-between gap-2">
            {/* Sidebar Toggle (Mobile Only) */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`md:hidden p-2 rounded-lg transition-all hover:scale-110 flex-shrink-0 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
              title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>

            {/* Left Side - Title (Hidden below 1600px) */}
            {viewportWidth >= 1600 && (
              <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <h1 className={`text-base xl:text-xl font-bold drop-shadow-lg truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentProjectName}</h1>
              </div>
            )}

            {/* Right Side - All Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Quick Node Creation */}
              <div className="hidden lg:flex items-center gap-1 border-r border-white/20 pr-3">
                <button
                  onClick={() => createNodeFromTemplate(NODE_TEMPLATES.find(t => t.type === 'service')!, 100, 100)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                  title="Add Service Node"
                >
                  <Server className="w-4 h-4" />
                </button>
                <button
                  onClick={() => createNodeFromTemplate(NODE_TEMPLATES.find(t => t.type === 'database')!, 150, 100)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                  title="Add Database Node"
                >
                  <Database className="w-4 h-4" />
                </button>
                <button
                  onClick={() => createNodeFromTemplate(NODE_TEMPLATES.find(t => t.type === 'cloud')!, 200, 100)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                  title="Add Cloud Service"
                >
                  <Cloud className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Actions */}
              <div className="flex items-center gap-1 border-r border-white/20 pr-3">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="w-4 h-4" />
                </button>
                <button
                  onClick={duplicateSelected}
                  disabled={!selectedNode && selectedNodes.size === 0}
                  className={`hidden sm:inline-flex p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                  title="Duplicate Selection (Ctrl+D)"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={createGroupFromSelected}
                  disabled={selectedNodes.size < 2}
                  className="hidden md:inline-flex p-2 rounded-lg hover:bg-teal-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-teal-400 hover:text-teal-300 hover:scale-110"
                  title="Group Selected Nodes (Ctrl+G)"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={deleteSelected}
                  disabled={!selectedNode && !selectedEdge && !selectedGroup && selectedNodes.size === 0}
                  className="p-2 rounded-lg hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-red-400 hover:text-red-300 hover:scale-110"
                  title="Delete Selection (Del)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Layout Controls */}
              <div className="hidden sm:flex items-center gap-1 border-r border-white/20 pr-3">
                <div className="relative z-[10001]" data-layout-menu>
                  <button
                    ref={layoutButtonRef}
                    onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                    disabled={nodes.length === 0 || isLayouting}
                    className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                    title="Auto Layout"
                  >
                    {isLayouting ? (
                      <div className="w-4 h-4 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                    ) : (
                      <Workflow className="w-4 h-4" />
                    )}
                  </button>

                  {showLayoutMenu && (
                    <div className={`absolute top-full left-0 mt-1 ${isDark ? 'bg-gray-900/90' : getThemeStyles().background} backdrop-blur-xl ${getThemeStyles().border} rounded-xl shadow-2xl ${isDark ? 'shadow-black/50' : 'shadow-gray-900/20'} min-w-[180px]`} style={{ zIndex: 10000 }}>
                      <div className="p-2">
                        <div className={`text-xs font-semibold ${getThemeStyles().textMuted} mb-2 px-2`}>Layout Algorithms</div>
                        <button
                          onClick={() => applyAutoLayout('horizontal')}
                          className={`w-full text-left px-3 py-2 text-sm ${getThemeStyles().textSecondary} ${getThemeStyles().hoverBg} hover:${getThemeStyles().text} rounded-lg flex items-center gap-2 transition-all`}
                        >
                          <ArrowRight className="w-3 h-3" />
                          Horizontal Flow
                        </button>
                        <button
                          onClick={() => applyAutoLayout('vertical')}
                          className={`w-full text-left px-3 py-2 text-sm ${getThemeStyles().textSecondary} ${getThemeStyles().hoverBg} hover:${getThemeStyles().text} rounded-lg flex items-center gap-2 transition-all`}
                        >
                          <ArrowRight className="w-3 h-3 rotate-90" />
                          Vertical Flow
                        </button>
                        <button
                          onClick={() => applyAutoLayout('tree')}
                          className={`w-full text-left px-3 py-2 text-sm ${getThemeStyles().textSecondary} ${getThemeStyles().hoverBg} hover:${getThemeStyles().text} rounded-lg flex items-center gap-2 transition-all`}
                        >
                          <GitBranch className="w-3 h-3" />
                          Tree Layout
                        </button>
                        <button
                          onClick={() => applyAutoLayout('radial')}
                          className={`w-full text-left px-3 py-2 text-sm ${getThemeStyles().textSecondary} ${getThemeStyles().hoverBg} hover:${getThemeStyles().text} rounded-lg flex items-center gap-2 transition-all`}
                        >
                          <Radio className="w-3 h-3" />
                          Radial Layout
                        </button>
                        <button
                          onClick={() => applyAutoLayout('force')}
                          className={`w-full text-left px-3 py-2 text-sm ${getThemeStyles().textSecondary} ${getThemeStyles().hoverBg} hover:${getThemeStyles().text} rounded-lg flex items-center gap-2 transition-all`}
                        >
                          <Zap className="w-3 h-3" />
                          Force Layout
                        </button>
                        <button
                          onClick={() => applyAutoLayout('compact')}
                          className={`w-full text-left px-3 py-2 text-sm ${getThemeStyles().textSecondary} ${getThemeStyles().hoverBg} hover:${getThemeStyles().text} rounded-lg flex items-center gap-2 transition-all`}
                        >
                          <Layers className="w-3 h-3" />
                          Compact Layout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* View Controls */}
              <div className="hidden md:flex items-center gap-1 border-r border-white/20 pr-3">
                <button
                  onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }))}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom * 0.8) }))}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
                  className={`hidden lg:inline-flex p-2 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                  title="Reset View (Ctrl+0)"
                >
                  <Maximize className="w-4 h-4" />
                </button>
                <div className={`hidden lg:block text-xs ${getThemeStyles().textMuted} font-medium px-2 min-w-[45px] text-center bg-white/5 rounded-lg py-1`}>
                  {Math.round(viewport.zoom * 100)}%
                </div>
              </div>

              {/* File Operations */}
              <div className="flex items-center gap-1 border-r border-white/20 pr-2 sm:pr-3">
                <button
                  onClick={saveProject}
                  disabled={!projectId || projectId === 'demo'}
                  className={`relative p-2 rounded-lg transition-all hover:scale-110 ${
                    !projectId || projectId === 'demo'
                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                      : hasUnsavedChanges
                      ? 'hover:bg-orange-500/20 text-orange-400 hover:text-orange-300'
                      : 'hover:bg-green-500/20 text-green-400 hover:text-green-300'
                  }`}
                  title={
                    !projectId || projectId === 'demo'
                      ? 'Cannot save demo project'
                      : hasUnsavedChanges
                      ? 'Save Project - You have unsaved changes (Ctrl+S)'
                      : 'Save Project (Ctrl+S)'
                  }
                >
                  <Save className="w-4 h-4" />
                  {hasUnsavedChanges && projectId && projectId !== 'demo' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => {
                    loadSavedDiagramsRef.current();
                    setShowLoadDialog(true);
                  }}
                  className="p-2 rounded-lg hover:bg-blue-500/20 transition-all text-blue-400 hover:text-blue-300 hover:scale-110"
                  title="Load Diagram from Cloud"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowTemplatesDialog(true)}
                  className="p-2 rounded-lg hover:bg-purple-500/20 transition-all text-purple-400 hover:text-purple-300 hover:scale-110"
                  title="Load Template Diagram"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>

              {/* Theme Toggle */}
              <div className="hidden md:block border-r border-white/20 pr-3">
                <CanvasThemeToggle />
              </div>

              {/* Export Dropdown */}
              <div className="relative hidden md:block">
                <button
                  ref={exportButtonRef}
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-200 text-sm font-semibold shadow-lg shadow-teal-500/30 hover:scale-105"
                  onClick={() => {
                    if (exportButtonRef.current) {
                      const rect = exportButtonRef.current.getBoundingClientRect();
                      setExportMenuPosition({
                        top: rect.bottom + 8,
                        right: window.innerWidth - rect.right
                      });
                    }
                    setShowExportMenu(!showExportMenu);
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                {showExportMenu && typeof window !== 'undefined' && createPortal(
                  <div
                    className={`fixed w-48 backdrop-blur-xl rounded-xl shadow-2xl border z-[9999] ${
                      isDark
                        ? 'bg-gray-900/98 shadow-black/50 border-white/20'
                        : 'bg-white/95 shadow-gray-500/20 border-gray-200/80'
                    }`}
                    style={{
                      top: `${exportMenuPosition.top}px`,
                      right: `${exportMenuPosition.right}px`
                    }}
                    onMouseLeave={() => setShowExportMenu(false)}
                  >
                  <button
                    onClick={() => handleExport('png')}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-all ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <Image className="w-4 h-4" aria-hidden="true" />
                    Export as PNG
                    <span className={`ml-auto text-xs ${getThemeStyles().textMuted}`}>Ctrl+E</span>
                  </button>
                  <button
                    onClick={() => handleExport('svg')}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-all ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <Image className="w-4 h-4" aria-hidden="true" />
                    Export as SVG
                    <span className={`ml-auto text-xs ${getThemeStyles().textMuted}`}>Ctrl+Shift+E</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-all ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <FileText className="w-4 h-4" />
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('jpg')}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-all ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <Image className="w-4 h-4" aria-hidden="true" />
                    Export as JPG
                  </button>
                  <hr className={isDark ? 'border-white/10' : 'border-gray-200/50'} />
                  <button
                    onClick={() => {
                      setShowVideoExportPanel(true);
                      setShowExportMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-all ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <Video className="w-4 h-4" />
                    Export Video...
                    <span className={`ml-auto text-xs ${getThemeStyles().textMuted}`}>New</span>
                  </button>
                  <hr className={isDark ? 'border-white/10' : 'border-gray-200/50'} />
                  <button
                    onClick={() => setShowExportDialog(true)}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-all ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <Settings className="w-4 h-4" />
                    Export Options...
                  </button>
                  <button
                    onClick={exportAsJSON}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-all border-t ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white border-white/10' : 'hover:bg-gray-100 hover:text-gray-900 border-gray-200/50'}`}
                  >
                    <FileJson className="w-4 h-4" />
                    Export as JSON
                    <span className={`ml-auto text-xs ${getThemeStyles().textMuted}`}>Ctrl+J</span>
                  </button>
                  <label className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm cursor-pointer border-t transition-all ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white border-white/10' : 'hover:bg-gray-100 hover:text-gray-900 border-gray-200/50'}`}>
                    <Save className="w-4 h-4" />
                    Import JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={importFromJSON}
                      className="hidden"
                    />
                  </label>
                </div>,
                document.body
              )}
              </div>

              {/* Performance Stats */}
              <button
                onClick={() => setShowPerformanceStats(!showPerformanceStats)}
                className={`hidden md:inline-flex p-2 rounded-lg transition-all ${
                  showPerformanceStats
                    ? 'bg-teal-500/20 text-teal-300 scale-110'
                    : `${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'} hover:scale-110`
                }`}
                title="Toggle Performance Stats"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              {/* Help */}
              <button
                onClick={() => setShowHelp(true)}
                className={`hidden md:inline-flex p-2 rounded-lg transition-all hover:scale-110 ${isDark ? 'hover:bg-white/10 text-white/80 hover:text-white' : 'hover:bg-slate-200/60 text-slate-600 hover:text-slate-800'}`}
                title="Show Help (? key)"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Theme Toggle (Mobile Only) */}
              <div className="md:hidden">
                <CanvasThemeToggle />
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={() => {
                    if (profileButtonRef.current) {
                      const rect = profileButtonRef.current.getBoundingClientRect();
                      setProfileMenuPosition({
                        top: rect.bottom + 8,
                        right: window.innerWidth - rect.right
                      });
                    }
                    setShowProfileMenu(!showProfileMenu);
                  }}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                  title="Profile Menu"
                >
                  {user?.photoURL ? (
                    <div className="w-7 h-7 md:w-6 md:h-6 rounded-full ring-2 ring-teal-400/50 overflow-hidden relative flex-shrink-0">
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 md:w-6 md:h-6 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <span className={`hidden md:inline text-sm font-medium max-w-[120px] truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.displayName || user?.email || 'User'}
                  </span>
                </button>

                {showProfileMenu && typeof window !== 'undefined' && createPortal(
                  <div
                    className={`fixed w-64 backdrop-blur-xl rounded-xl shadow-2xl border z-[9999] ${
                      isDark
                        ? 'bg-gray-900/98 shadow-black/50 border-white/20'
                        : 'bg-white/95 shadow-gray-500/20 border-gray-200/80'
                    }`}
                    style={{
                      top: `${profileMenuPosition.top}px`,
                      right: `${profileMenuPosition.right}px`
                    }}
                  >
                    <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200/50'}`}>
                      <div className="flex items-center gap-3">
                        {user?.photoURL ? (
                          <div className="w-10 h-10 rounded-full ring-2 ring-teal-400/50 overflow-hidden relative">
                            <img
                              src={user.photoURL}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-medium">
                              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user?.displayName || 'User'}
                          </p>
                          <p className={`text-xs ${getThemeStyles().textMuted} truncate`}>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleActionWithSaveCheck(() => {
                            // Navigate to dashboard
                            window.location.href = '/';
                          });
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-all ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                      >
                        <Square className="w-4 h-4" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowProfileSettings(true);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-all ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                      >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowKeyboardShortcuts(true);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-all ${getThemeStyles().textSecondary} ${isDark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
                      >
                        <HelpCircle className="w-4 h-4" />
                        Help & Shortcuts
                      </button>

                      <div className={`border-t my-1 ${isDark ? 'border-white/10' : 'border-gray-200/50'}`}></div>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleActionWithSaveCheck(async () => {
                            const auth = getFirebaseAuth();
                            if (auth) {
                              try {
                                await signOut(auth);
                                window.location.href = '/';
                              } catch (error) {
                                console.error('Error signing out:', error);
                              }
                            }
                          });
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-all ${
                          isDark
                            ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
                            : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {/* Fixed Project Label (Visible below 1600px viewport width) */}
          {viewportWidth < 1600 && (
            <div className={`absolute top-4 left-4 z-10 flex items-center gap-2 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border ${
              isDark
                ? 'bg-gray-900/90 border-gray-700'
                : 'bg-white/90 border-gray-200'
            }`}>
              <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-blue-600 rounded-md flex items-center justify-center shadow-md">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <h1 className={`text-sm font-bold truncate max-w-[150px] sm:max-w-[200px] ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentProjectName}</h1>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full ${
              isDark
                ? 'bg-gray-900'
                : 'bg-gradient-to-br from-gray-50 to-white shadow-inner'
            } ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
                          { keys: ['Ctrl', 'S'], desc: 'Save Project' },
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


          {/* Load Dialog */}
          {showLoadDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] mx-4 ${
                isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200/80'
              }`}>
                <div className={`p-6 border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-xl font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Load Diagram</h2>
                    <button
                      onClick={() => setShowLoadDialog(false)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${
                        isDark ? 'border-blue-400' : 'border-blue-600'
                      }`}></div>
                      <p className={`mt-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>Loading diagrams...</p>
                    </div>
                  ) : savedDiagrams.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderOpen className={`w-12 h-12 mx-auto mb-4 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <p className={`${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>No saved diagrams found</p>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>Create and save your first diagram!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedDiagrams.map((diagram) => (
                        <div
                          key={diagram.id}
                          className={`border rounded-lg p-4 transition-colors ${
                            isDark
                              ? 'border-gray-700 hover:border-blue-500 bg-gray-800/50'
                              : 'border-gray-200 hover:border-blue-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`font-medium ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>{diagram.title}</h3>
                              <div className={`flex items-center gap-4 mt-2 text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <span>{diagram.nodes?.length || 0} nodes</span>
                                <span>{diagram.edges?.length || 0} connections</span>
                                <span>{diagram.groups?.length || 0} groups</span>
                                <span>
                                  {typeof diagram.createdAt === 'string'
                                    ? diagram.createdAt
                                    : diagram.createdAt?.toDate
                                    ? new Date(diagram.createdAt.toDate()).toLocaleDateString()
                                    : 'Unknown date'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => loadDiagram(diagram.id)}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                  isDark
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                Load
                              </button>
                              <button
                                onClick={() => deleteDiagram(diagram.id)}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                  isDark
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
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
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className={`rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] mx-4 ${
                isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200/80'
              }`}>
                <div className={`p-6 border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-xl font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>Diagram Templates</h2>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>Start with a pre-built architecture pattern</p>
                    </div>
                    <button
                      onClick={() => setShowTemplatesDialog(false)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      }`}
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
                        className={`border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                          isDark
                            ? 'border-gray-700 hover:border-purple-500 bg-gray-800'
                            : 'border-gray-200 hover:border-purple-300 bg-white'
                        }`}
                        onClick={() => loadTemplate(template.id)}
                      >
                        {/* Template Preview */}
                        <div className={`h-32 p-4 flex items-center justify-center relative ${
                          isDark
                            ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20'
                            : 'bg-gradient-to-br from-purple-50 to-blue-50'
                        }`}>
                          <div className="text-center">
                            <div className={`w-16 h-16 mx-auto rounded-lg flex items-center justify-center mb-2 ${
                              isDark ? 'bg-purple-800/50' : 'bg-purple-100'
                            }`}>
                              {template.category === 'Architecture' && <Server className={`w-8 h-8 ${
                                isDark ? 'text-purple-400' : 'text-purple-600'
                              }`} />}
                              {template.category === 'Cloud' && <Cloud className={`w-8 h-8 ${
                                isDark ? 'text-purple-400' : 'text-purple-600'
                              }`} />}
                              {template.category === 'Network' && <Network className={`w-8 h-8 ${
                                isDark ? 'text-purple-400' : 'text-purple-600'
                              }`} />}
                            </div>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              isDark
                                ? 'bg-purple-800/50 text-purple-300'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {template.category}
                            </span>
                          </div>
                        </div>

                        {/* Template Info */}
                        <div className="p-4">
                          <h3 className={`font-semibold mb-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{template.name}</h3>
                          <p className={`text-sm mb-3 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>{template.description}</p>

                          <div className={`flex items-center justify-between text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <div className="flex items-center gap-3">
                              <span>{template.nodes.length} nodes</span>
                              <span>{template.edges.length} connections</span>
                              {template.groups.length > 0 && <span>{template.groups.length} groups</span>}
                            </div>
                            <button className={`px-3 py-1 rounded transition-colors ${
                              isDark
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}>
                              Use
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Section */}
                  <div className={`mt-8 p-4 rounded-lg border ${
                    isDark
                      ? 'bg-gray-800/50 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-3 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Create Your Own</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                          isDark
                            ? 'border-gray-600 hover:border-purple-500 hover:bg-purple-900/20'
                            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}
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
                        <Plus className={`w-8 h-8 mx-auto mb-2 ${
                          isDark ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <h4 className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>Blank Canvas</h4>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>Start from scratch</p>
                      </div>

                      <div className={`border rounded-lg p-6 text-center ${
                        isDark
                          ? 'border-gray-700 bg-gray-800'
                          : 'border-gray-200 bg-white'
                      }`}>
                        <FileJson className={`w-8 h-8 mx-auto mb-2 ${
                          isDark ? 'text-blue-400' : 'text-blue-500'
                        }`} />
                        <h4 className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>Import JSON</h4>
                        <p className={`text-sm mb-3 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}>Load exported diagram</p>
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
                                    showNotification('Diagram imported successfully!', 'success');
                                  }
                                } catch {
                                  showNotification('Invalid JSON file', 'error');
                                }
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="import-json"
                          className={`px-3 py-1 text-sm rounded cursor-pointer transition-colors ${
                            isDark
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
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

          {/* Export Options Dialog */}
          {showExportDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Export Options</h2>

                  <div className="space-y-4">
                    {/* Format Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as 'png' | 'svg' | 'pdf' | 'jpg')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="png">PNG (Recommended)</option>
                        <option value="svg">SVG (Vector)</option>
                        <option value="pdf">PDF (Document)</option>
                        <option value="jpg">JPG (Compressed)</option>
                      </select>
                    </div>

                    {/* Quality/Scale Settings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scale/Quality: {exportFormat === 'jpg' ? Math.round(exportOptions.quality * 100) + '%' : exportOptions.scale + 'x'}
                      </label>
                      <input
                        type="range"
                        min={exportFormat === 'jpg' ? 0.1 : 1}
                        max={exportFormat === 'jpg' ? 1 : 4}
                        step={exportFormat === 'jpg' ? 0.05 : 0.5}
                        value={exportFormat === 'jpg' ? exportOptions.quality : exportOptions.scale}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (exportFormat === 'jpg') {
                            setExportOptions(prev => ({ ...prev, quality: value }));
                          } else {
                            setExportOptions(prev => ({ ...prev, scale: value }));
                          }
                        }}
                        className="w-full"
                      />
                    </div>

                    {/* Theme Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                      <select
                        value={exportOptions.theme}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, theme: e.target.value as 'current' | 'light' | 'dark' }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="current">Current Theme</option>
                        <option value="light">Light Theme</option>
                        <option value="dark">Dark Theme</option>
                      </select>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeBackground}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeBackground: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Include background</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeGrid}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeGrid: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Include grid</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exportOptions.includeBranding}
                          onChange={(e) => setExportOptions(prev => ({ ...prev, includeBranding: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Include NexFlow watermark</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowExportDialog(false)}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleExport();
                        setShowExportDialog(false);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Export {exportFormat.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Stats */}
          {showPerformanceStats && (
            <div className="hidden md:block absolute bottom-6 left-6 w-64 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Performance Stats</span>
                  <button
                    onClick={() => setShowPerformanceStats(false)}
                    className="ml-auto p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="p-3 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600 dark:text-gray-400">Nodes:</div>
                  <div className="text-gray-900 dark:text-white font-mono">
                    {performanceStats.visibleNodes}/{performanceStats.totalNodes}
                  </div>

                  <div className="text-gray-600 dark:text-gray-400">Edges:</div>
                  <div className="text-gray-900 dark:text-white font-mono">
                    {performanceStats.visibleEdges}/{performanceStats.totalEdges}
                  </div>

                  <div className="text-gray-600 dark:text-gray-400">Groups:</div>
                  <div className="text-gray-900 dark:text-white font-mono">
                    {performanceStats.visibleGroups}/{performanceStats.totalGroups}
                  </div>

                  <div className="text-gray-600 dark:text-gray-400">Render:</div>
                  <div className="text-gray-900 dark:text-white font-mono">
                    {performanceStats.lastRenderTime.toFixed(2)}ms
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Culling saves {Math.round(((performanceStats.totalNodes + performanceStats.totalEdges + performanceStats.totalGroups) - (performanceStats.visibleNodes + performanceStats.visibleEdges + performanceStats.visibleGroups)) / Math.max(1, performanceStats.totalNodes + performanceStats.totalEdges + performanceStats.totalGroups) * 100)}% of rendering
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Minimap */}
          <div className="hidden md:block absolute bottom-6 right-6 w-48 h-36 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-10">
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
              {/* Viewport indicator (behind nodes) */}
              <div
                className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-20 rounded"
                style={{
                  left: `${Math.max(0, -viewport.x * 0.08 + 4)}px`,
                  top: `${Math.max(0, -viewport.y * 0.08 + 4)}px`,
                  width: `${Math.min(180, (canvasRef.current?.getBoundingClientRect().width || 1000) * 0.08 / viewport.zoom)}px`,
                  height: `${Math.min(108, (canvasRef.current?.getBoundingClientRect().height || 700) * 0.08 / viewport.zoom)}px`,
                  zIndex: 0
                }}
              />

              {/* Minimap nodes (on top) */}
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
                      opacity: selectedNodes.has(node.id) || selectedNode === node.id ? 1 : 0.7,
                      zIndex: 10
                    }}
                  />
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Custom Node Builder */}
      <CustomNodeBuilder
        isOpen={showCustomNodeBuilder}
        onClose={() => setShowCustomNodeBuilder(false)}
        onSave={handleSaveCustomNodeTemplate}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onSave={saveAndContinue}
        onDiscard={discardChangesAndContinue}
        isSaving={isSaving}
      />

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto ${
            isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200/80'
          }`}>
            {/* Header */}
            <div className={`p-6 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Profile Settings</h2>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Manage your account information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileSettings(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Profile Information */}
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  {user?.photoURL ? (
                    <div className="w-16 h-16 rounded-full ring-2 ring-teal-400/50 overflow-hidden relative">
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl font-medium">
                        {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {userProfile?.displayName || user?.displayName || 'User'}
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Display Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Display Name
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    placeholder="Enter display name..."
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    maxLength={50}
                  />
                  <button
                    onClick={handleUpdateDisplayName}
                    disabled={isUpdatingProfile || !newDisplayName.trim() || newDisplayName === userProfile?.displayName}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      isUpdatingProfile || !newDisplayName.trim() || newDisplayName === userProfile?.displayName
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  This name will be displayed in your projects and shared diagrams
                </p>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed opacity-75 ${
                    isDark
                      ? 'bg-gray-800/50 border-gray-600 text-gray-400'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Email address cannot be changed
                </p>
              </div>

              {/* Account Statistics */}
              {userStats && (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Account Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg text-center ${
                      isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}>
                      <div className={`text-2xl font-bold ${
                        isDark ? 'text-teal-400' : 'text-teal-600'
                      }`}>
                        {userStats.projectCount}
                      </div>
                      <div className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Projects
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${
                      isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}>
                      <div className={`text-2xl font-bold ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {userStats.totalNodes}
                      </div>
                      <div className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Total Nodes
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${
                      isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}>
                      <div className={`text-2xl font-bold ${
                        isDark ? 'text-purple-400' : 'text-purple-600'
                      }`}>
                        {userStats.totalEdges}
                      </div>
                      <div className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Total Connections
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${
                      isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}>
                      <div className={`text-sm font-semibold ${
                        isDark ? 'text-green-400' : 'text-green-600'
                      }`}>
                        Member Since
                      </div>
                      <div className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {userStats.memberSince}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowProfileSettings(false)}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.visible && (
        <div className="fixed top-4 right-4 z-[10002] transition-all duration-300 ease-out animate-in slide-in-from-right">
          <div className={`rounded-xl shadow-2xl backdrop-blur-sm px-4 py-3 flex items-center gap-3 min-w-[320px] max-w-[450px] border-2 ${
            notification.type === 'success'
              ? 'bg-gradient-to-r from-green-500/95 to-emerald-500/95 text-white border-green-400/50 shadow-green-500/25'
              : notification.type === 'error'
              ? 'bg-gradient-to-r from-red-500/95 to-rose-500/95 text-white border-red-400/50 shadow-red-500/25'
              : 'bg-gradient-to-r from-blue-500/95 to-cyan-500/95 text-white border-blue-400/50 shadow-blue-500/25'
          }`}>
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 drop-shadow-sm" />}
              {notification.type === 'error' && <X className="w-5 h-5 drop-shadow-sm" />}
              {notification.type === 'info' && <HelpCircle className="w-5 h-5 drop-shadow-sm" />}
            </div>
            <div className="flex-1 text-sm font-medium drop-shadow-sm">
              {notification.message}
            </div>
            <button
              onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        isLoading={confirmModal.isLoading}
      />

      {/* Video Export Panel */}
      <VideoExportPanel
        canvasRef={canvasRef}
        isVisible={showVideoExportPanel}
        onClose={() => setShowVideoExportPanel(false)}
        onRecordingStop={handleCanvasResize}
      />
    

      {/* === Mobile Bottom Toolbar (≤ md) === */}
      <div className={`md:hidden fixed bottom-0 inset-x-0 z-[95] border-t ${isDark ? 'bg-gray-950/90 border-white/10' : 'bg-white/90 border-gray-200/70'} backdrop-blur-xl`}>
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          <button
            onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom * 0.8) }))}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${getThemeStyles().hoverBg} ${getThemeStyles().textSecondary}`}
            aria-label="Zoom Out"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
            <span className="text-[10px]">Out</span>
          </button>

          <button
            onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${getThemeStyles().hoverBg} ${getThemeStyles().textSecondary}`}
            aria-label="Reset View"
            title="Reset View"
          >
            <Maximize className="w-5 h-5" />
            <span className="text-[10px]">Reset</span>
          </button>

          <button
            onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }))}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${getThemeStyles().hoverBg} ${getThemeStyles().textSecondary}`}
            aria-label="Zoom In"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
            <span className="text-[10px]">In</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsMobileOverflowOpen(v => !v)}
              className={`w-full flex flex-col items-center gap-1 p-2 rounded-lg ${getThemeStyles().hoverBg} ${isDark ? 'text-white' : 'text-gray-700'}`}
              aria-haspopup="menu"
              aria-expanded={isMobileOverflowOpen}
              title="More"
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>

            {isMobileOverflowOpen && (
              <div
                role="menu"
                className={`absolute bottom-12 right-0 min-w-[220px] rounded-xl shadow-2xl p-2 z-[96] backdrop-blur-xl ${
                  isDark
                    ? 'bg-gray-900/95 border border-gray-700'
                    : 'bg-white/95 shadow-md border border-gray-200/70'
                }`}
              >
                <div className={`grid grid-cols-2 gap-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <button onClick={saveProject} className={`flex items-center gap-2 p-2 rounded-lg ${getThemeStyles().hoverBg}`}>
                    <Save className="w-4 h-4" /><span className="text-sm">Save</span>
                  </button>
                  <button onClick={() => { loadSavedDiagramsRef.current(); setShowLoadDialog(true); setIsMobileOverflowOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg ${getThemeStyles().hoverBg}`}>
                    <FolderOpen className="w-4 h-4" /><span className="text-sm">Load</span>
                  </button>
                  <button onClick={() => { setShowExportDialog(true); setIsMobileOverflowOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg ${getThemeStyles().hoverBg}`}>
                    <Download className="w-4 h-4" /><span className="text-sm">Export</span>
                  </button>
                  <button onClick={() => { setShowLayoutMenu(v => !v); setIsMobileOverflowOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg ${getThemeStyles().hoverBg}`}>
                    <Workflow className="w-4 h-4" /><span className="text-sm">Layout</span>
                  </button>
                  <button onClick={() => { setShowVideoExportPanel(true); setIsMobileOverflowOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg ${getThemeStyles().hoverBg}`}>
                    <Video className="w-4 h-4" /><span className="text-sm">Video</span>
                  </button>
                  <button onClick={() => { setShowKeyboardShortcuts(true); setIsMobileOverflowOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg ${getThemeStyles().hoverBg}`}>
                    <HelpCircle className="w-4 h-4" /><span className="text-sm">Shortcuts</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
</div>
  );
};

export default ModernDiagramCanvas;