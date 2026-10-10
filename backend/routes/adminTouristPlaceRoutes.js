const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { destination_id, place_name, description, entry_fee } = req.body;
        const destinationId = Number(destination_id);
        const entryFee = Number(entry_fee ?? 0);

        if (!Number.isInteger(destinationId) || destinationId < 1 || !place_name?.trim() || !Number.isFinite(entryFee) || entryFee < 0) {
            return res.status(400).json({ message: "Destination, place name and a non-negative entry fee are required" });
        }

        const db = req.app.locals.db;
        const [result] = await db.query(
            `INSERT INTO tourist_places (destination_id, place_name, description, entry_fee)
             VALUES (?, ?, ?, ?)`,
            [destinationId, place_name.trim(), description?.trim() || null, entryFee]
        );

        res.status(201).json({ message: "Tourist place added successfully", place_id: result.insertId });
    } catch (error) {
        console.error("Add admin tourist place error:", error.message);
        res.status(500).json({ message: "Failed to add tourist place" });
    }
});

router.delete("/:placeId", async (req, res) => {
    const placeId = Number(req.params.placeId);
    if (!Number.isInteger(placeId) || placeId < 1) {
        return res.status(400).json({ message: "Invalid tourist place ID" });
    }

    try {
        const db = req.app.locals.db;
        const [result] = await db.query(
            "DELETE FROM tourist_places WHERE place_id = ?",
            [placeId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Tourist place not found" });
        }

        res.json({ message: "Tourist place removed successfully" });
    } catch (error) {
        console.error("Remove admin tourist place error:", error.message);
        res.status(500).json({ message: "Failed to remove tourist place" });
    }
});

// GET all tourist places with destination details
router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [places] = await db.query(
            `SELECT
                tp.place_id,
                tp.place_name,
                tp.description,
                tp.entry_fee,
                d.city,
                d.country
             FROM tourist_places tp
             JOIN destinations d
                ON tp.destination_id = d.destination_id
             ORDER BY tp.place_id DESC`
        );

        res.json(places);

    } catch (error) {
        console.error("Get admin tourist places error:", error.message);

        res.status(500).json({
            message: "Failed to fetch tourist places"
        });
    }
});

module.exports = router;
