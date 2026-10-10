import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function formatDate(dateString) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    }).format(new Date(dateString));
}

function GuideNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [markingId, setMarkingId] = useState(null);

    useEffect(() => {
        apiRequest("/api/notifications/guide/me")
            .then((data) => {
                setNotifications(data);
                setLoading(false);
            })
            .catch((requestError) => {
                setError(requestError.message);
                setLoading(false);
            });
    }, []);

        async function markAsRead(notificationId) {
            setMarkingId(notificationId);
            setActionError("");

            try {
                await apiRequest(`/api/notifications/${notificationId}/read`, { method: "PUT" });

                setNotifications((currentNotifications) =>
                    currentNotifications.map((notification) =>
                        notification.notification_id === notificationId
                            ? { ...notification, is_read: 1 }
                            : notification
                    )
                );
            } catch (requestError) {
                console.error(requestError);
                setActionError("Unable to mark notification as read");
            } finally {
                setMarkingId(null);
            }
        }

    if (loading) {
        return <h2>Loading notifications...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div style={{ padding: "30px" }}>
            <h1>Guide Notifications 🔔</h1>
            {actionError && <p>{actionError}</p>}

            {notifications.length === 0 ? (
                <p>No notifications found.</p>
            ) : (
                notifications.map((notification) => (
                    <div
                        key={notification.notification_id}
                        style={{
                            border: notification.is_read === 0
                                ? "2px solid #2563eb"
                                : "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "20px",
                            marginTop: "15px",
                            backgroundColor: notification.is_read === 0
                                ? "#eff6ff"
                                : "#fff"
                        }}
                    >
                        <h3>{notification.message}</h3>

                        <p>
                            <strong>Booking ID:</strong>{" "}
                            {notification.booking_id}
                        </p>

                        <p>
                            <strong>Customer:</strong>{" "}
                            {notification.customer_name}
                        </p>

                        <p>
                            <strong>Destination:</strong>{" "}
                            {notification.city}, {notification.country}
                        </p>

                        <p>
                            <strong>Trip:</strong>{" "}
                            {formatDate(notification.start_date)} →{" "}
                            {formatDate(notification.end_date)}
                        </p>

                        <p>
                            <strong>Customer Email:</strong>{" "}
                            {notification.customer_email}
                        </p>

                        <p>
                            <strong>Customer Phone:</strong>{" "}
                            {notification.customer_phone}
                        </p>

                        <p>
                            <strong>Booking Status:</strong>{" "}
                            {notification.booking_status}
                        </p>

                        {notification.is_read === 0 && (
                            <button
                                type="button"
                                onClick={() => markAsRead(notification.notification_id)}
                                disabled={markingId === notification.notification_id}
                            >
                                {markingId === notification.notification_id
                                    ? "Marking..."
                                    : "Mark as Read"}
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default GuideNotifications;