/** @format */

import axios from "axios";
import { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

interface TokenPayload {
	exp: number;
	id: string;
	firstName: string;
	familyName: string;
	email: string;
	phoneNumber: string;
	role: string;
}

interface RefreshResponse {
	access_token: string;
	refresh_token: string;
}

function getExpirationTime(token: string): number | null {
	try {
		const decoded: TokenPayload = jwtDecode<TokenPayload>(token);
		return decoded.exp * 1000;
	} catch (error) {
		console.error("Failed to decode token:", error);
		return null;
	}
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
	try {
		console.log("attempting to refresh access token");

		const res = await axios.post<RefreshResponse>(
			`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
			{},
			{
				headers: {
					authorization: `Bearer ${token.refreshToken}`,
				},
			}
		);

		const response = res.data;
		console.log("access token refreshed");

		return {
			...token,
			accessToken: response.access_token,
			refreshToken: response.refresh_token,
			accessTokenExpires: getExpirationTime(response.access_token),
		};
	} catch (error) {
		console.error("Failed to refresh access token:", error);
		return {
			...token,
			error: "failed to refresh access token",
		};
	}
}

function isUserInterface(obj: any): obj is User {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"id" in obj &&
		typeof obj.id === "string" &&
		"firstName" in obj &&
		typeof obj.firstName === "string" &&
		"familyName" in obj &&
		typeof obj.familyName === "string" &&
		"email" in obj &&
		typeof obj.email === "string" &&
		// "phoneNumber" in obj &&
		// typeof obj.phoneNumber === "string" &&
		"role" in obj &&
		typeof obj.role === "string" &&
		// "image" in obj &&
		// typeof obj.image === "string" &&
		"tokens" in obj &&
		typeof obj.tokens === "object" &&
		obj.tokens !== null &&
		"access_token" in obj.tokens &&
		typeof obj.tokens.access_token === "string" &&
		"refresh_token" in obj.tokens &&
		typeof obj.tokens.refresh_token === "string"
	);
}

export const authOptions: NextAuthOptions = {
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email", placeholder: "Email" },
				password: { label: "Password", type: "password" },
				code: { label: "Code", type: "code" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;
				const { email, password, code } = credentials;

				try {
					const res = await axios.post(
						`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
						{
							email,
							password,
							code,
						},
						{
							headers: {
								"Content-Type": "application/json",
							},
						}
					);

					const response = res.data;

					if (response.user && response.tokens) {
						return {
							id: response.user.id,
							firstName: response.user.firstName,
							familyName: response.user.familyName,
							email: response.user.email,
							phoneNumber: response.user.phoneNumber,
							emailVerified: response.user.emailVerified,
							isTwoFactorEnabled: response.user.isTwoFactorEnabled,
							TwoFactorEnabled: response.user.isTwoFactorEnabled,
							role: response.user.role,
							image: response.user.image,
							tokens: {
								access_token: response.tokens.access_token,
								refresh_token: response.tokens.refresh_token,
							},
						};
					} else {
						throw new Error("Invalid response from API");
					}
				} catch (error) {
					console.log({
						"Authorization error": error.response.data.statusCode,
					});

					throw new Error(error.response.data.message);
				}
			},
		}),
	],
	pages: {
		signIn: "auth/login",
		// signOut: "auth/logout",
		error: "auth/error",
	},
	callbacks: {
		// Prevent SignIn without email verification
		async signIn({ user, account }) {
			if (account?.provider !== "credentials") return true;
			const emailVerified = user.emailVerified;
			if (!emailVerified) {
				throw new Error(
					"A verification email has been successfully sent to your inbox."
				);
				// return false;
			}

			// Add 2FA check
			if (user.isTwoFactorEnabled) {
				console.log("isTwoFactorEnabled");

				const res = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/get-twoFactor-confirmation-by-user-id`,
					{
						params: { userId: user.id },
					}
				);
				const TwoFactorConfirmation = res.data;
				if (!TwoFactorConfirmation) {
					console.log("2FA code has been successfully sent to your email.");
					//don't change the error message here :we compare it in the LoginForm
					throw new Error("2FA code has been successfully sent to your email.");
				}
				await axios.delete(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/delete-twoFactor-confirmation-by-id`,
					{
						params: { id: TwoFactorConfirmation.id },
					}
				);
			}

			return true;
		},
		// IN CASE OF WORKING WITH PROVIDERS

		// async signIn({ user, account, profile }) {

		// 	if (account?.provider === "google") {
		// 		try {
		// 			// Check if user already exists in your database
		// 			const existingUser = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.email}`);

		// 			if (!existingUser.data) {
		// 				// If the user does not exist, create a new user
		// 				const newUser = {
		// 					firstName: profile.given_name,
		// 					familyName: profile.family_name,
		// 					email: user.email,
		// 					image: user.image,
		// 					provider: "google",
		// 					role: "user", // Default role, adjust as necessary
		// 				};

		// 				await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, newUser);
		// 			}
		// 			return true;
		// 		} catch (error) {
		// 			console.error("Failed to register user:", error);
		// 			return false;
		// 		}
		// 	}
		// 	return true;
		// },

		async jwt({ token, user }) {
			// console.log({ token, user });

			if (user && isUserInterface(user)) {
				token.user = user;
				token.accessToken = user.tokens?.access_token;
				token.refreshToken = user.tokens?.refresh_token;
				token.accessTokenExpires = getExpirationTime(user.tokens!.access_token);
				console.log("logged in with credentials");
			}

			if (
				typeof token.accessTokenExpires === "number" &&
				new Date().getTime() > token.accessTokenExpires
			) {
				console.log("Token expired, refreshing...");
				const refreshedToken = await refreshAccessToken(token);
				return refreshedToken
			}

			return token;
		},
		async session({ session, token }) {
			console.log({tokenError:token.error});
			if (token.user) {
				session.user = token.user;
				session.accessToken = token.accessToken;
				session.error = token.error;
				console.log("Session of credentials");
			} else {
				session.user = {
					id: token.sub!,
					firstName: token.name!,
					email: token.email!,
					image: token.picture!,
				};
				session.accessToken = token.accessToken;
				session.error = token.error;
				console.log("Session of Providers");
			}
			// console.log({ session: session });
			return session;
		},
	},

	// linkAccount is an event that is fired when a user links an additional account (like Google, GitHub, etc.) to their existing account.

	// events: {
	// 	async linkAccount({user}){
	// 		try {
	// 			const res = await axios.patch(
	// 				`${process.env.NEXT_PUBLIC_API_URL}/user/update/${user.id}`,
	// 				{
	// 					emailVerified:new Date()
	// 				},
	// 				{
	// 					headers: {
	// 						"Content-Type": "application/json",
	// 					},
	// 				}
	// 			);

	// 		} catch (error) {
	// 			console.log({ "Authorization error": error.response.data.message });

	// 			throw new Error(error.response.data.message);
	// 		}
	// 	}
	// }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
