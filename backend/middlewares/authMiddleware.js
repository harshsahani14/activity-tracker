import jwt from "jsonwebtoken"
import User from "../models/User.js"
import "dotenv/config"

export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided",
            })
        }

        const token = authHeader.split(" ")[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded) {
            return res.status(401).json({
                message: "Token is invalid",
            })
        }

        const user = await User.findById(decoded.userId).select("-password")

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }

        req.userId = decoded.userId  // Store userId for controllers to use
        req.user = user

        next()
    } catch (e) {
        console.log(e)

        return res.status(401).json({
            message: "Invalid or expired token",
        })
    }
}