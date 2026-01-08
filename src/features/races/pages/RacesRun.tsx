import { useParams } from "react-router-dom"
import { useRace } from "../hooks/useRaces"
import Map, { Marker, Source, Layer } from "@vis.gl/react-maplibre"
import { io, type Socket } from "socket.io-client"
import { useEffect, useRef, useState } from "react"
import { Flag, Play, User } from "lucide-react"
import { getBoundsFromCoords } from "../../../lib/geo"

const SOCKET_URL = import.meta.env.VITE_PUBLIC_SOCKET_URL

type LiveState = {
    lat: number
    lng: number
    speed: number
    distance: number
}

export default function RacesRun() {
    const { id: raceId } = useParams()
    const { data: race } = useRace(raceId!)
    const socketRef = useRef<Socket | null>(null)

    const [myState, setMyState] = useState<LiveState | null>(null)

    const coords =
        race?.routes?.geojson.features?.[0]?.geometry?.coordinates ?? []

    const flatCoords: [number, number][] = Array.isArray(coords[0])
        ? (coords as [number, number][])
        : []

    const firstCoord = flatCoords[0]
    const lastCoord = flatCoords[flatCoords.length - 1]

    useEffect(() => {
        const s = io(SOCKET_URL)
        socketRef.current = s

        s.emit("joinRace", { raceId })

        return () => {
            s.emit("leaveRace", { raceId })
            s.disconnect()
        }
    }, [raceId])

    useEffect(() => {
        if (!navigator.geolocation) return

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, speed } = pos.coords

                const next = {
                    lat: latitude,
                    lng: longitude,
                    speed: speed ? speed * 3.6 : 0,
                    distance: 0,
                }

                setMyState(next)

                socketRef.current?.emit("participantUpdate", {
                    raceId,
                    coords: [longitude, latitude],
                    speed: speed ?? 0,
                    timestamp: Date.now(),
                })
            },
            console.error,
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 10000,
            }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [raceId])

    return (
        <div className="h-[450px] w-full">
            <Map
                mapStyle="https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"
                attributionControl={false}
                onLoad={(e) => {
                    if (flatCoords.length > 1) {
                        e.target.fitBounds(getBoundsFromCoords(flatCoords), {
                            padding: 60,
                            duration: 800,
                        })
                    }
                }}
            >
                <Source
                    id="route"
                    type="geojson"
                    data={{
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: flatCoords,
                        },
                        properties: {},
                    }}
                >
                    <Layer
                        id="route-line"
                        type="line"
                        paint={{
                            "line-color": "#3B82F6",
                            "line-width": 5,
                        }}
                    />
                </Source>

                {firstCoord && (
                    <Marker longitude={firstCoord[0]} latitude={firstCoord[1]}>
                        <div className="p-2 bg-green-600 rounded-full text-white">
                            <Play size={16} />
                        </div>
                    </Marker>
                )}

                {lastCoord && (
                    <Marker longitude={lastCoord[0]} latitude={lastCoord[1]}>
                        <div className="p-2 bg-red-600 rounded-full text-white">
                            <Flag size={16} />
                        </div>
                    </Marker>
                )}

                {myState && (
                    <Marker longitude={myState.lng} latitude={myState.lat}>
                        <div className="p-2 bg-blue-600 rounded-full text-white">
                            <User size={16} />
                        </div>
                    </Marker>
                )}
            </Map>
        </div>
    )
}
