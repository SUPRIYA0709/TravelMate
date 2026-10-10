const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!name || !normalizedEmail || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const db = req.app.locals.db;

        const [existingUser] = await db.query(
            "SELECT user_id FROM users WHERE LOWER(email) = ?",
            [normalizedEmail]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

const hashedPassword = await bcrypt.hash(password, 10);
const [result] = await db.query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES (?, ?, ?, ?, 'customer')`,
    [name, normalizedEmail, hashedPassword, phone || null]
);
        res.status(201).json({
            message: "Customer registered successfully ✅",
            user_id: result.insertId
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Registration failed ❌"
        });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const db = req.app.locals.db;

        const [users] = await db.query(
            "SELECT * FROM users WHERE LOWER(email) = ?",
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful ✅",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Login failed ❌"
        });
    }
});
router.post("/register-guide", async (req, res) => {
    let connection;

    try {
        const {
            name,
            email,
            password,
            phone,
            city,
            country,
            languages,
            experience_years,
            destination_id
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !city ||
            !country ||
            !languages ||
            experience_years === undefined ||
            !destination_id
        ) {
            return res.status(400).json({
                message: "All guide registration fields are required"
            });
        }

        const db = req.app.locals.db;

        // Check whether email already exists
        const [existingUser] = await db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Check whether destination exists
        const [destinations] = await db.query(
            "SELECT destination_id FROM destinations WHERE destination_id = ?",
            [destination_id]
        );

        if (destinations.length === 0) {
            return res.status(400).json({
                message: "Invalid destination"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Start database transaction
        connection = await db.getConnection();

        await connection.beginTransaction();

        // Create user account
        const [userResult] = await connection.query(
            `INSERT INTO users
            (name, email, password, phone, role)
            VALUES (?, ?, ?, ?, 'guide')`,
            [name, email, hashedPassword, phone]
        );

        const userId = userResult.insertId;

        // Create guide profile
        await connection.query(
            `INSERT INTO guides
            (user_id, destination_id, city, country, languages, experience_years, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [
                userId,
                destination_id,
                city,
                country,
                languages,
                experience_years
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Guide registration successful. Waiting for admin approval.",
            user_id: userId
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error("Guide registration error:", error.message);

        res.status(500).json({
            message: "Guide registration failed"
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;