interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: string;
  color: string;
  borderColor: string;
  textColor: string;
  shape: 'rectangle' | 'rounded' | 'circle' | 'diamond';
  isVisible: boolean;
}

interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: string;
  targetHandle: string;
  label: string;
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  animated: boolean;
  isVisible: boolean;
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
  isVisible: boolean;
  padding: number;
}

interface ExportMethodOptions {
  quality?: number; // For JPG/PNG (0-1)
  scale?: number; // Scale factor (1-4)
  padding?: number; // Padding around diagram
  background?: string; // Background color
  includeGrid?: boolean;
  title?: string;
  description?: string;
  watermark?: string;
  theme?: 'light' | 'dark';
}

interface ExportOptions extends ExportMethodOptions {
  format: 'png' | 'svg' | 'pdf' | 'jpg';
}

interface DiagramBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export class DiagramExporter {
  private nodes: Node[];
  private edges: Edge[];
  private groups: NodeGroup[];

  constructor(nodes: Node[], edges: Edge[], groups: NodeGroup[] = []) {
    this.nodes = nodes.filter(node => node.isVisible);
    this.edges = edges.filter(edge => edge.isVisible);
    this.groups = groups.filter(group => group.isVisible);
  }

  // Calculate diagram bounds
  private calculateBounds(padding: number = 50): DiagramBounds {
    if (this.nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // Consider nodes
    this.nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    // Consider groups
    this.groups.forEach(group => {
      minX = Math.min(minX, group.x - group.padding);
      minY = Math.min(minY, group.y - group.padding);
      maxX = Math.max(maxX, group.x + group.width + group.padding);
      maxY = Math.max(maxY, group.y + group.height + group.padding);
    });

    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: (maxX - minX) + (padding * 2),
      height: (maxY - minY) + (padding * 2),
    };
  }

  // Export as PNG with high quality
  async exportAsPNG(options: ExportMethodOptions = {}): Promise<Blob> {
    const opts = {
      scale: 2,
      padding: 50,
      background: '#ffffff',
      quality: 1,
      ...options,
    };

    const bounds = this.calculateBounds(opts.padding);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Set high resolution
    canvas.width = bounds.width * opts.scale;
    canvas.height = bounds.height * opts.scale;
    ctx.scale(opts.scale, opts.scale);

    // Apply background
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, bounds.width, bounds.height);

    // Translate to account for bounds
    ctx.translate(-bounds.minX, -bounds.minY);

