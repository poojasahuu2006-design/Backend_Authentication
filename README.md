# 🔐 Secure Backend Authentication & Session Management System

A robust, production-ready Node.js & Express RESTful authentication service featuring **JWT Access Tokens**, **HTTP-Only Cookie Refresh Tokens**, **Database-backed Session Tracking & Revocation**, and **Automated Email OTP Verification** via Nodemailer.

---

## 🚀 Features

- **User Registration & Email OTP Verification**:
  - Secure account registration with hashed passwords (SHA-256).
  - 6-digit one-time passcode (OTP) generation with styled HTML email delivery using Gmail SMTP.
  - Safe account verification before granting access.
- **Dual-Token Authentication (Access + Refresh Token)**:
  - Short-lived JSON Web Tokens (JWT) for API route authorization (15 minutes).
  - Long-lived rotating refresh tokens stored securely in `httpOnly`, `sameSite` cookies (7 days).
- **Session Management & Device Tracking**:
  - Active sessions tracked in MongoDB storing IP address and `User-Agent`.
  - Supports **Single-Device Logout** (revokes active session).
  - Supports **Logout from All Devices** (revokes all active sessions for that user).
- **Protected Routes & Robust Error Handling**:
  - Authenticated user profile retrieval (`/api/auth/get-me`).
  - Centralized JSON error-handling middleware preventing unhandled crashes.

---

## 🛠️ Tech Stack

- **Runtime & Framework**: [Node.js](https://nodejs.org/) (ES Modules), [Express 5](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/) with [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/), [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- **Email Service**: [Nodemailer](https://nodemailer.com/) with Gmail SMTP & App Passwords
- **Logger**: [Morgan](https://www.npmjs.com/package/morgan) (`dev` format)

---

## 📁 Project Structure

```text
Backend_Authentication/
├── server.js                          # Server bootstrap & DB connection initialization
├── package.json                       # Dependencies and run scripts
├── .env.example                       # Template for environment configuration
├── .gitignore                         # Protects secrets & node_modules from git
└── src/
    ├── app.js                         # Express configuration & global middlewares
    ├── Config/
    │   ├── Db.js                      # MongoDB connection handler
    │   ├── config.js                  # Environment variable validation & exports
    │   └── controllers/
    │       └── auth.controller.js     # Auth logic (register, login, verify, logout, getMe)
    ├── models/
    │   ├── user.model.js              # User schema (username, email, password, verified)
    │   ├── session.model.js           # Session schema (user, refreshTokenHash, ip, userAgent, revoked)
    │   └── otp.model.js               # OTP schema (email, user, otpHash, timestamps)
    ├── routes/
    │   └── auth.routes.js             # Route declarations for /api/auth/*
    ├── services/
    │   └── email.services.js          # Nodemailer transporter & email dispatcher
    └── utils/
        └── utils.js                   # OTP generator & responsive HTML template
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Backend_Authentication.git
cd Backend_Authentication
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env
```
Fill in your configuration:
```env
PORT=3000
MONGODB_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"
JWT_SECRET="your_secure_random_jwt_secret"
GOOGLE_USER="your_email@gmail.com"
EMAIL_APP_PASSWORD="your_16_character_google_app_password"
```

> **Note**: To generate an App Password, visit your [Google Account Security](https://myaccount.google.com/security) → Ensure 2-Step Verification is ON → Search **App Passwords** → Create one.

### 4. Run the server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
node server.js
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000/api/auth`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Creates a new user and sends an OTP email | ❌ |
| `POST` | `/verify-email` | Verifies OTP, activates account, and issues tokens | ❌ |
| `POST` | `/login` | Authenticates credentials and sets cookie | ❌ |
| `GET` | `/get-me` | Returns current user profile | ✅ (Bearer Token) |
| `GET` | `/logout` | Revokes the active session and clears cookie | ✅ (Cookie) |
| `GET` | `/logout-all` | Revokes all active sessions for the user | ✅ (Cookie) |

---

## 🧪 Postman Testing Samples

### 1. Register User (`POST /api/auth/register`)
```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```

### 2. Verify Email (`POST /api/auth/verify-email`)
```json
{
  "email": "johndoe@example.com",
  "otp": "123456"
}
```

### 3. Login (`POST /api/auth/login`)
```json
{
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```

### 4. Get Current User (`GET /api/auth/get-me`)
- **Authorization**: `Bearer <your_access_token>`

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
