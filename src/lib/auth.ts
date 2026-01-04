import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

const key = 'auth_token';

interface DecodedToken {
  identifier: string;
  exp: number;
  iat: number;
  nbf: number;
  [key: string]: any;
}

export async function createSession(token: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  (await cookies()).set(key, token, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession(): Promise<{ user_id: string } | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    // Decode JWT token from backend
    const decoded = jwtDecode<DecodedToken>(token);

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      await deleteSession();
      return null;
    }

    // Map decoded token to User object
    return {
      user_id: decoded.user_id,
    };
  } catch (error) {
    await deleteSession();
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(key);
}

export async function getToken(): Promise<string | null> {
  const token = (await cookies()).get(key)?.value;
  return token || null;
}
