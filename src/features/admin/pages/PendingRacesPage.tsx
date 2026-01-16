import { useState } from "react"
import {
    useRaces,
    useApproveRace,
    useRejectRace,
    useAdminStats,
    type Race,
    type RaceApprovalStatus,
} from "../../races/hooks/useRaces"
import { Link } from "react-router-dom"

export default function RacesApprovalPage() {
    const [approvalStatus, setApprovalStatus] =
        useState<RaceApprovalStatus>("pending")

    const { data: races, isLoading } = useRaces({ approvalStatus })
    const { data: stats } = useAdminStats()

    const approveRace = useApproveRace()
    const rejectRace = useRejectRace()

    const [rejectReason, setRejectReason] = useState("")
    const [selectedRejectRaceId, setSelectedRejectRaceId] = useState<
        string | null
    >(null)
    const [selectedRace, setSelectedRace] = useState<Race | null>(null)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">
                        Loading races...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-green-500 rounded-2xl flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                RACE APPROVALS
                            </h1>
                            <p className="text-sm text-gray-600 font-medium">
                                Manage and approve race submissions
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Total Races */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                                    Total
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 mb-1">
                                {stats.totalRaces}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                                All Races
                            </p>
                        </div>

                        {/* Pending */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">
                                    Pending
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 mb-1">
                                {stats.pendingRaces}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                                Awaiting Review
                            </p>
                        </div>

                        {/* Approved */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                                    Approved
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 mb-1">
                                {stats.approvedRaces}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                                Active Races
                            </p>
                        </div>

                        {/* Rejected */}
                        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                                    Rejected
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 mb-1">
                                {stats.rejectedRaces}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                                Declined
                            </p>
                        </div>
                    </div>
                )}

                {/* Status Tabs */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-2 mb-6 inline-flex gap-2">
                    {(["pending", "approved", "rejected"] as const).map(
                        (status) => (
                            <button
                                key={status}
                                className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                                    approvalStatus === status
                                        ? "bg-gradient-to-r from-cyan-500 to-green-500 text-white shadow-lg"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                onClick={() => setApprovalStatus(status)}
                            >
                                {status === "pending" && "⏳"}
                                {status === "approved" && "✓"}
                                {status === "rejected" && "✕"}
                                {" " + status}
                            </button>
                        )
                    )}
                </div>

                {/* Races Table */}
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    {races && races.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                            Race
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                            Organizer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                            Start Time
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                            Participants
                                        </th>
                                        {/* <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                            Status
                                        </th> */}
                                        {approvalStatus === "pending" && (
                                            <th className="px-6 py-4 text-right text-xs font-black text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                        {approvalStatus === "rejected" && (
                                            <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                                Reason
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {races.map((race) => (
                                        <tr
                                            key={race.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/dashboard/races/${race.id}`}
                                                >
                                                    <div className="hover:underline">
                                                        <p className="font-bold text-gray-900">
                                                            {race.name}
                                                        </p>
                                                        {race.price &&
                                                            race.price > 0 && (
                                                                <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                                                                    ₱
                                                                    {race.price}
                                                                </span>
                                                            )}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {race.created_by_user?.full_name?.charAt(
                                                            0
                                                        ) || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {race
                                                                .created_by_user
                                                                ?.full_name ||
                                                                "Unknown"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                race
                                                                    .created_by_user
                                                                    ?.email
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">
                                                    {new Date(
                                                        race.start_time
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(
                                                        race.start_time
                                                    ).toLocaleTimeString(
                                                        "en-US",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-black text-gray-900">
                                                        {race.participants
                                                            ?.length || 0}
                                                    </span>
                                                    {race.max_participants && (
                                                        <span className="text-sm text-gray-500">
                                                            /{" "}
                                                            {
                                                                race.max_participants
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                                        race.status ===
                                                        "upcoming"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : race.status ===
                                                              "ongoing"
                                                            ? "bg-green-100 text-green-700"
                                                            : race.status ===
                                                              "finished"
                                                            ? "bg-purple-100 text-purple-700"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {race.status ===
                                                        "ongoing" && "🔴"}
                                                    {race.status.toUpperCase()}
                                                </span>
                                            </td> */}
                                            {approvalStatus === "pending" && (
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                                                            onClick={() =>
                                                                approveRace.mutate(
                                                                    race.id
                                                                )
                                                            }
                                                            disabled={
                                                                approveRace.isPending
                                                            }
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
                                                            onClick={() => {
                                                                setSelectedRejectRaceId(
                                                                    race.id
                                                                )
                                                                setSelectedRace(
                                                                    race
                                                                )
                                                            }}
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                            {approvalStatus === "rejected" && (
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-red-600 font-medium">
                                                        {race.rejection_reason ||
                                                            "No reason provided"}
                                                    </p>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-10 h-10 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">
                                No {approvalStatus} races
                            </h3>
                            <p className="text-gray-600">
                                There are no races with this status yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {selectedRejectRaceId && selectedRace && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b-2 border-gray-200">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">
                                Reject Race
                            </h2>
                            <p className="text-gray-600">
                                Are you sure you want to reject "
                                <span className="font-bold">
                                    {selectedRace.name}
                                </span>
                                "?
                            </p>
                        </div>

                        <div className="p-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                Rejection Reason (Optional)
                            </label>
                            <textarea
                                className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-cyan-500 focus:outline-none transition-colors"
                                placeholder="Provide a reason for rejection..."
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
                                }
                                rows={4}
                            />
                        </div>

                        <div className="p-6 border-t-2 border-gray-200 flex justify-end gap-3">
                            <button
                                className="px-6 py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => {
                                    setSelectedRejectRaceId(null)
                                    setSelectedRace(null)
                                    setRejectReason("")
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                                onClick={() => {
                                    if (!selectedRejectRaceId) return
                                    rejectRace.mutate(
                                        {
                                            race_id: selectedRejectRaceId,
                                            reason: rejectReason,
                                        },
                                        {
                                            onSuccess: () => {
                                                setSelectedRejectRaceId(null)
                                                setSelectedRace(null)
                                                setRejectReason("")
                                            },
                                        }
                                    )
                                }}
                            >
                                ✕ Reject Race
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
