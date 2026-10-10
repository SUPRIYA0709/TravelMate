import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function AdminHotels() {
    const [hotels, setHotels] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [form, setForm] = useState({ destination_id: "", hotel_name: "", address: "", price_per_night: "", contact_number: "" });

    useEffect(() => {
        Promise.all([
            apiRequest("/api/admin/hotels"),
            apiRequest("/api/destinations", { auth: false })
        ])
            .then(([hotelData, destinationData]) => {
                setHotels(hotelData);
                setDestinations(destinationData);
                if (destinationData.length > 0) {
                    setForm((current) => ({ ...current, destination_id: String(destinationData[0].destination_id) }));
                }
                setLoading(false);
            })
            .catch((requestError) => {
                setError(requestError.message);
                setLoading(false);
            });
    }, []);

    const addHotel = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);
        try {
            const result = await apiRequest("/api/admin/hotels", {
                method: "POST",
                body: JSON.stringify({ ...form, destination_id: Number(form.destination_id), price_per_night: Number(form.price_per_night) })
            });
            setMessage(result.message);
            setForm((current) => ({ ...current, hotel_name: "", address: "", price_per_night: "", contact_number: "" }));
            setHotels(await apiRequest("/api/admin/hotels"));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    };

    const removeHotel = async (hotel) => {
        if (!window.confirm(`Remove ${hotel.hotel_name}?`)) return;
        setError("");
        setMessage("");
        setDeletingId(hotel.hotel_id);
        try {
            const result = await apiRequest(`/api/admin/hotels/${hotel.hotel_id}`, { method: "DELETE" });
            setMessage(result.message);
            setHotels((current) => current.filter((item) => item.hotel_id !== hotel.hotel_id));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <h2>Loading hotels...</h2>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>Manage Hotels</h1>

                <p style={styles.subtitle}>
                    View and manage hotels available in TravelMate destinations
                </p>
            </div>

            <div style={styles.container}>
                {error && <p role="alert" style={styles.error}>{error}</p>}
                {message && <p role="status" style={styles.message}>{message}</p>}

                <form onSubmit={addHotel} style={styles.addForm}>
                    <h2 style={styles.formTitle}>Add Hotel</h2>
                    <select aria-label="Destination" value={form.destination_id} onChange={(event) => setForm({ ...form, destination_id: event.target.value })} required>
                        <option value="" disabled>Select destination</option>
                        {destinations.map((destination) => (
                            <option key={destination.destination_id} value={destination.destination_id}>
                                {destination.city}, {destination.country}
                            </option>
                        ))}
                    </select>
                    <input aria-label="Hotel name" placeholder="Hotel name" value={form.hotel_name} onChange={(event) => setForm({ ...form, hotel_name: event.target.value })} required maxLength={150} />
                    <input aria-label="Address" placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} maxLength={255} />
                    <input aria-label="Price per night" type="number" min="0" step="0.01" placeholder="Price per night" value={form.price_per_night} onChange={(event) => setForm({ ...form, price_per_night: event.target.value })} required />
                    <input aria-label="Contact number" type="tel" placeholder="Contact number" value={form.contact_number} onChange={(event) => setForm({ ...form, contact_number: event.target.value })} maxLength={20} />
                    <button type="submit" disabled={saving || destinations.length === 0} style={styles.addButton}>{saving ? "Adding..." : "Add hotel"}</button>
                </form>

                {hotels.length === 0 ? (
                    <div style={styles.empty}>
                        <h2>No hotels found</h2>
                    </div>
                ) : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Hotel ID</th>
                                    <th style={styles.th}>Hotel Name</th>
                                    <th style={styles.th}>Destination</th>
                                    <th style={styles.th}>Address</th>
                                    <th style={styles.th}>Price / Night</th>
                                    <th style={styles.th}>Contact</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {hotels.map((hotel) => (
                                    <tr key={hotel.hotel_id}>
                                        <td style={styles.td}>
                                            {hotel.hotel_id}
                                        </td>

                                        <td style={styles.td}>
                                            {hotel.hotel_name}
                                        </td>

                                        <td style={styles.td}>
                                            {hotel.city}, {hotel.country}
                                        </td>

                                        <td style={styles.td}>
                                            {hotel.address || "Not available"}
                                        </td>

                                        <td style={styles.td}>
                                            ₹{hotel.price_per_night}
                                        </td>

                                        <td style={styles.td}>
                                            {hotel.contact_number || "Not available"}
                                        </td>

                                        <td style={styles.td}>
                                            <button type="button" onClick={() => removeHotel(hotel)} disabled={deletingId === hotel.hotel_id} style={styles.removeButton}>
                                                {deletingId === hotel.hotel_id ? "Removing..." : "Remove"}
                                            </button>
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
        gap: "12px",
        marginBottom: "24px",
        padding: "20px",
        backgroundColor: "#ffffff",
        border: "1px solid #d9e2df"
    },

    formTitle: { gridColumn: "1 / -1", margin: 0, color: "#1f2937", fontSize: "20px" },

    addButton: { border: 0, backgroundColor: "#155e54", color: "#ffffff", padding: "10px 16px", fontWeight: 700, cursor: "pointer" },

    removeButton: { border: 0, backgroundColor: "#b42318", color: "#ffffff", padding: "8px 12px", fontWeight: 700, cursor: "pointer" },

    error: { color: "#a12b2b" },

    message: { color: "#166534" },

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
        verticalAlign: "top",
        whiteSpace: "nowrap"
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

export default AdminHotels;