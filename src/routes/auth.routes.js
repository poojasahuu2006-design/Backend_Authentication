import { Router } from "express";
import * as authController from "../Config/controllers/auth.controller.js";

const authRouter = Router();

// Registration & Verification
authRouter.post("/register", authController.register);
authRouter.post("/verify-email", authController.verifyEmail);

// Authentication & Token Refresh
authRouter.post("/login", authController.login);
authRouter.post("/refresh-token", authController.refreshToken);

// Profile
authRouter.get("/get-me", authController.getMe);

// Logout
authRouter.get("/logout", authController.logout);
authRouter.get("/logout-all", authController.logoutAll);

export default authRouter;
