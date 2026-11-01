import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is not defined in environment variables");
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

if (!process.env.GOOGLE_USER) {
    throw new Error("GOOGLE_USER is not defined in environment variables");
}

const config = {
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_USER: process.env.GOOGLE_USER,
    EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN
};

export default config;
