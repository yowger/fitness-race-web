// import LandingPage from "./features/landing/pages/LandingPage"

import { createBrowserRouter } from "react-router-dom"
import Providers from "./Providers"
import AuthRouteGuard from "./features/auth/layouts/AuthRouteGuard"
import SignInPage from "./features/auth/pages/SignInPage"
import SignUpPage from "./features/auth/pages/SignUpPage"

// const routes = [{ path: "/", element: <LandingPage /> }]

// export default routes

const router = createBrowserRouter([
    {
        path: "/",
        element: <Providers />,
        children: [
            // Public routes
            {
                path: "/",
                element: <p>Home</p>,
            },
            {
                path: "/auth/sign-in",
                element: <SignInPage />,
            },
            {
                path: "/auth/sign-up",
                element: <SignUpPage />,
            },
            {
                path: "/",
                element: <AuthRouteGuard />,
                children: [
                    {
                        path: "/protected",
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
