import { Fragment, useState } from "react"
import Map, { Marker, Source, Layer } from "@vis.gl/react-maplibre"
import { CheckCircle, AlertCircle, MapPin, Flag, Play } from "lucide-react"
import { useParams } from "react-router-dom"

import { useRace, useResults, useTracking } from "../hooks/useRaces"
import { useUser } from "../../auth/hooks/useUser"
import { ResultsTable } from "../components/ResultsTable"

export default function RacesResultsPage() {
    const { id: raceId } = useParams()

    const { data: user } = useUser()
    const { data: liveRace } = useRace(raceId!)
    const { data: raceTracking } = useTracking(raceId!)
    const { data: results } = useResults(raceId!)

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
        setIsPublishing(true)
        await new Promise((r) => setTimeout(r, 2000))
        setIsPublishing(false)
    }

    const onRowClick = (userId: string) => setSelectedUserId(userId)
    const onRowHover = (userId: string | null) => setHoveredUserId(userId)

    if (!isHost) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-normal text-gray-900 mb-2">
                                Race Results Verification
                            </h1>
                            <p className="text-base text-gray-600">
                                You are not the host of this race
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-normal text-gray-900 mb-2">
                            Race Results Verification
                        </h1>
                        <p className="text-base text-gray-600">
                            Review and adjust the final standings before
                            publishing
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">
                                    Total Participants
                                </p>
                                <p className="text-3xl font-normal text-gray-900">
                                    {totalParticipantsCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                <MapPin className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">
                                    Finished
                                </p>
                                <p className="text-3xl font-normal text-gray-900">
                                    {finishedCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                                <CheckCircle
                                    className="text-green-600"
                                    size={24}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">
                                    Did Not Finish
                                </p>
                                <p className="text-3xl font-normal text-gray-900">
                                    {dnfCount}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertCircle
                                    className="text-red-600"
                                    size={24}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                    <div className="lg:col-span-7 bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Race Route & Positions
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Participants' last recorded positions on the
                                course
                            </p>
                        </div>
                        <div className="h-[450px]">
                            <Map
                                mapStyle="https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"
                                initialViewState={{
                                    longitude: flatCoords[0][0],
                                    latitude: flatCoords[0][1],
                                    zoom: 14,
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
                                        id="route-line"
                                        type="line"
                                        paint={{
                                            "line-width": 5,
                                            "line-color": "#1a73e8",
                                            "line-opacity": 0.6,
                                        }}
                                    />
                                </Source>

                                <Marker
                                    longitude={firstCoord[0]}
                                    latitude={firstCoord[1]}
                                >
                                    <div className="relative">
                                        {/* <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg">
                                        START
                                    </div> */}
                                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-xl border-2 border-white">
                                            <Play
                                                className="text-white"
                                                size={16}
                                            />
                                        </div>
                                    </div>
                                </Marker>

                                <Marker
                                    longitude={lastCoord[0]}
                                    latitude={lastCoord[1]}
                                >
                                    <div className="relative">
                                        {/* <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg">
                                        FINISH
                                    </div> */}
                                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-xl border-2 border-white">
                                            <Flag
                                                className="text-white"
                                                size={16}
                                            />
                                        </div>
                                    </div>
                                </Marker>

                                {raceTracking?.map((t, i) => {
                                    const userTracks = raceTracking.filter(
                                        (u) => u.user_id === t.user_id
                                    )
                                    const coordinates = userTracks.map((u) => [
                                        u.longitude,
                                        u.latitude,
                                    ])
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
                                                        name: t.users.full_name,
                                                        bib_number:
                                                            t.bib_number,
                                                    },
                                                }}
                                            >
                                                <Layer
                                                    id={`track-line-${t.user_id}`}
                                                    type="line"
                                                    paint={{
                                                        "line-color": isActive
                                                            ? "#1a73e8"
                                                            : "#888",
                                                        "line-width": isActive
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
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white transition-all ${
                                                        isActive
                                                            ? "bg-blue-700 scale-125"
                                                            : "bg-blue-400"
                                                    }`}
                                                >
                                                    <span className="text-white text-sm font-bold">
                                                        {t.bib_number ?? "?"}
                                                    </span>

                                                    {isActive && (
                                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                                                            {t.users.full_name}
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

                    <div className="lg:col-span-5 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Final Standings
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Drag rows to adjust positions or use the arrow
                                buttons
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <ResultsTable
                                results={results || []}
                                selectedUserId={selectedUserId}
                                onRowHover={onRowHover}
                                onRowClick={onRowClick}
                                onResultsChange={(results) => {
                                    console.log("results changed", results)
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Make sure all positions are correct before publishing
                    </p>
                    <div className="flex gap-3">
                        <button
                            disabled={isPublishing}
                            className="px-6 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmResults}
                            disabled={isPublishing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPublishing ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
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
                                    Publishing...
                                </>
                            ) : (
                                <>Publish Results</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
