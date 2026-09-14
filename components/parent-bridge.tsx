"use client";
import { useEffect } from 'react';

// When embedded in the 3D room, the parent needs pointer/key events to drive the camera and click sounds.
export function ParentBridge() {
  useEffect(() => {
    if (window.parent === window) return;
    const post = (type: string, e: MouseEvent) => window.parent.postMessage({ type, clientX: e.clientX, clientY: e.clientY }, '*');
    const onMove = (e: PointerEvent) => { if (e.pointerType === 'mouse') post('mousemove', e); };
    // Pointer events still fire when drag handlers preventDefault the compat mouse events.
    const onDown = (e: PointerEvent) => { if (e.pointerType === 'mouse') post('mousedown', e); };
    const onUp = (e: PointerEvent) => { if (e.pointerType === 'mouse') post('mouseup', e); };
    const onKey = (e: KeyboardEvent) => window.parent.postMessage({ type: e.type, key: e.key }, '*');
    const opts = { capture: true };
    window.addEventListener('pointermove', onMove, opts);
    window.addEventListener('pointerdown', onDown, opts);
    window.addEventListener('pointerup', onUp, opts);
    window.addEventListener('pointercancel', onUp, opts);
    window.addEventListener('keydown', onKey, opts);
    window.addEventListener('keyup', onKey, opts);
    return () => {
      window.removeEventListener('pointermove', onMove, opts);
      window.removeEventListener('pointerdown', onDown, opts);
      window.removeEventListener('pointerup', onUp, opts);
      window.removeEventListener('pointercancel', onUp, opts);
      window.removeEventListener('keydown', onKey, opts);
      window.removeEventListener('keyup', onKey, opts);
    };
  }, []);
  return null;
}
