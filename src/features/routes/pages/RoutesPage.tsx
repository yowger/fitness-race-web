import { Link } from "react-router-dom"
import InfiniteScroll from "react-infinite-scroll-component"
import { MapPin, Calendar, Ruler, Image } from "lucide-react"
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

    if (isLoading) return <p>Loading...</p>
    if (isError) return <p>Failed to load routes.</p>

    const routes = data?.pages.flat() ?? []

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Routes
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Manage and view all patrol routes
                    </p>
                </div>

                <Link
                    to="create"
                    className="mt-4 md:mt-0 inline-block px-5 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
                >
                    + Create Route
                </Link>
            </div>

            <InfiniteScroll
                dataLength={routes.length}
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={<p className="text-center my-4">Loading more...</p>}
                endMessage={
                    <p className="text-center my-4">
                        <b>No more routes to show.</b>
                    </p>
                }
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {routes.map((route) => (
                        <div
                            key={route.id}
                            className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all"
                        >
                            <div className="relative h-64 bg-linear-to-br from-blue-100 to-purple-100">
                                {route.map_url ? (
                                    <img
                                        src={route.map_url}
                                        alt={route.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Image
                                            size={48}
                                            className="text-slate-300"
                                        />
                                    </div>
                                )}

                                {route.distance != null && (
                                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm border border-slate-200">
                                        <div className="flex items-center gap-1.5">
                                            <Ruler
                                                size={14}
                                                className="text-blue-600"
                                            />
                                            <span className="text-xs font-semibold text-slate-900">
                                                {formatDistance(route.distance)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    {route.name}
                                </h3>

                                {route.description && (
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                        {route.description}
                                    </p>
                                )}

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 
    flex items-center justify-center text-white text-xs font-semibold shrink-0"
                                        >
                                            {route.users?.avatar_url ? (
                                                <img
                                                    src={route.users.avatar_url}
                                                    alt={route.users.full_name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                getInitials(
                                                    route.users?.full_name ??
                                                        "Unknown"
                                                )
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500">
                                                Created by
                                            </p>
                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                {route.users?.full_name ??
                                                    "Unknown"}
                                            </p>
                                        </div>
                                    </div>

                                    {(route.start_address ||
                                        route.end_address) && (
                                        <div className="space-y-2">
                                            {route.start_address && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <MapPin
                                                            size={16}
                                                            className="text-blue-600"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-slate-500">
                                                            Start
                                                        </p>
                                                        <p className="text-sm font-medium text-slate-900 truncate">
                                                            {
                                                                route.start_address
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {route.end_address && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                                        <MapPin
                                                            size={16}
                                                            className="text-red-600"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-slate-500">
                                                            End
                                                        </p>
                                                        <p className="text-sm font-medium text-slate-900 truncate">
                                                            {route.end_address}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-0">
                                            <Calendar
                                                size={16}
                                                className="text-slate-600"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500">
                                                Created on
                                            </p>
                                            <p className="text-sm font-medium text-slate-900">
                                                {route.created_at &&
                                                    formatDate(
                                                        route.created_at
                                                    )}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    to={route.id}
                                    className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <MapPin size={18} />
                                    View Route
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </InfiniteScroll>

            {routes.length === 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
                    <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        No routes yet
                    </h3>
                    <p className="text-sm text-slate-600">
                        Create your first route to get started
                    </p>
                </div>
            )}

            {isFetchingNextPage && (
                <p className="text-center my-4 text-slate-500">
                    Loading more...
                </p>
            )}
        </div>
    )
}

export default RoutesPage
