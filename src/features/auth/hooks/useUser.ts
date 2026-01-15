import { useMutation, useQuery } from "@tanstack/react-query"

import { api, privateApi } from "../../../lib/axios"

export type UserRole = "admin" | "organizer" | "user" | ""

export interface UserResponse {
    id: string
    email: string
    full_name: string
    role?: UserRole
    username?: string
    avatar_url?: string
    created_at?: string
    updated_at?: string
}

export interface CreateUserInput {
    id: string
    email: string
    fullName: string
    username?: string
    avatar_url?: string
}
export const createUser = async (input: CreateUserInput) => {
    const res = await api.post("/api/users", input)
    return res.data
}

export const useCreateUser = () => {
    return useMutation({
        mutationFn: async (input: CreateUserInput) => {
            return await createUser(input)
        },
    })
}

export const getUser = async () => {
    const res = await privateApi.get("/api/users/me")
    return res.data as UserResponse
}

export const useUser = () => {
    return useQuery<UserResponse>({
        queryKey: ["currentUser"],
        queryFn: getUser,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

export const getProfileById = async (userId: string) => {
    const res = await api.get(`/api/users/${userId}`)
    return res.data as UserResponse
}

export const useProfileById = (userId: string) => {
    return useQuery<UserResponse>({
        queryKey: ["userProfile", userId],
        queryFn: () => getProfileById(userId),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}
