export const publicRoutes = [
    "/",
    "/auth/new-verification",
    "/auth/new-password"
]
export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/reset",
    "/auth/error"
]

export const apiAuthPrefix = "/api/auth"


// the default redirect path after logging in
export const DEFAULT_LOGIN_REDIRECT="/settings"