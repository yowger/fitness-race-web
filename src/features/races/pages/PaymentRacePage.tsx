import { useEffect, useState } from "react"
import { loadStripe, type Stripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import Checkout from "../components/Checkout"
import { useAddParticipant, useRace } from "../hooks/useRaces"
import { useParams, useNavigate } from "react-router-dom"
import { io } from "socket.io-client"
import { useUser } from "../../auth/hooks/useUser"
import { toast } from "sonner"

const STRIPE_PUBLISHABLE_KEY =
    "pk_test_51SUjzU2HofN6RWVJ253jKVG9CJe2pnKPJC89BXYeElDW7YS74Jz7TXewSaFCPs1N4pD1kDozdRMd19LLiTTHj1qE00AGr3i5pj"

const BASE_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4000"
const SOCKET_URL = import.meta.env.VITE_PUBLIC_SOCKET_URL

export default function PaymentRacePage() {
    const { data: user } = useUser()
    const navigate = useNavigate()
    const socket = io(SOCKET_URL)
    const { id } = useParams()
    const { data: race, isLoading } = useRace(id!)

    const [stripe, setStripe] = useState<Stripe | null>(null)
    const [clientSecret, setClientSecret] = useState("")

    const addParticipantMutation = useAddParticipant()

    const handleJoinRace = async () => {
        if (!race || !user) return

        try {
            await addParticipantMutation.mutateAsync({
                race_id: race.id,
                user_id: user.id,
            })

            socket.emit("joinRace", { raceId: race.id, userId: user.id })

            toast.success("Successfully joined the race!")

            // Navigate to race detail or races list
            setTimeout(() => {
                navigate(`/dashboard/races/${race.id}`)
            }, 1500)
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message || "Failed to join race.")
            }
        }
    }

    useEffect(() => {
        loadStripe(STRIPE_PUBLISHABLE_KEY).then((loadedStripe) => {
            setStripe(loadedStripe)
        })
    }, [])

    useEffect(() => {
        if (!race?.price || !user) return

        fetch(`${BASE_URL}/api/auth/create-payment-intent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: race.price,
            }),
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret))
    }, [race?.price, user])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">
                        Loading payment details...
                    </p>
                </div>
            </div>
        )
    }

    if (!race) {
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
                        Race Not Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        The race you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate("/races")}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-green-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                    >
                        Browse Races
                    </button>
                </div>
            </div>
        )
    }

    const participantCount = race.participants?.length || 0
    const maxParticipants = race.max_participants
    const progressPercentage = maxParticipants
        ? (participantCount / maxParticipants) * 100
        : 0

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back
                    </button>

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
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                RACE REGISTRATION
                            </h1>
                            <p className="text-sm text-gray-600 font-medium">
                                Secure payment checkout
                            </p>
                        </div>
                    </div>
                </div>

                {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Race Info - Left Side (2 cols on large) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Race Card */}
                        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                            {/* Banner */}
                            {race.banner_url ? (
                                <div className="h-48 relative">
                                    <img
                                        src={race.banner_url}
                                        alt={race.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-6">
                                        <h2 className="text-2xl font-black text-white mb-1">
                                            {race.name}
                                        </h2>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 bg-gradient-to-br from-cyan-500 to-green-500 relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg
                                            className="w-20 h-20 text-white opacity-20"
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
                                    <div className="absolute bottom-4 left-6">
                                        <h2 className="text-2xl font-black text-white mb-1">
                                            {race.name}
                                        </h2>
                                    </div>
                                </div>
                            )}

                            <div className="p-6">
                                {/* Description */}
                                {race.description && (
                                    <p className="text-gray-600 mb-4">
                                        {race.description}
                                    </p>
                                )}

                                {/* Race Details */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-3">
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
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Start Date
                                            </p>
                                            <p className="font-bold text-gray-900">
                                                {new Date(
                                                    race.start_time,
                                                ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
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
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Start Time
                                            </p>
                                            <p className="font-bold text-gray-900">
                                                {new Date(
                                                    race.start_time,
                                                ).toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Organizer */}
                                {race.created_by_user && (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-green-500 rounded-full flex items-center justify-center text-white font-black text-lg">
                                            {race.created_by_user.full_name?.charAt(
                                                0,
                                            ) || "?"}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Organized By
                                            </p>
                                            <p className="font-bold text-gray-900">
                                                {race.created_by_user.full_name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Participants Progress */}
                                {maxParticipants && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-gray-700">
                                                Registration Progress
                                            </span>
                                            <span className="text-sm font-black text-gray-900">
                                                {participantCount} /{" "}
                                                {maxParticipants}
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(
                                                        progressPercentage,
                                                        100,
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                        {progressPercentage >= 100 && (
                                            <p className="text-sm text-red-600 font-bold mt-2">
                                                ⚠️ Registration is full
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment - Right Side (1 col on large) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden sticky top-6">
                            {/* Price Header */}
                            <div className="bg-gradient-to-br from-cyan-500 to-green-500 p-6 text-white">
                                <p className="text-sm font-bold uppercase tracking-wider mb-2 opacity-90">
                                    Registration Fee
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-bold">₱</span>
                                    <span className="text-5xl font-black">
                                        {race.price?.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg
                                        className="w-5 h-5 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    <span className="text-sm font-bold text-gray-700">
                                        Secure Payment
                                    </span>
                                </div>

                                {clientSecret && stripe ? (
                                    <Elements
                                        stripe={stripe}
                                        options={{ clientSecret }}
                                    >
                                        <Checkout onSuccess={handleJoinRace} />
                                    </Elements>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                        <p className="text-sm text-gray-600 font-medium">
                                            Preparing payment...
                                        </p>
                                    </div>
                                )}

                                {/* Security Info */}
                                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                                    <div className="flex items-start gap-3 text-sm text-gray-600 mb-3">
                                        <svg
                                            className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>
                                        <span>
                                            Your payment information is secure
                                            and encrypted
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <svg
                                            className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span>
                                            You'll receive a confirmation email
                                            after payment
                                        </span>
                                    </div>
                                </div>

                                {/* Stripe Badge */}
                                <div className="mt-6 text-center">
                                    <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                                        <span>Powered by</span>
                                        <svg
                                            className="h-4"
                                            viewBox="0 0 60 25"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 01-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 013.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 01-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 01-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 00-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"
                                                fill="#6772e5"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
