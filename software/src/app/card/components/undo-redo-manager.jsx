// undo-redo-manager.jsx
import { useEffect, useRef, useCallback } from "react";

export function useUndoRedo(initialState, onChange) {
  const historyRef = useRef([initialState]);
  const pointerRef = useRef(0);

  // Push a new state into history
  const recordChange = useCallback((newState) => {
    // Trim future states if not at end
    if (pointerRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, pointerRef.current + 1);
    }
    historyRef.current.push(newState);
    pointerRef.current++;
  }, []);

  const undo = useCallback(() => {
    if (pointerRef.current > 0) {
      pointerRef.current--;
      const prevState = historyRef.current[pointerRef.current];
      onChange(prevState);
    }
  }, [onChange]);

  const redo = useCallback(() => {
    if (pointerRef.current < historyRef.current.length - 1) {
      pointerRef.current++;
      const nextState = historyRef.current[pointerRef.current];
      onChange(nextState);
    }
  }, [onChange]);

  const listenToKeyboard = useCallback((e) => {
    const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    if (ctrlKey && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if ((ctrlKey && e.key === "y") || (ctrlKey && e.key === "z" && e.shiftKey)) {
      e.preventDefault();
      redo();
    }
  }, [undo, redo]);

  useEffect(() => {
    window.addEventListener("keydown", listenToKeyboard);
    return () => window.removeEventListener("keydown", listenToKeyboard);
  }, [listenToKeyboard]);

  return {
    recordChange,
    undo,
    redo,
    canUndo: pointerRef.current > 0,
    canRedo: pointerRef.current < historyRef.current.length - 1,
  };
}
