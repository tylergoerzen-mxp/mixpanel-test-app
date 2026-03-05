import { trackEvent, identifyUser, setSuperProperties } from '@/lib/mixpanel';

export async function signUpAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const invitationId = formData.get('invitationId') as string | null;
    
    const user = await createUser({ email, password });
    let teamCreated = false;
    
    if (invitationId) {
      await acceptInvitation(invitationId, user.id);
    } else {
      await createTeam(user.id);
      teamCreated = true;
    }
    
    identifyUser(user.id, {
      email: user.email,
      created_at: user.createdAt
    });
    
    const userWithTeam = await getUserWithTeam(user.id);
    setSuperProperties({
      user_role: userWithTeam.role,
      team_plan: userWithTeam.team?.planName || 'Free',
      subscription_status: userWithTeam.team?.subscriptionStatus || 'inactive'
    });
    
    trackEvent({
      event: 'sign_up_completed',
      properties: {
        has_invitation: !!invitationId,
        team_created: teamCreated
      }
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const user = await authenticateUser(email, password);
  if (!user) throw new Error('Invalid credentials');
  
  identifyUser(user.id, {
    email: user.email,
    last_login: new Date().toISOString()
  });
  
  const userWithTeam = await getUserWithTeam(user.id);
  setSuperProperties({
    user_role: userWithTeam.role,
    team_plan: userWithTeam.team?.planName || 'Free',
    subscription_status: userWithTeam.team?.subscriptionStatus || 'inactive'
  });
  
  return user;
}

export async function logoutAction() {
  await signOut();
  resetUser();
}