import { Link } from "react-router-dom"

const RoutesPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Routes</h1>
            <p>List of all your routes will go here.</p>
            <Link
                to="create"
                className="mt-4 inline-block px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
            >
                Create New Route
            </Link>
        </div>
    )
}

export default RoutesPage
