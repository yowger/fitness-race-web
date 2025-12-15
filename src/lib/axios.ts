import axios, { AxiosError } from "axios"
import { supabase } from "./supabase"

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

privateApi.interceptors.request.use(
    async (config) => {
        const { data } = await supabase.auth.getSession()
        const token = data.session?.access_token

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

privateApi.interceptors.response.use(
    (res) => res,
    (error) => {
        console.error("ERROR BABY: ", error)

        if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
                supabase.auth.signOut()

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
