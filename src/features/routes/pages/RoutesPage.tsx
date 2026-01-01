import { Link } from "react-router-dom"
import InfiniteScroll from "react-infinite-scroll-component"
import {
    MapPin,
    Calendar,
    TrendingUp,
    Image,
    Plus,
    // User,
    Flag,
    Navigation,
    // Clock,
    // Search,
} from "lucide-react"
import { useRoutes } from "../api/useRoutes"

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

const formatDistance = (km: number) => `${km.toFixed(2)} km`

const getInitials = (name: string) =>
    name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "U"

const RoutesPage = () => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useRoutes(20)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4">
                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="font-heading text-xl text-zinc-600">
                        LOADING ROUTES...
                    </p>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                        <MapPin className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="font-display text-4xl text-zinc-900 mb-2">
                        Failed to Load Routes
                    </h1>
                    <p className="font-body text-base text-zinc-600">
                        There was an error loading the routes. Please try again.
                    </p>
                </div>
            </div>
        )
    }

    const routes = data?.pages.flat() ?? []

    return (
        <div className="min-h-screen bg-gray-50 font-body">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Antonio:wght@700&family=Work+Sans:wght@400;500;600;700&display=swap');
                
                .font-display {
                    font-family: 'Antonio', sans-serif;
                    letter-spacing: -0.02em;
                }
                
                .font-heading {
                    font-family: 'Bebas Neue', sans-serif;
                    letter-spacing: 0.02em;
                }
                
                .font-body {
                    font-family: 'Work Sans', sans-serif;
                }

                .fade-in {
                    animation: fadeIn 0.6s ease-out;
                }

                .fade-in-delay-1 {
                    animation: fadeIn 0.6s ease-out 0.2s both;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .route-card {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .route-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 28px rgba(8, 145, 178, 0.2);
                }

                .create-route-btn {
                    position: relative;
                    overflow: hidden;
                }

                .create-route-btn::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                .create-route-btn:hover::after {
                    width: 300px;
                    height: 300px;
                }
            `}</style>

            {/* Header Section */}
            <div className="bg-white border-b-2 border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 fade-in">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-green-600 flex items-center justify-center">
                                    <Navigation className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="font-display text-5xl text-zinc-900">
                                    Routes
                                </h1>
                            </div>
                            <p className="font-body text-lg text-zinc-600 ml-15">
                                Explore and manage all available race routes
                            </p>
                        </div>

                        <Link
                            to="create"
                            className="create-route-btn inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-xl rounded-lg hover:shadow-xl transition-all shadow-lg"
                        >
                            <Plus className="w-6 h-6" />
                            CREATE ROUTE
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search & Filter Bar */}
                {/* <div className="mb-8 fade-in-delay-1">
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search routes by name or location..."
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg font-body text-base focus:outline-none focus:border-cyan-500 transition-colors"
                                />
                            </div>
                            <button className="px-6 py-3 border-2 border-gray-300 rounded-lg font-heading text-base text-zinc-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                                FILTER
                            </button>
                        </div>
                    </div>
                </div> */}

                {/* Routes Grid */}
                {routes.length === 0 ? (
                    <div className="fade-in bg-white rounded-lg border-2 border-gray-200 p-16 text-center shadow-sm">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
                            <Navigation className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="font-display text-4xl text-zinc-900 mb-3">
                            No Routes Yet
                        </h3>
                        <p className="font-body text-lg text-zinc-600 mb-8">
                            Create your first route to get started with race
                            planning
                        </p>
                        <Link
                            to="create"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-xl rounded-lg hover:shadow-xl transition-all"
                        >
                            <Plus className="w-6 h-6" />
                            CREATE YOUR FIRST ROUTE
                        </Link>
                    </div>
                ) : (
                    <InfiniteScroll
                        dataLength={routes.length}
                        next={fetchNextPage}
                        hasMore={!!hasNextPage}
                        loader={
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 mb-3">
                                    <div className="w-6 h-6 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <p className="font-body text-base text-zinc-600">
                                    Loading more routes...
                                </p>
                            </div>
                        }
                        endMessage={
                            <div className="text-center py-8">
                                <p className="font-body text-base text-zinc-600">
                                    <span className="font-semibold">
                                        You've reached the end!
                                    </span>{" "}
                                    No more routes to show.
                                </p>
                            </div>
                        }
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {routes.map((route, index) => (
                                <div
                                    key={route.id}
                                    className="route-card bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm"
                                    style={{
                                        animationDelay: `${(index % 6) * 0.1}s`,
                                    }}
                                >
                                    {/* Route Image/Map */}
                                    <div className="relative h-56 bg-gradient-to-br from-cyan-100 to-green-100">
                                        {route.map_url ? (
                                            <img
                                                src={route.map_url}
                                                alt={route.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Image className="w-16 h-16 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Distance Badge */}
                                        {route.distance != null && (
                                            <div className="absolute top-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border-2 border-cyan-200">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                                                    <span className="font-heading text-lg text-zinc-900">
                                                        {formatDistance(
                                                            route.distance
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6">
                                        {/* Route Name */}
                                        <h3 className="font-display text-2xl text-zinc-900 mb-2">
                                            {route.name}
                                        </h3>

                                        {/* Description */}
                                        {route.description && (
                                            <p className="font-body text-base text-zinc-600 mb-5 line-clamp-2">
                                                {route.description}
                                            </p>
                                        )}

                                        {/* Route Details */}
                                        <div className="space-y-4 mb-6">
                                            {/* Creator */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-green-600 flex items-center justify-center text-white font-heading text-sm flex-shrink-0">
                                                    {route.users?.avatar_url ? (
                                                        <img
                                                            src={
                                                                route.users
                                                                    .avatar_url
                                                            }
                                                            alt={
                                                                route.users
                                                                    .full_name
                                                            }
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        getInitials(
                                                            route.users
                                                                ?.full_name ??
                                                                "Unknown"
                                                        )
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-body text-xs text-zinc-500 uppercase tracking-wider">
                                                        Created by
                                                    </p>
                                                    <p className="font-body text-sm font-semibold text-zinc-900 truncate">
                                                        {route.users
                                                            ?.full_name ??
                                                            "Unknown"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Start/End Addresses */}
                                            {(route.start_address ||
                                                route.end_address) && (
                                                <div className="space-y-3">
                                                    {route.start_address && (
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <MapPin className="w-4 h-4 text-green-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-body text-xs text-zinc-500 uppercase tracking-wider">
                                                                    Start Point
                                                                </p>
                                                                <p className="font-body text-sm font-medium text-zinc-900 truncate">
                                                                    {
                                                                        route.start_address
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {route.end_address && (
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <Flag className="w-4 h-4 text-red-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-body text-xs text-zinc-500 uppercase tracking-wider">
                                                                    End Point
                                                                </p>
                                                                <p className="font-body text-sm font-medium text-zinc-900 truncate">
                                                                    {
                                                                        route.end_address
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Created Date */}
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                    <Calendar className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-body text-xs text-zinc-500 uppercase tracking-wider">
                                                        Created on
                                                    </p>
                                                    <p className="font-body text-sm font-semibold text-zinc-900">
                                                        {route.created_at &&
                                                            formatDate(
                                                                route.created_at
                                                            )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-3 gap-2 mb-6">
                                            <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200">
                                                <div className="font-display text-2xl text-cyan-700">
                                                    {route.distance?.toFixed(
                                                        1
                                                    ) ?? "—"}
                                                </div>
                                                <div className="font-body text-xs text-zinc-600 uppercase">
                                                    KM
                                                </div>
                                            </div>
                                            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                                <div className="font-display text-2xl text-green-700">
                                                    {route.distance
                                                        ? Math.ceil(
                                                              route.distance * 5
                                                          )
                                                        : "—"}
                                                </div>
                                                <div className="font-body text-xs text-zinc-600 uppercase">
                                                    MIN
                                                </div>
                                            </div>
                                            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                                <div className="font-display text-2xl text-purple-700">
                                                    5:00
                                                </div>
                                                <div className="font-body text-xs text-zinc-600 uppercase">
                                                    PACE
                                                </div>
                                            </div>
                                        </div>

                                        {/* View Route Button */}
                                        <Link
                                            to={route.id}
                                            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-lg rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <Navigation className="w-5 h-5" />
                                            VIEW ROUTE
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </InfiniteScroll>
                )}

                {/* Loading More Indicator */}
                {isFetchingNextPage && (
                    <div className="text-center py-8 mt-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 mb-3">
                            <div className="w-6 h-6 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="font-body text-base text-zinc-600">
                            Loading more routes...
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RoutesPage
