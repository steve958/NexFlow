export interface AnimationObject {
  id: string;
  type: 'packet' | 'pulse' | 'glow' | 'custom';
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'diamond' | 'triangle';
  opacity?: number;
  trail?: boolean;
  customIcon?: string;
}

export interface AnimationPath {
  id: string;
  points: Array<{ x: number; y: number }>;
  type: 'linear' | 'curved' | 'bezier';
  controlPoints?: Array<{ x: number; y: number }>; // for bezier curves
}

export interface AnimationConfig {
  id: string;
  object: AnimationObject;
  path: AnimationPath;
  duration: number;
  ease: string;
  delay: number;
  repeat: number | 'infinite';
  yoyo: boolean; // reverse direction on repeat
  stagger?: number; // delay between multiple objects
  onComplete?: () => void;
  onRepeat?: () => void;
}

export interface ActiveAnimation {
  id: string;
  config: AnimationConfig;
  timeline: gsap.core.Timeline;
  elementRef: HTMLDivElement;
  currentRepeat: number;
  isActive: boolean;
}

export interface AnimationPreset {
  name: string;
  description: string;
  config: Partial<AnimationConfig>;
}