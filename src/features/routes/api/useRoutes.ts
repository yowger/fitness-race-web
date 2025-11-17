import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { privateApi } from "../../../lib/axios"

export type Position = [number, number]

export interface LineString {
    type: "LineString"
    coordinates: Position[]
}

export interface Feature<T = LineString> {
    type: "Feature"
    geometry: T
    properties?: Record<string, unknown>
}

export interface FeatureCollection<T = LineString> {
    type: "FeatureCollection"
    features: Feature<T>[]
}

export interface RouteResponse {
    id: string
    name: string
    description?: string
    distance?: number
    geojson: FeatureCollection<LineString>
    map_url?: string
    created_by?: string
    created_at?: string
}

export interface CreateRouteInput {
    name: string
    description?: string
    distance?: number
    geojson: FeatureCollection<LineString>
    map_url?: string
}

export const getAllRoutes = async (): Promise<RouteResponse[]> => {
    const res = await privateApi.get("/api/routes")
    return res.data
}

export const getRouteById = async (id: string): Promise<RouteResponse> => {
    const res = await privateApi.get(`/api/routes/${id}`)
    return res.data
}

export const createRoute = async (
    input: CreateRouteInput
): Promise<RouteResponse> => {
    const res = await privateApi.post("/api/routes", input)
    return res.data
}

export const deleteRoute = async (id: string): Promise<void> => {
    await privateApi.delete(`/api/routes/${id}`)
}

export const useRoutes = () => {
    return useQuery<RouteResponse[]>({
        queryKey: ["routes"],
        queryFn: getAllRoutes,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

export const useRoute = (id: string) => {
    return useQuery<RouteResponse>({
        queryKey: ["route", id],
        queryFn: () => getRouteById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
    })
}

export const useCreateRoute = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createRoute,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["routes"],
            })
        },
    })
}

export const useDeleteRoute = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteRoute,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["routes"],
            })
        },
    })
}
