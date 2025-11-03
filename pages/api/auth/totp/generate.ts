import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import * as speakeasy from 'speakeasy'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req }) as any
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const userId = session.user.id

  const secret = (speakeasy as any).generateSecret({ length: 20, name: `pajo-pharma (${session.user.name})` })

  // Store temp secret in DB (or return to client to confirm)
  await prisma.user.update({ where: { id: userId }, data: { totpSecret: secret.base32 } as any })

  return res.json({ otpauth_url: secret.otpauth_url })
}
