import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiRequest("/api/admin/stats")
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch((requestError) => {
                setError(requestError.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading admin dashboard...</h2>
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
                <h1 style={styles.title}>
                    TravelMate Admin Dashboard
                </h1>

                <p style={styles.subtitle}>
                    Manage the TravelMate platform
                </p>
            </div>

            <div style={styles.container}>

                <div style={styles.cards}>

                    {/* Customers */}
                    <Link to="/admin-customers" style={styles.cardLink}>
                    <div style={styles.card}>
                        <h2>👥</h2>

                        <h3 style={styles.count}>
                            {stats.customers}
                        </h3>

                        <h3>Customers</h3>

                        <p>
                            Manage registered customers
                        </p>
                    </div>
                    </Link>

                    {/* Guides */}
                    <Link to="/admin-guides" style={styles.cardLink}>
                    <div style={styles.card}>
                        <h2>🧑‍💼</h2>

                        <h3 style={styles.count}>
                            {stats.guides}
                        </h3>

                        <h3>Guides</h3>

                        <p>
                            Manage and approve guides
                        </p>
                    </div>
                    </Link>

                    {/* Destinations */}
                    <Link to="/admin-destinations" style={styles.cardLink}>
                    <div style={styles.card}>
                        <h2>📍</h2>

                        <h3 style={styles.count}>
                            {stats.destinations}
                        </h3>

                        <h3>Destinations</h3>

                        <p>
                            Manage travel destinations
                        </p>
                    </div>
                    </Link>

                    {/* Hotels */}
                    <Link to="/admin-hotels" style={styles.cardLink}>
                    <div style={styles.card}>
                        <h2>🏨</h2>

                        <h3 style={styles.count}>
                            {stats.hotels}
                        </h3>

                        <h3>Hotels</h3>

                        <p>
                            Manage hotels
                        </p>
                    </div>
                    </Link>

                    {/* Tourist Places */}
                    <Link to="/admin-tourist-places" style={styles.cardLink}>
                    <div style={styles.card}>
                        <h2>🏞️</h2>

                        <h3 style={styles.count}>
                            {stats.touristPlaces}
                        </h3>

                        <h3>Tourist Places</h3>

                        <p>
                            Manage tourist places
                        </p>
                    </div>
                    </Link>

                    {/* Bookings */}
                    <Link to="/admin-bookings" style={styles.cardLink}>
                    <div style={styles.card}>
                        <h2>📋</h2>

                        <h3 style={styles.count}>
                            {stats.bookings}
                        </h3>

                        <h3>Bookings</h3>

                        <p>
                            View all bookings
                        </p>
                    </div>
                    </Link>

                    {/* Reviews */}
                    <Link to="/admin-reviews" style={styles.cardLink}>
                    <div style={styles.card}>
                        <h2>⭐</h2>

                        <h3 style={styles.count}>
                            {stats.reviews}
                        </h3>

                        <h3>Reviews</h3>

                        <p>
                            View customer reviews
                        </p>
                    </div>
                    </Link>

                </div>

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
        marginBottom: "40px"
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
        maxWidth: "1100px",
        margin: "0 auto"
    },

    cards: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px"
    },

    card: {
        backgroundColor: "#ffffff",
        padding: "30px",
        borderRadius: "16px",
        textAlign: "center",
        boxShadow: "0 5px 20px rgba(0,0,0,0.08)"
    },

    cardLink: {
        color: "inherit",
        textDecoration: "none"
    },

    count: {
        fontSize: "32px",
        color: "#4f46e5",
        margin: "10px 0"
    },

    center: {
        textAlign: "center",
        padding: "60px",
        fontFamily: "Arial, sans-serif"
    }

};

export default AdminDashboard;