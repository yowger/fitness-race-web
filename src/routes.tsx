import { createBrowserRouter } from "react-router-dom"

import Providers from "./Providers"
import AuthRouteGuard from "./features/auth/layouts/AuthRouteGuard"
import SignInPage from "./features/auth/pages/SignInPage"
import SignUpPage from "./features/auth/pages/SignUpPage"
import AuthGuestRoute from "./features/auth/layouts/AuthGuestRoute"
import RunningLandingPage from "./features/landing/pages/LandingPage"
import ProfilePage from "./features/profile/pages/ProfilePage"
import DashboardLayout from "./features/dashboard/layouts/DashboardLayout"
import RoutesPage from "./features/routes/pages/RoutesPage"
import RoutesCreatePage from "./features/routes/pages/RoutesCreatePage"
import RoutesDetailsPage from "./features/routes/pages/RoutesDetailsPage"

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
                element: <AuthRouteGuard />,
                children: [
                    {
                        path: "/dashboard",
                        element: <DashboardLayout />,
                        children: [
                            { path: "", element: <p>Dashboard Home</p> },
                            { path: "profile", element: <ProfilePage /> },
                            {
                                path: "routes",
                                children: [
                                    {
                                        index: true,
                                        element: <RoutesPage />,
                                    },
                                    {
                                        path: "create",
                                        element: <RoutesCreatePage />,
                                    },
                                    {
                                        path: ":id",
                                        element: <RoutesDetailsPage />,
                                    },
                                ],
                            },
                            { path: "runs", element: <p>Runs page</p> },
                        ],
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
