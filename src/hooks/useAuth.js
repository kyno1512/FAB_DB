import { getUser, clearUser } from '../lib/authStorage'

export function useAuth() {
  const user = getUser()

  return {
    user,
    isLoggedIn: !!user,
    logout: () => clearUser(),
  }
}
