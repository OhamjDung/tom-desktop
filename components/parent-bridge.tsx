"use client";
import { useEffect } from 'react';

// When embedded in the 3D room, the parent needs pointer/key events to drive the camera.
export function ParentBridge() {
  useEffect(() => {
    if (window.parent === window) return;
    const onMouse = (e: MouseEvent) => window.parent.postMessage({ type: e.type, clientX: e.clientX, clientY: e.clientY }, '*');
    const onKey = (e: KeyboardEvent) => window.parent.postMessage({ type: e.type, key: e.key }, '*');
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => { window.removeEventListener('mousemove', onMouse); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); };
  }, []);
  return null;
}
