import { PaymentElement } from "@stripe/react-stripe-js"
import { useState } from "react"
import { useStripe, useElements } from "@stripe/react-stripe-js"

export default function Checkout({
    onSuccess,
}: {
    onSuccess: () => Promise<void>
}) {
    const stripe = useStripe()
    const elements = useElements()

    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setIsProcessing(true)

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        })

        if (error) {
            setMessage(error.message ?? "Payment failed")
        } else if (paymentIntent?.status === "succeeded") {
            await onSuccess()
            setMessage("🎉 Payment successful! You joined the race.")
        }

        setIsProcessing(false)
    }

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button className="w-full py-4 font-heading text-2xl rounded-lg transition-all bg-linear-to-br from-cyan-400 to-lime-600 text-white hover:shadow-2xl hover:shadow-electric-cyan/50" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Pay & Join Race"}
            </button>
            {message && <p>{message}</p>}
        </form>
    )
}
