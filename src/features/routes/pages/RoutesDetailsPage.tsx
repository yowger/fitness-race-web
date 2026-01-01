import { useParams, Link } from "react-router-dom"
import {
    Calendar,
    ArrowLeft,
    MapPin,
    Flag,
    TrendingUp,
    Clock,
    Navigation,
    // Download,
    // Share2,
    // Mail,
    Play,
} from "lucide-react"
import Map, { Source, Layer, Marker } from "@vis.gl/react-maplibre"
import { useRoute } from "../api/useRoutes"
import { getBoundsFromCoords } from "../../../lib/geo"

const MAP_STYLE =
    "https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"

const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

const getInitials = (name: string) =>
    name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

const RouteDetailsPage = () => {
    const { id } = useParams()
    const { data: route, isLoading, isError } = useRoute(id!)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4">
                        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="font-heading text-xl text-zinc-600">
                        LOADING ROUTE...
                    </p>
                </div>
            </div>
        )
    }

    if (isError || !route) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                        <MapPin className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="font-display text-4xl text-zinc-900 mb-2">
                        Route Not Found
                    </h1>
                    <p className="font-body text-base text-zinc-600 mb-6">
                        The route you're looking for doesn't exist or has been
                        removed.
                    </p>
                    <Link
                        to="/dashboard/routes"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-lg rounded-lg hover:shadow-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        BACK TO ROUTES
                    </Link>
                </div>
            </div>
        )
    }

    const coords = route.geojson.features?.[0]?.geometry?.coordinates ?? []
    let flatCoords: [number, number][] = []

    if (Array.isArray(coords[0])) {
        flatCoords = coords as [number, number][]
    }

    const firstCoord: [number, number] = flatCoords[0] ?? [0, 0]
    const lastCoord: [number, number] = flatCoords[flatCoords.length - 1] ?? [
        0, 0,
    ]

    // const lineData = {
    //     type: "Feature",
    //     properties: {},
    //     geometry: {
    //         type: "LineString",
    //         coordinates: flatCoords,
    //     },
    // } as const

    const estimatedMinutes = Math.ceil((route.distance ?? 0) * 5)
    const hours = Math.floor(estimatedMinutes / 60)
    const minutes = estimatedMinutes % 60
    const estimatedTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    const avgPace = route.distance
        ? `${(estimatedMinutes / route.distance).toFixed(2)} min/km`
        : "—"

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

                .fade-in-delay-2 {
                    animation: fadeIn 0.6s ease-out 0.4s both;
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

                .stat-card {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(8, 145, 178, 0.15);
                }

                .map-container {
                    transition: border-color 0.3s ease;
                }

                .map-container:hover {
                    border-color: rgb(8, 145, 178);
                }
            `}</style>

            <div className="bg-white border-b-2 border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between fade-in">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/dashboard/routes"
                                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-zinc-600" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-green-600 flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <h1 className="font-display text-4xl text-zinc-900">
                                        {route.name || "Route Details"}
                                    </h1>
                                </div>
                                <p className="font-body text-base text-zinc-600 ml-13">
                                    Explore this route and start planning your
                                    next run
                                </p>
                            </div>
                        </div>

                        {/* <div className="flex gap-3">
                            <button className="px-6 py-3 border-2 border-gray-300 rounded-lg font-heading text-base text-zinc-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <Share2 className="w-5 h-5" />
                                SHARE
                            </button>
                            <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-base rounded-lg hover:shadow-xl transition-all flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                DOWNLOAD GPX
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 fade-in-delay-1">
                    <div className="stat-card bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm text-center">
                        <TrendingUp className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1 uppercase tracking-wider">
                            Distance
                        </div>
                        <div className="font-display text-4xl text-zinc-900">
                            {route.distance?.toFixed(2)}
                        </div>
                        <div className="font-body text-sm text-zinc-500">
                            km
                        </div>
                    </div>

                    <div className="stat-card bg-white rounded-lg border-2 border-green-200 p-6 shadow-sm text-center">
                        <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1 uppercase tracking-wider">
                            Est. Time
                        </div>
                        <div className="font-display text-4xl text-green-600">
                            {estimatedTime}
                        </div>
                        <div className="font-body text-sm text-zinc-500">
                            at 5:00/km
                        </div>
                    </div>

                    <div className="stat-card bg-white rounded-lg border-2 border-purple-200 p-6 shadow-sm text-center">
                        <Navigation className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1 uppercase tracking-wider">
                            Avg Pace
                        </div>
                        <div className="font-display text-3xl text-purple-600">
                            {avgPace}
                        </div>
                        <div className="font-body text-sm text-zinc-500">
                            min/km
                        </div>
                    </div>

                    <div className="stat-card bg-white rounded-lg border-2 border-orange-200 p-6 shadow-sm text-center">
                        <Flag className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1 uppercase tracking-wider">
                            Elevation
                        </div>
                        <div className="font-display text-4xl text-orange-600">
                            —
                        </div>
                        <div className="font-body text-sm text-zinc-500">
                            meters
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 fade-in-delay-2">
                        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm map-container sticky top-24">
                            <div className="border-b-2 border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-6 h-6 text-cyan-600" />
                                    <h2 className="font-heading text-2xl text-zinc-900">
                                        ROUTE MAP
                                    </h2>
                                </div>
                                <p className="font-body text-sm text-zinc-600 mt-1">
                                    Interactive view of the race route
                                </p>
                            </div>

                            <div className="relative h-[500px]">
                                <Map
                                    style={{ width: "100%", height: "100%" }}
                                    mapStyle={MAP_STYLE}
                                    onLoad={(e) => {
                                        if (flatCoords.length > 1) {
                                            const bounds =
                                                getBoundsFromCoords(flatCoords)
                                            e.target.fitBounds(bounds, {
                                                padding: 60,
                                                duration: 800,
                                            })
                                        }
                                    }}
                                    attributionControl={false}
                                >
                                    <Source
                                        id="route"
                                        type="geojson"
                                        data={{
                                            type: "Feature",
                                            geometry: {
                                                type: "LineString",
                                                coordinates: coords,
                                            },
                                            properties: {},
                                        }}
                                    >
                                        <Layer
                                            id="race-line-outline"
                                            type="line"
                                            paint={{
                                                "line-color": "#ffffff",
                                                "line-width": 10,
                                                "line-opacity": 1,
                                            }}
                                        />

                                        <Layer
                                            id="race-line"
                                            type="line"
                                            paint={{
                                                "line-color": "#F97316",
                                                "line-width": 5,
                                                "line-opacity": 0.95,
                                            }}
                                        />
                                    </Source>

                                    <Marker
                                        longitude={firstCoord[0]}
                                        latitude={firstCoord[1]}
                                        anchor="center"
                                    >
                                        <div className="p-2 bg-green-600 rounded-full shadow-lg text-white">
                                            <Play size={18} />
                                        </div>
                                    </Marker>

                                    <Marker
                                        longitude={lastCoord[0]}
                                        latitude={lastCoord[1]}
                                        anchor="center"
                                    >
                                        <div className="p-2 bg-red-600 rounded-full shadow-lg text-white">
                                            <Flag size={18} />
                                        </div>
                                    </Marker>
                                </Map>
                            </div>

                            {/* Map Legend */}
                            <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200">
                                <div className="flex items-center justify-around text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-600 rounded-full border-2 border-white shadow"></div>
                                        <span className="font-body text-zinc-700">
                                            Start Point
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-1 bg-orange-600 rounded"></div>
                                        <span className="font-body text-zinc-700">
                                            Route Path
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow"></div>
                                        <span className="font-body text-zinc-700">
                                            Finish Point
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="fade-in-delay-2 bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
                                <h3 className="font-heading text-xl text-zinc-900 uppercase tracking-wider">
                                    ROUTE INFORMATION
                                </h3>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between py-3 border-b-2 border-gray-200">
                                    <span className="font-body text-sm text-zinc-600 font-semibold">
                                        Route ID
                                    </span>
                                    <span className="font-mono text-sm font-bold text-cyan-600">
                                        #{route.id.slice(0, 8).toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex items-start justify-between py-3 border-b-2 border-gray-200">
                                    <span className="font-body text-sm text-zinc-600 font-semibold">
                                        Distance
                                    </span>
                                    <span className="font-display text-2xl text-zinc-900">
                                        {route.distance?.toFixed(2)} km
                                    </span>
                                </div>

                                <div className="flex items-start justify-between py-3 border-b-2 border-gray-200">
                                    <span className="font-body text-sm text-zinc-600 font-semibold">
                                        Est. Duration
                                    </span>
                                    <span className="font-display text-2xl text-green-600">
                                        {estimatedTime}
                                    </span>
                                </div>

                                <div className="py-3 border-b-2 border-gray-200">
                                    <div className="flex items-start gap-3 mb-2">
                                        <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="font-body text-sm text-zinc-600 font-semibold block mb-1">
                                                Start Address
                                            </span>
                                            <span className="font-body text-sm text-zinc-900">
                                                {route.start_address ||
                                                    "Not specified"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-3">
                                    <div className="flex items-start gap-3">
                                        <Flag className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="font-body text-sm text-zinc-600 font-semibold block mb-1">
                                                End Address
                                            </span>
                                            <span className="font-body text-sm text-zinc-900">
                                                {route.end_address ||
                                                    "Not specified"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="fade-in-delay-2 bg-white rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
                                <h3 className="font-heading text-xl text-zinc-900 uppercase tracking-wider">
                                    CREATED BY
                                </h3>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-green-600 flex items-center justify-center text-white text-xl font-heading shadow-lg flex-shrink-0">
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
                                        <Link
                                            to={`/dashboard/profile/${route.users?.id}`}
                                        >
                                            <p className="font-display text-xl text-zinc-900 mb-1 hover:text-cyan-600">
                                                {route.users?.full_name ??
                                                    "Unknown User"}
                                            </p>
                                        </Link>
                                        {/* <div className="flex items-center gap-2 text-zinc-600">
                                            <Mail className="w-4 h-4" />
                                            <p className="font-body text-sm truncate">
                                                {route.users?.email ||
                                                    "No email"}
                                            </p>
                                        </div> */}
                                    </div>
                                </div>

                                <div className="pt-4 border-t-2 border-gray-200">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-5 h-5 text-cyan-600" />
                                        </div>
                                        <div>
                                            <p className="font-body text-xs text-zinc-500 uppercase tracking-wider">
                                                Created on
                                            </p>
                                            <p className="font-body text-sm font-semibold text-zinc-900">
                                                {formatDate(route.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <div className="fade-in-delay-2 bg-white rounded-lg border-2 border-gray-200 shadow-sm p-6">
                            <h3 className="font-heading text-xl text-zinc-900 uppercase tracking-wider mb-4">
                                QUICK ACTIONS
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-base rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    CREATE RACE WITH THIS ROUTE
                                </button>
                                <button className="w-full py-3 border-2 border-gray-300 rounded-lg font-heading text-base text-zinc-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    DOWNLOAD GPX
                                </button>
                                <button className="w-full py-3 border-2 border-gray-300 rounded-lg font-heading text-base text-zinc-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    SHARE ROUTE
                                </button>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RouteDetailsPage
