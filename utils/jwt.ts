import jwt from "jsonwebtoken";
import ENV from "../config/env";

const JWT_SECRET = ENV.JWT_SECRET!;

export function generateToken(userId: string) {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
}