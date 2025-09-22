import type { Project } from './projectStorage';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  isBuiltIn: boolean;
  authorName?: string;
  data: {
    nodes: TemplateNode[];
    edges: TemplateEdge[];
    groups?: TemplateGroup[];
  };
  stats: {
    nodeCount: number;
    edgeCount: number;
    groupCount: number;
  };
}

interface TemplateNode {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
  borderColor: string;
  textColor: string;
  shape: string;
  [key: string]: unknown;
}

interface TemplateEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: string;
  targetHandle: string;
  label: string;
  color: string;
  [key: string]: unknown;
}

interface TemplateGroup {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  nodeIds: string[];
  [key: string]: unknown;
}

const TEMPLATES_STORAGE_KEY = 'nexflow-templates';

// Built-in templates
const builtInTemplates: Template[] = [
  // === MICROSERVICES TEMPLATES ===
  {
    id: 'microservices-basic',
    name: 'Basic Microservices',
    description: 'Simple microservices architecture with API gateway, services, and database',
    category: 'microservices',
    tags: ['api', 'services', 'database', 'gateway'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        {
          id: 'api-gateway',
          type: 'gateway',
          x: 200,
          y: 100,
          width: 160,
          height: 80,
          label: 'API Gateway',
          color: '#8b5cf6',
          borderColor: '#6d28d9',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'user-service',
          type: 'service',
          x: 50,
          y: 250,
          width: 140,
          height: 70,
          label: 'User Service',
          color: '#3b82f6',
          borderColor: '#1e40af',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'order-service',
          type: 'service',
          x: 220,
          y: 250,
          width: 140,
          height: 70,
          label: 'Order Service',
          color: '#3b82f6',
          borderColor: '#1e40af',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'payment-service',
          type: 'service',
          x: 390,
          y: 250,
          width: 140,
          height: 70,
          label: 'Payment Service',
          color: '#3b82f6',
          borderColor: '#1e40af',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'user-db',
          type: 'database',
          x: 50,
          y: 380,
          width: 140,
          height: 60,
          label: 'User DB',
          color: '#10b981',
          borderColor: '#047857',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'order-db',
          type: 'database',
          x: 220,
          y: 380,
          width: 140,
          height: 60,
          label: 'Order DB',
          color: '#10b981',
          borderColor: '#047857',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'payment-db',
          type: 'database',
          x: 390,
          y: 380,
          width: 140,
          height: 60,
          label: 'Payment DB',
          color: '#10b981',
          borderColor: '#047857',
          textColor: '#ffffff',
          shape: 'rounded'
        }
      ],
      edges: [
        { id: 'e1', sourceId: 'api-gateway', targetId: 'user-service', sourceHandle: 'output', targetHandle: 'input', label: 'routes', color: '#6b7280' },
        { id: 'e2', sourceId: 'api-gateway', targetId: 'order-service', sourceHandle: 'output', targetHandle: 'input', label: 'routes', color: '#6b7280' },
        { id: 'e3', sourceId: 'api-gateway', targetId: 'payment-service', sourceHandle: 'output', targetHandle: 'input', label: 'routes', color: '#6b7280' },
        { id: 'e4', sourceId: 'user-service', targetId: 'user-db', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e5', sourceId: 'order-service', targetId: 'order-db', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e6', sourceId: 'payment-service', targetId: 'payment-db', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 7, edgeCount: 6, groupCount: 0 }
  },
  {
    id: 'microservices-ecommerce',
    name: 'E-commerce Microservices',
    description: 'Complete e-commerce platform with microservices, message queues, and caching',
    category: 'microservices',
    tags: ['ecommerce', 'redis', 'rabbitmq', 'catalog', 'cart', 'inventory'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // Frontend & Gateway
        { id: 'web-app', type: 'web', x: 100, y: 50, width: 140, height: 70, label: 'Web App', color: '#6366f1', borderColor: '#4f46e5', textColor: '#ffffff', shape: 'rounded' },
        { id: 'mobile-app', type: 'mobile', x: 280, y: 50, width: 140, height: 70, label: 'Mobile App', color: '#6366f1', borderColor: '#4f46e5', textColor: '#ffffff', shape: 'rounded' },
        { id: 'api-gateway', type: 'gateway', x: 200, y: 160, width: 160, height: 80, label: 'API Gateway', color: '#8b5cf6', borderColor: '#6d28d9', textColor: '#ffffff', shape: 'rounded' },

        // Core Services
        { id: 'user-service', type: 'service', x: 50, y: 280, width: 130, height: 70, label: 'User Service', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'catalog-service', type: 'service', x: 200, y: 280, width: 130, height: 70, label: 'Catalog Service', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'cart-service', type: 'service', x: 350, y: 280, width: 130, height: 70, label: 'Cart Service', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'order-service', type: 'service', x: 500, y: 280, width: 130, height: 70, label: 'Order Service', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'payment-service', type: 'service', x: 650, y: 280, width: 130, height: 70, label: 'Payment Service', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'inventory-service', type: 'service', x: 800, y: 280, width: 130, height: 70, label: 'Inventory Service', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },

        // Databases
        { id: 'user-db', type: 'database', x: 50, y: 400, width: 130, height: 60, label: 'User DB', color: '#10b981', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },
        { id: 'catalog-db', type: 'database', x: 200, y: 400, width: 130, height: 60, label: 'Catalog DB', color: '#10b981', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },
        { id: 'order-db', type: 'database', x: 500, y: 400, width: 130, height: 60, label: 'Order DB', color: '#10b981', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },
        { id: 'inventory-db', type: 'database', x: 800, y: 400, width: 130, height: 60, label: 'Inventory DB', color: '#10b981', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Caching & Messaging
        { id: 'redis-cache', type: 'cache', x: 350, y: 400, width: 130, height: 60, label: 'Redis Cache', color: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff', shape: 'rounded' },
        { id: 'message-queue', type: 'queue', x: 650, y: 400, width: 130, height: 60, label: 'Message Queue', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },

        // External Services
        { id: 'payment-gateway', type: 'external', x: 650, y: 160, width: 130, height: 60, label: 'Payment Gateway', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' },
        { id: 'notification-service', type: 'service', x: 950, y: 280, width: 130, height: 70, label: 'Notification Service', color: '#8b5cf6', borderColor: '#7c3aed', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // Frontend to Gateway
        { id: 'e1', sourceId: 'web-app', targetId: 'api-gateway', sourceHandle: 'output', targetHandle: 'input', label: 'HTTP', color: '#6b7280' },
        { id: 'e2', sourceId: 'mobile-app', targetId: 'api-gateway', sourceHandle: 'output', targetHandle: 'input', label: 'HTTP', color: '#6b7280' },

        // Gateway to Services
        { id: 'e3', sourceId: 'api-gateway', targetId: 'user-service', sourceHandle: 'output', targetHandle: 'input', label: 'auth', color: '#6b7280' },
        { id: 'e4', sourceId: 'api-gateway', targetId: 'catalog-service', sourceHandle: 'output', targetHandle: 'input', label: 'products', color: '#6b7280' },
        { id: 'e5', sourceId: 'api-gateway', targetId: 'cart-service', sourceHandle: 'output', targetHandle: 'input', label: 'cart', color: '#6b7280' },
        { id: 'e6', sourceId: 'api-gateway', targetId: 'order-service', sourceHandle: 'output', targetHandle: 'input', label: 'orders', color: '#6b7280' },

        // Service to Database
        { id: 'e7', sourceId: 'user-service', targetId: 'user-db', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e8', sourceId: 'catalog-service', targetId: 'catalog-db', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e9', sourceId: 'order-service', targetId: 'order-db', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e10', sourceId: 'inventory-service', targetId: 'inventory-db', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },

        // Service to Cache
        { id: 'e11', sourceId: 'cart-service', targetId: 'redis-cache', sourceHandle: 'output', targetHandle: 'input', label: 'session', color: '#6b7280' },
        { id: 'e12', sourceId: 'catalog-service', targetId: 'redis-cache', sourceHandle: 'output', targetHandle: 'input', label: 'cache', color: '#6b7280' },

        // Service Communication
        { id: 'e13', sourceId: 'order-service', targetId: 'payment-service', sourceHandle: 'output', targetHandle: 'input', label: 'process', color: '#6b7280' },
        { id: 'e14', sourceId: 'order-service', targetId: 'inventory-service', sourceHandle: 'output', targetHandle: 'input', label: 'reserve', color: '#6b7280' },
        { id: 'e15', sourceId: 'payment-service', targetId: 'payment-gateway', sourceHandle: 'output', targetHandle: 'input', label: 'charge', color: '#6b7280' },

        // Messaging
        { id: 'e16', sourceId: 'order-service', targetId: 'message-queue', sourceHandle: 'output', targetHandle: 'input', label: 'events', color: '#6b7280' },
        { id: 'e17', sourceId: 'payment-service', targetId: 'message-queue', sourceHandle: 'output', targetHandle: 'input', label: 'events', color: '#6b7280' },
        { id: 'e18', sourceId: 'message-queue', targetId: 'notification-service', sourceHandle: 'output', targetHandle: 'input', label: 'notify', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 17, edgeCount: 18, groupCount: 0 }
  },
  {
    id: 'microservices-event-driven',
    name: 'Event-Driven Microservices',
    description: 'Event-driven architecture with CQRS, event sourcing, and saga pattern',
    category: 'microservices',
    tags: ['event-driven', 'cqrs', 'saga', 'event-store', 'kafka'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // API Layer
        { id: 'api-gateway', type: 'gateway', x: 300, y: 50, width: 160, height: 80, label: 'API Gateway', color: '#8b5cf6', borderColor: '#6d28d9', textColor: '#ffffff', shape: 'rounded' },

        // Command Services
        { id: 'user-command', type: 'service', x: 100, y: 180, width: 140, height: 70, label: 'User Command', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'order-command', type: 'service', x: 260, y: 180, width: 140, height: 70, label: 'Order Command', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'inventory-command', type: 'service', x: 420, y: 180, width: 140, height: 70, label: 'Inventory Command', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },

        // Query Services
        { id: 'user-query', type: 'service', x: 100, y: 320, width: 140, height: 70, label: 'User Query', color: '#10b981', borderColor: '#059669', textColor: '#ffffff', shape: 'rounded' },
        { id: 'order-query', type: 'service', x: 260, y: 320, width: 140, height: 70, label: 'Order Query', color: '#10b981', borderColor: '#059669', textColor: '#ffffff', shape: 'rounded' },
        { id: 'inventory-query', type: 'service', x: 420, y: 320, width: 140, height: 70, label: 'Inventory Query', color: '#10b981', borderColor: '#059669', textColor: '#ffffff', shape: 'rounded' },

        // Event Infrastructure
        { id: 'event-bus', type: 'queue', x: 300, y: 250, width: 160, height: 60, label: 'Event Bus (Kafka)', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'event-store', type: 'storage', x: 580, y: 250, width: 140, height: 60, label: 'Event Store', color: '#6366f1', borderColor: '#4f46e5', textColor: '#ffffff', shape: 'rounded' },

        // Saga Orchestrator
        { id: 'order-saga', type: 'service', x: 580, y: 180, width: 140, height: 70, label: 'Order Saga', color: '#8b5cf6', borderColor: '#7c3aed', textColor: '#ffffff', shape: 'rounded' },

        // Read Databases
        { id: 'user-read-db', type: 'database', x: 100, y: 450, width: 140, height: 60, label: 'User Read DB', color: '#10b981', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },
        { id: 'order-read-db', type: 'database', x: 260, y: 450, width: 140, height: 60, label: 'Order Read DB', color: '#10b981', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },
        { id: 'inventory-read-db', type: 'database', x: 420, y: 450, width: 140, height: 60, label: 'Inventory Read DB', color: '#10b981', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Projections
        { id: 'projection-service', type: 'service', x: 740, y: 320, width: 140, height: 70, label: 'Projection Service', color: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // API to Commands
        { id: 'e1', sourceId: 'api-gateway', targetId: 'user-command', sourceHandle: 'output', targetHandle: 'input', label: 'commands', color: '#6b7280' },
        { id: 'e2', sourceId: 'api-gateway', targetId: 'order-command', sourceHandle: 'output', targetHandle: 'input', label: 'commands', color: '#6b7280' },
        { id: 'e3', sourceId: 'api-gateway', targetId: 'inventory-command', sourceHandle: 'output', targetHandle: 'input', label: 'commands', color: '#6b7280' },

        // API to Queries
        { id: 'e4', sourceId: 'api-gateway', targetId: 'user-query', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e5', sourceId: 'api-gateway', targetId: 'order-query', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e6', sourceId: 'api-gateway', targetId: 'inventory-query', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },

        // Commands to Event Bus
        { id: 'e7', sourceId: 'user-command', targetId: 'event-bus', sourceHandle: 'output', targetHandle: 'input', label: 'events', color: '#f59e0b' },
        { id: 'e8', sourceId: 'order-command', targetId: 'event-bus', sourceHandle: 'output', targetHandle: 'input', label: 'events', color: '#f59e0b' },
        { id: 'e9', sourceId: 'inventory-command', targetId: 'event-bus', sourceHandle: 'output', targetHandle: 'input', label: 'events', color: '#f59e0b' },

        // Event Bus to Event Store
        { id: 'e10', sourceId: 'event-bus', targetId: 'event-store', sourceHandle: 'output', targetHandle: 'input', label: 'persist', color: '#6b7280' },

        // Event Bus to Saga
        { id: 'e11', sourceId: 'event-bus', targetId: 'order-saga', sourceHandle: 'output', targetHandle: 'input', label: 'orchestrate', color: '#6b7280' },

        // Saga to Commands
        { id: 'e12', sourceId: 'order-saga', targetId: 'inventory-command', sourceHandle: 'output', targetHandle: 'input', label: 'compensate', color: '#8b5cf6' },

        // Event Bus to Projections
        { id: 'e13', sourceId: 'event-bus', targetId: 'projection-service', sourceHandle: 'output', targetHandle: 'input', label: 'project', color: '#ef4444' },

        // Projections to Read DBs
        { id: 'e14', sourceId: 'projection-service', targetId: 'user-read-db', sourceHandle: 'output', targetHandle: 'input', label: 'update', color: '#6b7280' },
        { id: 'e15', sourceId: 'projection-service', targetId: 'order-read-db', sourceHandle: 'output', targetHandle: 'input', label: 'update', color: '#6b7280' },
        { id: 'e16', sourceId: 'projection-service', targetId: 'inventory-read-db', sourceHandle: 'output', targetHandle: 'input', label: 'update', color: '#6b7280' },

        // Queries to Read DBs
        { id: 'e17', sourceId: 'user-query', targetId: 'user-read-db', sourceHandle: 'output', targetHandle: 'input', label: 'read', color: '#10b981' },
        { id: 'e18', sourceId: 'order-query', targetId: 'order-read-db', sourceHandle: 'output', targetHandle: 'input', label: 'read', color: '#10b981' },
        { id: 'e19', sourceId: 'inventory-query', targetId: 'inventory-read-db', sourceHandle: 'output', targetHandle: 'input', label: 'read', color: '#10b981' }
      ]
    },
    stats: { nodeCount: 14, edgeCount: 19, groupCount: 0 }
  },
  // === CLOUD ARCHITECTURE TEMPLATES ===
  {
    id: 'cloud-aws-basic',
    name: 'AWS Basic Web App',
    description: 'Basic AWS cloud setup with load balancer, EC2 instances, and RDS',
    category: 'cloud',
    tags: ['aws', 'ec2', 'rds', 'load-balancer'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        { id: 'load-balancer', type: 'load-balancer', x: 250, y: 50, width: 160, height: 80, label: 'Application Load Balancer', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'ec2-1', type: 'server', x: 150, y: 200, width: 140, height: 70, label: 'EC2 Instance 1', color: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff', shape: 'rounded' },
        { id: 'ec2-2', type: 'server', x: 350, y: 200, width: 140, height: 70, label: 'EC2 Instance 2', color: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff', shape: 'rounded' },
        { id: 'rds', type: 'database', x: 250, y: 330, width: 160, height: 80, label: 'RDS Database', color: '#10b981', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        { id: 'e1', sourceId: 'load-balancer', targetId: 'ec2-1', sourceHandle: 'output', targetHandle: 'input', label: 'distributes', color: '#6b7280' },
        { id: 'e2', sourceId: 'load-balancer', targetId: 'ec2-2', sourceHandle: 'output', targetHandle: 'input', label: 'distributes', color: '#6b7280' },
        { id: 'e3', sourceId: 'ec2-1', targetId: 'rds', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e4', sourceId: 'ec2-2', targetId: 'rds', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 4, edgeCount: 4, groupCount: 0 }
  },
  {
    id: 'cloud-aws-serverless',
    name: 'AWS Serverless Architecture',
    description: 'Serverless architecture with API Gateway, Lambda, DynamoDB, and S3',
    category: 'cloud',
    tags: ['aws', 'serverless', 'lambda', 'dynamodb', 's3', 'api-gateway'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // Frontend & CDN
        { id: 'cloudfront', type: 'cdn', x: 300, y: 50, width: 160, height: 70, label: 'CloudFront CDN', color: '#ff9500', borderColor: '#e6860b', textColor: '#ffffff', shape: 'rounded' },
        { id: 's3-static', type: 'storage', x: 300, y: 150, width: 160, height: 70, label: 'S3 Static Website', color: '#569a31', borderColor: '#4a8028', textColor: '#ffffff', shape: 'rounded' },

        // API Layer
        { id: 'api-gateway', type: 'gateway', x: 300, y: 270, width: 160, height: 80, label: 'API Gateway', color: '#8b5cf6', borderColor: '#6d28d9', textColor: '#ffffff', shape: 'rounded' },

        // Lambda Functions
        { id: 'auth-lambda', type: 'function', x: 100, y: 400, width: 130, height: 70, label: 'Auth Lambda', color: '#ff9500', borderColor: '#e6860b', textColor: '#ffffff', shape: 'rounded' },
        { id: 'users-lambda', type: 'function', x: 250, y: 400, width: 130, height: 70, label: 'Users Lambda', color: '#ff9500', borderColor: '#e6860b', textColor: '#ffffff', shape: 'rounded' },
        { id: 'orders-lambda', type: 'function', x: 400, y: 400, width: 130, height: 70, label: 'Orders Lambda', color: '#ff9500', borderColor: '#e6860b', textColor: '#ffffff', shape: 'rounded' },
        { id: 'notifications-lambda', type: 'function', x: 550, y: 400, width: 130, height: 70, label: 'Notifications Lambda', color: '#ff9500', borderColor: '#e6860b', textColor: '#ffffff', shape: 'rounded' },

        // Databases
        { id: 'dynamodb-users', type: 'database', x: 100, y: 530, width: 130, height: 60, label: 'DynamoDB Users', color: '#3f48cc', borderColor: '#353c9f', textColor: '#ffffff', shape: 'rounded' },
        { id: 'dynamodb-orders', type: 'database', x: 400, y: 530, width: 130, height: 60, label: 'DynamoDB Orders', color: '#3f48cc', borderColor: '#353c9f', textColor: '#ffffff', shape: 'rounded' },

        // Messaging & Storage
        { id: 'sqs-queue', type: 'queue', x: 550, y: 530, width: 130, height: 60, label: 'SQS Queue', color: '#ff4b4b', borderColor: '#e63333', textColor: '#ffffff', shape: 'rounded' },
        { id: 's3-uploads', type: 'storage', x: 250, y: 530, width: 130, height: 60, label: 'S3 Uploads', color: '#569a31', borderColor: '#4a8028', textColor: '#ffffff', shape: 'rounded' },

        // Authentication
        { id: 'cognito', type: 'auth', x: 100, y: 270, width: 130, height: 70, label: 'Cognito User Pool', color: '#dd344c', borderColor: '#c12a3a', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // Frontend Flow
        { id: 'e1', sourceId: 'cloudfront', targetId: 's3-static', sourceHandle: 'output', targetHandle: 'input', label: 'serves', color: '#6b7280' },
        { id: 'e2', sourceId: 's3-static', targetId: 'api-gateway', sourceHandle: 'output', targetHandle: 'input', label: 'API calls', color: '#6b7280' },

        // Authentication
        { id: 'e3', sourceId: 'api-gateway', targetId: 'cognito', sourceHandle: 'output', targetHandle: 'input', label: 'auth', color: '#6b7280' },

        // API to Lambda
        { id: 'e4', sourceId: 'api-gateway', targetId: 'auth-lambda', sourceHandle: 'output', targetHandle: 'input', label: 'auth', color: '#6b7280' },
        { id: 'e5', sourceId: 'api-gateway', targetId: 'users-lambda', sourceHandle: 'output', targetHandle: 'input', label: 'users', color: '#6b7280' },
        { id: 'e6', sourceId: 'api-gateway', targetId: 'orders-lambda', sourceHandle: 'output', targetHandle: 'input', label: 'orders', color: '#6b7280' },

        // Lambda to DynamoDB
        { id: 'e7', sourceId: 'auth-lambda', targetId: 'cognito', sourceHandle: 'output', targetHandle: 'input', label: 'validate', color: '#6b7280' },
        { id: 'e8', sourceId: 'users-lambda', targetId: 'dynamodb-users', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e9', sourceId: 'orders-lambda', targetId: 'dynamodb-orders', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },

        // Lambda to S3
        { id: 'e10', sourceId: 'users-lambda', targetId: 's3-uploads', sourceHandle: 'output', targetHandle: 'input', label: 'uploads', color: '#6b7280' },

        // Async Processing
        { id: 'e11', sourceId: 'orders-lambda', targetId: 'sqs-queue', sourceHandle: 'output', targetHandle: 'input', label: 'events', color: '#6b7280' },
        { id: 'e12', sourceId: 'sqs-queue', targetId: 'notifications-lambda', sourceHandle: 'output', targetHandle: 'input', label: 'triggers', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 12, edgeCount: 12, groupCount: 0 }
  },
  {
    id: 'cloud-aws-microservices',
    name: 'AWS Container Microservices',
    description: 'AWS ECS/EKS microservices with service mesh, monitoring, and CI/CD',
    category: 'cloud',
    tags: ['aws', 'ecs', 'eks', 'containers', 'service-mesh', 'monitoring'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // Load Balancing
        { id: 'alb', type: 'load-balancer', x: 400, y: 50, width: 160, height: 70, label: 'Application LB', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },

        // Container Services
        { id: 'ecs-cluster', type: 'container', x: 400, y: 160, width: 160, height: 80, label: 'ECS Cluster', color: '#ff9500', borderColor: '#e6860b', textColor: '#ffffff', shape: 'rounded' },

        // Microservices
        { id: 'user-service', type: 'service', x: 150, y: 290, width: 130, height: 70, label: 'User Service', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'product-service', type: 'service', x: 300, y: 290, width: 130, height: 70, label: 'Product Service', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'order-service', type: 'service', x: 450, y: 290, width: 130, height: 70, label: 'Order Service', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'payment-service', type: 'service', x: 600, y: 290, width: 130, height: 70, label: 'Payment Service', color: '#3b82f6', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },

        // Service Mesh
        { id: 'service-mesh', type: 'network', x: 400, y: 380, width: 160, height: 60, label: 'App Mesh', color: '#8b5cf6', borderColor: '#7c3aed', textColor: '#ffffff', shape: 'rounded' },

        // Databases
        { id: 'rds-users', type: 'database', x: 150, y: 480, width: 130, height: 60, label: 'RDS Users', color: '#3f48cc', borderColor: '#353c9f', textColor: '#ffffff', shape: 'rounded' },
        { id: 'rds-products', type: 'database', x: 300, y: 480, width: 130, height: 60, label: 'RDS Products', color: '#3f48cc', borderColor: '#353c9f', textColor: '#ffffff', shape: 'rounded' },
        { id: 'rds-orders', type: 'database', x: 450, y: 480, width: 130, height: 60, label: 'RDS Orders', color: '#3f48cc', borderColor: '#353c9f', textColor: '#ffffff', shape: 'rounded' },

        // Caching & Messaging
        { id: 'elasticache', type: 'cache', x: 600, y: 480, width: 130, height: 60, label: 'ElastiCache', color: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff', shape: 'rounded' },
        { id: 'sqs', type: 'queue', x: 750, y: 290, width: 120, height: 60, label: 'SQS', color: '#ff4b4b', borderColor: '#e63333', textColor: '#ffffff', shape: 'rounded' },

        // Monitoring & Logging
        { id: 'cloudwatch', type: 'monitoring', x: 50, y: 160, width: 130, height: 60, label: 'CloudWatch', color: '#6366f1', borderColor: '#4f46e5', textColor: '#ffffff', shape: 'rounded' },
        { id: 'x-ray', type: 'monitoring', x: 50, y: 240, width: 130, height: 60, label: 'X-Ray Tracing', color: '#10b981', borderColor: '#059669', textColor: '#ffffff', shape: 'rounded' },

        // CI/CD
        { id: 'codepipeline', type: 'cicd', x: 750, y: 160, width: 120, height: 60, label: 'CodePipeline', color: '#8b5cf6', borderColor: '#7c3aed', textColor: '#ffffff', shape: 'rounded' },
        { id: 'ecr', type: 'registry', x: 750, y: 50, width: 120, height: 60, label: 'ECR Registry', color: '#ff9500', borderColor: '#e6860b', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // Load Balancer to Cluster
        { id: 'e1', sourceId: 'alb', targetId: 'ecs-cluster', sourceHandle: 'output', targetHandle: 'input', label: 'routes', color: '#6b7280' },

        // Cluster to Services
        { id: 'e2', sourceId: 'ecs-cluster', targetId: 'user-service', sourceHandle: 'output', targetHandle: 'input', label: 'deploys', color: '#6b7280' },
        { id: 'e3', sourceId: 'ecs-cluster', targetId: 'product-service', sourceHandle: 'output', targetHandle: 'input', label: 'deploys', color: '#6b7280' },
        { id: 'e4', sourceId: 'ecs-cluster', targetId: 'order-service', sourceHandle: 'output', targetHandle: 'input', label: 'deploys', color: '#6b7280' },
        { id: 'e5', sourceId: 'ecs-cluster', targetId: 'payment-service', sourceHandle: 'output', targetHandle: 'input', label: 'deploys', color: '#6b7280' },

        // Service Mesh
        { id: 'e6', sourceId: 'service-mesh', targetId: 'user-service', sourceHandle: 'output', targetHandle: 'input', label: 'proxy', color: '#8b5cf6' },
        { id: 'e7', sourceId: 'service-mesh', targetId: 'product-service', sourceHandle: 'output', targetHandle: 'input', label: 'proxy', color: '#8b5cf6' },
        { id: 'e8', sourceId: 'service-mesh', targetId: 'order-service', sourceHandle: 'output', targetHandle: 'input', label: 'proxy', color: '#8b5cf6' },
        { id: 'e9', sourceId: 'service-mesh', targetId: 'payment-service', sourceHandle: 'output', targetHandle: 'input', label: 'proxy', color: '#8b5cf6' },

        // Services to Databases
        { id: 'e10', sourceId: 'user-service', targetId: 'rds-users', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e11', sourceId: 'product-service', targetId: 'rds-products', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e12', sourceId: 'order-service', targetId: 'rds-orders', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },

        // Caching
        { id: 'e13', sourceId: 'product-service', targetId: 'elasticache', sourceHandle: 'output', targetHandle: 'input', label: 'cache', color: '#6b7280' },
        { id: 'e14', sourceId: 'payment-service', targetId: 'elasticache', sourceHandle: 'output', targetHandle: 'input', label: 'cache', color: '#6b7280' },

        // Messaging
        { id: 'e15', sourceId: 'order-service', targetId: 'sqs', sourceHandle: 'output', targetHandle: 'input', label: 'events', color: '#6b7280' },

        // Monitoring
        { id: 'e16', sourceId: 'ecs-cluster', targetId: 'cloudwatch', sourceHandle: 'output', targetHandle: 'input', label: 'metrics', color: '#6b7280' },
        { id: 'e17', sourceId: 'service-mesh', targetId: 'x-ray', sourceHandle: 'output', targetHandle: 'input', label: 'traces', color: '#6b7280' },

        // CI/CD
        { id: 'e18', sourceId: 'codepipeline', targetId: 'ecs-cluster', sourceHandle: 'output', targetHandle: 'input', label: 'deploys', color: '#6b7280' },
        { id: 'e19', sourceId: 'codepipeline', targetId: 'ecr', sourceHandle: 'output', targetHandle: 'input', label: 'images', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 16, edgeCount: 19, groupCount: 0 }
  },
  {
    id: 'cloud-azure-webapp',
    name: 'Azure Web Application',
    description: 'Azure App Service with SQL Database, CDN, and Application Insights',
    category: 'cloud',
    tags: ['azure', 'app-service', 'sql-database', 'cdn', 'application-insights'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // Frontend
        { id: 'azure-cdn', type: 'cdn', x: 300, y: 50, width: 160, height: 70, label: 'Azure CDN', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },
        { id: 'blob-storage', type: 'storage', x: 300, y: 150, width: 160, height: 70, label: 'Blob Storage', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },

        // Application
        { id: 'app-service', type: 'web', x: 300, y: 270, width: 160, height: 80, label: 'App Service', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },
        { id: 'app-gateway', type: 'gateway', x: 300, y: 380, width: 160, height: 70, label: 'Application Gateway', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },

        // Databases
        { id: 'sql-database', type: 'database', x: 100, y: 500, width: 140, height: 70, label: 'SQL Database', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },
        { id: 'cosmos-db', type: 'database', x: 260, y: 500, width: 140, height: 70, label: 'Cosmos DB', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },

        // Caching & Messaging
        { id: 'redis-cache', type: 'cache', x: 420, y: 500, width: 140, height: 70, label: 'Redis Cache', color: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff', shape: 'rounded' },
        { id: 'service-bus', type: 'queue', x: 580, y: 380, width: 140, height: 70, label: 'Service Bus', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },

        // Functions & Logic
        { id: 'azure-functions', type: 'function', x: 580, y: 270, width: 140, height: 70, label: 'Azure Functions', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },
        { id: 'logic-apps', type: 'service', x: 580, y: 500, width: 140, height: 70, label: 'Logic Apps', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },

        // Security & Identity
        { id: 'azure-ad', type: 'auth', x: 100, y: 270, width: 140, height: 70, label: 'Azure AD', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },
        { id: 'key-vault', type: 'security', x: 100, y: 380, width: 140, height: 70, label: 'Key Vault', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },

        // Monitoring
        { id: 'app-insights', type: 'monitoring', x: 100, y: 150, width: 140, height: 70, label: 'Application Insights', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' },
        { id: 'log-analytics', type: 'monitoring', x: 500, y: 150, width: 140, height: 70, label: 'Log Analytics', color: '#0078d4', borderColor: '#005a9e', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // Frontend Flow
        { id: 'e1', sourceId: 'azure-cdn', targetId: 'blob-storage', sourceHandle: 'output', targetHandle: 'input', label: 'serves', color: '#6b7280' },
        { id: 'e2', sourceId: 'blob-storage', targetId: 'app-service', sourceHandle: 'output', targetHandle: 'input', label: 'content', color: '#6b7280' },

        // Application Flow
        { id: 'e3', sourceId: 'app-service', targetId: 'app-gateway', sourceHandle: 'output', targetHandle: 'input', label: 'routes', color: '#6b7280' },

        // Database Connections
        { id: 'e4', sourceId: 'app-service', targetId: 'sql-database', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },
        { id: 'e5', sourceId: 'app-service', targetId: 'cosmos-db', sourceHandle: 'output', targetHandle: 'input', label: 'documents', color: '#6b7280' },

        // Caching
        { id: 'e6', sourceId: 'app-service', targetId: 'redis-cache', sourceHandle: 'output', targetHandle: 'input', label: 'cache', color: '#6b7280' },

        // Authentication
        { id: 'e7', sourceId: 'app-service', targetId: 'azure-ad', sourceHandle: 'output', targetHandle: 'input', label: 'auth', color: '#6b7280' },

        // Security
        { id: 'e8', sourceId: 'app-service', targetId: 'key-vault', sourceHandle: 'output', targetHandle: 'input', label: 'secrets', color: '#6b7280' },

        // Functions & Messaging
        { id: 'e9', sourceId: 'app-service', targetId: 'azure-functions', sourceHandle: 'output', targetHandle: 'input', label: 'triggers', color: '#6b7280' },
        { id: 'e10', sourceId: 'azure-functions', targetId: 'service-bus', sourceHandle: 'output', targetHandle: 'input', label: 'messages', color: '#6b7280' },
        { id: 'e11', sourceId: 'service-bus', targetId: 'logic-apps', sourceHandle: 'output', targetHandle: 'input', label: 'workflow', color: '#6b7280' },

        // Monitoring
        { id: 'e12', sourceId: 'app-service', targetId: 'app-insights', sourceHandle: 'output', targetHandle: 'input', label: 'telemetry', color: '#6b7280' },
        { id: 'e13', sourceId: 'azure-functions', targetId: 'log-analytics', sourceHandle: 'output', targetHandle: 'input', label: 'logs', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 14, edgeCount: 13, groupCount: 0 }
  },
  {
    id: 'cloud-gcp-serverless',
    name: 'GCP Serverless Platform',
    description: 'Google Cloud serverless with Cloud Functions, Firestore, and Pub/Sub',
    category: 'cloud',
    tags: ['gcp', 'cloud-functions', 'firestore', 'pub-sub', 'cloud-run'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // Frontend
        { id: 'cloud-cdn', type: 'cdn', x: 300, y: 50, width: 160, height: 70, label: 'Cloud CDN', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' },
        { id: 'cloud-storage', type: 'storage', x: 300, y: 150, width: 160, height: 70, label: 'Cloud Storage', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' },

        // API Gateway
        { id: 'api-gateway', type: 'gateway', x: 300, y: 270, width: 160, height: 80, label: 'API Gateway', color: '#8b5cf6', borderColor: '#6d28d9', textColor: '#ffffff', shape: 'rounded' },

        // Functions
        { id: 'auth-function', type: 'function', x: 100, y: 400, width: 130, height: 70, label: 'Auth Function', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' },
        { id: 'users-function', type: 'function', x: 250, y: 400, width: 130, height: 70, label: 'Users Function', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' },
        { id: 'orders-function', type: 'function', x: 400, y: 400, width: 130, height: 70, label: 'Orders Function', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' },

        // Cloud Run
        { id: 'cloud-run', type: 'container', x: 550, y: 400, width: 130, height: 70, label: 'Cloud Run', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' },

        // Databases
        { id: 'firestore', type: 'database', x: 200, y: 530, width: 130, height: 60, label: 'Firestore', color: '#ff9800', borderColor: '#f57c00', textColor: '#ffffff', shape: 'rounded' },
        { id: 'cloud-sql', type: 'database', x: 350, y: 530, width: 130, height: 60, label: 'Cloud SQL', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' },

        // Messaging & Caching
        { id: 'pub-sub', type: 'queue', x: 500, y: 530, width: 130, height: 60, label: 'Pub/Sub', color: '#34a853', borderColor: '#2d8a47', textColor: '#ffffff', shape: 'rounded' },
        { id: 'memorystore', type: 'cache', x: 650, y: 530, width: 130, height: 60, label: 'Memorystore', color: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff', shape: 'rounded' },

        // Security & Identity
        { id: 'identity-platform', type: 'auth', x: 100, y: 270, width: 130, height: 70, label: 'Identity Platform', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' },
        { id: 'secret-manager', type: 'security', x: 550, y: 270, width: 130, height: 70, label: 'Secret Manager', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' },

        // Monitoring
        { id: 'cloud-monitoring', type: 'monitoring', x: 100, y: 150, width: 130, height: 70, label: 'Cloud Monitoring', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' },
        { id: 'cloud-logging', type: 'monitoring', x: 550, y: 150, width: 130, height: 70, label: 'Cloud Logging', color: '#4285f4', borderColor: '#3367d6', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // Frontend Flow
        { id: 'e1', sourceId: 'cloud-cdn', targetId: 'cloud-storage', sourceHandle: 'output', targetHandle: 'input', label: 'serves', color: '#6b7280' },
        { id: 'e2', sourceId: 'cloud-storage', targetId: 'api-gateway', sourceHandle: 'output', targetHandle: 'input', label: 'API calls', color: '#6b7280' },

        // API to Functions
        { id: 'e3', sourceId: 'api-gateway', targetId: 'auth-function', sourceHandle: 'output', targetHandle: 'input', label: 'auth', color: '#6b7280' },
        { id: 'e4', sourceId: 'api-gateway', targetId: 'users-function', sourceHandle: 'output', targetHandle: 'input', label: 'users', color: '#6b7280' },
        { id: 'e5', sourceId: 'api-gateway', targetId: 'orders-function', sourceHandle: 'output', targetHandle: 'input', label: 'orders', color: '#6b7280' },
        { id: 'e6', sourceId: 'api-gateway', targetId: 'cloud-run', sourceHandle: 'output', targetHandle: 'input', label: 'services', color: '#6b7280' },

        // Authentication
        { id: 'e7', sourceId: 'auth-function', targetId: 'identity-platform', sourceHandle: 'output', targetHandle: 'input', label: 'validate', color: '#6b7280' },

        // Functions to Databases
        { id: 'e8', sourceId: 'users-function', targetId: 'firestore', sourceHandle: 'output', targetHandle: 'input', label: 'documents', color: '#6b7280' },
        { id: 'e9', sourceId: 'orders-function', targetId: 'cloud-sql', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' },

        // Caching
        { id: 'e10', sourceId: 'cloud-run', targetId: 'memorystore', sourceHandle: 'output', targetHandle: 'input', label: 'cache', color: '#6b7280' },

        // Messaging
        { id: 'e11', sourceId: 'orders-function', targetId: 'pub-sub', sourceHandle: 'output', targetHandle: 'input', label: 'events', color: '#6b7280' },

        // Security
        { id: 'e12', sourceId: 'cloud-run', targetId: 'secret-manager', sourceHandle: 'output', targetHandle: 'input', label: 'secrets', color: '#6b7280' },

        // Monitoring
        { id: 'e13', sourceId: 'api-gateway', targetId: 'cloud-monitoring', sourceHandle: 'output', targetHandle: 'input', label: 'metrics', color: '#6b7280' },
        { id: 'e14', sourceId: 'cloud-run', targetId: 'cloud-logging', sourceHandle: 'output', targetHandle: 'input', label: 'logs', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 15, edgeCount: 14, groupCount: 0 }
  },
  {
    id: 'data-pipeline',
    name: 'Data Processing Pipeline',
    description: 'ETL pipeline with data sources, processing, and storage',
    category: 'data',
    tags: ['etl', 'data', 'pipeline', 'analytics'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        {
          id: 'data-source',
          type: 'database',
          x: 50,
          y: 150,
          width: 140,
          height: 70,
          label: 'Data Source',
          color: '#6366f1',
          borderColor: '#4f46e5',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'etl-service',
          type: 'service',
          x: 250,
          y: 150,
          width: 140,
          height: 70,
          label: 'ETL Service',
          color: '#8b5cf6',
          borderColor: '#7c3aed',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'data-warehouse',
          type: 'storage',
          x: 450,
          y: 150,
          width: 140,
          height: 70,
          label: 'Data Warehouse',
          color: '#059669',
          borderColor: '#047857',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'analytics',
          type: 'analytics',
          x: 250,
          y: 280,
          width: 140,
          height: 70,
          label: 'Analytics',
          color: '#dc2626',
          borderColor: '#b91c1c',
          textColor: '#ffffff',
          shape: 'rounded'
        }
      ],
      edges: [
        { id: 'e1', sourceId: 'data-source', targetId: 'etl-service', sourceHandle: 'output', targetHandle: 'input', label: 'raw data', color: '#6b7280' },
        { id: 'e2', sourceId: 'etl-service', targetId: 'data-warehouse', sourceHandle: 'output', targetHandle: 'input', label: 'processed', color: '#6b7280' },
        { id: 'e3', sourceId: 'data-warehouse', targetId: 'analytics', sourceHandle: 'output', targetHandle: 'input', label: 'queries', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 4, edgeCount: 3, groupCount: 0 }
  },
  {
    id: 'mobile-backend',
    name: 'Mobile App Backend',
    description: 'Backend architecture for mobile applications with auth and push notifications',
    category: 'mobile',
    tags: ['mobile', 'auth', 'push', 'api'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        {
          id: 'mobile-app',
          type: 'mobile',
          x: 50,
          y: 150,
          width: 120,
          height: 80,
          label: 'Mobile App',
          color: '#6366f1',
          borderColor: '#4f46e5',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'api-gateway',
          type: 'gateway',
          x: 220,
          y: 150,
          width: 140,
          height: 80,
          label: 'API Gateway',
          color: '#8b5cf6',
          borderColor: '#7c3aed',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'auth-service',
          type: 'service',
          x: 400,
          y: 80,
          width: 130,
          height: 70,
          label: 'Auth Service',
          color: '#ef4444',
          borderColor: '#dc2626',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'push-service',
          type: 'service',
          x: 400,
          y: 180,
          width: 130,
          height: 70,
          label: 'Push Service',
          color: '#10b981',
          borderColor: '#059669',
          textColor: '#ffffff',
          shape: 'rounded'
        },
        {
          id: 'app-db',
          type: 'database',
          x: 220,
          y: 300,
          width: 140,
          height: 70,
          label: 'App Database',
          color: '#059669',
          borderColor: '#047857',
          textColor: '#ffffff',
          shape: 'rounded'
        }
      ],
      edges: [
        { id: 'e1', sourceId: 'mobile-app', targetId: 'api-gateway', sourceHandle: 'output', targetHandle: 'input', label: 'requests', color: '#6b7280' },
        { id: 'e2', sourceId: 'api-gateway', targetId: 'auth-service', sourceHandle: 'output', targetHandle: 'input', label: 'auth', color: '#6b7280' },
        { id: 'e3', sourceId: 'api-gateway', targetId: 'push-service', sourceHandle: 'output', targetHandle: 'input', label: 'notifications', color: '#6b7280' },
        { id: 'e4', sourceId: 'api-gateway', targetId: 'app-db', sourceHandle: 'output', targetHandle: 'input', label: 'data', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 5, edgeCount: 4, groupCount: 0 }
  },

  // === SECURITY ARCHITECTURE TEMPLATES ===
  {
    id: 'security-zero-trust',
    name: 'Zero Trust Architecture',
    description: 'Zero trust security model with identity verification, policy engine, and micro-segmentation',
    category: 'security',
    tags: ['zero-trust', 'identity', 'policy', 'micro-segmentation', 'security'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // User Access
        { id: 'user-device', type: 'endpoint', x: 50, y: 200, width: 120, height: 60, label: 'User Device', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' },
        { id: 'identity-provider', type: 'auth', x: 250, y: 100, width: 140, height: 70, label: 'Identity Provider', color: '#dd344c', borderColor: '#c12a3a', textColor: '#ffffff', shape: 'rounded' },
        { id: 'mfa-service', type: 'security', x: 250, y: 200, width: 140, height: 60, label: 'MFA Service', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },

        // Policy & Decision Engine
        { id: 'policy-engine', type: 'service', x: 450, y: 150, width: 150, height: 70, label: 'Policy Decision Point', color: '#7c3aed', borderColor: '#6d28d9', textColor: '#ffffff', shape: 'rounded' },
        { id: 'risk-engine', type: 'service', x: 450, y: 250, width: 150, height: 60, label: 'Risk Assessment', color: '#ea580c', borderColor: '#dc2626', textColor: '#ffffff', shape: 'rounded' },

        // Network Security
        { id: 'network-gateway', type: 'gateway', x: 650, y: 100, width: 140, height: 70, label: 'Security Gateway', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },
        { id: 'firewall', type: 'security', x: 650, y: 200, width: 140, height: 60, label: 'Next-Gen Firewall', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },

        // Application Layer
        { id: 'app-proxy', type: 'proxy', x: 850, y: 150, width: 130, height: 60, label: 'App Proxy', color: '#8b5cf6', borderColor: '#7c3aed', textColor: '#ffffff', shape: 'rounded' },
        { id: 'microservice-1', type: 'service', x: 1050, y: 100, width: 120, height: 60, label: 'Service A', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },
        { id: 'microservice-2', type: 'service', x: 1050, y: 200, width: 120, height: 60, label: 'Service B', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },

        // Data Protection
        { id: 'data-encryption', type: 'security', x: 1250, y: 150, width: 140, height: 60, label: 'Data Encryption', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'secure-database', type: 'database', x: 1450, y: 150, width: 140, height: 70, label: 'Encrypted Database', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Monitoring & Analytics
        { id: 'siem', type: 'monitor', x: 450, y: 350, width: 150, height: 60, label: 'SIEM Platform', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'threat-intel', type: 'service', x: 650, y: 350, width: 140, height: 60, label: 'Threat Intelligence', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // Authentication Flow
        { id: 'e1', sourceId: 'user-device', targetId: 'identity-provider', sourceHandle: 'output', targetHandle: 'input', label: 'authenticate', color: '#dd344c' },
        { id: 'e2', sourceId: 'user-device', targetId: 'mfa-service', sourceHandle: 'output', targetHandle: 'input', label: 'verify', color: '#dc2626' },

        // Policy Evaluation
        { id: 'e3', sourceId: 'identity-provider', targetId: 'policy-engine', sourceHandle: 'output', targetHandle: 'input', label: 'identity claims', color: '#7c3aed' },
        { id: 'e4', sourceId: 'mfa-service', targetId: 'risk-engine', sourceHandle: 'output', targetHandle: 'input', label: 'context', color: '#ea580c' },
        { id: 'e5', sourceId: 'policy-engine', targetId: 'risk-engine', sourceHandle: 'output', targetHandle: 'input', label: 'policy', color: '#6b7280' },

        // Network Access
        { id: 'e6', sourceId: 'policy-engine', targetId: 'network-gateway', sourceHandle: 'output', targetHandle: 'input', label: 'access decision', color: '#059669' },
        { id: 'e7', sourceId: 'network-gateway', targetId: 'firewall', sourceHandle: 'output', targetHandle: 'input', label: 'filtered traffic', color: '#dc2626' },

        // Application Access
        { id: 'e8', sourceId: 'firewall', targetId: 'app-proxy', sourceHandle: 'output', targetHandle: 'input', label: 'authorized traffic', color: '#8b5cf6' },
        { id: 'e9', sourceId: 'app-proxy', targetId: 'microservice-1', sourceHandle: 'output', targetHandle: 'input', label: 'proxied request', color: '#3b82f6' },
        { id: 'e10', sourceId: 'app-proxy', targetId: 'microservice-2', sourceHandle: 'output', targetHandle: 'input', label: 'proxied request', color: '#3b82f6' },

        // Data Protection
        { id: 'e11', sourceId: 'microservice-1', targetId: 'data-encryption', sourceHandle: 'output', targetHandle: 'input', label: 'encrypt', color: '#dc2626' },
        { id: 'e12', sourceId: 'microservice-2', targetId: 'data-encryption', sourceHandle: 'output', targetHandle: 'input', label: 'encrypt', color: '#dc2626' },
        { id: 'e13', sourceId: 'data-encryption', targetId: 'secure-database', sourceHandle: 'output', targetHandle: 'input', label: 'encrypted data', color: '#059669' },

        // Monitoring & Intelligence
        { id: 'e14', sourceId: 'risk-engine', targetId: 'siem', sourceHandle: 'output', targetHandle: 'input', label: 'risk events', color: '#f59e0b' },
        { id: 'e15', sourceId: 'siem', targetId: 'threat-intel', sourceHandle: 'output', targetHandle: 'input', label: 'events', color: '#dc2626' },
        { id: 'e16', sourceId: 'threat-intel', targetId: 'policy-engine', sourceHandle: 'output', targetHandle: 'input', label: 'intelligence', color: '#7c3aed' }
      ]
    },
    stats: { nodeCount: 14, edgeCount: 16, groupCount: 0 }
  },

  {
    id: 'security-defense-in-depth',
    name: 'Defense in Depth',
    description: 'Layered security approach with perimeter, network, host, and data protection',
    category: 'security',
    tags: ['defense-in-depth', 'layered-security', 'perimeter', 'network-security'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // Perimeter Layer
        { id: 'internet', type: 'cloud', x: 50, y: 200, width: 100, height: 60, label: 'Internet', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' },
        { id: 'edge-firewall', type: 'security', x: 200, y: 200, width: 130, height: 60, label: 'Edge Firewall', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'waf', type: 'security', x: 380, y: 150, width: 120, height: 60, label: 'Web App Firewall', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'ddos-protection', type: 'security', x: 380, y: 250, width: 120, height: 60, label: 'DDoS Protection', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },

        // Network Layer
        { id: 'internal-firewall', type: 'security', x: 550, y: 200, width: 130, height: 60, label: 'Internal Firewall', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'ids-ips', type: 'monitor', x: 720, y: 150, width: 120, height: 60, label: 'IDS/IPS', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'network-segmentation', type: 'network', x: 720, y: 250, width: 120, height: 60, label: 'Network Segmentation', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },

        // Host Layer
        { id: 'endpoint-protection', type: 'security', x: 890, y: 150, width: 130, height: 60, label: 'Endpoint Protection', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'server-hardening', type: 'server', x: 890, y: 250, width: 130, height: 60, label: 'Server Hardening', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Application Layer
        { id: 'app-security', type: 'service', x: 1070, y: 150, width: 120, height: 60, label: 'App Security', color: '#8b5cf6', borderColor: '#7c3aed', textColor: '#ffffff', shape: 'rounded' },
        { id: 'authentication', type: 'auth', x: 1070, y: 250, width: 120, height: 60, label: 'Authentication', color: '#dd344c', borderColor: '#c12a3a', textColor: '#ffffff', shape: 'rounded' },

        // Data Layer
        { id: 'data-encryption', type: 'security', x: 1240, y: 150, width: 130, height: 60, label: 'Data Encryption', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'access-control', type: 'security', x: 1240, y: 250, width: 130, height: 60, label: 'Access Control', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'secure-database', type: 'database', x: 1420, y: 200, width: 130, height: 70, label: 'Secure Database', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Monitoring & Response
        { id: 'soc', type: 'monitor', x: 720, y: 350, width: 120, height: 60, label: 'Security Operations Center', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'incident-response', type: 'service', x: 890, y: 350, width: 130, height: 60, label: 'Incident Response', color: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // Traffic Flow
        { id: 'e1', sourceId: 'internet', targetId: 'edge-firewall', sourceHandle: 'output', targetHandle: 'input', label: 'traffic', color: '#6b7280' },
        { id: 'e2', sourceId: 'edge-firewall', targetId: 'waf', sourceHandle: 'output', targetHandle: 'input', label: 'web traffic', color: '#dc2626' },
        { id: 'e3', sourceId: 'edge-firewall', targetId: 'ddos-protection', sourceHandle: 'output', targetHandle: 'input', label: 'filtered', color: '#dc2626' },

        // Network Security
        { id: 'e4', sourceId: 'waf', targetId: 'internal-firewall', sourceHandle: 'output', targetHandle: 'input', label: 'clean traffic', color: '#6b7280' },
        { id: 'e5', sourceId: 'ddos-protection', targetId: 'internal-firewall', sourceHandle: 'output', targetHandle: 'input', label: 'protected', color: '#6b7280' },
        { id: 'e6', sourceId: 'internal-firewall', targetId: 'ids-ips', sourceHandle: 'output', targetHandle: 'input', label: 'monitor', color: '#f59e0b' },
        { id: 'e7', sourceId: 'internal-firewall', targetId: 'network-segmentation', sourceHandle: 'output', targetHandle: 'input', label: 'segment', color: '#3b82f6' },

        // Host Protection
        { id: 'e8', sourceId: 'ids-ips', targetId: 'endpoint-protection', sourceHandle: 'output', targetHandle: 'input', label: 'secure endpoint', color: '#dc2626' },
        { id: 'e9', sourceId: 'network-segmentation', targetId: 'server-hardening', sourceHandle: 'output', targetHandle: 'input', label: 'harden hosts', color: '#059669' },

        // Application Security
        { id: 'e10', sourceId: 'endpoint-protection', targetId: 'app-security', sourceHandle: 'output', targetHandle: 'input', label: 'secure apps', color: '#8b5cf6' },
        { id: 'e11', sourceId: 'server-hardening', targetId: 'authentication', sourceHandle: 'output', targetHandle: 'input', label: 'authenticate', color: '#dd344c' },

        // Data Protection
        { id: 'e12', sourceId: 'app-security', targetId: 'data-encryption', sourceHandle: 'output', targetHandle: 'input', label: 'encrypt', color: '#dc2626' },
        { id: 'e13', sourceId: 'authentication', targetId: 'access-control', sourceHandle: 'output', targetHandle: 'input', label: 'authorize', color: '#dc2626' },
        { id: 'e14', sourceId: 'data-encryption', targetId: 'secure-database', sourceHandle: 'output', targetHandle: 'input', label: 'store', color: '#059669' },
        { id: 'e15', sourceId: 'access-control', targetId: 'secure-database', sourceHandle: 'output', targetHandle: 'input', label: 'control', color: '#059669' },

        // Monitoring
        { id: 'e16', sourceId: 'ids-ips', targetId: 'soc', sourceHandle: 'output', targetHandle: 'input', label: 'alerts', color: '#f59e0b' },
        { id: 'e17', sourceId: 'soc', targetId: 'incident-response', sourceHandle: 'output', targetHandle: 'input', label: 'incidents', color: '#ef4444' }
      ]
    },
    stats: { nodeCount: 16, edgeCount: 17, groupCount: 0 }
  },

  // === NETWORK TOPOLOGY TEMPLATES ===
  {
    id: 'network-enterprise-lan',
    name: 'Enterprise LAN Topology',
    description: 'Hierarchical enterprise network with core, distribution, and access layers',
    category: 'network',
    tags: ['enterprise', 'lan', 'hierarchical', 'core', 'distribution', 'access'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // Core Layer
        { id: 'core-switch-1', type: 'switch', x: 300, y: 50, width: 140, height: 60, label: 'Core Switch 1', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },
        { id: 'core-switch-2', type: 'switch', x: 500, y: 50, width: 140, height: 60, label: 'Core Switch 2', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Distribution Layer
        { id: 'dist-switch-1', type: 'switch', x: 150, y: 180, width: 140, height: 60, label: 'Distribution Switch 1', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },
        { id: 'dist-switch-2', type: 'switch', x: 350, y: 180, width: 140, height: 60, label: 'Distribution Switch 2', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },
        { id: 'dist-switch-3', type: 'switch', x: 550, y: 180, width: 140, height: 60, label: 'Distribution Switch 3', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },
        { id: 'dist-switch-4', type: 'switch', x: 750, y: 180, width: 140, height: 60, label: 'Distribution Switch 4', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },

        // Access Layer
        { id: 'access-switch-1', type: 'switch', x: 100, y: 310, width: 120, height: 60, label: 'Access Switch 1', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'access-switch-2', type: 'switch', x: 250, y: 310, width: 120, height: 60, label: 'Access Switch 2', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'access-switch-3', type: 'switch', x: 400, y: 310, width: 120, height: 60, label: 'Access Switch 3', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'access-switch-4', type: 'switch', x: 550, y: 310, width: 120, height: 60, label: 'Access Switch 4', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'access-switch-5', type: 'switch', x: 700, y: 310, width: 120, height: 60, label: 'Access Switch 5', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'access-switch-6', type: 'switch', x: 850, y: 310, width: 120, height: 60, label: 'Access Switch 6', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },

        // End Devices
        { id: 'workstation-1', type: 'endpoint', x: 50, y: 440, width: 100, height: 50, label: 'Workstations', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' },
        { id: 'workstation-2', type: 'endpoint', x: 200, y: 440, width: 100, height: 50, label: 'Workstations', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' },
        { id: 'workstation-3', type: 'endpoint', x: 350, y: 440, width: 100, height: 50, label: 'Workstations', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' },
        { id: 'server-farm', type: 'server', x: 500, y: 440, width: 120, height: 50, label: 'Server Farm', color: '#ef4444', borderColor: '#dc2626', textColor: '#ffffff', shape: 'rounded' },
        { id: 'printer-1', type: 'device', x: 650, y: 440, width: 100, height: 50, label: 'Printers', color: '#8b5cf6', borderColor: '#7c3aed', textColor: '#ffffff', shape: 'rounded' },
        { id: 'wireless-ap', type: 'wireless', x: 800, y: 440, width: 120, height: 50, label: 'Wireless APs', color: '#10b981', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // External Connectivity
        { id: 'router', type: 'router', x: 420, y: -80, width: 120, height: 60, label: 'Edge Router', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'firewall', type: 'security', x: 420, y: -150, width: 120, height: 60, label: 'Firewall', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'internet', type: 'cloud', x: 420, y: -220, width: 120, height: 60, label: 'Internet', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // External Connectivity
        { id: 'e1', sourceId: 'internet', targetId: 'firewall', sourceHandle: 'output', targetHandle: 'input', label: 'WAN', color: '#dc2626' },
        { id: 'e2', sourceId: 'firewall', targetId: 'router', sourceHandle: 'output', targetHandle: 'input', label: 'filtered', color: '#dc2626' },
        { id: 'e3', sourceId: 'router', targetId: 'core-switch-1', sourceHandle: 'output', targetHandle: 'input', label: 'uplink', color: '#059669' },
        { id: 'e4', sourceId: 'router', targetId: 'core-switch-2', sourceHandle: 'output', targetHandle: 'input', label: 'uplink', color: '#059669' },

        // Core Layer Redundancy
        { id: 'e5', sourceId: 'core-switch-1', targetId: 'core-switch-2', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#059669' },

        // Core to Distribution
        { id: 'e6', sourceId: 'core-switch-1', targetId: 'dist-switch-1', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#3b82f6' },
        { id: 'e7', sourceId: 'core-switch-1', targetId: 'dist-switch-2', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#3b82f6' },
        { id: 'e8', sourceId: 'core-switch-2', targetId: 'dist-switch-3', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#3b82f6' },
        { id: 'e9', sourceId: 'core-switch-2', targetId: 'dist-switch-4', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#3b82f6' },

        // Distribution to Access
        { id: 'e10', sourceId: 'dist-switch-1', targetId: 'access-switch-1', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#f59e0b' },
        { id: 'e11', sourceId: 'dist-switch-1', targetId: 'access-switch-2', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#f59e0b' },
        { id: 'e12', sourceId: 'dist-switch-2', targetId: 'access-switch-3', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#f59e0b' },
        { id: 'e13', sourceId: 'dist-switch-3', targetId: 'access-switch-4', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#f59e0b' },
        { id: 'e14', sourceId: 'dist-switch-4', targetId: 'access-switch-5', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#f59e0b' },
        { id: 'e15', sourceId: 'dist-switch-4', targetId: 'access-switch-6', sourceHandle: 'output', targetHandle: 'input', label: 'trunk', color: '#f59e0b' },

        // Access to End Devices
        { id: 'e16', sourceId: 'access-switch-1', targetId: 'workstation-1', sourceHandle: 'output', targetHandle: 'input', label: 'access', color: '#6b7280' },
        { id: 'e17', sourceId: 'access-switch-2', targetId: 'workstation-2', sourceHandle: 'output', targetHandle: 'input', label: 'access', color: '#6b7280' },
        { id: 'e18', sourceId: 'access-switch-3', targetId: 'workstation-3', sourceHandle: 'output', targetHandle: 'input', label: 'access', color: '#6b7280' },
        { id: 'e19', sourceId: 'access-switch-4', targetId: 'server-farm', sourceHandle: 'output', targetHandle: 'input', label: 'server access', color: '#ef4444' },
        { id: 'e20', sourceId: 'access-switch-5', targetId: 'printer-1', sourceHandle: 'output', targetHandle: 'input', label: 'device access', color: '#8b5cf6' },
        { id: 'e21', sourceId: 'access-switch-6', targetId: 'wireless-ap', sourceHandle: 'output', targetHandle: 'input', label: 'wireless', color: '#10b981' }
      ]
    },
    stats: { nodeCount: 21, edgeCount: 21, groupCount: 0 }
  },

  // === DATA ARCHITECTURE TEMPLATES ===
  {
    id: 'data-modern-data-stack',
    name: 'Modern Data Stack',
    description: 'Complete modern data stack with ingestion, transformation, warehouse, and analytics',
    category: 'data',
    tags: ['data-stack', 'etl', 'data-warehouse', 'analytics', 'pipeline'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // Data Sources
        { id: 'app-database', type: 'database', x: 50, y: 100, width: 120, height: 60, label: 'App Database', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },
        { id: 'api-sources', type: 'api', x: 50, y: 200, width: 120, height: 60, label: 'API Sources', color: '#8b5cf6', borderColor: '#7c3aed', textColor: '#ffffff', shape: 'rounded' },
        { id: 'event-streams', type: 'stream', x: 50, y: 300, width: 120, height: 60, label: 'Event Streams', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'file-uploads', type: 'storage', x: 50, y: 400, width: 120, height: 60, label: 'File Uploads', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Data Ingestion
        { id: 'data-connector', type: 'service', x: 250, y: 150, width: 130, height: 60, label: 'Data Connectors', color: '#10b981', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },
        { id: 'stream-processor', type: 'processor', x: 250, y: 250, width: 130, height: 60, label: 'Stream Processor', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'batch-ingestion', type: 'service', x: 250, y: 350, width: 130, height: 60, label: 'Batch Ingestion', color: '#6366f1', borderColor: '#4f46e5', textColor: '#ffffff', shape: 'rounded' },

        // Data Lake/Raw Storage
        { id: 'data-lake', type: 'storage', x: 450, y: 200, width: 140, height: 80, label: 'Data Lake (Raw)', color: '#0891b2', borderColor: '#0e7490', textColor: '#ffffff', shape: 'rounded' },
        { id: 'object-storage', type: 'storage', x: 450, y: 320, width: 140, height: 60, label: 'Object Storage', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Data Transformation
        { id: 'etl-pipeline', type: 'processor', x: 650, y: 150, width: 130, height: 60, label: 'ETL Pipeline', color: '#7c3aed', borderColor: '#6d28d9', textColor: '#ffffff', shape: 'rounded' },
        { id: 'dbt-transform', type: 'processor', x: 650, y: 250, width: 130, height: 60, label: 'dbt Transform', color: '#f97316', borderColor: '#ea580c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'data-quality', type: 'service', x: 650, y: 350, width: 130, height: 60, label: 'Data Quality', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },

        // Data Warehouse
        { id: 'data-warehouse', type: 'database', x: 850, y: 200, width: 140, height: 80, label: 'Data Warehouse', color: '#1d4ed8', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'data-marts', type: 'database', x: 850, y: 320, width: 140, height: 60, label: 'Data Marts', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },

        // Analytics & BI
        { id: 'bi-tools', type: 'analytics', x: 1050, y: 150, width: 130, height: 60, label: 'BI Tools', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },
        { id: 'notebooks', type: 'analytics', x: 1050, y: 250, width: 130, height: 60, label: 'ML Notebooks', color: '#8b5cf6', borderColor: '#7c3aed', textColor: '#ffffff', shape: 'rounded' },
        { id: 'dashboards', type: 'dashboard', x: 1050, y: 350, width: 130, height: 60, label: 'Dashboards', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },

        // Data Governance
        { id: 'data-catalog', type: 'service', x: 450, y: 450, width: 140, height: 60, label: 'Data Catalog', color: '#6366f1', borderColor: '#4f46e5', textColor: '#ffffff', shape: 'rounded' },
        { id: 'metadata-store', type: 'database', x: 650, y: 450, width: 130, height: 60, label: 'Metadata Store', color: '#374151', borderColor: '#1f2937', textColor: '#ffffff', shape: 'rounded' },
        { id: 'lineage-tracking', type: 'monitor', x: 850, y: 450, width: 140, height: 60, label: 'Data Lineage', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // Data Ingestion
        { id: 'e1', sourceId: 'app-database', targetId: 'data-connector', sourceHandle: 'output', targetHandle: 'input', label: 'extract', color: '#10b981' },
        { id: 'e2', sourceId: 'api-sources', targetId: 'data-connector', sourceHandle: 'output', targetHandle: 'input', label: 'pull', color: '#10b981' },
        { id: 'e3', sourceId: 'event-streams', targetId: 'stream-processor', sourceHandle: 'output', targetHandle: 'input', label: 'stream', color: '#f59e0b' },
        { id: 'e4', sourceId: 'file-uploads', targetId: 'batch-ingestion', sourceHandle: 'output', targetHandle: 'input', label: 'batch', color: '#6366f1' },

        // Raw Data Storage
        { id: 'e5', sourceId: 'data-connector', targetId: 'data-lake', sourceHandle: 'output', targetHandle: 'input', label: 'raw data', color: '#0891b2' },
        { id: 'e6', sourceId: 'stream-processor', targetId: 'data-lake', sourceHandle: 'output', targetHandle: 'input', label: 'stream data', color: '#0891b2' },
        { id: 'e7', sourceId: 'batch-ingestion', targetId: 'object-storage', sourceHandle: 'output', targetHandle: 'input', label: 'files', color: '#059669' },

        // Data Transformation
        { id: 'e8', sourceId: 'data-lake', targetId: 'etl-pipeline', sourceHandle: 'output', targetHandle: 'input', label: 'process', color: '#7c3aed' },
        { id: 'e9', sourceId: 'data-lake', targetId: 'dbt-transform', sourceHandle: 'output', targetHandle: 'input', label: 'transform', color: '#f97316' },
        { id: 'e10', sourceId: 'object-storage', targetId: 'data-quality', sourceHandle: 'output', targetHandle: 'input', label: 'validate', color: '#dc2626' },

        // Warehouse Loading
        { id: 'e11', sourceId: 'etl-pipeline', targetId: 'data-warehouse', sourceHandle: 'output', targetHandle: 'input', label: 'load', color: '#1d4ed8' },
        { id: 'e12', sourceId: 'dbt-transform', targetId: 'data-warehouse', sourceHandle: 'output', targetHandle: 'input', label: 'modeled data', color: '#1d4ed8' },
        { id: 'e13', sourceId: 'data-quality', targetId: 'data-marts', sourceHandle: 'output', targetHandle: 'input', label: 'clean data', color: '#3b82f6' },

        // Analytics Access
        { id: 'e14', sourceId: 'data-warehouse', targetId: 'bi-tools', sourceHandle: 'output', targetHandle: 'input', label: 'query', color: '#059669' },
        { id: 'e15', sourceId: 'data-warehouse', targetId: 'notebooks', sourceHandle: 'output', targetHandle: 'input', label: 'analyze', color: '#8b5cf6' },
        { id: 'e16', sourceId: 'data-marts', targetId: 'dashboards', sourceHandle: 'output', targetHandle: 'input', label: 'visualize', color: '#f59e0b' },

        // Data Governance
        { id: 'e17', sourceId: 'data-lake', targetId: 'data-catalog', sourceHandle: 'output', targetHandle: 'input', label: 'catalog', color: '#6366f1' },
        { id: 'e18', sourceId: 'data-catalog', targetId: 'metadata-store', sourceHandle: 'output', targetHandle: 'input', label: 'metadata', color: '#374151' },
        { id: 'e19', sourceId: 'etl-pipeline', targetId: 'lineage-tracking', sourceHandle: 'output', targetHandle: 'input', label: 'track lineage', color: '#6b7280' },
        { id: 'e20', sourceId: 'dbt-transform', targetId: 'lineage-tracking', sourceHandle: 'output', targetHandle: 'input', label: 'track lineage', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 20, edgeCount: 20, groupCount: 0 }
  },

  // === MOBILE ARCHITECTURE TEMPLATES ===
  {
    id: 'mobile-native-architecture',
    name: 'Native Mobile Architecture',
    description: 'Cross-platform mobile app architecture with native apps, shared backend, and cloud services',
    category: 'mobile',
    tags: ['mobile', 'native', 'ios', 'android', 'backend', 'api'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // Mobile Apps
        { id: 'ios-app', type: 'mobile', x: 150, y: 50, width: 120, height: 70, label: 'iOS App', color: '#000000', borderColor: '#1f2937', textColor: '#ffffff', shape: 'rounded' },
        { id: 'android-app', type: 'mobile', x: 350, y: 50, width: 120, height: 70, label: 'Android App', color: '#3ddc84', borderColor: '#16a34a', textColor: '#ffffff', shape: 'rounded' },

        // API Gateway & Load Balancer
        { id: 'load-balancer', type: 'load-balancer', x: 250, y: 180, width: 160, height: 60, label: 'Load Balancer', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'api-gateway', type: 'gateway', x: 250, y: 280, width: 160, height: 70, label: 'API Gateway', color: '#8b5cf6', borderColor: '#7c3aed', textColor: '#ffffff', shape: 'rounded' },

        // Authentication & Security
        { id: 'auth-service', type: 'auth', x: 450, y: 280, width: 130, height: 60, label: 'Auth Service', color: '#dd344c', borderColor: '#c12a3a', textColor: '#ffffff', shape: 'rounded' },
        { id: 'rate-limiter', type: 'security', x: 50, y: 280, width: 130, height: 60, label: 'Rate Limiter', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },

        // Backend Services
        { id: 'user-service', type: 'service', x: 100, y: 400, width: 120, height: 60, label: 'User Service', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },
        { id: 'content-service', type: 'service', x: 250, y: 400, width: 120, height: 60, label: 'Content Service', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },
        { id: 'notification-service', type: 'service', x: 400, y: 400, width: 120, height: 60, label: 'Notification Service', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },
        { id: 'analytics-service', type: 'analytics', x: 550, y: 400, width: 120, height: 60, label: 'Analytics Service', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Databases
        { id: 'user-db', type: 'database', x: 100, y: 520, width: 120, height: 60, label: 'User Database', color: '#1d4ed8', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'content-db', type: 'database', x: 250, y: 520, width: 120, height: 60, label: 'Content Database', color: '#1d4ed8', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'analytics-db', type: 'database', x: 550, y: 520, width: 120, height: 60, label: 'Analytics Database', color: '#1d4ed8', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },

        // External Services
        { id: 'push-service', type: 'service', x: 400, y: 520, width: 120, height: 60, label: 'Push Service', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },
        { id: 'cdn', type: 'cdn', x: 700, y: 400, width: 120, height: 60, label: 'CDN', color: '#ff6b6b', borderColor: '#ef4444', textColor: '#ffffff', shape: 'rounded' },
        { id: 'file-storage', type: 'storage', x: 700, y: 520, width: 120, height: 60, label: 'File Storage', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Monitoring & Caching
        { id: 'redis-cache', type: 'cache', x: 250, y: 640, width: 120, height: 60, label: 'Redis Cache', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'monitoring', type: 'monitor', x: 450, y: 640, width: 120, height: 60, label: 'Monitoring', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // Mobile to Backend
        { id: 'e1', sourceId: 'ios-app', targetId: 'load-balancer', sourceHandle: 'output', targetHandle: 'input', label: 'HTTPS', color: '#6b7280' },
        { id: 'e2', sourceId: 'android-app', targetId: 'load-balancer', sourceHandle: 'output', targetHandle: 'input', label: 'HTTPS', color: '#6b7280' },

        // Load Balancer to API Gateway
        { id: 'e3', sourceId: 'load-balancer', targetId: 'api-gateway', sourceHandle: 'output', targetHandle: 'input', label: 'distribute', color: '#f59e0b' },

        // Security Layer
        { id: 'e4', sourceId: 'api-gateway', targetId: 'rate-limiter', sourceHandle: 'output', targetHandle: 'input', label: 'rate limit', color: '#dc2626' },
        { id: 'e5', sourceId: 'api-gateway', targetId: 'auth-service', sourceHandle: 'output', targetHandle: 'input', label: 'authenticate', color: '#dd344c' },

        // API Gateway to Services
        { id: 'e6', sourceId: 'api-gateway', targetId: 'user-service', sourceHandle: 'output', targetHandle: 'input', label: 'user requests', color: '#3b82f6' },
        { id: 'e7', sourceId: 'api-gateway', targetId: 'content-service', sourceHandle: 'output', targetHandle: 'input', label: 'content requests', color: '#3b82f6' },
        { id: 'e8', sourceId: 'api-gateway', targetId: 'notification-service', sourceHandle: 'output', targetHandle: 'input', label: 'notification requests', color: '#3b82f6' },
        { id: 'e9', sourceId: 'api-gateway', targetId: 'analytics-service', sourceHandle: 'output', targetHandle: 'input', label: 'analytics events', color: '#059669' },

        // Services to Databases
        { id: 'e10', sourceId: 'user-service', targetId: 'user-db', sourceHandle: 'output', targetHandle: 'input', label: 'user data', color: '#1d4ed8' },
        { id: 'e11', sourceId: 'content-service', targetId: 'content-db', sourceHandle: 'output', targetHandle: 'input', label: 'content data', color: '#1d4ed8' },
        { id: 'e12', sourceId: 'analytics-service', targetId: 'analytics-db', sourceHandle: 'output', targetHandle: 'input', label: 'analytics data', color: '#1d4ed8' },

        // External Services
        { id: 'e13', sourceId: 'notification-service', targetId: 'push-service', sourceHandle: 'output', targetHandle: 'input', label: 'push notifications', color: '#f59e0b' },
        { id: 'e14', sourceId: 'content-service', targetId: 'cdn', sourceHandle: 'output', targetHandle: 'input', label: 'static content', color: '#ff6b6b' },
        { id: 'e15', sourceId: 'cdn', targetId: 'file-storage', sourceHandle: 'output', targetHandle: 'input', label: 'origin', color: '#059669' },

        // Caching and Monitoring
        { id: 'e16', sourceId: 'content-service', targetId: 'redis-cache', sourceHandle: 'output', targetHandle: 'input', label: 'cache', color: '#dc2626' },
        { id: 'e17', sourceId: 'user-service', targetId: 'redis-cache', sourceHandle: 'output', targetHandle: 'input', label: 'session cache', color: '#dc2626' },
        { id: 'e18', sourceId: 'analytics-service', targetId: 'monitoring', sourceHandle: 'output', targetHandle: 'input', label: 'metrics', color: '#6b7280' }
      ]
    },
    stats: { nodeCount: 18, edgeCount: 18, groupCount: 0 }
  },

  // === GENERAL PURPOSE TEMPLATES ===
  {
    id: 'general-three-tier',
    name: 'Three-Tier Architecture',
    description: 'Classic three-tier application architecture with presentation, business, and data layers',
    category: 'general',
    tags: ['three-tier', 'layered', 'presentation', 'business', 'data'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: true,
    authorName: 'NexFlow Team',
    data: {
      nodes: [
        // Presentation Layer
        { id: 'web-browser', type: 'endpoint', x: 100, y: 50, width: 120, height: 60, label: 'Web Browser', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' },
        { id: 'mobile-app', type: 'mobile', x: 300, y: 50, width: 120, height: 60, label: 'Mobile App', color: '#3ddc84', borderColor: '#16a34a', textColor: '#ffffff', shape: 'rounded' },
        { id: 'desktop-app', type: 'endpoint', x: 500, y: 50, width: 120, height: 60, label: 'Desktop App', color: '#6b7280', borderColor: '#4b5563', textColor: '#ffffff', shape: 'rounded' },

        // Load Balancer
        { id: 'load-balancer', type: 'load-balancer', x: 300, y: 150, width: 150, height: 60, label: 'Load Balancer', color: '#f59e0b', borderColor: '#d97706', textColor: '#ffffff', shape: 'rounded' },

        // Business Layer
        { id: 'web-server-1', type: 'server', x: 200, y: 250, width: 120, height: 60, label: 'Web Server 1', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },
        { id: 'web-server-2', type: 'server', x: 350, y: 250, width: 120, height: 60, label: 'Web Server 2', color: '#3b82f6', borderColor: '#2563eb', textColor: '#ffffff', shape: 'rounded' },
        { id: 'app-server-1', type: 'service', x: 200, y: 350, width: 120, height: 60, label: 'App Server 1', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },
        { id: 'app-server-2', type: 'service', x: 350, y: 350, width: 120, height: 60, label: 'App Server 2', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' },

        // Data Layer
        { id: 'database-primary', type: 'database', x: 275, y: 450, width: 140, height: 70, label: 'Primary Database', color: '#1d4ed8', borderColor: '#1e40af', textColor: '#ffffff', shape: 'rounded' },
        { id: 'database-replica', type: 'database', x: 450, y: 450, width: 140, height: 70, label: 'Read Replica', color: '#6366f1', borderColor: '#4f46e5', textColor: '#ffffff', shape: 'rounded' },

        // Supporting Services
        { id: 'cache-layer', type: 'cache', x: 100, y: 350, width: 120, height: 60, label: 'Cache Layer', color: '#dc2626', borderColor: '#b91c1c', textColor: '#ffffff', shape: 'rounded' },
        { id: 'file-storage', type: 'storage', x: 500, y: 350, width: 120, height: 60, label: 'File Storage', color: '#059669', borderColor: '#047857', textColor: '#ffffff', shape: 'rounded' }
      ],
      edges: [
        // Client to Load Balancer
        { id: 'e1', sourceId: 'web-browser', targetId: 'load-balancer', sourceHandle: 'output', targetHandle: 'input', label: 'HTTP/HTTPS', color: '#6b7280' },
        { id: 'e2', sourceId: 'mobile-app', targetId: 'load-balancer', sourceHandle: 'output', targetHandle: 'input', label: 'API calls', color: '#6b7280' },
        { id: 'e3', sourceId: 'desktop-app', targetId: 'load-balancer', sourceHandle: 'output', targetHandle: 'input', label: 'requests', color: '#6b7280' },

        // Load Balancer to Web Servers
        { id: 'e4', sourceId: 'load-balancer', targetId: 'web-server-1', sourceHandle: 'output', targetHandle: 'input', label: 'distribute', color: '#f59e0b' },
        { id: 'e5', sourceId: 'load-balancer', targetId: 'web-server-2', sourceHandle: 'output', targetHandle: 'input', label: 'distribute', color: '#f59e0b' },

        // Web Servers to App Servers
        { id: 'e6', sourceId: 'web-server-1', targetId: 'app-server-1', sourceHandle: 'output', targetHandle: 'input', label: 'process', color: '#3b82f6' },
        { id: 'e7', sourceId: 'web-server-2', targetId: 'app-server-2', sourceHandle: 'output', targetHandle: 'input', label: 'process', color: '#3b82f6' },

        // App Servers to Data Layer
        { id: 'e8', sourceId: 'app-server-1', targetId: 'database-primary', sourceHandle: 'output', targetHandle: 'input', label: 'write/read', color: '#1d4ed8' },
        { id: 'e9', sourceId: 'app-server-2', targetId: 'database-primary', sourceHandle: 'output', targetHandle: 'input', label: 'write/read', color: '#1d4ed8' },
        { id: 'e10', sourceId: 'app-server-1', targetId: 'database-replica', sourceHandle: 'output', targetHandle: 'input', label: 'read', color: '#6366f1' },
        { id: 'e11', sourceId: 'app-server-2', targetId: 'database-replica', sourceHandle: 'output', targetHandle: 'input', label: 'read', color: '#6366f1' },

        // Database Replication
        { id: 'e12', sourceId: 'database-primary', targetId: 'database-replica', sourceHandle: 'output', targetHandle: 'input', label: 'replicate', color: '#8b5cf6' },

        // Supporting Services
        { id: 'e13', sourceId: 'app-server-1', targetId: 'cache-layer', sourceHandle: 'output', targetHandle: 'input', label: 'cache', color: '#dc2626' },
        { id: 'e14', sourceId: 'app-server-2', targetId: 'cache-layer', sourceHandle: 'output', targetHandle: 'input', label: 'cache', color: '#dc2626' },
        { id: 'e15', sourceId: 'app-server-1', targetId: 'file-storage', sourceHandle: 'output', targetHandle: 'input', label: 'files', color: '#059669' },
        { id: 'e16', sourceId: 'app-server-2', targetId: 'file-storage', sourceHandle: 'output', targetHandle: 'input', label: 'files', color: '#059669' }
      ]
    },
    stats: { nodeCount: 12, edgeCount: 16, groupCount: 0 }
  }
];

// Get all templates (built-in + custom)
export const getTemplates = (): Template[] => {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const customTemplates = stored ? JSON.parse(stored) : [];

    // Combine built-in templates with custom ones
    return [...builtInTemplates, ...customTemplates];
  } catch (error) {
    console.error('Error loading templates:', error);
    return builtInTemplates;
  }
};

// Save custom templates to localStorage
const saveCustomTemplates = (templates: Template[]): void => {
  try {
    // Only save custom templates (not built-in ones)
    const customTemplates = templates.filter(t => !t.isBuiltIn);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(customTemplates));
  } catch (error) {
    console.error('Error saving templates:', error);
  }
};

// Get a single template by ID
export const getTemplate = (id: string): Template | null => {
  const templates = getTemplates();
  return templates.find(t => t.id === id) || null;
};

// Create a new custom template from project data
export const createTemplateFromProject = (
  name: string,
  description: string,
  category: string,
  tags: string[],
  projectData: Project['data'],
  authorName?: string
): Template => {
  const newTemplate: Template = {
    id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    category,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: false,
    authorName,
    data: {
      nodes: (projectData?.nodes as unknown as TemplateNode[]) || [],
      edges: (projectData?.edges as unknown as TemplateEdge[]) || [],
      groups: []
    },
    stats: {
      nodeCount: projectData?.nodes?.length || 0,
      edgeCount: projectData?.edges?.length || 0,
      groupCount: 0
    }
  };

  const templates = getTemplates();
  templates.push(newTemplate);
  saveCustomTemplates(templates);

  return newTemplate;
};

// Update an existing custom template
export const updateTemplate = (id: string, updates: Partial<Template>): Template | null => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === id && !t.isBuiltIn);

  if (index === -1) return null; // Cannot update built-in templates

  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveCustomTemplates(templates);
  return templates[index];
};

// Delete a custom template
export const deleteTemplate = (id: string): boolean => {
  const templates = getTemplates();
  const template = templates.find(t => t.id === id);

  if (!template || template.isBuiltIn) return false; // Cannot delete built-in templates

  const filteredTemplates = templates.filter(t => t.id !== id);
  saveCustomTemplates(filteredTemplates);
  return true;
};

// Get templates by category
export const getTemplatesByCategory = (category: string): Template[] => {
  return getTemplates().filter(t => t.category === category);
};

// Search templates
export const searchTemplates = (query: string): Template[] => {
  const lowerQuery = query.toLowerCase();
  return getTemplates().filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    template.category.toLowerCase().includes(lowerQuery)
  );
};

// Get template categories
export const getTemplateCategories = (): string[] => {
  const templates = getTemplates();
  return [...new Set(templates.map(t => t.category))];
};

// Get template statistics
export const getTemplateStats = () => {
  const templates = getTemplates();
  const customTemplates = templates.filter(t => !t.isBuiltIn);

  return {
    total: templates.length,
    builtIn: templates.filter(t => t.isBuiltIn).length,
    custom: customTemplates.length,
    categories: getTemplateCategories().length,
    totalNodes: templates.reduce((sum, t) => sum + t.stats.nodeCount, 0),
    totalEdges: templates.reduce((sum, t) => sum + t.stats.edgeCount, 0)
  };
};