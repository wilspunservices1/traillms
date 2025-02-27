// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      uid: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
  }

  interface JWT {
    id: string;
    role: string;
  }
}
