const express = require("express");

const router = express.Router();

// Get all destinations
router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [destinations] = await db.query(
            `SELECT
                destination_id,
                city,
                country,
                description,
                image_url
             FROM destinations
             ORDER BY destination_id DESC`
        );

        res.json(destinations);

    } catch (error) {
        console.error("Get admin destinations error:", error.message);

        res.status(500).json({
            message: "Failed to fetch destinations"
        });
    }
});

module.exports = router;