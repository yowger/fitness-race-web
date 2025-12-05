export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, Alex!
                </h1>
                <p className="text-gray-600 mt-1">
                    Here's what's happening with your races today.
                </p>
            </div>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Your Runs
                    </h2>
                    <a
                        href="#"
                        className="text-blue-600 hover:underline text-sm font-medium"
                    >
                        See All
                    </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                        <img
                            src="https://via.placeholder.com/400x150?text=Map+Image"
                            alt="Run Map"
                            className="w-full h-36 object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                Morning 5K
                            </h3>
                            <p className="text-sm text-gray-500">
                                Jan 15, 2026 | 6:00 AM
                            </p>
                            <p className="mt-2 text-gray-700">
                                Central Park, NYC
                            </p>
                            <p className="mt-1 text-gray-500 text-sm">
                                Distance: 5 km
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                        <img
                            src="https://via.placeholder.com/400x150?text=Map+Image"
                            alt="Run Map"
                            className="w-full h-36 object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                Evening Sprint
                            </h3>
                            <p className="text-sm text-gray-500">
                                Jan 18, 2026 | 5:30 PM
                            </p>
                            <p className="mt-2 text-gray-700">Riverside, NYC</p>
                            <p className="mt-1 text-gray-500 text-sm">
                                Distance: 3 km
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Upcoming Races
                    </h2>
                    <a
                        href="#"
                        className="text-blue-600 hover:underline text-sm font-medium"
                    >
                        See All
                    </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                        <img
                            src="https://via.placeholder.com/400x150?text=Map+Image"
                            alt="Race Map"
                            className="w-full h-36 object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                City Marathon
                            </h3>
                            <p className="text-sm text-gray-500">
                                Jan 20-22, 2026
                            </p>
                            <p className="mt-2 text-gray-700">Hosted by Alex</p>
                            <p className="mt-1 text-gray-500 text-sm">
                                Participants: 42 / 100
                            </p>
                            <p className="mt-1 text-gray-500 text-sm">
                                Distance: 42 km
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                        <img
                            src="https://via.placeholder.com/400x150?text=Map+Image"
                            alt="Race Map"
                            className="w-full h-36 object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                Weekend Ultra Run
                            </h3>
                            <p className="text-sm text-gray-500">
                                Feb 5-6, 2026
                            </p>
                            <p className="mt-2 text-gray-700">Hosted by Alex</p>
                            <p className="mt-1 text-gray-500 text-sm">
                                Participants: 30 / 80
                            </p>
                            <p className="mt-1 text-gray-500 text-sm">
                                Distance: 50 km
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Your Hosted Races
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                        <img
                            src="https://via.placeholder.com/400x150?text=Map+Image"
                            alt="Hosted Race Map"
                            className="w-full h-36 object-cover"
                        />
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                City Marathon
                            </h3>
                            <p className="text-sm text-gray-500">
                                Jan 20-22, 2026
                            </p>
                            <p className="mt-2 text-gray-700">
                                Status: Upcoming
                            </p>
                            <p className="mt-1 text-gray-500 text-sm">
                                Participants: 42 / 100
                            </p>
                            <p className="mt-1 text-gray-500 text-sm">
                                Distance: 42 km
                            </p>
                            <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                                Manage Race
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Your Stats
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 text-center">
                        <p className="text-gray-500">Races Completed</p>
                        <p className="text-2xl font-bold text-gray-900">15</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 text-center">
                        <p className="text-gray-500">Total Distance</p>
                        <p className="text-2xl font-bold text-gray-900">
                            120 km
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 text-center">
                        <p className="text-gray-500">Personal Best</p>
                        <p className="text-2xl font-bold text-gray-900">
                            21:45
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
