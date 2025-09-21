"use client";
import { useCallback, useRef, useState, useEffect } from 'react';
import { Edge, Node } from 'reactflow';

interface SimplePacketConfig {
  size: number;
  color: string;
  speed: number; // pixels per second
  frequency: number; // packets per second
}

interface AnimationState {
  id: string;
  element: HTMLDivElement;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  currentX: number;
  currentY: number;
  progress: number;
  speed: number;
}

export function useSimpleAnimations() {
  const [activeAnimations, setActiveAnimations] = useState<Map<string, AnimationState>>(new Map());
  const [animationIntervals, setAnimationIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Create a simple packet element
  const createPacket = useCallback((config: SimplePacketConfig) => {
    const packet = document.createElement('div');

    // Use inline styles for maximum compatibility
    packet.style.position = 'absolute';
    packet.style.width = `${config.size}px`;
    packet.style.height = `${config.size}px`;
    packet.style.backgroundColor = config.color;
    packet.style.borderRadius = '50%';
    packet.style.border = '2px solid white';
    packet.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    packet.style.zIndex = '1000';
    packet.style.pointerEvents = 'none';
    packet.style.left = '0px';
    packet.style.top = '0px';
    packet.style.transform = 'translate(0px, 0px)';

    return packet;
  }, []);

  // Get simple node center
  const getNodeCenter = useCallback((node: Node) => {
    return {
      x: node.position.x + 70, // Half of 140px width
      y: node.position.y + 26  // Half of 52px height
    };
  }, []);

  // Animation loop using requestAnimationFrame
  const animate = useCallback(() => {
    setActiveAnimations(prev => {
      const newMap = new Map(prev);
      const currentTime = Date.now();

      newMap.forEach((animation, id) => {
        // Update progress based on speed
        const deltaTime = 16; // Assume 60fps
        const distanceToTravel = Math.sqrt(
          Math.pow(animation.endX - animation.startX, 2) +
          Math.pow(animation.endY - animation.startY, 2)
        );

        const progressIncrement = (animation.speed * deltaTime / 1000) / distanceToTravel;
        animation.progress += progressIncrement;

        if (animation.progress >= 1) {
          // Animation complete - remove element and animation
          animation.element.remove();
          newMap.delete(id);
        } else {
          // Update position
          animation.currentX = animation.startX + (animation.endX - animation.startX) * animation.progress;
          animation.currentY = animation.startY + (animation.endY - animation.startY) * animation.progress;

          // Apply position to element
          animation.element.style.transform = `translate(${animation.currentX}px, ${animation.currentY}px)`;
        }
      });

      return newMap;
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Start animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  // Start edge animation
  const startEdgeAnimation = useCallback((edgeId: string, edge: Edge, nodes: Node[], config: SimplePacketConfig) => {
    console.log('🚀 Starting simple edge animation:', { edgeId, edge, config });

    if (!containerRef.current) {
      console.error('❌ No container ref');
      return;
    }

    // Stop existing animation
    const existingInterval = animationIntervals.get(edgeId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      console.error('❌ Source or target node not found');
      return;
    }

    const sourceCenter = getNodeCenter(sourceNode);
    const targetCenter = getNodeCenter(targetNode);

    console.log('📍 Animation path:', { sourceCenter, targetCenter });

    // Create interval to spawn packets
    const interval = setInterval(() => {
      console.log('✨ Creating new packet');

      const packet = createPacket(config);
      containerRef.current?.appendChild(packet);

      const animationId = `${edgeId}-${Date.now()}-${Math.random()}`;

      const animationState: AnimationState = {
        id: animationId,
        element: packet,
        startX: sourceCenter.x,
        startY: sourceCenter.y,
        endX: targetCenter.x,
        endY: targetCenter.y,
        currentX: sourceCenter.x,
        currentY: sourceCenter.y,
        progress: 0,
        speed: config.speed
      };

      // Set initial position
      packet.style.transform = `translate(${sourceCenter.x}px, ${sourceCenter.y}px)`;

      setActiveAnimations(prev => new Map(prev).set(animationId, animationState));

      console.log('📦 Packet created and added to animations');

    }, 1000 / config.frequency);

    setAnimationIntervals(prev => new Map(prev).set(edgeId, interval));

    console.log('✅ Edge animation started');
  }, [containerRef, getNodeCenter, createPacket]);

  // Stop edge animation
  const stopEdgeAnimation = useCallback((edgeId: string) => {
    const interval = animationIntervals.get(edgeId);
    if (interval) {
      clearInterval(interval);
      setAnimationIntervals(prev => {
        const newMap = new Map(prev);
        newMap.delete(edgeId);
        return newMap;
      });
    }

    // Remove all packets for this edge
    setActiveAnimations(prev => {
      const newMap = new Map(prev);
      newMap.forEach((animation, id) => {
        if (id.startsWith(edgeId)) {
          animation.element.remove();
          newMap.delete(id);
        }
      });
      return newMap;
    });
  }, [animationIntervals]);

  // Stop all animations
  const stopAllAnimations = useCallback(() => {
    animationIntervals.forEach(interval => clearInterval(interval));
    setAnimationIntervals(new Map());

    activeAnimations.forEach(animation => animation.element.remove());
    setActiveAnimations(new Map());
  }, [animationIntervals, activeAnimations]);

  return {
    containerRef,
    activeAnimations: Array.from(animationIntervals.keys()),
    startEdgeAnimation,
    stopEdgeAnimation,
    stopAllAnimations
  };
}