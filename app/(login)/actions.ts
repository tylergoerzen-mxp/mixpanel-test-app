import { mixpanel } from '@/lib/mixpanel'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const inviteToken = formData.get('inviteToken') as string
  
  const user = await createUser({ email, password })
  const hasInvitation = !!inviteToken
  let teamCreated = false
  
  if (hasInvitation) {
    await acceptInvitation(user.id, inviteToken)
  } else {
    await createTeam(user.id)
    teamCreated = true
  }
  
  mixpanel.track('sign_up_completed', {
    has_invitation: hasInvitation,
    team_created: teamCreated
  })
  
  await login(user)
  redirect('/dashboard')
}

export async function login(user: any) {
  const sessionToken = generateSessionToken()
  cookies().set('session', sessionToken)
  
  const team = await getUserTeam(user.id)
  mixpanel.identify(user.id)
  mixpanel.people.set({
    $email: user.email,
    user_role: user.role,
    team_plan: team?.planName || 'Free',
    subscription_status: team?.subscriptionStatus
  })
}

export async function logout() {
  cookies().delete('session')
  mixpanel.reset()
  redirect('/login')
}

export async function inviteTeamMember(formData: FormData) {
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const teamId = formData.get('teamId') as string
  
  await sendInvitation({ email, role, teamId })
  const teamSize = await getTeamMemberCount(teamId)
  
  mixpanel.track('team_member_invited', {
    member_role: role,
    team_size: teamSize
  })
}

export async function updateAccount(formData: FormData) {
  const userId = formData.get('userId') as string
  const updates = Object.fromEntries(formData.entries())
  
  await updateUserAccount(userId, updates)
  const user = await getUser(userId)
  
  mixpanel.track('settings_updated', {
    setting_type: 'account',
    user_role: user.role
  })
}

export async function updatePassword(formData: FormData) {
  const userId = formData.get('userId') as string
  const password = formData.get('password') as string
  
  await updateUserPassword(userId, password)
  const user = await getUser(userId)
  
  mixpanel.track('settings_updated', {
    setting_type: 'password',
    user_role: user.role
  })
}