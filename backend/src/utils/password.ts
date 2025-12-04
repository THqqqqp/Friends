import bcrypt from 'bcryptjs'

export async function verifyPassword(raw: string, hash: string) {
  return bcrypt.compare(raw, hash)
}
