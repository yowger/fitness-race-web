import { createBrowserRouter } from "react-router-dom"

import Providers from "./Providers"
import AuthRouteGuard from "./features/auth/layouts/AuthRouteGuard"
import SignInPage from "./features/auth/pages/SignInPage"
import SignUpPage from "./features/auth/pages/SignUpPage"
import AuthGuestRoute from "./features/auth/layouts/AuthGuestRoute"
import RunningLandingPage from "./features/landing/pages/LandingPage"

const router = createBrowserRouter([
    {
        path: "/",
        element: <Providers />,
        children: [
            {
                path: "/",
                element: <RunningLandingPage />,
            },
            {
                element: <AuthGuestRoute />,
                children: [
                    { path: "/auth/sign-in", element: <SignInPage /> },
                    { path: "/auth/sign-up", element: <SignUpPage /> },
                ],
            },
            {
                path: "/",
                element: <AuthRouteGuard />,
                children: [
                    {
                        path: "/dashboard",
                        element: <p>Protected</p>,
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <p>Page not found</p>,
    },
])

export default router
