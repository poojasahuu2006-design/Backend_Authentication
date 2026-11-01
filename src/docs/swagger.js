import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Backend Authentication & Session Management API",
    version: "1.0.0",
    description:
      "Production-ready authentication backend with JWT Access/Refresh tokens, session tracking & revocation in MongoDB, and automated email OTP verification via Nodemailer.",
    contact: {
      name: "Pooja Sahu",
      url: "https://github.com/poojasahuu2006-design",
      email: "poojasahuu2006@gmail.com"
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server"
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your 15-minute JWT access token"
      }
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: {
            type: "string",
            example: "pooja"
          },
          email: {
            type: "string",
            format: "email",
            example: "poojasahuu2006@gmail.com"
          },
          password: {
            type: "string",
            format: "password",
            example: "securePassword123"
          }
        }
      },
      VerifyEmailRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "poojasahuu2006@gmail.com"
          },
          otp: {
            type: "string",
            example: "123456"
          }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "poojasahuu2006@gmail.com"
          },
          password: {
            type: "string",
            format: "password",
            example: "securePassword123"
          }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Logged in Successfully"
          },
          user: {
            type: "object",
            properties: {
              username: { type: "string", example: "pooja" },
              email: { type: "string", example: "poojasahuu2006@gmail.com" },
              verified: { type: "boolean", example: true }
            }
          },
          accessToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Invalid email or password"
          }
        }
      }
    }
  },
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register new user",
        description: "Creates an unverified account, hashes password, generates 6-digit OTP and sends HTML verification email.",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "User registered successfully, OTP sent to email",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User registered successfully" },
                    user: {
                      type: "object",
                      properties: {
                        username: { type: "string", example: "pooja" },
                        email: { type: "string", example: "poojasahuu2006@gmail.com" },
                        verified: { type: "boolean", example: false }
                      }
                    }
                  }
                }
              }
            }
          },
          409: {
            description: "Username or email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/verify-email": {
      post: {
        summary: "Verify email with OTP",
        description: "Validates 6-digit OTP, marks user account verified, creates active session, sets 7-day refresh token cookie, and returns access token.",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyEmailRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Email verified successfully, session created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          401: {
            description: "Invalid or expired OTP",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/login": {
      post: {
        summary: "User login",
        description: "Validates credentials, creates a new session in MongoDB with IP & User-Agent, sets 7-day HTTP-only refresh token cookie, and returns access token.",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Logged in successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          401: {
            description: "Invalid email or password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/get-me": {
      get: {
        summary: "Get current user profile",
        description: "Validates Bearer access token and checks that the associated session in MongoDB is active and not revoked.",
        tags: ["User Profile"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User profile fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User fetched successfully" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "6ae79bc6d991d65be207cb01" },
                        username: { type: "string", example: "pooja" },
                        email: { type: "string", example: "poojasahuu2006@gmail.com" },
                        verified: { type: "boolean", example: true }
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthorized - Token missing, invalid, or session revoked",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/refresh-token": {
      post: {
        summary: "Refresh access token",
        description: "Uses HTTP-only refresh token cookie to issue a new access token and rotate the refresh token.",
        tags: ["Session Management"],
        responses: {
          200: {
            description: "Access token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Access token refreshed successfully" },
                    accessToken: { type: "string", example: "eyJhbGciOi..." }
                  }
                }
              }
            }
          },
          401: {
            description: "Refresh token not found or session revoked",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" }
              }
            }
          }
        }
      }
    },
    "/api/auth/logout": {
      get: {
        summary: "Logout from current device",
        description: "Revokes the active session tied to the current refresh token cookie and clears the cookie.",
        tags: ["Session Management"],
        responses: {
          200: {
            description: "Logged out successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Logged out successfully" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/logout-all": {
      get: {
        summary: "Logout from all devices",
        description: "Revokes all active sessions for the user across every device and clears the refresh cookie.",
        tags: ["Session Management"],
        responses: {
          200: {
            description: "Logged out from all devices successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Logged out from all devices successfully" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("Swagger documentation initialized at /api-docs");
}
