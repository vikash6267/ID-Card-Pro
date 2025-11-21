import { memo } from 'react';
import { ResizableElement } from './resizable-element';

/**
 * Memoized wrapper for ResizableElement to prevent unnecessary re-renders
 * Only re-renders when props actually change
 */
export const OptimizedResizableElement = memo(
  ResizableElement,
  (prevProps, nextProps) => {
    // Custom comparison function
    // Return true if props are equal (skip re-render)
    // Return false if props changed (do re-render)
    
    // Check if element changed
    if (prevProps.element.id !== nextProps.element.id) return false;
    if (prevProps.element.position.x !== nextProps.element.position.x) return false;
    if (prevProps.element.position.y !== nextProps.element.position.y) return false;
    if (prevProps.element.size.width !== nextProps.element.size.width) return false;
    if (prevProps.element.size.height !== nextProps.element.size.height) return false;
    if (prevProps.element.rotation !== nextProps.element.rotation) return false;
    if (prevProps.element.content !== nextProps.element.content) return false;
    
    // Check selection state
    if (prevProps.isSelected !== nextProps.isSelected) return false;
    
    // Check zoom level
    if (prevProps.zoomLevel !== nextProps.zoomLevel) return false;
    
    // Check if it's in selectedElements
    const wasPrevSelected = prevProps.selectedElements?.some(el => el.id === prevProps.element.id);
    const isNowSelected = nextProps.selectedElements?.some(el => el.id === nextProps.element.id);
    if (wasPrevSelected !== isNowSelected) return false;
    
    // Check style changes (deep comparison for style object)
    const prevStyle = JSON.stringify(prevProps.element.style);
    const nextStyle = JSON.stringify(nextProps.element.style);
    if (prevStyle !== nextStyle) return false;
    
    // If all checks passed, props are equal - skip re-render
    return true;
  }
);

OptimizedResizableElement.displayName = 'OptimizedResizableElement';
