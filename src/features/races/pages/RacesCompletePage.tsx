import React, { useState } from "react"
import {
    Trophy,
    Medal,
    Download,
    Share2,
    Clock,
    TrendingUp,
    Award,
    Users,
    Filter,
    Search,
    Calendar,
    MapPin,
    Activity,
} from "lucide-react"

// Mock race data
const RACE_INFO = {
    id: "1",
    name: "City Fun Run",
    date: "Aug 25, 2025",
    distance: "5K",
    location: "Cebu City Sports Complex",
    totalParticipants: 234,
    totalFinishers: 228,
    status: "completed",
    imageUrl:
        "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80",
}

// Mock results data with more comprehensive information
const RESULTS_DATA = [
    {
        id: 1,
        bib: "001",
        name: "Maria Santos",
        category: "Female 18-29",
        time: "00:18:45",
        pace: "3:45",
        position: 1,
        categoryPosition: 1,
        splits: ["4:32", "4:38", "4:42", "4:53"],
        age: 24,
        team: "Cebu Runners",
    },
    {
        id: 2,
        bib: "015",
        name: "John Cruz",
        category: "Male 18-29",
        time: "00:19:12",
        pace: "3:50",
        position: 2,
        categoryPosition: 1,
        splits: ["4:45", "4:48", "4:50", "4:49"],
        age: 27,
        team: "Speed Demons",
    },
    {
        id: 3,
        bib: "032",
        name: "Anna Reyes",
        category: "Female 30-39",
        time: "00:19:45",
        pace: "3:57",
        position: 3,
        categoryPosition: 1,
        splits: ["4:50", "4:55", "4:58", "5:02"],
        age: 32,
        team: "Elite Runners",
    },
    {
        id: 4,
        bib: "008",
        name: "Carlos Mendoza",
        category: "Male 30-39",
        time: "00:20:15",
        pace: "4:03",
        position: 4,
        categoryPosition: 1,
        splits: ["4:58", "5:02", "5:05", "5:10"],
        age: 35,
        team: null,
    },
    {
        id: 5,
        bib: "023",
        name: "Sofia Garcia",
        category: "Female 18-29",
        time: "00:20:48",
        pace: "4:09",
        position: 5,
        categoryPosition: 2,
        splits: ["5:05", "5:10", "5:15", "5:18"],
        age: 26,
        team: "Cebu Runners",
    },
    {
        id: 6,
        bib: "045",
        name: "Miguel Torres",
        category: "Male 40-49",
        time: "00:21:20",
        pace: "4:16",
        position: 6,
        categoryPosition: 1,
        splits: ["5:12", "5:18", "5:20", "5:30"],
        age: 42,
        team: "Veterans Club",
    },
    {
        id: 7,
        bib: "067",
        name: "Elena Rodriguez",
        category: "Female 30-39",
        time: "00:21:55",
        pace: "4:23",
        position: 7,
        categoryPosition: 2,
        splits: ["5:20", "5:25", "5:28", "5:42"],
        age: 38,
        team: null,
    },
    {
        id: 8,
        bib: "089",
        name: "Diego Flores",
        category: "Male 18-29",
        time: "00:22:10",
        pace: "4:26",
        position: 8,
        categoryPosition: 2,
        splits: ["5:25", "5:28", "5:32", "5:45"],
        age: 23,
        team: "Speed Demons",
    },
    {
        id: 9,
        bib: "012",
        name: "Luna Aquino",
        category: "Female 40-49",
        time: "00:22:45",
        pace: "4:33",
        position: 9,
        categoryPosition: 1,
        splits: ["5:30", "5:38", "5:42", "5:55"],
        age: 44,
        team: "Elite Runners",
    },
    {
        id: 10,
        bib: "054",
        name: "Rafael Diaz",
        category: "Male 30-39",
        time: "00:23:20",
        pace: "4:40",
        position: 10,
        categoryPosition: 2,
        splits: ["5:40", "5:45", "5:50", "6:05"],
        age: 33,
        team: null,
    },
    {
        id: 11,
        bib: "076",
        name: "Isabella Cruz",
        category: "Female 18-29",
        time: "00:24:15",
        pace: "4:51",
        position: 11,
        categoryPosition: 3,
        splits: ["5:50", "6:00", "6:05", "6:20"],
        age: 22,
        team: "Cebu Runners",
    },
    {
        id: 12,
        bib: "098",
        name: "Gabriel Santos",
        category: "Male 40-49",
        time: "00:24:50",
        pace: "4:58",
        position: 12,
        categoryPosition: 2,
        splits: ["6:05", "6:10", "6:15", "6:20"],
        age: 46,
        team: "Veterans Club",
    },
]

