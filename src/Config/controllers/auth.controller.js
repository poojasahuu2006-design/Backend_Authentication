import userModel from "../../models/user.model.js";
import crypto from "crypto"; // For password hashing
import jwt from "jsonwebtoken"; // For creating the token
import config from "../config.js";
import sessionModel from "../../models/session.model.js";
import { sendEmail } from "../../services/email.services.js";
import { generateOtp, getOtpHtml } from "../../utils/utils.js";
import otpModel from "../../models/otp.model.js";

// Register function
export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        // Check whether the user already exists or not
        const isAlreadyRegistered = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isAlreadyRegistered) {
            return res.status(409).json({
                message: "Username or email already exist"
            });
        }

        // Hash password
        const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        // Creating the user
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        // OTP generation
        const otp = generateOtp();
        const html = getOtpHtml(otp);
        const OtpHash = crypto.createHash("sha256").update(otp).digest("hex");

        await otpModel.create({
            email,
            user: user._id,
            otpHash: OtpHash
        });

        await sendEmail(email, "OTP Verification", "Your OTP is " + otp, html);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({
            message: error.message || "Failed to register user"
        });
    }
}

// Login function
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        const isPasswordValid = hashedPassword === user.password;

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const refreshToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || "unknown"
        });

        const accessToken = jwt.sign(
            {
                id: user._id,
                sessionId: session._id
            },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Logged in Successfully",
            user: {
                username: user.username,
                email: user.email
            },
            accessToken
        });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({
            message: error.message || "Login failed"
        });
    }
}

// Get current profile function
export async function getMe(req, res) {
    try {
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                message: "Authorization token not found"
            });
        }

        // Clean up token: extract everything after "Bearer " or strip repeated "Bearer"
        if (token.startsWith("Bearer ")) {
            token = token.slice(7).trim();
        }
        if (token.startsWith("Bearer ")) {
            token = token.slice(7).trim();
        }

        if (!token) {
            return res.status(401).json({
                message: "Token is empty"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, config.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({
                message: jwtErr.name === "TokenExpiredError" ? "Token has expired" : "Invalid token format or signature"
            });
        }

        if (!decoded || !decoded.sessionId) {
            return res.status(401).json({
                message: "Invalid token: session not found in token"
            });
        }

        // Verify session
        const session = await sessionModel.findById(decoded.sessionId);
        if (!session || session.revoked) {
            return res.status(401).json({
                message: "Session is invalid or revoked"
            });
        }

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });
    } catch (error) {
        console.error("Error in getMe:", error);
        res.status(500).json({
            message: error.message || "Failed to fetch user"
        });
    }
}

// Refresh token function
export async function refreshToken(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token not found"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, config.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({
                message: "Invalid or expired refresh token"
            });
        }

        const oldRefreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const session = await sessionModel.findOne({ refreshTokenHash: oldRefreshTokenHash });

        if (!session || session.revoked) {
            return res.status(401).json({
                message: "Session is invalid or revoked"
            });
        }

        // Generate new refreshToken
        const newRefreshToken = jwt.sign(
            { id: decoded.id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
        session.refreshTokenHash = newRefreshTokenHash;
        await session.save();

        const accessToken = jwt.sign(
            {
                id: decoded.id,
                sessionId: session._id
            },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken
        });
    } catch (error) {
        console.error("Error in refreshToken:", error);
        res.status(500).json({
            message: error.message || "Failed to refresh token"
        });
    }
}

// Logout function
export async function logout(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
            await sessionModel.findOneAndUpdate(
                { refreshTokenHash },
                { revoked: true }
            );
        }

        res.clearCookie("refreshToken");

        res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({
            message: error.message || "Failed to logout"
        });
    }
}

// Logout all devices function
export async function logoutAll(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token not found"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, config.JWT_SECRET);
        } catch (jwtErr) {
            return res.status(401).json({
                message: "Invalid or expired refresh token"
            });
        }

        await sessionModel.updateMany(
            {
                user: decoded.id,
                revoked: false
            },
            {
                revoked: true
            }
        );

        res.clearCookie("refreshToken");

        res.status(200).json({
            message: "Logged out from all devices successfully"
        });
    } catch (error) {
        console.error("Error in logoutAll:", error);
        res.status(500).json({
            message: error.message || "Failed to logout from all devices"
        });
    }
}

// Verify email with OTP function
export async function verifyEmail(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const otpHash = crypto.createHash("sha256").update(otp.toString().trim()).digest("hex");

        const otpRecord = await otpModel.findOne({ email, otpHash });

        if (!otpRecord) {
            return res.status(401).json({
                message: "Invalid OTP"
            });
        }

        const user = await userModel.findById(otpRecord.user);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.verified = true;
        await user.save();

        await otpModel.deleteOne({ _id: otpRecord._id });

        // Generate Tokens & Session
        const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"] || "unknown"
        });

        const accessToken = jwt.sign(
            { id: user._id, sessionId: session._id },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Email verified successfully",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified
            },
            accessToken
        });
    } catch (error) {
        console.error("Error in verifyEmail:", error);
        res.status(500).json({
            message: error.message || "Failed to verify email"
        });
    }
}