    // Draw diagram
    await this.drawDiagram(ctx, opts);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png', opts.quality);
    });
  }

  // Export as SVG
  async exportAsSVG(options: ExportMethodOptions = {}): Promise<string> {
    const opts = {
      padding: 50,
      background: '#ffffff',
      includeGrid: false,
      ...options,
    };

    const bounds = this.calculateBounds(opts.padding);

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}"
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <style>
      .node-text { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600; }
      .edge-text { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; }
      .group-text { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 700; }
    </style>
    ${this.generateSVGDefs()}
  </defs>`;

    // Background
    if (opts.background) {
      svg += `\n  <rect width="100%" height="100%" fill="${opts.background}"/>`;
    }

    // Grid
    if (opts.includeGrid) {
      svg += this.generateSVGGrid(bounds);
    }

    // Translate group
    svg += `\n  <g transform="translate(${-bounds.minX}, ${-bounds.minY})">`;

    // Draw groups first (background)
    this.groups.forEach(group => {
      svg += this.generateSVGGroup(group);
    });

    // Draw edges
    this.edges.forEach(edge => {
      svg += this.generateSVGEdge(edge);
    });

    // Draw nodes
    this.nodes.forEach(node => {
      svg += this.generateSVGNode(node);
    });

    svg += '\n  </g>';

    // Add title and metadata
    if (opts.title) {
      svg += `\n  <title>${this.escapeXML(opts.title)}</title>`;
    }

    if (opts.description) {
      svg += `\n  <desc>${this.escapeXML(opts.description)}</desc>`;
    }

    // Watermark
    if (opts.watermark) {
      svg += `\n  <text x="${bounds.width - 10}" y="${bounds.height - 10}"
              text-anchor="end" fill="#00000020" font-size="12" font-family="Inter">
              ${this.escapeXML(opts.watermark)}
            </text>`;
    }

    svg += '\n</svg>';
    return svg;
  }

  // Export as PDF (using SVG to PDF conversion)
  async exportAsPDF(options: ExportMethodOptions = {}): Promise<Blob> {
    const svgString = await this.exportAsSVG(options);

    // Create a canvas to render the SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const bounds = this.calculateBounds(options.padding || 50);

    canvas.width = bounds.width;
    canvas.height = bounds.height;

    // Convert SVG to canvas
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        // For PDF, we'd typically use a library like jsPDF
        // For now, we'll return a high-quality PNG
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create PDF'));
        }, 'image/png', 1.0);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // Generate SVG definitions (gradients, patterns, etc.)
  private generateSVGDefs(): string {
    return `
    <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.1);stop-opacity:1" />
    </linearGradient>
    <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>
    </filter>
    <marker id="arrowhead" markerWidth="10" markerHeight="7"
            refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
    </marker>`;
  }

  // Generate SVG grid pattern
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private generateSVGGrid(_bounds: DiagramBounds): string {
    const gridSize = 20;
    const opacity = 0.1;

    return `
    <defs>
      <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
        <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="#00000020" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" opacity="${opacity}"/>`;
  }

  // Generate SVG for a node
  private generateSVGNode(node: Node): string {
    const { x, y, width, height, label, color, borderColor, textColor, shape } = node;

    let pathData = '';
    let shapeElement = '';

    switch (shape) {
      case 'circle':
        const circleRadius = Math.min(width, height) / 2;
        const cx = x + width / 2;
        const cy = y + height / 2;
        shapeElement = `<circle cx="${cx}" cy="${cy}" r="${circleRadius}" fill="${color}" stroke="${borderColor}" stroke-width="2" filter="url(#dropShadow)"/>`;
        break;
      case 'diamond':
        pathData = `M ${x + width/2} ${y} L ${x + width} ${y + height/2} L ${x + width/2} ${y + height} L ${x} ${y + height/2} Z`;
        shapeElement = `<path d="${pathData}" fill="${color}" stroke="${borderColor}" stroke-width="2" filter="url(#dropShadow)"/>`;
        break;
      case 'rounded':
        shapeElement = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" ry="12" fill="${color}" stroke="${borderColor}" stroke-width="2" filter="url(#dropShadow)"/>`;
        break;
      default: // rectangle
        shapeElement = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}" stroke="${borderColor}" stroke-width="2" filter="url(#dropShadow)"/>`;
    }

    const textX = x + width / 2;
    const textY = y + height / 2;

    return `
    <g class="node" data-id="${node.id}">
      ${shapeElement}
      <text x="${textX}" y="${textY}" text-anchor="middle" dominant-baseline="central"
            fill="${textColor}" class="node-text" font-size="14">${this.escapeXML(label)}</text>
    </g>`;
  }

  // Generate SVG for an edge
  private generateSVGEdge(edge: Edge): string {
    const sourceNode = this.nodes.find(n => n.id === edge.sourceId);
    const targetNode = this.nodes.find(n => n.id === edge.targetId);

    if (!sourceNode || !targetNode) return '';

    const sourcePoint = this.getConnectionPoint(sourceNode, edge.sourceHandle);
    const targetPoint = this.getConnectionPoint(targetNode, edge.targetHandle);

    const strokeDasharray = edge.style === 'dashed' ? '8,4' : edge.style === 'dotted' ? '2,3' : 'none';

    // Create curved path
    const controlPoint1X = sourcePoint.x + (targetPoint.x - sourcePoint.x) * 0.3;
    const controlPoint1Y = sourcePoint.y;
    const controlPoint2X = targetPoint.x - (targetPoint.x - sourcePoint.x) * 0.3;
    const controlPoint2Y = targetPoint.y;

    const pathData = `M ${sourcePoint.x} ${sourcePoint.y} C ${controlPoint1X} ${controlPoint1Y} ${controlPoint2X} ${controlPoint2Y} ${targetPoint.x} ${targetPoint.y}`;

    return `
    <g class="edge" data-id="${edge.id}">
      <path d="${pathData}" fill="none" stroke="${edge.color}" stroke-width="${edge.width}"
            stroke-dasharray="${strokeDasharray}" marker-end="url(#arrowhead)"/>
      ${edge.label ? `<text x="${(sourcePoint.x + targetPoint.x) / 2}" y="${(sourcePoint.y + targetPoint.y) / 2 - 5}"
                      text-anchor="middle" fill="${edge.color}" class="edge-text">${this.escapeXML(edge.label)}</text>` : ''}
    </g>`;
  }

  // Generate SVG for a group
  private generateSVGGroup(group: NodeGroup): string {
    const { x, y, width, height, label, borderColor, backgroundColor } = group;

    return `
    <g class="group" data-id="${group.id}">
      <rect x="${x}" y="${y}" width="${width}" height="${height}"
            fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2"
            stroke-dasharray="5,5" rx="8" opacity="0.8"/>
      <text x="${x + 10}" y="${y + 20}" fill="${borderColor}" class="group-text" font-size="14">
        ${this.escapeXML(label)}
      </text>
    </g>`;
  }

  // Get connection point for a node handle
  private getConnectionPoint(node: Node, handle: string): { x: number; y: number } {
    switch (handle) {
      case 'top':
        return { x: node.x + node.width / 2, y: node.y };
      case 'bottom':
        return { x: node.x + node.width / 2, y: node.y + node.height };
      case 'input': // left
        return { x: node.x, y: node.y + node.height / 2 };
      case 'output': // right
      default:
        return { x: node.x + node.width, y: node.y + node.height / 2 };
    }
  }

  // Draw diagram on canvas context
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async drawDiagram(ctx: CanvasRenderingContext2D, _options: ExportMethodOptions): Promise<void> {
    // This would use the existing canvas drawing functions from ModernDiagramCanvas
    // For now, we'll use a simplified version

    // Draw groups first
    this.groups.forEach(group => {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = group.backgroundColor;
      ctx.strokeStyle = group.borderColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      ctx.fillRect(group.x, group.y, group.width, group.height);
      ctx.strokeRect(group.x, group.y, group.width, group.height);

      ctx.setLineDash([]);
      ctx.fillStyle = group.borderColor;
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(group.label, group.x + 10, group.y + 20);
      ctx.restore();
    });

    // Draw edges
    this.edges.forEach(edge => {
      const sourceNode = this.nodes.find(n => n.id === edge.sourceId);
      const targetNode = this.nodes.find(n => n.id === edge.targetId);

      if (sourceNode && targetNode) {
        const sourcePoint = this.getConnectionPoint(sourceNode, edge.sourceHandle);
        const targetPoint = this.getConnectionPoint(targetNode, edge.targetHandle);

        ctx.save();
        ctx.strokeStyle = edge.color;
        ctx.lineWidth = edge.width;

        if (edge.style === 'dashed') ctx.setLineDash([8, 4]);
        else if (edge.style === 'dotted') ctx.setLineDash([2, 3]);

        ctx.beginPath();
        ctx.moveTo(sourcePoint.x, sourcePoint.y);

        // Create curved path
        const cpX1 = sourcePoint.x + (targetPoint.x - sourcePoint.x) * 0.3;
        const cpY1 = sourcePoint.y;
        const cpX2 = targetPoint.x - (targetPoint.x - sourcePoint.x) * 0.3;
        const cpY2 = targetPoint.y;

        ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, targetPoint.x, targetPoint.y);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw nodes
    this.nodes.forEach(node => {
      ctx.save();
      ctx.fillStyle = node.color;
      ctx.strokeStyle = node.borderColor;
      ctx.lineWidth = 2;

      // Draw shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      // Draw shape
      ctx.beginPath();
      switch (node.shape) {
        case 'circle':
          const nodeRadius = Math.min(node.width, node.height) / 2;
          ctx.arc(node.x + node.width / 2, node.y + node.height / 2, nodeRadius, 0, 2 * Math.PI);
          break;
        case 'diamond':
          ctx.moveTo(node.x + node.width / 2, node.y);
          ctx.lineTo(node.x + node.width, node.y + node.height / 2);
          ctx.lineTo(node.x + node.width / 2, node.y + node.height);
          ctx.lineTo(node.x, node.y + node.height / 2);
          ctx.closePath();
          break;
        case 'rounded':
          // Use manual rounded rectangle for better browser compatibility
          const x = node.x;
          const y = node.y;
          const width = node.width;
          const height = node.height;
          const cornerRadius = 12;

          ctx.moveTo(x + cornerRadius, y);
          ctx.lineTo(x + width - cornerRadius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
          ctx.lineTo(x + width, y + height - cornerRadius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
          ctx.lineTo(x + cornerRadius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
          ctx.lineTo(x, y + cornerRadius);
          ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
          ctx.closePath();
          break;
        default: // rectangle
          ctx.rect(node.x, node.y, node.width, node.height);
      }

      ctx.fill();
      ctx.stroke();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw text
      ctx.fillStyle = node.textColor;
      ctx.font = '600 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x + node.width / 2, node.y + node.height / 2);

      ctx.restore();
    });
  }

  // Utility function to escape XML characters
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}

// Export utility functions
export async function exportDiagram(
  nodes: Node[],
  edges: Edge[],
  groups: NodeGroup[],
  options: ExportOptions
): Promise<Blob | string> {
  const exporter = new DiagramExporter(nodes, edges, groups);

  switch (options.format) {
    case 'png':
      return exporter.exportAsPNG(options);
    case 'svg':
      return exporter.exportAsSVG(options);
    case 'pdf':
      return exporter.exportAsPDF(options);
    case 'jpg':
      const pngBlob = await exporter.exportAsPNG(options);
      return convertPNGtoJPG(pngBlob, options.quality || 0.9);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

// Convert PNG to JPG
async function convertPNGtoJPG(pngBlob: Blob, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const img = new Image();
  const url = URL.createObjectURL(pngBlob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Fill white background for JPG
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(blob => {
        URL.revokeObjectURL(url); // Clean up the URL
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert to JPG'));
        }
      }, 'image/jpeg', quality);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url); // Clean up the URL on error
      reject(new Error('Failed to load image for JPG conversion'));
    };

    img.src = url;
  });
}

// Download helper
export function downloadFile(data: Blob | string, filename: string): void {
  const blob = typeof data === 'string' ? new Blob([data], { type: 'text/plain' }) : data;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}