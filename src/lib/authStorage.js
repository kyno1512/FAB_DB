import { USER_KEY } from '../constants/storageKey'

export const AUTH_CHANGE_EVENT = 'flygo-auth-change'

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  notifyAuthChange()
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY)
  notifyAuthChange()
}

export function patchUser(partial) {
  const user = getUser()
  if (!user) return
  saveUser({ ...user, ...partial })
}
