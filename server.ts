import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// Force load environment files
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up JWT Secret with a safe fallback
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-recovery-session-key-12345";

// ============================================
// DATA STORAGE INTERFACE (MONGODB VS IN-MEMORY)
// ============================================

interface OTPData {
  otp: string;
  expiresAt: Date;
}

interface OTPStore {
  saveOTP(email: string, otp: string, expiresAt: Date): Promise<void>;
  getOTP(email: string): Promise<OTPData | null>;
  deleteOTP(email: string): Promise<void>;
}

// In-Memory fallback OTP store
class MemoryOTPStore implements OTPStore {
  private store = new Map<string, OTPData>();

  async saveOTP(email: string, otp: string, expiresAt: Date): Promise<void> {
    this.store.set(email.toLowerCase(), { otp, expiresAt });
  }

  async getOTP(email: string): Promise<OTPData | null> {
    const data = this.store.get(email.toLowerCase());
    return data || null;
  }

  async deleteOTP(email: string): Promise<void> {
    this.store.delete(email.toLowerCase());
  }
}

// MongoDB database OTP store (via Mongoose)
class MongoOTPStore implements OTPStore {
  private schema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  });

  private OTPModel: any;

  constructor() {
    // Keep a model scoped cleanly; register with mongoose only once
    const modelName = "EmailOTP";
    this.OTPModel = mongoose.models[modelName] || mongoose.model(modelName, this.schema);
  }

  async saveOTP(email: string, otp: string, expiresAt: Date): Promise<void> {
    await this.OTPModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, expiresAt },
      { upsert: true, new: true }
    );
  }

  async getOTP(email: string): Promise<OTPData | null> {
    const record = await this.OTPModel.findOne({ email: email.toLowerCase() });
    if (!record) return null;
    return {
      otp: record.otp,
      expiresAt: record.expiresAt,
    };
  }

  async deleteOTP(email: string): Promise<void> {
    await this.OTPModel.deleteOne({ email: email.toLowerCase() });
  }
}

let activeStore: OTPStore = new MemoryOTPStore();
let mongoStatus = "Disconnected";

// Self-initializing MongoDB function, run in background to keep startup super fast and resilient!
async function connectToMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("example.mongodb.net") || uri === "") {
    console.warn("⚠️ MONGODB_URI is not provided or is generic. Statically falling back to fully-functioning Local Store.");
    return;
  }

  try {
    console.log("⏳ Connection attempts to MongoDB cluster ongoing...");
    await mongoose.connect(uri, {
      connectTimeoutMS: 8000,
      serverSelectionTimeoutMS: 8000,
    });
    activeStore = new MongoOTPStore();
    mongoStatus = "Connected (MongoDB)";
    console.log("✅ Successfully connected to MongoDB Database. Store migrated to Mongoose.");
  } catch (error: any) {
    console.warn("⚠️ MongoDB connection notice (using resilient InMemory fallback):", error.message);
    console.warn("⚠️ Falling back to fully functional In-Memory Database store to ensure continuous uptime.");
  }
}

connectToMongo();

// ============================================
// MAILER SETUP
// ============================================

interface MailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

function getMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass || user.includes("your-email") || pass.includes("your-pass")) {
    return null;
  }
  return { host, port, user, pass };
}

