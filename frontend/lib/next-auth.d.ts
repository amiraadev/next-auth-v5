// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    firstName: string;
    familyName?: string;
    email: string;
    emailVerified?: string;
    isTwoFactorEnabled?: boolean;
    image?: string;
    phoneNumber?: string;
    role?: string;
    tokens?: {
      access_token: string;
      refresh_token: string;
    };
  }

  interface Session {
    user: User;
    accessToken?: string;
    error?: string;
  }
  
}

declare module "next-auth/jwt" {
	interface JWT {
		user: User;
		accessToken?: string;
		refreshToken?: string;
		accessTokenExpires: number | null;
		error?: string;
	}
}



