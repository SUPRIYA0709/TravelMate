const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { destination_id, hotel_name, address, price_per_night, contact_number } = req.body;
        const destinationId = Number(destination_id);
        const pricePerNight = Number(price_per_night);

        if (!Number.isInteger(destinationId) || destinationId < 1 || !hotel_name?.trim() || !Number.isFinite(pricePerNight) || pricePerNight < 0) {
            return res.status(400).json({ message: "Destination, hotel name and a non-negative nightly price are required" });
        }

        const db = req.app.locals.db;
        const [result] = await db.query(
            `INSERT INTO hotels (destination_id, hotel_name, address, price_per_night, contact_number)
             VALUES (?, ?, ?, ?, ?)`,
            [destinationId, hotel_name.trim(), address?.trim() || null, pricePerNight, contact_number?.trim() || null]
        );

        res.status(201).json({ message: "Hotel added successfully", hotel_id: result.insertId });
    } catch (error) {
        console.error("Add admin hotel error:", error.message);
        res.status(500).json({ message: "Failed to add hotel" });
    }
});

router.delete("/:hotelId", async (req, res) => {
    const hotelId = Number(req.params.hotelId);
    if (!Number.isInteger(hotelId) || hotelId < 1) {
        return res.status(400).json({ message: "Invalid hotel ID" });
    }

    try {
        const db = req.app.locals.db;
        const [result] = await db.query(
            "DELETE FROM hotels WHERE hotel_id = ?",
            [hotelId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        res.json({ message: "Hotel removed successfully" });
    } catch (error) {
        console.error("Remove admin hotel error:", error.message);
        res.status(500).json({ message: "Failed to remove hotel" });
    }
});

// GET all hotels with destination details
router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [hotels] = await db.query(
            `SELECT
                h.hotel_id,
                h.hotel_name,
                h.address,
                h.price_per_night,
                h.contact_number,
                d.city,
                d.country
             FROM hotels h
             JOIN destinations d
                ON h.destination_id = d.destination_id
             ORDER BY h.hotel_id DESC`
        );

        res.json(hotels);

    } catch (error) {
        console.error("Get admin hotels error:", error.message);

        res.status(500).json({
            message: "Failed to fetch hotels"
        });
    }
});

module.exports = router;
