import { Layer, Map, Source } from "@vis.gl/react-maplibre"

import "maplibre-gl/dist/maplibre-gl.css"
import { useRoute } from "../routes/api/useRoutes"

const MAP_STYLE =
    "https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"

const START = {
    lat: 7.0731,
    lng: 125.6128,
}

const RacesLivePage = () => {
    const { data: route, isLoading } = useRoute(
        "8a4ee9ef-72c5-4581-949c-dfb3ef33c61e"
    )

    if (!route) {
        return <div>Route data not available.</div>
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-slate-600">Loading race route...</div>
            </div>
        )
    }

    const coords = route.geojson.features?.[0]?.geometry?.coordinates ?? []

    const lineData = {
        type: "Feature",
        properties: {},
        geometry: {
            type: "LineString",
            coordinates: coords,
        },
    } as const

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">Race Details</h1>

            <div className="rounded-2xl overflow-hidden border shadow-sm h-[400px]">
                <Map
                    attributionControl={false}
                    initialViewState={{
                        latitude: START.lat,
                        longitude: START.lng,
                        zoom: 14,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle={MAP_STYLE}
                >
                    <Source id="route" type="geojson" data={lineData}>
                        <Layer
                            id="route-line"
                            type="line"
                            paint={{
                                "line-color": "#2563EB",
                                "line-width": 8,
                                "line-opacity": 0.7,
                            }}
                        />
                    </Source>
                </Map>
            </div>
        </div>
    )
}

export default RacesLivePage
