const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = authMiddleware;

const router = express.Router();

// GET all destinations
router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [destinations] = await db.query(
            "SELECT * FROM destinations ORDER BY destination_id DESC"
        );

        res.json(destinations);

    } catch (error) {
        console.error("Get destinations error:", error.message);

        res.status(500).json({
            message: "Failed to fetch destinations ❌"
        });
    }
});

// POST a new destination
router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
    try {
        const { city, country, description, image_url } = req.body;

        if (!city || !country) {
            return res.status(400).json({
                message: "City and country are required"
            });
        }

        const db = req.app.locals.db;

        const [result] = await db.query(
            `INSERT INTO destinations
            (city, country, description, image_url)
            VALUES (?, ?, ?, ?)`,
            [
                city,
                country,
                description || null,
                image_url || null
            ]
        );

        res.status(201).json({
            message: "Destination added successfully ✅",
            destination_id: result.insertId
        });

    } catch (error) {
        console.error("Add destination error:", error.message);

        res.status(500).json({
            message: "Failed to add destination ❌"
        });
    }
});

module.exports = router;