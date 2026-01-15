import { createContext, useEffect, useState } from "react"
import { type Session } from "@supabase/supabase-js"
import { supabase } from "../../../lib/supabase"
import { useUser, type UserResponse, type UserRole } from "../hooks/useUser"

interface SessionContextType {
    session: Session | null
    user: UserResponse | null
    isLoading: boolean
    role?: UserRole 
}

const SessionContext = createContext<SessionContextType>({
    session: null,
    user: null,
    isLoading: true,
    role: "",
})

type Props = { children: React.ReactNode }

export const SessionProvider = ({ children }: Props) => {
    const [session, setSession] = useState<Session | null>(null)
    const { data: user, isLoading: isUserLoading } = useUser()

    useEffect(() => {
        const authStateListener = supabase.auth.onAuthStateChange(
            (_, newSession) => {
                setSession(newSession)
            }
        )

        return () => {
            authStateListener.data.subscription.unsubscribe()
        }
    }, [])

    const isLoading = isUserLoading

    return (
        <SessionContext.Provider
            value={{ session, user: user || null, isLoading, role: user?.role }}
        >
            {isLoading ? <p>Loading...</p> : children}
        </SessionContext.Provider>
    )
}

export default SessionContext
