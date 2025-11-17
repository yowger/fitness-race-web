import { useState } from "react"
import { ArrowLeft, Mail, Lock, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { supabase } from "../../../lib/supabase"
import { useCreateUser } from "../hooks/useUser"
import { toast } from "sonner"

const SignUpPage = () => {
    const navigate = useNavigate()
    const { mutateAsync: createUser } = useCreateUser()

    const [status, setStatus] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [formValues, setFormValues] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (formValues.password !== formValues.confirmPassword) {
            toast.error("Passwords do not match!")
            return
        }

        if (formValues.password.length < 6) {
            toast.error("Password must be at least 6 characters long")
            return
        }

        setIsLoading(true)
        setStatus("Creating account...")

        const { data, error } = await supabase.auth.signUp({
            email: formValues.email,
            password: formValues.password,
        })

        if (error) {
            setIsLoading(false)
            setStatus("")
            toast.error(error.message)
            return
        }

        const authUser = data.user
        if (!authUser) {
            setIsLoading(false)
            setStatus("")
            toast.error("Failed to get created user")
            return
        }

        try {
            await createUser({
                id: authUser.id,
                email: formValues.email,
                fullName: formValues.name,
            })
        } catch (err) {
            setIsLoading(false)
            setStatus("")

            if (err instanceof Error) {
                toast.error(err?.message || "Failed to create user profile")
            }

            return
        }

        setIsLoading(false)
        setStatus("")

        toast.success("Account created successfully!")

        navigate("/dashboard", { replace: true })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" />
                <div
                    className="absolute top-40 right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
                    style={{ animationDelay: "1s" }}
                />
                <div
                    className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
                    style={{ animationDelay: "2s" }}
                />
            </div>

            <ArrowLeft
                className="absolute top-8 left-8 w-5 h-5 text-emerald-200 cursor-pointer hover:text-emerald-100 transition-colors duration-300"
                onClick={() => navigate("/", { replace: true })}
            />

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/10">
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-4">
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
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Start Your Journey
                        </h1>
                        <p className="text-emerald-200">
                            Create an account to begin running
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-emerald-200 mb-2"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formValues.name}
                                onChange={handleInputChange}
                                placeholder="Your Name"
                                className="w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-emerald-200 mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-emerald-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formValues.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-emerald-200 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-emerald-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formValues.password}
                                    onChange={handleInputChange}
                                    placeholder="At least 6 characters"
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-emerald-200 mb-2"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-emerald-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formValues.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm your password"
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                                />
                            </div>
                        </div>

                        {status && (
                            <p className="text-emerald-300 text-sm text-center">
                                {status}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-emerald-200">
                            Already have an account?{" "}
                            <a
                                href="/auth/sign-in"
                                className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
                            >
                                Sign In
                            </a>
                        </p>
                    </div>
                </div>

                <p className="text-center text-emerald-300/60 text-sm mt-6">
                    By creating an account, you agree to receive updates about
                    your runs and achievements
                </p>
            </div>
        </div>
    )
}

export default SignUpPage
