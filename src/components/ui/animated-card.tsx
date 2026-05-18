/**
 * Animated Card Component
 * Automatically triggers scroll animation when card enters viewport
 * ✅ Respects prefers-reduced-motion
 * ✅ Zero JS overhead until visible
 */

'use client';

import React from 'react';
import { useScrollAnimation } from '@/lib/useScrollAnimation';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: 'fade-in' | 'slide-up' | 'slide-in-left' | 'slide-in-right' | 'scale-in';
  staggerIndex?: number;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for Card with scroll-triggered animation
 */
const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ animation = 'slide-up', staggerIndex, className, children, ...props }, ref) => {
    const scrollRef = useScrollAnimation(animation);

    return (
      <div
        ref={scrollRef}
        className={cn(
          'will-animate',
          staggerIndex !== undefined && `animation-delay-${Math.min(staggerIndex * 100, 600)}`,
          className
        )}
      >
        <Card ref={ref} {...props}>
          {children}
        </Card>
      </div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

export { AnimatedCard };
