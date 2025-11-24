import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import dbConnect from "./config/db.js";
import paymentsRoute from "./route/payments.js";
import dummyCheckoutRoute from "./route/dummyCheckout.js";
import authRoute from "./route/auth.js";
import userRoute from "./route/user.js";
import adminRoute from "./route/admin.js";
import resourcesRoute from "./route/resources.js";
import leadsRoute from "./route/leads.js";
import communityRoute from "./route/community.js";
import notificationsRoute from "./route/notifications.js";
import referralsRoute from "./route/referrals.js";
import composeRoute from "./route/compose.js";
import tokensRoute from "./route/tokens.js";
import dummyTokenCheckoutRoute from "./route/dummyTokenCheckout.js";
import { startTokenRefreshCron, startSubscriptionExpiryCron } from "./services/cronJobs.js";
import { seedTokenPackages } from "./seed/seedTokenPackages.js";
// import { seedInitialData } from "./services/seedData.js"; // Disabled seed data


dotenv.config();
const PORT = process.env.PORT || 5000

const app = express();

// Middleware
app.use(cors({ credentials: true, origin: process.env.BASE_URL }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Database connection
dbConnect();

// Seed data disabled - only user-generated data will be stored
// seedInitialData();

// Seed token packages on startup
seedTokenPackages().catch(console.error);

// Start cron jobs
startTokenRefreshCron();
startSubscriptionExpiryCron();

// Routes
app.get("/",(req,res)=>{
    res.send("ClientSure API is working");
})

app.use("/api/payments", paymentsRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/resources", resourcesRoute);
app.use("/api/leads", leadsRoute);
app.use("/api/community", communityRoute);
app.use("/api/notifications", notificationsRoute);
app.use("/api/referrals", referralsRoute);
app.use("/api/compose", composeRoute);
app.use("/api/tokens", tokensRoute);

app.use("/", dummyCheckoutRoute);
app.use("/", dummyTokenCheckoutRoute);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    console.log(`Payment endpoint: http://localhost:${PORT}/api/payments/create-order`);
})