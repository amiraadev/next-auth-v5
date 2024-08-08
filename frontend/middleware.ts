/** @format */

// /** @format */

import NextAuth from "next-auth/next";
import { authOptions } from "./app/api/auth/[...nextauth]/route";

// export { default } from "next-auth/middleware";

// // export const config = { matcher: ["/dashboard/:path*"] };
// export const config = { matcher: ["/test/:path*"] };

// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// export async function middleware(req) {
// 	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

// 	if (!token) {
// 		// Redirect to login if the user is not authenticated
// 		// Construct the absolute URL for the redirect
// 		const loginUrl = new URL("/auth/login", req.nextUrl.origin).toString();
// 		return NextResponse.redirect(loginUrl);
// 	}

// 	// Proceed with the request if the user is authenticated
// 	return NextResponse.next();
// }


/************************************************************************************************* */

import {
	apiAuthPrefix,
	authRoutes,
	DEFAULT_LOGIN_REDIRECT,
	publicRoutes,
} from "@/routes";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
	const { nextUrl } = req;
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	const isLoggedIn = !!token;

	const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
	const isAuthRoute = authRoutes.includes(nextUrl.pathname);

	if (isApiAuthRoute) {
		return null;
	}

	if (isAuthRoute) {
		if (isLoggedIn) {

			return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
		}
		return null;
	}

	if (!isPublicRoute && !isLoggedIn) {
		const loginUrl = new URL("/auth/login", req.url);

		return NextResponse.redirect(loginUrl);
	}

	return null
	// return NextResponse.next();
}

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};


