export function useAuth() {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  async function signOut() {
    await client.auth.signOut()
    await navigateTo('/login')
  }

  return { user, signOut }
}
