import { useRef, useCallback } from "react";

// Utility to calculate the outer bounding box of selected elements
export function getGroupBoundingBox(elements) {
  if (!Array.isArray(elements) || elements.length === 0) return null;

  // Validate elements structure
  if (!elements.every(el => el?.position && el?.size)) {
    console.error("Invalid elements structure: missing position or size");
    return null;
  }

  const xs = elements.map((el) => el.position.x);
  const ys = elements.map((el) => el.position.y);
  const xEnds = elements.map((el) => el.position.x + el.size.width);
  const yEnds = elements.map((el) => el.position.y + el.size.height);

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xEnds) - Math.min(...xs),
    height: Math.max(...yEnds) - Math.min(...ys),
  };
}

// Add a rotation function in useGroupResize to rotate all selected elements
export function useGroupResize(containerRef, onUpdate, options = {}) {
  const {
    snapToGrid = 10,          // Pixels to snap to (default 10)
    lockAspectRatio = 'shiftKey', // 'shiftKey', 'always', or 'never'
  } = options;

  const initialPositionsRef = useRef({});
  const initialSizesRef = useRef({});
  const initialStylesRef = useRef({});
  const initialBoxRef = useRef(null);

  const startGroupResize = useCallback((elements) => {
    if (!Array.isArray(elements) || elements.length === 0) return;

    initialPositionsRef.current = {};
    initialSizesRef.current = {};
    initialStylesRef.current = {};

    elements.forEach((el) => {
      initialPositionsRef.current[el.id] = { ...el.position };
      initialSizesRef.current[el.id] = { ...el.size };
      initialStylesRef.current[el.id] = { ...el.style };
    });

    initialBoxRef.current = getGroupBoundingBox(elements);
  }, []);

  const resizeGroup = useCallback((e, selectedElements) => {
    const groupBox = initialBoxRef.current;
    if (!groupBox || !Array.isArray(selectedElements)) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const cursorX = e.clientX - containerRect.left;
    const cursorY = e.clientY - containerRect.top;

    let scaleX = Math.max(0.1, (cursorX - groupBox.x) / groupBox.width);
    let scaleY = Math.max(0.1, (cursorY - groupBox.y) / groupBox.height);

    const shouldLockAspectRatio = 
      lockAspectRatio === 'always' || 
      (lockAspectRatio === 'shiftKey' && e.shiftKey);
    
    if (shouldLockAspectRatio) {
      const scale = Math.min(scaleX, scaleY);
      scaleX = scaleY = scale;
    }

    const snap = (value) => snapToGrid > 0 ? Math.round(value / snapToGrid) * snapToGrid : value;

    const updatedElements = selectedElements.map((el) => {
      const initPos = initialPositionsRef.current[el.id];
      const initSize = initialSizesRef.current[el.id];
      const originalStyle = initialStylesRef.current[el.id] || {};

      if (!initPos || !initSize) return el;

      const newWidth = snap(Math.max(20, initSize.width * scaleX));
      const newHeight = snap(Math.max(20, initSize.height * scaleY));

      const offsetX = (initPos.x - groupBox.x) * (scaleX - 1);
      const offsetY = (initPos.y - groupBox.y) * (scaleY - 1);

      const scaledStyle = { ...originalStyle };
      if (typeof originalStyle.fontSize === 'number') {
        scaledStyle.fontSize = originalStyle.fontSize * scaleX;
      }
      if (typeof originalStyle.lineHeight === 'number') {
        scaledStyle.lineHeight = originalStyle.lineHeight * scaleY;
      }

      return {
        ...el,
        position: {
          x: initPos.x + offsetX,
          y: initPos.y + offsetY,
        },
        size: {
          width: newWidth,
          height: newHeight,
        },
        style: scaledStyle,
      };
    });

    onUpdate(updatedElements);
  }, [containerRef, onUpdate, snapToGrid, lockAspectRatio]);

  // Function to apply rotation to selected elements
  const applyGroupRotation = useCallback((rotationAngle, selectedElements) => {
    const groupBox = initialBoxRef.current;
    if (!groupBox || !Array.isArray(selectedElements)) return;

    const updatedElements = selectedElements.map((el) => {
      const initPos = initialPositionsRef.current[el.id];
      if (!initPos) return el;

      // Rotate each element around the group's center
      const angleRad = (rotationAngle * Math.PI) / 180;
      const centerX = groupBox.x + groupBox.width / 2;
      const centerY = groupBox.y + groupBox.height / 2;

      const xOffset = initPos.x - centerX;
      const yOffset = initPos.y - centerY;

      const newX = centerX + (xOffset * Math.cos(angleRad) - yOffset * Math.sin(angleRad));
      const newY = centerY + (xOffset * Math.sin(angleRad) + yOffset * Math.cos(angleRad));

      return {
        ...el,
        position: {
          ...el.position,
          x: newX,
          y: newY,
        },
        rotation: rotationAngle, // Update rotation for each element
      };
    });

    onUpdate(updatedElements); // Update the state with new rotation
  }, [onUpdate]);

  const cleanup = useCallback(() => {
    initialPositionsRef.current = {};
    initialSizesRef.current = {};
    initialStylesRef.current = {};
    initialBoxRef.current = null;
  }, []);

  return {
    startGroupResize,
    resizeGroup,
    applyGroupRotation,  // Return the rotation function
    cleanup,
  };
}
