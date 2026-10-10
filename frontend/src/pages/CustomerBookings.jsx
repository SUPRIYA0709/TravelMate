import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest } from "../services/api";

function CustomerBookings() {
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
const [reviewRating, setReviewRating] = useState({});
const [reviewComment, setReviewComment] = useState({});
const [reviewMessage, setReviewMessage] = useState({});

const submitReview = async (booking) => {
    try {
        const rating = reviewRating[booking.booking_id];
        const comment = reviewComment[booking.booking_id] || "";

        if (!rating) {
            setReviewMessage((prev) => ({
                ...prev,
                [booking.booking_id]: "Please select a rating."
            }));
            return;
        }

        await apiRequest("/api/reviews", {
            method: "POST",
            body: JSON.stringify({
                trip_id: booking.trip_id,
                guide_id: booking.guide_id,
                rating: Number(rating),
                comment
            })
        });

        setReviewMessage((prev) => ({
            ...prev,
            [booking.booking_id]: "Review submitted successfully! ⭐"
        }));

    } catch (error) {
        console.error(error);

        setReviewMessage((prev) => ({
            ...prev,
            [booking.booking_id]: error.message
        }));
    }
};

    useEffect(() => {
        apiRequest("/api/bookings/customer/me")
            .then((data) => {
                setBookings(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading your bookings...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.center}>
                <h2>{error}</h2>
            </div>
        );
    }

    return (
        <div style={styles.page}>

            <div style={styles.header}>
                <h1 style={styles.title}>My Bookings</h1>
                <p style={styles.subtitle}>
                    View your trips and guide details
                </p>
                {location.state?.successMessage && <p role="status">{location.state.successMessage}</p>}
            </div>

            {bookings.length === 0 ? (
                <div style={styles.empty}>
                    <h2>No bookings found</h2>
                    <p>You haven't requested a guide yet.</p>
                </div>
            ) : (
                <div style={styles.container}>

                    {bookings.map((booking) => (

                        <div
                            key={booking.booking_id}
                            style={styles.card}
                        >

                            {/* Destination */}
                            <div style={styles.destination}>
                                <div>
                                    <h2 style={styles.destinationTitle}>
                                        {booking.city}, {booking.country}
                                    </h2>

                                    <p style={styles.bookingId}>
                                        Booking ID: #{booking.booking_id}
                                    </p>
                                </div>

                                <span
                                    style={{
                                        ...styles.status,
                                        backgroundColor:
                                            booking.booking_status === "accepted"
                                                ? "#dcfce7"
                                                : booking.booking_status === "rejected"
                                                ? "#fee2e2"
                                                : "#fef3c7",
                                        color:
                                            booking.booking_status === "accepted"
                                                ? "#166534"
                                                : booking.booking_status === "rejected"
                                                ? "#991b1b"
                                                : "#92400e"
                                    }}
                                >
                                    {booking.booking_status}
                                </span>
                            </div>

                            <hr style={styles.line} />

                            {/* Trip Information */}
                            <div style={styles.section}>

                                <h3 style={styles.sectionTitle}>
                                    Trip Information
                                </h3>

                                <div style={styles.infoGrid}>

                                    <div>
                                        <p style={styles.label}>Start Date</p>
                                        <p style={styles.value}>
                                            {new Date(
                                                booking.start_date
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <p style={styles.label}>End Date</p>
                                        <p style={styles.value}>
                                            {new Date(
                                                booking.end_date
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <p style={styles.label}>Duration</p>
                                        <p style={styles.value}>
                                            {booking.duration_days} days
                                        </p>
                                    </div>

                                </div>

                            </div>

                            <hr style={styles.line} />

                            {/* Guide Information */}
                            <div style={styles.section}>

                                <h3 style={styles.sectionTitle}>
                                    Your Guide
                                </h3>

                                <div style={styles.guideBox}>

                                    <div style={styles.guideAvatar}>
                                        {booking.guide_name
                                            ? booking.guide_name.charAt(0)
                                            : "G"}
                                    </div>

                                    <div style={styles.guideDetails}>

                                        <h3 style={styles.guideName}>
                                            {booking.guide_name}
                                        </h3>

                                        <p>
                                            📧 {booking.guide_email}
                                        </p>

                                        <p>
                                            📞 {booking.guide_phone}
                                        </p>

                                        <p>
                                            🗣️ {booking.languages}
                                        </p>

                                        <p>
                                            💼 {booking.experience_years} years
                                            experience
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* Contact Buttons */}
                           
{booking.booking_status === "accepted" && (
    <div>

        <div style={styles.actions}>
            {booking.guide_email ? (
                <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(booking.guide_email)}&su=${encodeURIComponent("TravelMate booking #" + booking.booking_id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.secondaryButton}
                >
                    ✉️ Email Guide
                </a>
            ) : (
                <span>Guide email unavailable</span>
            )}

        </div>

        {/* Review Section */}
        {booking.trip_status === "completed" &&
            booking.booking_status === "accepted" && (
                <div style={styles.reviewSection}>

                    <hr style={styles.line} />

                    <h3 style={styles.sectionTitle}>
                        ⭐ Rate Your Guide
                    </h3>

                    <div style={styles.ratingButtons}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                type="button"
                                onClick={() =>
                                    setReviewRating((prev) => ({
                                        ...prev,
                                        [booking.booking_id]: rating
                                    }))
                                }
                                style={{
                                    ...styles.ratingButton,
                                    backgroundColor:
                                        reviewRating[booking.booking_id] === rating
                                            ? "#4f46e5"
                                            : "#eef2ff",
                                    color:
                                        reviewRating[booking.booking_id] === rating
                                            ? "#ffffff"
                                            : "#4f46e5"
                                }}
                            >
                                {rating} ⭐
                            </button>
                        ))}
                    </div>
```

            <textarea
                placeholder="Write your review..."
                value={reviewComment[booking.booking_id] || ""}
                onChange={(e) =>
                    setReviewComment((prev) => ({
                        ...prev,
                        [booking.booking_id]: e.target.value
                    }))
                }
                style={styles.reviewInput}
            />

            <button
                type="button"
                onClick={() => submitReview(booking)}
                style={styles.reviewButton}
            >
                Submit Review
            </button>

            {reviewMessage[booking.booking_id] && (
                <p style={styles.reviewMessage}>
                    {reviewMessage[booking.booking_id]}
                </p>
            )}

        </div>
    )}

                                </div>
                            )}

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif"
    },

    header: {
        textAlign: "center",
        marginBottom: "35px"
    },

    title: {
        margin: 0,
        color: "#1f2937",
        fontSize: "36px"
    },

    subtitle: {
        color: "#6b7280",
        fontSize: "16px"
    },

    container: {
        maxWidth: "800px",
        margin: "0 auto"
    },

    card: {
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "30px",
        marginBottom: "25px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.08)"
    },

    destination: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px"
    },

    destinationTitle: {
        margin: 0,
        color: "#111827",
        fontSize: "25px"
    },

    bookingId: {
        color: "#6b7280",
        marginTop: "8px"
    },

    status: {
        padding: "7px 14px",
        borderRadius: "20px",
        fontWeight: "bold",
        textTransform: "capitalize"
    },

    line: {
        border: "none",
        borderTop: "1px solid #e5e7eb",
        margin: "25px 0"
    },

    sectionTitle: {
        color: "#374151",
        marginBottom: "20px"
    },

    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px"
    },

    label: {
        color: "#9ca3af",
        fontSize: "13px",
        marginBottom: "5px"
    },

    value: {
        color: "#111827",
        fontWeight: "bold",
        marginTop: 0
    },

    guideBox: {
        display: "flex",
        alignItems: "center",
        gap: "20px"
    },

    guideAvatar: {
        width: "65px",
        height: "65px",
        borderRadius: "50%",
        backgroundColor: "#4f46e5",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px",
        fontWeight: "bold"
    },

    guideDetails: {
        color: "#4b5563",
        lineHeight: "1.4"
    },

    guideName: {
        color: "#111827",
        marginBottom: "8px"
    },

    actions: {
        display: "flex",
        gap: "12px",
        marginTop: "25px"
    },

    primaryButton: {
        textDecoration: "none",
        backgroundColor: "#4f46e5",
        color: "#ffffff",
        padding: "12px 20px",
        borderRadius: "8px",
        fontWeight: "bold"
    },

    secondaryButton: {
        textDecoration: "none",
        backgroundColor: "#eef2ff",
        color: "#4f46e5",
        padding: "12px 20px",
        borderRadius: "8px",
        fontWeight: "bold"
    },

    empty: {
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
        backgroundColor: "#ffffff",
        padding: "40px",
        borderRadius: "16px"
    },

    center: {
        textAlign: "center",
        padding: "60px",
        fontFamily: "Arial, sans-serif"
    },

    reviewSection: {
        marginTop: "25px",
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "12px"
    },

    ratingButtons: {
        display: "flex",
        gap: "10px",
        marginBottom: "15px"
    },

    ratingButton: {
        border: "none",
        padding: "10px 14px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold"
    },

    reviewInput: {
        width: "100%",
        minHeight: "100px",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        resize: "vertical",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
        marginBottom: "12px"
    },

    reviewButton: {
        border: "none",
        backgroundColor: "#4f46e5",
        color: "#ffffff",
        padding: "12px 20px",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer"
    },

    reviewMessage: {
        marginTop: "12px",
        fontWeight: "bold",
        color: "#166534"
    }
    
};


export default CustomerBookings;