// import { useRoutes } from "react-router-dom"
// import { Suspense } from "react"

// import routes from "./routes"

// export default function App() {
//     const routing = useRoutes(routes)

//     return <Suspense fallback={<div>Loading...</div>}>{routing}</Suspense>
// }

// import { useState, useEffect } from "react"
// import { createClient, type Session } from "@supabase/supabase-js"
// import { Auth } from "@supabase/auth-ui-react"
// import { ThemeSupa } from "@supabase/auth-ui-shared"

// const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL
// const SUPABASE_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANNON_KEY

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// export default function App() {
//     const [session, setSession] = useState<Session | null>(null)

//     // useEffect(() => {
//     //     supabase.auth.getSession().then(({ data: { session } }) => {
//     //         setSession(session)
//     //     })

//     //     const {
//     //         data: { subscription },
//     //     } = supabase.auth.onAuthStateChange((_event, session) => {
//     //         setSession(session)
//     //     })

//     //     return () => subscription.unsubscribe()
//     // }, [])

//     useEffect(() => {
//         supabase.auth.getSession().then(({ data: { session } }) => {
//             setSession(session)
//         })

//         const {
//             data: { subscription },
//         } = supabase.auth.onAuthStateChange((_event, session) => {
//             setSession(session)
//         })

//         return () => subscription.unsubscribe()
//     }, [])

//     if (!session) {
//         return (
//             <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
//         )
//     } else {
//         return <div>Logged in!</div>
//     }
// }

// export default function App() {
//     return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
// }
