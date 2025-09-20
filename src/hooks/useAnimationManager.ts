"use client";
import { useCallback, useRef, useState } from 'react';
import gsap from 'gsap';
import { AnimationConfig, ActiveAnimation, AnimationObject } from '@/lib/animationTypes';

export function useAnimationManager() {
  const [activeAnimations, setActiveAnimations] = useState<Map<string, ActiveAnimation>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Create animation element
  const createAnimationElement = useCallback((object: AnimationObject): HTMLDivElement => {
    const element = document.createElement('div');
    element.className = `absolute pointer-events-none transition-opacity`;
    element.style.width = `${object.size}px`;
    element.style.height = `${object.size}px`;
    element.style.backgroundColor = object.color;
    element.style.opacity = String(object.opacity || 1);
    element.style.zIndex = '1000';
    element.style.position = 'absolute';

    // Apply shape
    switch (object.shape) {
      case 'circle':
        element.style.borderRadius = '50%';
        break;
      case 'square':
        element.style.borderRadius = '0';
        break;
      case 'diamond':
        element.style.borderRadius = '0';
        element.style.transform = 'rotate(45deg)';
        break;
      case 'triangle':
        element.style.width = '0';
        element.style.height = '0';
        element.style.backgroundColor = 'transparent';
        element.style.borderLeft = `${object.size/2}px solid transparent`;
        element.style.borderRight = `${object.size/2}px solid transparent`;
        element.style.borderBottom = `${object.size}px solid ${object.color}`;
        break;
    }

    // Add trail effect if enabled
    if (object.trail) {
      element.style.boxShadow = `0 0 ${object.size}px ${object.color}`;
    }

    // Add custom icon if provided
    if (object.customIcon) {
      element.innerHTML = object.customIcon;
      element.style.backgroundColor = 'transparent';
      element.style.display = 'flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
    }

    return element;
  }, []);

  // Transform coordinates based on ReactFlow viewport
  const transformCoordinates = useCallback((x: number, y: number) => {
    if (!containerRef.current) {
      console.log('No container ref, using raw coordinates:', { x, y });
      return { x, y };
    }

    const reactFlowViewport = containerRef.current.querySelector('.react-flow__viewport');
    if (!reactFlowViewport) {
      console.log('No viewport found, using raw coordinates:', { x, y });
      return { x, y };
    }

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

    const transformed = {
      x: x * scale + translateX,
      y: y * scale + translateY
    };

    console.log('Coordinate transformation:', {
      input: { x, y },
      scale,
      translate: { translateX, translateY },
      output: transformed
    });

    return transformed;
  }, []);

  // Create path for animation
  const createAnimationPath = useCallback((config: AnimationConfig) => {
    const { path } = config;
    const transformedPoints = path.points.map(point => transformCoordinates(point.x, point.y));

    const pathData: Record<string, number[] | { path: string; autoRotate: boolean } | number> = {};

    if (path.type === 'linear') {
      pathData.x = transformedPoints.map(p => p.x);
      pathData.y = transformedPoints.map(p => p.y);
    } else if (path.type === 'bezier' && path.controlPoints) {
      // Create smooth bezier curve
      const controlPoints = path.controlPoints.map(point => transformCoordinates(point.x, point.y));
      pathData.motionPath = {
        path: `M${transformedPoints[0].x},${transformedPoints[0].y} C${controlPoints.map(cp => `${cp.x},${cp.y}`).join(' ')} ${transformedPoints[transformedPoints.length - 1].x},${transformedPoints[transformedPoints.length - 1].y}`,
        autoRotate: false
      };
    } else if (path.type === 'curved') {
      // Create smooth curve through all points
      pathData.x = transformedPoints.map(p => p.x);
      pathData.y = transformedPoints.map(p => p.y);
      pathData.curviness = 2;
    }

    return pathData;
  }, [transformCoordinates]);

  // Start animation
  const startAnimation = useCallback((config: AnimationConfig) => {
    console.log('🎬 Starting animation:', config);

    if (!containerRef.current) {
      console.error('❌ No container ref available');
      return;
    }

    console.log('📦 Container element:', containerRef.current);
    console.log('📏 Container bounds:', containerRef.current.getBoundingClientRect());

    // Stop existing animation with same ID inline
    setActiveAnimations(prev => {
      const existingAnimation = prev.get(config.id);
      if (existingAnimation) {
        existingAnimation.timeline.kill();
        existingAnimation.elementRef.remove();
        existingAnimation.isActive = false;
      }
      return prev;
    });

    const element = createAnimationElement(config.object);
    console.log('✨ Created element:', element);
    console.log('🎨 Element styles:', {
      width: element.style.width,
      height: element.style.height,
      backgroundColor: element.style.backgroundColor,
      position: element.style.position,
      zIndex: element.style.zIndex
    });

    // Test positioning with fixed coordinates first
    element.style.left = '50px';
    element.style.top = '50px';
    element.style.backgroundColor = '#ff0000';
    element.style.border = '2px solid yellow';
    console.log('🔧 Applied test styles to element');

    containerRef.current.appendChild(element);
    console.log('📍 Appended element to container');
    console.log('👥 Container children count:', containerRef.current.children.length);

    // Check if element is actually in DOM
    const elementInDOM = document.contains(element);
    console.log('🌐 Element in DOM:', elementInDOM);

    const timeline = gsap.timeline({
      repeat: config.repeat === 'infinite' ? -1 : config.repeat,
      yoyo: config.yoyo,
      delay: config.delay,
      onComplete: () => {
        console.log('✅ Animation completed');
        config.onComplete?.();
        if (config.repeat !== 'infinite') {
          // Stop animation inline
          setActiveAnimations(prev => {
            const animation = prev.get(config.id);
            if (animation) {
              animation.timeline.kill();
              animation.elementRef.remove();
              animation.isActive = false;

              const newMap = new Map(prev);
              newMap.delete(config.id);
              return newMap;
            }
            return prev;
          });
        }
      },
      onRepeat: () => {
        config.onRepeat?.();
        setActiveAnimations(prev => {
          const animation = prev.get(config.id);
          if (animation) {
            animation.currentRepeat++;
          }
          return new Map(prev);
        });
      }
    });

    // Simple test animation - just move right
    console.log('🚀 Starting simple test animation');
    gsap.set(element, { x: 50, y: 50, opacity: 1 });
    timeline.to(element, {
      x: 200,
      y: 50,
      duration: config.duration,
      ease: config.ease,
      onUpdate: () => {
        console.log('📍 Animation frame - element position:', {
          x: element.style.transform,
          visible: element.offsetWidth > 0 && element.offsetHeight > 0
        });
      }
    });

    const activeAnimation: ActiveAnimation = {
      id: config.id,
      config,
      timeline,
      elementRef: element,
      currentRepeat: 0,
      isActive: true
    };

    setActiveAnimations(prev => new Map(prev).set(config.id, activeAnimation));
    console.log('✅ Animation started successfully');
  }, [createAnimationElement, createAnimationPath, transformCoordinates]);

  // Stop animation
  const stopAnimation = useCallback((animationId: string) => {
    setActiveAnimations(prev => {
      const animation = prev.get(animationId);
      if (animation) {
        animation.timeline.kill();
        animation.elementRef.remove();
        animation.isActive = false;

        const newMap = new Map(prev);
        newMap.delete(animationId);
        return newMap;
      }
      return prev;
    });
  }, []);

  // Stop all animations
  const stopAllAnimations = useCallback(() => {
    setActiveAnimations(prev => {
      prev.forEach((animation) => {
        animation.timeline.kill();
        animation.elementRef.remove();
      });
      return new Map();
    });
  }, []);

  // Pause/resume animation
  const pauseAnimation = useCallback((animationId: string) => {
    setActiveAnimations(prev => {
      const animation = prev.get(animationId);
      if (animation) {
        animation.timeline.pause();
      }
      return prev;
    });
  }, []);

  const resumeAnimation = useCallback((animationId: string) => {
    setActiveAnimations(prev => {
      const animation = prev.get(animationId);
      if (animation) {
        animation.timeline.resume();
      }
      return prev;
    });
  }, []);

  return {
    containerRef,
    activeAnimations: Array.from(activeAnimations.values()),
    startAnimation,
    stopAnimation,
    stopAllAnimations,
    pauseAnimation,
    resumeAnimation
  };
}