// import { useEffect, useState } from "react"
// import { io } from "socket.io-client"
// import { Layer, Map, Source } from "@vis.gl/react-maplibre"
// import "maplibre-gl/dist/maplibre-gl.css"
// import { useRoute } from "../../routes/api/useRoutes"
// import {
//     ResizableHandle,
//     ResizablePanel,
//     ResizablePanelGroup,
// } from "../../../components/ui/resizable"
// import { Play, Square, Users } from "lucide-react"
// import { useParams } from "react-router-dom"
// import { useRace } from "../hooks/useRaces"

// const MAP_STYLE =
//     "https://api.maptiler.com/maps/streets-v4/style.json?key=l60bj9KIXXKDXbsOvzuz"

// const START = {
//     lat: 7.0731,
//     lng: 125.6128,
// }

// const SOCKET_URL = import.meta.env.VITE_PUBLIC_SOCKET_URL
// type UserIdentity = {
//     id: string
//     name: string
//     role: "admin" | "racer" | "guest"
//     bib?: number
// }

// type LiveRaceState = {
//     lat: number
//     lng: number
//     finished: boolean
//     speed?: number
//     distance?: number
//     lastUpdate?: number
// }

// type RaceUser = UserIdentity & { state: LiveRaceState }

// const RacesLivePage = () => {
//     const { id } = useParams()

//     const { data: race } = useRace(id!)
//     const raceParticipants = race?.participants

//     const socket = io(SOCKET_URL)
//     const [participants, setParticipants] = useState<RaceUser[]>([])
//     const [finishedParticipants, setFinishedParticipants] = useState<
//         RaceUser[]
//     >([])
//     const allParticipants = [...participants, ...finishedParticipants]

//     const coords =
//         race?.routes?.geojson.features?.[0]?.geometry?.coordinates ?? []

//     const lineData = {
//         type: "Feature",
//         properties: {},
//         geometry: { type: "LineString", coordinates: coords },
//     } as const

//     return (
//         <div className="flex flex-col h-screen overflow-hidden">
//             <ResizablePanelGroup
//                 direction="horizontal"
//                 className="h-full border rounded-lg overflow-hidden shadow"
//             >
//                 <ResizablePanel defaultSize={70}>
//                     <Map
//                         attributionControl={false}
//                         initialViewState={{
//                             latitude: START.lat,
//                             longitude: START.lng,
//                             zoom: 14,
//                         }}
//                         style={{ width: "100%", height: "100%" }}
//                         mapStyle={MAP_STYLE}
//                     >
//                         <Source id="route" type="geojson" data={lineData}>
//                             <Layer
//                                 id="route-line"
//                                 type="line"
//                                 paint={{
//                                     "line-color": "#2563EB",
//                                     "line-width": 8,
//                                     "line-opacity": 0.7,
//                                 }}
//                             />
//                         </Source>

//                         <Source
//                             id="participants"
//                             type="geojson"
//                             data={{
//                                 type: "FeatureCollection",
//                                 features: allParticipants
//                                     .filter((p) => p.state.lat && p.state.lng)
//                                     .map((p) => ({
//                                         type: "Feature",
//                                         geometry: {
//                                             type: "Point",
//                                             coordinates: [
//                                                 p.state.lng,
//                                                 p.state.lat,
//                                             ],
//                                         },
//                                         properties: {
//                                             name: p.name,
//                                             bib: p.bib ?? 0,
//                                             finished: p.state.finished,
//                                         },
//                                     })),
//                             }}
//                         >
//                             <Layer
//                                 id="participant-points"
//                                 type="circle"
//                                 paint={{
//                                     "circle-radius": 12,
//                                     "circle-color": [
//                                         "case",
//                                         ["get", "finished"],
//                                         "#EF4444",
//                                         "#f97316",
//                                     ],
//                                     "circle-stroke-width": 1,
//                                     "circle-stroke-color": "#fff",
//                                 }}
//                             />
//                             <Layer
//                                 id="participant-labels"
//                                 type="symbol"
//                                 layout={{
//                                     "text-field": ["get", "bib"],
//                                     "text-size": 12,
//                                     "text-font": [
//                                         "Open Sans Bold",
//                                         "Arial Unicode MS Bold",
//                                     ],
//                                     "text-anchor": "center",
//                                 }}
//                                 paint={{
//                                     "text-color": "#fff",
//                                 }}
//                             />
//                         </Source>
//                     </Map>
//                 </ResizablePanel>

//                 <ResizableHandle withHandle />

//                 <ResizablePanel defaultSize={35}>
//                     <div className="h-full bg-white border-l overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
//                             <h1 className="text-xl font-medium text-gray-800">
//                                 Race Dashboard
//                             </h1>
//                         </div>

//                         <div className="p-4 space-y-6">
//                             <div className="space-y-3">
//                                 <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-shadow shadow-sm">
//                                     <Play size={16} /> Start Race
//                                 </button>
//                                 <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-shadow shadow-sm">
//                                     <Square size={16} /> Stop Race
//                                 </button>
//                             </div>

//                             <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
//                                 <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
//                                     <Users
//                                         size={18}
//                                         className="text-gray-600"
//                                     />
//                                     <h2 className="text-lg font-medium text-gray-800">
//                                         Participants{" "}
//                                         <span className="text-gray-500 font-normal">
//                                             ({participants.length})
//                                         </span>
//                                     </h2>
//                                 </div>
//                                 <div className="divide-y divide-gray-100">
//                                     {allParticipants.length === 0 ? (
//                                         <div className="px-4 py-6 text-center text-sm text-gray-500">
//                                             Waiting for participants...
//                                         </div>
//                                     ) : (
//                                         allParticipants.map((p) => (
//                                             <div
//                                                 key={p.id}
//                                                 className="px-4 py-3 hover:bg-gray-50 transition-colors flex justify-between items-center"
//                                             >
//                                                 <span className="text-sm font-medium text-gray-900">
//                                                     {p.name}
//                                                 </span>
//                                                 <span
//                                                     className={`text-xs px-2 py-1 rounded-full ${
//                                                         p.state.finished
//                                                             ? "bg-green-100 text-green-700"
//                                                             : "bg-blue-100 text-blue-700"
//                                                     }`}
//                                                 >
//                                                     {p.state.finished
//                                                         ? "Finished"
//                                                         : "Running"}
//                                                 </span>
//                                             </div>
//                                         ))
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </ResizablePanel>
//             </ResizablePanelGroup>
//         </div>
//     )
// }

// export default RacesLivePage
