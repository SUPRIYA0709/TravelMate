import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const wasRejectedByGuide = (booking) =>
    booking.booking_status === "requested" &&
    booking.message?.startsWith("You rejected this guide request.");

function GuideDashboard() {
    const [bookings, setBookings] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;
        Promise.all([
            apiRequest("/api/guides/me"),
            apiRequest("/api/bookings/guide/me")
        ])
            .then(([guide, guideBookings]) => {
                if (!active) return;
                setProfile(guide);
                setBookings(guideBookings);
                setError("");
            })
            .catch((requestError) => {
                if (!active) return;
                setError(requestError.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [refreshKey]);

    const updateBookingStatus = async (bookingId, status) => {
        try {
            const data = await apiRequest(`/api/bookings/${bookingId}/status`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });
            setSuccessMessage(data.message);
            setRefreshKey((key) => key + 1);

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const completeTrip = async (tripId) => {
        try {
            const data = await apiRequest(`/api/trips/${tripId}/complete`, { method: "PUT" });
            setSuccessMessage(data.message || "Trip completed successfully");
            setRefreshKey((key) => key + 1);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading guide dashboard...</h2>
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
                <h1 style={styles.title}>Guide Dashboard</h1>
                <p style={styles.subtitle}>
                    Manage your customer booking requests
                </p>
                {successMessage && (
                    <p style={styles.successMessage}>{successMessage}</p>
                )}
            </div>

            <div style={styles.container}>

                <div style={styles.guideCard}>
                    <div style={styles.avatar}>{profile?.name?.charAt(0) || "G"}</div>

                    <div>
                        <h2 style={styles.guideName}>
                            {profile?.name}
                        </h2>

                        <p style={styles.guideInfo}>
                            {profile?.email}
                        </p>

                        <p style={styles.guideInfo}>
                            📍 {profile?.city}, {profile?.country}
                        </p>

                        <p style={styles.guideInfo}>
                            🗣️ {profile?.languages} · 💼 {profile?.experience_years} years · {profile?.status}
                        </p>
                    </div>
                </div>

                <h2 style={styles.sectionTitle}>
                    Booking Requests
                </h2>

                {bookings.length === 0 ? (
                    <div style={styles.empty}>
                        <h3>No booking requests</h3>
                        <p>
                            New customer requests will appear here.
                        </p>
                    </div>
                ) : (
                    bookings.map((booking) => (

                        <div
                            key={booking.booking_id}
                            style={styles.bookingCard}
                        >

                            <div style={styles.bookingHeader}>

                                <div>
                                    <h2 style={styles.destination}>
                                        {booking.city}, {booking.country}
                                    </h2>

                                    <p style={styles.bookingId}>
                                        Booking #{booking.booking_id}
                                    </p>
                                </div>

                                <span
                                    style={{
                                        ...styles.status,
                                        backgroundColor:
                                            booking.booking_status === "accepted"
                                                ? "#dcfce7"
                                                : booking.booking_status === "rejected" || wasRejectedByGuide(booking)
                                                ? "#fee2e2"
                                                : "#fef3c7",
                                        color:
                                            booking.booking_status === "accepted"
                                                ? "#166534"
                                                : booking.booking_status === "rejected" || wasRejectedByGuide(booking)
                                                ? "#991b1b"
                                                : "#92400e"
                                    }}
                                >
                                    {wasRejectedByGuide(booking) ? "rejected" : booking.booking_status}
                                </span>

                            </div>

                            <hr style={styles.line} />

                            <div style={styles.infoGrid}>

                                <div>
                                    <p style={styles.label}>
                                        Customer
                                    </p>

                                    <p style={styles.value}>
                                        {booking.customer_name}
                                    </p>
                                </div>

                                <div>
                                    <p style={styles.label}>
                                        Email
                                    </p>

                                    <p style={styles.value}>
                                        {booking.customer_email}
                                    </p>
                                </div>

                                <div>
                                    <p style={styles.label}>
                                        Phone
                                    </p>

                                    <p style={styles.value}>
                                        {booking.customer_phone}
                                    </p>
                                </div>

                                <div>
                                    <p style={styles.label}>
                                        Start Date
                                    </p>

                                    <p style={styles.value}>
                                        {new Date(
                                            booking.start_date
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <p style={styles.label}>
                                        End Date
                                    </p>

                                    <p style={styles.value}>
                                        {new Date(
                                            booking.end_date
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <div>
                                    <p style={styles.label}>
                                        Duration
                                    </p>

                                    <p style={styles.value}>
                                        {booking.duration_days} days
                                    </p>
                                </div>

                            </div>

                            {wasRejectedByGuide(booking) ? (
                                <div style={styles.rejectedMessage}>
                                    You rejected this request. It remains available to other guides.
                                </div>
                            ) : booking.booking_status === "requested" ? (
                                <div style={styles.actions}>
                                    <button
                                        style={styles.acceptButton}
                                        onClick={() => updateBookingStatus(booking.booking_id, "accepted")}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        style={styles.rejectButton}
                                        onClick={() => updateBookingStatus(booking.booking_id, "rejected")}
                                    >
                                        Reject
                                    </button>
                                </div>
                            ) : null}

                            {booking.booking_status === "accepted" && (
                                booking.assigned_guide_user_id === profile?.user_id ? (
                                    <>
                                        <div style={styles.acceptedMessage}>✓ You accepted this booking</div>
                                        <div style={styles.contactActions}>
                                            {booking.customer_email ? (
                                                <a
                                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(booking.customer_email)}&su=${encodeURIComponent("TravelMate booking #" + booking.booking_id)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={styles.emailButton}
                                                >
                                                    Email Customer
                                                </a>
                                            ) : (
                                                <span style={styles.unavailableEmail}>Customer email unavailable</span>
                                            )}
                                        </div>
                                        {booking.trip_status !== "completed" ? (
                                            <button style={styles.completeButton} onClick={() => completeTrip(booking.trip_id)}>
                                                Mark Trip Completed
                                            </button>
                                        ) : <p style={styles.successMessage}>Trip completed</p>}
                                    </>
                                ) : (
                                    <div style={styles.acceptedMessage}>
                                        Already accepted by {booking.assigned_guide_name || "another guide"}
                                    </div>
                                )
                            )}

                            {booking.booking_status === "rejected" && (
                                <div style={styles.rejectedMessage}>
                                    Booking rejected
                                </div>
                            )}

                        </div>

                    ))
                )}

            </div>
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
        maxWidth: "900px",
        margin: "0 auto"
    },

    guideCard: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        backgroundColor: "#ffffff",
        padding: "25px",
        borderRadius: "16px",
        marginBottom: "30px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.08)"
    },

    avatar: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        backgroundColor: "#4f46e5",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px",
        fontWeight: "bold"
    },

    guideName: {
        margin: "0 0 8px",
        color: "#111827"
    },

    guideInfo: {
        margin: "4px 0",
        color: "#6b7280"
    },

    sectionTitle: {
        color: "#1f2937",
        marginBottom: "20px"
    },

    bookingCard: {
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        padding: "30px",
        marginBottom: "25px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.08)"
    },

    bookingHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px"
    },

    destination: {
        margin: 0,
        color: "#111827"
    },

    bookingId: {
        color: "#9ca3af"
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
        marginTop: 0,
        wordBreak: "break-word"
    },

    actions: {
        display: "flex",
        gap: "12px",
        marginTop: "30px"
    },

    acceptButton: {
        border: "none",
        backgroundColor: "#16a34a",
        color: "#ffffff",
        padding: "12px 25px",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer"
    },

    rejectButton: {
        border: "none",
        backgroundColor: "#dc2626",
        color: "#ffffff",
        padding: "12px 25px",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer"
    },

    acceptedMessage: {
        marginTop: "25px",
        padding: "12px",
        backgroundColor: "#dcfce7",
        color: "#166534",
        borderRadius: "8px",
        fontWeight: "bold"
    },

    completeButton: {
        display: "block",
        marginTop: "12px",
        border: "none",
        backgroundColor: "#15803d",
        color: "#ffffff",
        padding: "10px 16px",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer"
    },

    successMessage: {
        color: "#166534",
        fontWeight: "bold"
    },

    contactActions: {
    display: "flex",
    gap: "12px",
    marginTop: "15px"
},

emailButton: {
    display: "inline-block",
    textDecoration: "none",
    backgroundColor: "#7c3aed",
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: "bold"
},

unavailableEmail: {
    color: "#6b7280",
    padding: "12px 0"
},

    rejectedMessage: {
        marginTop: "25px",
        padding: "12px",
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        borderRadius: "8px",
        fontWeight: "bold"
    },

    empty: {
        textAlign: "center",
        backgroundColor: "#ffffff",
        padding: "40px",
        borderRadius: "16px"
    },

    center: {
        textAlign: "center",
        padding: "60px",
        fontFamily: "Arial, sans-serif"
    }
};

export default GuideDashboard;