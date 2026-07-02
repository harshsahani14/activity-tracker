import { useState, useEffect } from "react"
import { activityAPI } from "../services/api"

export default function StatsPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchStats = async () => {
        try {
            setLoading(true)
            const data = await activityAPI.getStats()
            setStats(data)
            setError("")
        } catch (err) {
            setError(err.message || "Failed to fetch stats")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 5000) // Auto-refresh every 5 seconds
        return () => clearInterval(interval)
    }, [])

    if (loading && !stats) {
        return <div className="text-center text-gray-600">Loading stats...</div>
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Activity Statistics</h2>
                <span className="text-sm text-gray-600">Auto-refreshing every 5 seconds</span>
            </div>

          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-sm text-gray-600 mb-2">Total Actions</p>
                    <p className="text-4xl font-bold text-blue-600">{stats?.totalActions || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-sm text-gray-600 mb-2">Most Common Action</p>
                    <p className="text-2xl font-bold text-green-600 capitalize">
                        {stats?.mostCommonAction?.action || "—"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Count: {stats?.mostCommonAction?.count || 0}
                    </p>
                </div>

             
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-sm text-gray-600 mb-2">Most Active User</p>
                    <p className="text-xl font-bold text-purple-600">
                        {stats?.mostActiveUser?.name || "—"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Actions: {stats?.mostActiveUser?.count || 0}
                    </p>
                </div>
            </div>

            
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Actions Per Minute (Last 10 Minutes)</h3>
                {stats?.actionsPerMinute?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Minute</th>
                                    <th className="text-right py-2 px-4 font-semibold text-gray-700">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.actionsPerMinute.map((entry, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-2 px-4 text-gray-600">
                                            {new Date(entry.minute).toLocaleTimeString()}
                                        </td>
                                        <td className="text-right py-2 px-4 font-semibold text-gray-900">
                                            {entry.count}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">No data available</p>
                )}
            </div>
        </div>
    )
}