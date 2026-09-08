"use client";

import { useRef } from 'react';
import type { PointerEventHandler } from 'react';

type SwipeHandlers = {
  onPointerDown: PointerEventHandler<HTMLButtonElement>;
  onPointerUp: PointerEventHandler<HTMLButtonElement>;
  onPointerCancel: PointerEventHandler<HTMLButtonElement>;
  consumeSwipe: () => boolean;
};

export function useFlashcardSwipe(onPrevious: () => void, onNext: () => void): SwipeHandlers {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const didSwipeRef = useRef(false);

  const onPointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    if (event.pointerType === 'mouse') return;
    startRef.current = { x: event.clientX, y: event.clientY };
    didSwipeRef.current = false;
  };

  const onPointerUp: PointerEventHandler<HTMLButtonElement> = (event) => {
    const start = startRef.current;
    startRef.current = null;
    if (!start || event.pointerType === 'mouse') return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
    didSwipeRef.current = true;
    if (deltaX < 0) onNext();
    else onPrevious();
  };

  const onPointerCancel: PointerEventHandler<HTMLButtonElement> = () => {
    startRef.current = null;
    didSwipeRef.current = false;
  };

  const consumeSwipe = () => {
    const didSwipe = didSwipeRef.current;
    didSwipeRef.current = false;
    return didSwipe;
  };

  return { onPointerDown, onPointerUp, onPointerCancel, consumeSwipe };
}
