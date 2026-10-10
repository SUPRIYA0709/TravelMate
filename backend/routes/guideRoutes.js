const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = authMiddleware;

const router = express.Router();

router.get("/me", authMiddleware, requireRole("guide"), async (req, res) => {
    try {
        const db = req.app.locals.db;
        const [guides] = await db.query(
            `SELECT
                g.guide_id,
                g.user_id,
                g.destination_id,
                g.city,
                g.country,
                g.languages,
                g.experience_years,
                g.status,
                u.name,
                u.email,
                u.phone
             FROM guides g
             JOIN users u ON g.user_id = u.user_id
             WHERE g.user_id = ?`,
            [req.user.user_id]
        );

        if (guides.length === 0) {
            return res.status(404).json({ message: "Guide profile not found" });
        }

        res.json(guides[0]);
    } catch (error) {
        console.error("Get guide profile error:", error.message);
        res.status(500).json({ message: "Failed to fetch guide profile" });
    }
});

router.get("/destination/:destinationId", async (req, res) => {
    try {
        const { destinationId } = req.params;

        const db = req.app.locals.db;

        const [guides] = await db.query(
            `SELECT
                g.guide_id,
                u.name,
                u.email,
                u.phone,
                g.city,
                g.country,
                g.languages,
                g.experience_years,
                g.status
             FROM guides g
             JOIN users u ON g.user_id = u.user_id
             WHERE g.destination_id = ?
             AND g.status = 'available'
             ORDER BY g.experience_years DESC`,
            [destinationId]
        );

        res.json(guides);

    } catch (error) {
        console.error("Get guides error:", error.message);

        res.status(500).json({
            message: "Failed to fetch guides"
        });
    }
});

module.exports = router;