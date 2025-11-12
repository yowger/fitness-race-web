import React, { useState, useEffect } from "react"
import {
    Play,
    MapPin,
    Users,
    Timer,
    ArrowRight,
    CheckCircle2,
    Star,
} from "lucide-react"

export default function RunningLandingPage() {
    const [scrollY, setScrollY] = useState(0)
    const [isVisible, setIsVisible] = useState<Record<string, boolean>>({})

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev) => ({
                            ...prev,
                            [entry.target.id]: true,
                        }))
                    }
                })
            },
            { threshold: 0.1 }
        )

        document.querySelectorAll('[id^="animate-"]').forEach((el) => {
            observer.observe(el)
        })

        return () => observer.disconnect()
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white overflow-hidden">
            <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <div
                        className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
                        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
                    />
                    <div
                        className="absolute top-40 right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
                        style={{
                            transform: `translateY(${scrollY * 0.2}px)`,
                            animationDelay: "1s",
                        }}
                    />
                    <div
                        className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
                        style={{
                            transform: `translateY(${scrollY * 0.4}px)`,
                            animationDelay: "2s",
                        }}
                    />
                </div>

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <div className="mb-8 animate-fade-in">
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-sm font-semibold mb-6">
                            Transform Your Running Journey
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200 to-teal-200 leading-tight">
                        Run Faster.
                        <br />
                        Run Stronger.
                    </h1>

                    <p className="text-xl md:text-2xl text-emerald-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Create custom routes, race with friends, and track every
                        mile of your journey to greatness
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                            Start Free Trial
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
                            <Play size={20} />
                            Watch Demo
                        </button>
                    </div>

                    <div className="mt-16 flex justify-center gap-12 text-center">
                        <div>
                            <div className="text-4xl font-bold text-emerald-300">
                                50K+
                            </div>
                            <div className="text-sm text-emerald-200">
                                Active Runners
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-teal-300">
                                1M+
                            </div>
                            <div className="text-sm text-emerald-200">
                                Miles Logged
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-cyan-300">
                                4.9★
                            </div>
                            <div className="text-sm text-emerald-200">
                                App Rating
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <h2
                        id="animate-features"
                        className={`text-5xl font-bold text-center mb-4 transition-all duration-1000 ${
                            isVisible["animate-features"]
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-10"
                        }`}
                    >
                        Everything You Need to Excel
                    </h2>
                    <p className="text-xl text-emerald-200 text-center mb-16 max-w-2xl mx-auto">
                        Powerful features designed to elevate your running
                        experience
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <MapPin className="w-12 h-12" />,
                                title: "Custom Route Builder",
                                description:
                                    "Design your perfect running path with our interactive map. Discover new trails, save favorite routes, and explore your city like never before",
                                gradient: "from-emerald-500 to-teal-500",
                            },
                            {
                                icon: <Users className="w-12 h-12" />,
                                title: "Race with Others",
                                description:
                                    "Challenge friends in real-time races, join global competitions, and push each other to new limits. Turn every run into an exciting competition",
                                gradient: "from-teal-500 to-cyan-500",
                            },
                            {
                                icon: <Timer className="w-12 h-12" />,
                                title: "Advanced Time Tracking",
                                description:
                                    "Monitor your pace, distance, splits, and personal records with precision. Watch your progress over time with detailed analytics and insights",
                                gradient: "from-cyan-500 to-blue-500",
                            },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                id={`animate-feature-${idx}`}
                                className={`group relative bg-white/5 backdrop-blur-lg rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                                    isVisible[`animate-feature-${idx}`]
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-10"
                                }`}
                                style={{ transitionDelay: `${idx * 200}ms` }}
                            >
                                <div
                                    className={`inline-block p-4 bg-gradient-to-r ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-emerald-200 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-24 px-6 bg-black/20">
                <div className="max-w-5xl mx-auto">
                    <h2
                        id="animate-testimonials"
                        className={`text-4xl font-bold text-center mb-16 transition-all duration-1000 ${
                            isVisible["animate-testimonials"]
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-10"
                        }`}
                    >
                        Loved by Runners Worldwide
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Sarah Chen",
                                role: "Marathon Runner",
                                text: "The route builder helped me discover amazing trails I never knew existed. Game changer!",
                                rating: 5,
                            },
                            {
                                name: "Marcus Rodriguez",
                                role: "Trail Runner",
                                text: "Racing with friends keeps me motivated. Beat my personal record three times this month!",
                                rating: 5,
                            },
                            {
                                name: "Emily Johnson",
                                role: "5K Enthusiast",
                                text: "The time tracking is incredibly accurate. Love seeing my progress week over week.",
                                rating: 5,
                            },
                        ].map((testimonial, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map(
                                        (_, i) => (
                                            <Star
                                                key={i}
                                                className="w-5 h-5 fill-yellow-400 text-yellow-400"
                                            />
                                        )
                                    )}
                                </div>
                                <p className="text-emerald-100 mb-6 italic">
                                    "{testimonial.text}"
                                </p>
                                <div>
                                    <div className="font-bold">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-emerald-300">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-32 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-3xl" />
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-bold mb-6">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-2xl text-emerald-200 mb-12">
                        Join today and get your first month free. No credit card
                        required.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <button className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                            Get Started Free
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm text-emerald-200">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            No credit card required
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            Cancel anytime
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            30-day money back guarantee
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="py-12 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto text-center text-emerald-300 text-sm">
                    <p>
                        © 2025 RunFit. All rights reserved. Your journey to
                        greatness starts here.
                    </p>
                </div>
            </div>
        </div>
    )
}
