import { useState } from "react"
import { useNavigate } from "react-router-dom"

const RacesPage = () => {
    const [raceId, setRaceId] = useState("")
    const navigate = useNavigate()

    const startTest = () => {
        navigate(`/dashboard/races/${raceId}/live`)
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Test Race</h1>

            <input
                value={raceId}
                onChange={(e) => setRaceId(e.target.value)}
                placeholder="Enter test race id"
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
    )
}

export default RacesPage

//    RacesPage → RaceCreatePage → RaceDetailsPage → RaceLivePage → RaceResults
