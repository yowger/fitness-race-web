import { useParams, Link } from "react-router-dom"
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Users,
    Clock,
    User,
    Flag,
    Route,
} from "lucide-react"
import Map, { Source, Layer } from "@vis.gl/react-maplibre"
import {
    useAddParticipant,
    useRace,
    useRemoveParticipant,
} from "../hooks/useRaces"
import { format } from "date-fns"
import { useState } from "react"
import { useUser } from "../../auth/hooks/useUser"
import { toast } from "sonner"

const MAP_STYLE =
    "https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"

const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return format(new Date(dateString), "MMM d, yyyy")
}

const formatTime = (dateString?: string) => {
    if (!dateString) return ""
    return format(new Date(dateString), "h:mm a")
}

const getInitials = (name: string) =>
    name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

const RaceDetailPage = () => {
    const { data: user } = useUser()
    const { id } = useParams()
    const {
        data: race,
        isLoading,
        isError,
        refetch: refetchRace,
    } = useRace(id!)
    const [isJoining, setIsJoining] = useState(false)
    const isHost = race?.created_by_user?.id === user?.id
    const hasJoined = race?.participants?.some((p) => p.user.id === user?.id)

    const addParticipantMutation = useAddParticipant()
    const removeParticipantMutation = useRemoveParticipant()

    const handleJoinRace = async () => {
        if (!race || !user) return

        setIsJoining(true)

        try {
            await addParticipantMutation.mutateAsync({
                race_id: race.id,
                user_id: user.id,
            })

            refetchRace()

            toast.success("Successfully joined the race!")
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message || "Failed to join race.")
            }
        } finally {
            setIsJoining(false)
        }
    }

    const handleLeaveRace = async () => {
        if (!race || !user) return

        try {
            await removeParticipantMutation.mutateAsync({
                race_id: race.id,
                user_id: user.id,
            })

            refetchRace()

            toast.success("You left the race")
        } catch (err) {
            if (err instanceof Error) toast.error(err.message)
        }
    }

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">
                        Loading race details...
                    </p>
                </div>
            </div>
        )

    if (isError || !race)
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Race not found</p>
                </div>
            </div>
        )

    const coords =
        race.routes?.geojson.features?.[0]?.geometry?.coordinates ?? []
    let flatCoords: [number, number][] = []

    if (Array.isArray(coords[0])) {
        flatCoords = coords as [number, number][]
    }

    const firstCoord: [number, number] = flatCoords[0] ?? [0, 0]
    const lastCoord: [number, number] = flatCoords[flatCoords.length - 1] ?? [
        0, 0,
    ]

    const lineData = {
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: flatCoords,
        },
    } as const

    const participantCount = race.participants?.length ?? 0
    const spotsLeft = race.max_participants
        ? race.max_participants - participantCount
        : null

    return (
        <div className="min-h-screen">
            <div className="bg-white border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <Link
                        to="/dashboard/races"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Races</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                    {race.name}
                                </h1>

                                <div className="flex items-center gap-2 mb-2">
                                    <Flag className="w-5 h-5 text-blue-600" />
                                    <span
                                        className={`px-2 py-1 rounded-full text-sm font-semibold ${
                                            race.status === "upcoming"
                                                ? "bg-blue-100 text-blue-800"
                                                : race.status === "ongoing"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {race.status.toUpperCase()}
                                    </span>
                                </div>

                                {race.description && (
                                    <p className="text-lg text-gray-600 mb-6">
                                        {race.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium">
                                            {formatDate(race.start_time)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium">
                                            {formatTime(race.start_time)}
                                        </span>
                                    </div>
                                    {race.created_by_user && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <User className="w-5 h-5 text-blue-600" />
                                            <span className="font-medium">
                                                Hosted by{" "}
                                                {race.created_by_user.full_name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 items-center">
                                {isHost ? (
                                    <span className="inline-flex ...">
                                        You are the host
                                    </span>
                                ) : hasJoined ? (
                                    <button
                                        onClick={handleLeaveRace}
                                        disabled={
                                            removeParticipantMutation.isPending
                                        }
                                        className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg shadow-gray-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {removeParticipantMutation.isPending
                                            ? "Leaving..."
                                            : "Leave Race"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleJoinRace}
                                        disabled={
                                            isJoining ||
                                            race.status !== "upcoming"
                                        }
                                        className={`px-8 py-4 text-white font-semibold rounded-xl shadow-lg transition-all
            ${
                race.status === "upcoming"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                    : "bg-gray-400 cursor-not-allowed shadow-none"
            }`}
                                    >
                                        {isJoining ? "Joining..." : "Join Race"}
                                    </button>
                                )}

                                {spotsLeft !== null && (
                                    <p className="text-sm text-center text-gray-500">
                                        {spotsLeft}{" "}
                                        {spotsLeft === 1 ? "spot" : "spots"}{" "}
                                        remaining
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Race Route
                                </h2>
                            </div>
                            <div className="relative h-[500px]">
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
                                            zoom: 14,
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
                                                    "line-width": 5,
                                                    "line-opacity": 0.8,
                                                }}
                                            />
                                        </Source>

                                        <Source
                                            id="start-point"
                                            type="geojson"
                                            data={{
                                                type: "Feature",
                                                geometry: {
                                                    type: "Point",
                                                    coordinates: firstCoord,
                                                },
                                                properties: {},
                                            }}
                                        >
                                            <Layer
                                                id="start-circle"
                                                type="circle"
                                                paint={{
                                                    "circle-radius": 10,
                                                    "circle-color": "#10B981",
                                                    "circle-stroke-width": 3,
                                                    "circle-stroke-color":
                                                        "#ffffff",
                                                }}
                                            />
                                        </Source>

                                        <Source
                                            id="end-point"
                                            type="geojson"
                                            data={{
                                                type: "Feature",
                                                geometry: {
                                                    type: "Point",
                                                    coordinates: lastCoord,
                                                },
                                                properties: {},
                                            }}
                                        >
                                            <Layer
                                                id="end-circle"
                                                type="circle"
                                                paint={{
                                                    "circle-radius": 10,
                                                    "circle-color": "#EF4444",
                                                    "circle-stroke-width": 3,
                                                    "circle-stroke-color":
                                                        "#ffffff",
                                                }}
                                            />
                                        </Source>
                                    </Map>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                                        <MapPin className="w-20 h-20 text-gray-300 mb-4" />
                                        <p className="text-gray-500 font-medium">
                                            No route available
                                        </p>
                                    </div>
                                )}
                            </div>
                            {flatCoords.length > 0 && (
                                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                        <span className="text-sm font-medium text-gray-700">
                                            Start Point
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                        <span className="text-sm font-medium text-gray-700">
                                            Finish Point
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Flag className="w-5 h-5 text-blue-600" />
                                Race Statistics
                            </h2>
                            <div className="space-y-4">
                                {race.max_participants && (
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Participants
                                                </p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {participantCount} /{" "}
                                                    {race.max_participants}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {race.routes?.name && (
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                                <Route className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Route Name
                                                </p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {race.routes.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {race.end_time && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    End Time
                                                </p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {formatTime(race.end_time)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Participants ({participantCount})
                            </h2>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {race.participants &&
                                race.participants.length > 0 ? (
                                    race.participants.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                                                {p.user.avatar_url ? (
                                                    <img
                                                        src={p.user.avatar_url}
                                                        alt={p.user.full_name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    getInitials(
                                                        p.user.full_name || ""
                                                    )
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {p.user.full_name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {p.user.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">
                                            No participants yet
                                        </p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            Be the first to join!
                                        </p>
                                    </div>
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
