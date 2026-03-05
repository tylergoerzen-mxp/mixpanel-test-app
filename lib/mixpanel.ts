import mixpanel from 'mixpanel-browser';

if (typeof window !== 'undefined') {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '');
}

interface TrackEventProps {
  event: string;
  properties?: Record<string, any>;
}

export const trackEvent = ({ event, properties = {} }: TrackEventProps) => {
  if (typeof window === 'undefined') return;
  mixpanel.track(event, properties);
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  mixpanel.identify(userId);
  if (properties) {
    mixpanel.people.set(properties);
  }
};

export const resetUser = () => {
  if (typeof window === 'undefined') return;
  mixpanel.reset();
};

export const setSuperProperties = (properties: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  mixpanel.register(properties);
};

export { mixpanel };