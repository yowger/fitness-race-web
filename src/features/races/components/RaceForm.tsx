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
import { Textarea } from "../../../components/ui/textarea"
import {
    MapPin,
    Upload,
    X,
    Calendar,
    Users,
    ChevronRight,
    Loader2,
} from "lucide-react"
import { useState } from "react"

const raceFormSchema = z.object({
    name: z.string().min(1, "Race name is required"),
    description: z.string().optional(),
    bannerFile: z
        .any()
        .refine((file) => !file || file instanceof File, "Invalid file")
        .optional(),
    maxParticipants: z.string(),
    startTime: z.string(),
})

export type RaceFormValues = z.infer<typeof raceFormSchema>

export function RaceForm({
    route,
    onSubmit,
    onToggleSheet,
    isLoading,
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
    onToggleSheet?: () => void
    isLoading?: boolean
}) {
    const [preview, setPreview] = useState<string | null>(null)
    const form = useForm<RaceFormValues>({
        resolver: zodResolver(raceFormSchema),
        defaultValues: {
            name: "",
            description: "",
            maxParticipants: "0",
            startTime: "",
        },
    })

    const handleSubmit = (values: RaceFormValues) => {
        if (!route?.id) return
        onSubmit({ ...values, routeId: route.id })
    }

    const clearBanner = () => {
        form.setValue("bannerFile", undefined)
        setPreview(null)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-8"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-normal text-gray-900">
                            Create a new race
                        </h2>
                        <p className="text-base text-gray-600">
                            Fill in the details below to set up your race event
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-8 space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Race name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter race name"
                                                className="mt-2 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-sm mt-2" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Description
                                            <span className="text-gray-400 font-normal ml-2">
                                                (Optional)
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Add a description for your race"
                                                className="mt-2 min-h-24 text-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-sm mt-2" />
                                    </FormItem>
                                )}
                            />

                            <div className="border-t border-gray-200" />

                            <FormField
                                control={form.control}
                                name="bannerFile"
                                render={({ field }) => {
                                    const handleFileChange = (
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        const file = e.target.files?.[0]
                                        field.onChange(file)
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => {
                                                setPreview(
                                                    reader.result as string
                                                )
                                            }
                                            reader.readAsDataURL(file)
                                        } else {
                                            setPreview(null)
                                        }
                                    }

                                    return (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Race banner
                                                <span className="text-gray-400 font-normal ml-2">
                                                    (Optional)
                                                </span>
                                            </FormLabel>

                                            {!preview ? (
                                                <div className="mt-2 relative">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                        className="hidden"
                                                        id="banner-upload"
                                                    />
                                                    <label
                                                        htmlFor="banner-upload"
                                                        className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                                                    >
                                                        <div className="text-center">
                                                            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                                <Upload
                                                                    size={20}
                                                                    className="text-gray-600"
                                                                />
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                                Upload a banner
                                                                image
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                PNG, JPG up to
                                                                10MB
                                                            </p>
                                                        </div>
                                                    </label>
                                                </div>
                                            ) : (
                                                <div className="mt-2 relative group rounded-lg overflow-hidden">
                                                    <img
                                                        src={preview}
                                                        alt="Race Banner Preview"
                                                        className="w-full h-56 object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={clearBanner}
                                                        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                    >
                                                        <X
                                                            size={16}
                                                            className="text-gray-700"
                                                        />
                                                    </button>
                                                </div>
                                            )}
                                            <FormMessage className="text-sm mt-2" />
                                        </FormItem>
                                    )
                                }}
                            />

                            <div className="border-t border-gray-200" />

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-700">
                                        Selected route
                                    </h3>
                                    {onToggleSheet && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={onToggleSheet}
                                            className="h-9 text-sm font-medium text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                        >
                                            {route
                                                ? "Change route"
                                                : "Browse routes"}
                                            <ChevronRight
                                                size={16}
                                                className="ml-1"
                                            />
                                        </Button>
                                    )}
                                </div>
                                {route ? (
                                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                        <div className="relative h-48 bg-gray-200">
                                            <img
                                                src={
                                                    route.mapUrl ||
                                                    route.imageUrl
                                                }
                                                alt={route.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base font-medium text-gray-900 truncate mb-1">
                                                        {route.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin
                                                            size={14}
                                                            className="text-gray-400 shrink-0"
                                                        />
                                                        <span className="truncate">
                                                            ID: {route.id}
                                                        </span>
                                                    </div>
                                                </div>
                                                {route.distanceKm && (
                                                    <div className="shrink-0 bg-blue-50 px-3 py-1.5 rounded-full">
                                                        <span className="text-sm font-medium text-blue-700">
                                                            {route.distanceKm.toFixed(
                                                                2
                                                            )}{" "}
                                                            km
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={onToggleSheet}
                                        className="w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 h-48 flex flex-col items-center justify-center text-center px-6 hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                                            <MapPin
                                                size={20}
                                                className="text-gray-400 group-hover:text-blue-600 transition-colors"
                                            />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                            No route selected
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Click to browse and select a route
                                        </p>
                                    </button>
                                )}
                            </div>

                            <div className="border-t border-gray-200" />

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="maxParticipants"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Maximum participants
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative mt-2">
                                                    <Users
                                                        size={18}
                                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                                    />
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        placeholder="100"
                                                        className="h-12 pl-11 text-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-sm mt-2" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Start date & time
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative mt-2">
                                                    <Calendar
                                                        size={18}
                                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                    />
                                                    <Input
                                                        type="datetime-local"
                                                        className="h-12 pl-11 text-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-sm mt-2" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 px-6 text-sm font-medium border-gray-300 hover:bg-gray-100"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!route}
                                className="h-11 px-8 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading && (
                                    <Loader2
                                        className="mr-2 h-4 w-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}

                                {isLoading ? "Creating race..." : "Create race"}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
