"use client";
import { useCallback, useRef, useState } from 'react';
import { Edge, Node, useReactFlow } from 'reactflow';
import gsap from 'gsap';

interface PacketConfig {
  type: 'data' | 'request' | 'response' | 'error' | 'heartbeat';
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'diamond';
  speed: number;
  frequency: number;
  bidirectional: boolean;
  trail: boolean;
  label?: string;
}

interface ActiveEdgeAnimation {
  edgeId: string;
  config: PacketConfig;
  interval: NodeJS.Timeout;
  elements: HTMLDivElement[];
}

export function useEdgeAnimations() {
  const [activeAnimations, setActiveAnimations] = useState<Map<string, ActiveEdgeAnimation>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { getNodes, getEdges } = useReactFlow();

  // Get node handle positions (where edges connect)
  const getNodeHandlePosition = useCallback((node: Node, handleType: 'source' | 'target') => {
    const nodeWidth = 140; // CustomNode width
    const nodeHeight = 52; // CustomNode height

    if (handleType === 'source') {
      // Source handle is on the right side
      return {
        x: node.position.x + nodeWidth,
        y: node.position.y + nodeHeight / 2
      };
    } else {
      // Target handle is on the left side
      return {
        x: node.position.x,
        y: node.position.y + nodeHeight / 2
      };
    }
  }, []);

  // Get the actual edge path coordinates
  const getEdgePathPoints = useCallback((edge: Edge, sourceNode: Node, targetNode: Node) => {
    const sourceHandle = getNodeHandlePosition(sourceNode, 'source');
    const targetHandle = getNodeHandlePosition(targetNode, 'target');

    // Calculate control points for smooth curve
    const distance = Math.abs(targetHandle.x - sourceHandle.x);
    const controlOffset = Math.min(distance * 0.3, 100); // Smooth curve

    const controlPoint1 = {
      x: sourceHandle.x + controlOffset,
      y: sourceHandle.y
    };

    const controlPoint2 = {
      x: targetHandle.x - controlOffset,
      y: targetHandle.y
    };

    // Return bezier curve points
    return {
      start: sourceHandle,
      end: targetHandle,
      controlPoint1,
      controlPoint2
    };
  }, [getNodeHandlePosition]);

  // Transform coordinates for ReactFlow viewport
  const transformCoordinates = useCallback((x: number, y: number) => {
    if (!containerRef.current) return { x, y };

    const reactFlowViewport = containerRef.current.querySelector('.react-flow__viewport');
    if (!reactFlowViewport) return { x, y };

    const transform = window.getComputedStyle(reactFlowViewport).transform;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    if (transform !== 'none') {
      const matrix = transform.match(/matrix.*\((.+)\)/)?.[1].split(', ');
      if (matrix && matrix.length >= 6) {
        scale = parseFloat(matrix[0]);
        translateX = parseFloat(matrix[4]);
        translateY = parseFloat(matrix[5]);
      }
    }

    return {
      x: x * scale + translateX,
      y: y * scale + translateY
    };
  }, []);

  // Create packet element
  const createPacketElement = useCallback((config: PacketConfig): HTMLDivElement => {
    const element = document.createElement('div');
    element.className = 'absolute pointer-events-none';
    element.style.width = `${config.size}px`;
    element.style.height = `${config.size}px`;
    element.style.backgroundColor = config.color;
    element.style.zIndex = '1000';
    element.style.position = 'absolute';
    element.style.opacity = '1';

    // Apply shape
    switch (config.shape) {
      case 'circle':
        element.style.borderRadius = '50%';
        break;
      case 'square':
        element.style.borderRadius = '2px';
        break;
      case 'diamond':
        element.style.borderRadius = '2px';
        element.style.transform = 'rotate(45deg)';
        break;
    }

    // Add trail effect
    if (config.trail) {
      element.style.boxShadow = `0 0 ${config.size * 2}px ${config.color}`;
    }

    // Add label if provided
    if (config.label) {
      element.innerHTML = config.label;
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
      element.style.fontSize = `${Math.max(8, config.size * 0.6)}px`;
      element.style.fontWeight = 'bold';
      element.style.color = 'white';
      element.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
    }

    return element;
  }, []);

  // Animate packet along edge path
  const animatePacketAlongEdge = useCallback((
    element: HTMLDivElement,
    pathPoints: { start: { x: number; y: number }; end: { x: number; y: number }; controlPoint1: { x: number; y: number }; controlPoint2: { x: number; y: number } },
    config: PacketConfig,
    onComplete?: () => void
  ) => {
    console.log('🎯 Animating packet along edge path:', pathPoints);

    // Transform all path points
    const transformedStart = transformCoordinates(pathPoints.start.x, pathPoints.start.y);
    const transformedEnd = transformCoordinates(pathPoints.end.x, pathPoints.end.y);
    const transformedCP1 = transformCoordinates(pathPoints.controlPoint1.x, pathPoints.controlPoint1.y);
    const transformedCP2 = transformCoordinates(pathPoints.controlPoint2.x, pathPoints.controlPoint2.y);

    console.log('🔄 Transformed path coordinates:', {
      start: transformedStart,
      end: transformedEnd,
      cp1: transformedCP1,
      cp2: transformedCP2
    });

    // Set initial position
    gsap.set(element, {
      x: transformedStart.x,
      y: transformedStart.y,
      opacity: 1
    });

    // Create SVG path string for motion path
    const pathString = `M${transformedStart.x},${transformedStart.y} C${transformedCP1.x},${transformedCP1.y} ${transformedCP2.x},${transformedCP2.y} ${transformedEnd.x},${transformedEnd.y}`;

    console.log('📍 Motion path:', pathString);

    // Animate along the curved path using basic GSAP with multiple waypoints
    const timeline = gsap.timeline();

    // Create smooth curve by animating through waypoints
    timeline
      .to(element, {
        x: transformedCP1.x,
        y: transformedCP1.y,
        duration: config.speed * 0.33,
        ease: 'power2.out'
      })
      .to(element, {
        x: transformedCP2.x,
        y: transformedCP2.y,
        duration: config.speed * 0.33,
        ease: 'power2.inOut'
      })
      .to(element, {
        x: transformedEnd.x,
        y: transformedEnd.y,
        duration: config.speed * 0.34,
        ease: 'power2.in',
        onUpdate: () => {
          console.log('🔄 Animation frame - transform:', element.style.transform);
        },
        onComplete: () => {
          console.log('✅ Animation reached destination');
          gsap.to(element, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
              console.log('💨 Packet faded out and removed');
              element.remove();
              onComplete?.();
            }
          });
        }
      });
  }, [transformCoordinates]);

  // Start edge animation
  const startEdgeAnimation = useCallback((
    edgeId: string,
    edge: Edge,
    nodes: Node[],
    config: PacketConfig
  ) => {
    console.log('🎬 Starting edge animation:', { edgeId, edge, config });

    if (!containerRef.current) {
      console.error('❌ No container ref available for edge animation');
      return;
    }

    console.log('📦 Container for edge animation:', containerRef.current);

    // Stop existing animation inline
    setActiveAnimations(prev => {
      const existingAnimation = prev.get(edgeId);
      if (existingAnimation) {
        clearInterval(existingAnimation.interval);
        existingAnimation.elements.forEach(element => {
          gsap.killTweensOf(element);
          element.remove();
        });
      }
      return prev;
    });

    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      console.error('❌ Could not find source or target nodes:', { sourceNode, targetNode });
      return;
    }

    const edgePathPoints = getEdgePathPoints(edge, sourceNode, targetNode);

    console.log('📍 Edge path points:', edgePathPoints);

    const elements: HTMLDivElement[] = [];

    // Create first packet immediately for testing
    console.log('🚀 Creating first test packet');
    const testElement = createPacketElement(config);
    console.log('✨ Created test packet element:', testElement);

    // Add bright styling for visibility
    testElement.style.backgroundColor = '#ff0000';
    testElement.style.border = '3px solid yellow';
    testElement.style.width = '20px';
    testElement.style.height = '20px';
    testElement.style.zIndex = '2000';

    containerRef.current.appendChild(testElement);
    elements.push(testElement);

    console.log('📍 Appended test packet to container');
    console.log('👥 Container children count:', containerRef.current.children.length);

    // Test if element is in DOM
    console.log('🌐 Test packet in DOM:', document.contains(testElement));

    // Check container positioning
    const containerRect = containerRef.current.getBoundingClientRect();
    console.log('📦 Container bounding rect:', containerRect);
    console.log('🎨 Container styles:', {
      position: window.getComputedStyle(containerRef.current).position,
      overflow: window.getComputedStyle(containerRef.current).overflow,
      zIndex: window.getComputedStyle(containerRef.current).zIndex
    });

    // Force element to be visible for testing
    testElement.style.position = 'fixed';
    testElement.style.left = '100px';
    testElement.style.top = '100px';
    testElement.style.zIndex = '9999';
    console.log('🔧 Forced test element to fixed position for visibility test');

    animatePacketAlongEdge(testElement, edgePathPoints, config, () => {
      console.log('✅ Test packet animation completed');
      const index = elements.indexOf(testElement);
      if (index > -1) elements.splice(index, 1);
    });

    // Create animation interval
    const interval = setInterval(() => {
      console.log('⏱️ Creating interval packet');

      // Forward direction packet
      const forwardElement = createPacketElement(config);
      containerRef.current?.appendChild(forwardElement);
      elements.push(forwardElement);

      animatePacketAlongEdge(forwardElement, edgePathPoints, config, () => {
        const index = elements.indexOf(forwardElement);
        if (index > -1) elements.splice(index, 1);
      });

      // Bidirectional packet (return direction)
      if (config.bidirectional) {
        setTimeout(() => {
          const returnElement = createPacketElement({
            ...config,
            color: config.color + '80' // Add transparency for return packets
          });
          containerRef.current?.appendChild(returnElement);
          elements.push(returnElement);

          // Reverse the path for return direction
          const reversedPathPoints = {
            start: edgePathPoints.end,
            end: edgePathPoints.start,
            controlPoint1: edgePathPoints.controlPoint2,
            controlPoint2: edgePathPoints.controlPoint1
          };

          animatePacketAlongEdge(returnElement, reversedPathPoints, config, () => {
            const index = elements.indexOf(returnElement);
            if (index > -1) elements.splice(index, 1);
          });
        }, config.speed * 500); // Start return packet halfway through forward packet
      }
    }, 1000 / config.frequency);

    const activeAnimation: ActiveEdgeAnimation = {
      edgeId,
      config,
      interval,
      elements
    };

    setActiveAnimations(prev => new Map(prev).set(edgeId, activeAnimation));
    console.log('✅ Edge animation started successfully');
  }, [containerRef, getEdgePathPoints, createPacketElement, animatePacketAlongEdge]);

  // Stop edge animation
  const stopEdgeAnimation = useCallback((edgeId: string) => {
    setActiveAnimations(prev => {
      const animation = prev.get(edgeId);
      if (animation) {
        clearInterval(animation.interval);
        animation.elements.forEach(element => {
          gsap.killTweensOf(element);
          element.remove();
        });

        const newMap = new Map(prev);
        newMap.delete(edgeId);
        return newMap;
      }
      return prev;
    });
  }, []);

  // Stop all animations
  const stopAllEdgeAnimations = useCallback(() => {
    setActiveAnimations(prev => {
      prev.forEach((animation) => {
        clearInterval(animation.interval);
        animation.elements.forEach(element => {
          gsap.killTweensOf(element);
          element.remove();
        });
      });
      return new Map();
    });
  }, []);

  return {
    containerRef,
    activeAnimations: Array.from(activeAnimations.keys()),
    startEdgeAnimation,
    stopEdgeAnimation,
    stopAllEdgeAnimations
  };
}