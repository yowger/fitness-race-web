import { Link } from "react-router-dom"

export default function SoloDashboardPage() {
    return (
        <div>
            <Link to="/solo/run">
                <button>Go run</button>
            </Link>
        </div>
    )
}
