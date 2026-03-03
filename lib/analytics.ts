type AnalyticsProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: AnalyticsProps }) => void;
  }
}

export function trackEvent(eventName: string, props?: AnalyticsProps): void {
  if (typeof window === "undefined") {
    return;
  }

  window.plausible?.(eventName, props ? { props } : undefined);
}
