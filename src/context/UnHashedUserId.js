import { hashUserId, verifyData } from './HashUserId'

// Save both: hash (persistent) and userId (session-only)
export const saveUserIdHash = async userId => {
  // Only hash once when storing
  const { hash } = await hashUserId(userId)
  localStorage.setItem('userIdHash', hash) // persistent
  sessionStorage.setItem('userId', userId) // cleared on logout/browser close
}

// Verify and return userId if valid
export const getVerifiedUserId = async () => {
  if (typeof window === 'undefined') return null

  const userId = sessionStorage.getItem('userId')
  const userIdHash = localStorage.getItem('userIdHash')

  if (!userId || !userIdHash) return null

  // Compare the same original userId with stored hash
  const isValid = await verifyData(userId, userIdHash)
  return isValid ? userId : null
}
