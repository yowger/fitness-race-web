import { z } from "zod"
import { useForm, useFieldArray } from "react-hook-form"
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
// import { Textarea } from "../../../components/ui/textarea"
import {
    MapPin,
    Upload,
    X,
    Calendar,
    Users,
    ChevronRight,
    Loader2,
    Plus,
    Trash2,
    Clock,
    Flag,
    UserCheck,
    Trophy,
    Milestone,
} from "lucide-react"
import { useState } from "react"
import { RichTextEditor } from "./RichTextEditor"

const raceFormSchema = z.object({
    name: z.string().min(1, "Race name is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be 0 or more").optional(),
    bannerFile: z
        .any()
        .refine((file) => !file || file instanceof File, "Invalid file")
        .optional(),
    maxParticipants: z.string(),
    startTime: z.string(),
    events: z
        .array(
            z.object({
                name: z.string().min(1, "Event name is required"),
                type: z.enum(["registration", "race", "awards", "other"]),
                scheduledTime: z.string().min(1, "Time is required"),
            })
        )
        .optional(),
})

export type RaceFormValues = z.infer<typeof raceFormSchema>

const EVENT_TYPES = [
    {
        value: "registration",
        label: "Registration",
        icon: UserCheck,
        color: "blue",
    },
    { value: "race", label: "Race Start", icon: Flag, color: "green" },
    { value: "awards", label: "Awards", icon: Trophy, color: "amber" },
    { value: "other", label: "Other", icon: Milestone, color: "gray" },
] as const

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
            price: 0,
            description: "",
            maxParticipants: "0",
            startTime: "",
            events: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "events",
    })

    const handleSubmit = (values: RaceFormValues) => {
        if (!route?.id) return
        onSubmit({ ...values, routeId: route.id })
    }

    const clearBanner = () => {
        form.setValue("bannerFile", undefined)
        setPreview(null)
    }

    const getEventTypeConfig = (type: string) => {
        return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[3]
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Form {...form}>
                <form className="space-y-8">
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
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Registration fee
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative mt-2">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                                    ₱
                                                </span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="h-12 pl-10 text-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md"
                                                    value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value
                                                        field.onChange(
                                                            value === ""
                                                                ? undefined
                                                                : parseFloat(
                                                                      value
                                                                  )
                                                        )
                                                    }}
                                                    onBlur={() => {
                                                        if (
                                                            typeof field.value ===
                                                            "number"
                                                        ) {
                                                            field.onChange(
                                                                Number(
                                                                    field.value.toFixed(
                                                                        2
                                                                    )
                                                                )
                                                            )
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Set to 0 for free races
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Description{" "}
                                            <span className="text-gray-400 font-normal ml-2">
                                                (Optional)
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="border rounded-md p-2 mt-2">
                                                <RichTextEditor
                                                    value={form.getValues(
                                                        "description"
                                                    )}
                                                    onChange={(html) =>
                                                        form.setValue(
                                                            "description",
                                                            html
                                                        )
                                                    }
                                                />
                                            </div>
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

                            <div className="border-t border-gray-200" />

                            {/* Events Timeline Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700">
                                            Event timeline
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Add key events and milestones for
                                            your race day
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            append({
                                                name: "",
                                                type: "other",
                                                scheduledTime: "",
                                            })
                                        }
                                        className="h-9 text-sm font-medium text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Add event
                                    </Button>
                                </div>

                                {fields.length === 0 ? (
                                    <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 py-12 px-6 text-center">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Clock
                                                size={20}
                                                className="text-gray-400"
                                            />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                            No events added yet
                                        </p>
                                        <p className="text-xs text-gray-500 mb-4">
                                            Create a timeline for registration,
                                            race start, awards, and more
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                append({
                                                    name: "",
                                                    type: "other",
                                                    scheduledTime: "",
                                                })
                                            }
                                            className="text-sm"
                                        >
                                            <Plus size={16} className="mr-2" />
                                            Add your first event
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {fields.map((field, index) => {
                                            const eventType = form.watch(
                                                `events.${index}.type`
                                            )
                                            const config = getEventTypeConfig(
                                                eventType || ""
                                            )
                                            const Icon = config.icon

                                            return (
                                                <div
                                                    key={field.id}
                                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                                                >
                                                    <div className="flex gap-3">
                                                        {/* Icon */}
                                                        <div
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                                                config.color ===
                                                                "blue"
                                                                    ? "bg-blue-50"
                                                                    : config.color ===
                                                                      "green"
                                                                    ? "bg-green-50"
                                                                    : config.color ===
                                                                      "amber"
                                                                    ? "bg-amber-50"
                                                                    : "bg-gray-100"
                                                            }`}
                                                        >
                                                            <Icon
                                                                size={18}
                                                                className={`${
                                                                    config.color ===
                                                                    "blue"
                                                                        ? "text-blue-600"
                                                                        : config.color ===
                                                                          "green"
                                                                        ? "text-green-600"
                                                                        : config.color ===
                                                                          "amber"
                                                                        ? "text-amber-600"
                                                                        : "text-gray-600"
                                                                }`}
                                                            />
                                                        </div>

                                                        {/* Form Fields */}
                                                        <div className="flex-1 space-y-3">
                                                            <div className="grid md:grid-cols-2 gap-3">
                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name={`events.${index}.name`}
                                                                    render={({
                                                                        field,
                                                                    }) => (
                                                                        <FormItem>
                                                                            <FormLabel className="text-xs font-medium text-gray-600">
                                                                                Event
                                                                                name
                                                                            </FormLabel>
                                                                            <FormControl>
                                                                                <Input
                                                                                    placeholder="Registration Opens"
                                                                                    className="h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                                                    {...field}
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage className="text-xs" />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name={`events.${index}.type`}
                                                                    render={({
                                                                        field,
                                                                    }) => (
                                                                        <FormItem>
                                                                            <FormLabel className="text-xs font-medium text-gray-600">
                                                                                Type
                                                                            </FormLabel>
                                                                            <FormControl>
                                                                                <select
                                                                                    {...field}
                                                                                    className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                                                                                >
                                                                                    {EVENT_TYPES.map(
                                                                                        (
                                                                                            type
                                                                                        ) => (
                                                                                            <option
                                                                                                key={
                                                                                                    type.value
                                                                                                }
                                                                                                value={
                                                                                                    type.value
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    type.label
                                                                                                }
                                                                                            </option>
                                                                                        )
                                                                                    )}
                                                                                </select>
                                                                            </FormControl>
                                                                            <FormMessage className="text-xs" />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>

                                                            <div className="flex gap-3">
                                                                <FormField
                                                                    control={
                                                                        form.control
                                                                    }
                                                                    name={`events.${index}.scheduledTime`}
                                                                    render={({
                                                                        field,
                                                                    }) => (
                                                                        <FormItem className="flex-1">
                                                                            <FormLabel className="text-xs font-medium text-gray-600">
                                                                                Scheduled
                                                                                time
                                                                            </FormLabel>
                                                                            <FormControl>
                                                                                <div className="relative">
                                                                                    <Clock
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                                                    />
                                                                                    <Input
                                                                                        type="datetime-local"
                                                                                        className="h-10 pl-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                                                        {...field}
                                                                                    />
                                                                                </div>
                                                                            </FormControl>
                                                                            <FormMessage className="text-xs" />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                <div className="flex items-end">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            remove(
                                                                                index
                                                                            )
                                                                        }
                                                                        className="h-10 w-10 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash2
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
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
                                onClick={form.handleSubmit(handleSubmit)}
                                type="submit"
                                disabled={!route || isLoading}
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
