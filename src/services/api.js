const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const TOKEN_KEY = "pitchtrack_token"

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token){
    if(token){
        localStorage.setItem(TOKEN_KEY, token)
    } else {
        localStorage.removeItem(TOKEN_KEY)
    }
}

async function request(path, {method = "GET", body, auth = true} = {}){
    const headers = {'Content-Type': "application/json"}

    if (auth) {
        const token = getToken()
        if(token) headers["Authorization"] = `Bearer ${token}`
    }

    const res = await fetch(`${API_BASE}${path}`,{
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    //204/empty bodies are valid for some responses guard against JSON parse errors
    let data = null
    const text = await res.text()
    if (text) {
        try { 
            data = JSON.parse(text)
        } catch {
            data = null
        }
    }

    if (!res.ok) {
        const message = data?.error || data?.message || `Request failed (${res.status})`
        const error = new Error(message)
        error.status = res.status
        error.data = data
        throw error
    }
    return data
}

export const api = {
    auth: {
        register: (payload) => request("/auth/register", {method:"POST", body:payload, auth:false}),
        login: (payload) => request("/auth/login", {method:"POST", body:payload, auth:false}),
        logout: () => request("/auth/logout", {method: "POST"}),
        me: () => request("/auth/me"),
        updateMe: (payload) => request("/auth/me", { method: "PUT", body:payload}),
        forgotPassword: (payload) => request("/auth/forgot-password", {method: "POST", body: payload, auth:false}),
        resetPassword: (payload) => request("/auth/reset-password", {method: "POST", body: payload, auth: false}),
    },

    teams: {
        list: () => request("/teams", { auth: false }),
        get: (id) => request(`/teams/${id}`, { auth: false }),
        create: (payload) => request("/teams", { method: "POST", body: payload }),
        update: (id, payload) => request(`/teams/${id}`, { method: "PUT", body: payload }),
        remove: (id) => request(`/teams/${id}`, { method: "DELETE" }),
    },

    players: {
        list: (params = {}) => {
            const qs = new URLSearchParams(params).toString();
            return request(`/players${qs ? `?${qs}` : ""}`, { auth: false });
        },
        get: (id) => request(`/players/${id}`, { auth: false }),
        create: (payload) => request("/players", { method: "POST", body: payload }),
        update: (id, payload) => request(`/players/${id}`, { method: "PUT", body: payload }),
        remove: (id) => request(`/players/${id}`, { method: "DELETE" }),
    },

    matches: {
        list: (params = {}) => {
            const qs = new URLSearchParams(params).toString();
            return request(`/matches${qs ? `?${qs}` : ""}`, { auth: false });
        },
        get: (id) => request(`/matches/${id}`, { auth: false }),
        create: (payload) => request("/matches", { method: "POST", body: payload }),
        update: (id, payload) => request(`/matches/${id}`, { method: "PUT", body: payload }),
        remove: (id) => request(`/matches/${id}`, { method: "DELETE" }),
    },

    favorites: {
        list: () => request("/favorites"),
        follow: (teamId) => request(`/favorites/${teamId}`, { method: "POST" }),
        unfollow: (teamId) => request(`/favorites/${teamId}`, { method: "DELETE" }),
    },
};
