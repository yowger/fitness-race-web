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

        return data
    } catch (err: unknown | AxiosError) {
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

type LatLng = { lat: number; lng: number }

function simplifyLine(points: LatLng[], tolerance = 0.0005): LatLng[] {
    if (points.length < 3) return points

    const sqTolerance = tolerance * tolerance

    const getSqSegDist = (p: LatLng, p1: LatLng, p2: LatLng) => {
        let x = p1.lng
        let y = p1.lat
        let dx = p2.lng - x
        let dy = p2.lat - y

        if (dx !== 0 || dy !== 0) {
            const t =
                ((p.lng - x) * dx + (p.lat - y) * dy) / (dx * dx + dy * dy)
            if (t > 1) {
                x = p2.lng
                y = p2.lat
            } else if (t > 0) {
                x += dx * t
                y += dy * t
            }
        }

        dx = p.lng - x
        dy = p.lat - y

        return dx * dx + dy * dy
    }

    const simplifyDP = (
        pts: LatLng[],
        first: number,
        last: number,
        sqTol: number,
        simplified: LatLng[]
    ) => {
        let maxSqDist = sqTol
        let index = 0

        for (let i = first + 1; i < last; i++) {
            const sqDist = getSqSegDist(pts[i], pts[first], pts[last])
            if (sqDist > maxSqDist) {
                index = i
                maxSqDist = sqDist
            }
        }

        if (maxSqDist > sqTol) {
            if (index - first > 1)
                simplifyDP(pts, first, index, sqTol, simplified)
            simplified.push(pts[index])
            if (last - index > 1)
                simplifyDP(pts, index, last, sqTol, simplified)
        }
    }

    const simplified: LatLng[] = [points[0]]
    simplifyDP(points, 0, points.length - 1, sqTolerance, simplified)
    simplified.push(points[points.length - 1])
    return simplified
}

async function fetchStaticMapUrl(routePoints: LatLng[]): Promise<string> {
    if (!routePoints.length) throw new Error("No points to generate map")

    const simplifiedPoints = simplifyLine(routePoints, 0.0005)

    const geojson = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    linecolor: "#1E90FF",
                    linewidth: 5,
                    linestyle: "solid",
                    lineopacity: 1,
                },
                geometry: {
                    type: "LineString",
                    coordinates: simplifiedPoints.map((p) => [p.lng, p.lat]),
                },
            },
        ],
    }

    const geojsonString = encodeURIComponent(JSON.stringify(geojson))
    const width = 600
    const height = 400
    const zoom = 12
    const style = "positron"

    return `https://maps.geoapify.com/v1/staticmap?style=${style}&width=${width}&height=${height}&zoom=${zoom}&geojson=${geojsonString}&apiKey=${GEOAPIFY_KEY}`
}

export function useGeoapifyStaticMap() {
    return useMutation<string, Error, LatLng[]>({
        mutationFn: fetchStaticMapUrl,
    })
}

async function reverseGeocode({ lat, lng }: { lat: number; lng: number }) {
    try {
        const { data } = await axios.get(`${GEOAPIFY_URL}/v1/geocode/reverse`, {
            params: {
                lat,
                lon: lng,
                format: "json",
                apiKey: GEOAPIFY_KEY,
            },
        })

        if (data?.results?.length) {
            const r = data.results[0]

            const parts = [
                r.name,
                r.street,
                r.suburb,
                r.city,
                r.postcode,
                r.country,
            ].filter(Boolean)

            return parts.join(", ")
        }

        return ""
    } catch (err) {
        if (err instanceof Error) {
            throw new Error("Failed to fetch address")
        }
    }
}

export function useReverseGeocode() {
    return useMutation({
        mutationFn: reverseGeocode,
    })
}
