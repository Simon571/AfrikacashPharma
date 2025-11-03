import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import * as speakeasy from 'speakeasy'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req }) as any
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method !== 'POST') return res.status(405).end()
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Missing token' })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || !(user as any).totpSecret) return res.status(400).json({ error: 'TOTP not configured' })

  const verified = (speakeasy as any).totp.verify({ secret: (user as any).totpSecret, encoding: 'base32', token })
  if (!verified) return res.status(400).json({ error: 'Invalid token' })

  // Enable TOTP
  await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } as any })

  return res.json({ ok: true })
}
