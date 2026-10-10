const express = require("express");

const router = express.Router();

// Get all reviews for admin
router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [reviews] = await db.query(
            `SELECT
                r.review_id,
                r.rating,
                r.comment,
                r.created_at,

                u.name AS customer_name,
                u.email AS customer_email,

                g.guide_id,
                gu.name AS guide_name,

                d.city,
                d.country

             FROM reviews r

             JOIN users u
                ON r.customer_id = u.user_id

                 JOIN trips t
                     ON r.trip_id = t.trip_id

             JOIN guides g
                ON r.guide_id = g.guide_id

             JOIN users gu
                ON g.user_id = gu.user_id

             JOIN destinations d
                     ON t.destination_id = d.destination_id

             ORDER BY r.review_id DESC`
        );

        res.json(reviews);

    } catch (error) {
        console.error("Get admin reviews error:", error.message);

        res.status(500).json({
            message: "Failed to fetch reviews"
        });
    }
});

module.exports = router;