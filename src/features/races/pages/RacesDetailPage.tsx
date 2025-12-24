import React, { useState } from "react"
import { Calendar, Clock, MapPin, Users, Award, Info } from "lucide-react"

const RACE_DETAIL = {
    id: "1",
    name: "City Fun Run",
    date: "Aug 25, 2025",
    time: "5:00 AM",
    location: "Cebu City Sports Complex",
    status: "upcoming",
    distance: "5K",
    participants: 234,
    maxParticipants: 500,
    registrationFee: "₱350",
    imageUrl:
        "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80",
    routeMapUrl:
        "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
    host: {
        name: "Cebu Sports Council",
        avatar: "https://ui-avatars.com/api/?name=Cebu+Sports+Council&background=0D8ABC&color=fff",
        description: "Promoting health and fitness in Cebu since 2010",
    },
    description:
        "Join us for the annual City Fun Run! This family-friendly event promotes fitness and community spirit. The route takes you through the scenic streets of Cebu City, perfect for runners of all levels.",
    schedule: [
        { time: "4:30 AM", event: "Registration Opens" },
        { time: "5:00 AM", event: "Race Start" },
        { time: "6:30 AM", event: "Awards Ceremony" },
        { time: "7:00 AM", event: "Event Ends" },
    ],
}

export default function RaceDetailPage() {
    const [activeTab, setActiveTab] = useState("details")
    const participationPercentage =
        (RACE_DETAIL.participants / RACE_DETAIL.maxParticipants) * 100

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Antonio:wght@700&family=Work+Sans:wght@400;500;600;700&display=swap');

          :root {
            --electric-cyan: #00f0ff;
            --hot-orange: #ff4500;
            --lime-green: #39ff14;
            --deep-purple: #6B00FF;
          }

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
              rgba(0, 240, 255, 0.15) 0%, 
              rgba(107, 0, 255, 0.15) 50%,
              rgba(255, 69, 0, 0.15) 100%
            );
          }

          .glow-cyan {
            box-shadow: 0 0 30px rgba(0, 240, 255, 0.3);
          }

          .glow-orange {
            box-shadow: 0 0 30px rgba(255, 69, 0, 0.3);
          }

          .slide-in {
            animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
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

          @keyframes slideIn {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
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

          .status-badge {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          .diagonal-clip {
            clip-path: polygon(0 0, 100% 0, 100% 95%, 0 100%);
          }

          .info-card:hover {
            transform: translateY(-4px);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .info-card {
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .tab-button {
            position: relative;
            transition: color 0.3s ease;
          }

          .tab-button::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--electric-cyan), var(--lime-green));
            transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .tab-button.active::after { width: 100%; }

          .progress-bar {
            background: linear-gradient(90deg, var(--electric-cyan), var(--lime-green));
            animation: shimmer 2s linear infinite;
            background-size: 200% 100%;
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .grain-overlay { position: relative; }

          .grain-overlay::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
            opacity: 0.1;
            pointer-events: none;
          }
        `}
            </style>

            {/* Hero Section */}
            <div className="relative overflow-hidden diagonal-clip grain-overlay">
                <div className="absolute inset-0 hero-gradient"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>

                <div className="relative">
                    <img
                        src={RACE_DETAIL.imageUrl}
                        alt={RACE_DETAIL.name}
                        className="w-full h-[60vh] object-cover opacity-40 slide-in"
                    />

                    <div className="absolute inset-0 flex items-end">
                        <div className="w-full max-w-7xl mx-auto px-6 pb-16">
                            <div className="slide-in">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="status-badge px-6 py-2 bg-lime-green/20 border-2 border-lime-green text-lime-green font-heading text-lg uppercase">
                                        {RACE_DETAIL.status}
                                    </span>
                                    <span className="px-6 py-2 bg-electric-cyan/20 border border-electric-cyan text-electric-cyan font-heading text-lg">
                                        {RACE_DETAIL.distance}
                                    </span>
                                </div>

                                <h1 className="font-display text-8xl md:text-9xl leading-none mb-4 bg-gradient-to-r from-gray-900 via-electric-cyan to-lime-green bg-clip-text text-transparent">
                                    {RACE_DETAIL.name}
                                </h1>

                                <div className="flex flex-wrap gap-6 text-gray-600 font-body text-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-electric-cyan" />
                                        <span>{RACE_DETAIL.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-electric-cyan" />
                                        <span>{RACE_DETAIL.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-hot-orange" />
                                        <span>{RACE_DETAIL.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column - Tabs */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="border-b border-gray-300 fade-in">
                            <div className="flex gap-8 font-heading text-xl">
                                <button
                                    onClick={() => setActiveTab("details")}
                                    className={`tab-button pb-4 ${
                                        activeTab === "details"
                                            ? "active text-gray-900"
                                            : "text-gray-400"
                                    }`}
                                >
                                    DETAILS
                                </button>
                                <button
                                    onClick={() => setActiveTab("schedule")}
                                    className={`tab-button pb-4 ${
                                        activeTab === "schedule"
                                            ? "active text-gray-900"
                                            : "text-gray-400"
                                    }`}
                                >
                                    SCHEDULE
                                </button>
                                <button
                                    onClick={() => setActiveTab("route")}
                                    className={`tab-button pb-4 ${
                                        activeTab === "route"
                                            ? "active text-gray-900"
                                            : "text-gray-400"
                                    }`}
                                >
                                    ROUTE
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === "details" && (
                            <div className="fade-in">
                                <h2 className="font-display text-4xl mb-6 text-gray-900">
                                    About the Race
                                </h2>
                                <p className="font-body text-lg text-gray-700 leading-relaxed">
                                    {RACE_DETAIL.description}
                                </p>

                                <div className="mt-8 p-6 bg-gray-50 border border-gray-300 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={RACE_DETAIL.host.avatar}
                                            alt={RACE_DETAIL.host.name}
                                            className="w-16 h-16 rounded-full"
                                        />
                                        <div>
                                            <h3 className="font-heading text-2xl text-gray-900 mb-1">
                                                {RACE_DETAIL.host.name}
                                            </h3>
                                            <p className="font-body text-gray-600">
                                                {RACE_DETAIL.host.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "schedule" && (
                            <div className="fade-in space-y-4">
                                <h2 className="font-display text-4xl mb-6 text-gray-900">
                                    Event Schedule
                                </h2>
                                {RACE_DETAIL.schedule.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-6 p-5 bg-gray-50 border border-gray-200 rounded-lg hover:border-electric-cyan/50 transition-colors"
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                    >
                                        <div className="flex-shrink-0 w-24">
                                            <span className="font-heading text-2xl text-electric-cyan">
                                                {item.time}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <span className="font-body text-lg text-gray-700">
                                                {item.event}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "route" && (
                            <div className="fade-in">
                                <h2 className="font-display text-4xl mb-6 text-gray-900">
                                    Race Route
                                </h2>
                                <div className="rounded-lg overflow-hidden border-2 border-electric-cyan/30">
                                    <img
                                        src={RACE_DETAIL.routeMapUrl}
                                        alt="Race Route Map"
                                        className="w-full h-[500px] object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="info-card fade-in-delay-1 p-8 bg-gradient-to-br from-electric-cyan/10 to-lime-green/10 border-2 border-electric-cyan/50 rounded-lg glow-cyan">
                            <div className="text-center mb-6">
                                <div className="font-display text-5xl text-gray-900 mb-2">
                                    {RACE_DETAIL.registrationFee}
                                </div>
                                <div className="font-body text-sm text-gray-500 uppercase tracking-wider">
                                    Registration Fee
                                </div>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-electric-cyan to-lime-green text-gray-900 font-heading text-2xl rounded-lg hover:shadow-2xl hover:shadow-electric-cyan/50 transition-shadow">
                                REGISTER NOW
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="info-card fade-in-delay-2 p-6 bg-gray-50 border border-gray-200 rounded-lg space-y-6">
                            <h3 className="font-heading text-2xl text-gray-900">
                                Quick Info
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-hot-orange" />
                                        <span className="font-body text-gray-700">
                                            Participants
                                        </span>
                                    </div>
                                    <span className="font-heading text-xl text-gray-900">
                                        {RACE_DETAIL.participants}/
                                        {RACE_DETAIL.maxParticipants}
                                    </span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="progress-bar h-full rounded-full"
                                        style={{
                                            width: `${participationPercentage}%`,
                                        }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-500 font-body">
                                    {Math.round(participationPercentage)}% spots
                                    filled
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-200 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Award className="w-5 h-5 text-lime-green mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-body font-semibold text-gray-900 mb-1">
                                            Awards
                                        </div>
                                        <div className="font-body text-sm text-gray-600">
                                            Medals for all finishers, trophies
                                            for top 3 in each category
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-electric-cyan mt-1 flex-shrink-0" />
                                    <div>
                                        <div className="font-body font-semibold text-gray-900 mb-1">
                                            What to Bring
                                        </div>
                                        <div className="font-body text-sm text-gray-600">
                                            Valid ID, comfortable running shoes,
                                            water bottle
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Share Section */}
                        <div className="info-card fade-in-delay-3 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                            <h3 className="font-heading text-xl text-gray-900 mb-4">
                                Share This Race
                            </h3>
                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-white hover:bg-gray-100 font-body text-sm rounded border border-gray-300 transition-colors">
                                    Facebook
                                </button>
                                <button className="flex-1 py-3 bg-white hover:bg-gray-100 font-body text-sm rounded border border-gray-300 transition-colors">
                                    Twitter
                                </button>
                                <button className="flex-1 py-3 bg-white hover:bg-gray-100 font-body text-sm rounded border border-gray-300 transition-colors">
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
