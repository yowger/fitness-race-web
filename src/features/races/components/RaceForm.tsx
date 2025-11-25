import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../../../components/ui/button"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"
import { MapPin } from "lucide-react"

const raceFormSchema = z.object({
    name: z.string().min(1, "Race name is required"),
    maxParticipants: z.string(),
    startTime: z.string().optional(),
})

export type RaceFormValues = z.infer<typeof raceFormSchema>

export function RaceForm({
    route,
    onSubmit,
}: {
    route: {
        id: string
        mapUrl: string
        name: string
        distanceKm?: number
        imageUrl?: string
    } | null
    setRouteId: (id: string) => void
    onSubmit: (data: RaceFormValues & { routeId: string }) => void
}) {
    const form = useForm<RaceFormValues>({
        resolver: zodResolver(raceFormSchema),
        defaultValues: {
            name: "",
            maxParticipants: "0",
            startTime: "",
        },
    })

    const handleSubmit = (values: RaceFormValues) => {
        if (!route?.id) return
        onSubmit({ ...values, routeId: route.id })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6 p-6 border rounded-lg shadow-sm bg-white"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel>Race Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: Sunday Fun Run"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {route ? (
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm transition-all duration-200">
                        <div className="relative h-56 bg-gray-100 overflow-hidden">
                            <img
                                src={route.mapUrl || route.imageUrl}
                                alt={route.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                        </div>

                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h3 className="text-xl text-gray-900 leading-tight">
                                    {route.name}
                                </h3>
                                {route.distanceKm && (
                                    <div className="shrink-0 bg-blue-50 px-3 py-1.5 rounded-full">
                                        <span className="text-sm font-medium text-blue-700">
                                            {route.distanceKm.toFixed(2)} km
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin size={16} className="text-gray-400" />
                                <span>Route ID: {route.id}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 h-64 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <MapPin size={28} className="text-gray-400" />
                        </div>
                        <p className="text-base text-gray-500 font-medium mb-1">
                            No route selected
                        </p>
                        <p className="text-sm text-gray-400">
                            Choose a route from the list to get started
                        </p>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel>Max Participants (optional)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="Ex: 100"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel>Start Time (optional)</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Create Race
                </Button>
            </form>
        </Form>
    )
}
