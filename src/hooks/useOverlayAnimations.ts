"use client";
import { useCallback, useRef, useState } from 'react';
import { Edge, Node } from 'reactflow';

interface OverlayAnimationConfig {
  size: number;
  color: string;
  speed: number; // duration in seconds
  frequency: number; // packets per second
}

interface OverlayAnimation {
  id: string;
  edgeId: string;
  svgElement: SVGSVGElement;
  interval: NodeJS.Timeout;
}

export function useOverlayAnimations() {
  const [activeAnimations, setActiveAnimations] = useState<Map<string, OverlayAnimation>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate ReactFlow-style bezier curve path
  const calculateEdgePath = useCallback((sourceNode: Node, targetNode: Node) => {
    const nodeWidth = 140;
    const nodeHeight = 52;

    // Source handle (right side of source node)
    const sourceX = sourceNode.position.x + nodeWidth;
    const sourceY = sourceNode.position.y + nodeHeight / 2;

    // Target handle (left side of target node)
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + nodeHeight / 2;

    // Control points for smooth bezier curve (same logic as ReactFlow)
    const distance = Math.abs(targetX - sourceX);
    const controlOffset = Math.min(distance * 0.3, 100);

    const controlPoint1X = sourceX + controlOffset;
    const controlPoint1Y = sourceY;

    const controlPoint2X = targetX - controlOffset;
    const controlPoint2Y = targetY;

    // Create SVG path string
    const pathData = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;

    return {
      pathData,
      sourceX,
      sourceY,
      targetX,
      targetY
    };
  }, []);

  // Create overlay SVG for animations
  const createOverlaySVG = useCallback((edgeId: string, pathData: string) => {
    if (!containerRef.current) return null;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '999';

    // Create the path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'transparent'); // Invisible path
    path.setAttribute('stroke-width', '2');
    path.setAttribute('id', `path-${edgeId}`);

    svg.appendChild(path);
    containerRef.current.appendChild(svg);

    console.log('✅ Created overlay SVG with path:', pathData);
    return svg;
  }, []);

  // Animate packet along SVG path
  const animatePacket = useCallback((
    svg: SVGSVGElement,
    pathId: string,
    config: OverlayAnimationConfig
  ) => {
    const path = svg.querySelector(`#${pathId}`) as SVGPathElement;
    if (!path) return;

    // Create animated circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', String(config.size / 2));
    circle.setAttribute('fill', config.color);
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '2');

    // Create animateMotion element
    const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
    animateMotion.setAttribute('dur', `${config.speed}s`);
    animateMotion.setAttribute('repeatCount', '1');
    animateMotion.setAttribute('rotate', 'auto');

    // Create mpath to follow the path
    const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
    mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${pathId}`);

    // Build the animation structure
    animateMotion.appendChild(mpath);
    circle.appendChild(animateMotion);
    svg.appendChild(circle);

    // Remove after animation completes
    setTimeout(() => {
      circle.remove();
    }, config.speed * 1000);

    // Start animation
    animateMotion.beginElement();

    console.log('✅ Started SVG packet animation');
  }, []);

  // Start edge animation
  const startEdgeAnimation = useCallback((
    edgeId: string,
    edge: Edge,
    nodes: Node[],
    config: OverlayAnimationConfig
  ) => {
    console.log('🚀 Starting overlay edge animation:', { edgeId, config });

    if (!containerRef.current) {
      console.error('❌ No container ref');
      return;
    }

    // Stop existing animation
    const existing = activeAnimations.get(edgeId);
    if (existing) {
      clearInterval(existing.interval);
      existing.svgElement.remove();
      setActiveAnimations(prev => {
        const newMap = new Map(prev);
        newMap.delete(edgeId);
        return newMap;
      });
    }

    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      console.error('❌ Source or target node not found');
      return;
    }

    // Calculate the edge path
    const { pathData } = calculateEdgePath(sourceNode, targetNode);
    console.log('📍 Calculated path:', pathData);

    // Create overlay SVG
    const svg = createOverlaySVG(edgeId, pathData);
    if (!svg) return;

    const pathId = `path-${edgeId}`;

    // Create interval to spawn packets
    const interval = setInterval(() => {
      console.log('✨ Creating new overlay packet');
      animatePacket(svg, pathId, config);
    }, 1000 / config.frequency);

    const animation: OverlayAnimation = {
      id: `${edgeId}-${Date.now()}`,
      edgeId,
      svgElement: svg,
      interval
    };

    setActiveAnimations(prev => new Map(prev).set(edgeId, animation));
    console.log('✅ Overlay animation started successfully');

  }, [containerRef, calculateEdgePath, createOverlaySVG, animatePacket, activeAnimations]);

  // Stop edge animation
  const stopEdgeAnimation = useCallback((edgeId: string) => {
    const animation = activeAnimations.get(edgeId);
    if (animation) {
      clearInterval(animation.interval);
      animation.svgElement.remove();
      setActiveAnimations(prev => {
        const newMap = new Map(prev);
        newMap.delete(edgeId);
        return newMap;
      });
    }
  }, [activeAnimations]);

  // Stop all animations
  const stopAllAnimations = useCallback(() => {
    activeAnimations.forEach(animation => {
      clearInterval(animation.interval);
      animation.svgElement.remove();
    });
    setActiveAnimations(new Map());
  }, [activeAnimations]);

  return {
    containerRef,
    activeAnimations: Array.from(activeAnimations.keys()),
    startEdgeAnimation,
    stopEdgeAnimation,
    stopAllAnimations
  };
}