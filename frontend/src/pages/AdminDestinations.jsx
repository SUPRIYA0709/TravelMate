import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function AdminDestinations() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [form, setForm] = useState({ city: "", country: "", description: "", image_url: "" });

    useEffect(() => {
        apiRequest("/api/admin/destinations")
            .then((data) => {
                setDestinations(data);
                setLoading(false);
            })
            .catch((requestError) => {
                setError(requestError.message);
                setLoading(false);
            });
    }, []);

    const addDestination = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        try {
            const result = await apiRequest("/api/destinations", {
                method: "POST",
                body: JSON.stringify(form)
            });
            setMessage(result.message);
            setForm({ city: "", country: "", description: "", image_url: "" });
            const updatedDestinations = await apiRequest("/api/admin/destinations");
            setDestinations(updatedDestinations);
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading destinations...</h2>
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
                <h1 style={styles.title}>Manage Destinations</h1>

                <p style={styles.subtitle}>
                    View and manage TravelMate destinations
                </p>
                {message && <p role="status">{message}</p>}
                {error && <p role="alert" style={{ color: "#a12b2b" }}>{error}</p>}
            </div>

            <div style={styles.container}>
                <form onSubmit={addDestination} style={styles.addForm}>
                    <h2>Add Destination</h2>
                    <input aria-label="City" placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required />
                    <input aria-label="Country" placeholder="Country" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} required />
                    <input aria-label="Description" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                    <input aria-label="Image URL" type="url" placeholder="Image URL" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} />
                    <button type="submit">Add destination</button>
                </form>
                {destinations.length === 0 ? (
                    <div style={styles.empty}>
                        <h2>No destinations found</h2>
                    </div>
                ) : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>City</th>
                                    <th style={styles.th}>Country</th>
                                    <th style={styles.th}>Description</th>
                                    <th style={styles.th}>Image URL</th>
                                </tr>
                            </thead>

                            <tbody>
                                {destinations.map((destination) => (
                                    <tr key={destination.destination_id}>
                                        <td style={styles.td}>
                                            {destination.destination_id}
                                        </td>

                                        <td style={styles.td}>
                                            {destination.city}
                                        </td>

                                        <td style={styles.td}>
                                            {destination.country}
                                        </td>

                                        <td style={styles.td}>
                                            {destination.description}
                                        </td>

                                        <td style={styles.td}>
                                            {destination.image_url || "No image"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
        maxWidth: "1200px",
        margin: "0 auto"
    },

    addForm: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "10px",
        marginBottom: "24px",
        padding: "20px",
        backgroundColor: "#ffffff",
        border: "1px solid #d9e2df"
    },

    tableCard: {
        backgroundColor: "#ffffff",
        padding: "25px",
        borderRadius: "16px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
        overflowX: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    },

    th: {
        textAlign: "left",
        padding: "15px",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        whiteSpace: "nowrap"
    },

    td: {
        padding: "15px",
        borderBottom: "1px solid #e5e7eb",
        color: "#111827",
        verticalAlign: "top"
    },

    empty: {
        backgroundColor: "#ffffff",
        padding: "50px",
        textAlign: "center",
        borderRadius: "16px"
    },

    center: {
        textAlign: "center",
        padding: "60px",
        fontFamily: "Arial, sans-serif"
    }
};

export default AdminDestinations;