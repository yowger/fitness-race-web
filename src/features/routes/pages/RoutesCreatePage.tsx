import {
    Map,
    Source,
    Layer,
    type MapLayerMouseEvent,
} from "@vis.gl/react-maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { useState } from "react"
import { toast } from "sonner"

import { useSnapRoute } from "../api/useSnapRoute"
import type { LatLng } from "../types/routesTypes"

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "../../../components/ui/resizable"
import { Save, Trash2, Undo } from "lucide-react"
import { getRouteDistance } from "../utils"

const MAP_STYLE =
    "https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"

const STARTING_POINT: LatLng = {
    lat: 7.0731,
    lng: 125.6128,
}

function formatWaypoints(points: LatLng[]) {
    return points.map((p) => ({
        location: [p.lng, p.lat],
    }))
}

const CreateRoutesPage = () => {
    const [routePoints, setRoutePoints] = useState<
        { lng: number; lat: number }[]
    >([])
    const [routeName, setRouteName] = useState("")
    const snapRouteMutation = useSnapRoute()

    const handleMapClick = (event: MapLayerMouseEvent) => {
        const { lng, lat } = event.lngLat
        setRoutePoints([...routePoints, { lng, lat }])
    }

    const handleSnapToRoad = async () => {
        const formattedWaypoints = formatWaypoints(routePoints)
        try {
            const data = await snapRouteMutation.mutateAsync(formattedWaypoints)
            if (!data) throw Error()
            const snappedPoints: LatLng[] = data.features.flatMap((feature) =>
                feature.geometry.coordinates.flatMap((line) =>
                    line.map(([lng, lat]) => ({ lat, lng }))
                )
            )
            setRoutePoints(snappedPoints)
        } catch {
            toast.error("Failed to snap route")
        }
    }

    const lineData = {
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: routePoints.map((p) => [p.lng, p.lat]),
        },
    } as const

    const handleSaveRoute = async () => {
        if (routePoints.length < 2) {
            toast.error("Add at least 2 points to create a route.")
            return
        }

        try {
            const res = await fetch("/api/routes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ points: routePoints }),
            })
            if (!res.ok) throw new Error("Failed to save route")
            toast.success("Route saved!")
            setRoutePoints([])
        } catch {
            toast.error("Failed to save route")
        }
    }

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="h-[600px] border rounded-lg overflow-hidden"
        >
            <ResizablePanel defaultSize={70}>
                <div className="h-full">
                    <Map
                        attributionControl={false}
                        initialViewState={{
                            latitude: STARTING_POINT.lat,
                            longitude: STARTING_POINT.lng,
                            zoom: 15,
                        }}
                        style={{ width: "100%", height: "100%" }}
                        mapStyle={MAP_STYLE}
                        onClick={handleMapClick}
                    >
                        {routePoints.length > 1 && (
                            <Source
                                id="route-line"
                                type="geojson"
                                data={lineData}
                            >
                                <Layer
                                    id="route-layer"
                                    type="line"
                                    paint={{
                                        "line-color": "#00FFAA",
                                        "line-width": 5,
                                        "line-opacity": 0.8,
                                    }}
                                />
                            </Source>
                        )}

                        {routePoints.length > 0 && (
                            <Source
                                id="route-points"
                                type="geojson"
                                data={{
                                    type: "FeatureCollection",
                                    features: routePoints.map((p) => ({
                                        type: "Feature",
                                        properties: {},
                                        geometry: {
                                            type: "Point",
                                            coordinates: [p.lng, p.lat],
                                        },
                                    })),
                                }}
                            >
                                <Layer
                                    id="route-points-layer"
                                    type="circle"
                                    paint={{
                                        "circle-radius": 5,
                                        "circle-color": "#000000",
                                        "circle-stroke-width": 1,
                                        "circle-stroke-color": "#ffffff",
                                    }}
                                />
                            </Source>
                        )}
                    </Map>
                </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={30}>
                <div className="w-full h-full bg-linear-to-b from-slate-50 to-slate-100 border-l border-slate-200 flex flex-col">
                    <div className="bg-white border-b border-slate-200 p-4 shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                            Route Manager
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Create and save your routes
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Route Name
                            </label>
                            <input
                                type="text"
                                value={routeName}
                                onChange={(e) => setRouteName(e.target.value)}
                                placeholder="Enter route name..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                Current Route
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        Points:
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        {routePoints.length}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">
                                        Distance:
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        {routePoints.length > 1
                                            ? getRouteDistance(
                                                  routePoints
                                              ).toFixed(2) + " km"
                                            : "0 km"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={handleSaveRoute}
                                disabled={
                                    !routeName.trim() ||
                                    routePoints.length === 0
                                }
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg"
                            >
                                <Save className="w-5 h-5" />
                                Save Route
                            </button>

                            <button
                                onClick={() =>
                                    setRoutePoints(routePoints.slice(0, -1))
                                }
                                disabled={routePoints.length === 0}
                                className="w-full bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 font-semibold py-3 px-4 rounded-lg shadow border border-slate-300 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <Undo className="w-5 h-5" />
                                Undo Last Point
                            </button>

                            <button
                                onClick={() => setRoutePoints([])}
                                disabled={routePoints.length === 0}
                                className="w-full bg-white hover:bg-red-50 disabled:bg-slate-100 disabled:cursor-not-allowed text-red-600 font-semibold py-3 px-4 rounded-lg shadow border border-slate-300 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Clear All Points
                            </button>

                            <button
                                onClick={handleSnapToRoad}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                Snap to Road
                            </button>
                        </div>

                        {/* {savedRoutes.length > 0 && (
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 mt-2 flex-1 overflow-auto">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                    Saved Routes
                                </h3>
                                <div className="space-y-2">
                                    {savedRoutes.map((route) => (
                                        <div
                                            key={route.id}
                                            className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                                        >
                                            <div className="font-semibold text-sm text-slate-800">
                                                {route.name}
                                            </div>
                                            <div className="flex gap-3 mt-1 text-xs text-slate-600">
                                                <span>
                                                    {route.points} points
                                                </span>
                                                <span>•</span>
                                                <span>{route.distance}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}
                    </div>

                    <div className="bg-white border-t border-slate-200 p-3">
                        <p className="text-xs text-slate-500 text-center">
                            Click on map to add points
                        </p>
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

export default CreateRoutesPage
