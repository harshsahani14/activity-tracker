import { useState } from "react"
import toast from "react-hot-toast"
import { authAPI } from "../services/api"

export default function LoginRegister({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            let result
            if (isRegister) {
                const { name, email, password } = formData
                if (!name) {
                    throw new Error("Name is required")
                }
                result = await authAPI.register(name, email, password)
                toast.success("Account created successfully!")
            } else {
                const { email, password } = formData
                result = await authAPI.login(email, password)
                toast.success("Logged in successfully!")
            }

            onLogin(result.token)
        } catch (err) {
            toast.error(err.message || "Authentication failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
                    {isRegister ? "Create Account" : "Login"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        {loading ? "Loading..." : isRegister ? "Register" : "Login"}
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-600">
                    {isRegister ? "Already have an account?" : "Don't have an account?"}
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegister(!isRegister)
                            setFormData({ name: "", email: "", password: "" })
                        }}
                        disabled={loading}
                        className="ml-2 text-blue-500 hover:text-blue-600 font-bold underline disabled:text-gray-400"
                    >
                        {isRegister ? "Login" : "Register"}
                    </button>
                </p>
            </div>
        </div>
    )
}