const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = authMiddleware;

const router = express.Router();

router.get("/guide/me", authMiddleware, requireRole("guide"), async (req, res) => {
    try {
        const db = req.app.locals.db;
        const [notifications] = await db.query(
            `SELECT
                n.notification_id,
                n.booking_id,
                n.message,
                n.is_read,
                n.created_at,
                b.booking_status,
                t.start_date,
                t.end_date,
                t.duration_days,
                d.city,
                d.country,
                u.name AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone
             FROM notifications n
             JOIN bookings b ON n.booking_id = b.booking_id
             JOIN guides g ON n.guide_id = g.guide_id
             JOIN trips t ON b.trip_id = t.trip_id
             JOIN destinations d ON t.destination_id = d.destination_id
             JOIN users u ON t.customer_id = u.user_id
             WHERE g.user_id = ?
             ORDER BY n.created_at DESC`,
            [req.user.user_id]
        );

        res.json(notifications);
    } catch (error) {
        console.error("Get guide notifications error:", error.message);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});

// GET notifications for a guide
// GET /api/notifications/guide/:guideId
router.get(
    "/guide/:guideId",
    authMiddleware,
    requireRole("guide"),
    async (req, res) => {
    try {
        const { guideId } = req.params;

        const db = req.app.locals.db;

        const [ownedGuides] = await db.query(
            "SELECT guide_id FROM guides WHERE guide_id = ? AND user_id = ?",
            [guideId, req.user.user_id]
        );

        if (ownedGuides.length === 0) {
            return res.status(403).json({ message: "Access denied" });
        }

        const [notifications] = await db.query(
            `SELECT
                n.notification_id,
                n.booking_id,
                n.message,
                n.is_read,
                n.created_at,
                b.booking_status,
                t.start_date,
                t.end_date,
                t.duration_days,
                d.city,
                d.country,
                u.name AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone
             FROM notifications n
             JOIN bookings b
                ON n.booking_id = b.booking_id
             JOIN trips t
                ON b.trip_id = t.trip_id
             JOIN destinations d
                ON t.destination_id = d.destination_id
             JOIN users u
                ON t.customer_id = u.user_id
             WHERE n.guide_id = ?
             ORDER BY n.created_at DESC`,
            [guideId]
        );

        res.json(notifications);

    } catch (error) {
        console.error("Get guide notifications error:", error.message);

        res.status(500).json({
            message: "Failed to fetch notifications"
        });
    }
    }
);
// Mark a notification as read
// PUT /api/notifications/:notificationId/read
router.put(
    "/:notificationId/read",
    authMiddleware,
    requireRole("guide"),
    async (req, res) => {
    try {
        const { notificationId } = req.params;

        const db = req.app.locals.db;

        const [result] = await db.query(
            `UPDATE notifications n
             JOIN guides g ON n.guide_id = g.guide_id
             SET n.is_read = TRUE
             WHERE n.notification_id = ?
             AND g.user_id = ?`,
            [notificationId, req.user.user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({
            message: "Notification marked as read ✅"
        });

    } catch (error) {
        console.error("Mark notification read error:", error.message);

        res.status(500).json({
            message: "Failed to mark notification as read"
        });
    }
    }
);
module.exports = router;