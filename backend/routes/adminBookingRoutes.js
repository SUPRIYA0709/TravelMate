const express = require("express");

const router = express.Router();

// Get all bookings for admin
router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [bookings] = await db.query(
            `SELECT
                b.booking_id,
                b.booking_status,
                b.requested_at,
                b.accepted_at,

                t.trip_id,
                t.start_date,
                t.end_date,
                t.duration_days,
                t.status AS trip_status,

                u.name AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone,

                g.guide_id,
                gu.name AS guide_name,
                gu.email AS guide_email,
                gu.phone AS guide_phone,

                d.city,
                d.country

             FROM bookings b

             JOIN trips t
                ON b.trip_id = t.trip_id

             JOIN users u
                ON t.customer_id = u.user_id

             LEFT JOIN guides g
                ON b.guide_id = g.guide_id

             LEFT JOIN users gu
                ON g.user_id = gu.user_id

             JOIN destinations d
                ON t.destination_id = d.destination_id

             ORDER BY b.booking_id DESC`
        );

        res.json(bookings);

    } catch (error) {
        console.error("Get admin bookings error:", error.message);

        res.status(500).json({
            message: "Failed to fetch bookings"
        });
    }
});

module.exports = router;