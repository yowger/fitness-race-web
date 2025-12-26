import { Fragment, useState } from "react"
import Map, { Marker, Source, Layer } from "@vis.gl/react-maplibre"
import {
    CheckCircle,
    AlertCircle,
    MapPin,
    Flag,
    Play,
    Users,
    Trophy,
    Activity,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import {
    usePublishRaceResults,
    useRace,
    useResults,
    useTracking,
    type RaceResult,
} from "../hooks/useRaces"
import { useUser } from "../../auth/hooks/useUser"
import { ResultsTable } from "../components/ResultsTable"
import { getBoundsFromCoords } from "../../../lib/geo"

export default function RacesResultsPage() {
    const { id: raceId } = useParams()
    const navigate = useNavigate()
    const { data: user } = useUser()
    const { data: liveRace } = useRace(raceId!)
    const { data: raceTracking } = useTracking(raceId!)
    const { data: results } = useResults(raceId!)
    const { mutateAsync: publishResults } = usePublishRaceResults()

    const [editedResults, setEditedResults] = useState<RaceResult[]>([])

    const isHost = liveRace?.created_by_user?.id === user?.id
    const participants = liveRace?.participants ?? []

    const totalParticipantsCount = participants.length

    const finishedCount =
        results?.filter((r) => r.status === "Finished").length ?? 0

    const dnfCount = results?.filter((r) => r.status === "DNF").length ?? 0

    const coords =
        liveRace?.routes?.geojson.features?.[0]?.geometry?.coordinates ?? []

    const flatCoords: [number, number][] = Array.isArray(coords[0])
        ? (coords as [number, number][])
        : []

    const firstCoord: [number, number] = flatCoords[0] ?? [0, 0]
    const lastCoord: [number, number] = flatCoords[flatCoords.length - 1] ?? [
        0, 0,
    ]

    const [isPublishing, setIsPublishing] = useState(false)
    const [hoveredUserId, setHoveredUserId] = useState<string | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    const confirmResults = async () => {
        if (!raceId) return

        setIsPublishing(true)

        try {
            const source = editedResults.length ? editedResults : results ?? []

            await publishResults({
                race_id: raceId,
                results: source.map((r, index) => ({
                    user_id: r.user_id,
                    status: r.status,
                    finish_time: r.finish_time ?? null,
                    position: r.status === "Finished" ? index + 1 : null,
                })),
            })

            navigate(`/dashboard/races/${raceId}/complete`)
        } finally {
            setIsPublishing(false)
        }
    }

    const onRowClick = (userId: string) => setSelectedUserId(userId)
    const onRowHover = (userId: string | null) => setHoveredUserId(userId)

    const onResultsChange = (results: RaceResult[]) => {
        setEditedResults(results)
    }

    if (!isHost) {
        return (
            <div className="min-h-screen bg-gray-50">
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
                `}</style>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="font-display text-5xl text-zinc-900 mb-4">
                            Access Denied
                        </h1>
                        <p className="font-body text-lg text-zinc-600">
                            You are not the host of this race
                        </p>
                    </div>
                </div>
            </div>
        )
    }

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

                .fade-in-delay-3 {
                    animation: fadeIn 0.6s ease-out 0.6s both;
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
                    border: 2px solid rgb(209, 213, 219);
                    transition: border-color 0.3s ease;
                }

                .map-container:hover {
                    border-color: rgb(8, 145, 178);
                }

                .publish-button {
                    position: relative;
                    overflow: hidden;
                }

                .publish-button::after {
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

                .publish-button:hover::after {
                    width: 300px;
                    height: 300px;
                }

                .results-panel {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
            `}</style>

            {/* Header Section */}
            <div className="bg-white border-b-2 border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="fade-in">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-green-600 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-display text-5xl text-zinc-900 leading-none">
                                    Results Verification
                                </h1>
                            </div>
                        </div>
                        <p className="font-body text-lg text-zinc-600 ml-15">
                            Review and adjust the final standings before
                            publishing
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="stat-card fade-in-delay-1 bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-body text-sm text-zinc-600 uppercase tracking-wider mb-2">
                                    Total Participants
                                </p>
                                <p className="font-display text-5xl text-zinc-900">
                                    {totalParticipantsCount}
                                </p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center">
                                <Users className="text-cyan-600 w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="stat-card fade-in-delay-2 bg-white rounded-lg border-2 border-green-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-body text-sm text-zinc-600 uppercase tracking-wider mb-2">
                                    Finished
                                </p>
                                <p className="font-display text-5xl text-green-600">
                                    {finishedCount}
                                </p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="text-green-600 w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="stat-card fade-in-delay-3 bg-white rounded-lg border-2 border-red-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-body text-sm text-zinc-600 uppercase tracking-wider mb-2">
                                    Did Not Finish
                                </p>
                                <p className="font-display text-5xl text-red-600">
                                    {dnfCount}
                                </p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="text-red-600 w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                    {/* Map Section */}
                    <div className="lg:col-span-4 fade-in">
                        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
                            <div className="border-b-2 border-gray-200 px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <MapPin className="w-6 h-6 text-cyan-600" />
                                    <h2 className="font-heading text-2xl text-zinc-900">
                                        RACE ROUTE & POSITIONS
                                    </h2>
                                </div>
                                <p className="font-body text-sm text-zinc-600">
                                    Participants' last recorded positions on the
                                    course
                                </p>
                            </div>
                            <div className="h-[450px] map-container">
                                <Map
                                    mapStyle="https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"
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
                                            type: "FeatureCollection",
                                            features: [
                                                {
                                                    type: "Feature",
                                                    geometry: {
                                                        type: "LineString",
                                                        coordinates:
                                                            flatCoords || [],
                                                    },
                                                    properties: {},
                                                },
                                            ],
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

                                    {raceTracking?.map((t, i) => {
                                        const userTracks = raceTracking.filter(
                                            (u) => u.user_id === t.user_id
                                        )
                                        const coordinates = userTracks.map(
                                            (u) => [u.longitude, u.latitude]
                                        )
                                        if (!coordinates.length) return null

                                        const lastPos =
                                            coordinates[coordinates.length - 1]

                                        const isActive =
                                            hoveredUserId === t.user_id ||
                                            selectedUserId === t.user_id

                                        return (
                                            <Fragment
                                                key={`track-${t.user_id}-${i}`}
                                            >
                                                <Source
                                                    id={`track-${t.user_id}`}
                                                    type="geojson"
                                                    data={{
                                                        type: "Feature",
                                                        geometry: {
                                                            type: "LineString",
                                                            coordinates,
                                                        },
                                                        properties: {
                                                            user_id: t.user_id,
                                                            name: t.users
                                                                .full_name,
                                                            bib_number:
                                                                t.bib_number,
                                                        },
                                                    }}
                                                >
                                                    <Layer
                                                        id={`track-line-${t.user_id}`}
                                                        type="line"
                                                        paint={{
                                                            "line-color":
                                                                isActive
                                                                    ? "#0891b2"
                                                                    : "#888",
                                                            "line-width":
                                                                isActive
                                                                    ? 6
                                                                    : 3,
                                                            "line-opacity": 0.8,
                                                        }}
                                                    />
                                                </Source>

                                                <Marker
                                                    longitude={lastPos[0]}
                                                    latitude={lastPos[1]}
                                                >
                                                    <div
                                                        className={`rounded-full flex items-center justify-center border-3 border-white transition-all ${
                                                            isActive
                                                                ? "w-8 h-8 bg-cyan-700 shadow-lg"
                                                                : "w-7 h-7 bg-cyan-500 shadow-md"
                                                        }`}
                                                    >
                                                        <span className="text-white text-xs font-bold">
                                                            {t.bib_number ??
                                                                "?"}
                                                        </span>

                                                        {isActive && (
                                                            <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg">
                                                                {
                                                                    t.users
                                                                        .full_name
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </Marker>
                                            </Fragment>
                                        )
                                    })}
                                </Map>
                            </div>
                        </div>
                    </div>

                    {/* Results Table Section */}
                    <div className="lg:col-span-8 fade-in">
                        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm results-panel">
                            <div className="border-b-2 border-gray-200 px-6 py-5 bg-linear-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <Activity className="w-6 h-6 text-green-600" />
                                    <h2 className="font-heading text-2xl text-zinc-900">
                                        FINAL STANDINGS
                                    </h2>
                                </div>
                                <p className="font-body text-sm text-zinc-600">
                                    Drag rows to adjust positions or use the
                                    arrow buttons
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <ResultsTable
                                    results={results || []}
                                    selectedUserId={selectedUserId}
                                    onRowHover={onRowHover}
                                    onRowClick={onRowClick}
                                    onResultsChange={onResultsChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="fade-in bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-cyan-600" />
                            </div>
                            <p className="font-body text-base text-zinc-700">
                                Make sure all positions are correct before
                                publishing
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {/* <button
                                disabled={isPublishing}
                                className="px-8 py-3 border-2 border-gray-300 rounded-lg font-heading text-lg text-zinc-700 bg-white hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                CANCEL
                            </button> */}
                            <button
                                onClick={confirmResults}
                                disabled={isPublishing}
                                className="publish-button flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white rounded-lg font-heading text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isPublishing ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        PUBLISHING...
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="w-5 h-5" />
                                        PUBLISH RESULTS
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
