const express = require("express");

const router = express.Router();

// Get tourist places for a destination
router.get("/destination/:destinationId", async (req, res) => {
    try {
        const { destinationId } = req.params;

        const db = req.app.locals.db;

        const [places] = await db.query(
            `SELECT *
             FROM tourist_places
             WHERE destination_id = ?
             ORDER BY place_id ASC`,
            [destinationId]
        );

        res.json(places);

    } catch (error) {
        console.error("Get tourist places error:", error.message);

        res.status(500).json({
            message: "Failed to fetch tourist places"
        });
    }
});

module.exports = router;