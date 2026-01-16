import { Link } from "react-router-dom"
import { useAdminStats } from "../../races/hooks/useRaces"

export default function AdminDashboardPage() {
    const { data: stats, isLoading } = useAdminStats()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-10 h-10 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                        No Data Available
                    </h3>
                    <p className="text-gray-600">
                        Unable to load dashboard statistics.
                    </p>
                </div>
            </div>
        )
    }

    const approvalRate =
        stats.totalRaces > 0
            ? ((stats.approvedRaces / stats.totalRaces) * 100).toFixed(1)
            : "0"

    const activeRaces = stats.upcomingRaces + stats.ongoingRaces

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b-2 border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
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
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                    ADMIN DASHBOARD
                                </h1>
                                <p className="text-sm text-gray-600 font-medium">
                                    Real-time race management overview
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3">
                            <Link
                                to="/admin/races"
                                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                            >
                                View All Races
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Races */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 rounded-full -mr-12 -mt-12 opacity-50"></div>
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <svg
                                        className="w-7 h-7 text-white"
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
                                    Total Races
                                </span>
                            </div>
                            <p className="text-4xl font-black text-gray-900 mb-2">
                                {stats.totalRaces}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                                All time races created
                            </p>
                        </div>
                    </div>

                    {/* Active Races */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-200 rounded-full -mr-12 -mt-12 opacity-50"></div>
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                    <svg
                                        className="w-7 h-7 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                                    Active Races
                                </span>
                            </div>
                            <p className="text-4xl font-black text-gray-900 mb-2">
                                {activeRaces}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                                Upcoming + Ongoing
                            </p>
                        </div>
                    </div>

                    {/* Total Participants */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200 rounded-full -mr-12 -mt-12 opacity-50"></div>
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                    <svg
                                        className="w-7 h-7 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                                    Participants
                                </span>
                            </div>
                            <p className="text-4xl font-black text-gray-900 mb-2">
                                {stats.totalParticipants}
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                                Total registered runners
                            </p>
                        </div>
                    </div>

                    {/* Approval Rate */}
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-200 rounded-full -mr-12 -mt-12 opacity-50"></div>
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                                    <svg
                                        className="w-7 h-7 text-white"
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
                                <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                                    Approval Rate
                                </span>
                            </div>
                            <p className="text-4xl font-black text-gray-900 mb-2">
                                {approvalRate}%
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                                Races approved
                            </p>
                        </div>
                    </div>
                </div>

                {/* Approval Status */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-white"
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
                        APPROVAL STATUS
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            to="/admin/races?status=pending"
                            className="block group"
                        >
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-5 hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
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
                                            Pending Review
                                        </span>
                                    </div>
                                    <svg
                                        className="w-5 h-5 text-yellow-600 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                                <p className="text-3xl font-black text-gray-900">
                                    {stats.pendingRaces}
                                </p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/races?status=approved"
                            className="block group"
                        >
                            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-5 hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
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
                                    <svg
                                        className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                                <p className="text-3xl font-black text-gray-900">
                                    {stats.approvedRaces}
                                </p>
                            </div>
                        </Link>

                        <Link
                            to="/admin/races?status=rejected"
                            className="block group"
                        >
                            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-5 hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
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
                                    <svg
                                        className="w-5 h-5 text-red-600 group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                                <p className="text-3xl font-black text-gray-900">
                                    {stats.rejectedRaces}
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Race Lifecycle Status */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                            </svg>
                        </div>
                        RACE LIFECYCLE
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Upcoming
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 mb-1">
                                {stats.upcomingRaces}
                            </p>
                            <p className="text-sm text-gray-600">
                                Scheduled races
                            </p>
                        </div>

                        <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Ongoing
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 mb-1">
                                {stats.ongoingRaces}
                            </p>
                            <p className="text-sm text-gray-600">
                                Currently running
                            </p>
                        </div>

                        <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Finished
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 mb-1">
                                {stats.finishedRaces}
                            </p>
                            <p className="text-sm text-gray-600">Race ended</p>
                        </div>

                        <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-teal-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Complete
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 mb-1">
                                {stats.completedRaces}
                            </p>
                            <p className="text-sm text-gray-600">
                                Fully processed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recently Approved */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
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
                                Recently Approved
                            </h2>
                            <Link
                                to="/admin/races?status=approved"
                                className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                            >
                                View All
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        </div>

                        {stats.recentApproved &&
                        stats.recentApproved.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentApproved
                                    .slice(0, 5)
                                    .map((race) => (
                                        <Link
                                            key={race.id}
                                            to={`/admin/races/${race.id}`}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
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
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate group-hover:text-cyan-600 transition-colors">
                                                        {race.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(
                                                            race.approved_at
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <svg
                                                className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all flex-shrink-0"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </Link>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg
                                        className="w-8 h-8 text-gray-400"
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
                                <p className="text-gray-600 font-medium">
                                    No recently approved races
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
