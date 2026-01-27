import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      businessId?: string | null;
    } & DefaultSession['user'];
    accessToken?: string;
  }

  interface User {
    businessId?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    businessId?: string | null;
    accessToken?: string;
  }
}
