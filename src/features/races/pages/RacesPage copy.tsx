import { useState } from "react"
import { useNavigate } from "react-router-dom"

const RacesPage = () => {
    const [raceId, setRaceId] = useState("")
    const navigate = useNavigate()

    const startTest = () => {
        if (!raceId) return
        navigate(`/dashboard/races/${raceId}/live`)
    }

    const goToCreateRace = () => {
        navigate("/dashboard/races/create")
    }

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Races</h1>

                    <button
                        onClick={goToCreateRace}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                    >
                        + Create New Race
                    </button>
                </div>

                <div className="space-y-4 border p-4 rounded-lg">
                    <h2 className="font-medium">Test Race</h2>

                    <input
                        value={raceId}
                        onChange={(e) => setRaceId(e.target.value)}
                        placeholder="Enter race ID to test"
                        className="border p-2 rounded w-full"
                        type="number"
                    />

                    <button
                        onClick={startTest}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Start Test Race
                    </button>
                </div>
            </div>
        </>
    )
}

export default RacesPage
