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

  // Export as PDF using jsPDF
  async exportAsPDF(options: ExportMethodOptions = {}): Promise<Blob> {
    const { jsPDF } = await import('jspdf');

    const opts = {
      scale: 2,
      padding: 50,
      background: '#ffffff',
      ...options,
    };

    const bounds = this.calculateBounds(opts.padding);

    // Convert pixels to mm (jsPDF uses mm)
    const mmPerPx = 0.264583;
    const widthMM = bounds.width * mmPerPx;
    const heightMM = bounds.height * mmPerPx;

    // Determine orientation and paper size
    const isLandscape = widthMM > heightMM;
    const orientation = isLandscape ? 'landscape' : 'portrait';

    // Use A4 as base, but scale if content is larger
    const a4Width = isLandscape ? 297 : 210;
    const a4Height = isLandscape ? 210 : 297;

    let pdfWidth = a4Width;
    let pdfHeight = a4Height;

    // If content is larger than A4, use custom size
    if (widthMM > a4Width || heightMM > a4Height) {
      pdfWidth = Math.max(widthMM, a4Width);
      pdfHeight = Math.max(heightMM, a4Height);
    }

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });

    // Create high-res PNG image
    const pngBlob = await this.exportAsPNG({
      ...opts,
      scale: 3, // Higher scale for PDF
    });

    // Convert blob to data URL
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    const url = URL.createObjectURL(pngBlob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);

        // Add image to PDF
        const imgWidthMM = bounds.width * mmPerPx;
        const imgHeightMM = bounds.height * mmPerPx;

        // Center the image on the page
        const x = (pdfWidth - imgWidthMM) / 2;
        const y = (pdfHeight - imgHeightMM) / 2;

        pdf.addImage(imgData, 'PNG', x, y, imgWidthMM, imgHeightMM);

        // Add metadata
        if (options.title) {
          pdf.setProperties({ title: options.title });
        }
        if (options.description) {
          pdf.setProperties({ subject: options.description });
        }

        // Add watermark if specified
        if (options.watermark) {
          pdf.setFontSize(10);
          pdf.setTextColor(128, 128, 128);
          pdf.text(options.watermark, pdfWidth - 10, pdfHeight - 5, { align: 'right' });
        }

        // Return as blob
        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for PDF'));
      };

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

  // Draw diagram on canvas context with enhanced rendering
  private async drawDiagram(ctx: CanvasRenderingContext2D, options: ExportMethodOptions): Promise<void> {
    // Set high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw groups first (background)
    this.groups.forEach(group => {
      this.drawGroup(ctx, group);
    });

    // Draw edges
    this.edges.forEach(edge => {
      this.drawEdge(ctx, edge);
    });

    // Draw nodes
    this.nodes.forEach(node => {
      this.drawNode(ctx, node, options);
    });
  }

  // Enhanced node drawing with icons and proper styling
  private drawNode(ctx: CanvasRenderingContext2D, node: Node, options: ExportMethodOptions): void {
    const { x, y, width, height, color, borderColor, textColor, shape, label } = node;

    ctx.save();

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Main shape
    ctx.fillStyle = color;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;

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
        ctx.rect(x, y, width, height);
    }

    ctx.fill();
    ctx.stroke();

    // Clear shadow for subsequent drawing
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Node type badge (dark background)
    const badgeHeight = 18;
    const badgeY = y + 6;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(x + 4, badgeY, width - 8, badgeHeight);

    // Draw icon in badge area
    this.drawNodeIcon(ctx, node, x + 8, badgeY + 3);

    // Type text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '600 8px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(node.type.toUpperCase(), x + 8 + 12 + 4, badgeY + 12);

    // Main label
    ctx.fillStyle = textColor;
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Handle text wrapping
    const maxLabelWidth = width - 16;
    const labelWidth = ctx.measureText(label).width;
    const labelY = y + height / 2 + 4;

    if (labelWidth > maxLabelWidth && label.length > 10) {
      const words = label.split(' ');
      if (words.length > 1) {
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');
        ctx.fillText(line1, x + width / 2, labelY - 6);
        ctx.fillText(line2, x + width / 2, labelY + 8);
      } else {
        const truncated = label.length > 12 ? label.substring(0, 12) + '...' : label;
        ctx.fillText(truncated, x + width / 2, labelY);
      }
    } else {
      ctx.fillText(label, x + width / 2, labelY);
    }

    ctx.restore();
  }

  // Draw node type icon
  private drawNodeIcon(ctx: CanvasRenderingContext2D, node: Node, iconX: number, iconY: number): void {
    const iconSize = 12;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;

    switch (node.type) {
      case 'database':
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
        ctx.beginPath();
        ctx.arc(iconX + 3, iconY + 7, 2, 0, 2 * Math.PI);
        ctx.arc(iconX + 6, iconY + 5, 3, 0, 2 * Math.PI);
        ctx.arc(iconX + 9, iconY + 7, 2, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'security':
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
        ctx.fillRect(iconX + 2, iconY + 3, iconSize - 4, 6);
        ctx.strokeRect(iconX + 2, iconY + 3, iconSize - 4, 6);
        ctx.fillStyle = node.borderColor;
        ctx.fillRect(iconX + 3, iconY + 7, iconSize - 6, 1);
        break;
      default:
        // Server/service (default)
        ctx.strokeRect(iconX + 2, iconY + 2, iconSize - 4, iconSize - 4);
        for (let i = 0; i < 2; i++) {
          ctx.fillRect(iconX + 3, iconY + 4 + i * 2, iconSize - 6, 1);
        }
        ctx.beginPath();
        ctx.arc(iconX + iconSize - 3, iconY + 4, 1, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.restore();
  }

  // Enhanced edge drawing
  private drawEdge(ctx: CanvasRenderingContext2D, edge: Edge): void {
    const sourceNode = this.nodes.find(n => n.id === edge.sourceId);
    const targetNode = this.nodes.find(n => n.id === edge.targetId);

    if (!sourceNode || !targetNode) return;

    const sourcePoint = this.getConnectionPoint(sourceNode, edge.sourceHandle);
    const targetPoint = this.getConnectionPoint(targetNode, edge.targetHandle);

    ctx.save();
    ctx.strokeStyle = edge.color;
    ctx.lineWidth = edge.width;

    if (edge.style === 'dashed') ctx.setLineDash([8, 4]);
    else if (edge.style === 'dotted') ctx.setLineDash([2, 3]);

    // Create curved path
    const cpX1 = sourcePoint.x + (targetPoint.x - sourcePoint.x) * 0.3;
    const cpY1 = sourcePoint.y;
    const cpX2 = targetPoint.x - (targetPoint.x - sourcePoint.x) * 0.3;
    const cpY2 = targetPoint.y;

    ctx.beginPath();
    ctx.moveTo(sourcePoint.x, sourcePoint.y);
    ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, targetPoint.x, targetPoint.y);
    ctx.stroke();

    // Draw arrowhead
    this.drawArrowhead(ctx, cpX2, cpY2, targetPoint.x, targetPoint.y, edge.color);

    // Draw edge label
    if (edge.label) {
      const midX = (sourcePoint.x + targetPoint.x) / 2;
      const midY = (sourcePoint.y + targetPoint.y) / 2 - 5;

      ctx.fillStyle = edge.color;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(edge.label, midX, midY);
    }

    ctx.restore();
  }

  // Draw arrowhead for edges
  private drawArrowhead(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string): void {
    const headlen = 8;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Enhanced group drawing
  private drawGroup(ctx: CanvasRenderingContext2D, group: NodeGroup): void {
    ctx.save();
    ctx.globalAlpha = 0.8;

    // Group background
    ctx.fillStyle = group.backgroundColor;
    ctx.strokeStyle = group.borderColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Rounded rectangle for group
    const cornerRadius = 8;
    const { x, y, width, height } = group;

    ctx.beginPath();
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

    ctx.fill();
    ctx.stroke();

    // Group label
    ctx.setLineDash([]);
    ctx.fillStyle = group.borderColor;
    ctx.font = '600 14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(group.label, x + 10, y + 20);

    ctx.restore();
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
export async function convertPNGtoJPG(pngBlob: Blob, quality: number): Promise<Blob> {
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