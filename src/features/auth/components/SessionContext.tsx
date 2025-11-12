import { createContext, useEffect, useState } from "react"
import { type Session } from "@supabase/supabase-js"

import { supabase } from "../../../lib/supabase"

const SessionContext = createContext<{
    session: Session | null
}>({
    session: null,
})

type Props = { children: React.ReactNode }

export const SessionProvider = ({ children }: Props) => {
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const authStateListener = supabase.auth.onAuthStateChange(
            async (_, session) => {
                setSession(session)
                setIsLoading(false)
            }
        )

        return () => {
            authStateListener.data.subscription.unsubscribe()
        }
    }, [supabase])

    return (
        <SessionContext.Provider value={{ session }}>
            {isLoading ? <p>Loading...</p> : children}
        </SessionContext.Provider>
    )
}

export default SessionContext
