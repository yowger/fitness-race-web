import React from "react"
import { useParams, Link } from "react-router-dom"
import {
    MapPin,
    Calendar,
    Ruler,
    ArrowLeft,
    User,
    Navigation,
} from "lucide-react"
import { useRoute } from "../api/useRoutes"
import Map, { Source, Layer } from "@vis.gl/react-maplibre"

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
            <div className="flex items-center justify-center h-screen">
                <div className="text-slate-600">Loading route...</div>
            </div>
        )
    }

    if (isError || !route) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-slate-600">Route not found.</div>
            </div>
        )
    }

    const coords = route.geojson.features?.[0]?.geometry?.coordinates ?? []
    let flatCoords: [number, number][] = []

    if (Array.isArray(coords[0])) {
        flatCoords = coords as [number, number][]
    }

    const firstCoord: [number, number] = flatCoords[0] ?? [0, 0]

    const lineData = {
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: route.geojson.features?.[0]?.geometry?.coordinates,
        },
    } as const

    return (
        <div className="min-h-screen">
            <div className="px-6">
                <Link
                    to="/dashboard/routes"
                    className="p-2 rounded-xl transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 sticky top-24">
                            <div className="relative">
                                <Map
                                    style={{ width: "100%", height: "500px" }}
                                    mapStyle={MAP_STYLE}
                                    attributionControl={false}
                                    initialViewState={{
                                        latitude: firstCoord[1] as number,
                                        longitude: firstCoord[0] as number,
                                        zoom: 13.5,
                                    }}
                                >
                                    <Source
                                        id="route"
                                        type="geojson"
                                        data={lineData}
                                    >
                                        <Layer
                                            id="route-line"
                                            type="line"
                                            paint={{
                                                "line-color": "#2563EB",
                                                "line-width": 4,
                                            }}
                                        />
                                    </Source>
                                </Map>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Created By
                            </h3>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                                    {route.users?.avatar_url ? (
                                        <img
                                            src={route.users.avatar_url}
                                            alt={route.users.full_name}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        getInitials(
                                            route.users?.full_name ?? "Unknown"
                                        )
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-semibold text-slate-900">
                                        {route.users?.full_name ?? "Unknown"}
                                    </p>
                                    <p className="text-sm text-slate-600 truncate">
                                        {route.users?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Calendar
                                        size={16}
                                        className="text-slate-500"
                                    />
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Created on
                                        </p>
                                        <p className="text-sm font-medium text-slate-900">
                                            {formatDate(route.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Route Info
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
                                    <span className="text-sm text-blue-900 font-medium">
                                        Distance
                                    </span>
                                    <span className="text-lg font-semibold text-blue-900">
                                        {route.distance?.toFixed(2)} km
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50">
                                    <span className="text-sm text-purple-900 font-medium">
                                        Est. Duration
                                    </span>
                                    <span className="text-lg font-semibold text-purple-900">
                                        {Math.ceil((route.distance ?? 0) * 15)}
                                        min
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                                    <span className="text-sm text-green-900 font-medium">
                                        Checkpoints
                                    </span>
                                    <span className="text-lg font-semibold text-green-900">
                                        {Math.ceil((route.distance ?? 0) * 3)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RouteDetailsPage
