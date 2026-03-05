import mixpanel from "mixpanel-browser";

const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
let initialized = false;

export function initMixpanel() {
  if (initialized || !token) return;
  mixpanel.init(token, {
    debug: process.env.NODE_ENV !== "production",
    track_pageview: true,
    persistence: "localStorage",
  });
  initialized = true;
}

export function track(eventName: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  mixpanel.track(eventName, properties);
}

export function identify(userId: string) {
  if (!initialized) return;
  mixpanel.identify(userId);
}

export function peopleSet(properties: Record<string, unknown>) {
  if (!initialized) return;
  mixpanel.people.set(properties);
}

export function registerSuperProperties(properties: Record<string, unknown>) {
  if (!initialized) return;
  mixpanel.register(properties);
}

export function reset() {
  if (!initialized) return;
  mixpanel.reset();
}
