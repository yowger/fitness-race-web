import { useState } from "react"
import {
    Trophy,
    Award,
    // TrendingUp,
    Calendar,
    // MapPin,
    // Clock,
    // Zap,
    // Target,
    Medal,
    // Share2,
    // Edit,
    // User,
    // Activity,
    Flag,
    // Star,
    ChevronRight,
} from "lucide-react"

// Mock runner data
const RUNNER_PROFILE = {
    id: "1",
    name: "Maria Santos",
    username: "@mariasantos",
    bio: "Marathon runner | Trail enthusiast | Chasing PRs one race at a time 🏃‍♀️",
    location: "Cebu City, Philippines",
    joinedDate: "January 2024",
    avatar: "https://ui-avatars.com/api/?name=Maria+Santos&background=0891b2&color=fff&size=200",
    coverImage:
        "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&q=80",
    stats: {
        totalRaces: 24,
        totalDistance: "287.5 km",
        totalTime: "42:15:30",
        averagePace: "5:45 /km",
        podiumFinishes: 8,
        personalRecords: 3,
    },
    achievements: [
        {
            id: 1,
            name: "First Race",
            description: "Completed your first race",
            icon: "🎯",
            date: "Jan 2024",
            unlocked: true,
        },
        {
            id: 2,
            name: "Speed Demon",
            description: "Finished a 5K under 20 minutes",
            icon: "⚡",
            date: "Mar 2024",
            unlocked: true,
        },
        {
            id: 3,
            name: "Marathon Master",
            description: "Completed your first marathon",
            icon: "🏆",
            date: "May 2024",
            unlocked: true,
        },
        {
            id: 4,
            name: "Podium Regular",
            description: "Finish in top 3 five times",
            icon: "🥇",
            date: "Aug 2024",
            unlocked: true,
        },
        {
            id: 5,
            name: "Century Runner",
            description: "Run 100km total",
            icon: "💯",
            date: "Jun 2024",
            unlocked: true,
        },
        {
            id: 6,
            name: "Early Bird",
            description: "Complete 10 races before 6 AM",
            icon: "🌅",
            date: "Not unlocked",
            unlocked: false,
        },
    ],
    personalRecords: [
        {
            distance: "5K",
            time: "00:18:45",
            pace: "3:45 /km",
            race: "City Fun Run",
            date: "Aug 25, 2025",
        },
        {
            distance: "10K",
            time: "00:39:20",
            pace: "3:56 /km",
            race: "Harbor Run",
            date: "Jul 15, 2025",
        },
        {
            distance: "21K",
            time: "01:28:15",
            pace: "4:12 /km",
            race: "Half Marathon",
            date: "Jun 10, 2025",
        },
    ],
    recentRaces: [
        {
            id: 1,
            name: "City Fun Run",
            date: "Aug 25, 2025",
            distance: "5K",
            time: "00:18:45",
            position: 1,
            totalParticipants: 234,
            image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&q=80",
        },
        {
            id: 2,
            name: "Harbor Run",
            date: "Jul 15, 2025",
            distance: "10K",
            time: "00:39:20",
            position: 3,
            totalParticipants: 189,
            image: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=400&q=80",
        },
        {
            id: 3,
            name: "Mountain Trail",
            date: "Jun 30, 2025",
            distance: "15K",
            time: "01:15:30",
            position: 5,
            totalParticipants: 156,
            image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80",
        },
        {
            id: 4,
            name: "Half Marathon",
            date: "Jun 10, 2025",
            distance: "21K",
            time: "01:28:15",
            position: 2,
            totalParticipants: 312,
            image: "https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=400&q=80",
        },
    ],
    activityFeed: [
        {
            id: 1,
            type: "race",
            text: "Completed City Fun Run and won 1st place! 🥇",
            time: "2 days ago",
        },
        {
            id: 2,
            type: "achievement",
            text: "Unlocked achievement: Podium Regular",
            time: "2 days ago",
        },
        {
            id: 3,
            type: "pr",
            text: "New personal record in 5K: 18:45",
            time: "2 days ago",
        },
        {
            id: 4,
            type: "race",
            text: "Completed Harbor Run - 3rd place finish",
            time: "1 week ago",
        },
    ],
}

