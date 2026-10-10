const express = require("express");

const router = express.Router();

// GET all customers
// GET /api/admin/customers
router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;

        const [customers] = await db.query(
            `SELECT
                user_id,
                name,
                email,
                phone,
                created_at
             FROM users
             WHERE role = 'customer'
             ORDER BY created_at DESC`
        );

        res.json(customers);

    } catch (error) {
        console.error("Get customers error:", error.message);

        res.status(500).json({
            message: "Failed to fetch customers"
        });
    }
});

module.exports = router;