"use client";

import { useEffect, useRef, useState } from "react";

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Formats the elapsed time since a call first reached the connected state.
 */
export function useCallDuration(isRunning: boolean): string {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
      setElapsedSeconds(0);
    }

    const timer = window.setInterval(() => {
      if (startedAtRef.current === null) {
        return;
      }

      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000)));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning]);

  return formatDuration(elapsedSeconds);
}