// Function to send actual OTP email using Nodemailer
async function sendOTPMail(email: string, otp: string): Promise<boolean> {
  const config = getMailConfig();
  if (!config) {
    // Indicate that real SMTP is skipped (Development simulation mode)
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465, // True for 465, false for other ports (like 587)
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const isTest = config.host.includes("ethereal.email");

    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); -webkit-background-clip: text; color: transparent;">🤖 AuthSecure</span>
        </div>
        <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello,</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.5;">You requested an OTP verification code. Use the code below to complete your sign-in. This code is valid for <strong>5 minutes</strong>.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; letter-spacing: 6px; font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: bold; color: #1e1b4b; background-color: #f1f5f9; padding: 14px 28px; border-radius: 8px; border: 1px dashed #cbd5e1;">
            ${otp}
          </div>
        </div>

        <p style="font-size: 14px; text-align: center; color: #94a3b8;">If you did not make this request, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 12px; text-align: center; color: #cbd5e1;">&copy; 100% Secure Passwordless Auth Panel</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"AuthSecure Verification" <${config.user}>`,
      to: email,
      subject: `🗝️ Your OTP Verification Code: ${otp}`,
      html: htmlContent,
    });

    console.log(`✉️ Email successfully delivered to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to dispatch Nodemailer email:", error);
    // Return false to fallback gracefully to console display
    return false;
  }
}

// ============================================
// AUTH API ENDPOINTS
// ============================================

// Check system database and mail configuration status
app.get("/api/auth/status", (req, res) => {
  const mailConfigured = getMailConfig() !== null;
  res.json({
    database: mongoStatus,
    smtpConfigured: mailConfigured,
    message: mailConfigured 
      ? "Mail system active (Nodemailer ready)." 
      : "Simulator mode: OTP keys will print in the user UI and console for seamless debugging."
  });
});

// Endpoint 1: Generate & dispatch 6-digit OTP
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, message: "A valid email address is required." });
      return;
    }

    // Generate random secure 6-digit numeric OTP
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set validation range: 5 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Save into database / local store
    await activeStore.saveOTP(email, generatedCode, expiresAt);
    console.log(`🔐 Generated OTP [${generatedCode}] for user: ${email} (Expires at ${expiresAt.toLocaleTimeString()})`);

    // Dispatch OTP email
    const wasSent = await sendOTPMail(email, generatedCode);

    if (wasSent) {
      res.json({
        success: true,
        message: "An OTP has been successfully triggered to your email inbox! 🎉",
      });
    } else {
      // Simulator Bypass Mode (Since they are working in development workspace)
      res.json({
        success: true,
        message: "OTP initialized. (Mail Sim Mode: Read code displayed in app bypass console below!) 💡",
        devOtpBypass: generatedCode, // Let's output it for ease-of-testing
      });
    }
  } catch (err: any) {
    console.error("send-otp endpoint error: ", err);
    res.status(500).json({ success: false, message: "Server error during OTP processing." });
  }
});

// Endpoint 2: Validate OTP
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: "Email and 6-digit OTP are required." });
      return;
    }

    const storedData = await activeStore.getOTP(email);
    if (!storedData) {
      res.status(400).json({ success: false, message: "No OTP record found. Please request a new code." });
      return;
    }

    // Verify clock expiry
    if (new Date() > storedData.expiresAt) {
      await activeStore.deleteOTP(email);
      res.status(400).json({ success: false, message: "This OTP code has expired. Please send a new code." });
      return;
    }

    // Verify exact characters match
    if (storedData.otp !== otp.trim()) {
      res.status(400).json({ success: false, message: "Incorrect OTP code. Please trace and re-enter." });
      return;
    }

    // Wipe matching values to prevent replay hacks
    await activeStore.deleteOTP(email);

    // Form sign token
    const token = jwt.sign({ email: email.toLowerCase() }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      success: true,
      message: "Welcome! Login Successful 🎉",
      data: {
        email: email.toLowerCase(),
        token,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error("verify-otp error: ", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Endpoint 3: Check authenticate session token
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Unauthorized request. Missing token." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    res.json({
      success: true,
      data: {
        email: payload.email,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: "Token has expired or is invalid. Please log in again." });
  }
});

// ============================================
// DEV OR PRODUCTION RUN SERVE ENVIRONMENT
// ============================================

async function startApp() {
  if (process.env.NODE_ENV !== "production") {
    // Developer Express Mode -> Mount Vite on top
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("🛠️ Vite Server running as middleware.");
  } else {
    // Production Mode -> Serve static production files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("📦 Loaded built directory static templates.");
  }

  // PORT 3000 is strict requirement of platform routing
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Security portal alive and accessible at: http://localhost:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error("Fatal exception during server boot:", err);
});
