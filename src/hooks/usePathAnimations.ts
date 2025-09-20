"use client";
import { useCallback, useRef, useState } from 'react';
import { Edge, Node } from 'reactflow';

interface PathAnimationConfig {
  size: number;
  color: string;
  speed: number; // duration in seconds
  frequency: number; // packets per second
}

interface PathAnimation {
  id: string;
  edgeId: string;
  element: HTMLDivElement;
  pathElement: SVGPathElement;
  interval: NodeJS.Timeout;
}

export function usePathAnimations() {
  const [activeAnimations, setActiveAnimations] = useState<Map<string, PathAnimation>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Find the actual ReactFlow edge path element
  const findEdgePath = useCallback((edgeId: string): SVGPathElement | null => {
    if (!containerRef.current) {
      console.log('❌ No container ref');
      return null;
    }

    console.log('🔍 Searching for edge:', edgeId);
    console.log('📦 Container:', containerRef.current);

    // Debug: Log all elements with data-id attributes
    const allDataIds = containerRef.current.querySelectorAll('[data-id]');
    console.log('🔍 All elements with data-id:', Array.from(allDataIds).map(el => ({
      id: el.getAttribute('data-id'),
      tagName: el.tagName,
      classList: el.className
    })));

    // Try different selectors for ReactFlow edges
    const selectors = [
      `[data-id="${edgeId}"]`,
      `[data-testid="rf__edge-${edgeId}"]`,
      `.react-flow__edge[data-id="${edgeId}"]`,
      `g[data-id="${edgeId}"]`
    ];

    let edgeElement = null;
    for (const selector of selectors) {
      edgeElement = containerRef.current.querySelector(selector);
      if (edgeElement) {
        console.log(`✅ Found edge element with selector: ${selector}`, edgeElement);
        break;
      } else {
        console.log(`❌ No element found with selector: ${selector}`);
      }
    }

    if (!edgeElement) {
      console.log('❌ Edge element not found for:', edgeId);

      // Debug: Try to find any SVG paths
      const allPaths = containerRef.current.querySelectorAll('path');
      console.log('🔍 All SVG paths found:', allPaths.length);
      allPaths.forEach((path, index) => {
        console.log(`Path ${index}:`, {
          d: path.getAttribute('d'),
          parentElement: path.parentElement?.tagName,
          parentDataId: path.parentElement?.getAttribute('data-id')
        });
      });

      return null;
    }

    // Find the path element within the edge
    const pathElement = edgeElement.querySelector('path');
    if (!pathElement) {
      console.log('❌ Path element not found in edge:', edgeId);
      console.log('🔍 Edge element children:', edgeElement.children);
      return null;
    }

    console.log('✅ Found edge path element:', pathElement);
    console.log('📏 Path data:', pathElement.getAttribute('d'));
    return pathElement;
  }, []);

  // Create packet element
  const createPacket = useCallback((config: PathAnimationConfig) => {
    const packet = document.createElement('div');
    packet.style.position = 'absolute';
    packet.style.width = `${config.size}px`;
    packet.style.height = `${config.size}px`;
    packet.style.backgroundColor = config.color;
    packet.style.borderRadius = '50%';
    packet.style.border = '2px solid white';
    packet.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    packet.style.zIndex = '1000';
    packet.style.pointerEvents = 'none';
    packet.style.transform = 'translate(-50%, -50%)'; // Center the packet on the path
    return packet;
  }, []);

  // Animate packet along SVG path
  const animateAlongPath = useCallback((
    packet: HTMLDivElement,
    pathElement: SVGPathElement,
    config: PathAnimationConfig
  ) => {
    console.log('🎯 Starting path animation');

    const pathLength = pathElement.getTotalLength();
    console.log('📏 Path length:', pathLength);

    let progress = 0;
    const startTime = Date.now();
    const duration = config.speed * 1000; // Convert to milliseconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);

      // Get point along the path
      const point = pathElement.getPointAtLength(progress * pathLength);

      // Position the packet at this point
      packet.style.left = `${point.x}px`;
      packet.style.top = `${point.y}px`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - remove packet
        packet.remove();
        console.log('✅ Packet animation completed');
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // Start edge animation
  const startEdgeAnimation = useCallback((
    edgeId: string,
    edge: Edge,
    nodes: Node[],
    config: PathAnimationConfig
  ) => {
    console.log('🚀 Starting path-based edge animation:', { edgeId, config });

    if (!containerRef.current) {
      console.error('❌ No container ref');
      return;
    }

    // Stop existing animation
    const existing = activeAnimations.get(edgeId);
    if (existing) {
      clearInterval(existing.interval);
      existing.element.remove();
      setActiveAnimations(prev => {
        const newMap = new Map(prev);
        newMap.delete(edgeId);
        return newMap;
      });
    }

    // Wait a bit for ReactFlow to render the edge, then find its path
    setTimeout(() => {
      const pathElement = findEdgePath(edgeId);
      if (!pathElement) {
        console.error('❌ Could not find path for edge:', edgeId);
        return;
      }

      console.log('✅ Found path element, starting animation');

      // Create interval to spawn packets
      const interval = setInterval(() => {
        console.log('✨ Creating new path-following packet');

        const packet = createPacket(config);
        containerRef.current?.appendChild(packet);

        // Animate along the actual edge path
        animateAlongPath(packet, pathElement, config);

      }, 1000 / config.frequency);

      const animation: PathAnimation = {
        id: `${edgeId}-${Date.now()}`,
        edgeId,
        element: document.createElement('div'), // Placeholder
        pathElement,
        interval
      };

      setActiveAnimations(prev => new Map(prev).set(edgeId, animation));
      console.log('✅ Path animation started successfully');

    }, 100); // Small delay to let ReactFlow render

  }, [containerRef, findEdgePath, createPacket, animateAlongPath, activeAnimations]);

  // Stop edge animation
  const stopEdgeAnimation = useCallback((edgeId: string) => {
    const animation = activeAnimations.get(edgeId);
    if (animation) {
      clearInterval(animation.interval);
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