import { useState } from "react"
import ActivitySimulator from "./ActivitySimulator"
import StatsPage from "./StatsPage"
import SuspiciousUsersPage from "./SuspiciousUsersPage"

export default function Dashboard({ onLogout }) {
    const [currentPage, setCurrentPage] = useState("simulator")

    return (
        <div className="min-h-screen bg-gray-100">
            
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Activity Tracker</h1>
                    <button
                        onClick={onLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex gap-4">
                    <button
                        onClick={() => setCurrentPage("simulator")}
                        className={`px-4 py-2 font-semibold rounded-lg transition ${
                            currentPage === "simulator"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Activity Simulator
                    </button>
                    <button
                        onClick={() => setCurrentPage("stats")}
                        className={`px-4 py-2 font-semibold rounded-lg transition ${
                            currentPage === "stats"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Stats
                    </button>
                    <button
                        onClick={() => setCurrentPage("suspicious")}
                        className={`px-4 py-2 font-semibold rounded-lg transition ${
                            currentPage === "suspicious"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Suspicious Users
                    </button>
                </div>
            </nav>
            
            <main className="max-w-7xl mx-auto px-4 py-8">
                {currentPage === "simulator" && <ActivitySimulator />}
                {currentPage === "stats" && <StatsPage />}
                {currentPage === "suspicious" && <SuspiciousUsersPage />}
            </main>
        </div>
    )
}