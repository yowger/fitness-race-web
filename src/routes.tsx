import { createBrowserRouter } from "react-router-dom"

import Providers from "./Providers"
import AuthRouteGuard from "./features/auth/layouts/AuthRouteGuard"
import SignInPage from "./features/auth/pages/SignInPage"
import SignUpPage from "./features/auth/pages/SignUpPage"
import AuthGuestRoute from "./features/auth/layouts/AuthGuestRoute"
import RunningLandingPage from "./features/landing/pages/LandingPage"
import ProfilePage from "./features/profile/pages/ProfilePage"

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
                        // element: <p>Protected</p>,
                        element: <ProfilePage />,
                    },
                ],
                /*
                       children: [
                {
                    path: "/dashboard",
                    element: <DashboardLayout />, // maybe your main dashboard layout
                    children: [
                        { path: "", element: <DashboardHome /> }, // /dashboard
                        { path: "profiles", element: <ProfilesPage /> }, // /dashboard/profiles
                        { path: "runs", element: <RunsPage /> }, // /dashboard/runs
                        { path: "routes", element: <RoutesPage /> }, // /dashboard/routes
                    ],
                },
            ],
                */
            },
        ],
    },
    {
        path: "*",
        element: <p>Page not found</p>,
    },
])

export default router
