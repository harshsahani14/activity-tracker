import { useState } from "react"
import toast from "react-hot-toast"
import { activityAPI } from "../services/api"

export default function ActivitySimulator() {
    const [loading, setLoading] = useState(false)
    const [rateLimited, setRateLimited] = useState(false)
    const [actionsInLast10Sec, setActionsInLast10Sec] = useState(0)
    const [serverTime, setServerTime] = useState("")
    const [actionTimestamps, setActionTimestamps] = useState([]) 

    const actions = ["login", "logout", "view", "click", "custom"]

    const handleActionClick = async (action) => {
        setLoading(true)
        const now = Date.now()

        try {
            const result = await activityAPI.log(action, { timestamp: new Date().toISOString() })
            
            toast.success(`Action "${action}" logged successfully`)
            setActionsInLast10Sec(result.actionsInLast10Sec)
            setServerTime(result.serverTime)
            setRateLimited(false)

            const newTimestamps = [...actionTimestamps, now].filter(ts => ts > now - 10000)
            setActionTimestamps(newTimestamps)
        } catch (err) {
            if (err.message.includes("Rate limit")) {
                setRateLimited(true)
                toast.error("Rate limit exceeded. Trying again in 2 seconds...")
                
                setTimeout(() => setRateLimited(false), 2000)
            } else {
                toast.error(err.message || "Failed to log activity")
            }
        } finally {
            setLoading(false)
        }
    }

    const now = Date.now()
    const windowStart = now - 10000 
    const getPosition = (timestamp) => {
        return ((timestamp - windowStart) / 10000) * 100
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity Simulator</h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {actions.map((action) => (
                        <button
                            key={action}
                            onClick={() => handleActionClick(action)}
                            disabled={loading || rateLimited}
                            className={`py-3 px-4 rounded-lg font-semibold transition capitalize ${
                                loading || rateLimited
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 text-white active:scale-95"
                            }`}
                        >
                            {action}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Sliding Window (Last 10 Seconds)</h3>
                    

                    <div className="relative bg-white border-2 border-gray-300 rounded-lg h-16 mb-2 overflow-hidden">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sec) => (
                            <div
                                key={sec}
                                className="absolute top-0 bottom-0 border-l border-gray-200"
                                style={{ left: `${(sec / 10) * 100}%` }}
                            />
                        ))}

                    
                        {actionTimestamps.map((timestamp, idx) => (
                            <div
                                key={idx}
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full border-2 border-blue-700 shadow-lg"
                                style={{ left: `${getPosition(timestamp)}%` }}
                                title={new Date(timestamp).toLocaleTimeString()}
                            />
                        ))}

            
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500" />
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 mb-4">
                        <span>10s ago</span>
                        <span>5s ago</span>
                        <span>Now →</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Actions in Window</p>
                            <p className="text-2xl font-bold text-blue-600">{actionsInLast10Sec} / 5</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded">
                            <p className="text-xs text-gray-600">Window Status</p>
                            <p className="text-lg font-bold">
                                <span className={actionsInLast10Sec >= 5 ? "text-red-600" : "text-green-600"}>
                                    {actionsInLast10Sec >= 5 ? "FULL" : "AVAILABLE"}
                                </span>
                            </p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded">
                            <p className="text-xs text-gray-600">Server Time</p>
                            <p className="text-xs text-gray-700 break-words">
                                {serverTime ? new Date(serverTime).toLocaleTimeString() : "—"}
                            </p>
                        </div>
                    </div>
                </div>

            
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h4 className="font-semibold text-blue-900 mb-2">How Sliding Window Works</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Each action is logged as a blue dot on the timeline</li>
                        <li>• Only actions within the last 10 seconds (left of the red line) count</li>
                        <li>• When you reach 5 actions, the window is FULL</li>
                        <li>• Wait for the oldest action to expire, then you can log more</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}