import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useRace, useUpdateRaceTime } from "../hooks/useRaces"
import {
    Calendar,
    Clock,
    AlertCircle,
    Send,
    ArrowLeft,
    Info,
} from "lucide-react"
import { format } from "date-fns"

export default function RacesUpdateTimePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { data: race, isLoading, isError } = useRace(id!)
    const updateRaceTimeMutation = useUpdateRaceTime()

    const [startTime, setStartTime] = useState(
        () => race?.start_time?.slice(0, 16) || "",
    )
    const [endTime, setEndTime] = useState(
        () => race?.end_time?.slice(0, 16) || "",
    )
    const [message, setMessage] = useState("")

    if (race && startTime === "" && endTime === "") {
        setStartTime(race.start_time?.slice(0, 16) || "")
        setEndTime(race.end_time?.slice(0, 16) || "")
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        updateRaceTimeMutation.mutate(
            {
                race_id: race!.id,
                start_time: startTime || undefined,
                end_time: endTime || undefined,
                message: message || undefined,
            },
            {
                onSuccess: () => {
                    navigate(`/dashboard/races/${race!.id}`)
                },
            },
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading race details...</p>
                </div>
            </div>
        )
    }

    if (isError || !race) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Race Not Found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        The race you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate("/dashboard/races")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Races
                    </button>
                </div>
            </div>
        )
    }

    const hasChanges =
        startTime !== (race.start_time?.slice(0, 16) || "") ||
        endTime !== (race.end_time?.slice(0, 16) || "") ||
        message.trim() !== ""

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Update Race Schedule
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Adjust start and end times for your race
                            </p>
                        </div>
                    </div>
                </div>

                {/* Race Info Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                    <div className="flex items-start gap-4">
                        {race.banner_url ? (
                            <img
                                src={race.banner_url}
                                alt={race.name}
                                className="w-20 h-20 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                {race.name.charAt(0)}
                            </div>
                        )}

                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {race.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        race.status === "upcoming"
                                            ? "bg-blue-100 text-blue-700"
                                            : race.status === "ongoing"
                                              ? "bg-green-100 text-green-700"
                                              : "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {race.status.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {race.participants?.length || 0}{" "}
                                    participants
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Current Times */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Current Schedule:
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="text-xs text-gray-500">
                                        Start Time
                                    </div>
                                    <div className="font-medium text-gray-900">
                                        {format(
                                            new Date(race.start_time),
                                            "MMM d, yyyy 'at' h:mm a",
                                        )}
                                    </div>
                                </div>
                            </div>
                            {race.end_time && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <div className="text-xs text-gray-500">
                                            End Time
                                        </div>
                                        <div className="font-medium text-gray-900">
                                            {format(
                                                new Date(race.end_time),
                                                "MMM d, yyyy 'at' h:mm a",
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">
                            Important Information
                        </p>
                        <p className="text-blue-700">
                            All registered participants will be notified of any
                            schedule changes. Make sure to provide a clear
                            message explaining the reason for the update.
                        </p>
                    </div>
                </div>

                {/* Update Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6"
                >
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            New Start Time *
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            New End Time (Optional)
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div> */}

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Message to Participants *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            placeholder="e.g., Start time has been adjusted due to weather conditions. We apologize for any inconvenience."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {message.length}/500 characters
                        </p>
                    </div>

                    {updateRaceTimeMutation.isError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-900">
                                {(updateRaceTimeMutation.error as Error)
                                    ?.message ||
                                    "Failed to update race schedule"}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={
                                updateRaceTimeMutation.isPending || !hasChanges
                            }
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {updateRaceTimeMutation.isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Update & Notify Participants
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {/* Warning Card */}
                {hasChanges && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-900">
                            <p className="font-medium mb-1">Unsaved Changes</p>
                            <p className="text-yellow-700">
                                You have unsaved changes. Make sure to click
                                "Update & Notify Participants" to save your
                                changes.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
