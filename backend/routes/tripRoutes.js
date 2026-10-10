
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = authMiddleware;

const router = express.Router();


// Create a new trip
router.post("/", authMiddleware, requireRole("customer"), async (req, res) => {
    try {
        const {
            destination_id,
            start_date,
            end_date,
            duration_days
        } = req.body;

        if (
            !destination_id ||
            !start_date ||
            !end_date ||
            !duration_days
        ) {
            return res.status(400).json({
                message:
                    "Destination, start date, end date and duration are required"
            });
        }

        const db = req.app.locals.db;

        const [result] = await db.query(
            `INSERT INTO trips
            (customer_id, destination_id, start_date, end_date, duration_days)
            VALUES (?, ?, ?, ?, ?)`,
            [
                req.user.user_id,
                destination_id,
                start_date,
                end_date,
                duration_days
            ]
        );

        res.status(201).json({
            message: "Trip created successfully",
            trip_id: result.insertId
        });

    } catch (error) {
        console.error("Create trip error:", error.message);

        res.status(500).json({
            message: "Failed to create trip",
            error: error.message
        });
    }
});


// Mark a trip as completed
router.put(
    "/:tripId/complete",
    authMiddleware,
    requireRole("guide"),
    async (req, res) => {
    try {
        const { tripId } = req.params;

        const db = req.app.locals.db;

        const [result] = await db.query(
            `UPDATE trips t
             SET t.status = 'completed'
             WHERE t.trip_id = ?
             AND EXISTS (
                SELECT 1
                FROM bookings b
                JOIN guides g ON b.guide_id = g.guide_id
                WHERE b.trip_id = t.trip_id
                AND b.booking_status = 'accepted'
                AND g.user_id = ?
             )`,
            [tripId, req.user.user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Trip not found"
            });
        }

        await db.query(
            `UPDATE guides g
             JOIN bookings b ON b.guide_id = g.guide_id
             SET g.status = 'available'
             WHERE b.trip_id = ?
             AND b.booking_status = 'accepted'
             AND g.user_id = ?`,
            [tripId, req.user.user_id]
        );

        res.json({
            message: "Trip marked as completed successfully"
        });

    } catch (error) {
        console.error("Complete trip error:", error.message);

        res.status(500).json({
            message: "Failed to complete trip",
            error: error.message
        });
    }
    }
);


module.exports = router;

