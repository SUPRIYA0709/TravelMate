const express = require("express");

const router = express.Router();

router.get("/stats", async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [customers] = await db.query(
            "SELECT COUNT(*) AS count FROM users WHERE role = 'customer'"
        );

        const [guides] = await db.query(
            "SELECT COUNT(*) AS count FROM guides"
        );

        const [destinations] = await db.query(
            "SELECT COUNT(*) AS count FROM destinations"
        );

        const [hotels] = await db.query(
            "SELECT COUNT(*) AS count FROM hotels"
        );

        const [touristPlaces] = await db.query(
            "SELECT COUNT(*) AS count FROM tourist_places"
        );

        const [bookings] = await db.query(
            "SELECT COUNT(*) AS count FROM bookings"
        );

        const [reviews] = await db.query(
            "SELECT COUNT(*) AS count FROM reviews"
        );

        res.json({
            customers: customers[0].count,
            guides: guides[0].count,
            destinations: destinations[0].count,
            hotels: hotels[0].count,
            touristPlaces: touristPlaces[0].count,
            bookings: bookings[0].count,
            reviews: reviews[0].count
        });

    } catch (error) {
        console.error("Admin stats error:", error.message);

        res.status(500).json({
            message: "Failed to fetch admin statistics"
        });
    }
});

module.exports = router;