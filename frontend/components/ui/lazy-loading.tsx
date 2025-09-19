"use client";

import { lazy, Suspense, ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Generic lazy loading wrapper
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <ComponentFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Default fallback component
function ComponentFallback() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

// Intersection Observer hook for lazy loading elements
import { useEffect, useRef, useState } from "react";

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { ref, isIntersecting, hasIntersected };
}

// Lazy loading container
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  once?: boolean;
  className?: string;
}

export function LazyLoad({ 
  children, 
  fallback, 
  once = true, 
  className 
}: LazyLoadProps) {
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver();
  
  const shouldRender = once ? hasIntersected : isIntersecting;

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : (fallback || <ComponentFallback />)}
    </div>
  );
}

// Progressive image loading
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  placeholder, 
  className, 
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, hasIntersected } = useIntersectionObserver();

  return (
    <div ref={ref} className={className}>
      {hasIntersected && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
      {!isLoaded && !hasError && hasIntersected && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      {!hasIntersected && (
        <Skeleton className={className} />
      )}
    </div>
  );
}