import "../styles/dashboardPage.css"
import { useProfileById } from "../../auth/hooks/useUser"
import { getAvatarUrl } from "../../../lib/avatar"
import { useRaces } from "../../races/hooks/useRaces"

export default function RunnerProfilePage({ id }: { id: string }) {
    const { data: user } = useProfileById(id)
    const { data: myFinishedRaces } = useRaces({
        status: "complete",
        userId: user?.id,
    })
    console.log("🚀 ~ RunnerProfilePage ~ myFinishedRaces:", myFinishedRaces)
    const [activeTab, setActiveTab] = useState("overview")
    // const [isOwnProfile] = useState(true)

    const getPositionBadge = (position: number) => {
        if (position === 1)
            return {
                icon: Trophy,
                color: "from-yellow-400 to-yellow-600",
                text: "1st",
            }
        if (position === 2)
            return {
                icon: Medal,
                color: "from-gray-300 to-gray-500",
                text: "2nd",
            }
        if (position === 3)
            return {
                icon: Award,
                color: "from-orange-400 to-orange-600",
                text: "3rd",
            }
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 font-body">
            {/* Cover Section */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={RUNNER_PROFILE.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 cover-gradient"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50"></div>
            </div>

            {/* Profile Header */}
            <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
                <div className="fade-in bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="relative">
                            {/* <img
                                src={RUNNER_PROFILE.avatar}
                                alt={RUNNER_PROFILE.name}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                            /> */}

                            <img
                                src={getAvatarUrl(user?.full_name || "", {
                                    size: 64,
                                })}
                                alt={user?.full_name || ""}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                            />

                            {/* {isOwnProfile && (
                                <button className="absolute bottom-0 right-0 w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:bg-cyan-700 transition-colors">
                                    <Edit className="w-5 h-5 text-white" />
                                </button>
                            )} */}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="font-display text-5xl text-zinc-900 mb-1">
                                        {user?.full_name}
                                    </h1>
                                    {/* <p className="font-body text-lg text-cyan-600 mb-2">
                                        {RUNNER_PROFILE.username}
                                    </p> */}
                                    {/* <p className="font-body text-base text-zinc-600 max-w-2xl mb-3">
                                        {RUNNER_PROFILE.bio}
                                    </p> */}
                                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                                        {/* <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>
                                                {RUNNER_PROFILE.location}
                                            </span>
                                        </div> */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Joined 2026
                                                {/* {RUNNER_PROFILE.joinedDate} */}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="flex gap-2">
                                    {isOwnProfile ? (
                                        <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-zinc-900 font-heading text-lg rounded-lg transition-colors flex items-center gap-2">
                                            <Edit className="w-5 h-5" />
                                            EDIT PROFILE
                                        </button>
                                    ) : (
                                        <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-lg rounded-lg hover:shadow-xl transition-all">
                                            FOLLOW
                                        </button>
                                    )}
                                    <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                        <Share2 className="w-5 h-5 text-zinc-700" />
                                    </button>
                                </div> */}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t-2 border-gray-200">
                        <div className="text-center">
                            <div className="font-display text-4xl text-cyan-600 mb-1">
                                {RUNNER_PROFILE.stats.totalRaces}
                            </div>
                            <div className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                Total Races
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-display text-4xl text-green-600 mb-1">
                                {RUNNER_PROFILE.stats.totalDistance}
                            </div>
                            <div className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                Distance
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-display text-4xl text-orange-600 mb-1">
                                {RUNNER_PROFILE.stats.totalTime}
                            </div>
                            <div className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                Total Time
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="font-display text-4xl text-purple-600 mb-1">
                                {RUNNER_PROFILE.stats.averagePace}
                            </div>
                            <div className="font-body text-sm text-zinc-600 uppercase tracking-wider">
                                Avg Pace
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="border-b-2 border-gray-200 mb-8 fade-in-delay-1">
                    <div className="flex gap-8 font-heading text-xl">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`tab-button pb-4 ${
                                activeTab === "overview"
                                    ? "active text-zinc-900"
                                    : "text-zinc-500"
                            }`}
                        >
                            OVERVIEW
                        </button>
                        <button
                            onClick={() => setActiveTab("hostedRaces")}
                            className={`tab-button pb-4 ${
                                activeTab === "hostedRaces"
                                    ? "active text-zinc-900"
                                    : "text-zinc-500"
                            }`}
                        >
                            HOSTED RACE
                        </button>
                        <button
                            onClick={() => setActiveTab("races")}
                            className={`tab-button pb-4 ${
                                activeTab === "races"
                                    ? "active text-zinc-900"
                                    : "text-zinc-500"
                            }`}
                        >
                            RACE HISTORY
                        </button>
                        {/* <button
                            onClick={() => setActiveTab("achievements")}
                            className={`tab-button pb-4 ${
                                activeTab === "achievements"
                                    ? "active text-zinc-900"
                                    : "text-zinc-500"
                            }`}
                        >
                            ACHIEVEMENTS
                        </button>
                        <button
                            onClick={() => setActiveTab("records")}
                            className={`tab-button pb-4 ${
                                activeTab === "records"
                                    ? "active text-zinc-900"
                                    : "text-zinc-500"
                            }`}
                        >
                            PERSONAL RECORDS
                        </button> */}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Recent Activity */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="fade-in-delay-2">
                                <h2 className="font-display text-3xl text-zinc-900 mb-4">
                                    Recent Races
                                </h2>
                                <div className="space-y-4">
                                    {RUNNER_PROFILE.recentRaces
                                        .slice(0, 3)
                                        .map((race) => {
                                            const badge = getPositionBadge(
                                                race.position
                                            )
                                            return (
                                                <div
                                                    key={race.id}
                                                    className="race-card bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm"
                                                >
                                                    <div className="flex">
                                                        <div className="w-32 h-32 flex-shrink-0">
                                                            <img
                                                                src={race.image}
                                                                alt={race.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 p-5">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h3 className="font-heading text-xl text-zinc-900 mb-1">
                                                                        {
                                                                            race.name
                                                                        }
                                                                    </h3>
                                                                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="w-4 h-4" />
                                                                            {
                                                                                race.date
                                                                            }
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Flag className="w-4 h-4" />
                                                                            {
                                                                                race.distance
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {badge && (
                                                                    <div
                                                                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shine shadow-lg`}
                                                                    >
                                                                        <badge.icon className="w-6 h-6 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-3">
                                                                <div>
                                                                    <div className="font-body text-xs text-zinc-500">
                                                                        Time
                                                                    </div>
                                                                    <div className="font-display text-xl text-zinc-900">
                                                                        {
                                                                            race.time
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="font-body text-xs text-zinc-500">
                                                                        Position
                                                                    </div>
                                                                    <div className="font-display text-xl text-cyan-600">
                                                                        {
                                                                            race.position
                                                                        }
                                                                        /
                                                                        {
                                                                            race.totalParticipants
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                                <button className="w-full mt-4 py-3 border-2 border-gray-300 rounded-lg font-heading text-lg text-zinc-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    VIEW ALL RACES
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Activity Feed & Achievements Preview */}
                        <div className="space-y-6">
                            {/* Activity Feed */}
                            {/* <div className="fade-in-delay-2 bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                                <h3 className="font-heading text-2xl text-zinc-900 mb-4 flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-cyan-600" />
                                    RECENT ACTIVITY
                                </h3>
                                <div className="space-y-4">
                                    {RUNNER_PROFILE.activityFeed.map(
                                        (activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex gap-3"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-cyan-600 mt-2 flex-shrink-0"></div>
                                                <div>
                                                    <p className="font-body text-sm text-zinc-900">
                                                        {activity.text}
                                                    </p>
                                                    <p className="font-body text-xs text-zinc-500 mt-1">
                                                        {activity.time}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div> */}

                            {/* Achievements Preview */}
                            {/* <div className="fade-in-delay-2 bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                                <h3 className="font-heading text-2xl text-zinc-900 mb-4 flex items-center gap-2">
                                    <Star className="w-6 h-6 text-yellow-600" />
                                    ACHIEVEMENTS
                                </h3>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {RUNNER_PROFILE.achievements
                                        .slice(0, 6)
                                        .map((achievement) => (
                                            <div
                                                key={achievement.id}
                                                className={`achievement-card aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-4xl border-2 ${
                                                    achievement.unlocked
                                                        ? "border-cyan-200"
                                                        : "border-gray-200 locked"
                                                }`}
                                                title={achievement.description}
                                            >
                                                {achievement.icon}
                                            </div>
                                        ))}
                                </div>
                                <button className="w-full py-2 border-2 border-gray-300 rounded-lg font-heading text-sm text-zinc-700 hover:bg-gray-50 transition-colors">
                                    VIEW ALL ACHIEVEMENTS
                                </button>
                            </div> */}
                        </div>
                    </div>
                )}

                {activeTab === "hostedRaces" && (
                    <div className="fade-in-delay-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {RUNNER_PROFILE.recentRaces.map((race) => {
                            // const badge = getPositionBadge(race.position)
                            return (
                                <div
                                    key={race.id}
                                    className="race-card bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm"
                                >
                                    <div className="h-48 relative">
                                        <img
                                            src={race.image}
                                            alt={race.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* {badge && (
                                            <div
                                                className={`absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shine shadow-xl border-4 border-white`}
                                            >
                                                <badge.icon className="w-8 h-8 text-white" />
                                            </div>
                                        )} */}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-display text-2xl text-zinc-900 mb-2">
                                            {race.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-zinc-600 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {race.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Flag className="w-4 h-4" />
                                                {race.distance}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-gray-200">
                                            <div>
                                                <div className="font-body text-xs text-zinc-500 mb-1">
                                                    Time
                                                </div>
                                                <div className="font-display text-xl text-zinc-900">
                                                    {race.time}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-body text-xs text-zinc-500 mb-1">
                                                    Position
                                                </div>
                                                <div className="font-display text-xl text-cyan-600">
                                                    {race.position}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-body text-xs text-zinc-500 mb-1">
                                                    Runners
                                                </div>
                                                <div className="font-display text-xl text-zinc-900">
                                                    {race.totalParticipants}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Race History Tab */}
                {activeTab === "races" && (
                    <div className="fade-in-delay-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {RUNNER_PROFILE.recentRaces.map((race) => {
                            // const badge = getPositionBadge(race.position)
                            return (
                                <div
                                    key={race.id}
                                    className="race-card bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm"
                                >
                                    <div className="h-48 relative">
                                        <img
                                            src={race.image}
                                            alt={race.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* {badge && (
                                            <div
                                                className={`absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shine shadow-xl border-4 border-white`}
                                            >
                                                <badge.icon className="w-8 h-8 text-white" />
                                            </div>
                                        )} */}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-display text-2xl text-zinc-900 mb-2">
                                            {race.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-zinc-600 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {race.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Flag className="w-4 h-4" />
                                                {race.distance}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-gray-200">
                                            <div>
                                                <div className="font-body text-xs text-zinc-500 mb-1">
                                                    Time
                                                </div>
                                                <div className="font-display text-xl text-zinc-900">
                                                    {race.time}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-body text-xs text-zinc-500 mb-1">
                                                    Position
                                                </div>
                                                <div className="font-display text-xl text-cyan-600">
                                                    {race.position}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-body text-xs text-zinc-500 mb-1">
                                                    Runners
                                                </div>
                                                <div className="font-display text-xl text-zinc-900">
                                                    {race.totalParticipants}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Personal Records Tab */}
                {/* {activeTab === "records" && (
                    <div className="fade-in-delay-2 space-y-4">
                        {RUNNER_PROFILE.personalRecords.map((record, index) => (
                            <div
                                key={index}
                                className="stat-card bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center shine">
                                            <span className="font-display text-2xl text-white">
                                                {record.distance}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-display text-4xl text-zinc-900 mb-1">
                                                {record.time}
                                            </div>
                                            <div className="font-body text-base text-zinc-600 mb-1">
                                                {record.pace} average pace
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                                <span>{record.race}</span>
                                                <span>•</span>
                                                <span>{record.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                        <span className="font-heading text-lg text-green-600">
                                            PR
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )} */}
            </div>
        </div>
    )
}
