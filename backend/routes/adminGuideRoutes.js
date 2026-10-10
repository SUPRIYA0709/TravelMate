const express = require("express");

const router = express.Router();

// GET all guides
// GET /api/admin/guides
router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [guides] = await db.query(
            `SELECT
                g.guide_id,
                u.user_id,
                u.name,
                u.email,
                u.phone,
                g.city,
                g.country,
                g.languages,
                g.experience_years,
                g.status
             FROM guides g
             JOIN users u
                ON g.user_id = u.user_id
             ORDER BY g.guide_id DESC`
        );

        res.json(guides);

    } catch (error) {
        console.error("Get admin guides error:", error.message);

        res.status(500).json({
            message: "Failed to fetch guides"
        });
    }
});

// PUT /api/admin/guides/:guideId
router.put("/:guideId", async (req, res) => {
    const { guideId } = req.params;
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
    const city = typeof req.body.city === "string" ? req.body.city.trim() : "";
    const country = typeof req.body.country === "string" ? req.body.country.trim() : "";
    const languages = typeof req.body.languages === "string" ? req.body.languages.trim() : "";
    const experienceYears = Number(req.body.experience_years);
    const allowedStatuses = ["pending", "approved", "available", "busy"];
    const { status } = req.body;

    if (!/^\d+$/.test(guideId)) {
        return res.status(400).json({ message: "Invalid guide ID" });
    }

    if (!name || !email || !phone || !city || !country || !languages) {
        return res.status(400).json({ message: "All guide fields are required" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (!Number.isInteger(experienceYears) || experienceYears < 0) {
        return res.status(400).json({ message: "Experience must be a non-negative whole number" });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid guide status", allowedStatuses });
    }

    let connection;
    try {
        const db = req.app.locals.db;
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [guideRows] = await connection.query(
            "SELECT user_id FROM guides WHERE guide_id = ? FOR UPDATE",
            [guideId]
        );

        if (guideRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Guide not found" });
        }

        const userId = guideRows[0].user_id;
        const [emailRows] = await connection.query(
            "SELECT user_id FROM users WHERE LOWER(email) = ? AND user_id <> ?",
            [email, userId]
        );

        if (emailRows.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Email is already registered to another account" });
        }

        await connection.query(
            `UPDATE users
             SET name = ?, email = ?, phone = ?
             WHERE user_id = ?`,
            [name, email, phone, userId]
        );

        await connection.query(
            `UPDATE guides
             SET city = ?, country = ?, languages = ?, experience_years = ?, status = ?
             WHERE guide_id = ?`,
            [city, country, languages, experienceYears, status, guideId]
        );

        await connection.commit();
        res.json({ message: "Guide updated successfully", guide_id: Number(guideId) });
    } catch (error) {
        if (connection) await connection.rollback();

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Email is already registered to another account" });
        }

        console.error("Update admin guide error:", error.message);
        res.status(500).json({ message: "Failed to update guide" });
    } finally {
        if (connection) connection.release();
    }
});

// PUT /api/admin/guides/:guideId/status
router.put("/:guideId/status", async (req, res) => {
    const allowedStatuses = ["pending", "approved", "available", "busy"];
    const { guideId } = req.params;
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid guide status",
            allowedStatuses
        });
    }

    try {
        const db = req.app.locals.db;

        const [result] = await db.query(
            `UPDATE guides
             SET status = ?
             WHERE guide_id = ?`,
            [status, guideId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Guide not found"
            });
        }

        res.json({
            message: "Guide status updated successfully",
            guide_id: Number(guideId),
            status
        });

    } catch (error) {
        console.error("Update admin guide status error:", error.message);

        res.status(500).json({
            message: "Failed to update guide status"
        });
    }
});

module.exports = router;