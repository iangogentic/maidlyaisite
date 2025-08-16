import { siteConfig } from "./site";

// Analytics wrapper for easy provider switching
export class Analytics {
  private static instance: Analytics;
  private enabled: boolean;
  private provider: string;

  private constructor() {
    this.enabled = siteConfig.analytics.enabled;
    this.provider = siteConfig.analytics.provider;
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  public track(event: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    try {
      switch (this.provider) {
        case "posthog":
          this.trackPostHog(event, properties);
          break;
        case "umami":
          this.trackUmami(event, properties);
          break;
        default:
          console.log("Analytics event:", event, properties);
      }
    } catch (error) {
      console.error("Analytics tracking error:", error);
    }
  }

  public page(path: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    try {
      switch (this.provider) {
        case "posthog":
          this.pagePostHog(path, properties);
          break;
        case "umami":
          this.pageUmami(path, properties);
          break;
        default:
          console.log("Analytics page view:", path, properties);
      }
    } catch (error) {
      console.error("Analytics page tracking error:", error);
    }
  }

  public identify(userId: string, traits?: Record<string, any>) {
    if (!this.enabled) return;

    try {
      switch (this.provider) {
        case "posthog":
          this.identifyPostHog(userId, traits);
          break;
        case "umami":
          this.identifyUmami(userId, traits);
          break;
        default:
          console.log("Analytics identify:", userId, traits);
      }
    } catch (error) {
      console.error("Analytics identify error:", error);
    }
  }

  private trackPostHog(event: string, properties?: Record<string, any>) {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture(event, properties);
    }
  }

  private pagePostHog(path: string, properties?: Record<string, any>) {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("$pageview", { $current_url: path, ...properties });
    }
  }

  private identifyPostHog(userId: string, traits?: Record<string, any>) {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.identify(userId, traits);
    }
  }

  private trackUmami(event: string, properties?: Record<string, any>) {
    if (typeof window !== "undefined" && (window as any).umami) {
      (window as any).umami.track(event, properties);
    }
  }

  private pageUmami(path: string, properties?: Record<string, any>) {
    if (typeof window !== "undefined" && (window as any).umami) {
      (window as any).umami.track("pageview", { path, ...properties });
    }
  }

  private identifyUmami(userId: string, traits?: Record<string, any>) {
    // Umami doesn't have built-in identify, so we'll track it as an event
    if (typeof window !== "undefined" && (window as any).umami) {
      (window as any).umami.track("identify", { userId, ...traits });
    }
  }
}

// Convenience functions
export const analytics = Analytics.getInstance();

export function trackEvent(event: string, properties?: Record<string, any>) {
  analytics.track(event, properties);
}

export function trackPage(path: string, properties?: Record<string, any>) {
  analytics.page(path, properties);
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  analytics.identify(userId, traits);
}
