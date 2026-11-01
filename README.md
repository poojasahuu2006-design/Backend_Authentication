# 🔐 Backend Authentication API

A secure Node.js & Express authentication backend with **JWT access/refresh tokens**, **session management**, **email OTP verification** using Nodemailer, and **interactive Swagger UI API documentation**.

---

## ✨ Features

- **Interactive Swagger Documentation**: Explore and execute requests directly from the browser at `/api-docs`.
- **Email OTP Verification**: Generates a 6-digit OTP and sends responsive HTML verification emails via Gmail SMTP.
- **Dual-Token Auth**: 15-minute JWT access tokens and 7-day refresh tokens stored in secure `httpOnly` cookies.
- **Session Tracking & Device Revocation**: Tracks client IP and User-Agent in MongoDB; supports single-device and all-device logout.
- **Protected Routes**: Secure `/api/auth/get-me` endpoint validating session revocation status.

---

## 🛠️ Tech Stack

- **Backend**: Node.js (ES Modules), Express 5
- **Database**: MongoDB with Mongoose
- **Auth & Security**: JSON Web Tokens (`jsonwebtoken`), Node.js `crypto`, `cookie-parser`
- **Documentation**: Swagger UI (`swagger-ui-express`, OpenAPI 3.0)
- **Email**: Nodemailer (Gmail App Password)

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/poojasahuu2006-design/Backend_Authentication.git
cd Backend_Authentication
npm install
```

### 2. Configure Environment (`.env`)
Create a `.env` file based on `.env.example`:
```env
PORT=3000
MONGODB_URL="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
GOOGLE_USER="your_email@gmail.com"
EMAIL_APP_PASSWORD="your_16_char_app_password"
```

### 3. Run the Server
```bash
# Development (with nodemon)
npm run dev

# Production
node server.js
```

---

## 📖 API Documentation (Swagger)

Once the server is running, access the interactive Swagger documentation at:
👉 **`http://localhost:3000/api-docs`**

---

## 📡 API Reference

Base URL: `http://localhost:3000/api/auth`

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Register user & send OTP email | Public |
| `POST` | `/verify-email` | Verify OTP & issue tokens | Public |
| `POST` | `/login` | Authenticate user & set session cookie | Public |
| `POST` | `/refresh-token` | Rotate refresh token & issue new access token | Cookie |
| `GET` | `/get-me` | Get current user profile | `Bearer <token>` |
| `GET` | `/logout` | Revoke current session & clear cookie | Cookie |
| `GET` | `/logout-all` | Revoke all sessions across all devices | Cookie |

---

## 👤 Author

- **Pooja Sahu** - [@poojasahuu2006-design](https://github.com/poojasahuu2006-design)

---

## 📄 License
Licensed under the [ISC License](LICENSE).
