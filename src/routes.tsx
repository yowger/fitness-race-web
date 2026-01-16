import { createBrowserRouter } from "react-router-dom"

import Providers from "./Providers"
import AuthRouteGuard from "./features/auth/layouts/AuthRouteGuard"
import SignInPage from "./features/auth/pages/SignInPage"
import SignUpPage from "./features/auth/pages/SignUpPage"
import AuthGuestRoute from "./features/auth/layouts/AuthGuestRoute"
import RunningLandingPage from "./features/landing/pages/LandingPage"
// import ProfilePage from "./features/profile/pages/ProfilePage"
import DashboardLayout from "./features/dashboard/layouts/DashboardLayout"
import RoutesPage from "./features/routes/pages/RoutesPage"
import RoutesCreatePage from "./features/routes/pages/RoutesCreatePage"
import RoutesDetailsPage from "./features/routes/pages/RoutesDetailsPage"
import RacesPage from "./features/races/pages/RacesPage"
import RacesDetailPage from "./features/races/pages/RacesDetailPage"
import RacesResultsPage from "./features/races/pages/RacesResultsPage"
// import RacesLivePage from "./features/races/pages/RacesLivePage"
import RaceCreatePage from "./features/races/pages/RacesFormPage"
import DashboardPage from "./features/dashboard/pages/DashboardPage"
import RacesOngoingPage from "./features/races/pages/RacesOngoingPage"
import RacesCompletePage from "./features/races/pages/RacesCompletePage"
import ProfilePage from "./features/profile/pages/ProfilePage"
import RacesRun from "./features/races/pages/RacesRun"
import SoloDashboardPage from "./features/solo/pages/SoloDashboardPage"
import SoloRunPage from "./features/solo/pages/SoloRunPage"
import SoloResultsPage from "./features/solo/pages/SoloResultsPage"
import PendingRacesPage from "./features/admin/pages/PendingRacesPage"
import AdminStatsPage from "./features/admin/pages/AdminStatsPage"
import AdminProfilePage from "./features/admin/pages/AdminProfilePage"

const router = createBrowserRouter([
    {
        path: "/",
        element: <Providers />,
        children: [
            {
                index: true,
                element: <RunningLandingPage />,
            },
            {
                element: <AuthRouteGuard />,
                children: [
                    // { index: true, element: <PendingRacesPage /> },
                    // { path: "races/pending", element: <PendingRacesPage /> },
                    // { path: "races/rejected", element: <RejectedRacesPage /> },
                    // { path: "races/approved", element: <ApprovedRacesPage /> },
                    // { path: "stats", element: <AdminStatsPage /> },
                    // { path: "profile", element: <AdminProfilePage /> },
                    {
                        path: "/admin",
                        element: <DashboardLayout />,
                        children: [
                            { index: true, element: <PendingRacesPage /> },
                            { path: "stats", element: <AdminStatsPage /> },
                            { path: "profile", element: <AdminProfilePage /> },
                        ],
                    },
                ],
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
                            { path: "", element: <DashboardPage /> },
                            { path: "profile/:id", element: <ProfilePage /> },
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
                            {
                                path: "races",
                                children: [
                                    {
                                        index: true,
                                        element: <RacesPage />,
                                    },
                                    {
                                        path: "create",
                                        element: <RaceCreatePage />,
                                    },
                                    {
                                        path: ":id",
                                        element: <RacesDetailPage />,
                                    },
                                    // {
                                    //     path: ":id/ongoing",
                                    //     element: <RacesLivePage />,
                                    // },
                                    {
                                        path: ":id/live",
                                        element: <RacesOngoingPage />,
                                    },
                                    {
                                        path: ":id/results",
                                        element: <RacesResultsPage />,
                                    },
                                    {
                                        path: ":id/complete",
                                        element: <RacesCompletePage />,
                                    },
                                    {
                                        path: ":id/run",
                                        element: <RacesRun />,
                                    },
                                ],
                            },
                            {
                                path: "solo",
                                children: [
                                    {
                                        index: true,
                                        element: <SoloDashboardPage />,
                                    },
                                    {
                                        path: "run",
                                        element: <SoloRunPage />,
                                    },
                                    {
                                        path: ":id/results",
                                        element: <SoloResultsPage />,
                                    },
                                ],
                            },
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
