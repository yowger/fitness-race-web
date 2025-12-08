import axios, { AxiosError } from "axios"

export const api = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4000",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.response.use(
    (res) => res,
    (error) => {
        return Promise.reject(error.response?.data || error)
    }
)

export const privateApi = axios.create({
    baseURL: import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4000",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
})

privateApi.interceptors.request.use((config) => {
    const sessionKey = Object.keys(localStorage).find(
        (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
    )
    const session = sessionKey
        ? JSON.parse(localStorage.getItem(sessionKey)!)
        : null
    const token = session?.access_token

    if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`
    }

    return config
})

privateApi.interceptors.response.use(
    (res) => res,
    (error) => {
        console.error("ERROR BABY: ", error)

        if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
                const sessionKey = Object.keys(localStorage).find(
                    (key) =>
                        key.startsWith("sb-") && key.endsWith("-auth-token")
                )
                if (sessionKey) localStorage.removeItem(sessionKey)
            }
        }

        return Promise.reject(error.response?.data || error)
    }
)
