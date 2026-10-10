
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = authMiddleware;

const router = express.Router();

// Submit a review
router.post("/", authMiddleware, requireRole("customer"), async (req, res) => {
    try {
        const {
            trip_id,
            guide_id,
            rating,
            comment
        } = req.body;

        // Validate required fields
        if (!trip_id || !guide_id || !rating) {
            return res.status(400).json({
                message: "Trip, customer, guide and rating are required"
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const db = req.app.locals.db;

        // Check whether the trip exists and is completed
        const [trips] = await db.query(
            `SELECT trip_id, customer_id
             FROM trips
             WHERE trip_id = ? AND status = 'completed'`,
            [trip_id]
        );

        if (trips.length === 0) {
            return res.status(400).json({
                message: "Trip must be completed before submitting a review"
            });
        }

        // Check whether this customer owns the trip
        if (trips[0].customer_id !== Number(req.user.user_id)) {
            return res.status(403).json({
                message: "You can only review your own trip"
            });
        }

        const [bookings] = await db.query(
            `SELECT booking_id
             FROM bookings
             WHERE trip_id = ?
             AND guide_id = ?
             AND booking_status = 'accepted'`,
            [trip_id, guide_id]
        );

        if (bookings.length === 0) {
            return res.status(400).json({
                message: "The guide must be assigned to the completed trip"
            });
        }

        // Check whether a review already exists
        const [existingReviews] = await db.query(
            `SELECT review_id
             FROM reviews
             WHERE trip_id = ?`,
            [trip_id]
        );

        if (existingReviews.length > 0) {
            return res.status(400).json({
                message: "This trip has already been reviewed"
            });
        }

        // Insert review
        const [result] = await db.query(
            `INSERT INTO reviews
            (trip_id, customer_id, guide_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)`,
            [
                trip_id,
                req.user.user_id,
                guide_id,
                rating,
                comment || null
            ]
        );

        res.status(201).json({
            message: "Review submitted successfully",
            review_id: result.insertId
        });

    } catch (error) {
        console.error("Submit review error:", error.message);

        res.status(500).json({
            message: "Failed to submit review",
            error: error.message
        });
    }
});

module.exports = router;

