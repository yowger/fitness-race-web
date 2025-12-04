import { useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { Image } from "lucide-react"
import { RaceForm, type RaceFormValues } from "../components/RaceForm"
import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../../../components/ui/sheet"
import { useRoutes } from "../../routes/api/useRoutes"

import { toast } from "sonner"
import { useCreateRace } from "../hooks/useRaces"
import { useNavigate } from "react-router-dom"

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

const formatDistance = (km: number) => `${km.toFixed(2)} km`

const getInitials = (name: string) =>
    name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "U"

export default function RaceCreatePage() {
    const navigate = useNavigate()

    const [sheetOpen, setSheetOpen] = useState(false)
    const [selectedRouteId, setSelectedRouteId] = useState<string>("")
    const createRaceMutation = useCreateRace()

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useRoutes(20)

    const routes = data?.pages.flat() ?? []
    const selectedRoute = routes.find((r) => r.id === selectedRouteId)

    const handleCreate = (values: RaceFormValues & { routeId: string }) => {
        createRaceMutation.mutate(
            {
                name: values.name,
                max_participants: Number(values.maxParticipants || 0),
                start_time: values.startTime || new Date().toISOString(),
                route_id: values.routeId,
            },
            {
                onSuccess: () => {
                    setSelectedRouteId("")
                    toast.success("Race created successfully.")

                    navigate("/dashboard/races")
                },
                onError: () => {
                    toast.error("Failed to create race.")
                },
            }
        )
    }

    if (isLoading) {
        return <div className="p-6">Loading routes...</div>
    }
    if (isError) {
        return <div className="p-6 text-red-600">Failed to load routes.</div>
    }

    return (
        <div className="flex gap-6 p-6">
            <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Create Race</h2>

                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button onClick={() => setSheetOpen(true)}>
                                Select Route
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-[420px]">
                            <SheetHeader>
                                <SheetTitle>Select a Route</SheetTitle>
                            </SheetHeader>

                            <div className="mt-4">
                                <InfiniteScroll
                                    dataLength={routes.length}
                                    next={() => fetchNextPage()}
                                    hasMore={!!hasNextPage}
                                    loader={
                                        <p className="text-center py-4">
                                            Loading more...
                                        </p>
                                    }
                                    height={600}
                                >
                                    <div className="space-y-3 px-2">
                                        {routes.map((route) => (
                                            <Card
                                                key={route.id}
                                                className={`cursor-pointer border ${
                                                    route.id === selectedRouteId
                                                        ? "border-blue-500 ring-2 ring-blue-100"
                                                        : "border-gray-200"
                                                }`}
                                                onClick={() => {
                                                    setSelectedRouteId(route.id)
                                                    setSheetOpen(false)
                                                }}
                                            >
                                                <CardContent className="p-0">
                                                    {route.map_url ? (
                                                        <img
                                                            src={route.map_url}
                                                            alt={route.name}
                                                            className="w-full h-36 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-36 flex items-center justify-center bg-gray-50">
                                                            <Image
                                                                size={48}
                                                                className="text-slate-300"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-medium text-sm">
                                                                {route.name}
                                                            </div>
                                                            {route.distance !=
                                                                null && (
                                                                <div className="text-xs text-slate-500">
                                                                    {formatDistance(
                                                                        route.distance
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {route.description && (
                                                            <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                                {
                                                                    route.description
                                                                }
                                                            </div>
                                                        )}

                                                        <div className="mt-3 flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                                                {route.users
                                                                    ?.avatar_url ? (
                                                                    <img
                                                                        src={
                                                                            route
                                                                                .users
                                                                                .avatar_url
                                                                        }
                                                                        alt={
                                                                            route
                                                                                .users
                                                                                .full_name
                                                                        }
                                                                        className="w-full h-full rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    getInitials(
                                                                        route
                                                                            .users
                                                                            ?.full_name ??
                                                                            "Unknown"
                                                                    )
                                                                )}
                                                            </div>

                                                            <div className="text-xs text-slate-500">
                                                                {route.created_at
                                                                    ? formatDate(
                                                                          route.created_at
                                                                      )
                                                                    : "Unknown"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {isFetchingNextPage && (
                                            <p className="text-center py-4">
                                                Loading...
                                            </p>
                                        )}
                                    </div>
                                </InfiniteScroll>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <RaceForm
                    route={
                        selectedRoute
                            ? {
                                  id: selectedRoute.id,
                                  mapUrl: selectedRoute.map_url ?? "",
                                  name: selectedRoute.name,
                                  distanceKm:
                                      selectedRoute.distance ?? undefined,
                                  imageUrl: selectedRoute.map_url ?? "",
                              }
                            : null
                    }
                    setRouteId={setSelectedRouteId}
                    onSubmit={handleCreate}
                />
            </div>
        </div>
    )
}
