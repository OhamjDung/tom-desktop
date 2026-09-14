"use client";
import { useEffect } from 'react';

// When embedded in the 3D room, the parent needs pointer/key events to drive the camera.
export function ParentBridge() {
  useEffect(() => {
    if (window.parent === window) return;
    const onMouse = (e: MouseEvent) => window.parent.postMessage({ type: e.type, clientX: e.clientX, clientY: e.clientY }, '*');
    const onKey = (e: KeyboardEvent) => window.parent.postMessage({ type: e.type, key: e.key }, '*');
    const mouse = ['mousemove', 'mousedown', 'mouseup'] as const;
    const keys = ['keydown', 'keyup'] as const;
    mouse.forEach(t => window.addEventListener(t, onMouse));
    keys.forEach(t => window.addEventListener(t, onKey));
    return () => { mouse.forEach(t => window.removeEventListener(t, onMouse)); keys.forEach(t => window.removeEventListener(t, onKey)); };
  }, []);
  return null;
}
