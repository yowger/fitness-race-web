import { useAdminStats } from "../../races/hooks/useRaces"

export default function AdminDashboardPage() {
    const { data: stats, isLoading } = useAdminStats()
    console.log("🚀 ~ AdminDashboardPage ~ stats:", stats)

    if (isLoading) return <p>Loading stats...</p>
    if (!stats) return <p>No stats available.</p>

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-100 rounded shadow">
                    <h2>Total Races</h2>
                    <p className="text-xl font-bold">{stats.totalRaces}</p>
                    <a
                        href="/admin/races"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        See all races
                    </a>
                </div>
                <div className="p-4 bg-yellow-100 rounded shadow">
                    <h2>Pending Races</h2>
                    <p className="text-xl font-bold">{stats.pendingRaces}</p>
                    <a
                        href="/admin/races/pending"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Review pending
                    </a>
                </div>
                <div className="p-4 bg-green-100 rounded shadow">
                    <h2>Approved Races</h2>
                    <p className="text-xl font-bold">{stats.approvedRaces}</p>
                    <a
                        href="/admin/races/approved"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        See approved
                    </a>
                </div>
                <div className="p-4 bg-red-100 rounded shadow">
                    <h2>Rejected Races</h2>
                    <p className="text-xl font-bold">{stats.rejectedRaces}</p>
                    <a
                        href="/admin/races/rejected"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        See rejected
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-100 rounded shadow">
                    <h2>Upcoming Races</h2>
                    <p className="text-xl font-bold">{stats.upcomingRaces}</p>
                    <a
                        href="/admin/races?status=upcoming"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        View list
                    </a>
                </div>
                <div className="p-4 bg-purple-100 rounded shadow">
                    <h2>Ongoing Races</h2>
                    <p className="text-xl font-bold">{stats.ongoingRaces}</p>
                    <a
                        href="/admin/races?status=ongoing"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        View list
                    </a>
                </div>
                <div className="p-4 bg-indigo-100 rounded shadow">
                    <h2>Finished Races</h2>
                    <p className="text-xl font-bold">{stats.finishedRaces}</p>
                    <a
                        href="/admin/races?status=finished"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        View list
                    </a>
                </div>
                <div className="p-4 bg-teal-100 rounded shadow">
                    <h2>Completed Races</h2>
                    <p className="text-xl font-bold">{stats.completedRaces}</p>
                    <a
                        href="/admin/races?status=complete"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        View list
                    </a>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">
                    Recently Approved Races
                </h2>
                <ul className="space-y-1">
                    {stats.recentApproved?.map((r) => (
                        <li key={r.id}>
                            <a
                                href={`/admin/races/${r.id}`}
                                className="text-blue-600 hover:underline"
                            >
                                {r.name} (
                                {new Date(r.approved_at).toLocaleDateString()})
                            </a>
                        </li>
                    )) || <li>No recently approved races</li>}
                </ul>
            </div>

            <div>
                <h2 className="text-lg font-bold mb-2">
                    Recently Rejected Races
                </h2>
                <ul className="space-y-1">
                    {stats.recentRejected?.map((r) => (
                        <li key={r.id}>
                            <a
                                href={`/admin/races/${r.id}`}
                                className="text-blue-600 hover:underline"
                            >
                                {r.name} (
                                {new Date(r.rejected_at).toLocaleDateString()})
                            </a>
                        </li>
                    )) || <li>No recently rejected races</li>}
                </ul>
            </div>
        </div>
    )
}
