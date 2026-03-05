import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const inviteToken = formData.get('inviteToken') as string

  const user = await createUser({ email, password })
  const hasInvitation = !!inviteToken

  if (hasInvitation) {
    await acceptInvitation(user.id, inviteToken)
  } else {
    await createTeam(user.id)
  }

  await login(user)
  redirect('/dashboard')
}

export async function login(user: any) {
  const sessionToken = generateSessionToken()
  cookies().set('session', sessionToken)
}

export async function logout() {
  cookies().delete('session')
  redirect('/login')
}

export async function inviteTeamMember(formData: FormData) {
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const teamId = formData.get('teamId') as string

  await sendInvitation({ email, role, teamId })
}

export async function updateAccount(formData: FormData) {
  const userId = formData.get('userId') as string
  const updates = Object.fromEntries(formData.entries())

  await updateUserAccount(userId, updates)
}

export async function updatePassword(formData: FormData) {
  const userId = formData.get('userId') as string
  const password = formData.get('password') as string

  await updateUserPassword(userId, password)
}
