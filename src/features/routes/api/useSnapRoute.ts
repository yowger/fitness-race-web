import axios, { AxiosError } from "axios"
import { useMutation } from "@tanstack/react-query"
import type { MapMatchingResponse } from "../types/routesTypes"

const GEOAPIFY_URL = "https://api.geoapify.com"
const GEOAPIFY_KEY = import.meta.env.VITE_PUBLIC_GEOAPIFY_API_KEY

async function snapRouteApi(points: { location: number[] }[]) {
    if (!points.length) throw new Error("No points to snap")

    try {
        const { data } = await axios.post<MapMatchingResponse>(
            `${GEOAPIFY_URL}/v1/mapmatching`,
            { mode: "drive", waypoints: points },
            {
                params: {
                    apiKey: GEOAPIFY_KEY,
                },
            }
        )
        console.log("🚀 ~ snapRouteApi ~ data:", data)
        return data
    } catch (err: unknown | AxiosError) {
        console.log("🚀 ~ snapRouteApi ~ err:", err)

        if (err instanceof AxiosError) {
            const message =
                err.response?.data?.error?.message ||
                err.response?.data ||
                err.message ||
                "Failed to snap route"
            throw new Error(message)
        }
    }
}

export function useSnapRoute() {
    return useMutation({
        mutationFn: snapRouteApi,
    })
}
