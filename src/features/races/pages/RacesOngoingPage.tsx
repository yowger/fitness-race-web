import Map, { Layer, Marker, Source } from "@vis.gl/react-maplibre"
import {
    Users,
    Clock,
    TrendingUp,
    Zap,
    Activity,
    Target,
    StopCircle,
    Download,
    Play,
    Flag,
    MapPin,
    User,
    Eye,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useEndRace, useRace, useStartRace } from "../hooks/useRaces"
import { useUser } from "../../auth/hooks/useUser"
import { io, type Socket } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_PUBLIC_SOCKET_URL

type OnlineUser = {
    userId: string
    socketId: string
    role: "admin" | "racer" | "guest"
    coords?: [number, number]
    speed?: number
    lastUpdate?: number
    distance?: number
    finished?: boolean
}

type RacerPosition = {
    coords: [number, number]
    lastUpdate: number
    speed: number
    distance: number
}

function formatElapsedTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0")
    const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0")
    const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0")

    return `${h}:${m}:${s}`
}

export default function RacesOngoingPage() {
    const [socket, setSocket] = useState<Socket | null>(null)

    const { id } = useParams()
    const { data: user } = useUser()
    const { data: liveRace, refetch: refetchLiveRace } = useRace(id!)
    const [racerPositions, setRacerPositions] = useState<
        Record<string, RacerPosition>
    >({})

    const isRacer = liveRace?.participants?.some((p) => p.user.id === user?.id)
    const coords =
        liveRace?.routes?.geojson.features?.[0]?.geometry?.coordinates ?? []
    let flatCoords: [number, number][] = []

    if (Array.isArray(coords[0])) {
        flatCoords = coords as [number, number][]
    }

    const firstCoord: [number, number] = flatCoords[0] ?? [0, 0]
    const lastCoord: [number, number] = flatCoords[flatCoords.length - 1] ?? [
        0, 0,
    ]

    const isHost = liveRace?.created_by_user?.id === user?.id

    const startRace = useStartRace()
    const endRace = useEndRace()

    const [elapsedTime, setElapsedTime] = useState("00:00:00")

    useEffect(() => {
        const s = io(SOCKET_URL)
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if (!isRacer) return
        console.log("Setting up geolocation watchPosition")
        if (!socket || !user || !id) return
        console.log("Geolocation tracking started for user:", user.id)
        if (!("geolocation" in navigator)) return
        console.log("Geolocation is available")

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                console.log("Emitting participantUpdate:", {
                    userId: user.id,
                    raceId: id,
                    coords: [pos.coords.longitude, pos.coords.latitude],
                })

                socket.emit("participantUpdate", {
                    userId: user.id,
                    raceId: id,
                    coords: [pos.coords.longitude, pos.coords.latitude],
                    speed: pos.coords.speed ?? 0,
                    timestamp: Date.now(),
                })
            },
            (err) => console.error(err),
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 5000,
            }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [socket, user, id, isRacer])

    useEffect(() => {
        if (!liveRace?.actual_start_time) return

        const start = new Date(liveRace.actual_start_time + "Z").getTime()

        const update = () => {
            const now = Date.now()
            const diff = (now - start) / 1000
            setElapsedTime(formatElapsedTime(diff))
        }

        update()

        let interval: NodeJS.Timeout | null = null

        if (liveRace.status === "ongoing") {
            interval = setInterval(update, 1000)
        }

        if (liveRace.status === "finished" && liveRace.actual_end_time) {
            const end = new Date(liveRace.actual_end_time + "Z").getTime()
            const diff = (end - start) / 1000
            setElapsedTime(formatElapsedTime(diff))
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [
        liveRace?.status,
        liveRace?.actual_start_time,
        liveRace?.actual_end_time,
    ])

    async function handleStartRace() {
        if (!id || !socket) return

        try {
            const response = await startRace.mutateAsync(id)

            socket.emit("race-started", {
                raceId: id,
                actualStartTime: response.actual_start_time,
            })

            console.log("Race started:", response)
        } catch (err) {
            console.error("Start race error", err)
        }
    }

    async function handleEndRace() {
        if (!id || !socket) return

        try {
            const response = await endRace.mutateAsync(id)

            socket.emit("race-ended", {
                raceId: id,
                actualEndTime: response.actual_end_time,
            })

            console.log("Race ended:", response)
        } catch (err) {
            console.log("🚀 ~ handleEndRace ~ err:", err)
            console.error("End race error", err)
        }
    }

    const getInitials = (name: string) =>
        name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()

    const getPositionColor = (position: number) => {
        if (position === 1) return "from-yellow-400 to-yellow-600"
        if (position === 2) return "from-gray-300 to-gray-500"
        if (position === 3) return "from-orange-400 to-orange-600"
        return "from-blue-500 to-blue-600"
    }

    const getPositionBadge = (position: number) => {
        if (position === 1) return "🥇"
        if (position === 2) return "🥈"
        if (position === 3) return "🥉"
        return `#${position}`
    }

    const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({})
    const [onlineAdmins, setOnlineAdmins] = useState<string[]>([])
    const [onlineRacers, setOnlineRacers] = useState<string[]>([])
    const [onlineGuests, setOnlineGuests] = useState<string[]>([])

    useEffect(() => {
        if (!id || !user || !socket) return

        socket.emit("joinRace", { raceId: id, userId: user.id })

        socket.on("onlineParticipants", (participants: OnlineUser[]) => {
            const map: Record<string, boolean> = {}
            const admins: string[] = []
            const racers: string[] = []
            const guests: string[] = []

            const unique = Array.from(
                new window.Map(
                    participants.map(
                        (p) => [p.userId, p] as [string, OnlineUser]
                    )
                ).values()
            )

            unique.forEach((p) => {
                map[p.userId] = true

                if (p.role === "admin") admins.push(p.userId)
                else if (p.role === "racer") racers.push(p.userId)
                else if (p.role === "guest") guests.push(p.userId)
            })

            setOnlineMap(map)
            setOnlineAdmins(admins)
            setOnlineRacers(racers)
            setOnlineGuests(guests)
        })

        socket.on(
            "participantUpdate",
            (update: {
                userId: string
                coords: [number, number]
                timestamp: number
                speed?: number
                distance?: number
            }) => {
                setRacerPositions((prev) => ({
                    ...prev,
                    [update.userId]: {
                        coords: update.coords,
                        lastUpdate: update.timestamp,
                        speed: update.speed ?? 0,
                        distance: update.distance ?? 0,
                    },
                }))
            }
        )

        socket.on("raceStatusUpdate", () => {
            refetchLiveRace?.()
        })

        return () => {
            socket.emit("leaveRace", { raceId: id, userId: user.id })
            socket.off("onlineParticipants")
            socket.off("participantUpdate")
            socket.off("raceStatusUpdate")
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket])

    const liveLeaderboard = (liveRace?.participants || [])
        .map((p) => {
            const update = racerPositions[p.user.id]
            return {
                id: p.id,
                name: p.user.full_name,
                bib: p.bib_number,
                distanceCovered: update?.distance ?? 0,
                position: 0,
                pace: update?.speed
                    ? `${(60 / update.speed).toFixed(2)} min/km`
                    : "–",
                avatar: p.user.avatar_url,
            }
        })
        .sort((a, b) => (b.distanceCovered || 0) - (a.distanceCovered || 0))
        .map((p, index) => ({ ...p, position: index + 1 }))

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                {liveRace?.status === "ongoing" && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full animate-pulse">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                        <span className="text-xs font-bold uppercase">
                                            Live
                                        </span>
                                    </div>
                                )}

                                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold uppercase">
                                    {liveRace?.status}
                                </span>

                                {onlineGuests.length +
                                    onlineAdmins.length +
                                    onlineRacers.length && (
                                    <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/80 rounded-full text-xs font-bold text-white">
                                        <Eye size={12} />{" "}
                                        {onlineGuests.length +
                                            onlineAdmins.length +
                                            onlineRacers.length}{" "}
                                        <span>watching</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-4xl font-bold mb-4">
                                {liveRace?.name}
                            </h1>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-100 font-medium">
                                            Elapsed Time
                                        </p>
                                        <p className="text-lg font-bold">
                                            {elapsedTime}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-100 font-medium">
                                            Total Distance
                                        </p>
                                        <p className="text-lg font-bold">
                                            {liveRace?.routes?.distance?.toFixed(
                                                2
                                            )}{" "}
                                            km
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-100 font-medium">
                                            Total Participants
                                        </p>
                                        <p className="text-lg font-bold">
                                            {liveRace?.participants?.length ||
                                                0}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-100 font-medium">
                                            Active Racers
                                        </p>
                                        <p className="text-lg font-bold">
                                            {onlineRacers.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isHost && (
                            <div className="flex flex-col gap-3 lg:items-end">
                                <div className="flex gap-2">
                                    {liveRace?.status === "upcoming" && (
                                        <button
                                            onClick={handleStartRace}
                                            className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg"
                                        >
                                            <Play size={16} />
                                            Start Race
                                        </button>
                                    )}

                                    {liveRace?.status === "ongoing" && (
                                        <button
                                            onClick={handleEndRace}
                                            className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg"
                                        >
                                            <StopCircle size={16} />
                                            End Race
                                        </button>
                                    )}

                                    {liveRace?.status === "finished" && (
                                        <Link
                                            to={`/dashboard/races/${liveRace?.id}/results`}
                                        >
                                            <button className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 border border-white/30">
                                                <Download size={16} />
                                                {/* Export Data */}
                                                Edit Results
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        Live Race Map
                                    </h2>
                                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors">
                                        Full Screen
                                    </button>
                                </div>
                            </div>
                            <div className="relative h-[400px] bg-gray-100">
                                <Map
                                    mapStyle="https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"
                                    initialViewState={{
                                        longitude: 125.6128,
                                        latitude: 7.0731,
                                        zoom: 14,
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
                                            id="route-line"
                                            type="line"
                                            paint={{
                                                "line-color": "#3b82f6",
                                                "line-width": 4,
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

                                    {Object.entries(racerPositions).map(
                                        ([userId, data]) => {
                                            const isOnline =
                                                !!onlineMap[userId] &&
                                                Date.now() - data.lastUpdate <
                                                    10_000

                                            return (
                                                <Marker
                                                    key={userId}
                                                    longitude={data.coords[0]}
                                                    latitude={data.coords[1]}
                                                    anchor="center"
                                                >
                                                    <div
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                                                            isOnline
                                                                ? "bg-green-500"
                                                                : "bg-gray-400"
                                                        }`}
                                                    >
                                                        {userId.slice(-2)}
                                                    </div>
                                                </Marker>
                                            )
                                        }
                                    )}
                                </Map>

                                {/* <div className="absolute top-4 right-4 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                                    <p className="text-xs text-gray-500 font-medium">
                                        Real-time tracking
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        Updates every 5s
                                    </p>
                                </div> */}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    Live Leaderboard
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {liveLeaderboard.map((participant, index) => (
                                    <div
                                        key={participant.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${
                                            index < 3
                                                ? "bg-linear-to-r from-yellow-50/30 to-transparent"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-lg bg-linear-to-b ${getPositionColor(
                                                    participant.position
                                                )} flex items-center justify-center text-white font-bold shadow-lg shrink-0`}
                                            >
                                                {participant.position <= 3 ? (
                                                    <span className="text-xl">
                                                        {getPositionBadge(
                                                            participant.position
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm">
                                                        #{participant.position}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {participant.avatar ? (
                                                    <img
                                                        src={participant.avatar}
                                                        alt={participant.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    getInitials(
                                                        participant.name || ""
                                                    )
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-bold text-gray-900 truncate">
                                                        {participant.name}
                                                    </p>
                                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold text-gray-600">
                                                        #{participant.bib}
                                                    </span>
                                                </div>

                                                <div className="mb-2">
                                                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${
                                                                    (participant.distanceCovered /
                                                                        (liveRace
                                                                            ?.routes
                                                                            ?.distance ??
                                                                            1)) *
                                                                    100
                                                                }%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs">
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Target
                                                            size={12}
                                                            className="text-blue-600"
                                                        />
                                                        <span className="font-semibold">
                                                            {participant.distanceCovered.toFixed(
                                                                1
                                                            )}{" "}
                                                            /{" "}
                                                            {liveRace?.routes?.distance?.toFixed(
                                                                1
                                                            )}{" "}
                                                            km
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Zap
                                                            size={12}
                                                            className="text-orange-500"
                                                        />
                                                        <span className="font-semibold">
                                                            {participant.pace}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {(
                                                            (participant.distanceCovered /
                                                                (liveRace
                                                                    ?.routes
                                                                    ?.distance ??
                                                                    1)) *
                                                            100
                                                        ).toFixed(0)}
                                                        % complete
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Race Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <TrendingUp
                                        size={16}
                                        className="text-blue-600 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Distance
                                        </p>
                                        <p className="text-gray-600">
                                            {liveRace?.routes?.distance?.toFixed(
                                                2
                                            ) + " km" || "Not specified"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin
                                        size={16}
                                        className="text-blue-600 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Start Location
                                        </p>
                                        <p className="text-gray-600">
                                            {liveRace?.routes?.start_address ||
                                                "Not specified"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin
                                        size={16}
                                        className="text-blue-600 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            end Location
                                        </p>
                                        <p className="text-gray-600">
                                            {liveRace?.routes?.end_address ||
                                                "Not specified"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <User
                                        size={16}
                                        className="text-blue-600 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Host
                                        </p>
                                        <p className="text-gray-600">
                                            {
                                                liveRace?.created_by_user
                                                    .full_name
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    Participants
                                    <div className="flex items-center gap-4 ml-auto">
                                        <span className="text-sm font-normal text-gray-600 inline-flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            {onlineRacers.length +
                                                onlineAdmins.length}{" "}
                                            online
                                        </span>

                                        <span className="text-sm font-normal text-gray-600">
                                            {liveRace?.participants?.length}{" "}
                                            total
                                        </span>
                                    </div>
                                </h2>
                            </div>

                            <ul className="divide-y divide-gray-100">
                                {liveRace?.participants?.map((p) => {
                                    const isOnline = !!onlineMap[p.user.id]

                                    return (
                                        <li
                                            key={p.id}
                                            className="p-4 flex items-center gap-4"
                                        >
                                            <div className="relative w-10 h-10">
                                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {p.bib_number}
                                                </div>

                                                <span
                                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                                        isOnline
                                                            ? "bg-green-500"
                                                            : "bg-gray-400"
                                                    }`}
                                                ></span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {p.user.full_name}
                                                </p>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

//
/* 
<div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                Race Statistics
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">
                                            Average Pace
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            4:36/km
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">
                                            Completion Rate
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            72%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                                        <Target className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">
                                            Fastest Runner
                                        </p>
                                        <p className="text-sm font-bold text-gray-900">
                                            Alice Johnson
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            4:15/km pace
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-yellow-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


<div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Race Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin
                                        size={16}
                                        className="text-blue-600 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Location
                                        </p>
                                        <p className="text-gray-600">
                                            City Park, Downtown
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Clock
                                        size={16}
                                        className="text-blue-600 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Started At
                                        </p>
                                        <p className="text-gray-600">
                                            8:00 AM Today
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <TrendingUp
                                        size={16}
                                        className="text-blue-600 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Route Type
                                        </p>
                                        <p className="text-gray-600">
                                            City Loop Circuit
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div> 
                        
                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Top 3 Runners
                            </h3>
                            <div className="space-y-3">
                                {race.participants
                                    .slice(0, 3)
                                    .map((participant) => (
                                        <div
                                            key={participant.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-linear-to-br from-gray-50 to-white border border-gray-100"
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-lg bg-linear-to-br ${getPositionColor(
                                                    participant.position
                                                )} flex items-center justify-center text-white font-bold shadow-md`}
                                            >
                                                <span className="text-lg">
                                                    {getPositionBadge(
                                                        participant.position
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {participant.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {participant.distanceCovered.toFixed(
                                                        1
                                                    )}{" "}
                                                    km • {participant.pace}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                Race Statistics
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">
                                            Average Pace
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            4:36/km
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">
                                            Completion Rate
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            72%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                                        <Target className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">
                                            Fastest Runner
                                        </p>
                                        <p className="text-sm font-bold text-gray-900">
                                            Alice Johnson
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            4:15/km pace
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-yellow-600" /> 
                                    </div>
                                </div>
                            </div>
                        </div>

                        // routes

                         {/* <div className="flex items-start gap-2">
                                    <Clock
                                        size={16}
                                        className="text-blue-600 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Started At
                                        </p>
                                        <p className="text-gray-600">
                                            8:00 AM Today
                                        </p>
                                    </div>
                                </div> 
                               <div className="flex items-start gap-2">
                                    <TrendingUp
                                        size={16}
                                        className="text-blue-600 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Route Type
                                        </p>
                                        <p className="text-gray-600">
                                            City Loop Circuit
                                        </p>
                                    </div>
                                </div> 
                        */
