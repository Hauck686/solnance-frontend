import bcrypt from 'bcryptjs'

// Hash userId before storing in localStorage
export const hashUserId = async data => {
  const saltRounds = 10
  const hash = await bcrypt.hash(data, saltRounds)
  return { original: data, hash }
}

// Verify hashed userId
export const verifyData = async (data, hash) => {
  return await bcrypt.compare(data, hash)
}
