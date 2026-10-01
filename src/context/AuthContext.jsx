import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import api, { getToken, setToken, UNAUTHORIZED_EVENT } from "../services/api"

const AuthContext = createContext(null)


export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    // True while a stored token is being validated; with no token there is nothing to wait for
    const [loading, setLoading] = useState(() => Boolean(getToken()))

    // On first load, validate a stashed token against /auth/me so a page refresh
    // doesn't boot the user back to a logged-out state
    useEffect(() => {
        if (!getToken()) return
        const controller = new AbortController()

        api.auth
            .me({ signal: controller.signal })
            .then((data) => setUser(data))
            .catch(() => {
                if (controller.signal.aborted) return
                setToken(null)
                setUser(null)
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false)
            })

        return () => controller.abort()
    }, [])

    // api.js clears the token and fires this when any authenticated call returns 401
    useEffect(() => {
        const handleUnauthorized = () => setUser(null)
        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    }, [])

    const login = useCallback(async (email, password) => {
        const data = await api.auth.login({ email, password })
        setToken(data.token)
        setUser(data.user)
        return data.user
    }, [])

    const register = useCallback(async (name, email, password) => {
        const data = await api.auth.register({ name, email, password })
        setToken(data.token)
        setUser(data.user)
        return data.user
    }, [])

    const logout = useCallback(() => {
        // Best effort: the token is discarded client side regardless
        api.auth.logout().catch(() => {})
        setToken(null)
        setUser(null)
    }, [])

    const updateProfile = useCallback(async (payload) => {
        const data = await api.auth.updateMe(payload)
        setUser(data)
        return data
    }, [])

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            isAdmin: user?.role === "admin",
            login,
            register,
            logout,
            updateProfile,
        }),
        [user, loading, login, register, logout, updateProfile]
    )

    return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
}

// The hook lives beside its provider so every consumer imports from one module
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error("useAuth must be used inside an <AuthProvider>")
    }
    return ctx
}

export default AuthContext