const STATISTICS = {
    averageTime: "00:25:32",
    fastestTime: "00:18:45",
    averagePace: "5:06",
    finishRate: 97.4,
}

export default function RaceResultsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [selectedRunner, setSelectedRunner] = useState(null)

    const categories = ["all", ...new Set(RESULTS_DATA.map((r) => r.category))]

    const filteredResults = RESULTS_DATA.filter((runner) => {
        const matchesSearch =
            runner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            runner.bib.includes(searchTerm)
        const matchesCategory =
            categoryFilter === "all" || runner.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const podium = RESULTS_DATA.slice(0, 3)

    return (
        <div className="min-h-screen bg-gray-50 font-body">
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Antonio:wght@700&family=Work+Sans:wght@400;500;600;700&display=swap');
          
          .font-display {
            font-family: 'Antonio', sans-serif;
            letter-spacing: -0.02em;
          }

          .font-heading {
            font-family: 'Bebas Neue', sans-serif;
            letter-spacing: 0.02em;
          }

          .font-body {
            font-family: 'Work Sans', sans-serif;
          }

          .hero-gradient {
            background: linear-gradient(135deg, 
              rgba(8, 145, 178, 0.1) 0%, 
              rgba(22, 163, 74, 0.1) 50%,
              rgba(234, 88, 12, 0.1) 100%
            );
          }

          .fade-in {
            animation: fadeIn 0.6s ease-out;
          }

          .fade-in-delay-1 {
            animation: fadeIn 0.6s ease-out 0.2s both;
          }

          .fade-in-delay-2 {
            animation: fadeIn 0.6s ease-out 0.4s both;
          }

          .fade-in-delay-3 {
            animation: fadeIn 0.6s ease-out 0.6s both;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .podium-1 {
            animation: riseUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
          }

          .podium-2 {
            animation: riseUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
          }

          .podium-3 {
            animation: riseUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
          }

          @keyframes riseUp {
            from {
              opacity: 0;
              transform: translateY(100px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .trophy-float {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .shine {
            position: relative;
            overflow: hidden;
          }

          .shine::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              transparent 30%,
              rgba(255, 255, 255, 0.3) 50%,
              transparent 70%
            );
            animation: shine 3s infinite;
          }

          @keyframes shine {
            0% {
              transform: translateX(-100%) translateY(-100%) rotate(45deg);
            }
            100% {
              transform: translateX(100%) translateY(100%) rotate(45deg);
            }
          }

          .stat-card {
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(8, 145, 178, 0.15);
          }

          .result-row {
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .result-row:hover {
            background: rgba(8, 145, 178, 0.05);
            transform: translateX(4px);
          }

          .medal-gold {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
          }

          .medal-silver {
            background: linear-gradient(135deg, #C0C0C0, #808080);
            box-shadow: 0 4px 15px rgba(192, 192, 192, 0.4);
          }

          .medal-bronze {
            background: linear-gradient(135deg, #CD7F32, #8B4513);
            box-shadow: 0 4px 15px rgba(205, 127, 50, 0.4);
          }

          .grain-texture {
            position: relative;
          }

          .grain-texture::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
            pointer-events: none;
          }

          .certificate-btn {
            position: relative;
            overflow: hidden;
          }

          .certificate-btn::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
          }

          .certificate-btn:hover::after {
            width: 300px;
            height: 300px;
          }
        `}
            </style>

            {/* Hero Section */}
            <div className="relative overflow-hidden grain-texture">
                <div className="absolute inset-0 hero-gradient"></div>
                <img
                    src={RACE_INFO.imageUrl}
                    alt={RACE_INFO.name}
                    className="w-full h-[50vh] object-cover opacity-30"
                />

                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-gray-50 via-transparent">
                    <div className="w-full max-w-7xl mx-auto px-6 pb-12">
                        <div className="fade-in">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="px-6 py-2 bg-green-600 text-white font-heading text-lg uppercase rounded-full">
                                    COMPLETED
                                </span>
                                <span className="px-6 py-2 bg-cyan-50 border border-cyan-600 text-cyan-700 font-heading text-lg rounded-full">
                                    {RACE_INFO.distance}
                                </span>
                            </div>

                            <h1 className="font-display text-7xl md:text-8xl leading-none mb-4 text-zinc-900">
                                {RACE_INFO.name}
                            </h1>

                            <div className="flex flex-wrap gap-6 text-zinc-600 font-body text-lg">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-cyan-600" />
                                    <span>{RACE_INFO.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-cyan-600" />
                                    <span>{RACE_INFO.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-cyan-600" />
                                    <span>
                                        {RACE_INFO.totalFinishers} Finishers
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Statistics Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 fade-in">
                    <div className="stat-card p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm text-center">
                        <Clock className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Average Time
                        </div>
                        <div className="font-display text-3xl text-zinc-900">
                            {STATISTICS.averageTime}
                        </div>
                    </div>

                    <div className="stat-card p-6 bg-white border-2 border-green-200 rounded-lg shadow-sm text-center">
                        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Fastest Time
                        </div>
                        <div className="font-display text-3xl text-green-600">
                            {STATISTICS.fastestTime}
                        </div>
                    </div>

                    <div className="stat-card p-6 bg-white border-2 border-orange-200 rounded-lg shadow-sm text-center">
                        <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Average Pace
                        </div>
                        <div className="font-display text-3xl text-orange-600">
                            {STATISTICS.averagePace}
                        </div>
                    </div>

                    <div className="stat-card p-6 bg-white border-2 border-purple-200 rounded-lg shadow-sm text-center">
                        <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="font-body text-sm text-zinc-600 mb-1">
                            Finish Rate
                        </div>
                        <div className="font-display text-3xl text-purple-600">
                            {STATISTICS.finishRate}%
                        </div>
                    </div>
                </div>

                {/* Podium Section */}
                <div className="mb-16">
                    <h2 className="font-display text-5xl text-zinc-900 mb-8 text-center fade-in-delay-1">
                        Top Finishers
                    </h2>

                    <div className="flex items-end justify-center gap-8 max-w-4xl mx-auto">
                        {/* Second Place */}
                        <div className="podium-2 flex-1 text-center">
                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 rounded-full medal-silver flex items-center justify-center shine">
                                    <Medal className="w-12 h-12 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center font-heading text-lg">
                                    2
                                </div>
                            </div>
                            <div className="bg-white border-2 border-gray-300 rounded-t-2xl p-6 min-h-[280px] flex flex-col justify-between">
                                <div>
                                    <div className="font-heading text-sm text-zinc-500 mb-1">
                                        BIB #{podium[1].bib}
                                    </div>
                                    <h3 className="font-display text-2xl text-zinc-900 mb-2">
                                        {podium[1].name}
                                    </h3>
                                    <div className="inline-block px-3 py-1 bg-gray-100 text-zinc-600 text-xs rounded-full font-body mb-4">
                                        {podium[1].category}
                                    </div>
                                    <div className="font-display text-4xl text-zinc-900 mb-1">
                                        {podium[1].time}
                                    </div>
                                    <div className="font-body text-sm text-zinc-500">
                                        {podium[1].pace} /km
                                    </div>
                                </div>
                                <button className="certificate-btn mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-zinc-900 font-heading text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" />
                                    CERTIFICATE
                                </button>
                            </div>
                        </div>

                        {/* First Place */}
                        <div className="podium-1 flex-1 text-center">
                            <div className="relative inline-block mb-4 trophy-float">
                                <div className="w-32 h-32 rounded-full medal-gold flex items-center justify-center shine">
                                    <Trophy className="w-16 h-16 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-10 h-10 bg-white border-2 border-yellow-500 rounded-full flex items-center justify-center font-heading text-xl">
                                    1
                                </div>
                            </div>
                            <div className="bg-white border-2 border-yellow-400 rounded-t-2xl p-6 min-h-[320px] flex flex-col justify-between shadow-lg">
                                <div>
                                    <div className="font-heading text-sm text-zinc-500 mb-1">
                                        BIB #{podium[0].bib}
                                    </div>
                                    <h3 className="font-display text-3xl text-zinc-900 mb-2">
                                        {podium[0].name}
                                    </h3>
                                    <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-body mb-4">
                                        {podium[0].category}
                                    </div>
                                    <div className="font-display text-5xl text-yellow-600 mb-1">
                                        {podium[0].time}
                                    </div>
                                    <div className="font-body text-sm text-zinc-500">
                                        {podium[0].pace} /km
                                    </div>
                                </div>
                                <button className="certificate-btn mt-4 w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-heading text-base rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                                    <Download className="w-4 h-4" />
                                    CERTIFICATE
                                </button>
                            </div>
                        </div>

                        {/* Third Place */}
                        <div className="podium-3 flex-1 text-center">
                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 rounded-full medal-bronze flex items-center justify-center shine">
                                    <Award className="w-12 h-12 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-orange-700 rounded-full flex items-center justify-center font-heading text-lg">
                                    3
                                </div>
                            </div>
                            <div className="bg-white border-2 border-orange-300 rounded-t-2xl p-6 min-h-[240px] flex flex-col justify-between">
                                <div>
                                    <div className="font-heading text-sm text-zinc-500 mb-1">
                                        BIB #{podium[2].bib}
                                    </div>
                                    <h3 className="font-display text-2xl text-zinc-900 mb-2">
                                        {podium[2].name}
                                    </h3>
                                    <div className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-body mb-4">
                                        {podium[2].category}
                                    </div>
                                    <div className="font-display text-4xl text-zinc-900 mb-1">
                                        {podium[2].time}
                                    </div>
                                    <div className="font-body text-sm text-zinc-500">
                                        {podium[2].pace} /km
                                    </div>
                                </div>
                                <button className="certificate-btn mt-4 w-full py-2 bg-orange-100 hover:bg-orange-200 text-orange-900 font-heading text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" />
                                    CERTIFICATE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complete Results Section */}
                <div className="fade-in-delay-3">
                    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        {/* Search and Filter Bar */}
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or bib number..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg font-body focus:outline-none focus:border-cyan-600 transition-colors"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-zinc-600" />
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) =>
                                            setCategoryFilter(e.target.value)
                                        }
                                        className="px-4 py-3 border-2 border-gray-300 rounded-lg font-body focus:outline-none focus:border-cyan-600 transition-colors"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat === "all"
                                                    ? "All Categories"
                                                    : cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-heading text-lg rounded-lg transition-colors flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    EXPORT
                                </button>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
                                <span>
                                    Showing {filteredResults.length} of{" "}
                                    {RESULTS_DATA.length} results
                                </span>
                                <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
                                    <Share2 className="w-4 h-4" />
                                    Share Results
                                </button>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            POSITION
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            BIB
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            RUNNER
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            CATEGORY
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            TIME
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            PACE
                                        </th>
                                        <th className="px-6 py-4 text-left font-heading text-sm text-zinc-700">
                                            CAT. POS
                                        </th>
                                        <th className="px-6 py-4 text-center font-heading text-sm text-zinc-700">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResults.map((runner, index) => (
                                        <tr
                                            key={runner.id}
                                            className="result-row border-b border-gray-200 cursor-pointer"
                                            onClick={() =>
                                                setSelectedRunner(runner)
                                            }
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-display text-2xl text-zinc-900">
                                                        {runner.position}
                                                    </span>
                                                    {runner.position <= 3 && (
                                                        <div
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                                runner.position ===
                                                                1
                                                                    ? "medal-gold"
                                                                    : runner.position ===
                                                                      2
                                                                    ? "medal-silver"
                                                                    : "medal-bronze"
                                                            }`}
                                                        >
                                                            <span className="text-white text-xs">
                                                                ★
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-heading text-lg text-cyan-600">
                                                    #{runner.bib}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div>
                                                    <div className="font-body font-semibold text-zinc-900">
                                                        {runner.name}
                                                    </div>
                                                    {runner.team && (
                                                        <div className="text-sm text-zinc-500">
                                                            {runner.team}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-block px-3 py-1 bg-gray-100 text-zinc-700 text-xs rounded-full font-body">
                                                    {runner.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-display text-xl text-zinc-900">
                                                    {runner.time}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-body text-zinc-700">
                                                    {runner.pace}{" "}
                                                    <span className="text-zinc-500 text-sm">
                                                        /km
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-heading text-lg text-green-600">
                                                    #{runner.categoryPosition}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                                        <Download className="w-4 h-4 text-zinc-700" />
                                                    </button>
                                                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                                        <Share2 className="w-4 h-4 text-zinc-700" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Runner Detail Modal */}
                {selectedRunner && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setSelectedRunner(null)}
                    >
                        <div
                            className="bg-white border-2 border-cyan-200 rounded-lg p-8 max-w-3xl w-full shadow-2xl fade-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                            selectedRunner.position === 1
                                                ? "medal-gold"
                                                : selectedRunner.position === 2
                                                ? "medal-silver"
                                                : selectedRunner.position === 3
                                                ? "medal-bronze"
                                                : "bg-gray-200"
                                        }`}
                                    >
                                        <span className="font-display text-2xl text-white">
                                            {selectedRunner.position}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-heading text-sm text-cyan-600 mb-1">
                                            BIB #{selectedRunner.bib}
                                        </div>
                                        <h3 className="font-display text-4xl text-zinc-900 mb-2">
                                            {selectedRunner.name}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-gray-100 text-zinc-700 text-sm rounded-full font-body">
                                                {selectedRunner.category}
                                            </span>
                                            {selectedRunner.team && (
                                                <span className="text-zinc-600 font-body">
                                                    {selectedRunner.team}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedRunner(null)}
                                    className="text-zinc-400 hover:text-zinc-900 text-3xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-lg">
                                    <div className="font-body text-sm text-zinc-600 mb-1">
                                        Finish Time
                                    </div>
                                    <div className="font-display text-3xl text-cyan-700">
                                        {selectedRunner.time}
                                    </div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
                                    <div className="font-body text-sm text-zinc-600 mb-1">
                                        Avg Pace
                                    </div>
                                    <div className="font-display text-3xl text-green-700">
                                        {selectedRunner.pace}
                                    </div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
                                    <div className="font-body text-sm text-zinc-600 mb-1">
                                        Cat. Position
                                    </div>
                                    <div className="font-display text-3xl text-orange-700">
                                        #{selectedRunner.categoryPosition}
                                    </div>
                                </div>
                            </div>

                            {/* Splits */}
                            <div className="mb-6">
                                <h4 className="font-heading text-xl text-zinc-900 mb-3">
                                    SPLIT TIMES
                                </h4>
                                <div className="grid grid-cols-4 gap-3">
                                    {selectedRunner.splits.map(
                                        (split, index) => (
                                            <div
                                                key={index}
                                                className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center"
                                            >
                                                <div className="font-body text-xs text-zinc-500 mb-1">
                                                    KM {index + 1}
                                                </div>
                                                <div className="font-display text-xl text-zinc-900">
                                                    {split}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-heading text-lg rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    DOWNLOAD CERTIFICATE
                                </button>
                                <button className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-zinc-900 font-heading text-lg rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    SHARE RESULT
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
