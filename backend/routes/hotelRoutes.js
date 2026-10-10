const express = require("express");

const router = express.Router();

// Get hotels for a destination
router.get("/destination/:destinationId", async (req, res) => {
    try {
        const { destinationId } = req.params;

        const db = req.app.locals.db;

        const [hotels] = await db.query(
            `SELECT *
             FROM hotels
             WHERE destination_id = ?
             ORDER BY price_per_night ASC`,
            [destinationId]
        );

        res.json(hotels);

    } catch (error) {
        console.error("Get hotels error:", error.message);

        res.status(500).json({
            message: "Failed to fetch hotels"
        });
    }
});

module.exports = router;