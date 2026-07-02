import { useState, useEffect } from "react"
import { activityAPI } from "../services/api"

export default function SuspiciousUsersPage() {
    const [suspiciousUsers, setSuspiciousUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchSuspiciousUsers = async () => {
        try {
            setLoading(true)
            const data = await activityAPI.getSuspicious()
            setSuspiciousUsers(data)
            setError("")
        } catch (err) {
            setError(err.message || "Failed to fetch suspicious users")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSuspiciousUsers()
        const interval = setInterval(fetchSuspiciousUsers, 5000)
        return () => clearInterval(interval)
    }, [])

    if (loading && suspiciousUsers.length === 0) {
        return <div className="text-center text-gray-600">Loading suspicious activity data...</div>
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
                <h2 className="text-2xl font-bold text-gray-900">Suspicious Activity Detection</h2>
                <span className="text-sm text-gray-600">Auto-refreshing every 5 seconds</span>
            </div>

            {suspiciousUsers.length === 0 ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-green-700 font-medium">No suspicious activity detected ✓</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User ID</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reason</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suspiciousUsers.map((user, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.userId}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            {user.reason}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                                        {user.count}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}