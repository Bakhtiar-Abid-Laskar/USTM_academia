/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * ✅ Performant: Uses Intersection Observer (native browser API)
 * ✅ Accessible: Respects prefers-reduced-motion
 * ✅ Clean: Auto-cleanup when all targets animated
 * 
 * Usage:
 *   const ref = useScrollAnimation("slide-up");
 *   <div ref={ref}>Content</div>
 * 
 * Or for lists with stagger:
 *   const containerRef = useScrollAnimation("slide-up", { stagger: true });
 *   <div ref={containerRef}>
 *     <div className="will-animate">Item 1</div>
 *     <div className="will-animate">Item 2</div>
 *   </div>
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseScrollAnimationOptions {
  /** Stagger animation for children? */
  stagger?: boolean;
  /** Root margin for when animation triggers (viewport relative) */
  rootMargin?: string;
  /** Threshold of visibility before animation triggers */
  threshold?: number | number[];
}

type AnimationType = 'fade-in' | 'slide-up' | 'slide-in-left' | 'slide-in-right' | 'scale-in';

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  animationType: AnimationType = 'slide-up',
  options: UseScrollAnimationOptions = {}
) {
  const ref = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const animatedCountRef = useRef(0);

  const {
    stagger = false,
    rootMargin = '0px 0px -50px 0px', // Trigger when 50px from bottom of viewport
    threshold = 0.1,
  } = options;

  // Check if user prefers reduced motion
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    // Get all elements to animate
    const elementsToAnimate = stagger
      ? ref.current.querySelectorAll('.will-animate')
      : [ref.current];

    if (elementsToAnimate.length === 0) return;

    // Intersection Observer callback
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const animationClass = `animate-${animationType}`;

          // Skip if already animated
          if (element.classList.contains(animationClass)) return;

          // Apply animation (respects prefers-reduced-motion in CSS)
          element.classList.add(animationClass);
          animatedCountRef.current += 1;

          // If all items animated, disconnect observer
          if (animatedCountRef.current === elementsToAnimate.length) {
            observerRef.current?.disconnect();
          }
        }
      });
    };

    // Create observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });

    // Observe all elements
    elementsToAnimate.forEach((element) => {
      observerRef.current?.observe(element);
    });

    // Cleanup
    return () => {
      observerRef.current?.disconnect();
    };
  }, [animationType, stagger, rootMargin, threshold, prefersReducedMotion]);

  return ref;
}

/**
 * Hook to add stagger delay to list items
 * Usage:
 *   const getStaggerClass = useStaggerDelay();
 *   <div className={getStaggerClass(index)}>Item</div>
 */
export function useStaggerDelay(baseDelay: number = 100) {
  return useCallback((index: number) => {
    const delayMs = baseDelay + index * baseDelay;
    if (delayMs > 600) return 'animation-delay-600';
    if (delayMs > 500) return 'animation-delay-500';
    if (delayMs > 400) return 'animation-delay-400';
    if (delayMs > 300) return 'animation-delay-300';
    if (delayMs > 200) return 'animation-delay-200';
    return 'animation-delay-100';
  }, [baseDelay]);
}
