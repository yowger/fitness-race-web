import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { privateApi } from "../../../lib/axios"

export interface Notification {
    id: string
    user_id: string
    type: string
    title: string
    message?: string
    data?: Record<string, string>
    is_read: boolean
    created_at: string
}

export interface CreateBroadcastNotificationInput {
    type: string
    title: string
    message?: string
}

export const getNotifications = async (params?: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
}): Promise<Notification[]> => {
    const res = await privateApi.get("/api/notifications", {
        params: params
            ? {
                  limit: params.limit,
                  offset: params.offset,
                  unreadOnly: params.unreadOnly,
              }
            : undefined,
    })
    return res.data
}

export const markNotificationAsRead = async (notification_id: string) => {
    const res = await privateApi.post("/api/notifications/read", {
        notification_id,
    })
    return res.data
}

export const markAllNotificationsAsRead = async () => {
    const res = await privateApi.post("/api/notifications/read-all", {})
    return res.data
}

export const createBroadcastNotification = async (
    input: CreateBroadcastNotificationInput,
) => {
    const res = await privateApi.post("/api/notifications/broadcast", input)
    return res.data
}

export const getUnreadNotificationsCount = async (): Promise<number> => {
    const res = await privateApi.get("/api/notifications/unread-count")
    return res.data.count
}

export const useNotifications = (params?: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
}) => {
    return useQuery({
        queryKey: ["notifications", params],
        queryFn: () => getNotifications(params),
        staleTime: 1000 * 60 * 5,
    })
}

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
    })
}

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
    })
}

export const useBroadcastNotification = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createBroadcastNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
    })
}

export const useUnreadNotificationsCount = () => {
    return useQuery({
        queryKey: ["notifications-unread-count"],
        queryFn: getUnreadNotificationsCount,
        staleTime: 1000 * 30,
    })
}
