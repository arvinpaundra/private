import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { User } from './types';

const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || 'your-super-secret-key-that-is-at-least-32-bytes-long');
const key = 'session';

export async function createSession(user: User) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({ user, expires })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);

  cookies().set(key, session, {
    expires,
    httpOnly: true,
    path: '/',
  });
}

export async function getSession(): Promise<User | null> {
  const sessionCookie = cookies().get(key)?.value;
  if (!sessionCookie) return null;

  try {
    const { payload } = await jwtVerify(sessionCookie, secretKey, {
        algorithms: ['HS256'],
    });

    if (payload.expires && Date.now() > new Date(payload.expires as string).getTime()) {
        return null;
    }
    
    return payload.user as User;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

export async function deleteSession() {
  cookies().delete(key);
}
