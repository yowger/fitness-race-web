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
    CheckCircle2,
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

    const startAddress = race?.routes?.start_address
    const endAddress = race?.routes?.end_address
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <Link
                            to="/dashboard/races"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft size={18} />
                            Back to Races
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Hero Section */}
                    <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                                            race.status === "upcoming"
                                                ? "bg-blue-600 text-white"
                                                : race.status === "ongoing"
                                                ? "bg-green-600 text-white"
                                                : "bg-gray-600 text-white"
                                        }`}
                                    >
                                        {race.status}
                                    </span>
                                    {isHost && (
                                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide bg-purple-600 text-white flex items-center gap-1.5">
                                            <User size={14} />
                                            Host
                                        </span>
                                    )}
                                    {hasJoined && !isHost && (
                                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide bg-emerald-600 text-white flex items-center gap-1.5">
                                            <CheckCircle2 size={14} />
                                            Joined
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                                    {race.name}
                                </h1>
                                {race.description && (
                                    <p className="text-base text-gray-600 mb-6 max-w-2xl">
                                        {race.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-5">
                                    <div className="flex items-center gap-2.5 text-gray-700">
                                        <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Date
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {formatDate(race.start_time)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-gray-700">
                                        <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Start Time
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {formatTime(race.start_time)}
                                            </p>
                                        </div>
                                    </div>
                                    {race.created_by_user && (
                                        <div className="flex items-center gap-2.5 text-gray-700">
                                            <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Host
                                                </p>
                                                <p className="text-sm font-semibold">
                                                    {
                                                        race.created_by_user
                                                            .full_name
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 lg:items-end">
                                {!isHost && (
                                    <>
                                        {hasJoined ? (
                                            <button
                                                onClick={handleLeaveRace}
                                                disabled={
                                                    removeParticipantMutation.isPending
                                                }
                                                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                                                className={`px-6 py-3 text-white font-semibold rounded-lg transition-all text-sm
                                                ${
                                                    race.status === "upcoming"
                                                        ? "bg-blue-600 hover:bg-blue-700"
                                                        : "bg-gray-400 cursor-not-allowed"
                                                }`}
                                            >
                                                {isJoining
                                                    ? "Joining..."
                                                    : "Join Race"}
                                            </button>
                                        )}
                                    </>
                                )}

                                {race.max_participants && (
                                    <div className="text-center lg:text-right">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {participantCount}/
                                            {race.max_participants}
                                        </p>
                                        <p className="text-xs text-gray-600 font-medium">
                                            {spotsLeft}{" "}
                                            {spotsLeft === 1 ? "spot" : "spots"}{" "}
                                            left
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="border-b border-gray-200">
                        <div className="relative h-[450px]">
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
                                    <MapPin className="w-16 h-16 text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">
                                        No route available
                                    </p>
                                </div>
                            )}
                        </div>
                        {flatCoords.length > 0 && (
                            <div className="px-8 py-4 bg-gray-50 flex items-center justify-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        Start Point
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        Finish Point
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Route Information */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                    <Route className="w-5 h-5 text-blue-600" />
                                    Route Information
                                </h3>
                                <div className="space-y-4">
                                    {race.routes?.name && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                                <Flag className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 font-medium mb-1">
                                                    Route Name
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {race.routes.name}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {race.routes?.distance !== undefined && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                                                <Route className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 font-medium mb-1">
                                                    Distance
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {Math.round(
                                                        race.routes.distance *
                                                            100
                                                    ) / 100}{" "}
                                                    km
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {startAddress && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                                <MapPin className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 font-medium mb-1">
                                                    Start Location
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 break-words">
                                                    {startAddress}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {endAddress && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                                <MapPin className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 font-medium mb-1">
                                                    Finish Location
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 break-words">
                                                    {endAddress}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {race.end_time && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                                <Clock className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 font-medium mb-1">
                                                    End Time
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatTime(race.end_time)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Participants */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    Participants ({participantCount})
                                </h3>

                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {race.participants &&
                                    race.participants.length > 0 ? (
                                        race.participants.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                    {p.user.avatar_url ? (
                                                        <img
                                                            src={
                                                                p.user
                                                                    .avatar_url
                                                            }
                                                            alt={
                                                                p.user.full_name
                                                            }
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        getInitials(
                                                            p.user.full_name ||
                                                                ""
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
                                        <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-600 text-sm font-medium">
                                                No participants yet
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Be the first to join this race!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RaceDetailPage
