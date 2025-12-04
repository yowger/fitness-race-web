import { useParams, Link } from "react-router-dom"
import { ArrowLeft, MapPin } from "lucide-react"
import Map, { Source, Layer } from "@vis.gl/react-maplibre"
import { useRace } from "../hooks/useRaces"
import { format } from "date-fns"

const MAP_STYLE =
    "https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"

const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return format(new Date(dateString), "MMM d, yyyy h:mm a")
}

const getInitials = (name: string) =>
    name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

const RaceDetailPage = () => {
    const { id } = useParams()
    const { data: race, isLoading, isError } = useRace(id!)

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-slate-600">Loading race...</div>
            </div>
        )

    if (isError || !race)
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-slate-600">Race not found.</div>
            </div>
        )

    const coords =
        race.routes?.geojson.features?.[0]?.geometry?.coordinates ?? []
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
            coordinates:
                race.routes?.geojson.features?.[0]?.geometry?.coordinates ?? [],
        },
    } as const

    return (
        <div className="min-h-screen">
            <div className="px-6 py-4">
                <Link
                    to="/dashboard/races"
                    className="p-2 rounded-xl transition-colors hover:bg-gray-100"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 sticky top-24">
                            <div className="relative h-96 lg:h-[500px]">
                                {flatCoords.length > 0 ? (
                                    <Map
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                        }}
                                        mapStyle={MAP_STYLE}
                                        attributionControl={false}
                                        initialViewState={{
                                            latitude: firstCoord[1],
                                            longitude: firstCoord[0],
                                            zoom: 13,
                                        }}
                                    >
                                        <Source
                                            id="race-route"
                                            type="geojson"
                                            data={lineData}
                                        >
                                            <Layer
                                                id="race-line"
                                                type="line"
                                                paint={{
                                                    "line-color": "#2563EB",
                                                    "line-width": 4,
                                                }}
                                            />
                                        </Source>
                                    </Map>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <MapPin className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Race Info
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
                                    <span className="text-sm text-blue-900 font-medium">
                                        Name
                                    </span>
                                    <span className="text-lg font-semibold text-blue-900">
                                        {race.name}
                                    </span>
                                </div>

                                {race.description && (
                                    <div className="p-3 rounded-xl bg-gray-50">
                                        <span className="text-sm text-gray-900 font-medium">
                                            Description
                                        </span>
                                        <p className="mt-1 text-gray-700 text-sm">
                                            {race.description}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                                    <span className="text-sm text-green-900 font-medium">
                                        Start Time
                                    </span>
                                    <span className="text-lg font-semibold text-green-900">
                                        {formatDate(race.start_time)}
                                    </span>
                                </div>

                                {race.end_time && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50">
                                        <span className="text-sm text-yellow-900 font-medium">
                                            End Time
                                        </span>
                                        <span className="text-lg font-semibold text-yellow-900">
                                            {formatDate(race.end_time)}
                                        </span>
                                    </div>
                                )}

                                {race.max_participants && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50">
                                        <span className="text-sm text-purple-900 font-medium">
                                            Max Participants
                                        </span>
                                        <span className="text-lg font-semibold text-purple-900">
                                            {race.max_participants}
                                        </span>
                                    </div>
                                )}

                                {race.routes?.name && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50">
                                        <span className="text-sm text-indigo-900 font-medium">
                                            Route
                                        </span>
                                        <span className="text-lg font-semibold text-indigo-900">
                                            {race.routes.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                Participants ({race.participants?.length ?? 0})
                            </h3>

                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {race.participants?.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-white">
                                            {p.avatar_url ? (
                                                <img
                                                    src={p.avatar_url}
                                                    alt={p.full_name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                getInitials(p.full_name || "")
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {p.full_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {p.email}
                                            </p>
                                        </div>
                                    </div>
                                )) || (
                                    <p className="text-gray-500 text-sm">
                                        No participants yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RaceDetailPage
