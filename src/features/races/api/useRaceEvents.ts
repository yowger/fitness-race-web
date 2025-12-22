import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { privateApi } from "../../../lib/axios"

export interface RaceEvent {
    id: string
    race_id: string
    name: string
    description?: string
    type?: "registration" | "race" | "awards" | "other"
    scheduled_time: string
    actual_time?: string
    created_at?: string
}

export interface CreateRaceEventInput {
    race_id: string
    name: string
    description?: string
    type?: "registration" | "race" | "awards" | "other"
    scheduled_time: string
    actual_time?: string
}

export const getRaceEventsByRaceId = async (
    raceId: string
): Promise<RaceEvent[]> => {
    const res = await privateApi.get(`/api/race-events/race/${raceId}`)
    return res.data
}

export const getRaceEventById = async (id: string): Promise<RaceEvent> => {
    const res = await privateApi.get(`/api/race-events/${id}`)
    return res.data
}

export const createRaceEvent = async (
    input: CreateRaceEventInput
): Promise<RaceEvent> => {
    const res = await privateApi.post("/api/race-events", input)
    return res.data
}

export const deleteRaceEvent = async (id: string): Promise<void> => {
    await privateApi.delete(`/api/race-events/${id}`)
}

export const useRaceEvents = (raceId: string) => {
    return useQuery({
        queryKey: ["race-events", raceId],
        queryFn: () => getRaceEventsByRaceId(raceId),
        enabled: !!raceId,
        staleTime: 1000 * 60 * 5,
    })
}

export const useRaceEvent = (id: string) => {
    return useQuery<RaceEvent>({
        queryKey: ["race-event", id],
        queryFn: () => getRaceEventById(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    })
}

export const useCreateRaceEvent = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createRaceEvent,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["race-events", variables.race_id],
            })
        },
    })
}

export const useDeleteRaceEvent = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteRaceEvent,
        onSuccess: (_, id, context: { raceId: string }) => {
            queryClient.invalidateQueries({
                queryKey: ["race-events", context.raceId],
            })
        },
    })
}
