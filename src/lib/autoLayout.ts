import ELK, { ElkNode } from 'elkjs/lib/elk.bundled.js';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: string;
}

export interface LayoutEdge {
  id: string;
  from: string;
  to: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface LayoutOptions {
  algorithm?: 'layered' | 'force' | 'stress' | 'mrtree' | 'radial' | 'disco';
  direction?: 'RIGHT' | 'DOWN' | 'LEFT' | 'UP';
  spacing?: {
    nodeNode?: number;
    edgeNode?: number;
    edgeEdge?: number;
  };
  nodeSize?: {
    minWidth?: number;
    minHeight?: number;
  };
}

const elk = new ELK();

const defaultOptions: LayoutOptions = {
  algorithm: 'layered',
  direction: 'RIGHT',
  spacing: {
    nodeNode: 80,
    edgeNode: 40,
    edgeEdge: 10,
  },
  nodeSize: {
    minWidth: 160,
    minHeight: 80,
  },
};

export async function autoLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options: LayoutOptions = {}
): Promise<LayoutNode[]> {
  const opts = { ...defaultOptions, ...options };

  // Convert our nodes to ELK format
  const elkNodes: ElkNode['children'] = nodes.map(node => ({
    id: node.id,
    width: Math.max(node.width, opts.nodeSize?.minWidth || 160),
    height: Math.max(node.height, opts.nodeSize?.minHeight || 80),
    // Add ports for connection handles with proper port sides
    ports: [
      {
        id: `${node.id}_input`,
        width: 8,
        height: 8,
        layoutOptions: {
          'port.side': 'WEST'
        }
      },
      {
        id: `${node.id}_output`,
        width: 8,
        height: 8,
        layoutOptions: {
          'port.side': 'EAST'
        }
      },
      {
        id: `${node.id}_top`,
        width: 8,
        height: 8,
        layoutOptions: {
          'port.side': 'NORTH'
        }
      },
      {
        id: `${node.id}_bottom`,
        width: 8,
        height: 8,
        layoutOptions: {
          'port.side': 'SOUTH'
        }
      },
    ],
  }));

  // Convert edges to ELK format
  const elkEdges = edges.map(edge => ({
    id: edge.id,
    sources: [`${edge.from}_${edge.sourceHandle}`],
    targets: [`${edge.to}_${edge.targetHandle}`],
  }));

  // Create ELK graph
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': opts.algorithm || 'layered',
      'elk.direction': opts.direction || 'RIGHT',
      'elk.spacing.nodeNode': opts.spacing?.nodeNode?.toString() || '80',
      'elk.spacing.edgeNode': opts.spacing?.edgeNode?.toString() || '40',
      'elk.spacing.edgeEdge': opts.spacing?.edgeEdge?.toString() || '10',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.layered.spacing.edgeNodeBetweenLayers': '30',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
      // Additional options for better layouts
      'elk.layered.nodePlacement.strategy': 'SIMPLE',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
    },
    children: elkNodes,
    edges: elkEdges,
  };

  try {
    // Run layout algorithm
    const layoutedGraph = await elk.layout(graph);

    // Convert back to our format
    const layoutedNodes: LayoutNode[] = nodes.map(originalNode => {
      const elkNode = layoutedGraph.children?.find(n => n.id === originalNode.id);

      if (elkNode && elkNode.x !== undefined && elkNode.y !== undefined) {
        return {
          ...originalNode,
          x: elkNode.x,
          y: elkNode.y,
          width: elkNode.width || originalNode.width,
          height: elkNode.height || originalNode.height,
        };
      }

      return originalNode;
    });

    return layoutedNodes;
  } catch (error) {
    console.error('Auto-layout failed:', error);
    return nodes; // Return original nodes if layout fails
  }
}

// Predefined layout presets
export const layoutPresets: Record<string, LayoutOptions> = {
  horizontal: {
    algorithm: 'layered',
    direction: 'RIGHT',
    spacing: { nodeNode: 100, edgeNode: 50 },
  },
  vertical: {
    algorithm: 'layered',
    direction: 'DOWN',
    spacing: { nodeNode: 80, edgeNode: 40 },
  },
  force: {
    algorithm: 'force',
    spacing: { nodeNode: 120, edgeNode: 60 },
  },
  radial: {
    algorithm: 'radial',
    spacing: { nodeNode: 150, edgeNode: 70 },
  },
  compact: {
    algorithm: 'layered',
    direction: 'RIGHT',
    spacing: { nodeNode: 60, edgeNode: 30 },
  },
  tree: {
    algorithm: 'mrtree',
    direction: 'DOWN',
    spacing: { nodeNode: 80, edgeNode: 40 },
  },
};