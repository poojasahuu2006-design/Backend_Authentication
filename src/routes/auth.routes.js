import {Router} from "express"
import * as authController from "../Config/controllers/auth.controller.js";
import app from "../app.js";

const authRouter=Router();

//Now the declaration of API

authRouter.post("/register",authController.register);

//login
authRouter.post("/login",authController.login)

//GET
authRouter.get("/get-me",authController.getMe)

//Get /api/auth/logout
authRouter.get("/logout",authController.logout)

//Get /api/auth/logout-all
authRouter.get("/logout-all", authController.logoutAll)

//Verify Email API
authRouter.post("/verify-email", authController.verifyEmail)

export default authRouter;