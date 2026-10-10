const express = require("express");
const destinationRoutes = require("./routes/destinationRoutes");
const tripRoutes = require("./routes/tripRoutes");
console.log("TRIP ROUTE LOADED ✅");
const hotelRoutes = require("./routes/hotelRoutes");
const touristPlaceRoutes = require("./routes/touristPlaceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: __dirname + "/.env" });
const authRoutes = require("./routes/authRoutes");
const app = express();
const guideRoutes = require("./routes/guideRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminCustomerRoutes = require("./routes/adminCustomerRoutes");
const adminGuideRoutes = require("./routes/adminGuideRoutes");
const adminDestinationRoutes = require("./routes/adminDestinationRoutes");
const adminHotelRoutes = require("./routes/adminHotelRoutes");
const adminTouristPlaceRoutes = require("./routes/adminTouristPlaceRoutes");    
const adminBookingRoutes = require("./routes/adminBookingRoutes");
const adminReviewRoutes = require("./routes/adminReviewRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const { requireRole } = authMiddleware;
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
console.log("NOTIFICATION ROUTE LOADED ✅");
app.use("/api/tourist-places", touristPlaceRoutes);
app.get("/api/trips/test", (req, res) => {
    res.json({ message: "Trip route is working ✅" });
});
app.use("/api/admin", authMiddleware, requireRole("admin"));
app.use("/api/admin", adminRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/guides", adminGuideRoutes);
app.use("/api/admin/destinations", adminDestinationRoutes);
app.use("/api/admin/hotels", adminHotelRoutes);
app.use("/api/admin/tourist-places", adminTouristPlaceRoutes);
app.use("/api/admin/bookings", adminBookingRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/reviews", reviewRoutes);
console.log("DB HOST:", process.env.DB_HOST);
console.log("DB USER:", process.env.DB_USER);
console.log("DB NAME:", process.env.DB_NAME);
console.log("DB PASSWORD LOADED:", !!process.env.DB_PASSWORD);
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
app.locals.db = db;
app.get("/", (req, res) => {
    res.send("TRAVELMATE-NEW-SERVER-12345");
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        res.json({
            message: "MySQL connected successfully ✅",
            data: rows
        });
    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            message: "MySQL connection failed ❌",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    
    console.log(`TravelMate backend running on http://localhost:${PORT}`);
});
