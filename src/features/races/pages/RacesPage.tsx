import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"

import { Card, CardContent } from "../../../components/ui/card"
import { Users, Clock, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../../components/ui/tabs"

const dummyRaces = [
    {
        id: "race_1",
        name: "Sunday Fun Run",
        routeName: "Coastal Sunrise Trail",
        routeImage:
            "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop",
        distanceKm: 8.45,
        startTime: "2025-12-20T06:00",
        maxParticipants: 100,
        joined: 45,
        status: "upcoming",
    },
    {
        id: "race_2",
        name: "Holiday Night Dash",
        routeName: "City Lights Loop",
        routeImage:
            "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=800&h=400&fit=crop",
        distanceKm: 5.0,
        startTime: "2025-12-05T20:00",
        maxParticipants: 120,
        joined: 112,
        status: "ongoing",
    },
    {
        id: "race_3",
        name: "Mountain Breaker Run",
        routeName: "Sierra Ridge Track",
        routeImage:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=400&fit=crop",
        distanceKm: 12.2,
        startTime: "2025-11-10T07:00",
        maxParticipants: 200,
        joined: 200,
        status: "completed",
    },
]

export default function RacesPage() {
    const [search, setSearch] = useState("")

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Races</h1>
                <Link to="/dashboard/races/create">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Race
                    </Button>
                </Link>
            </div>

            <div>
                <Input
                    placeholder="Search races..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                {["upcoming", "ongoing", "completed"].map((tab) => (
                    <TabsContent key={tab} value={tab} className="space-y-4">
                        {dummyRaces
                            .filter(
                                (r) =>
                                    r.status === tab &&
                                    r.name
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                            )
                            .map((race) => (
                                <RaceCard key={race.id} race={race} />
                            ))}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

function RaceCard({ race }: { race: any }) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition border-gray-200">
            <CardContent className="p-0">
                <div className="relative h-40">
                    <img
                        src={race.routeImage}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 bg-black/50 text-white px-3 py-1 text-sm">
                        {race.routeName}
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium">{race.name}</h2>
                        <span className="text-sm text-gray-600">
                            {race.distanceKm} km
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        {new Date(race.startTime).toLocaleString()}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} className="text-gray-400" />
                        {race.joined}/{race.maxParticipants} participants
                    </div>

                    <Link to={`/races/${race.id}`}>
                        <Button variant="outline" className="w-full">
                            View Race Details
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
