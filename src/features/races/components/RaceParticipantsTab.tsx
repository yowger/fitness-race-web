import { useState } from "react"
import { Users } from "lucide-react"
import type { Participant, Race } from "../hooks/useRaces"
import { getAvatarUrl } from "../../../lib/avatar"
import { useUpdateParticipantBib } from "../hooks/useRaces"

export default function RaceParticipantsTab({ race }: { race: Race }) {
    const [editingParticipantId, setEditingParticipantId] = useState<
        string | null
    >(null)
    const [editingBibValue, setEditingBibValue] = useState<string>("")
    const [error, setError] = useState<string>("")

    const updateBibMutation = useUpdateParticipantBib()

    const handleDownloadCSV = () => {
        if (!race?.participants?.length) return

        const headers = ["Bib Number", "Name", "User ID"]
        const rows = race.participants.map((p) => [
            p.bib_number ?? "",
            p.user.full_name,
            p.user.id,
        ])

        const csvContent = [headers, ...rows]
            .map((row) => row.join(","))
            .join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = `race-${race.id}-participants.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    const startEditing = (p: Participant) => {
        setEditingParticipantId(p.id)
        setEditingBibValue(p.bib_number?.toString() ?? "")
        setError("")
    }

    const cancelEditing = () => {
        setEditingParticipantId(null)
        setEditingBibValue("")
        setError("")
    }

    const saveBib = async (participantId: string) => {
        if (!race?.participants) return

        const bibNumber = parseInt(editingBibValue)
        if (isNaN(bibNumber) || bibNumber <= 0) {
            setError("Bib number must be a positive number")
            return
        }

        const duplicate = race.participants.some(
            (p) => p.id !== participantId && p.bib_number === bibNumber
        )
        if (duplicate) {
            setError("This bib number is already assigned")
            return
        }

        try {
            await updateBibMutation.mutateAsync({
                race_id: race.id,
                user_id: participantId,
                bib_number: bibNumber,
            })
            cancelEditing()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || "Failed to update bib")
            }
        }
    }

    return (
        <div className="fade-in space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-4xl text-gray-900">
                    Registered Participants
                </h2>

                {race?.participants?.length ? (
                    <button
                        onClick={handleDownloadCSV}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                        Download CSV
                    </button>
                ) : null}
            </div>

            {race?.participants?.length ? (
                <div className="space-y-3">
                    {race.participants.map((p) => {
                        console.log("🚀 ~ RaceParticipantsTab ~ p:", p)
                        const isEditing = editingParticipantId === p.id
                        return (
                            <div
                                key={p.id}
                                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <img
                                        src={getAvatarUrl(
                                            p.user.full_name || ""
                                        )}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <div className="font-body font-medium text-gray-800">
                                            {p.user.full_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Registered
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        Bib
                                    </span>

                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editingBibValue}
                                                onChange={(e) =>
                                                    setEditingBibValue(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        saveBib(p.id)
                                                    if (e.key === "Escape")
                                                        cancelEditing()
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                onClick={() =>
                                                    saveBib(p.user.id)
                                                }
                                                className="px-2 py-1 text-xs font-medium text-green-600 hover:text-green-800 transition"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 transition"
                                            >
                                                Cancel
                                            </button>
                                            {error && (
                                                <div className="text-red-500 text-xs">
                                                    {error}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {p.bib_number ? (
                                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-700">
                                                    #{p.bib_number}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-500">
                                                    Not assigned
                                                </span>
                                            )}
                                            <button
                                                onClick={() => startEditing(p)}
                                                className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                    <Users className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="font-body text-gray-600 font-medium">
                        No participants yet
                    </p>
                    <p className="text-sm text-gray-500">
                        Participants will appear here once they register.
                    </p>
                </div>
            )}
        </div>
    )
}
