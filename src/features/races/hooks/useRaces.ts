import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { privateApi } from "../../../lib/axios"
import type { RouteResponse } from "../../routes/api/useRoutes"

export interface UserInfo {
    id: string
    email?: string
    full_name?: string
    avatar_url?: string
}

export interface Race {
    id: string
    name: string
    description?: string
    start_time: string
    end_time?: string
    max_participants?: number
    route_id?: string
    created_by?: string
    status: string
    created_at?: string
    updated_at?: string
    routes?: RouteResponse
    participants?: UserInfo[]
}

export interface Participant {
    id: string
    race_id: string
    user_id: string
    joined_at?: string
    user?: UserInfo
}

export interface Tracking {
    id: string
    race_id: string
    user_id: string
    latitude: number
    longitude: number
    recorded_at: string
}

export interface Result {
    id: string
    race_id: string
    user_id: string
    finish_time: string
    position?: number
    recorded_at: string
    user?: UserInfo
}

export interface RaceFilters {
    name?: string
    status?: "upcoming" | "ongoing" | "finished"
    startDate?: string
    endDate?: string
}

export const getAllRaces = async (filters?: RaceFilters): Promise<Race[]> => {
    const res = await privateApi.get("/api/group-races", { params: filters })
    return res.data
}

export const getRaceById = async (id: string): Promise<Race> => {
    const res = await privateApi.get(`/api/group-races/${id}`)
    return res.data
}

export const createRace = async (input: Partial<Race>): Promise<Race> => {
    const res = await privateApi.post("/api/group-races", input)
    return res.data
}

export const addParticipant = async (input: {
    race_id: string
    user_id: string
}): Promise<Participant> => {
    const res = await privateApi.post("/api/group-races/participants", input)
    return res.data
}

export const getParticipantsByRace = async (
    raceId: string
): Promise<Participant[]> => {
    const res = await privateApi.get(`/api/group-races/${raceId}/participants`)
    return res.data
}

export const addTracking = async (
    input: Omit<Tracking, "id">
): Promise<Tracking> => {
    const res = await privateApi.post("/api/group-races/tracking", input)
    return res.data
}

export const getTrackingByRace = async (
    raceId: string,
    userId?: string
): Promise<Tracking[]> => {
    const res = await privateApi.get(`/api/group-races/${raceId}/tracking`, {
        params: { userId },
    })
    return res.data
}

export const getLatestTracking = async (
    raceId: string,
    userId: string
): Promise<Tracking> => {
    const res = await privateApi.get(
        `/api/group-races/${raceId}/tracking/latest/${userId}`
    )
    return res.data
}

export const addResult = async (input: Omit<Result, "id">): Promise<Result> => {
    const res = await privateApi.post("/api/group-races/results", input)
    return res.data
}

export const getResultsByRace = async (raceId: string): Promise<Result[]> => {
    const res = await privateApi.get(`/api/group-races/${raceId}/results`)
    return res.data
}

export const useRaces = (filters?: RaceFilters) =>
    useQuery({
        queryKey: ["races", filters],
        queryFn: () => getAllRaces(filters),
        staleTime: 1000 * 60 * 5,
    })

export const useRace = (id: string) =>
    useQuery({
        queryKey: ["race", id],
        queryFn: () => getRaceById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
    })

export const useCreateRace = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createRace,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["races"] }),
    })
}

export const useParticipants = (raceId: string) =>
    useQuery({
        queryKey: ["race-participants", raceId],
        queryFn: () => getParticipantsByRace(raceId),
        enabled: !!raceId,
    })

export const useAddParticipant = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: addParticipant,
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({
                queryKey: ["race-participants", variables.race_id],
            }),
    })
}

export const useTracking = (raceId: string, userId?: string) =>
    useQuery({
        queryKey: ["race-tracking", raceId, userId],
        queryFn: () => getTrackingByRace(raceId, userId),
        enabled: !!raceId,
    })

export const useAddTracking = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: addTracking,
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({
                queryKey: [
                    "race-tracking",
                    variables.race_id,
                    variables.user_id,
                ],
            }),
    })
}

export const useLatestTracking = (raceId: string, userId: string) =>
    useQuery({
        queryKey: ["race-tracking-latest", raceId, userId],
        queryFn: () => getLatestTracking(raceId, userId),
        enabled: !!raceId && !!userId,
    })

export const useResults = (raceId: string) =>
    useQuery({
        queryKey: ["race-results", raceId],
        queryFn: () => getResultsByRace(raceId),
        enabled: !!raceId,
    })

export const useAddResult = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: addResult,
        onSuccess: (_, variables) =>
            queryClient.invalidateQueries({
                queryKey: ["race-results", variables.race_id],
            }),
    })
}
