import { prisma } from '@/lib/prisma'

export interface UserInfo {
  fullName: string
  phoneNumber: string
  emailAddress?: string
}

export interface User {
  id: string
  name: string
  phone: string
  email: string | null
}

/**
 * Create or find a user by phone number
 */
export async function getOrCreateUser(userInfo: UserInfo): Promise<User> {
  let user

  try {
    user = await prisma.user.upsert({
      where: { phone: userInfo.phoneNumber },
      update: {
        name: userInfo.fullName
      },
      create: {
        name: userInfo.fullName,
        phone: userInfo.phoneNumber,
        email: null
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)

    // Try to find user by phone number only
    user = await prisma.user.findUnique({
      where: { phone: userInfo.phoneNumber }
    })

    // If still not found, create without email
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userInfo.fullName,
          phone: userInfo.phoneNumber,
          email: null
        }
      })
    }
  }

  if (!user) {
    throw new Error('Failed to create or find user')
  }

  return user
}
