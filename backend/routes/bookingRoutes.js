const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = authMiddleware;

const router = express.Router();


// =====================================================
// CREATE BOOKING
// POST /api/bookings
// =====================================================
router.post("/", authMiddleware, requireRole("customer"), async (req, res) => {
    let connection;

    try {
        const { trip_id } = req.body;

        if (!trip_id) {
            return res.status(400).json({
                message: "Trip ID is required"
            });
        }

        const db = req.app.locals.db;
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [trips] = await connection.query(
            `SELECT trip_id
             FROM trips
             WHERE trip_id = ? AND customer_id = ?`,
            [trip_id, req.user.user_id]
        );

        if (trips.length === 0) {
            return res.status(404).json({
                message: "Trip not found for this customer"
            });
        }

        const [tripDetails] = await connection.query(
            `SELECT t.trip_id, t.destination_id, u.name AS customer_name
             FROM trips t
             JOIN users u ON t.customer_id = u.user_id
             WHERE t.trip_id = ? AND t.customer_id = ?
             FOR UPDATE`,
            [trip_id, req.user.user_id]
        );

        const [existingBookings] = await connection.query(
            `SELECT booking_id, booking_status
             FROM bookings
             WHERE trip_id = ?
             AND booking_status IN ('requested', 'accepted')
             FOR UPDATE`,
            [trip_id]
        );

        if (existingBookings.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                message: "A guide request already exists for this trip",
                booking_id: existingBookings[0].booking_id,
                status: existingBookings[0].booking_status
            });
        }

        // Notify every guide who is currently approved for booking requests.
        const [guides] = await connection.query(
            `SELECT guide_id
             FROM guides
             WHERE destination_id = ?
             AND status IN ('available', 'approved')`,
            [tripDetails[0].destination_id]
        );

        if (guides.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "No approved guides are available for this destination"
            });
        }

        const [result] = await connection.query(
            `INSERT INTO bookings
             (trip_id, guide_id, booking_status)
             VALUES (?, NULL, 'requested')`,
            [trip_id]
        );

        const notificationValues = guides.flatMap(({ guide_id }) => [
            guide_id,
            result.insertId,
            `New guide request from ${tripDetails[0].customer_name} for trip ${trip_id}. Booking ID: ${result.insertId}`
        ]);
        const notificationPlaceholders = guides.map(() => "(?, ?, ?)").join(", ");

        await connection.query(
            `INSERT INTO notifications (guide_id, booking_id, message)
             VALUES ${notificationPlaceholders}`,
            notificationValues
        );

        await connection.commit();

        res.status(201).json({
            message: "Guide request sent to all available guides successfully ✅",
            booking_id: result.insertId,
            notified_guides: guides.length
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Create booking error:", error.message);

        res.status(500).json({
            message: "Failed to create booking",
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// =====================================================
// GET BOOKINGS FOR GUIDE
// GET /api/bookings/guide/:guideId
// =====================================================
router.get("/guide/me", authMiddleware, requireRole("guide"), async (req, res) => {
    try {
        const db = req.app.locals.db;
        const [bookings] = await db.query(
            `SELECT
                b.booking_id,
                b.trip_id,
                b.guide_id,
                b.booking_status,
                b.requested_at,
                     n.is_read,
                n.message,
                t.start_date,
                t.end_date,
                t.duration_days,
                t.status AS trip_status,
                d.city,
                d.country,
                u.name AS customer_name,
                u.email AS customer_email,
                     u.phone AS customer_phone,
                     assigned_user.user_id AS assigned_guide_user_id,
                     assigned_user.name AS assigned_guide_name
             FROM bookings b
                 JOIN notifications n ON n.booking_id = b.booking_id
                 JOIN guides viewer_guide ON n.guide_id = viewer_guide.guide_id
             JOIN trips t ON b.trip_id = t.trip_id
             JOIN destinations d ON t.destination_id = d.destination_id
             JOIN users u ON t.customer_id = u.user_id
                 LEFT JOIN guides assigned_guide ON b.guide_id = assigned_guide.guide_id
                 LEFT JOIN users assigned_user ON assigned_guide.user_id = assigned_user.user_id
                 WHERE viewer_guide.user_id = ?
             ORDER BY b.requested_at DESC`,
            [req.user.user_id]
        );

        res.json(bookings);
    } catch (error) {
        console.error("Get guide bookings error:", error.message);
        res.status(500).json({ message: "Failed to fetch guide bookings" });
    }
});

router.get(
    "/guide/:guideId",
    authMiddleware,
    requireRole("guide"),
    async (req, res) => {
    try {
        const { guideId } = req.params;

        const db = req.app.locals.db;

        const [ownedGuides] = await db.query(
            "SELECT guide_id FROM guides WHERE guide_id = ? AND user_id = ?",
            [guideId, req.user.user_id]
        );

        if (ownedGuides.length === 0) {
            return res.status(403).json({ message: "Access denied" });
        }

        const [bookings] = await db.query(
            `SELECT
                b.booking_id,
                b.trip_id,
                b.guide_id,
                b.booking_status,
                b.requested_at,
                t.start_date,
                t.end_date,
                t.duration_days,
                d.city,
                d.country,
                u.name AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone
             FROM bookings b
             JOIN trips t
                ON b.trip_id = t.trip_id
             JOIN destinations d
                ON t.destination_id = d.destination_id
             JOIN users u
                ON t.customer_id = u.user_id
             WHERE b.guide_id = ?
             ORDER BY b.requested_at DESC`,
            [guideId]
        );

        res.json(bookings);

    } catch (error) {
        console.error("Get guide bookings error:", error.message);

        res.status(500).json({
            message: "Failed to fetch guide bookings"
        });
    }
    }
);


// =====================================================
// ACCEPT OR REJECT BOOKING
// PUT /api/bookings/:bookingId/status
// =====================================================
router.put(
    "/:bookingId/status",
    authMiddleware,
    requireRole("guide"),
    async (req, res) => {
    let connection;

    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be accepted or rejected"
            });
        }

        const db = req.app.locals.db;
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [bookings] = await connection.query(
            `SELECT booking_id, guide_id, booking_status
             FROM bookings
             WHERE booking_id = ?
             FOR UPDATE`,
            [bookingId]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        const booking = bookings[0];

        if (booking.booking_status !== "requested") {
            await connection.rollback();
            return res.status(400).json({
                message: "Booking has already been processed"
            });
        }

        const [ownedGuides] = await connection.query(
            `SELECT g.guide_id, g.status
             FROM guides g
             JOIN notifications n ON n.guide_id = g.guide_id
             WHERE g.user_id = ?
             AND n.booking_id = ?
             FOR UPDATE`,
            [req.user.user_id, bookingId]
        );

        if (ownedGuides.length === 0) {
            await connection.rollback();
            return res.status(403).json({
                message: "This request was not sent to your guide profile"
            });
        }

        const guideId = ownedGuides[0].guide_id;

        if (
            status === "accepted" &&
            !["available", "approved"].includes(ownedGuides[0].status)
        ) {
            await connection.rollback();
            return res.status(403).json({
                message: "Guide is not currently available for bookings"
            });
        }

        if (booking.guide_id !== null && Number(booking.guide_id) !== Number(guideId)) {
            await connection.rollback();
            return res.status(403).json({
                message: "This booking is assigned to another guide"
            });
        }

        if (status === "accepted") {

            const [claimResult] = await connection.query(
                `UPDATE bookings
                 SET booking_status = 'accepted',
                     guide_id = ?,
                     accepted_at = CURRENT_TIMESTAMP
                 WHERE booking_id = ?
                 AND booking_status = 'requested'
                 AND (guide_id IS NULL OR guide_id = ?)`,
                [guideId, bookingId, guideId]
            );

            if (claimResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(409).json({
                    message: "Booking was accepted by another guide"
                });
            }

            await connection.query(
                `UPDATE guides
                 SET status = 'busy'
                 WHERE guide_id = ?`,
                [guideId]
            );

        } else {

            if (booking.guide_id === null) {
                await connection.query(
                    `UPDATE notifications
                     SET is_read = TRUE,
                         message = 'You rejected this guide request. It remains available to other guides.'
                     WHERE booking_id = ? AND guide_id = ?`,
                    [bookingId, guideId]
                );
            } else {
                await connection.query(
                    `UPDATE bookings
                     SET booking_status = 'rejected'
                     WHERE booking_id = ?
                     AND booking_status = 'requested'
                     AND guide_id = ?`,
                    [bookingId, guideId]
                );
            }

        }

        await connection.commit();

        res.json({
            message: status === "rejected" && booking.guide_id === null
                ? "Guide request rejected for you; it remains available to other guides"
                : `Booking ${status} successfully`,
            booking_id: bookingId,
            status: status === "rejected" && booking.guide_id === null
                ? "requested"
                : status
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Update booking status error:", error.message);

        res.status(500).json({
            message: "Failed to update booking status",
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
    }
);


// =====================================================
// GET BOOKINGS FOR CUSTOMER
// GET /api/bookings/customer/:customerId
// =====================================================
router.get("/customer/me", authMiddleware, requireRole("customer"), async (req, res) => {
    try {
        const db = req.app.locals.db;
        const [bookings] = await db.query(
            `SELECT
                b.booking_id,
                b.trip_id,
                b.guide_id,
                b.booking_status,
                b.requested_at,
                b.accepted_at,
                t.start_date,
                t.end_date,
                t.duration_days,
                t.status AS trip_status,
                d.city,
                d.country,
                u.name AS guide_name,
                u.email AS guide_email,
                u.phone AS guide_phone,
                g.languages,
                g.experience_years
             FROM bookings b
             JOIN trips t ON b.trip_id = t.trip_id
             JOIN destinations d ON t.destination_id = d.destination_id
             LEFT JOIN guides g ON b.guide_id = g.guide_id
             LEFT JOIN users u ON g.user_id = u.user_id
             WHERE t.customer_id = ?
             ORDER BY b.requested_at DESC`,
            [req.user.user_id]
        );

        res.json(bookings);
    } catch (error) {
        console.error("Get customer bookings error:", error.message);
        res.status(500).json({ message: "Failed to fetch customer bookings" });
    }
});

router.get(
    "/customer/:customerId",
    authMiddleware,
    requireRole("customer"),
    async (req, res) => {
    try {
        const { customerId } = req.params;

        if (Number(customerId) !== Number(req.user.user_id)) {
            return res.status(403).json({ message: "Access denied" });
        }

        const db = req.app.locals.db;

        const [bookings] = await db.query(
            `SELECT
                b.booking_id,
                b.trip_id,
                b.guide_id,
                b.booking_status,
                b.requested_at,
                b.accepted_at,
                t.start_date,
                t.end_date,
                t.duration_days,
                t.status AS trip_status,
                d.city,
                d.country,
                u.name AS guide_name,
                u.email AS guide_email,
                u.phone AS guide_phone,
                g.languages,
                g.experience_years
             FROM bookings b
             JOIN trips t
                ON b.trip_id = t.trip_id
             JOIN destinations d
                ON t.destination_id = d.destination_id
             LEFT JOIN guides g
                ON b.guide_id = g.guide_id
             LEFT JOIN users u
                ON g.user_id = u.user_id
             WHERE t.customer_id = ?
             ORDER BY b.requested_at DESC`,
            [customerId]
        );

        res.json(bookings);

    } catch (error) {
        console.error("Get customer bookings error:", error.message);

        res.status(500).json({
            message: "Failed to fetch customer bookings"
        });
    }
    }
);


module.exports = router;