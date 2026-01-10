import Map, { Layer, Marker, Source } from "@vis.gl/react-maplibre"
import {
    Users,
    Clock,
    Zap,
    Activity,
    Play,
    Flag,
    Trophy,
    AlertCircle,
    Radio,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
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

import "../styles/racesOngoingPage.css"
import { formatDate } from "../../../lib/time"
import { getBoundsFromCoords } from "../../../lib/geo"
import { toast } from "sonner"

type ParticipantStatus = "running" | "finished" | "offline"

function getStatus(
    userId: string,
    onlineUsers: Record<string, OnlineUser>
): ParticipantStatus {
    const online = onlineUsers[userId]

    if (!online) return "offline" as ParticipantStatus
    if (online.finished) return "finished" as ParticipantStatus

    return "running" as ParticipantStatus
}

const getStatusColor = (status: ParticipantStatus | string): string => {
    switch (status) {
        case "running":
            return "text-green-700 border-green-600 bg-green-50"
        case "finished":
            return "text-cyan-700 border-cyan-600 bg-cyan-50"
        case "offline":
            return "text-orange-700 border-orange-600 bg-orange-50"
        default:
            return "text-zinc-600 border-zinc-400 bg-zinc-50"
    }
}

export default function AdminRaceTracking() {
    const [filterStatus, setFilterStatus] = useState<"all" | ParticipantStatus>(
        "all"
    )

    const [socket, setSocket] = useState<Socket | null>(null)

    const { id } = useParams()
    const { data: user } = useUser()
    const { data: liveRace, refetch: refetchLiveRace } = useRace(id!)
    const [racerPositions, setRacerPositions] = useState<
        Record<string, RacerPosition>
    >({})
    console.log("🚀 ~ AdminRaceTracking ~ racerPositions:", racerPositions)

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
            console.error("End race error", err)
        }
    }

    const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>(
        {}
    )
    // const [onlineAdmins, setOnlineAdmins] = useState<string[]>([])
    const [onlineRacers, setOnlineRacers] = useState<string[]>([])
    // const [onlineGuests, setOnlineGuests] = useState<string[]>([])

    useEffect(() => {
        if (!id || !user || !socket) return

        socket.emit("joinRace", { raceId: id, userId: user.id })

        socket.on("onlineParticipants", (participants: OnlineUser[]) => {
            const users: Record<string, OnlineUser> = {}
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
                users[p.userId] = p

                if (p.role === "admin") admins.push(p.userId)
                else if (p.role === "racer") racers.push(p.userId)
                else if (p.role === "guest") guests.push(p.userId)
            })

            const prev = prevOnlineRef.current

            // JOINED
            Object.keys(users).forEach((userId) => {
                if (!prev[userId] && userId !== user.id) {
                    toast.success(`Runner has the joined the race`)
                }
            })

            // LEFT
            Object.keys(prev).forEach((userId) => {
                if (!users[userId] && userId !== user.id) {
                    toast(`Runner has left the race`)
                }
            })

            setOnlineUsers(users)
            // setOnlineAdmins(admins)
            setOnlineRacers(racers)
            // setOnlineGuests(guests)
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
                console.log("🚀 ~ AdminRaceTracking ~ update:", update)
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

        socket.on(
            "participantJoined",
            ({
                userId,
            }: {
                raceId: string
                userId: string
                role: "admin" | "racer" | "guest"
            }) => {
                if (userId === user.id) return

                toast(`Participant ${userId} joined the race`)
            }
        )

        socket.on(
            "participantLeft",
            ({
                userId,
            }: {
                raceId: string
                userId: string
                role: "admin" | "racer" | "guest"
            }) => {
                toast(`Participant ${userId} left the race`)
            }
        )

        return () => {
            socket.emit("leaveRace", { raceId: id, userId: user.id })
            socket.off("onlineParticipants")
            socket.off("participantUpdate")
            socket.off("raceStatusUpdate")
            socket.off("participantJoined")
            socket.off("participantLeft")
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket])

    const liveLeaderboard = (liveRace?.participants || [])
        .map((p) => {
            const update = racerPositions[p.user.id]
            const status = getStatus(p.user.id, onlineUsers)

            return {
                id: p.id,
                name: p.user.full_name,
                bib: p.bib_number,
                distance: update?.distance ?? 0,
                pace: update?.speed
                    ? `${(60 / update.speed).toFixed(2)} min/km`
                    : "–",
                lastUpdate: update?.lastUpdate,
                status,
                position: 0,
            }
        })
        .sort((a, b) => b.distance - a.distance)
        .map((p, index) => ({ ...p, position: index + 1 }))

    const stats = {
        total: liveLeaderboard.length,
        running: liveLeaderboard.filter((p) => p.status === "running").length,
        finished: liveLeaderboard.filter((p) => p.status === "finished").length,
        offline: liveLeaderboard.filter((p) => p.status === "offline").length,
    }

    const filteredParticipants =
        filterStatus === "all"
            ? liveLeaderboard
            : liveLeaderboard.filter((p) => p.status === filterStatus)

    function getMarkerColor(userId: string) {
        const user = onlineUsers[userId]
        const update = racerPositions[userId]

        if (!user || !update) return "bg-gray-400"

        const status = getStatus(userId, onlineUsers)

        switch (status) {
            case "running":
                return "bg-green-500"
            case "finished":
                return "bg-blue-500"
            case "offline":
                return "bg-gray-400"
            default:
                return "bg-yellow-500"
        }
    }

    const prevOnlineRef = useRef<Record<string, OnlineUser>>({})

    return (
        <div className="min-h-screen bg-gray-50 text-zinc-900 font-body">
            <div className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-[1800px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <h1 className="font-display text-4xl text-zinc-900 flex items-center gap-3">
                                    {liveRace?.name}
                                    {liveRace?.status === "ongoing" && (
                                        <span className="live-pulse flex items-center gap-2 px-4 py-1 bg-red-50 border-2 border-red-500 text-red-600 font-heading text-base rounded-full">
                                            <Radio className="w-4 h-4" />
                                            LIVE
                                        </span>
                                    )}
                                </h1>
                                <div className="flex items-center gap-4 text-zinc-600 mt-1">
                                    <span>
                                        {liveRace?.routes?.distance?.toPrecision(
                                            2
                                        )}{" "}
                                        km
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {formatDate(liveRace?.start_time)}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {elapsedTime}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isHost && (
                            <div className="flex items-center gap-4">
                                {/* <button className="cursor-pointer px-6 py-3 bg-gray-100 hover:bg-gray-200 text-zinc-900 font-heading text-lg rounded-lg transition-colors">
                                EXPORT DATA
                            </button> */}

                                {liveRace?.status === "upcoming" && (
                                    <button
                                        onClick={handleStartRace}
                                        className="cursor-pointer px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-heading text-lg rounded-lg hover:shadow-xl hover:shadow-cyan-500/30 transition-shadow"
                                    >
                                        START RACE
                                    </button>
                                )}

                                {liveRace?.status === "ongoing" && (
                                    <button
                                        onClick={handleEndRace}
                                        className="cursor-pointer px-6 py-3 bg-linear-to-r from-green-500 to-teal-500 text-white font-heading text-lg rounded-lg hover:shadow-xl hover:shadow-green-500/30 transition-shadow"
                                    >
                                        END RACE
                                    </button>
                                )}

                                {liveRace?.status === "finished" && (
                                    <Link
                                        to={`/dashboard/races/${liveRace?.id}/results`}
                                    >
                                        <button className="cursor-pointer px-6 py-3 bg-linear-to-r from-gray-400 to-gray-600 text-white font-heading text-lg rounded-lg hover:shadow-xl hover:shadow-gray-500/30 transition-shadow">
                                            EDIT RESULTS
                                        </button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-6 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1 space-y-6">
                        <div className="grid grid-cols-2 gap-4 slide-in-left">
                            <div className="stat-card p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <Users className="w-5 h-5 text-cyan-600" />
                                    <span className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                        Total
                                    </span>
                                </div>
                                <div className="font-display text-4xl text-zinc-900">
                                    {liveRace?.participants?.length || 0}
                                </div>
                            </div>

                            <div className="stat-card p-6 bg-white border-2 border-green-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity className="w-5 h-5 text-green-600" />
                                    <span className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                        Running
                                    </span>
                                </div>
                                <div className="font-display text-4xl text-green-600">
                                    {onlineRacers.length}
                                </div>
                            </div>

                            <div className="stat-card p-6 bg-white border-2 border-cyan-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <Trophy className="w-5 h-5 text-cyan-600" />
                                    <span className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                        Finished
                                    </span>
                                </div>
                                <div className="font-display text-4xl text-cyan-600">
                                    {stats.finished}
                                </div>
                            </div>

                            <div className="stat-card p-6 bg-white border-2 border-orange-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                    <span className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                        Offline
                                    </span>
                                </div>
                                <div className="font-display text-4xl text-orange-600">
                                    {liveRace?.participants?.length ||
                                        0 - onlineRacers.length}
                                </div>
                            </div>
                        </div>

                        {isHost && (
                            <div className="slide-in-left grain-overlay p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-heading text-2xl text-zinc-900">
                                        LIVE RACE MAP
                                    </h2>
                                    {liveRace?.status === "ongoing" && (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <Zap className="w-4 h-4" />
                                            <span className="font-body text-sm">
                                                Tracking Active
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="relative rounded-lg overflow-hidden map-pulse border-2 border-cyan-200">
                                    <div className="relative h-[400px] bg-gray-100">
                                        <Map
                                            mapStyle="https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"
                                            onLoad={(e) => {
                                                if (flatCoords.length > 1) {
                                                    const bounds =
                                                        getBoundsFromCoords(
                                                            flatCoords
                                                        )
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

                                            {Object.entries(racerPositions).map(
                                                ([userId, data]) => {
                                                    const participant =
                                                        liveRace?.participants?.find(
                                                            (p) =>
                                                                p.user.id ===
                                                                userId
                                                        )
                                                    const bibNumber =
                                                        participant?.bib_number ||
                                                        "?"

                                                    console.log(
                                                        "🚀 ~ AdminRaceTracking ~ participant:",
                                                        participant
                                                    )
                                                    return (
                                                        <Marker
                                                            key={userId}
                                                            longitude={
                                                                data.coords[0]
                                                            }
                                                            latitude={
                                                                data.coords[1]
                                                            }
                                                            anchor="center"
                                                        >
                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${getMarkerColor(
                                                                    userId
                                                                )}`}
                                                            >
                                                                {bibNumber}
                                                            </div>
                                                        </Marker>
                                                    )
                                                }
                                            )}
                                        </Map>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                        <span className="text-zinc-600">
                                            Running
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
                                        <span className="text-zinc-600">
                                            Finished
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                                        <span className="text-zinc-600">
                                            offline
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="xl:col-span-2 slide-in-right">
                        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-heading text-2xl text-zinc-900">
                                        PARTICIPANTS TRACKING
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                                        <Activity className="w-4 h-4 text-green-600 animate-pulse" />
                                        <span>Live Updates</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setFilterStatus("all")}
                                        className={`filter-button px-6 py-2 rounded-lg font-body ${
                                            filterStatus === "all"
                                                ? "active"
                                                : "bg-gray-100 hover:bg-gray-200 text-zinc-900"
                                        }`}
                                    >
                                        All ({stats.total})
                                    </button>
                                    <button
                                        onClick={() =>
                                            setFilterStatus("running")
                                        }
                                        className={`filter-button px-6 py-2 rounded-lg font-body ${
                                            filterStatus === "running"
                                                ? "active"
                                                : "bg-gray-100 hover:bg-gray-200 text-zinc-900"
                                        }`}
                                    >
                                        Running ({stats.running})
                                    </button>
                                    <button
                                        onClick={() =>
                                            setFilterStatus("finished")
                                        }
                                        className={`filter-button px-6 py-2 rounded-lg font-body ${
                                            filterStatus === "finished"
                                                ? "active"
                                                : "bg-gray-100 hover:bg-gray-200 text-zinc-900"
                                        }`}
                                    >
                                        Finished ({stats.finished})
                                    </button>
                                    <button
                                        onClick={() =>
                                            setFilterStatus("offline")
                                        }
                                        className={`filter-button px-6 py-2 rounded-lg font-body ${
                                            filterStatus === "offline"
                                                ? "active"
                                                : "bg-gray-100 hover:bg-gray-200 text-zinc-900"
                                        }`}
                                    >
                                        offline ({stats.offline})
                                    </button>
                                </div>
                            </div>

                            {/* Participants Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b border-gray-200">
                                            <th className="px-6 py-4 text-left font-heading text-sm text-zinc-600">
                                                POS
                                            </th>
                                            <th className="px-6 py-4 text-left font-heading text-sm text-zinc-600">
                                                BIB
                                            </th>
                                            <th className="px-6 py-4 text-left font-heading text-sm text-zinc-600">
                                                PARTICIPANT
                                            </th>
                                            <th className="px-6 py-4 text-left font-heading text-sm text-zinc-600">
                                                STATUS
                                            </th>
                                            <th className="px-6 py-4 text-left font-heading text-sm text-zinc-600">
                                                DISTANCE
                                            </th>
                                            <th className="px-6 py-4 text-left font-heading text-sm text-zinc-600">
                                                PACE
                                            </th>
                                            <th className="px-6 py-4 text-left font-heading text-sm text-zinc-600">
                                                LAST UPDATE
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredParticipants.map(
                                            (participant, index) => (
                                                <tr
                                                    key={participant.id}
                                                    className="participant-row border-b border-gray-200 cursor-pointer"
                                                    style={{
                                                        animationDelay: `${
                                                            index * 0.05
                                                        }s`,
                                                    }}
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="font-display text-2xl text-zinc-900">
                                                            {
                                                                participant.position
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-heading text-lg text-cyan-600">
                                                            #{participant.bib}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-body text-zinc-900 font-medium">
                                                            {participant.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span
                                                            className={`inline-flex items-center gap-2 px-3 py-1 border-2 rounded-full font-body text-xs uppercase ${getStatusColor(
                                                                participant.status
                                                            )}`}
                                                        >
                                                            <span className="w-2 h-2 rounded-full bg-current live-pulse"></span>
                                                            {participant.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="space-y-2">
                                                            <div className="font-body text-zinc-900 font-semibold">
                                                                {participant.distance.toFixed(
                                                                    1
                                                                )}{" "}
                                                                km
                                                            </div>
                                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="distance-progress h-full rounded-full"
                                                                    style={{
                                                                        width: `${
                                                                            (participant.distance /
                                                                                5.0) *
                                                                            100
                                                                        }%`,
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-body text-zinc-700">
                                                            {participant.pace}{" "}
                                                            <span className="text-zinc-500 text-sm">
                                                                /km
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div
                                                            className={
                                                                `font-body text-sm`
                                                                // className={`font-body text-sm ${
                                                                //     participant.lastUpdate ===
                                                                //     "Just now"
                                                                //         ? "text-green-600 update-indicator"
                                                                //         : "text-zinc-500"
                                                            }
                                                        >
                                                            {
                                                                participant.lastUpdate
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* modal */}
        </div>
    )
}

/*
<div className="slide-in-left p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
    <h3 className="font-heading text-xl text-zinc-900 mb-4">
        QUICK ACTIONS
    </h3>
    <div className="space-y-3">
        <button className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-left font-body rounded-lg transition-colors flex items-center justify-between border border-gray-200">
            <span className="text-zinc-900">
                Send Broadcast Alert
            </span>
            <AlertCircle className="w-4 h-4 text-orange-600" />
        </button>
        <button className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-left font-body rounded-lg transition-colors flex items-center justify-between border border-gray-200">
            <span className="text-zinc-900">
                View Race Analytics
            </span>
            <Activity className="w-4 h-4 text-cyan-600" />
        </button>
        <button className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-left font-body rounded-lg transition-colors flex items-center justify-between border border-gray-200">
            <span className="text-zinc-900">
                Emergency Services
            </span>
            <Radio className="w-4 h-4 text-red-600" />
        </button>
    </div>
</div>

*/

/*
{/* Participant Detail Modal
            {selectedParticipant && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    onClick={() => setSelectedParticipant(null)}
                >
                    <div
                        className="bg-white border-2 border-cyan-200 rounded-lg p-8 max-w-2xl w-full shadow-2xl fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="font-heading text-sm text-cyan-600 mb-1">
                                    BIB #{selectedParticipant.bib}
                                </div>
                                <h3 className="font-display text-4xl text-zinc-900 mb-2">
                                    {selectedParticipant.name}
                                </h3>
                                <span
                                    className={`inline-flex items-center gap-2 px-4 py-2 border-2 rounded-full font-body text-sm uppercase ${getStatusColor(
                                        selectedParticipant.status
                                    )}`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-current live-pulse"></span>
                                    {selectedParticipant.status}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedParticipant(null)}
                                className="text-zinc-400 hover:text-zinc-900 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="font-body text-sm text-zinc-600 mb-1">
                                    Position
                                </div>
                                <div className="font-display text-3xl text-zinc-900">
                                    #{selectedParticipant.position}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="font-body text-sm text-zinc-600 mb-1">
                                    Distance
                                </div>
                                <div className="font-display text-3xl text-cyan-600">
                                    {selectedParticipant.distance} km
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="font-body text-sm text-zinc-600 mb-1">
                                    Pace
                                </div>
                                <div className="font-display text-3xl text-green-600">
                                    {selectedParticipant.pace}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-3 bg-cyan-50 border-2 border-cyan-600 text-cyan-700 font-heading text-lg rounded-lg hover:bg-cyan-100 transition-colors">
                                VIEW ON MAP
                            </button>
                            <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-zinc-900 font-heading text-lg rounded-lg transition-colors border border-gray-300">
                                SEND MESSAGE
                            </button>
                        </div>
                    </div>
                </div>
            )}
*/
