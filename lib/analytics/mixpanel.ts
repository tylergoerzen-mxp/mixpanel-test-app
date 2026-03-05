import mixpanel from 'mixpanel-browser';
import { User, Team } from '@/lib/db/schema';
const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
if (token) {
  mixpanel.init(token, {
    persistence: 'localStorage',
    opt_out_tracking_by_default: false,
    track_pageview: false
  });
}
interface TrackEventProps {
  event: string;
  properties?: Record<string, any>;
}
interface IdentifyProps {
  userId: string;
  properties?: Record<string, any>;
}
export const analytics = {
  track: ({ event, properties = {} }: TrackEventProps) => {
    if (!token) return;
    mixpanel.track(event, properties);
  },
  identify: ({ userId, properties = {} }: IdentifyProps) => {
    if (!token) return;
    mixpanel.identify(userId);
    if (Object.keys(properties).length > 0) {
      mixpanel.people.set(properties);
    }
  },
  reset: () => {
    if (!token) return;
    mixpanel.reset();
  },
  setSuperProperties: (properties: Record<string, any>) => {
    if (!token) return;
    mixpanel.register(properties);
  },
  alias: (newId: string) => {
    if (!token) return;
    mixpanel.alias(newId);
  }
};
export const trackSignUpCompleted = (teamCreated: boolean, invited: boolean) => {
  analytics.track({
    event: 'sign_up_completed',
    properties: {
      team_created: teamCreated,
      invited: invited
    }
  });
};
export const trackTeamMemberInvited = (role: string, teamSize: number) => {
  analytics.track({
    event: 'team_member_invited',
    properties: {
      member_role: role,
      team_size: teamSize
    }
  });
};
export const trackSubscriptionStarted = (planName: string, trialDays: number) => {
  analytics.track({
    event: 'subscription_started',
    properties: {
      plan_name: planName.toLowerCase(),
      trial_days: trialDays
    }
  });
};
export const trackSettingsUpdated = (section: string, fieldChanged: string) => {
  analytics.track({
    event: 'settings_updated',
    properties: {
      settings_section: section,
      field_changed: fieldChanged
    }
  });
};
export const trackPageViewed = (pageName: string, userRole: string) => {
  analytics.track({
    event: 'page_viewed',
    properties: {
      page_name: pageName,
      user_role: userRole
    }
  });
};
export const identifyUser = (user: User, team?: Team) => {
  analytics.identify({
    userId: user.id.toString(),
    properties: {
      email: user.email,
      name: user.name || undefined,
      role: user.role
    }
  });
  analytics.setSuperProperties({
    user_role: user.role,
    team_plan: team?.planName || 'free'
  });
};
export const resetUser = () => {
  analytics.reset();
};