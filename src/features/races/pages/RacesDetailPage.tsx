import { useState } from "react"
import { Calendar, Clock, Flag, MapPin, Play, Users } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
    useAddParticipant,
    useRace,
    useRaceRevenue,
    // useRemoveParticipant,
} from "../hooks/useRaces"
import { format } from "date-fns"
import DOMPurify from "dompurify"
import { useRaceEvent } from "../api/useRaceEvents"
import Map, { Layer, Marker, Source } from "@vis.gl/react-maplibre"
import { getAvatarUrl } from "../../../lib/avatar"
import { getBoundsFromCoords } from "../../../lib/geo"
import { useUser } from "../../auth/hooks/useUser"
import { io } from "socket.io-client"
import { toast } from "sonner"
import RaceParticipantsTab from "../components/RaceParticipantsTab"

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

function createMarkup(htmlString: string) {
    const sanitizedHTML = DOMPurify.sanitize(htmlString)
    return { __html: sanitizedHTML }
}

const SOCKET_URL = import.meta.env.VITE_PUBLIC_SOCKET_URL

export default function RaceDetailPage() {
    const socket = io(SOCKET_URL)
    const { data: user } = useUser()
    const { id } = useParams()

    const { data: raceRevenue } = useRaceRevenue(id!)
    console.log("🚀 ~ RaceDetailPage ~ raceRevenue:", raceRevenue)
    const { data: race, refetch: refetchRace } = useRace(id!)

    const { data: raceEvent } = useRaceEvent(id!)

    const participantCount = race?.participants?.length ?? 0
    const maxParticipants = race?.max_participants ?? 0

    const participationPercentage =
        maxParticipants > 0
            ? Math.min((participantCount / maxParticipants) * 100, 100)
            : 0

    const registrationFeeLabel =
        race?.price && race.price > 0
            ? `₱${race.price.toLocaleString()}`
            : "Free"

    const [activeTab, setActiveTab] = useState("details")

    const coords =
        race?.routes?.geojson.features?.[0]?.geometry?.coordinates ?? []
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

    const [isJoining, setIsJoining] = useState(false)
    const isHost = race?.created_by === user?.id
    console.log("🚀 ~ RaceDetailPage ~ isHost:", isHost)
    const hasJoined = race?.participants?.some((p) => p.user.id === user?.id)

    const addParticipantMutation = useAddParticipant()
    // const removeParticipantMutation = useRemoveParticipant()
    const navigate = useNavigate()

    const handleJoinRace = async () => {
        console.log("🚀 ~ handleJoinRace ~ race:", race)

        if (!race || !user) return

        if (race.price && race.price > 0) {
            console.log("🚀 ~ handleJoinRace ~ race: 2", race)
            navigate(`/dashboard/races/${race?.id}/pay`)
        }

        setIsJoining(true)

        try {
            await addParticipantMutation.mutateAsync({
                race_id: race.id,
                user_id: user.id,
            })

            refetchRace()
            socket.emit("joinRace", { raceId: race.id, userId: user.id })

            toast.success("Successfully joined the race!")
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message || "Failed to join race.")
            }
        } finally {
            setIsJoining(false)
        }
    }

    // const handleLeaveRace = async () => {
    //     if (!race || !user) return

    //     try {
    //         await removeParticipantMutation.mutateAsync({
    //             race_id: race.id,
    //             user_id: user.id,
    //         })

    //         refetchRace()
    //         socket.emit("leaveRace", { raceId: race.id, userId: user.id })

    //         toast.success("You left the race")
    //     } catch (err) {
    //         if (err instanceof Error) toast.error(err.message)
    //     }
    // }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Antonio:wght@700&family=Work+Sans:wght@400;500;600;700&display=swap');

          :root {
            --electric-cyan: #00f0ff;
            --hot-orange: #ff4500;
            --lime-green: #39ff14;
            --deep-purple: #6B00FF;
          }

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

          .hero-gradient {
            background: linear-gradient(135deg, 
              rgba(0, 240, 255, 0.15) 0%, 
              rgba(107, 0, 255, 0.15) 50%,
              rgba(255, 69, 0, 0.15) 100%
            );
          }

          .glow-cyan {
            box-shadow: 0 0 30px rgba(0, 240, 255, 0.3);
          }

          .glow-orange {
            box-shadow: 0 0 30px rgba(255, 69, 0, 0.3);
          }

          .slide-in {
            animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
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

          .fade-in-delay-3 {
            animation: fadeIn 0.6s ease-out 0.6s both;
          }

          @keyframes slideIn {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
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

          .status-badge {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          .diagonal-clip {
            clip-path: polygon(0 0, 100% 0, 100% 95%, 0 100%);
          }

          .info-card:hover {
            transform: translateY(-4px);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .info-card {
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .tab-button {
            position: relative;
            transition: color 0.3s ease;
          }

          .tab-button::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--electric-cyan), var(--lime-green));
            transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .tab-button.active::after { width: 100%; }

          .progress-bar {
            background: linear-gradient(90deg, var(--electric-cyan), var(--lime-green));
            animation: shimmer 2s linear infinite;
            background-size: 200% 100%;
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .grain-overlay { position: relative; }

          .grain-overlay::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
            opacity: 0.1;
            pointer-events: none;
          }
        `}
            </style>

            {/* Hero Section */}
            <div className="relative overflow-hidden diagonal-clip grain-overlay">
                <div className="absolute inset-0 hero-gradient"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>

                <div className="relative">
                    <img
                        src={race?.banner_url || race?.routes?.map_url}
                        alt={race?.routes?.name || ""}
                        className="w-full h-[60vh] object-cover opacity-40 slide-in"
                    />

                    <div className="absolute inset-0 flex items-end">
                        <div className="w-full max-w-7xl mx-auto px-6 pb-16">
                            <div className="slide-in">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="status-badge px-6 py-2 bg-lime-green/20 border-2 border-gray-700 text-lime-green font-heading text-lg uppercase">
                                        {race?.status}
                                    </span>
                                    <span className="px-6 py-2 bg-electric-cyan/20 border border-gray-700 text-electric-cyan font-heading text-lg">
                                        {race?.routes?.distance?.toFixed(2)} km
                                    </span>
                                </div>

                                <h1 className="font-display text-8xl md:text-9xl leading-none mb-4 bg-linear-to-r from-gray-900 via-electric-cyan to-lime-green bg-clip-text text-transparent">
                                    {race?.name}
                                </h1>

                                <div className="flex flex-wrap gap-6 text-gray-600 font-body text-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-electric-cyan" />
                                        <span>
                                            {formatDate(race?.start_time)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-electric-cyan" />
                                        <span>
                                            {formatTime(race?.start_time)}
                                        </span>
                                    </div>
                                    {race?.routes?.start_address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-hot-orange" />
                                            <span>
                                                {race?.routes?.start_address}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column - Tabs */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="border-b border-gray-300 fade-in">
                            <div className="flex gap-8 font-heading text-xl">
                                <button
                                    onClick={() => setActiveTab("details")}
                                    className={`tab-button pb-4 ${
                                        activeTab === "details"
                                            ? "active text-gray-900"
                                            : "text-gray-400"
                                    }`}
                                >
                                    DETAILS
                                </button>
                                <button
                                    onClick={() => setActiveTab("schedule")}
                                    className={`tab-button pb-4 ${
                                        activeTab === "schedule"
                                            ? "active text-gray-900"
                                            : "text-gray-400"
                                    }`}
                                >
                                    SCHEDULE
                                </button>
                                <button
                                    onClick={() => setActiveTab("route")}
                                    className={`tab-button pb-4 ${
                                        activeTab === "route"
                                            ? "active text-gray-900"
                                            : "text-gray-400"
                                    }`}
                                >
                                    ROUTE
                                </button>
                                {isHost && (
                                    <button
                                        onClick={() =>
                                            setActiveTab("participants")
                                        }
                                        className={`tab-button pb-4 ${
                                            activeTab === "participants"
                                                ? "active text-gray-900"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        PARTICIPANTS
                                    </button>
                                )}

                                {isHost && (
                                    <button
                                        onClick={() => setActiveTab("insights")}
                                        className={`tab-button pb-4 ${
                                            activeTab === "insights"
                                                ? "active text-gray-900"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        HOST INSIGHTS
                                    </button>
                                )}

                                <button
                                    onClick={() => setActiveTab("rules")}
                                    className={`tab-button pb-4 ${
                                        activeTab === "rules"
                                            ? "active text-gray-900"
                                            : "text-gray-400"
                                    }`}
                                >
                                    Rules
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === "details" && (
                            <div className="fade-in">
                                <h2 className="font-display text-4xl mb-6 text-gray-900">
                                    About the Race
                                </h2>
                                {race?.description && (
                                    <div
                                        // className="font-body text-gray-700 "
                                        className="rich-text-editor prose lg:prose-lg text-gray-700 "
                                        dangerouslySetInnerHTML={createMarkup(
                                            race.description
                                        )}
                                    ></div>
                                )}

                                {race?.created_by_user.id && (
                                    <Link
                                        to={`/dashboard/profile/${
                                            race?.created_by_user.id || ""
                                        }`}
                                    >
                                        <div className="mt-8 p-6 bg-gray-50 border border-gray-300 rounded-lg">
                                            <div className="flex items-start gap-4">
                                                <img
                                                    src={getAvatarUrl(
                                                        race?.created_by_user
                                                            .full_name || "",
                                                        {
                                                            size: 64,
                                                            rounded: false,
                                                        }
                                                    )}
                                                    alt={
                                                        race?.created_by_user
                                                            .full_name
                                                    }
                                                    className="w-16 h-16 rounded-full"
                                                />
                                                <div>
                                                    <h3 className="flex font-heading items-center gap-2 text-2xl text-gray-900 mb-1 hover:text-cyan-600">
                                                        {
                                                            race
                                                                ?.created_by_user
                                                                .full_name
                                                        }

                                                        {isHost && (
                                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                                                Host
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="font-body text-gray-600">
                                                        Promoting health and
                                                        fitness
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        )}

                        {activeTab === "schedule" && (
                            <div className="fade-in space-y-4">
                                <h2 className="font-display text-4xl mb-6 text-gray-900">
                                    Event Schedule
                                </h2>

                                {raceEvent?.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-start gap-6 p-5 bg-gray-50 border border-gray-200 rounded-lg"
                                    >
                                        <div className="shrink-0 w-28">
                                            <span className="font-heading text-2xl text-electric-cyan">
                                                {formatTime(
                                                    event.scheduled_time
                                                )}
                                            </span>
                                        </div>

                                        <div className="grow space-y-1">
                                            <div className="font-body text-lg text-gray-700">
                                                {event.name}
                                            </div>

                                            {event.description && (
                                                <div className="font-body text-sm text-gray-500">
                                                    {event.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "route" && (
                            <div className="fade-in">
                                <h2 className="font-display text-4xl mb-6 text-gray-900">
                                    Race Route
                                </h2>
                                <div className="rounded-lg overflow-hidden border-2 border-electric-cyan/30">
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
                                                    onLoad={(e) => {
                                                        if (
                                                            flatCoords.length >
                                                            1
                                                        ) {
                                                            const bounds =
                                                                getBoundsFromCoords(
                                                                    flatCoords
                                                                )
                                                            e.target.fitBounds(
                                                                bounds,
                                                                {
                                                                    padding: 60,
                                                                    duration: 800,
                                                                }
                                                            )
                                                        }
                                                    }}
                                                >
                                                    <Source
                                                        id="race-route"
                                                        type="geojson"
                                                        data={lineData}
                                                    >
                                                        <Layer
                                                            id="race-line-outline"
                                                            type="line"
                                                            paint={{
                                                                "line-color":
                                                                    "#ffffff",
                                                                "line-width": 10,
                                                                "line-opacity": 1,
                                                            }}
                                                        />

                                                        <Layer
                                                            id="race-line"
                                                            type="line"
                                                            paint={{
                                                                "line-color":
                                                                    "#F97316",
                                                                "line-width": 5,
                                                                "line-opacity": 0.95,
                                                            }}
                                                        />
                                                    </Source>

                                                    <Marker
                                                        longitude={
                                                            firstCoord[0]
                                                        }
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
                                </div>
                            </div>
                        )}

                        {activeTab === "participants" && isHost && race && (
                            <RaceParticipantsTab race={race} />
                        )}

                        {activeTab === "insights" && isHost && raceRevenue && (
                            <div className="fade-in space-y-6">
                                <h2 className="font-display text-4xl text-gray-900">
                                    Revenue Overview
                                </h2>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="p-6 bg-gray-50 border rounded-lg">
                                        <div className="text-sm text-gray-500">
                                            Registration Fee
                                        </div>
                                        <div className="font-display text-3xl">
                                            ₱
                                            {raceRevenue.price.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-50 border rounded-lg">
                                        <div className="text-sm text-gray-500">
                                            Participants
                                        </div>
                                        <div className="font-display text-3xl">
                                            {raceRevenue.participantCount}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gradient-to-br from-lime-green/20 to-electric-cyan/20 border-2 border-lime-green rounded-lg">
                                        <div className="text-sm text-gray-600 uppercase tracking-wide">
                                            Estimated Revenue
                                        </div>
                                        <div className="font-display text-4xl text-gray-900">
                                            ₱
                                            {raceRevenue.estimatedRevenue.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="info-card fade-in-delay-1 p-8 bg-linear-to-br from-electric-cyan/10 to-lime-green/10 border-2 border-electric-cyan/50 rounded-lg glow-cyan">
                            <div className="text-center mb-6">
                                <div className="font-display text-5xl text-gray-900 mb-2">
                                    {registrationFeeLabel}
                                </div>
                                <div className="font-body text-sm text-gray-500 uppercase tracking-wider">
                                    Registration Fee
                                </div>
                            </div>

                            {/* HOST ACTIONS */}
                            {isHost &&
                                race &&
                                (race.status === "upcoming" ||
                                    race.status === "ongoing") && (
                                    <Link
                                        to={`/dashboard/races/${race.id}/live`}
                                        className="block w-full mb-4 py-4 bg-gradient-to-r from-yellow-300 to-yellow-400 text-white font-heading text-2xl rounded-lg text-center hover:shadow-2xl hover:shadow-orange-400 transition-all"
                                    >
                                        GO LIVE
                                    </Link>
                                )}

                            {isHost && race?.status === "finished" && (
                                <Link
                                    to={`/dashboard/races/${race.id}/results`}
                                    className="block w-full mb-4 py-4 bg-gradient-to-r from-yellow-300 to-yellow-400 text-white font-heading text-2xl rounded-lg text-center hover:shadow-2xl hover:shadow-orange-400 transition-all"
                                >
                                    EDIT RESULTS
                                </Link>
                            )}

                            {isHost && race?.status === "complete" && (
                                <Link
                                    to={`/dashboard/races/${race.id}/complete`}
                                    className="block w-full mb-4 py-4 bg-gradient-to-r from-yellow-300 to-yellow-400 text-white font-heading text-2xl rounded-lg text-center hover:shadow-2xl hover:shadow-orange-400 transition-all"
                                >
                                    SEE RESULTS
                                </Link>
                            )}

                            {/* NON-HOST — ONLY IF UPCOMING */}
                            {!isHost && race?.status === "upcoming" && (
                                <>
                                    {hasJoined ? (
                                        <div className="text-center">
                                            Already registered.
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (
                                                    race.price &&
                                                    race.price > 0
                                                ) {
                                                    navigate(
                                                        `/dashboard/races/${race.id}/pay`
                                                    )
                                                } else {
                                                    handleJoinRace()
                                                }
                                            }}
                                            disabled={isJoining}
                                            className="w-full py-4 font-heading text-2xl rounded-lg transition-all
                    bg-linear-to-br from-cyan-400 to-lime-600 text-white
                    hover:shadow-2xl hover:shadow-electric-cyan/50"
                                        >
                                            {isJoining
                                                ? "Processing..."
                                                : race.price && race.price > 0
                                                ? `PAY ₱${race.price.toFixed(
                                                      2
                                                  )}`
                                                : "REGISTER NOW"}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="info-card fade-in-delay-2 p-6 bg-gray-50 border border-gray-200 rounded-lg space-y-6">
                            <h3 className="font-heading text-2xl text-gray-900">
                                Quick Info
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-hot-orange" />
                                        <span className="font-body text-gray-700">
                                            Participants
                                        </span>
                                    </div>
                                    <span className="font-heading text-xl text-gray-900">
                                        {race?.participants?.length}/
                                        {race?.max_participants}
                                    </span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="progress-bar h-full rounded-full"
                                        style={{
                                            width: `${participationPercentage}%`,
                                        }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-500 font-body">
                                    {Math.round(participationPercentage)}% spots
                                    filled
                                </p>
                            </div>

                            {activeTab === "rules" && (
                                <div className="fade-in space-y-8">
                                    <h2 className="font-display text-4xl mb-6 text-gray-900">
                                        Race Rules & Policies
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Race Rules Section */}
                                        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                            <h3 className="font-heading text-2xl text-gray-900 mb-4">
                                                GENERAL RULES
                                            </h3>
                                            <ul className="space-y-3 font-body text-gray-700">
                                                <li className="flex items-start gap-3">
                                                    <span className="text-electric-cyan mt-1">
                                                        •
                                                    </span>
                                                    <span>
                                                        All participants must be
                                                        registered before race
                                                        day
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="text-electric-cyan mt-1">
                                                        •
                                                    </span>
                                                    <span>
                                                        Race bibs must be worn
                                                        visibly at all times
                                                        during the event
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="text-electric-cyan mt-1">
                                                        •
                                                    </span>
                                                    <span>
                                                        Follow the designated
                                                        route - shortcuts will
                                                        result in
                                                        disqualification
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="text-electric-cyan mt-1">
                                                        •
                                                    </span>
                                                    <span>
                                                        Respect fellow runners,
                                                        volunteers, and
                                                        spectators
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Safety Guidelines */}
                                        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                            <h3 className="font-heading text-2xl text-gray-900 mb-4">
                                                SAFETY GUIDELINES
                                            </h3>
                                            <ul className="space-y-3 font-body text-gray-700">
                                                <li className="flex items-start gap-3">
                                                    <span className="text-hot-orange mt-1">
                                                        •
                                                    </span>
                                                    <span>
                                                        Participants run at
                                                        their own risk
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="text-hot-orange mt-1">
                                                        •
                                                    </span>
                                                    <span>
                                                        Medical clearance
                                                        recommended for all
                                                        participants
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="text-hot-orange mt-1">
                                                        •
                                                    </span>
                                                    <span>
                                                        Stay hydrated throughout
                                                        the race
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <span className="text-hot-orange mt-1">
                                                        •
                                                    </span>
                                                    <span>
                                                        Report any injuries or
                                                        emergencies to race
                                                        marshals immediately
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Cancellation Policy */}
                                        {/* <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                            <h3 className="font-heading text-2xl text-gray-900 mb-4">
                                                CANCELLATION POLICY
                                            </h3>
                                            <div className="space-y-3 font-body text-gray-700">
                                                <p>
                                                    Registration fees are
                                                    non-refundable except in
                                                    case of event cancellation
                                                    by organizers.
                                                </p>
                                                <p>
                                                    Race may be postponed or
                                                    cancelled due to severe
                                                    weather or unforeseen
                                                    circumstances.
                                                </p>
                                                <p>
                                                    Participants will be
                                                    notified via email of any
                                                    changes to the event.
                                                </p>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            )}

                            {/* <div className="pt-4 border-t border-gray-200 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Award className="w-5 h-5 text-lime-green mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-body font-semibold text-gray-900 mb-1">
                                            Awards
                                        </div>
                                        <div className="font-body text-sm text-gray-600">
                                            Medals for all finishers, trophies
                                            for top 3 in each category
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-electric-cyan mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-body font-semibold text-gray-900 mb-1">
                                            What to Bring
                                        </div>
                                        <div className="font-body text-sm text-gray-600">
                                            Valid ID, comfortable running shoes,
                                            water bottle
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
