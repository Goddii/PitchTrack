import { createContext, useCallback, useContext, useEffect, useState} from "react"
import api, {getToken, setToken} from "../services/api"

const AuthContext = createContext(null)


export function AuthProvider({ children }){
    const [ user, setUser] = useState(null)
    const [loading, setLoading] =  useState(true) //true while we check for an existing session

    // on first load, if a token is stashed in localstorage validate it against /auth/me
    // so a page refresh doesn't boot the user back to a logged-out state

    useEffect(() => {
        const token = getToken()
        if (!token) {
            setLoading(false)
            return
        }

        api.auth 
            .me()
            .then((data) => setUser(data))
            .catch(() => {
                setToken(null)
                setUser(null)
            })
            .finally(() => setLoading(false))
    }, [])

    const login = useCallback(async (email, password) => {
        const data = await api.auth.login({ email, password })
        setToken(data.token)
        setUser(data.user)
        return data.user
    }, [])

    const register = useCallback(async (name, email, password) => {
        const data = await api.auth.register({ name, email, password})
        setToken(data.token)
        setUser(data.user)
        return data.user
    }, [])

    const logout = useCallback(() => {
        // best effort call the token is discarde client side regardless
        api.auth.logout().catch(() => {})
        setToken(null)
        setUser(null)
    }, [])

    const updateProfile = useCallback(async (payload) => {
        const data = await api.auth.updateMe(payload)
        setUser(data)
        return data
    }, [])

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin",
        login,
        register,
        logout, 
        updateProfile,
    }

    return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error("useAuth must be used inside and <AuthProvider>")
    }
    return ctx
}

export default AuthContext