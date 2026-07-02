import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { getAuthToken, setAuthToken } from "./services/api"
import LoginRegister from "./components/LoginRegister"
import Dashboard from "./components/Dashboard"

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (getAuthToken()) {
            setIsAuthenticated(true)
        }
        setLoading(false)
    }, [])

    const handleLogin = (token) => {
        setAuthToken(token)
        setIsAuthenticated(true)
    }

    const handleLogout = () => {
        setAuthToken(null)
        setIsAuthenticated(false)
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-gray-600">Loading...</div>
    }

    return (
        <>
            <Toaster position="top-center" />
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ? (
                                <Navigate to="/dashboard" />
                            ) : (
                                <LoginRegister onLogin={handleLogin} />
                            )
                        }
                    />
                    <Route
                        path="/dashboard/*"
                        element={
                            isAuthenticated ? (
                                <Dashboard onLogout={handleLogout} />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App